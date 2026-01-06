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
    public async Task<ActionResult<PaginatedResult<InvoiceDto>>> Get([FromQuery] int page = 1, [FromQuery] int pageSize = 20, [FromQuery] int? branchId = null)
    {
        if (page <= 0) page = 1;
        if (pageSize <= 0) pageSize = 20;
        var q = _context.Invoices.Include(i => i.Branch).Include(i => i.Customer).AsQueryable();
        
        // Filter by branch if provided
        if (branchId.HasValue)
        {
            q = q.Where(i => i.BranchId == branchId.Value);
        }
        
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
            // Lưu ngày hôm nay (chỉ date, không time) hoặc dùng ngày từ DTO
            var invoiceDate = dto.InvoiceDate ?? DateTime.UtcNow.Date;
            var paymentMethod = dto.PaymentMethod ?? "CASH";
            var status = dto.Status ?? "Pending";

            var parameters = new[]
            {
                new SqlParameter("@BranchId", dto.BranchId ?? 0),
                new SqlParameter("@CustomerId", dto.CustomerId ?? 0),
                new SqlParameter("@EmployeeId", dto.EmployeeId ?? 0),
                new SqlParameter("@PetId", dto.PetId ?? (object)DBNull.Value),
                new SqlParameter("@InvoiceDate", invoiceDate),
                new SqlParameter("@TotalAmount", 0), // Let trigger calculate TotalAmount from InvoiceItems
                new SqlParameter("@DiscountAmount", dto.DiscountAmount ?? 0),
                new SqlParameter("@FinalAmount", dto.FinalAmount ?? 0),
                new SqlParameter("@PaymentMethod", paymentMethod),
                new SqlParameter("@Status", status)
            };

            var sql = @"
                INSERT INTO Invoice 
                (BranchId, CustomerId, EmployeeId, PetId, InvoiceDate, TotalAmount, DiscountAmount, PaymentMethod, Status)
                VALUES 
                (@BranchId, @CustomerId, @EmployeeId, @PetId, @InvoiceDate, @TotalAmount, @DiscountAmount, @PaymentMethod, @Status);
                
                SELECT CAST(SCOPE_IDENTITY() as int);";

            var invoiceId = _context.Database.SqlQueryRaw<int>(sql, parameters).AsEnumerable().FirstOrDefault();

            if (invoiceId <= 0)
            {
                return BadRequest(new { error = "Failed to create invoice" });
            }

            // Add invoice items if provided
            if (dto.Items != null && dto.Items.Count > 0)
            {
                foreach (var item in dto.Items)
                {
                    var itemParams = new[]
                    {
                        new SqlParameter("@InvoiceId", invoiceId),
                        new SqlParameter("@ProductId", item.ProductId ?? (object)DBNull.Value),
                        new SqlParameter("@ServiceId", item.ServiceId ?? (object)DBNull.Value),
                        new SqlParameter("@ItemType", item.ItemType ?? "PRODUCT"),
                        new SqlParameter("@Quantity", item.Quantity ?? 1),
                        new SqlParameter("@UnitPrice", item.UnitPrice ?? 0)
                    };

                    var itemSql = @"
                        INSERT INTO InvoiceItem 
                        (InvoiceId, ProductId, ServiceId, ItemType, Quantity, UnitPrice)
                        VALUES 
                        (@InvoiceId, @ProductId, @ServiceId, @ItemType, @Quantity, @UnitPrice)";
                    
                    await _context.Database.ExecuteSqlRawAsync(itemSql, itemParams);
                }
            }

            // Fetch the created invoice
            var createdInvoice = await _context.Invoices
                .Include(i => i.Customer)
                .Include(i => i.Branch)
                .FirstOrDefaultAsync(i => i.InvoiceId == invoiceId);

            if (createdInvoice == null)
                return BadRequest(new { error = "Could not retrieve created invoice" });

            var mappedResult = _mapper.Map<InvoiceDto>(createdInvoice);
            return CreatedAtAction(nameof(Get), new { id = invoiceId }, mappedResult);
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
        var invoice = await _context.Invoices.FindAsync(id);
        if (invoice == null)
            return NotFound();

        invoice.Status = request.Status;
        _context.Invoices.Update(invoice);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Status updated successfully", status = invoice.Status });
    }
}

public class UpdateStatusRequest
{
    public string Status { get; set; }
}

