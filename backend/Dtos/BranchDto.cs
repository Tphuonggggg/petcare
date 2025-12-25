using System.ComponentModel.DataAnnotations;

namespace PetCareX.Api.Dtos;

/// <summary>
/// Branch data transfer object.
/// </summary>
public class BranchDto
{
    /// <summary>Branch primary key.</summary>
    public int BranchId { get; set; }

    /// <summary>Branch name.</summary>
    [Required]
    public string Name { get; set; } = string.Empty;

    /// <summary>Contact phone (optional).</summary>
    public string? Phone { get; set; }

    /// <summary>Opening time (optional).</summary>
    public string? OpenTime { get; set; }

    /// <summary>Closing time (optional).</summary>
    public string? CloseTime { get; set; }

    /// <summary>Address (optional).</summary>
    public string? Address { get; set; }
}
