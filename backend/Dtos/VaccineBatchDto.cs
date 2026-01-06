using System;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace PetCareX.Api.Dtos;

/// <summary>
/// DTO for vaccine batch inventory.
/// </summary>
public class VaccineBatchDto
{
    /// <summary>Batch primary key.</summary>
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)]
    public int? BatchId { get; set; }

    /// <summary>Vaccine id.</summary>
    [Required]
    public int VaccineId { get; set; }

    /// <summary>Branch id where the batch is stored.</summary>
    [Required]
    public int BranchId { get; set; }

    /// <summary>Manufacture date.</summary>
    [Required]
    public DateOnly ManufactureDate { get; set; }

    /// <summary>Expiry date.</summary>
    [Required]
    public DateOnly ExpiryDate { get; set; }

    /// <summary>Quantity available.</summary>
    [Range(0, int.MaxValue, ErrorMessage = "Quantity must be non-negative.")]
    public int Quantity { get; set; }
}
