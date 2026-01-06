using System;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace PetCareX.Api.Dtos;

/// <summary>
/// DTO for pet health check records.
/// </summary>
public class CheckHealthDto
{
    /// <summary>Health check primary key.</summary>
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)]
    public int? CheckId { get; set; }

    /// <summary>Related pet primary key.</summary>
    [Required]
    public int PetId { get; set; }

    /// <summary>Doctor id who checked (optional).</summary>
    public int? DoctorId { get; set; }

    /// <summary>Date of the check (optional).</summary>
    public DateTime? CheckDate { get; set; }

    /// <summary>Reported symptoms (optional).</summary>
    [StringLength(1000)]
    public string? Symptoms { get; set; }

    /// <summary>Diagnosis notes (optional).</summary>
    [StringLength(1000)]
    public string? Diagnosis { get; set; }

    /// <summary>Prescription notes (optional).</summary>
    [StringLength(1000)]
    public string? Prescription { get; set; }

    /// <summary>Follow-up date (optional).</summary>
    public DateTime? FollowUpDate { get; set; }
}
