using System;
using System.Collections.Generic;

namespace PetCareX.Api.Models;

/// <summary>
/// Represents an employee working at a branch.
/// </summary>
public partial class Employee
{
    /// <summary>Employee primary key.</summary>
    public int EmployeeId { get; set; }

    /// <summary>Branch id where the employee works.</summary>
    public int BranchId { get; set; }

    /// <summary>Position id.</summary>
    public int PositionId { get; set; }

    /// <summary>Full name.</summary>
    public string FullName { get; set; } = null!;

    /// <summary>Birth date.</summary>
    public DateOnly BirthDate { get; set; }

    /// <summary>Gender.</summary>
    public string Gender { get; set; } = null!;

    /// <summary>Hire date.</summary>
    public DateOnly HireDate { get; set; }

    /// <summary>Base salary.</summary>
    public decimal BaseSalary { get; set; }

    /// <summary>Navigation to branch.</summary>
    public virtual Branch Branch { get; set; } = null!;

    /// <summary>Health checks performed by the employee.</summary>
    public virtual ICollection<CheckHealth> CheckHealths { get; set; } = new List<CheckHealth>();

    /// <summary>Employee branch assignment history.</summary>
    public virtual ICollection<EmployeeHistory> EmployeeHistories { get; set; } = new List<EmployeeHistory>();

    /// <summary>Invoices handled by the employee.</summary>
    public virtual ICollection<Invoice> Invoices { get; set; } = new List<Invoice>();

    /// <summary>Position held by the employee.</summary>
    public virtual Position Position { get; set; } = null!;

    /// <summary>Reviews related to the employee.</summary>
    public virtual ICollection<Review> Reviews { get; set; } = new List<Review>();

    /// <summary>Vaccine records created by the employee.</summary>
    public virtual ICollection<VaccineRecord> VaccineRecords { get; set; } = new List<VaccineRecord>();
}
