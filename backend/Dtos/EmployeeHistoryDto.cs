using System;
using System.ComponentModel.DataAnnotations;

namespace PetCareX.Api.Dtos;

/// <summary>
/// DTO for employee branch assignment history.
/// </summary>s
public class EmployeeHistoryDto
{
    /// <summary>Employee primary key.</summary>
    [Required]
    public int EmployeeId { get; set; }

    /// <summary>Branch id assigned.</summary>
    [Required]
    public int BranchId { get; set; }

    /// <summary>Start date of assignment.</summary>
    [Required]
    public DateOnly StartDate { get; set; }

    /// <summary>End date of assignment (optional).</summary>
    public DateOnly? EndDate { get; set; }
}
