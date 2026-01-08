using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace PetCareX.Api.Dtos;

/// <summary>
/// DTO for invoice header information.
/// </summary>
public class InvoiceDto
{
    /// <summary>Invoice primary key.</summary>
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)]
    public int? InvoiceId { get; set; }

    /// <summary>Branch where invoice was created (optional).</summary>
    public int? BranchId { get; set; }

    /// <summary>Branch name (optional, for display).</summary>
    [StringLength(100)]
    public string? BranchName { get; set; }

    /// <summary>Customer billed (optional).</summary>
    public int? CustomerId { get; set; }

    /// <summary>Customer name (optional, for display).</summary>
    [StringLength(200)]
    public string? CustomerName { get; set; }

    /// <summary>Customer phone (optional, for display).</summary>
    [StringLength(20)]
    public string? CustomerPhone { get; set; }

    /// <summary>Customer email (optional, for display).</summary>
    [StringLength(100)]
    public string? CustomerEmail { get; set; }

    /// <summary>Employee who processed the invoice (optional).</summary>
    public int? EmployeeId { get; set; }

    /// <summary>Pet associated with the invoice (optional).</summary>
    public int? PetId { get; set; }

    /// <summary>Date of the invoice.</summary>
    public DateTime? InvoiceDate { get; set; }

    /// <summary>Total amount before discounts.</summary>
    [Range(0, double.MaxValue, ErrorMessage = "TotalAmount must be non-negative.")]
    public decimal? TotalAmount { get; set; }

    /// <summary>Discount amount applied.</summary>
    [Range(0, double.MaxValue, ErrorMessage = "DiscountAmount must be non-negative.")]
    public decimal? DiscountAmount { get; set; }

    /// <summary>Final amount to be paid.</summary>
    [Range(0, double.MaxValue, ErrorMessage = "FinalAmount must be non-negative.")]
    public decimal? FinalAmount { get; set; }

    /// <summary>Payment method used.</summary>
    [StringLength(100)]
    public string? PaymentMethod { get; set; }

    /// <summary>Invoice status (Pending, Paid, Cancelled).</summary>
    [StringLength(20)]
    public string? Status { get; set; } = "Pending";

    /// <summary>Notes about the invoice.</summary>
    [StringLength(500)]
    public string? Notes { get; set; }

    /// <summary>Invoice items (line items).</summary>
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)]
    public List<InvoiceItemDto>? Items { get; set; }
}
