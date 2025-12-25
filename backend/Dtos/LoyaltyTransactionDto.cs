using System;
using System.ComponentModel.DataAnnotations;

namespace PetCareX.Api.Dtos;

/// <summary>
/// DTO for loyalty point transactions.
/// </summary>
public class LoyaltyTransactionDto
{
    /// <summary>Transaction primary key.</summary>
    public int LoyaltyTransId { get; set; }

    /// <summary>Customer affected (optional).</summary>
    public int? CustomerId { get; set; }

    /// <summary>Related invoice (optional).</summary>
    public int? InvoiceId { get; set; }

    /// <summary>Points delta (positive or negative).</summary>
    public int? PointsChange { get; set; }

    /// <summary>Reason or note (optional).</summary>
    [StringLength(500)]
    public string? Reason { get; set; }

    /// <summary>Timestamp of transaction.</summary>
    public DateTime? CreatedAt { get; set; }
}
