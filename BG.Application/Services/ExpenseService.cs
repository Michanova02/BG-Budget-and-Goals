using BG.Application.DTOs.Expense;
using BG.Application.Interfaces;
using BG.Domain.Entities;
using BG.Domain.Interfaces;

namespace BG.Application.Services;

public class ExpenseService : IExpenseService
{
    private readonly IRepository<Expense> _expenseRepository;
    private readonly IRepository<Account> _accountRepository;

    public ExpenseService(
        IRepository<Expense> expenseRepository, 
        IRepository<Account> accountRepository)
    {
        _expenseRepository = expenseRepository;
        _accountRepository = accountRepository;
    }

    public async Task<IEnumerable<Expense>> GetByUserAsync(int userId)
    {
        var expenses = await _expenseRepository.GetAllAsync();
        return expenses.Where(e => e.UserId == userId);
    }

    public async Task<Expense> CreateAsync(int userId, CreateExpenseDto dto)
    {
        // Validar fondos si se especificó una cuenta
        if (dto.AccountId.HasValue)
        {
            var account = await _accountRepository.GetByIdAsync(dto.AccountId.Value);
            if (account == null)
            {
                throw new InvalidOperationException("La cuenta seleccionada no existe.");
            }

            if (account.Balance < dto.Monto)
            {
                throw new InvalidOperationException("Fondos insuficientes en la cuenta seleccionada.");
            }

            account.Balance -= dto.Monto;
            await _accountRepository.UpdateAsync(account);
        }

        var expense = new Expense
        {
            Descripcion = dto.Descripcion,
            Monto = dto.Monto,
            Fecha = dto.Fecha,
            CategoryId = dto.CategoryId,
            PaymentMethodId = dto.PaymentMethodId,
            UserId = userId,
            AccountId = dto.AccountId
        };

        await _expenseRepository.AddAsync(expense);
        return expense;
    }
}