using System.Security.Claims;
using BG.Application.DTOs.Goal;
using BG.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BG.API.Controllers;

[Authorize]
[Route("api/[controller]")]
[ApiController]
public class GoalsController : ControllerBase
{
    private readonly IGoalService _service;

    public GoalsController(IGoalService service) => _service = service;

    [HttpGet]
    public async Task<IActionResult> GetMyGoals()
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var goals = await _service.GetByUserAsync(userId);
        return Ok(goals);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateGoalDto dto)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var result = await _service.CreateAsync(userId, dto);
        return Ok(result);
    }

    // --- MÉTODO PARA EDITAR LA META ---
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateGoalDto dto)
    {
        // Aseguramos que el ID de la URL coincida con el que viene en el JSON 
        if (id != dto.Id) return BadRequest(new { Error = "El ID de la ruta y del cuerpo no coinciden." });

        var result = await _service.UpdateAsync(id, dto);
        
        if (result == null) return NotFound(new { Error = "Meta no encontrada" });
        
        return Ok(result);
    }

    // ---  MÉTODO PARA ELIMINAR LA META ---
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var result = await _service.DeleteAsync(id);
        
        
        if (!result) return NotFound(new { Error = "Meta no encontrada" });
        
        return NoContent(); // 204 No Content es el estándar al eliminar exitosamente
    }

    public class ContribucionDto
    {
        public decimal monto { get; set; }
    }

    
    [HttpPost("{id}/contribute")]
    public async Task<IActionResult> AddFunds(int id, [FromBody] ContribucionDto peticion)
    {
        
        var result = await _service.AddFundsAsync(id, peticion.monto);
        
        if (result == null) return NotFound(new { Error = "Meta no encontrada" });
        
        return Ok(result);
    }
}