namespace BG.Application.DTOs.PaymentMethod;

public class CreatePaymentMethodDto
{
    public string Nombre { get; set; } = null!;
    public string? Icono { get; set; }
}