using BG.Application.Services;
using BG.Domain.Entities;
using BG.Domain.Interfaces;
using Moq;
using Xunit;

namespace BG.Tests.Services;

public class DashboardServiceTests
{
    [Fact]
    public async Task GetSummaryAsync_ReturnsCorrectTotalsAndBalance()
    {
        // Arrange
        var mockIncomeRepo = new Mock<IRepository<Income>>();
        var mockExpenseRepo = new Mock<IRepository<Expense>>();

        int userId = 1;
        int mes = 8;
        int año = 2026;

        // Datos simulados de ingresos
        var fakeIncomes = new List<Income>
        {
            new Income { Id = 1, UserId = userId, Monto = 20000m, Fecha = new DateTime(2026, 8, 10) },
            new Income { Id = 2, UserId = 2, Monto = 50000m, Fecha = new DateTime(2026, 8, 10) } // Otro usuario
        };

        // Datos simulados de gastos
        var fakeExpenses = new List<Expense>
        {
            new Expense { Id = 1, UserId = userId, Monto = 5000m, Fecha = new DateTime(2026, 8, 12) }
        };

        mockIncomeRepo.Setup(repo => repo.GetAllAsync()).ReturnsAsync(fakeIncomes);
        mockExpenseRepo.Setup(repo => repo.GetAllAsync()).ReturnsAsync(fakeExpenses);

        var service = new DashboardService(mockIncomeRepo.Object, mockExpenseRepo.Object);

        // Act
        var result = await service.GetSummaryAsync(userId, mes, año);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(20000m, result.TotalIngresos);
        Assert.Equal(5000m, result.TotalGastos);
        Assert.Equal(15000m, result.Balance); // 20000 - 5000
        Assert.Equal(mes, result.Mes);
        Assert.Equal(año, result.Año);
    }
}