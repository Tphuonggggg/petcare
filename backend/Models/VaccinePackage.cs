using System;
using System.Collections.Generic;

namespace PetCareX.Api.Models;

/// <summary>
/// Represents a bundled vaccine package offering.
/// </summary>
public partial class VaccinePackage
{
    /// <summary>Package primary key.</summary>
    public int PackageId { get; set; }

    /// <summary>Package name.</summary>
    public string Name { get; set; } = null!;

    /// <summary>Duration in months covered by the package.</summary>
    public int DurationMonths { get; set; }

    /// <summary>Price for the package.</summary>
    public decimal Price { get; set; }

    /// <summary>Discount percent applied to the package.</summary>
    public decimal DiscountPercent { get; set; }

    /// <summary>Optional free-text item description.</summary>
    public string? Item { get; set; }

    /// <summary>Items included in the package.</summary>
    public virtual ICollection<VaccinePackageItem> VaccinePackageItems { get; set; } = new List<VaccinePackageItem>();
}
