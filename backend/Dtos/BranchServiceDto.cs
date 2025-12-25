using System;
using System.ComponentModel.DataAnnotations;

namespace PetCareX.Api.Dtos;

/// <summary>
/// DTO representing a service offered at a branch.
/// </summary>
public class BranchServiceDto
{
    /// <summary>Branch primary key.</summary>
    [Required]
    public int BranchId { get; set; }

    /// <summary>Service primary key.</summary>
    [Required]
    public int ServiceId { get; set; }

    /// <summary>Price for the service at this branch.</summary>
    [Range(0, double.MaxValue, ErrorMessage = "Price must be non-negative.")]
    public decimal? Price { get; set; }

    /// <summary>Whether the service is active at this branch.</summary>
    public bool? Active { get; set; }
}
