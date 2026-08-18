using BG.Application.DTOs.Auth;
using BG.Application.Interfaces;
using BG.Domain.Entities;         
using BG.Domain.Interfaces;       
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BG.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly IRepository<User> _userRepository;

    // Inyectamos ambos servicios en el constructor
    public AuthController(IAuthService authService, IRepository<User> userRepository)
    {
        _authService = authService;
        _userRepository = userRepository;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto dto)
    {
        try
        {
            var token = await _authService.RegisterAsync(dto);
            return Ok(new { Token = token, message = "Usuario registrado exitosamente" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        try
        {
            var token = await _authService.LoginAsync(dto);
            return Ok(new { Token = token });
        }
        catch (UnauthorizedAccessException ex)
        {
            // Retorna 401 Unauthorized exactamente con el mensaje de "Correo no registrado" o "Contraseña incorrecta"
            return Unauthorized(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            // Retorna 400 BadRequest para cualquier otro tipo de error inesperado
            return BadRequest(new { message = ex.Message });
        }
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> GetCurrentUser()
    {
        // Extraemos el ID del token de sesión
        var userIdStr = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (userIdStr == null) return Unauthorized();

        // Convertimos el ID a entero
        int userId = int.Parse(userIdStr);

        // Buscamos al usuario real en la base de datos
        var user = await _userRepository.GetByIdAsync(userId);

        if (user == null) return NotFound(new { message = "Usuario no encontrado" });

        // Retornamos sus datos verdaderos
        return Ok(new { 
            nombre = user.Nombre, 
            email = user.Email 
        });
    }
}