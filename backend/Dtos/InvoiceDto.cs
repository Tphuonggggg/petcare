using System;
using System.ComponentModel.DataAnnotations;

namespace PetCareX.Api.Dtos;

/// <summary>
/// DTO for invoice header information.
/// </summary>
public class InvoiceDto
{
    /// <summary>Invoice primary key.</summary>
    public int InvoiceId { get; set; }

    /// <summary>Branch where invoice was created (optional).</summary>
    public int? BranchId { get; set; }

    /// <summary>Customer billed (optional).</summary>
    public int? CustomerId { get; set; }

    /// <summary>Employee who processed the invoice (optional).</summary>
    public int? EmployeeId { get; set; }

    /// <summary>Pet associated with the invoice (optional).</summary>
    public int? PetId { get; set; }

    /// <summary>Date of the invoice.</summary>
    [Required]
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
}
