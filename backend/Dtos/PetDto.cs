using System.ComponentModel.DataAnnotations;

namespace PetCareX.Api.Dtos;

/// <summary>
/// DTO for a customer's pet.
/// </summary>
public class PetDto
{
    /// <summary>Pet primary key.</summary>
    public int PetId { get; set; }

    /// <summary>Owning customer primary key.</summary>
    [Required]
    public int CustomerId { get; set; }

    /// <summary>Pet name.</summary>
    [Required]
    [StringLength(100)]
    public string Name { get; set; } = null!;

    /// <summary>Species (e.g., Dog, Cat).</summary>
    [Required]
    [StringLength(50)]
    public string Species { get; set; } = null!;

    /// <summary>Breed (optional).</summary>
    public string? Breed { get; set; }
}
