using BG.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace BG.Infrastructure.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    // Aquí registramos las tablas de la base de datos
    public DbSet<User> Users { get; set; }
    public DbSet<Expense> Expenses { get; set; }
    public DbSet<Category> Categories { get; set; }
    public DbSet<PaymentMethod> PaymentMethods { get; set; }
    public DbSet<Budget> Budgets { get; set; }
    public DbSet<Income> Incomes { get; set; }
    public DbSet<Goal> Goals { get; set; }
    public DbSet<Account> Accounts { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        
        // Asegurar que el correo del usuario sea único
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();

        // Configuración de precisión para los montos decimales
        modelBuilder.Entity<Expense>()
            .Property(e => e.Monto)
            .HasPrecision(18, 2);

        modelBuilder.Entity<Budget>()
            .Property(b => b.MontoMensual)
            .HasPrecision(18, 2);

        modelBuilder.Entity<Income>()
            .Property(i => i.Monto)
            .HasPrecision(18, 2);

        modelBuilder.Entity<Goal>()
            .Property(g => g.MontoMeta) 
            .HasColumnType("decimal(18,2)");

        modelBuilder.Entity<Goal>()
            .Property(g => g.MontoActual)
            .HasPrecision(18, 2);

        modelBuilder.Entity<Account>()
            .Property(a => a.Balance)
            .HasPrecision(18, 2);
    }
}