using System;
using System.ComponentModel.DataAnnotations;

namespace PetCareX.Api.Dtos;

/// <summary>
/// DTO for customer reviews/ratings.
/// </summary>
public class ReviewDto
{
    /// <summary>Review primary key.</summary>
    public int ReviewId { get; set; }

    /// <summary>Customer who wrote the review (optional).</summary>
    public int? CustomerId { get; set; }

    /// <summary>Branch reviewed (optional).</summary>
    public int? BranchId { get; set; }

    /// <summary>Employee reviewed (optional).</summary>
    public int? EmployeeId { get; set; }

    /// <summary>Rating: service quality.</summary>
    [Range(1,5, ErrorMessage = "Rating must be between 1 and 5.")]
    public int? RatingServiceQuality { get; set; }

    /// <summary>Rating: staff attitude.</summary>
    [Range(1,5, ErrorMessage = "Rating must be between 1 and 5.")]
    public int? RatingStaffAttitude { get; set; }

    /// <summary>Overall rating.</summary>
    [Range(1,5, ErrorMessage = "Rating must be between 1 and 5.")]
    public int? RatingOverall { get; set; }

    /// <summary>Optional textual comment.</summary>
    [StringLength(1000)]
    public string? Comment { get; set; }

    /// <summary>When the review was created.</summary>
    public DateTime? CreatedAt { get; set; }
}
