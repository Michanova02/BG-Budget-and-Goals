/*
 * Autor: Michael Rodriguez Nova
 * Matrícula: 20251983
 * Proyecto: B&G (Budget & Goals)
 */
using BG.Domain.Enums;

namespace BG.Domain.Entities;

public class Category
{
    public int Id { get; set; }
    public string Nombre { get; set; } = null!;
    public CategoryType Tipo { get; set; } 
    public bool Activo { get; set; } = true; 
    
    public int UserId { get; set; } 
}