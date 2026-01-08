using System;

namespace PetCareX.Api.Dtos;

/// <summary>
/// DTO for detailed booking info (customer, pet, branch, ...)
/// </summary>
public class BookingDetailDto
{
    public int BookingId { get; set; }
    public DateTime BookingTime { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public string CustomerPhone { get; set; } = string.Empty;
    public string CustomerEmail { get; set; } = string.Empty;
    public string PetName { get; set; } = string.Empty;
    public string PetType { get; set; } = string.Empty;
    public string BranchName { get; set; } = string.Empty;
    public string DoctorName { get; set; } = string.Empty;
    public string ServiceType { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string? Notes { get; set; }
}
