using BG.Application.DTOs.Goal;
using BG.Application.Interfaces;
using BG.Domain.Entities;
using BG.Domain.Interfaces;

namespace BG.Application.Services;

public class GoalService : IGoalService
{
    private readonly IRepository<Goal> _repository;

    public GoalService(IRepository<Goal> repository) => _repository = repository;

    public async Task<IEnumerable<Goal>> GetByUserAsync(int userId)
    {
        var goals = await _repository.GetAllAsync();
        return goals.Where(g => g.UserId == userId);
    }

    public async Task<Goal> CreateAsync(int userId, CreateGoalDto dto)
    {
        var goal = new Goal
        {
            Nombre = dto.Nombre,          // Usamos Nombre
            MontoMeta = dto.MontoMeta,    // Usamos MontoMeta
            MontoActual = 0,
            FechaLimite = dto.FechaLimite,
            UserId = userId
        };
        await _repository.AddAsync(goal);
        return goal;
    }

    public async Task<Goal?> AddFundsAsync(int goalId, decimal monto)
    {
        var goal = await _repository.GetByIdAsync(goalId);
        if (goal == null) return null;

        goal.MontoActual += monto;
        await _repository.UpdateAsync(goal);
        return goal;
    }

    // --- NUEVO: MÉTODO PARA EDITAR ---
    public async Task<Goal?> UpdateAsync(int id, UpdateGoalDto dto)
    {
        var goal = await _repository.GetByIdAsync(id);
        if (goal == null) return null;

        // Actualizamos solo los datos permitidos
        goal.Nombre = dto.Nombre;
        goal.MontoMeta = dto.MontoMeta;
        goal.FechaLimite = dto.FechaLimite;
        goal.MontoActual = dto.MontoActual; 

        await _repository.UpdateAsync(goal);
        return goal;
    }

    // --- NUEVO: MÉTODO PARA ELIMINAR ---
    public async Task<bool> DeleteAsync(int id)
    {
        var goal = await _repository.GetByIdAsync(id);
        if (goal == null) return false;

        // Nota: Si tu interfaz IRepository llama a este método de otra forma 
        // (por ejemplo RemoveAsync o Delete(goal)), cámbialo a ese nombre.
        await _repository.DeleteAsync(goal); 
        
        return true;
    }
}