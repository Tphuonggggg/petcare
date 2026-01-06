using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace PetCareX.Api.Models;

/// <summary>
/// Product sold by the clinic.
/// </summary>
/// <summary>
/// Represents a product sold at a branch.
/// </summary>
public partial class Product
{
    /// <summary>Product primary key.</summary>
    public int ProductId { get; set; }

    /// <summary>Product name.</summary>
    public string Name { get; set; } = null!;

    /// <summary>Category of the product.</summary>
    public string Category { get; set; } = null!;

    /// <summary>Unit price.</summary>
    public decimal Price { get; set; }

    /// <summary>Quantity in stock.</summary>
    public int StockQty { get; set; }

    /// <summary>Reorder point level.</summary>
    public int ReorderPoint { get; set; }

    /// <summary>Optional description.</summary>
    public string? Description { get; set; }

    /// <summary>Invoice items referencing this product.</summary>
    public virtual ICollection<InvoiceItem> InvoiceItems { get; set; } = new List<InvoiceItem>();
    
    /// <summary>Branch owning this product (not mapped to database).</summary>
    [NotMapped]
    public int? BranchId { get; set; }

    /// <summary>Navigation to branch (not mapped).</summary>
    [NotMapped]
    public virtual Branch? Branch { get; set; }
}
