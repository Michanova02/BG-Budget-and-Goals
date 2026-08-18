using System.Security.Claims;
using BG.Application.DTOs.Category;
using BG.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BG.API.Controllers;

[Authorize]
[Route("api/[controller]")]
[ApiController]
public class CategoriesController : ControllerBase
{
    private readonly ICategoryService _categoryService;

    public CategoriesController(ICategoryService categoryService)
    {
        _categoryService = categoryService;
    }

    [HttpGet]
    public async Task<IActionResult> GetMyCategories()
    {
        // Extraemos el ID del usuario directamente del Token JWT que nos envía
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userIdClaim == null) return Unauthorized();

        int userId = int.Parse(userIdClaim);
        var categories = await _categoryService.GetByUserAsync(userId);
        return Ok(categories);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateCategoryDto dto)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userIdClaim == null) return Unauthorized();

        int userId = int.Parse(userIdClaim);
        
        try
        {
            var category = await _categoryService.CreateAsync(userId, dto);
            return Ok(category);
        }
        catch (InvalidOperationException ex)
        {
            // Atrapamos el error si el Service detecta un duplicado
            return Conflict(new { Error = ex.Message });
        }
    }

    // Método para EDITAR la categoría
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] CreateCategoryDto dto) 
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userIdClaim == null) return Unauthorized();

        int userId = int.Parse(userIdClaim);

        try
        {
            var category = await _categoryService.UpdateAsync(id, userId, dto);
            if (category == null) return NotFound(new { Error = "Categoría no encontrada." });
            
            return Ok(category);
        }
        catch (InvalidOperationException ex)
        {
            // Atrapamos el error si el nuevo nombre ya existe
            return Conflict(new { Error = ex.Message });
        }
    }

    // Método para ELIMINAR (Soft Delete) la categoría
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userIdClaim == null) return Unauthorized();

        int userId = int.Parse(userIdClaim);

        var result = await _categoryService.DeleteAsync(id, userId);
        
        if (!result) return NotFound(new { Error = "Categoría no encontrada." });

        return Ok(new { Mensaje = "Categoría desactivada exitosamente." });
    }
}