using System;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace PetCareX.Api.Dtos;

/// <summary>
/// DTO for employee information.
/// </summary>
public class EmployeeDto
{
    /// <summary>Employee primary key.</summary>
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)]
    public int? EmployeeId { get; set; }

    /// <summary>Branch id where the employee works (optional).</summary>
    public int? BranchId { get; set; }

    /// <summary>Position id (optional).</summary>
    public int? PositionId { get; set; }

    /// <summary>Full name of the employee.</summary>
    [Required]
    [StringLength(200)]
    public string? FullName { get; set; }

    /// <summary>Birth date (optional).</summary>
    public DateOnly? BirthDate { get; set; }

    /// <summary>Gender (optional).</summary>
    public string? Gender { get; set; }

    /// <summary>Hire date (optional).</summary>
    public DateOnly? HireDate { get; set; }

    /// <summary>Base salary (optional).</summary>
    [Range(0, double.MaxValue, ErrorMessage = "BaseSalary must be non-negative.")]
    public decimal? BaseSalary { get; set; }
}
