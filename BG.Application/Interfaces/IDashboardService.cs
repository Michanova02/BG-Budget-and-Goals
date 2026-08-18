using BG.Application.DTOs.Dashboard;

namespace BG.Application.Interfaces;

public interface IDashboardService
{
    Task<DashboardSummaryDto> GetSummaryAsync(int userId, int mes, int año);
}