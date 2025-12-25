using System.ComponentModel.DataAnnotations;

namespace PetCareX.Api.Dtos;

/// <summary>
/// DTO describing an item inside a vaccine package.
/// </summary>
public class VaccinePackageItemDto
{
    /// <summary>Vaccine package id.</summary>
    [Required]
    public int PackageId { get; set; }

    /// <summary>Vaccine id.</summary>
    [Required]
    public int VaccineId { get; set; }

    /// <summary>Relative month when the vaccine is due (optional).</summary>
    public int? RelativeMonth { get; set; }

    /// <summary>Dose description (optional).</summary>
    public string? Dose { get; set; }
}
