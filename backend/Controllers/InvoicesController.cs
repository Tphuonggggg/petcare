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
    public async Task<ActionResult<PaginatedResult<InvoiceDto>>> Get([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        if (page <= 0) page = 1;
        if (pageSize <= 0) pageSize = 20;
        var q = _context.Invoices.AsQueryable();
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
        var e = await _context.Invoices.FindAsync(id);
        if (e == null) return NotFound();
        return _mapper.Map<InvoiceDto>(e);
    }

    /// <summary>
    /// Creates an invoice.
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<InvoiceDto>> Post(InvoiceDto dto)
    {
        var entity = _mapper.Map<Invoice>(dto);
        _context.Invoices.Add(entity);
        await _context.SaveChangesAsync();
        var result = _mapper.Map<InvoiceDto>(entity);
        return CreatedAtAction(nameof(Get), new { id = entity.InvoiceId }, result);
    }

    /// <summary>
    /// Updates an invoice.
    /// </summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> Put(int id, InvoiceDto dto)
    {
        if (id != dto.InvoiceId) return BadRequest();
        var entity = _mapper.Map<Invoice>(dto);
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
        _context.Invoices.Remove(e);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
