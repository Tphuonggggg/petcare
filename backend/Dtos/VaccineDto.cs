using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace PetCareX.Api.Dtos;

/// <summary>
/// DTO for vaccine metadata.
/// </summary>
public class VaccineDto
{
    /// <summary>Vaccine primary key.</summary>
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)]
    public int? VaccineId { get; set; }

    /// <summary>Vaccine type/name.</summary>
    [Required]
    public string Type { get; set; } = string.Empty;

    /// <summary>Description (optional).</summary>
    public string? Description { get; set; }

    /// <summary>Standard dose information (optional).</summary>
    public string? StandardDose { get; set; }

    /// <summary>Stock quantity (calculated based on branch batches).</summary>
    public int? StockQuantity { get; set; }
}
