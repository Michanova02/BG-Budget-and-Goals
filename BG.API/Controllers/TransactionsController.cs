using ClosedXML.Excel;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BG.Infrastructure.Data;
using BG.Domain.Entities;
using System.Security.Claims; // <--- Importante para leer el Token JWT

namespace BG.API.Controllers;

[Authorize]
[Route("api/[controller]")]
[ApiController]
public class TransactionsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public TransactionsController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetTransactions()
    {
        var expenses = await (from e in _context.Expenses
                              join c in _context.Categories on e.CategoryId equals c.Id into categorias
                              from c in categorias.DefaultIfEmpty()
                              orderby e.Fecha descending
                              select new 
                              {
                                  e.Id, 
                                  e.Descripcion,
                                  e.Monto,
                                  e.Fecha,
                                  e.CategoryId,
                                  CategoriaNombre = c != null ? c.Nombre : "Sin Categoría",
                                  e.PaymentMethodId,
                                  e.UserId
                              }).ToListAsync();
                              
        return Ok(expenses); 
    }

    [HttpPost("import-excel")]
    public async Task<IActionResult> ImportExcel(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest(new { Error = "Por favor, sube un archivo Excel válido." });

        // 1. EXTRAER EL ID DEL USUARIO DESDE EL TOKEN JWT
        // Buscamos el claim que contiene el ID (generalmente ClaimTypes.NameIdentifier o un id customizado)
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier) ?? User.FindFirst("id");
        
        if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int currentUserId))
        {
            // Si por alguna razón el token no trae el ID, devolvemos error
            return Unauthorized(new { Error = "No se pudo identificar al usuario activo." });
        }

        int filasExitosas = 0;
        int filasConError = 0;
        var reporteErrores = new List<string>();
        
        var gastosAInsertar = new List<Expense>();

        try
        {
            using (var stream = file.OpenReadStream())
            {
                using (var workbook = new XLWorkbook(stream))
                {
                    var worksheet = workbook.Worksheet(1);
                    var rows = worksheet.RowsUsed().Skip(1);

                    foreach (var row in rows)
                    {
                        try
                        {
                            string descripcion = row.Cell(1).GetString();
                            decimal monto = row.Cell(2).GetValue<decimal>();
                            int categoriaId = row.Cell(3).GetValue<int>();
                            DateTime fecha = row.Cell(4).GetDateTime();

                            if (string.IsNullOrWhiteSpace(descripcion) || monto <= 0)
                            {
                                filasConError++;
                                reporteErrores.Add($"Fila {row.RowNumber()}: Descripción vacía o monto inválido.");
                                continue;
                            }
                            
                            gastosAInsertar.Add(new Expense
                            {
                                Descripcion = descripcion,
                                Monto = monto,
                                CategoryId = categoriaId,
                                Fecha = fecha,
                                PaymentMethodId = 1, // Puedes dejar el pago por defecto o pedirlo en otra columna de Excel
                                UserId = currentUserId // <--- AQUÍ INYECTAMOS EL ID DINÁMICO DEL USUARIO LOGUEADO
                            });

                            filasExitosas++;
                        }
                        catch (Exception ex)
                        {
                            filasConError++;
                            reporteErrores.Add($"Fila {row.RowNumber()}: Error de formato ({ex.Message}).");
                        }
                    }
                }
            }

            if (gastosAInsertar.Any())
            {
                _context.Expenses.AddRange(gastosAInsertar);
                await _context.SaveChangesAsync();
            }

            return Ok(new { Mensaje = "Importación procesada y guardada en BD", TotalExitosas = filasExitosas, TotalErrores = filasConError, DetalleErrores = reporteErrores });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { Error = "Error al leer el archivo: " + ex.Message });
        }
    }
    
    [HttpGet("export/{format}")]
    public async Task<IActionResult> ExportReport(string format)
    {
        format = format.ToLower();

        int month = 8;
        if (Request.Query.TryGetValue("mes", out var mesVal) && int.TryParse(mesVal, out int m))
        {
            month = m;
        }

        int year = 2026;
        foreach (var key in Request.Query.Keys)
        {
            if (key.Contains("an") || key.Contains("año") || key.Contains("ano") || key.Contains("year"))
            {
                if (int.TryParse(Request.Query[key], out int parsedYear))
                {
                    year = parsedYear;
                    break;
                }
            }
        }

        try
        {
            var allExpenses = await (from e in _context.Expenses
                                     join c in _context.Categories on e.CategoryId equals c.Id into categorias
                                     from c in categorias.DefaultIfEmpty()
                                     select new {
                                         e.Monto,
                                         e.Fecha,
                                         CategoriaNombre = c != null ? c.Nombre : "Sin Categoría"
                                     }).ToListAsync();

            var gastosMesActual = allExpenses
                .Where(g => g.Fecha != default && g.Fecha.Month == month && g.Fecha.Year == year)
                .ToList();

            decimal totalGastosActual = gastosMesActual.Sum(g => g.Monto);

            int mesAnterior = month == 1 ? 12 : month - 1;
            int añoAnterior = month == 1 ? year - 1 : year;
            
            var gastosMesAnterior = allExpenses
                .Where(g => g.Fecha != default && g.Fecha.Month == mesAnterior && g.Fecha.Year == añoAnterior)
                .ToList();

            decimal totalGastosAnterior = gastosMesAnterior.Sum(g => g.Monto);
            decimal diferenciaMeses = totalGastosActual - totalGastosAnterior;

            var desgloseCategorias = gastosMesActual.GroupBy(g => g.CategoriaNombre)
                .Select(c => new { Categoria = c.Key, Total = c.Sum(g => g.Monto) })
                .OrderByDescending(c => c.Total).ToList();

            if (format == "json")
            {
                var data = new { 
                    Periodo = $"{month}/{year}", 
                    TotalGastos = totalGastosActual, 
                    MesAnterior = totalGastosAnterior,
                    Variacion = diferenciaMeses,
                    Desglose = desgloseCategorias,
                    TopCategorias = desgloseCategorias.Take(3).ToList()
                };
                return File(System.Text.Encoding.UTF8.GetBytes(System.Text.Json.JsonSerializer.Serialize(data, new System.Text.Json.JsonSerializerOptions { WriteIndented = true })), "application/json", $"Reporte_{month}_{year}.json");
            }
            else if (format == "txt")
            {
                var sb = new System.Text.StringBuilder();
                sb.AppendLine("========================================");
                sb.AppendLine($"   REPORTE MENSUAL DE GASTOS - B&G");
                sb.AppendLine("========================================");
                sb.AppendLine($"Período: {month}/{year}");
                sb.AppendLine($"Total Gastado: ${totalGastosActual:N2}");
                sb.AppendLine($"Mes Anterior: ${totalGastosAnterior:N2}");
                sb.AppendLine($"Variación vs Mes Pasado: ${diferenciaMeses:N2}");
                sb.AppendLine("----------------------------------------");
                sb.AppendLine("TOP CATEGORÍAS DEL MES:");
                foreach(var d in desgloseCategorias.Take(3))
                    sb.AppendLine($"- {d.Categoria}: ${d.Total:N2}");
                sb.AppendLine("========================================");
                return File(System.Text.Encoding.UTF8.GetBytes(sb.ToString()), "text/plain", $"Reporte_{month}_{year}.txt");
            }
            else if (format == "excel")
            {
                using (var workbook = new XLWorkbook())
                {
                    var ws = workbook.Worksheets.Add("Reporte Mensual");

                    ws.Cell("A1").Value = "REPORTE FINANCIERO MENSUAL - B&G";
                    ws.Cell("A1").Style.Font.Bold = true;
                    ws.Cell("A1").Style.Font.FontSize = 14;

                    ws.Cell("A3").Value = "Indicador";
                    ws.Cell("B3").Value = "Monto ($)";
                    ws.Range("A3:B3").Style.Font.Bold = true;
                    ws.Range("A3:B3").Style.Fill.BackgroundColor = XLColor.LightGray;

                    ws.Cell("A4").Value = "Total Gastado (Mes Actual)";
                    ws.Cell("B4").Value = totalGastosActual;

                    ws.Cell("A5").Value = "Total Gastado (Mes Anterior)";
                    ws.Cell("B5").Value = totalGastosAnterior;

                    ws.Cell("A6").Value = "Variación (Actual vs Anterior)";
                    ws.Cell("B6").Value = diferenciaMeses;

                    ws.Cell("A9").Value = "Desglose y Top de Categorías del Mes";
                    ws.Cell("A9").Style.Font.Bold = true;
                    ws.Cell("A9").Style.Font.FontSize = 12;

                    ws.Cell("A10").Value = "Categoría";
                    ws.Cell("B10").Value = "Total Gastado ($)";
                    ws.Range("A10:B10").Style.Font.Bold = true;
                    ws.Range("A10:B10").Style.Fill.BackgroundColor = XLColor.LightGray;

                    int r = 11;
                    foreach(var d in desgloseCategorias) 
                    {
                        ws.Cell(r, 1).Value = d.Categoria;
                        ws.Cell(r, 2).Value = d.Total;
                        r++;
                    }

                    ws.Columns().AdjustToContents();

                    using (var ms = new MemoryStream()) 
                    { 
                        workbook.SaveAs(ms); 
                        return File(ms.ToArray(), "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", $"Reporte_Mensual_{month}_{year}.xlsx"); 
                    }
                }
            }
            return BadRequest(new { Error = "Formato no soportado" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { Error = ex.Message, Detalle = ex.InnerException?.Message });
        }
    }
}