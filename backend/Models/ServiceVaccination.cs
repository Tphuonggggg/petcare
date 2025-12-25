using System;
using System.Collections.Generic;

namespace PetCareX.Api.Models;

/// <summary>
/// Represents a vaccination event tied to a service.
/// </summary>
public partial class ServiceVaccination
{
    /// <summary>Vaccination primary key.</summary>
    public int VaccinationId { get; set; }

    /// <summary>Vaccine administered.</summary>
    public int VaccineId { get; set; }

    /// <summary>Date of the vaccination.</summary>
    public DateTime Date { get; set; }

    /// <summary>Standard dose used (if applicable).</summary>
    public int StandardDose { get; set; }

    /// <summary>Navigation to the vaccine.</summary>
    public virtual Vaccine Vaccine { get; set; } = null!;
}
