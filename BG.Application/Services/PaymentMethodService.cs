using BG.Application.DTOs.PaymentMethod;
using BG.Application.Interfaces;
using BG.Domain.Entities;
using BG.Domain.Interfaces;

namespace BG.Application.Services;

public class PaymentMethodService : IPaymentMethodService
{
    private readonly IRepository<PaymentMethod> _repository;

    public PaymentMethodService(IRepository<PaymentMethod> repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<PaymentMethod>> GetByUserAsync(int userId)
    {
        var methods = await _repository.GetAllAsync();
        // Solo devolvemos los métodos que pertenecen al usuario y están activos
        return methods.Where(m => m.UserId == userId && m.Activo);
    }

    public async Task<PaymentMethod> CreateAsync(int userId, CreatePaymentMethodDto dto)
    {
        var allMethods = await _repository.GetAllAsync();
        
        // Validación de duplicados para el mismo usuario (case-insensitive)
        var existe = allMethods.Any(m => m.UserId == userId && 
                                         m.Activo && 
                                         m.Nombre.Trim().ToLower() == dto.Nombre.Trim().ToLower());
        if (existe)
        {
            throw new InvalidOperationException("Ya tienes un método de pago activo con este nombre.");
        }

        var method = new PaymentMethod 
        { 
            Nombre = dto.Nombre, 
            Icono = dto.Icono,
            UserId = userId,
            Activo = true 
        };

        await _repository.AddAsync(method);
        return method;
    }

    public async Task<PaymentMethod?> UpdateAsync(int id, int userId, CreatePaymentMethodDto dto)
    {
        var method = await _repository.GetByIdAsync(id);
        
        if (method == null || method.UserId != userId)
        {
            return null;
        }

        var allMethods = await _repository.GetAllAsync();
        
        // Validar duplicados si cambia el nombre
        var existe = allMethods.Any(m => m.Id != id && 
                                         m.UserId == userId && 
                                         m.Activo && 
                                         m.Nombre.Trim().ToLower() == dto.Nombre.Trim().ToLower());
        if (existe)
        {
            throw new InvalidOperationException("Ya tienes otro método de pago con este nombre.");
        }

        method.Nombre = dto.Nombre;
        method.Icono = dto.Icono;

        await _repository.UpdateAsync(method);
        return method;
    }

    public async Task<bool> DeleteAsync(int id, int userId)
    {
        var method = await _repository.GetByIdAsync(id);
        
        if (method == null || method.UserId != userId)
        {
            return false;
        }

        // Soft Delete: No lo borramos de la base de datos para no afectar transacciones pasadas
        method.Activo = false;
        await _repository.UpdateAsync(method);
        
        return true;
    }
}