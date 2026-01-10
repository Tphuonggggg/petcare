using Microsoft.AspNetCore.Mvc;
using PetCareX.Api.Data;
using PetCareX.Api.Dtos;
using System.Security.Cryptography;
using System.Text;
using Microsoft.Data.SqlClient;

namespace PetCareX.Api.Controllers;

/// <summary>
/// Authentication controller for login and account management
/// Handles employee and customer authentication using stored procedures
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<AuthController> _logger;

    /// <summary>
    /// Initialize the AuthController with configuration and logger
    /// </summary>
    public AuthController(IConfiguration configuration, ILogger<AuthController> logger)
    {
        _configuration = configuration;
        _logger = logger;
    }

    /// <summary>
    /// Health check endpoint
    /// </summary>
    [HttpGet("health")]
    public ActionResult Health()
    {
        try
        {
            using (var connection = new SqlConnection(_configuration.GetConnectionString("DefaultConnection")))
            {
                connection.Open();
                return Ok(new { status = "ok", database = "connected" });
            }
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { status = "error", message = ex.Message });
        }
    }

    /// <summary>
    /// Login with username and password
    /// Returns account info with PositionID for role-based routing
    /// </summary>
    /// <param name="request">Login credentials (username, password)</param>
    /// <returns>Account information including PositionID for role determination</returns>
    [HttpPost("login")]
    public async Task<ActionResult<LoginResponseDto>> Login([FromBody] LoginRequestDto request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            // Hash password using MD5 (same as database)
            string passwordHash = HashPassword(request.Password);

            using (var connection = new SqlConnection(_configuration.GetConnectionString("DefaultConnection")))
            {
                await connection.OpenAsync();
                
                using (var command = new SqlCommand("sp_Account_Login", connection))
                {
                    command.CommandType = System.Data.CommandType.StoredProcedure;
                    command.Parameters.AddWithValue("@Username", request.Username);
                    command.Parameters.AddWithValue("@PasswordHash", passwordHash);

                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        if (await reader.ReadAsync())
                        {
                            var response = new LoginResponseDto
                            {
                                AccountId = reader.GetInt32(0),
                                Username = reader.GetString(1),
                                Role = reader.GetString(2),
                                DisplayName = reader.GetString(3),
                                EmployeeId = reader.IsDBNull(4) ? null : reader.GetInt32(4),
                                CustomerId = reader.IsDBNull(5) ? null : reader.GetInt32(5),
                                BranchId = reader.IsDBNull(6) ? null : reader.GetInt32(6),
                                PositionId = reader.IsDBNull(7) ? null : reader.GetInt32(7),
                                Token = GenerateToken(request.Username) // Generate simple JWT if needed
                            };

                            _logger.LogInformation($"User {request.Username} logged in successfully");
                            return Ok(response);
                        }
                    }
                }
            }

            // If no record found, credentials are invalid
            _logger.LogWarning($"Failed login attempt for username: {request.Username}");
            return Unauthorized(new { message = "Invalid username or password" });
        }
        catch (SqlException ex) when (ex.Number == 50000) // SQL Server custom error
        {
            _logger.LogWarning($"Login error for {request.Username}: {ex.Message}");
            return Unauthorized(new { message = "Invalid username or password, or account is locked" });
        }
        catch (Exception ex)
        {
            _logger.LogError($"Login error: {ex.Message}");
            return StatusCode(500, new { message = "An error occurred during login" });
        }
    }

    /// <summary>
    /// Hash password using MD5 (matches database implementation)
    /// Note: In production, use bcrypt or Argon2 instead
    /// </summary>
    private static string HashPassword(string password)
    {
        using (var md5 = MD5.Create())
        {
            var hashedBytes = md5.ComputeHash(Encoding.UTF8.GetBytes(password));
            return BitConverter.ToString(hashedBytes).Replace("-", "").ToLower();
        }
    }

    /// <summary>
    /// Generate a simple JWT token
    /// In production, use proper JWT libraries with secret key
    /// </summary>
    private string GenerateToken(string username)
    {
        // For now, return a simple token. 
        // In production, implement proper JWT with claims and expiration
        return Convert.ToBase64String(Encoding.UTF8.GetBytes($"{username}:{DateTime.UtcNow.Ticks}"));
    }
}
