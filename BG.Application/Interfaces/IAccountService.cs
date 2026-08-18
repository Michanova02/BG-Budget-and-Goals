using BG.Application.DTOs.Account;
using BG.Domain.Entities;

namespace BG.Application.Interfaces;

public interface IAccountService
{
    Task<IEnumerable<Account>> GetByUserAsync(int userId);
    Task<Account> CreateAsync(int userId, CreateAccountDto dto);
}