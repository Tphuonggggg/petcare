using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using PetCareX.Api.Data;
using System;
using System.Collections.Generic;
using System.Data;
using System.Threading.Tasks;

namespace PetCareX.Api.Controllers;

/// <summary>
/// API endpoints for statistical reports and analytics.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class ReportsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    /// <summary>
    /// Initializes a new instance of <see cref="ReportsController"/>.
    /// </summary>
    public ReportsController(ApplicationDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Gets revenue statistics by doctor for a date range.
    /// </summary>
    /// <param name="fromDate">Start date</param>
    /// <param name="toDate">End date</param>
    /// <returns>Doctor revenue statistics</returns>
    [HttpGet("doctor-revenue")]
    public async Task<ActionResult<List<DoctorRevenueDto>>> GetDoctorRevenue(
        [FromQuery] DateTime fromDate, 
        [FromQuery] DateTime toDate)
    {
        var results = new List<DoctorRevenueDto>();
        
        using (var command = _context.Database.GetDbConnection().CreateCommand())
        {
            command.CommandText = "usp_GetDoctorRevenue";
            command.CommandType = CommandType.StoredProcedure;
            
            command.Parameters.Add(new SqlParameter("@FromDate", fromDate));
            command.Parameters.Add(new SqlParameter("@ToDate", toDate));
            
            await _context.Database.OpenConnectionAsync();
            
            using (var reader = await command.ExecuteReaderAsync())
            {
                while (await reader.ReadAsync())
                {
                    results.Add(new DoctorRevenueDto
                    {
                        EmployeeId = reader.GetInt32(0),
                        FullName = reader.GetString(1),
                        TotalInvoices = reader.GetInt32(2),
                        TotalRevenue = reader.GetDecimal(3)
                    });
                }
            }
        }
        
        return results;
    }

    /// <summary>
    /// Gets total visit statistics for a date range.
    /// </summary>
    /// <param name="fromDate">Start date</param>
    /// <param name="toDate">End date</param>
    /// <returns>Visit statistics</returns>
    [HttpGet("visit-statistics")]
    public async Task<ActionResult<VisitStatisticsDto>> GetVisitStatistics(
        [FromQuery] DateTime fromDate, 
        [FromQuery] DateTime toDate)
    {
        var result = new VisitStatisticsDto();
        
        using (var command = _context.Database.GetDbConnection().CreateCommand())
        {
            command.CommandText = "usp_GetVisitStatistics";
            command.CommandType = CommandType.StoredProcedure;
            
            command.Parameters.Add(new SqlParameter("@FromDate", fromDate));
            command.Parameters.Add(new SqlParameter("@ToDate", toDate));
            
            await _context.Database.OpenConnectionAsync();
            
            using (var reader = await command.ExecuteReaderAsync())
            {
                if (await reader.ReadAsync())
                {
                    result.TotalVisits = reader.GetInt32(0);
                }
            }
        }
        
        return result;
    }

    /// <summary>
    /// Gets total system revenue for a date range.
    /// </summary>
    /// <param name="fromDate">Start date</param>
    /// <param name="toDate">End date</param>
    /// <returns>System revenue statistics</returns>
    [HttpGet("system-revenue")]
    public async Task<ActionResult<SystemRevenueDto>> GetSystemRevenue(
        [FromQuery] DateTime fromDate, 
        [FromQuery] DateTime toDate)
    {
        var result = new SystemRevenueDto();
        
        using (var command = _context.Database.GetDbConnection().CreateCommand())
        {
            command.CommandText = "usp_GetSystemRevenue";
            command.CommandType = CommandType.StoredProcedure;
            
            command.Parameters.Add(new SqlParameter("@FromDate", fromDate));
            command.Parameters.Add(new SqlParameter("@ToDate", toDate));
            
            await _context.Database.OpenConnectionAsync();
            
            using (var reader = await command.ExecuteReaderAsync())
            {
                if (await reader.ReadAsync())
                {
                    result.TotalSystemRevenue = reader.IsDBNull(0) ? 0 : reader.GetDecimal(0);
                }
            }
        }
        
        return result;
    }

    /// <summary>
    /// Gets product revenue grouped by category for a date range.
    /// </summary>
    /// <param name="fromDate">Start date</param>
    /// <param name="toDate">End date</param>
    /// <returns>Product revenue by category</returns>
    [HttpGet("product-revenue-by-category")]
    public async Task<ActionResult<List<ProductRevenueByCategoryDto>>> GetProductRevenueByCategory(
        [FromQuery] DateTime fromDate, 
        [FromQuery] DateTime toDate)
    {
        var results = new List<ProductRevenueByCategoryDto>();
        
        using (var command = _context.Database.GetDbConnection().CreateCommand())
        {
            command.CommandText = "usp_GetProductRevenueByCategory";
            command.CommandType = CommandType.StoredProcedure;
            
            command.Parameters.Add(new SqlParameter("@FromDate", fromDate));
            command.Parameters.Add(new SqlParameter("@ToDate", toDate));
            
            await _context.Database.OpenConnectionAsync();
            
            using (var reader = await command.ExecuteReaderAsync())
            {
                while (await reader.ReadAsync())
                {
                    results.Add(new ProductRevenueByCategoryDto
                    {
                        Category = reader.GetString(0),
                        TotalSoldQuantity = reader.GetInt32(1),
                        CategoryRevenue = reader.GetDecimal(2)
                    });
                }
            }
        }
        
        return results;
    }

    /// <summary>
    /// Gets top selling products.
    /// </summary>
    /// <param name="top">Number of top products to return (default: 10)</param>
    /// <returns>Top selling products</returns>
    [HttpGet("top-selling-products")]
    public async Task<ActionResult<List<TopSellingProductDto>>> GetTopSellingProducts([FromQuery] int top = 10)
    {
        var results = new List<TopSellingProductDto>();
        
        using (var command = _context.Database.GetDbConnection().CreateCommand())
        {
            command.CommandText = "usp_GetTopSellingProducts";
            command.CommandType = CommandType.StoredProcedure;
            
            command.Parameters.Add(new SqlParameter("@Top", top));
            
            await _context.Database.OpenConnectionAsync();
            
            using (var reader = await command.ExecuteReaderAsync())
            {
                while (await reader.ReadAsync())
                {
                    results.Add(new TopSellingProductDto
                    {
                        Name = reader.GetString(0),
                        Category = reader.GetString(1),
                        TotalQuantity = reader.GetInt32(2)
                    });
                }
            }
        }
        
        return results;
    }
}

