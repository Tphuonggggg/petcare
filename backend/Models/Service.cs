using System;
using System.Collections.Generic;

namespace PetCareX.Api.Models;

/// <summary>
/// Represents a service offered by the pet care center.
/// </summary>
public partial class Service
{
    /// <summary>Service primary key.</summary>
    public int ServiceId { get; set; }

    /// <summary>Name of the service.</summary>
    public string Name { get; set; } = null!;

    /// <summary>Category or type of the service.</summary>
    public string ServiceType { get; set; } = null!;

    /// <summary>Base price for the service.</summary>
    public decimal BasePrice { get; set; }

    /// <summary>Optional description.</summary>
    public string? Description { get; set; }

    /// <summary>Branch-specific service configurations.</summary>
    public virtual ICollection<BranchService> BranchServices { get; set; } = new List<BranchService>();

    /// <summary>Invoice items referencing this service.</summary>
    public virtual ICollection<InvoiceItem> InvoiceItems { get; set; } = new List<InvoiceItem>();
}
