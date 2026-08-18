using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using BG.Application.DTOs.Auth;
using BG.Application.Interfaces;
using BG.Domain.Entities;
using BG.Domain.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace BG.Application.Services;

public class AuthService : IAuthService
{
    private readonly IRepository<User> _userRepository;
    private readonly IConfiguration _config;

    public AuthService(IRepository<User> userRepository, IConfiguration config)
    {
        _userRepository = userRepository;
        _config = config;
    }

    public async Task<string> RegisterAsync(RegisterDto dto)
    {
        // 1. Crear el usuario y hashear la contraseña
        var user = new User 
        { 
            Nombre = dto.Nombre, 
            Email = dto.Email, 
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password) 
        };
        
        // 2. Guardar en base de datos
        await _userRepository.AddAsync(user);
        
        // 3. Retornar el token JWT
        return GenerarToken(user);
    }

    public async Task<string> LoginAsync(LoginDto dto)
    {
        // 1. Buscar usuario por email
        var users = await _userRepository.GetAllAsync();
        var user = users.FirstOrDefault(u => u.Email == dto.Email);
        
        // 2. Verificar si el correo existe
        if (user == null)
        {
            throw new UnauthorizedAccessException("El correo electrónico no está registrado.");
        }
            
        // 3. Verificar si la contraseña es correcta
        if (!BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
        {
            throw new UnauthorizedAccessException("La contraseña es incorrecta.");
        }
            
        // 4. Retornar el token JWT
        return GenerarToken(user);
    }

    private string GenerarToken(User user)
    {
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.Nombre),
            new Claim(ClaimTypes.Email, user.Email)
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims: claims,
            expires: DateTime.Now.AddDays(1),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}