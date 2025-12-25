using System;
using System.Collections.Generic;

namespace PetCareX.Api.Models;

/// <summary>
/// Represents a service offered at a specific branch with optional pricing.
/// </summary>
public partial class BranchService
{
    /// <summary>Branch id.</summary>
    public int BranchId { get; set; }

    /// <summary>Service id.</summary>
    public int ServiceId { get; set; }

    /// <summary>Optional override price at the branch.</summary>
    public decimal? Price { get; set; }

    /// <summary>Indicates whether the service is active at the branch.</summary>
    public bool? Active { get; set; }

    /// <summary>Navigation to branch.</summary>
    public virtual Branch Branch { get; set; } = null!;

    /// <summary>Navigation to service.</summary>
    public virtual Service Service { get; set; } = null!;
}
