using System;
using System.Collections.Generic;

namespace PetCareX.Api.Models;

/// <summary>
/// Represents a batch of vaccine inventory stored at a branch.
/// </summary>
public partial class VaccineBatch
{
    /// <summary>Batch primary key.</summary>
    public int BatchId { get; set; }

    /// <summary>Related vaccine id.</summary>
    public int VaccineId { get; set; }

    /// <summary>Branch id where the batch is located.</summary>
    public int BranchId { get; set; }

    /// <summary>Manufacture date of the batch.</summary>
    public DateOnly ManufactureDate { get; set; }

    /// <summary>Expiry date of the batch.</summary>
    public DateOnly ExpiryDate { get; set; }

    /// <summary>Quantity available in the batch.</summary>
    public int Quantity { get; set; }

    /// <summary>Navigation property to the branch.</summary>
    public virtual Branch Branch { get; set; } = null!;

    /// <summary>Navigation property to the vaccine.</summary>
    public virtual Vaccine Vaccine { get; set; } = null!;
}
