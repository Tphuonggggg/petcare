using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PetCareX.Api.Data;
using PetCareX.Api.Models;
using PetCareX.Api.Dtos;
using AutoMapper;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Data.SqlClient;

namespace PetCareX.Api.Controllers;

/// <summary>
/// API endpoints for managing invoices.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class InvoicesController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;

    /// <summary>
    /// Initializes a new instance of <see cref="InvoicesController"/>.
    /// </summary>
    public InvoicesController(ApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    /// <summary>
    /// Returns paginated invoices.
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<PaginatedResult<InvoiceDto>>> Get([FromQuery] int page = 1, [FromQuery] int pageSize = 20, [FromQuery] int? branchId = null, [FromQuery] int? customerId = null)
    {
        if (page <= 0) page = 1;
        if (pageSize <= 0) pageSize = 20;
        var q = _context.Invoices
            .Include(i => i.Branch)
            .Include(i => i.Customer)
            .Include(i => i.InvoiceItems)
                .ThenInclude(ii => ii.Product)
            .AsQueryable();
        
        // Filter by branch if provided
        if (branchId.HasValue)
        {
            q = q.Where(i => i.BranchId == branchId.Value);
        }
        
        // Filter by customer if provided
        if (customerId.HasValue)
        {
            q = q.Where(i => i.CustomerId == customerId.Value);
        }
        
        // Order by InvoiceDate descending (newest first)
        q = q.OrderByDescending(i => i.InvoiceDate).ThenByDescending(i => i.InvoiceId);
        
        var total = await q.CountAsync();
        var items = await q.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();
        var dtos = _mapper.Map<List<InvoiceDto>>(items);
        return new PaginatedResult<InvoiceDto> { Items = dtos, TotalCount = total, Page = page, PageSize = pageSize };
    }

    /// <summary>
    /// Gets an invoice by id.
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<InvoiceDto>> Get(int id)
    {
        var e = await _context.Invoices
            .Include(i => i.Branch)
            .Include(i => i.Customer)
            .Include(i => i.InvoiceItems)
                .ThenInclude(ii => ii.Product)
            .Include(i => i.InvoiceItems)
                .ThenInclude(ii => ii.Service)
            .FirstOrDefaultAsync(i => i.InvoiceId == id);
        if (e == null) return NotFound();
        return _mapper.Map<InvoiceDto>(e);
    }

    /// <summary>
    /// Creates an invoice.
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<InvoiceDto>> Post(InvoiceDto dto)
    {
        try
        {
            // Validate required fields
            if (!dto.BranchId.HasValue || dto.BranchId.Value <= 0)
                return BadRequest(new { error = "BranchId is required and must be greater than 0" });
            
            if (!dto.CustomerId.HasValue || dto.CustomerId.Value <= 0)
                return BadRequest(new { error = "CustomerId is required and must be greater than 0" });
            
            if (string.IsNullOrEmpty(dto.PaymentMethod))
                return BadRequest(new { error = "PaymentMethod is required" });

            // Sử dụng thời gian từ DTO hoặc thời gian hiện tại của server (có cả giờ phút giây)
            var invoiceDate = dto.InvoiceDate ?? DateTime.UtcNow;
            var paymentMethod = dto.PaymentMethod;
            var status = dto.Status ?? "Pending";

            // Get an employee from the branch if not specified
            int employeeId = dto.EmployeeId ?? 0;
            if (employeeId == 0 && dto.BranchId.HasValue)
            {
                var employee = await _context.Employees
                    .Where(e => e.BranchId == dto.BranchId.Value)
                    .FirstOrDefaultAsync();
                if (employee != null)
                {
                    employeeId = employee.EmployeeId;
                }
                else
                {
                    return BadRequest(new { error = "No employee found in this branch" });
                }
            }

            // Use a simpler approach - execute SELECT MAX(InvoiceID) after INSERT within transaction
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                await _context.Database.ExecuteSqlRawAsync(@"
                    INSERT INTO Invoice (BranchID, CustomerID, EmployeeID, PetID, InvoiceDate, TotalAmount, DiscountAmount, PaymentMethod, Status)
                    VALUES ({0}, {1}, {2}, {3}, {4}, {5}, {6}, {7}, {8})",
                    new object?[] {
                        dto.BranchId ?? 0,
                        dto.CustomerId ?? 0, 
                        employeeId,
                        (object?)dto.PetId,
                        invoiceDate,
                        1.00m,
                        dto.DiscountAmount ?? 0,
                        paymentMethod ?? "CASH",
                        status ?? "Pending"
                    }.Cast<object>().ToArray());

                // Get the last inserted InvoiceID from database
                var lastInvoice = await _context.Invoices
                    .OrderByDescending(i => i.InvoiceId)
                    .FirstOrDefaultAsync();
                
                int invoiceId = lastInvoice?.InvoiceId ?? 0;
                
                if (invoiceId <= 0)
                {
                    await transaction.RollbackAsync();
                    return BadRequest(new { error = "Failed to create invoice - could not retrieve ID" });
                }

            // Add invoice items if provided
            if (dto.Items != null && dto.Items.Count > 0)
            {
                foreach (var item in dto.Items)
                {
                    // Check if this item already exists (prevent duplicates)
                    var existingItem = await _context.InvoiceItems
                        .Where(ii => ii.InvoiceId == invoiceId
                            && ii.ProductId == item.ProductId
                            && ii.ServiceId == item.ServiceId
                            && ii.ItemType == (item.ItemType ?? "PRODUCT")
                            && ii.Quantity == (item.Quantity ?? 1)
                            && ii.UnitPrice == (item.UnitPrice ?? 0))
                        .FirstOrDefaultAsync();
                    
                    if (existingItem != null)
                    {
                        // Item already exists, skip or update if needed
                        continue;
                    }

                    await _context.Database.ExecuteSqlRawAsync(@"
                        INSERT INTO InvoiceItem (InvoiceID, ProductID, ServiceID, ItemType, Quantity, UnitPrice)
                        VALUES ({0}, {1}, {2}, {3}, {4}, {5})",
                        new object?[] {
                            invoiceId,
                            (object?)item.ProductId,
                            (object?)item.ServiceId,
                            item.ItemType ?? "PRODUCT",
                            item.Quantity ?? 1,
                            item.UnitPrice ?? 0
                        }.Cast<object>().ToArray());
                }
            }

            await transaction.CommitAsync();

            // Fetch the created invoice with all related data
            var createdInvoice = await _context.Invoices
                .Include(i => i.Customer)
                .Include(i => i.Branch)
                .Include(i => i.InvoiceItems)
                    .ThenInclude(ii => ii.Product)
                .Include(i => i.InvoiceItems)
                    .ThenInclude(ii => ii.Service)
                .FirstOrDefaultAsync(i => i.InvoiceId == invoiceId);

            if (createdInvoice == null)
                return BadRequest(new { error = "Could not retrieve created invoice" });

            var mappedResult = _mapper.Map<InvoiceDto>(createdInvoice);
            return CreatedAtAction(nameof(Get), new { id = invoiceId }, mappedResult);
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error creating invoice: {ex.Message}\n{ex.StackTrace}");
            return BadRequest(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Updates an invoice.
    /// </summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> Put(int id, InvoiceDto dto)
    {
        var entity = await _context.Invoices.FindAsync(id);
        if (entity == null) return NotFound();

        // Only update specific fields
        if (dto.PaymentMethod != null)
            entity.PaymentMethod = dto.PaymentMethod;
        
        if (dto.Status != null)
            entity.Status = dto.Status;

        if (dto.DiscountAmount.HasValue)
            entity.DiscountAmount = dto.DiscountAmount.Value;

        _context.Entry(entity).State = EntityState.Modified;
        try { await _context.SaveChangesAsync(); }
        catch (DbUpdateConcurrencyException)
        {
            if (!_context.Invoices.Any(x => x.InvoiceId == id)) return NotFound();
            throw;
        }
        return NoContent();
    }

    /// <summary>
    /// Deletes an invoice.
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var e = await _context.Invoices.FindAsync(id);
        if (e == null) return NotFound();
        
        // Delete related LoyaltyTransaction records first
        await _context.Database.ExecuteSqlInterpolatedAsync($"DELETE FROM LoyaltyTransaction WHERE InvoiceID = {id}");
        
        _context.Invoices.Remove(e);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    /// <summary>
    /// Updates invoice status.
    /// </summary>
    [HttpPut("{id}/status")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateStatusRequest request)
    {
        try
        {
            var invoice = await _context.Invoices.FindAsync(id);
            if (invoice == null)
                return NotFound();

            // Validate status value
            var validStatuses = new[] { "Pending", "Processing", "Paid", "Cancelled" };
            if (!validStatuses.Contains(request.Status))
                return BadRequest(new { message = $"Invalid status. Must be one of: {string.Join(", ", validStatuses)}" });

            invoice.Status = request.Status;
            _context.Invoices.Update(invoice);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Status updated successfully", status = invoice.Status });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error updating status", error = ex.InnerException?.Message ?? ex.Message });
        }
    }
}

public class UpdateStatusRequest
{
    public string Status { get; set; } = null!;
}

