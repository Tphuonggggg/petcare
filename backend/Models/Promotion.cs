using System;
using System.Collections.Generic;

namespace PetCareX.Api.Models;

/// <summary>
/// Promotion or discount definition.
/// </summary>
public partial class Promotion
{
    /// <summary>Promotion primary key.</summary>
    public int PromotionId { get; set; }

    /// <summary>Promotion name.</summary>
    public string Name { get; set; } = null!;

    /// <summary>Promotion type (e.g., Percent, Fixed).</summary>
    public string Type { get; set; } = null!;

    /// <summary>Value of the promotion.</summary>
    public decimal Value { get; set; }

    /// <summary>Start date of promotion.</summary>
    public DateOnly StartDate { get; set; }

    /// <summary>End date of promotion.</summary>
    public DateOnly EndDate { get; set; }

    /// <summary>What the promotion applies to.</summary>
    public string ApplicableTo { get; set; } = null!;

    /// <summary>Branches where the promotion is active.</summary>
    public virtual ICollection<Branch> Branches { get; set; } = new List<Branch>();
}
