using System.ComponentModel.DataAnnotations;

namespace BG.Application.DTOs.Goal;

public class CreateGoalDto
{
    [Required]
    public string Nombre { get; set; } = null!;

    [Required]
    [Range(0.01, double.MaxValue)]
    public decimal MontoMeta { get; set; }

    [Required]
    public DateTime FechaLimite { get; set; }
}