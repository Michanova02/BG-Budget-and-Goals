namespace BG.Domain.Entities;

public class Account
{
    public int Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    
        public string Tipo { get; set; } = string.Empty; 
    
    public decimal Balance { get; set; }
    public int UserId { get; set; }
}