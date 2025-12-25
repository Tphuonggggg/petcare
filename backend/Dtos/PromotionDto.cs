using System;
using System.ComponentModel.DataAnnotations;

namespace PetCareX.Api.Dtos;

/// <summary>
/// DTO for promotions/discounts.
/// </summary>
public class PromotionDto
{
    /// <summary>Promotion primary key.</summary>
    public int PromotionId { get; set; }

    /// <summary>Promotion name.</summary>
    [Required]
    public string Name { get; set; } = string.Empty;

    /// <summary>Type of promotion (e.g., Percent, Fixed).</summary>
    [StringLength(50)]
    public string? Type { get; set; }

    /// <summary>Value of the promotion.</summary>
    [Range(0, double.MaxValue, ErrorMessage = "Value must be non-negative.")]
    public decimal? Value { get; set; }

    /// <summary>Start date (optional).</summary>
    public DateOnly? StartDate { get; set; }

    /// <summary>End date (optional).</summary>
    public DateOnly? EndDate { get; set; }

    /// <summary>What the promotion applies to (optional).</summary>
    [StringLength(100)]
    public string? ApplicableTo { get; set; }
}
