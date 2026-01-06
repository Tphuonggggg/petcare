using System;
using System.Collections.Generic;

namespace PetCareX.Api.Models;

/// <summary>
/// Represents a health check record for a pet.
/// </summary>
public partial class CheckHealth
{
    /// <summary>Health check primary key.</summary>
    public int CheckId { get; set; }

    /// <summary>Pet id the check is for.</summary>
    public int PetId { get; set; }

    /// <summary>Doctor (employee) who performed the check.</summary>
    public int? DoctorId { get; set; }

    /// <summary>Date of the check.</summary>
    public DateTime? CheckDate { get; set; }

    /// <summary>Reported symptoms.</summary>
    public string? Symptoms { get; set; }

    /// <summary>Diagnosis notes (optional).</summary>
    public string? Diagnosis { get; set; }

    /// <summary>Prescription details (optional).</summary>
    public string? Prescription { get; set; }

    /// <summary>Follow-up date (optional).</summary>
    public DateTime? FollowUpDate { get; set; }

    /// <summary>Navigation to the examining doctor.</summary>
    public virtual Employee Doctor { get; set; } = null!;

    /// <summary>Navigation to the pet.</summary>
    public virtual Pet Pet { get; set; } = null!;
}
