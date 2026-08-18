using BG.Application.DTOs.Dashboard;
using BG.Application.Interfaces;
using BG.Domain.Entities;
using BG.Domain.Interfaces;

namespace BG.Application.Services;

public class DashboardService : IDashboardService
{
    private readonly IRepository<Income> _incomeRepo;
    private readonly IRepository<Expense> _expenseRepo;

    public DashboardService(IRepository<Income> incomeRepo, IRepository<Expense> expenseRepo)
    {
        _incomeRepo = incomeRepo;
        _expenseRepo = expenseRepo;
    }

    public async Task<DashboardSummaryDto> GetSummaryAsync(int userId, int mes, int año)
    {
        var incomes = await _incomeRepo.GetAllAsync();
        var expenses = await _expenseRepo.GetAllAsync();

        // Filtrar por usuario y por el mes/año indicado
        var totalIngresos = incomes
            .Where(i => i.UserId == userId && i.Fecha.Month == mes && i.Fecha.Year == año)
            .Sum(i => i.Monto);

        var totalGastos = expenses
            .Where(e => e.UserId == userId && e.Fecha.Month == mes && e.Fecha.Year == año)
            .Sum(e => e.Monto);

        return new DashboardSummaryDto
        {
            TotalIngresos = totalIngresos,
            TotalGastos = totalGastos,
            Balance = totalIngresos - totalGastos,
            Mes = mes,
            Año = año
        };
    }
}