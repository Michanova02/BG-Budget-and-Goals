using BG.Application.DTOs.Goal;
using BG.Domain.Entities;

namespace BG.Application.Interfaces;

public interface IGoalService
{
    Task<IEnumerable<Goal>> GetByUserAsync(int userId);
    Task<Goal> CreateAsync(int userId, CreateGoalDto dto);
    Task<Goal?> AddFundsAsync(int goalId, decimal monto);
    
    Task<Goal?> UpdateAsync(int id, UpdateGoalDto dto);
    
    Task<bool> DeleteAsync(int id);
}