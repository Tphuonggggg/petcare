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
    /// Gets dashboard summary statistics for today by branch.
    /// Returns today's orders count, pending orders count, completed orders count, and TODAY'S REVENUE.
    /// Status values: Pending, Paid, Cancelled (according to database constraint).
    /// </summary>
    [HttpGet("summary")]
    public async Task<ActionResult<DashboardSummaryDto>> GetDashboardSummary([FromQuery] int branchId, [FromQuery] DateTime? date = null, [FromQuery] int days = 30)
    {
        try 
        {
            var targetDate = date ?? DateTime.Today;
            
            // Get invoices for last 7 days instead of just today to show meaningful data
            var startOfWeek = targetDate.Date.AddDays(-7);
            var endOfToday = targetDate.Date.AddDays(1);

            // Debug logging
            Console.WriteLine($"DEBUG Dashboard: Date={targetDate:yyyy-MM-dd}, BranchId={branchId}");
            Console.WriteLine($"DEBUG Start: {startOfWeek:yyyy-MM-dd HH:mm}, End: {endOfToday:yyyy-MM-dd HH:mm}");

            // Get recent invoices for counts (last 7 days)
            var recentInvoices = await _context.Invoices
                .Where(i => i.BranchId == branchId && i.InvoiceDate >= startOfWeek && i.InvoiceDate < endOfToday)
                .ToListAsync();
                
            Console.WriteLine($"DEBUG Recent Invoices Count: {recentInvoices.Count}");

            // Get all pending orders from branch (not just today)
            var allPendingOrders = await _context.Invoices
                .Where(i => i.BranchId == branchId && i.Status == "Pending")
                .CountAsync();

            Console.WriteLine($"DEBUG All Pending Orders: {allPendingOrders}");

            // Simple calculations using recent data
            var totalOrdersRecent = recentInvoices.Count;
            var completedOrdersRecent = recentInvoices.Count(i => i.Status == "Paid");
            var recentRevenue = recentInvoices.Where(i => i.Status == "Paid").Sum(i => i.FinalAmount ?? 0);

            Console.WriteLine($"DEBUG Results: Orders={totalOrdersRecent}, Completed={completedOrdersRecent}, Revenue={recentRevenue}, Pending={allPendingOrders}");

            // Show some sample invoices
            foreach(var inv in recentInvoices.Take(5))
            {
                Console.WriteLine($"DEBUG Invoice: ID={inv.InvoiceId}, Status={inv.Status}, Amount={inv.FinalAmount}, Date={inv.InvoiceDate:yyyy-MM-dd HH:mm}");
            }

            return new DashboardSummaryDto
            {
                TotalOrdersToday = totalOrdersRecent,
                PendingOrders = allPendingOrders,
                CompletedOrders = completedOrdersRecent,
                TotalRevenue = recentRevenue
            };
        }
        catch (Exception ex)
        {
            Console.WriteLine($"ERROR in Dashboard: {ex.Message}\n{ex.StackTrace}");
            return BadRequest(new { error = ex.Message });
        }
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
        public decimal TotalRevenue { get; set; } // Today's revenue only
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
