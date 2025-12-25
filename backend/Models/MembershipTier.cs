using System;
using System.Collections.Generic;

namespace PetCareX.Api.Models;

/// <summary>
/// Represents a membership/loyalty tier.
/// </summary>
public partial class MembershipTier
{
    /// <summary>Tier primary key.</summary>
    public int MembershipTierId { get; set; }

    /// <summary>Tier name.</summary>
    public string Name { get; set; } = null!;

    /// <summary>Minimum spend to reach the tier (optional).</summary>
    public decimal? MinSpend { get; set; }

    /// <summary>Spend required to maintain the tier (optional).</summary>
    public decimal? MaintainSpend { get; set; }

    /// <summary>Benefits description (optional).</summary>
    public string? Benefits { get; set; }

    /// <summary>Customers in this tier.</summary>
    public virtual ICollection<Customer> Customers { get; set; } = new List<Customer>();
}
