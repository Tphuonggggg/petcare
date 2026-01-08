using System.ComponentModel.DataAnnotations;

namespace PetCareX.Api.Dtos;

/// <summary>
/// Request DTO for employee/customer login
/// </summary>
public class LoginRequestDto
{
    /// <summary>
    /// Username for login
    /// </summary>
    [Required(ErrorMessage = "Username is required")]
    [StringLength(50)]
    public string Username { get; set; } = null!;

    /// <summary>
    /// Password for login (will be hashed on server)
    /// </summary>
    [Required(ErrorMessage = "Password is required")]
    [StringLength(255)]
    public string Password { get; set; } = null!;
}

/// <summary>
/// Response DTO after successful login
/// </summary>
public class LoginResponseDto
{
    /// <summary>
    /// Account ID from database
    /// </summary>
    public int AccountId { get; set; }

    /// <summary>
    /// Username of logged-in user
    /// </summary>
    public string Username { get; set; } = null!;

    /// <summary>
    /// Role type (Employee or Customer)
    /// </summary>
    public string Role { get; set; } = null!;

    /// <summary>
    /// Full name of the user
    /// </summary>
    public string DisplayName { get; set; } = null!;

    /// <summary>
    /// Employee ID if this is an employee account, null for customers
    /// </summary>
    public int? EmployeeId { get; set; }

    /// <summary>
    /// Customer ID if this is a customer account, null for employees
    /// </summary>
    public int? CustomerId { get; set; }

    /// <summary>
    /// Branch ID where the employee works (nullable for customer accounts)
    /// </summary>
    public int? BranchId { get; set; }

    /// <summary>
    /// Position ID used for role-based routing (1=Doctor, 2=Receptionist, 3=Sales, 4=Manager)
    /// </summary>
    public int? PositionId { get; set; }

    /// <summary>
    /// JWT token for subsequent API calls (if implemented)
    /// </summary>
    public string Token { get; set; } = null!;
}

/// <summary>
/// Account information DTO
/// </summary>
public class AccountDto
{
    /// <summary>
    /// Account ID
    /// </summary>
    public int AccountId { get; set; }

    /// <summary>
    /// Username
    /// </summary>
    public string Username { get; set; } = null!;

    /// <summary>
    /// Role type (Employee or Customer)
    /// </summary>
    public string Role { get; set; } = null!;

    /// <summary>
    /// Account status (active or inactive)
    /// </summary>
    public bool IsActive { get; set; }

    /// <summary>
    /// Employee ID (if employee account)
    /// </summary>
    public int? EmployeeId { get; set; }

    /// <summary>
    /// Customer ID (if customer account)
    /// </summary>
    public int? CustomerId { get; set; }
}
