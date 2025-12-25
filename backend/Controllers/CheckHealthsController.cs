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
/// API endpoints for pet health checks.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class CheckHealthsController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;
    /// <summary>
    /// Initializes a new instance of <see cref="CheckHealthsController"/>.
    /// </summary>
    public CheckHealthsController(ApplicationDbContext context, IMapper mapper) { _context = context; _mapper = mapper; }

    /// <summary>
    /// Returns all health check records.
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<CheckHealthDto>>> Get()
    {
        var list = await _context.CheckHealths.ToListAsync();
        return _mapper.Map<List<CheckHealthDto>>(list);
    }

    /// <summary>
    /// Gets a health check record by id.
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<CheckHealthDto>> Get(int id)
    {
        var e = await _context.CheckHealths.FindAsync(id);
        if (e == null) return NotFound();
        return _mapper.Map<CheckHealthDto>(e);
    }

    /// <summary>
    /// Creates a health check record.
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<CheckHealthDto>> Post(CheckHealthDto dto)
    {
        var entity = _mapper.Map<CheckHealth>(dto);
        _context.CheckHealths.Add(entity);
        await _context.SaveChangesAsync();
        var result = _mapper.Map<CheckHealthDto>(entity);
        return CreatedAtAction(nameof(Get), new { id = entity.CheckId }, result);
    }

    /// <summary>
    /// Updates a health check record.
    /// </summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> Put(int id, CheckHealthDto dto)
    {
        if (id != dto.CheckId) return BadRequest();
        var entity = _mapper.Map<CheckHealth>(dto);
        _context.Entry(entity).State = EntityState.Modified;
        try { await _context.SaveChangesAsync(); }
        catch (DbUpdateConcurrencyException)
        {
            if (!_context.CheckHealths.Any(x => x.CheckId == id)) return NotFound();
            throw;
        }
        return NoContent();
    }

    /// <summary>
    /// Deletes a health check record.
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var e = await _context.CheckHealths.FindAsync(id);
        if (e == null) return NotFound();
        _context.CheckHealths.Remove(e);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
