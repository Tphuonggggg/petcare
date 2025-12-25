using System;
using System.Collections.Generic;

namespace PetCareX.Api.Models;

/// <summary>
/// Represents a line item on an invoice.
/// </summary>
public partial class InvoiceItem
{
    /// <summary>Invoice item primary key.</summary>
    public int InvoiceItemId { get; set; }

    /// <summary>Related invoice id.</summary>
    public int InvoiceId { get; set; }

    /// <summary>Type of the item (Product/Service).</summary>
    public string ItemType { get; set; } = null!;

    /// <summary>Product id if the item is a product (optional).</summary>
    public int? ProductId { get; set; }

    /// <summary>Service id if the item is a service (optional).</summary>
    public int? ServiceId { get; set; }

    /// <summary>Quantity for product items.</summary>
    public int Quantity { get; set; }

    /// <summary>Unit price.</summary>
    public decimal UnitPrice { get; set; }

    /// <summary>Total price for the line (optional).</summary>
    public decimal? TotalPrice { get; set; }

    /// <summary>Navigation to the invoice.</summary>
    public virtual Invoice Invoice { get; set; } = null!;

    /// <summary>Navigation to the product (optional).</summary>
    public virtual Product? Product { get; set; }

    /// <summary>Navigation to the service (optional).</summary>
    public virtual Service? Service { get; set; }

    /// <summary>Vaccine records associated with this item.</summary>
    public virtual ICollection<VaccineRecord> VaccineRecords { get; set; } = new List<VaccineRecord>();
}
