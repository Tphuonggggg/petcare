using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PetCareX.Api.Data;
using PetCareX.Api.Models;
using PetCareX.Api.Dtos;
using AutoMapper;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PetCareX.Api.Controllers;

/// <summary>
/// API endpoints for customer management.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class CustomersController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;

    /// <summary>
    /// Initializes a new instance of <see cref="CustomersController"/>.
    /// </summary>
    public CustomersController(ApplicationDbContext context, AutoMapper.IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    /// <summary>
    /// Returns paginated customers.
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<PaginatedResult<CustomerDto>>> Get([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        if (page <= 0) page = 1;
        if (pageSize <= 0) pageSize = 20;
        var q = _context.Customers.AsQueryable();
        var total = await q.CountAsync();
        var items = await q.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();
        var dtos = _mapper.Map<List<CustomerDto>>(items);
        return new PaginatedResult<CustomerDto> { Items = dtos, TotalCount = total, Page = page, PageSize = pageSize };
    }

    /// <summary>
    /// Gets a customer by id.
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<CustomerDto>> Get(int id)
    {
        var item = await _context.Customers.FindAsync(id);
        if (item == null) return NotFound();
        return _mapper.Map<CustomerDto>(item);
    }

    /// <summary>
    /// Creates a customer.
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<CustomerDto>> Post(CustomerDto dto)
    {
        var entity = _mapper.Map<Customer>(dto);
        // Use provided MembershipTierId when present; otherwise fallback to first tier if available
        if (dto.MembershipTierId.HasValue)
        {
            entity.MembershipTierId = dto.MembershipTierId.Value;
        }
        else
        {
            try
            {
                var any = await _context.MembershipTiers.OrderBy(t => t.MembershipTierId).FirstOrDefaultAsync();
                if (any != null) entity.MembershipTierId = any.MembershipTierId;
            }
            catch
            {
                // ignore, let DB defaults or constraints surface
            }
        }

        _context.Customers.Add(entity);
        try
        {
            await _context.SaveChangesAsync();
            var result = _mapper.Map<CustomerDto>(entity);
            return CreatedAtAction(nameof(Get), new { id = entity.CustomerId }, result);
        }
        catch (DbUpdateException dbEx)
        {
            var detail = dbEx.InnerException?.Message ?? dbEx.Message;
            return Problem(detail: detail, title: "Database insert error");
        }
        catch (System.Exception ex)
        {
            return Problem(detail: ex.Message, title: "Unhandled error");
        }
    }

    /// <summary>
    /// Updates a customer.
    /// </summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> Put(int id, CustomerDto dto)
    {
        if (id != dto.CustomerId) return BadRequest();

        var entity = await _context.Customers.FindAsync(id);
        if (entity == null) return NotFound();

        // Map incoming DTO onto the existing entity to preserve DB-only fields
        _mapper.Map(dto, entity);

        try
        {
            // Use raw UPDATE to avoid EF Core OUTPUT clause which conflicts with DB triggers.
            var setClauses = new List<string>();
            var sqlParams = new List<object>();
            int pi = 0;

            if (dto.FullName != null)
            {
                setClauses.Add($"FullName = @p{pi}");
                sqlParams.Add(dto.FullName);
                pi++;
            }
            if (dto.Phone != null)
            {
                setClauses.Add($"Phone = @p{pi}");
                sqlParams.Add(dto.Phone);
                pi++;
            }
            if (dto.Email != null)
            {
                setClauses.Add($"Email = @p{pi}");
                sqlParams.Add(dto.Email);
                pi++;
            }
            if (dto.Gender != null)
            {
                setClauses.Add($"Gender = @p{pi}");
                sqlParams.Add(dto.Gender);
                pi++;
            }
            if (dto.Cccd != null)
            {
                setClauses.Add($"CCCD = @p{pi}");
                sqlParams.Add(dto.Cccd);
                pi++;
            }
            if (dto.MembershipTierId.HasValue)
            {
                setClauses.Add($"MembershipTierID = @p{pi}");
                sqlParams.Add(dto.MembershipTierId.Value);
                pi++;
            }
            if (dto.BirthDate.HasValue)
            {
                setClauses.Add($"BirthDate = @p{pi}");
                sqlParams.Add(dto.BirthDate.Value.ToDateTime(System.TimeOnly.MinValue));
                pi++;
            }
            if (dto.MemberSince.HasValue)
            {
                setClauses.Add($"MemberSince = @p{pi}");
                sqlParams.Add(dto.MemberSince.Value.ToDateTime(System.TimeOnly.MinValue));
                pi++;
            }

            if (setClauses.Count > 0)
            {
                // add id param
                sqlParams.Add(id);
                var sql = $"UPDATE Customer SET {string.Join(", ", setClauses)} WHERE CustomerID = @p{pi}";
                await _context.Database.ExecuteSqlRawAsync(sql, sqlParams.ToArray());
            }
            // else nothing to update
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!CustomerExists(id)) return NotFound();
            throw;
        }
        catch (DbUpdateException dbEx)
        {
            // Return a ProblemDetails response with inner exception message when available
            var detail = dbEx.InnerException?.Message ?? dbEx.Message;
            return Problem(detail: detail, title: "Database update error");
        }
        catch (System.Exception ex)
        {
            return Problem(detail: ex.Message, title: "Unhandled error");
        }

        return NoContent();
    }

    /// <summary>
    /// Deletes a customer.
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var entity = await _context.Customers.FindAsync(id);
        if (entity == null) return NotFound();
        _context.Customers.Remove(entity);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    private bool CustomerExists(int id) => _context.Customers.Any(e => e.CustomerId == id);
}
