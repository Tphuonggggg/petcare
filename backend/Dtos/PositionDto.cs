using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace PetCareX.Api.Dtos;

/// <summary>
/// DTO for job position.
/// </summary>
public class PositionDto
{
    /// <summary>Position primary key.</summary>
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)]
    public int? PositionId { get; set; }

    /// <summary>Position name.</summary>
    [Required]
    public string Name { get; set; } = string.Empty;

    /// <summary>Optional description.</summary>
    public string? Description { get; set; }
}
