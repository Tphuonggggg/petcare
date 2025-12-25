using System.ComponentModel.DataAnnotations;

namespace PetCareX.Api.Dtos;

/// <summary>
/// DTO for vaccine packages (bundles of vaccines).
/// </summary>
public class VaccinePackageDto
{
    /// <summary>Package primary key.</summary>
    public int PackageId { get; set; }

    /// <summary>Package name.</summary>
    [Required]
    public string Name { get; set; } = string.Empty;

    /// <summary>Duration in months (optional).</summary>
    [Range(0, 1200, ErrorMessage = "DurationMonths must be non-negative.")]
    public int? DurationMonths { get; set; }

    /// <summary>Package price (optional).</summary>
    [Range(0, double.MaxValue, ErrorMessage = "Price must be non-negative.")]
    public decimal? Price { get; set; }

    /// <summary>Discount percent (optional).</summary>
    [Range(0, 100, ErrorMessage = "DiscountPercent must be between 0 and 100.")]
    public decimal? DiscountPercent { get; set; }
}
