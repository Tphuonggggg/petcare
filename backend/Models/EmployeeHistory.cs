using System;
using System.Collections.Generic;

namespace PetCareX.Api.Models;

/// <summary>
/// Represents an employee assignment to a branch over a date range.
/// </summary>
public partial class EmployeeHistory
{
    /// <summary>Employee primary key.</summary>
    public int EmployeeId { get; set; }

    /// <summary>Branch primary key.</summary>
    public int BranchId { get; set; }

    /// <summary>Start date of assignment.</summary>
    public DateOnly StartDate { get; set; }

    /// <summary>End date of assignment (optional).</summary>
    public DateOnly? EndDate { get; set; }

    /// <summary>Navigation to the branch.</summary>
    public virtual Branch Branch { get; set; } = null!;

    /// <summary>Navigation to the employee.</summary>
    public virtual Employee Employee { get; set; } = null!;
}
