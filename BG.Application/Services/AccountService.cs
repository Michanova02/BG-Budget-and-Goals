using BG.Application.DTOs.Account;
using BG.Application.Interfaces;
using BG.Domain.Entities;
using BG.Domain.Interfaces;

namespace BG.Application.Services;

public class AccountService : IAccountService
{
    private readonly IRepository<Account> _repository;

    public AccountService(IRepository<Account> repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<Account>> GetByUserAsync(int userId)
    {
        var accounts = await _repository.GetAllAsync();
        return accounts.Where(a => a.UserId == userId);
    }

    public async Task<Account> CreateAsync(int userId, CreateAccountDto dto)
    {
        var account = new Account
        {
            Nombre = dto.Nombre,
            Tipo = dto.Tipo,
            Balance = dto.BalanceInicial,
            UserId = userId
        };
        
        await _repository.AddAsync(account);
        return account;
    }
}