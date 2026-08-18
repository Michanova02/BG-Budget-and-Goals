using BG.Application.DTOs.Category;
using BG.Application.Interfaces;
using BG.Domain.Entities;
using BG.Domain.Interfaces;

namespace BG.Application.Services;

public class CategoryService : ICategoryService
{
    private readonly IRepository<Category> _categoryRepository;

    public CategoryService(IRepository<Category> categoryRepository)
    {
        _categoryRepository = categoryRepository;
    }

    public async Task<IEnumerable<Category>> GetByUserAsync(int userId)
    {
        var categories = await _categoryRepository.GetAllAsync();
        // Solo devolvemos las categorías activas del usuario
        return categories.Where(c => c.UserId == userId && c.Activo);
    }

    public async Task<Category> CreateAsync(int userId, CreateCategoryDto dto)
    {
        var allCategories = await _categoryRepository.GetAllAsync();

        // Validación de duplicados (case-insensitive) para el mismo usuario y tipo
        var existe = allCategories.Any(c => c.UserId == userId && 
                                         c.Activo && 
                                         c.Nombre.Trim().ToLower() == dto.Nombre.Trim().ToLower() &&
                                         c.Tipo == dto.Tipo);
        if (existe)
        {
            throw new InvalidOperationException("Ya tienes una categoría activa con este nombre y tipo.");
        }

        var category = new Category
        {
            Nombre = dto.Nombre,
            Tipo = dto.Tipo, 
            Activo = true,
            UserId = userId
        };

        await _categoryRepository.AddAsync(category);
        return category;
    }

    public async Task<Category?> UpdateAsync(int id, int userId, CreateCategoryDto dto)
    {
        var category = await _categoryRepository.GetByIdAsync(id);
        
        if (category == null || category.UserId != userId)
        {
            return null;
        }

        var allCategories = await _categoryRepository.GetAllAsync();

        // Validar duplicados al editar (excluyendo el ID actual)
        var existe = allCategories.Any(c => c.Id != id && 
                                         c.UserId == userId && 
                                         c.Activo && 
                                         c.Nombre.Trim().ToLower() == dto.Nombre.Trim().ToLower() &&
                                         c.Tipo == dto.Tipo);
        if (existe)
        {
            throw new InvalidOperationException("Ya tienes otra categoría activa con este nombre y tipo.");
        }

        category.Nombre = dto.Nombre;
        category.Tipo = dto.Tipo;

        await _categoryRepository.UpdateAsync(category);
        return category;
    }

    public async Task<bool> DeleteAsync(int id, int userId)
    {
        var category = await _categoryRepository.GetByIdAsync(id);
        
        if (category == null || category.UserId != userId)
        {
            return false;
        }

        // Soft Delete: Desactivamos la categoría para no romper el historial de transacciones pasadas
        category.Activo = false;
        await _categoryRepository.UpdateAsync(category);
        
        return true;
    }
}