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
    /// </summary>
    [HttpGet("summary")]
    public async Task<ActionResult<DashboardSummaryDto>> GetDashboardSummary([FromQuery] int branchId, [FromQuery] DateTime? date = null)
    {
        var targetDate = date ?? DateTime.Today;
        var startOfDay = targetDate.Date;
        var endOfDay = startOfDay.AddDays(1);

        // Lấy tất cả invoice trong ngày theo chi nhánh
        var todayInvoices = await _context.Invoices
            .Where(i => i.BranchId == branchId && i.InvoiceDate >= startOfDay && i.InvoiceDate < endOfDay)
            .ToListAsync();

        // Đếm và tính toán thống kê
        var totalOrders = todayInvoices.Count;
        var totalRevenue = todayInvoices.Sum(i => i.FinalAmount);
        var completedOrders = todayInvoices.Count(i => i.PaymentMethod != null); // Assuming all invoices are completed if they have payment method
        var pendingOrders = 0; // For now, assuming all invoices are completed

        return new DashboardSummaryDto
        {
            TotalOrdersToday = totalOrders,
            PendingOrders = pendingOrders,
            CompletedOrders = completedOrders,
            TotalRevenue = totalRevenue ?? 0
        };
    }

    /// <summary>
    /// Gets recent orders (invoices) for today by branch.
    /// </summary>
    [HttpGet("today-orders")]
    public async Task<ActionResult<List<OrderDetailDto>>> GetTodayOrders([FromQuery] int branchId, [FromQuery] int take = 20, [FromQuery] DateTime? date = null)
    {
        var targetDate = date ?? DateTime.Today;
        var startOfDay = targetDate.Date;
        var endOfDay = startOfDay.AddDays(1);

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
                Status = "completed"
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
