using BG.Application.DTOs.Budget;
using BG.Domain.Entities;

namespace BG.Application.Interfaces;

public interface IBudgetService
{
    Task<IEnumerable<BudgetResponseDto>> GetByUserAndDateAsync(int userId, int mes, int anio);
    Task<BudgetResponseDto> CreateAsync(int userId, CreateBudgetDto dto);
    
    Task UpdateAsync(int userId, int id, CreateBudgetDto dto);
    Task DeleteAsync(int userId, int id);
}