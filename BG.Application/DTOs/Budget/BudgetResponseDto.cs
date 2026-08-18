namespace BG.Application.DTOs.Budget;

public class BudgetResponseDto
{
    public int Id { get; set; }
    public int CategoriaId { get; set; }
    public string CategoriaNombre { get; set; } = string.Empty;
    public decimal Monto { get; set; } 
    public decimal GastoActual { get; set; } 
    public int Mes { get; set; }
    public int Anio { get; set; }
}