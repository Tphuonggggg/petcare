using System;
using System.Collections.Generic;

namespace PetCareX.Api.Models;

/// <summary>
/// Represents a historical action taken on a booking (changes, reschedules, etc.).
/// </summary>
public partial class BookingHistory
{
    /// <summary>History entry primary key.</summary>
    public int HistoryId { get; set; }

    /// <summary>Related booking id.</summary>
    public int BookingId { get; set; }

    /// <summary>Action type (e.g., Updated, Cancelled).</summary>
    public string ActionType { get; set; } = null!;

    /// <summary>Previous scheduled date/time (optional).</summary>
    public DateTime? OldDateTime { get; set; }

    /// <summary>New scheduled date/time (optional).</summary>
    public DateTime? NewDateTime { get; set; }

    /// <summary>Previous status (optional).</summary>
    public string? OldStatus { get; set; }

    /// <summary>New status (optional).</summary>
    public string? NewStatus { get; set; }

    /// <summary>Optional notes about the change.</summary>
    public string? Notes { get; set; }

    /// <summary>Timestamp of the history entry.</summary>
    public DateTime Timestamp { get; set; }

    /// <summary>Navigation to the booking.</summary>
    public virtual Booking Booking { get; set; } = null!;
}
