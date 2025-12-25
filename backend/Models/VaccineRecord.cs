using System;
using System.Collections.Generic;

namespace PetCareX.Api.Models;

/// <summary>
/// Record of a vaccine administered to a pet.
/// </summary>
public partial class VaccineRecord
{
    /// <summary>Primary key for the vaccination record.</summary>
    public int VaccinationRecordId { get; set; }

    /// <summary>Pet that received the vaccine.</summary>
    public int PetId { get; set; }

    /// <summary>Vaccine administered.</summary>
    public int VaccineId { get; set; }

    /// <summary>Branch where the vaccine was given.</summary>
    public int BranchId { get; set; }

    /// <summary>Doctor (employee) who administered.</summary>
    public int DoctorId { get; set; }

    /// <summary>Associated invoice item (optional).</summary>
    public int? InvoiceItemId { get; set; }

    /// <summary>Dose amount administered.</summary>
    public decimal Dose { get; set; }

    /// <summary>Date administered.</summary>
    public DateOnly DateAdministered { get; set; }

    /// <summary>Optional next due date.</summary>
    public DateOnly? NextDueDate { get; set; }

    /// <summary>Navigation to branch.</summary>
    public virtual Branch Branch { get; set; } = null!;

    /// <summary>Navigation to the doctor (employee).</summary>
    public virtual Employee Doctor { get; set; } = null!;

    /// <summary>Navigation to invoice item (optional).</summary>
    public virtual InvoiceItem? InvoiceItem { get; set; }

    /// <summary>Navigation to pet.</summary>
    public virtual Pet Pet { get; set; } = null!;

    /// <summary>Navigation to vaccine.</summary>
    public virtual Vaccine Vaccine { get; set; } = null!;
}
