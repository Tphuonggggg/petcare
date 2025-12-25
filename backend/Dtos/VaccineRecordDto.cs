using System;
using System.ComponentModel.DataAnnotations;

namespace PetCareX.Api.Dtos;

/// <summary>
/// DTO for vaccination records.
/// </summary>
public class VaccineRecordDto
{
    /// <summary>Vaccination record primary key.</summary>
    public int VaccinationRecordId { get; set; }

    /// <summary>Pet primary key.</summary>
    [Required]
    public int PetId { get; set; }

    /// <summary>Vaccine administered.</summary>
    [Required]
    public int VaccineId { get; set; }

    /// <summary>Branch where vaccine was given.</summary>
    [Required]
    public int BranchId { get; set; }

    /// <summary>Doctor id (optional).</summary>
    public int? DoctorId { get; set; }

    /// <summary>Related invoice item id (optional).</summary>
    public int? InvoiceItemId { get; set; }

    /// <summary>Dose information (optional).</summary>
    public string? Dose { get; set; }

    /// <summary>Date administered (optional).</summary>
    public DateOnly? DateAdministered { get; set; }

    /// <summary>Next due date (optional).</summary>
    public DateOnly? NextDueDate { get; set; }
}
