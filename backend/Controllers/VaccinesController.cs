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
/// API endpoints for managing vaccines.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class VaccinesController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;
    /// <summary>
    /// Initializes a new instance of <see cref="VaccinesController"/>.
    /// </summary>
    public VaccinesController(ApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    /// <summary>
    /// Returns paginated vaccines.
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<PaginatedResult<VaccineDto>>> Get([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        if (page <= 0) page = 1;
        if (pageSize <= 0) pageSize = 20;
        var q = _context.Vaccines.AsQueryable();
        var total = await q.CountAsync();
        var items = await q.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();
        var dtos = _mapper.Map<List<VaccineDto>>(items);
        return new PaginatedResult<VaccineDto> { Items = dtos, TotalCount = total, Page = page, PageSize = pageSize };
    }

    /// <summary>
    /// Gets a vaccine by id.
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<VaccineDto>> Get(int id)
    {
        var e = await _context.Vaccines.FindAsync(id);
        if (e == null) return NotFound();
        return _mapper.Map<VaccineDto>(e);
    }

    /// <summary>
    /// Creates a vaccine.
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<VaccineDto>> Post(VaccineDto dto)
    {
        var entity = _mapper.Map<Vaccine>(dto);
        _context.Vaccines.Add(entity);
        await _context.SaveChangesAsync();
        var result = _mapper.Map<VaccineDto>(entity);
        return CreatedAtAction(nameof(Get), new { id = entity.VaccineId }, result);
    }

    /// <summary>
    /// Updates a vaccine.
    /// </summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> Put(int id, VaccineDto dto)
    {
        if (id != dto.VaccineId) return BadRequest();
        var entity = _mapper.Map<Vaccine>(dto);
        _context.Entry(entity).State = EntityState.Modified;
        try { await _context.SaveChangesAsync(); }
        catch (DbUpdateConcurrencyException)
        {
            if (!_context.Vaccines.Any(x => x.VaccineId == id)) return NotFound();
            throw;
        }
        return NoContent();
    }

    /// <summary>
    /// Deletes a vaccine.
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var e = await _context.Vaccines.FindAsync(id);
        if (e == null) return NotFound();
        _context.Vaccines.Remove(e);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
