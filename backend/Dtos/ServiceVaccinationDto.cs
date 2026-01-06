using System;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace PetCareX.Api.Dtos;

/// <summary>
/// DTO linking a service to a vaccination event.
/// </summary>
public class ServiceVaccinationDto
{
    /// <summary>Vaccination record id.</summary>
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)]
    public int? VaccinationId { get; set; }

    /// <summary>Vaccine id used.</summary>
    [Required]
    public int VaccineId { get; set; }

    /// <summary>Date of vaccination (optional).</summary>
    public DateOnly? Date { get; set; }

    /// <summary>Standard dose amount (optional).</summary>
    public decimal? StandardDose { get; set; }
}
