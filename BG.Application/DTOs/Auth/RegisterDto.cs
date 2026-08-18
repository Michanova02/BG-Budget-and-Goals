using System.ComponentModel.DataAnnotations;

namespace BG.Application.DTOs.Auth;

public class RegisterDto
{
    [Required]
    public string Nombre { get; set; } = null!;

    [Required, EmailAddress]
    public string Email { get; set; } = null!;

    [Required, MinLength(6)]
    public string Password { get; set; } = null!;
}