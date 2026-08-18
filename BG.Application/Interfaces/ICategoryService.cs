using BG.Application.DTOs.Category;
using BG.Domain.Entities;

namespace BG.Application.Interfaces;

public interface ICategoryService
{
    Task<IEnumerable<Category>> GetByUserAsync(int userId);
    Task<Category> CreateAsync(int userId, CreateCategoryDto dto);
    
    Task<Category?> UpdateAsync(int id, int userId, CreateCategoryDto dto);
    Task<bool> DeleteAsync(int id, int userId);
}