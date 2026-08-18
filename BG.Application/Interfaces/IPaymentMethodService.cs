using BG.Application.DTOs.PaymentMethod;
using BG.Domain.Entities;

namespace BG.Application.Interfaces;

public interface IPaymentMethodService
{
    Task<IEnumerable<PaymentMethod>> GetByUserAsync(int userId);
    Task<PaymentMethod> CreateAsync(int userId, CreatePaymentMethodDto dto);
    
    Task<PaymentMethod?> UpdateAsync(int id, int userId, CreatePaymentMethodDto dto);
    Task<bool> DeleteAsync(int id, int userId);
}