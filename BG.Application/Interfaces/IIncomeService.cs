using BG.Application.DTOs.Income;
using BG.Domain.Entities;

namespace BG.Application.Interfaces;

public interface IIncomeService
{
    Task<IEnumerable<Income>> GetByUserAsync(int userId);
    Task<Income> CreateAsync(int userId, CreateIncomeDto dto);
}