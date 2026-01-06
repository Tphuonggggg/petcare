using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace PetCareX.Api.Dtos;

/// <summary>
/// Data transfer object for customer.
/// </summary>
public class CustomerDto
{
    /// <summary>Primary key.</summary>
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)]
    public int? CustomerId { get; set; }

    /// <summary>Full name of the customer.</summary>
    [Required]
    [StringLength(100)]
    public string FullName { get; set; } = null!;

    /// <summary>Contact phone number.</summary>
    [Required]
    [Phone]
    public string Phone { get; set; } = null!;

    /// <summary>Email address (optional).</summary>
    [EmailAddress]
    public string? Email { get; set; }

    /// <summary>Loyalty points balance.</summary>
    public int PointsBalance { get; set; }

    /// <summary>Membership tier id (FK to MembershipTier).</summary>
    public int? MembershipTierId { get; set; }

    /// <summary>Membership tier name (read-only convenience property).</summary>
    public string? MembershipTier { get; set; }

    /// <summary>Government ID (CCCD).</summary>
    [StringLength(20)]
    public string? Cccd { get; set; }

    /// <summary>Birth date (optional).</summary>
    [DataType(DataType.Date)]
    public DateOnly? BirthDate { get; set; }

    /// <summary>Date when customer became a member / registered.</summary>
    [DataType(DataType.Date)]
    public DateOnly? MemberSince { get; set; }

    /// <summary>Gender (optional).</summary>
    [StringLength(1)]
    public string? Gender { get; set; }

    /// <summary>Pets belonging to this customer.</summary>
    public List<PetDto> Pets { get; set; } = new();
}
