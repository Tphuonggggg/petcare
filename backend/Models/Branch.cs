using System;
using System.Collections.Generic;

namespace PetCareX.Api.Models;

/// <summary>
/// Represents a physical branch/location of the clinic.
/// </summary>
public partial class Branch
{
    /// <summary>Branch primary key.</summary>
    public int BranchId { get; set; }

    /// <summary>Branch name.</summary>
    public string Name { get; set; } = null!;

    /// <summary>Contact phone (optional).</summary>
    public string? Phone { get; set; }

    /// <summary>Opening time (optional).</summary>
    public TimeOnly? OpenTime { get; set; }

    /// <summary>Closing time (optional).</summary>
    public TimeOnly? CloseTime { get; set; }

    /// <summary>Address (optional).</summary>
    public string? Address { get; set; }

    /// <summary>Services provided at this branch.</summary>
    public virtual ICollection<BranchService> BranchServices { get; set; } = new List<BranchService>();

    /// <summary>Employee assignment histories for the branch.</summary>
    public virtual ICollection<EmployeeHistory> EmployeeHistories { get; set; } = new List<EmployeeHistory>();

    /// <summary>Employees working at the branch.</summary>
    public virtual ICollection<Employee> Employees { get; set; } = new List<Employee>();

    /// <summary>Invoices issued at the branch.</summary>
    public virtual ICollection<Invoice> Invoices { get; set; } = new List<Invoice>();

    /// <summary>Customer reviews for the branch.</summary>
    public virtual ICollection<Review> Reviews { get; set; } = new List<Review>();

    /// <summary>Vaccine batches stocked at the branch.</summary>
    public virtual ICollection<VaccineBatch> VaccineBatches { get; set; } = new List<VaccineBatch>();

    /// <summary>Vaccination records at the branch.</summary>
    public virtual ICollection<VaccineRecord> VaccineRecords { get; set; } = new List<VaccineRecord>();

    /// <summary>Promotions active at the branch.</summary>
    public virtual ICollection<Promotion> Promotions { get; set; } = new List<Promotion>();
}
