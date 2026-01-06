using System;
using System.Collections.Generic;

namespace PetCareX.Api.Models;

/// <summary>
/// Invoice header information.
/// </summary>
public partial class Invoice
{
    /// <summary>Invoice primary key.</summary>
    public int InvoiceId { get; set; }

    /// <summary>Branch id where invoice was issued.</summary>
    public int BranchId { get; set; }

    /// <summary>Customer billed.</summary>
    public int CustomerId { get; set; }

    /// <summary>Employee who processed the invoice.</summary>
    public int EmployeeId { get; set; }

    /// <summary>Associated pet id (optional).</summary>
    public int? PetId { get; set; }

    /// <summary>Date of the invoice.</summary>
    public DateTime InvoiceDate { get; set; }

    /// <summary>Total amount before discounts.</summary>
    public decimal TotalAmount { get; set; }

    /// <summary>Discount amount applied.</summary>
    public decimal DiscountAmount { get; set; }

    /// <summary>Final amount to be paid (optional).</summary>
    public decimal? FinalAmount { get; set; }

    /// <summary>Payment method used.</summary>
    public string PaymentMethod { get; set; } = null!;

    /// <summary>Invoice status (Pending, Paid, Cancelled).</summary>
    public string Status { get; set; } = "Pending";

    /// <summary>Navigation to the branch.</summary>
    public virtual Branch Branch { get; set; } = null!;

    /// <summary>Navigation to the customer.</summary>
    public virtual Customer Customer { get; set; } = null!;

    /// <summary>Navigation to the employee.</summary>
    public virtual Employee Employee { get; set; } = null!;

    /// <summary>Line items on the invoice.</summary>
    public virtual ICollection<InvoiceItem> InvoiceItems { get; set; } = new List<InvoiceItem>();

    /// <summary>Loyalty transactions related to the invoice.</summary>
    public virtual ICollection<LoyaltyTransaction> LoyaltyTransactions { get; set; } = new List<LoyaltyTransaction>();

    /// <summary>Associated pet (optional).</summary>
    public virtual Pet? Pet { get; set; }
}
