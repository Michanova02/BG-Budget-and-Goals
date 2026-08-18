using BG.Application.DTOs.Budget;
using BG.Application.Interfaces;
using BG.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using BG.Infrastructure.Data;

namespace BG.Application.Services;

public class BudgetService : IBudgetService
{
    private readonly ApplicationDbContext _context;

    public BudgetService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<BudgetResponseDto>> GetByUserAndDateAsync(int userId, int mes, int anio)
    {
        var presupuestos = await _context.Budgets
            .Where(b => b.UserId == userId && b.Mes == mes && b.Año == anio)
            .ToListAsync();

        var response = new List<BudgetResponseDto>();

        foreach (var budget in presupuestos)
        {
            var categoria = await _context.Categories.FindAsync(budget.CategoryId);
            var categoriaNombre = categoria != null ? categoria.Nombre : "Sin Categoría";

            var gastoActual = await _context.Expenses 
                .Where(e => e.UserId == userId 
                         && e.CategoryId == budget.CategoryId 
                         && e.Fecha.Month == mes 
                         && e.Fecha.Year == anio)
                .SumAsync(e => e.Monto);

            response.Add(new BudgetResponseDto
            {
                Id = budget.Id,
                CategoriaId = budget.CategoryId, 
                CategoriaNombre = categoriaNombre,
                Monto = budget.MontoMensual, 
                GastoActual = gastoActual,
                Mes = budget.Mes,
                Anio = budget.Año 
            });
        }

        return response;
    }

    public async Task<BudgetResponseDto> CreateAsync(int userId, CreateBudgetDto dto)
    {
        var existe = await _context.Budgets
            .AnyAsync(b => b.UserId == userId 
                        && b.CategoryId == dto.CategoriaId 
                        && b.Mes == dto.Mes 
                        && b.Año == dto.Anio);

        if (existe)
        {
            throw new InvalidOperationException("Ya existe un presupuesto definido para esta categoría en este mes.");
        }

        var budget = new Budget 
        {
            UserId = userId,
            CategoryId = dto.CategoriaId,
            MontoMensual = dto.Monto,
            Mes = dto.Mes,
            Año = dto.Anio
        };

        _context.Budgets.Add(budget);
        await _context.SaveChangesAsync();

        var categoria = await _context.Categories.FindAsync(budget.CategoryId);
        var categoriaNombre = categoria != null ? categoria.Nombre : "Sin Categoría";

        return new BudgetResponseDto
        {
            Id = budget.Id,
            CategoriaId = budget.CategoryId,
            CategoriaNombre = categoriaNombre, 
            Monto = budget.MontoMensual,
            Mes = budget.Mes,
            Anio = budget.Año,
            GastoActual = 0 
        };
    }

    // NUEVO: Método para Actualizar Presupuesto
    public async Task UpdateAsync(int userId, int id, CreateBudgetDto dto)
    {
        var budget = await _context.Budgets.FirstOrDefaultAsync(b => b.Id == id && b.UserId == userId);
        if (budget == null)
        {
            throw new KeyNotFoundException("El presupuesto no existe o no pertenece al usuario.");
        }

        // Validar si al cambiar la categoría o fecha ya choca con otro presupuesto existente
        var existeConflicto = await _context.Budgets
            .AnyAsync(b => b.Id != id 
                        && b.UserId == userId 
                        && b.CategoryId == dto.CategoriaId 
                        && b.Mes == dto.Mes 
                        && b.Año == dto.Anio);

        if (existeConflicto)
        {
            throw new InvalidOperationException("Ya existe otro presupuesto registrado para esta categoría en el mes seleccionado.");
        }

        budget.CategoryId = dto.CategoriaId;
        budget.MontoMensual = dto.Monto;
        budget.Mes = dto.Mes;
        budget.Año = dto.Anio;

        _context.Budgets.Update(budget);
        await _context.SaveChangesAsync();
    }

    // NUEVO: Método para Eliminar Presupuesto
    public async Task DeleteAsync(int userId, int id)
    {
        var budget = await _context.Budgets.FirstOrDefaultAsync(b => b.Id == id && b.UserId == userId);
        if (budget != null)
        {
            _context.Budgets.Remove(budget);
            await _context.SaveChangesAsync();
        }
    }
}