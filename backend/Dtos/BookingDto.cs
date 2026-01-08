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

    /// <summary>Customer name (for display).</summary>
    public string? CustomerName { get; set; }

    /// <summary>Pet associated with the booking.</summary>
    [Required]
    public int PetId { get; set; }

    /// <summary>Pet name (for display).</summary>
    public string? PetName { get; set; }

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

    /// <summary>Branch ID where the booking is handled.</summary>
    [Required]
    public int BranchId { get; set; }

    /// <summary>Branch name (for display).</summary>
    public string? BranchName { get; set; }

    /// <summary>Doctor ID assigned to this booking.</summary>
    public int? DoctorId { get; set; }

    /// <summary>Doctor name (for display).</summary>
    public string? DoctorName { get; set; }

    /// <summary>Employee name (for display).</summary>
    public string? EmployeeName { get; set; }}