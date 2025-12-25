using System;
using System.Collections.Generic;

namespace PetCareX.Api.Models;

/// <summary>
/// Represents an item inside a vaccine package schedule.
/// </summary>
public partial class VaccinePackageItem
{
    /// <summary>Package identifier.</summary>
    public int PackageId { get; set; }

    /// <summary>Vaccine identifier included in the package.</summary>
    public int VaccineId { get; set; }

    /// <summary>Relative month offset when the vaccine should be given.</summary>
    public int RelativeMonth { get; set; }

    /// <summary>Recommended dose for this package item.</summary>
    public decimal Dose { get; set; }

    /// <summary>Navigation to the containing package.</summary>
    public virtual VaccinePackage Package { get; set; } = null!;

    /// <summary>Navigation to the vaccine.</summary>
    public virtual Vaccine Vaccine { get; set; } = null!;
}
