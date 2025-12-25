using System;
using System.Collections.Generic;

namespace PetCareX.Api.Models;

/// <summary>
/// Represents a change in loyalty points for a customer.
/// </summary>
public partial class LoyaltyTransaction
{
    /// <summary>Transaction primary key.</summary>
    public int LoyaltyTransId { get; set; }

    /// <summary>Customer affected by the transaction.</summary>
    public int CustomerId { get; set; }

    /// <summary>Related invoice id (optional).</summary>
    public int? InvoiceId { get; set; }

    /// <summary>Points change (positive or negative).</summary>
    public int PointsChange { get; set; }

    /// <summary>Reason or note (optional).</summary>
    public string? Reason { get; set; }

    /// <summary>Timestamp of the transaction.</summary>
    public DateTime CreatedAt { get; set; }

    /// <summary>Navigation to the customer.</summary>
    public virtual Customer Customer { get; set; } = null!;

    /// <summary>Navigation to the invoice (optional).</summary>
    public virtual Invoice? Invoice { get; set; }
}
