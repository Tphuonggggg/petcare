using System;
using System.Collections.Generic;

namespace PetCareX.Api.Models;

/// <summary>
/// Represents a job position within the organization.
/// </summary>
public partial class Position
{
    /// <summary>Position primary key.</summary>
    public int PositionId { get; set; }

    /// <summary>Position name.</summary>
    public string Name { get; set; } = null!;

    /// <summary>Optional description.</summary>
    public string? Description { get; set; }

    /// <summary>Employees holding this position.</summary>
    public virtual ICollection<Employee> Employees { get; set; } = new List<Employee>();
}