#region DTOs

/// <summary>
/// Doctor revenue statistics.
/// </summary>
public class DoctorRevenueDto
{
    /// <summary>Employee ID</summary>
    public int EmployeeId { get; set; }
    /// <summary>Doctor full name</summary>
    public string FullName { get; set; } = string.Empty;
    /// <summary>Total number of invoices</summary>
    public int TotalInvoices { get; set; }
    /// <summary>Total revenue</summary>
    public decimal TotalRevenue { get; set; }
}

/// <summary>
/// Visit statistics.
/// </summary>
public class VisitStatisticsDto
{
    /// <summary>Total number of visits</summary>
    public int TotalVisits { get; set; }
}

/// <summary>
/// System revenue statistics.
/// </summary>
public class SystemRevenueDto
{
    /// <summary>Total system revenue</summary>
    public decimal TotalSystemRevenue { get; set; }
}

/// <summary>
/// Product revenue by category.
/// </summary>
public class ProductRevenueByCategoryDto
{
    /// <summary>Product category</summary>
    public string Category { get; set; } = string.Empty;
    /// <summary>Total sold quantity</summary>
    public int TotalSoldQuantity { get; set; }
    /// <summary>Category revenue</summary>
    public decimal CategoryRevenue { get; set; }
}

/// <summary>
/// Top selling product information.
/// </summary>
public class TopSellingProductDto
{
    /// <summary>Product name</summary>
    public string Name { get; set; } = string.Empty;
    /// <summary>Product category</summary>
    public string Category { get; set; } = string.Empty;
    /// <summary>Total quantity sold</summary>
    public int TotalQuantity { get; set; }
}

#endregion
