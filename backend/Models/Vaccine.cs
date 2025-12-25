using System;
using System.Collections.Generic;

namespace PetCareX.Api.Models;

/// <summary>
/// Represents a vaccine product and its metadata.
/// </summary>
public partial class Vaccine
{
    /// <summary>Vaccine primary key.</summary>
    public int VaccineId { get; set; }

    /// <summary>The vaccine type/name.</summary>
    public string Type { get; set; } = null!;

    /// <summary>Optional description of the vaccine.</summary>
    public string? Description { get; set; }

    /// <summary>Standard dose amount for the vaccine.</summary>
    public decimal StandardDose { get; set; }

    /// <summary>Service vaccinations referencing this vaccine.</summary>
    public virtual ICollection<ServiceVaccination> ServiceVaccinations { get; set; } = new List<ServiceVaccination>();

    /// <summary>Batches that contain this vaccine.</summary>
    public virtual ICollection<VaccineBatch> VaccineBatches { get; set; } = new List<VaccineBatch>();

    /// <summary>Package items including this vaccine.</summary>
    public virtual ICollection<VaccinePackageItem> VaccinePackageItems { get; set; } = new List<VaccinePackageItem>();

    /// <summary>Vaccine administration records for pets.</summary>
    public virtual ICollection<VaccineRecord> VaccineRecords { get; set; } = new List<VaccineRecord>();
}
