using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PetCareX.Api.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PetCareX.Api.Controllers;

/// <summary>
/// API endpoints for sales dashboard statistics and data.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class SalesDashboardController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    /// <summary>
    /// Initializes a new instance of <see cref="SalesDashboardController"/>.
    /// </summary>
    public SalesDashboardController(ApplicationDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Gets dashboard summary statistics for today or a specified date range by branch.
    /// </summary>
    [HttpGet("summary")]
    public async Task<ActionResult<DashboardSummaryDto>> GetDashboardSummary([FromQuery] int branchId, [FromQuery] DateTime? date = null, [FromQuery] int days = 30)
    {
        var targetDate = date ?? DateTime.Today;
        
        // For today's orders count - use only today
        var startOfToday = targetDate.Date;
        var endOfToday = targetDate.Date.AddDays(1);
        
        // For total revenue - use last 30 days
        var startOf30Days = targetDate.Date.AddDays(-days);
        var endOf30Days = targetDate.Date.AddDays(1);

        // Get today's invoices for counts
        var todayInvoices = await _context.Invoices
            .Where(i => i.BranchId == branchId && i.InvoiceDate >= startOfToday && i.InvoiceDate < endOfToday)
            .ToListAsync();
            
        // Get all invoices for revenue calculation
        var allInvoices = await _context.Invoices
            .Where(i => i.BranchId == branchId && i.InvoiceDate >= startOf30Days && i.InvoiceDate < endOf30Days)
            .ToListAsync();
            
        // Get all pending orders from branch (not just today)
        var allPendingOrders = await _context.Invoices
            .Where(i => i.BranchId == branchId && i.Status == "Pending")
            .CountAsync();

        // Đếm và tính toán thống kê
        var totalOrdersToday = todayInvoices.Count;
        var totalRevenue = allInvoices.Where(i => i.Status == "Completed").Sum(i => i.FinalAmount);
        var completedOrdersToday = todayInvoices.Count(i => i.Status == "Completed");

        return new DashboardSummaryDto
        {
            TotalOrdersToday = totalOrdersToday,
            PendingOrders = allPendingOrders,
            CompletedOrders = completedOrdersToday,
            TotalRevenue = totalRevenue ?? 0
        };
    }

    /// <summary>
    /// Gets recent orders (invoices) for a date range by branch.
    /// </summary>
    [HttpGet("today-orders")]
    public async Task<ActionResult<List<OrderDetailDto>>> GetTodayOrders([FromQuery] int branchId, [FromQuery] int take = 20, [FromQuery] DateTime? date = null, [FromQuery] int days = 30)
    {
        var targetDate = date ?? DateTime.Today;
        var startOfDay = targetDate.Date.AddDays(-days); // Default to last 30 days
        var endOfDay = targetDate.Date.AddDays(1);

        var orders = await _context.Invoices
            .Where(i => i.BranchId == branchId && i.InvoiceDate >= startOfDay && i.InvoiceDate < endOfDay)
            .Include(i => i.Customer)
            .Include(i => i.InvoiceItems)
            .OrderByDescending(i => i.InvoiceDate)
            .Take(take)
            .Select(i => new OrderDetailDto
            {
                OrderId = i.InvoiceId,
                OrderTime = i.InvoiceDate,
                CustomerName = i.Customer != null ? i.Customer.FullName : "N/A",
                Products = string.Join(", ", i.InvoiceItems.Select(ii => ii.ItemType == "PRODUCT" ? ii.ServiceId.ToString() : ii.ProductId.ToString())),
                Amount = i.FinalAmount ?? 0,
                Status = i.Status ?? "Pending"
            })
            .ToListAsync();

        return Ok(orders);
    }

    /// <summary>
    /// Gets product sales statistics for a branch.
    /// </summary>
    [HttpGet("product-sales")]
    public async Task<ActionResult<List<ProductSalesDto>>> GetProductSales([FromQuery] int branchId, [FromQuery] DateTime? date = null)
    {
        var targetDate = date ?? DateTime.Today;
        var startOfDay = targetDate.Date;
        var endOfDay = startOfDay.AddDays(1);

        var productSales = await _context.InvoiceItems
            .Where(ii => ii.Invoice.BranchId == branchId 
                && ii.Invoice.InvoiceDate >= startOfDay 
                && ii.Invoice.InvoiceDate < endOfDay
                && ii.ItemType == "PRODUCT"
                && ii.Product != null)
            .GroupBy(ii => ii.Product!.Name)
            .Select(g => new ProductSalesDto
            {
                ProductName = g.Key ?? "Unknown",
                UnitsSold = g.Count(),
                Revenue = g.Sum(ii => ii.UnitPrice * ii.Quantity)
            })
            .OrderByDescending(x => x.Revenue)
            .Take(10)
            .ToListAsync();

        return Ok(productSales);
    }

    public class DashboardSummaryDto
    {
        public int TotalOrdersToday { get; set; }
        public int PendingOrders { get; set; }
        public int CompletedOrders { get; set; }
        public decimal TotalRevenue { get; set; }
    }

    public class OrderDetailDto
    {
        public int OrderId { get; set; }
        public DateTime OrderTime { get; set; }
        public string CustomerName { get; set; } = null!;
        public string Products { get; set; } = null!;
        public decimal Amount { get; set; }
        public string Status { get; set; } = null!;
    }

    public class ProductSalesDto
    {
        public string ProductName { get; set; } = null!;
        public int UnitsSold { get; set; }
        public decimal Revenue { get; set; }
    }
}
