using System;
using System.Collections.Generic;

namespace PetCareX.Api.Models;

/// <summary>
/// Represents a customer in the system.
/// </summary>
public partial class Customer
{
    /// <summary>Customer primary key.</summary>
    public int CustomerId { get; set; }

    /// <summary>Membership tier id.</summary>
    public int MembershipTierId { get; set; }

    /// <summary>Full name.</summary>
    public string FullName { get; set; } = null!;

    /// <summary>Contact phone number.</summary>
    public string Phone { get; set; } = null!;

    /// <summary>Email address (optional).</summary>
    public string? Email { get; set; }

    /// <summary>Government ID (CCCD).</summary>
    public string Cccd { get; set; } = null!;

    /// <summary>Gender.</summary>
    public string? Gender { get; set; }

    /// <summary>Birth date.</summary>
    public DateOnly BirthDate { get; set; }

    /// <summary>Date when customer became a member.</summary>
    public DateOnly MemberSince { get; set; }

    /// <summary>Total spend in the year.</summary>
    public decimal TotalYearlySpend { get; set; }

    /// <summary>Loyalty points balance.</summary>
    public int PointsBalance { get; set; }

    /// <summary>Bookings made by the customer.</summary>
    public virtual ICollection<Booking> Bookings { get; set; } = new List<Booking>();

    /// <summary>Invoices for the customer.</summary>
    public virtual ICollection<Invoice> Invoices { get; set; } = new List<Invoice>();

    /// <summary>Loyalty transactions for the customer.</summary>
    public virtual ICollection<LoyaltyTransaction> LoyaltyTransactions { get; set; } = new List<LoyaltyTransaction>();

    /// <summary>The customer's membership tier.</summary>
    public virtual MembershipTier MembershipTier { get; set; } = null!;

    /// <summary>Pets owned by the customer.</summary>
    public virtual ICollection<Pet> Pets { get; set; } = new List<Pet>();

    /// <summary>Reviews written by the customer.</summary>
    public virtual ICollection<Review> Reviews { get; set; } = new List<Review>();
}
