using System;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace PetCareX.Api.Dtos;

/// <summary>
/// DTO for an invoice line item.
/// </summary>
public class InvoiceItemDto
{
    /// <summary>Line item primary key.</summary>
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)]
    public int? InvoiceItemId { get; set; }

    /// <summary>Related invoice primary key.</summary>
    [Required]
    public int InvoiceId { get; set; }

    /// <summary>Item type (Product/Service).</summary>
    [StringLength(50)]
    public string? ItemType { get; set; }

    /// <summary>Product id if item is a product.</summary>
    public int? ProductId { get; set; }

    /// <summary>Service id if item is a service.</summary>
    public int? ServiceId { get; set; }

    /// <summary>Quantity (for products).</summary>
    [Range(0, int.MaxValue, ErrorMessage = "Quantity must be non-negative.")]
    public int? Quantity { get; set; }

    /// <summary>Unit price.</summary>
    [Range(0, double.MaxValue, ErrorMessage = "UnitPrice must be non-negative.")]
    public decimal? UnitPrice { get; set; }

    /// <summary>Total price for the line.</summary>
    [Range(0, double.MaxValue, ErrorMessage = "TotalPrice must be non-negative.")]
    public decimal? TotalPrice { get; set; }
}
