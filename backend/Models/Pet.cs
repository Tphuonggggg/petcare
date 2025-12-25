using System;
using System.Collections.Generic;

namespace PetCareX.Api.Models;

/// <summary>
/// Represents a pet owned by a customer.
/// </summary>
public partial class Pet
{
    /// <summary>Pet primary key.</summary>
    public int PetId { get; set; }

    /// <summary>Owning customer primary key.</summary>
    public int CustomerId { get; set; }

    /// <summary>Pet name.</summary>
    public string Name { get; set; } = null!;

    /// <summary>Species.</summary>
    public string Species { get; set; } = null!;

    /// <summary>Breed (optional).</summary>
    public string? Breed { get; set; }

    /// <summary>Birth date (optional).</summary>
    public DateOnly? BirthDate { get; set; }

    /// <summary>Gender (optional).</summary>
    public string? Gender { get; set; }

    /// <summary>Status (optional).</summary>
    public string? Status { get; set; }

    /// <summary>Bookings for the pet.</summary>
    public virtual ICollection<Booking> Bookings { get; set; } = new List<Booking>();

    /// <summary>Health checks for the pet.</summary>
    public virtual ICollection<CheckHealth> CheckHealths { get; set; } = new List<CheckHealth>();

    /// <summary>Navigation to the owner customer.</summary>
    public virtual Customer Customer { get; set; } = null!;

    /// <summary>Invoices related to the pet.</summary>
    public virtual ICollection<Invoice> Invoices { get; set; } = new List<Invoice>();

    /// <summary>Vaccine records for the pet.</summary>
    public virtual ICollection<VaccineRecord> VaccineRecords { get; set; } = new List<VaccineRecord>();
}
