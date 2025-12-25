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
/// API endpoints for managing invoice items.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class InvoiceItemsController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;

    /// <summary>
    /// Initializes a new instance of <see cref="InvoiceItemsController"/>.
    /// </summary>
    public InvoiceItemsController(ApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    /// <summary>
    /// Returns all invoice items.
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<InvoiceItemDto>>> Get()
    {
        var list = await _context.InvoiceItems.ToListAsync();
        return _mapper.Map<List<InvoiceItemDto>>(list);
    }

    /// <summary>
    /// Gets an invoice item by id.
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<InvoiceItemDto>> Get(int id)
    {
        var e = await _context.InvoiceItems.FindAsync(id);
        if (e == null) return NotFound();
        return _mapper.Map<InvoiceItemDto>(e);
    }

    /// <summary>
    /// Creates an invoice item.
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<InvoiceItemDto>> Post(InvoiceItemDto dto)
    {
        var entity = _mapper.Map<InvoiceItem>(dto);
        _context.InvoiceItems.Add(entity);
        await _context.SaveChangesAsync();
        var result = _mapper.Map<InvoiceItemDto>(entity);
        return CreatedAtAction(nameof(Get), new { id = entity.InvoiceItemId }, result);
    }

    /// <summary>
    /// Updates an invoice item.
    /// </summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> Put(int id, InvoiceItemDto dto)
    {
        if (id != dto.InvoiceItemId) return BadRequest();
        var entity = _mapper.Map<InvoiceItem>(dto);
        _context.Entry(entity).State = EntityState.Modified;
        try { await _context.SaveChangesAsync(); }
        catch (DbUpdateConcurrencyException)
        {
            if (!_context.InvoiceItems.Any(x => x.InvoiceItemId == id)) return NotFound();
            throw;
        }
        return NoContent();
    }

    /// <summary>
    /// Deletes an invoice item.
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var e = await _context.InvoiceItems.FindAsync(id);
        if (e == null) return NotFound();
        _context.InvoiceItems.Remove(e);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
