using System.ComponentModel.DataAnnotations;

namespace BG.Application.DTOs.Account;

public class CreateAccountDto
{
    [Required]
    public string Nombre { get; set; } = null!;

    [Required]
    public string Tipo { get; set; } = null!;

    [Required]
    public decimal BalanceInicial { get; set; }
}