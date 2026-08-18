using BG.Domain.Enums;

namespace BG.Application.DTOs.Category;

public class CreateCategoryDto
{
    public string Nombre { get; set; } = null!;
    public CategoryType Tipo { get; set; }
}