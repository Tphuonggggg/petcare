using System;
using System.Collections.Generic;

namespace PetCareX.Api.Models;

/// <summary>
/// Customer review and ratings for branches or employees.
/// </summary>
public partial class Review
{
    /// <summary>Review primary key.</summary>
    public int ReviewId { get; set; }

    /// <summary>Customer who wrote the review.</summary>
    public int CustomerId { get; set; }

    /// <summary>Branch being reviewed.</summary>
    public int BranchId { get; set; }

    /// <summary>Employee being reviewed (optional).</summary>
    public int? EmployeeId { get; set; }

    /// <summary>Service quality rating (optional).</summary>
    public byte? RatingServiceQuality { get; set; }

    /// <summary>Staff attitude rating (optional).</summary>
    public byte? RatingStaffAttitude { get; set; }

    /// <summary>Overall rating (optional).</summary>
    public byte? RatingOverall { get; set; }

    /// <summary>Textual comment (optional).</summary>
    public string? Comment { get; set; }

    /// <summary>Creation timestamp.</summary>
    public DateTime CreatedAt { get; set; }

    /// <summary>Navigation to the branch.</summary>
    public virtual Branch Branch { get; set; } = null!;

    /// <summary>Navigation to the customer.</summary>
    public virtual Customer Customer { get; set; } = null!;

    /// <summary>Navigation to the employee (optional).</summary>
    public virtual Employee? Employee { get; set; }
}
