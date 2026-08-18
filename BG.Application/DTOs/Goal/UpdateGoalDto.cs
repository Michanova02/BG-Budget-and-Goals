using System.ComponentModel.DataAnnotations;

namespace BG.Application.DTOs.Goal;

public class UpdateGoalDto
{
    [Required]
    public int Id { get; set; }

    [Required]
    public string Nombre { get; set; } = null!;

    [Required]
    [Range(0.01, double.MaxValue)]
    public decimal MontoMeta { get; set; }

    [Required]
    public DateTime FechaLimite { get; set; }

    [Required]
    [Range(0, double.MaxValue)]
    public decimal MontoActual { get; set; }
}