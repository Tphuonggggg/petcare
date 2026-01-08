using System;
using System.Collections.Generic;

namespace PetCareX.Api.Models;

/// <summary>
/// Represents a booking made by a customer for a pet.
/// </summary>
public partial class Booking
{
    /// <summary>Booking primary key.</summary>
    public int BookingId { get; set; }

    /// <summary>Customer who made the booking.</summary>
    public int CustomerId { get; set; }

    /// <summary>Pet associated with the booking.</summary>
    public int PetId { get; set; }

    /// <summary>Branch where the booking is handled.</summary>
    public int BranchId { get; set; }

    /// <summary>Type of booking/service requested.</summary>
    public string BookingType { get; set; } = null!;

    /// <summary>Requested date and time.</summary>
    public DateTime RequestedDateTime { get; set; }

    /// <summary>Current booking status.</summary>
    public string Status { get; set; } = null!;

    /// <summary>Optional notes for the booking.</summary>
    public string? Notes { get; set; }

    /// <summary>When the booking was created.</summary>
    public DateTime CreatedAt { get; set; }

    /// <summary>Doctor assigned to this booking (nullable for cancelled/completed bookings).</summary>
    public int? DoctorId { get; set; }

    /// <summary>History entries for the booking.</summary>
    public virtual ICollection<BookingHistory> BookingHistories { get; set; } = new List<BookingHistory>();

    /// <summary>Navigation to the branch.</summary>
    public virtual Branch Branch { get; set; } = null!;

    /// <summary>Navigation to the customer.</summary>
    public virtual Customer Customer { get; set; } = null!;

    /// <summary>Navigation to the pet.</summary>
    public virtual Pet Pet { get; set; } = null!;

    /// <summary>Navigation to the assigned doctor/employee.</summary>
    public virtual Employee? Doctor { get; set; } = null;
}
