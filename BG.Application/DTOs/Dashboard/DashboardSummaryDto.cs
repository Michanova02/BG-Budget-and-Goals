namespace BG.Application.DTOs.Dashboard;

public class DashboardSummaryDto
{
    public decimal TotalIngresos { get; set; }
    public decimal TotalGastos { get; set; }
    public decimal Balance { get; set; }
    public int Mes { get; set; }
    public int Año { get; set; }
}