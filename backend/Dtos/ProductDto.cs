using System.ComponentModel.DataAnnotations;

namespace PetCareX.Api.Dtos;

/// <summary>
/// DTO for product catalog items.
/// </summary>
public class ProductDto
{
    /// <summary>Product primary key.</summary>
    public int ProductId { get; set; }

    /// <summary>Product name.</summary>
    [Required]
    public string Name { get; set; } = string.Empty;

    /// <summary>Product category (optional).</summary>
    [StringLength(100)]
    public string? Category { get; set; }

    /// <summary>Unit price (optional).</summary>
    [Range(0, double.MaxValue, ErrorMessage = "Price must be non-negative.")]
    public decimal? Price { get; set; }

    /// <summary>Stock quantity (optional).</summary>
    [Range(0, int.MaxValue, ErrorMessage = "StockQty must be non-negative.")]
    public int? StockQty { get; set; }

    /// <summary>Reorder point (optional).</summary>
    [Range(0, int.MaxValue, ErrorMessage = "ReorderPoint must be non-negative.")]
    public int? ReorderPoint { get; set; }

    /// <summary>Product description (optional).</summary>
    [StringLength(1000)]
    public string? Description { get; set; }
}
