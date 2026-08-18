public class PaymentMethod
{
    public int Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string? Icono { get; set; }
    public bool Activo { get; set; } = true; // <--- AGREGA ESTA LÍNEA
    public int UserId { get; set; }
}