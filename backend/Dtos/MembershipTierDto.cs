using System.ComponentModel.DataAnnotations;

namespace PetCareX.Api.Dtos;

/// <summary>
/// DTO for membership tier (loyalty program).
/// </summary>
public class MembershipTierDto
{
    /// <summary>Tier primary key.</summary>
    public int MembershipTierId { get; set; }

    /// <summary>Name of the tier.</summary>
    [Required]
    public string Name { get; set; } = string.Empty;

    /// <summary>Minimum spend required to reach this tier.</summary>
    public decimal? MinSpend { get; set; }

    /// <summary>Spend required to maintain the tier.</summary>
    public decimal? MaintainSpend { get; set; }

    /// <summary>Benefits description (optional).</summary>
    public string? Benefits { get; set; }
}
