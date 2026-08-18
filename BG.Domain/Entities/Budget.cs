/*
 * Autor: Michael Rodriguez Nova
 * Matrícula: 20251983
 */
namespace BG.Domain.Entities;

public class Budget
{
    public int Id { get; set; }
    public decimal MontoMensual { get; set; }
    public int Mes { get; set; }
    public int Año { get; set; }
    
    public int CategoryId { get; set; }
    public int UserId { get; set; }
}