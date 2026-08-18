using BG.Application.DTOs.Income;
using BG.Application.Interfaces;
using BG.Domain.Entities;
using BG.Domain.Interfaces;

namespace BG.Application.Services;

public class IncomeService : IIncomeService
{
    private readonly IRepository<Income> _incomeRepository;
    private readonly IRepository<Account> _accountRepository;
    private readonly IRepository<PaymentMethod> _paymentMethodRepository;

    public IncomeService(
        IRepository<Income> incomeRepository, 
        IRepository<Account> accountRepository, 
        IRepository<PaymentMethod> paymentMethodRepository)
    {
        _incomeRepository = incomeRepository;
        _accountRepository = accountRepository;
        _paymentMethodRepository = paymentMethodRepository;
    }

    public async Task<IEnumerable<Income>> GetByUserAsync(int userId)
    {
        var incomes = await _incomeRepository.GetAllAsync();
        return incomes.Where(i => i.UserId == userId);
    }

    public async Task<Income> CreateAsync(int userId, CreateIncomeDto dto)
    {
        var income = new Income
        {
            Descripcion = dto.Descripcion,
            Monto = dto.Monto,
            Fecha = dto.Fecha,
            UserId = userId,
            CategoryId = dto.CategoryId,
            PaymentMethodId = dto.PaymentMethodId,
            AccountId = dto.AccountId 
        };
        
        await _incomeRepository.AddAsync(income);

        if (dto.PaymentMethodId > 0 && dto.AccountId.HasValue)
        {
            var paymentMethod = await _paymentMethodRepository.GetByIdAsync(dto.PaymentMethodId);
            
            // Usamos Contains para que detecte "Transferencia", "Transferencia bancaria", etc.
            bool esTransferencia = paymentMethod != null && 
                                   paymentMethod.Nombre.Contains("Transferencia", StringComparison.OrdinalIgnoreCase);

            if (esTransferencia)
            {
                var account = await _accountRepository.GetByIdAsync(dto.AccountId.Value);
                if (account != null)
                {
                    account.Balance += dto.Monto; 
                    await _accountRepository.UpdateAsync(account);
                }
            }
        }

        return income;
    }
}