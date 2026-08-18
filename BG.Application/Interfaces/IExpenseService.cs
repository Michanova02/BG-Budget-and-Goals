using BG.Application.DTOs.Expense;
using BG.Domain.Entities;

namespace BG.Application.Interfaces;

public interface IExpenseService
{
    Task<IEnumerable<Expense>> GetByUserAsync(int userId);
    Task<Expense> CreateAsync(int userId, CreateExpenseDto dto);
}