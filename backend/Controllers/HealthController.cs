using Microsoft.AspNetCore.Mvc;

namespace PetCareX.Api.Controllers;

/// <summary>
/// Simple health check controller for debugging
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class HealthController : ControllerBase
{
    /// <summary>
    /// Simple health check endpoint
    /// </summary>
    [HttpGet]
    public ActionResult<object> GetHealth()
    {
        return Ok(new { status = "OK", timestamp = DateTime.UtcNow });
    }

    /// <summary>
    /// Health check without database
    /// </summary>
    [HttpGet("ping")]
    public ActionResult<string> Ping()
    {
        return Ok("pong");
    }
}