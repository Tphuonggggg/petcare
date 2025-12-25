using System;
using System.ComponentModel.DataAnnotations;

namespace PetCareX.Api.Dtos;

/// <summary>
/// DTO for booking history entries.
/// </summary>
public class BookingHistoryDto
{
    /// <summary>History entry primary key.</summary>
    public int HistoryId { get; set; }

    /// <summary>Related booking primary key.</summary>
    [Required]
    public int BookingId { get; set; }

    /// <summary>Type of action recorded.</summary>
    [StringLength(100)]
    public string? ActionType { get; set; }

    /// <summary>Previous scheduled date/time (optional).</summary>
    public DateTime? OldDateTime { get; set; }

    /// <summary>New scheduled date/time (optional).</summary>
    public DateTime? NewDateTime { get; set; }

    /// <summary>Previous status (optional).</summary>
    public string? OldStatus { get; set; }

    /// <summary>New status (optional).</summary>
    public string? NewStatus { get; set; }

    /// <summary>Additional notes (optional).</summary>
    [StringLength(1000)]
    public string? Notes { get; set; }

    /// <summary>Timestamp of the history entry.</summary>
    public DateTime? Timestamp { get; set; }
}
