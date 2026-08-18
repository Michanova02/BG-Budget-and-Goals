using System.ComponentModel.DataAnnotations;

namespace BG.Application.DTOs.Income;

public class CreateIncomeDto
{
    [Required]
    public string Descripcion { get; set; } = null!;

    [Required]
    [Range(0.01, double.MaxValue, ErrorMessage = "El monto debe ser mayor a 0.")]
    public decimal Monto { get; set; }

    [Required]
    public DateTime Fecha { get; set; }

    [Required]
    public int CategoryId { get; set; }

    [Required]
    public int PaymentMethodId { get; set; }

    public int? AccountId { get; set; }
}