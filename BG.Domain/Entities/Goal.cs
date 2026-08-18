namespace BG.Domain.Entities;

public class Goal
{
    public int Id { get; set; }
    public string Nombre { get; set; } = string.Empty; 
    public decimal MontoMeta { get; set; }             
    public decimal MontoActual { get; set; } = 0;
    public DateTime FechaLimite { get; set; }
    public int UserId { get; set; }
}