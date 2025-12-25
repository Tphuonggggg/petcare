using System.ComponentModel.DataAnnotations;

namespace PetCareX.Api.Dtos;

/// <summary>
/// DTO describing a service offered by the clinic.
/// </summary>
public class ServiceDto
{
    /// <summary>Service primary key.</summary>
    public int ServiceId { get; set; }

    /// <summary>Name of the service.</summary>
    [Required]
    public string Name { get; set; } = string.Empty;

    /// <summary>Service type/category (optional).</summary>
    [StringLength(100)]
    public string? ServiceType { get; set; }

    /// <summary>Base price for the service (optional).</summary>
    [Range(0, double.MaxValue, ErrorMessage = "BasePrice must be non-negative.")]
    public decimal? BasePrice { get; set; }

    /// <summary>Service description (optional).</summary>
    [StringLength(1000)]
    public string? Description { get; set; }
}
