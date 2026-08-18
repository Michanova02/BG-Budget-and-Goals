using System.ComponentModel.DataAnnotations;

namespace BG.Application.DTOs.Budget;

public class CreateBudgetDto
{
    [Required]
    public int CategoriaId { get; set; }

    [Required]
    public decimal Monto { get; set; }

    [Required]
    public int Mes { get; set; }

    [Required]
    public int Anio { get; set; }
}