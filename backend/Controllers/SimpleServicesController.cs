using Microsoft.AspNetCore.Mvc;

namespace PetCareX.Api.Controllers;

/// <summary>
/// Simple Services controller without database dependency for testing
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class SimpleServicesController : ControllerBase
{
    /// <summary>
    /// Get hardcoded services for testing
    /// </summary>
    [HttpGet]
    public ActionResult<object> GetServices([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var services = new[]
        {
            new { serviceId = 1, name = "Khám bệnh", serviceType = "CHECKUP", basePrice = 1500000, description = "Dịch vụ khám sức khỏe thú cưng" },
            new { serviceId = 2, name = "Tiêm phòng", serviceType = "VACCINATION", basePrice = 2300000, description = "Tiêm vaccine cho thú cưng" },
            new { serviceId = 3, name = "Gói tiêm phòng", serviceType = "PACKAGE", basePrice = 12000000, description = "Gói tiêm phòng theo tháng" }
        };

        return Ok(new { 
            items = services, 
            totalCount = services.Length, 
            page = page, 
            pageSize = pageSize 
        });
    }
}