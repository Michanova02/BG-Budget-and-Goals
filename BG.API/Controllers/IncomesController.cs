using System.Security.Claims;
using BG.Application.DTOs.Income;
using BG.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BG.API.Controllers;

[Authorize]
[Route("api/[controller]")]
[ApiController]
public class IncomesController : ControllerBase
{
    private readonly IIncomeService _service;

    public IncomesController(IIncomeService service) => _service = service;


    [HttpGet]
    public async Task<IActionResult> GetMyIncomes()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userIdClaim == null) return Unauthorized();

        int userId = int.Parse(userIdClaim);
        var incomes = await _service.GetByUserAsync(userId); 
        return Ok(incomes);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateIncomeDto dto)
    {
        var userIdIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userIdIdStr == null) return Unauthorized();

        var userId = int.Parse(userIdIdStr);
        var result = await _service.CreateAsync(userId, dto);
        return Ok(result);
    }
}