using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace PetCareX.Api.Dtos;

/// <summary>
/// DTO representing a booking request.
/// </summary>
public class BookingDto
{
    /// <summary>Primary key.</summary>
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)]
    public int? BookingId { get; set; }

    /// <summary>Customer who made the booking.</summary>
    [Required]
    public int CustomerId { get; set; }

    /// <summary>Pet associated with the booking.</summary>
    [Required]
    public int PetId { get; set; }

    /// <summary>Type of booking/service.</summary>
    [Required]
    [StringLength(50)]
    public string BookingType { get; set; } = null!;

    /// <summary>Requested date and time.</summary>
    [Required]
    public System.DateTime RequestedDateTime { get; set; }

    /// <summary>Booking status.</summary>
    [Required]
    [StringLength(20)]
    public string Status { get; set; } = null!;

    /// <summary>Notes for the booking.</summary>
    [StringLength(500)]
    public string? Notes { get; set; }
}
