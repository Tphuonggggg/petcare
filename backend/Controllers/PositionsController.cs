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
/// API endpoints for managing employee positions.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class PositionsController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;

    /// <summary>
    /// Initializes a new instance of <see cref="PositionsController"/>.
    /// </summary>
    public PositionsController(ApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    /// <summary>
    /// Returns paginated positions.
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<PaginatedResult<PositionDto>>> Get([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        if (page <= 0) page = 1;
        if (pageSize <= 0) pageSize = 20;
        var q = _context.Positions.AsQueryable();
        var total = await q.CountAsync();
        var items = await q.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();
        var dtos = _mapper.Map<List<PositionDto>>(items);
        return new PaginatedResult<PositionDto> { Items = dtos, TotalCount = total, Page = page, PageSize = pageSize };
    }

    /// <summary>
    /// Gets a position by id.
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<PositionDto>> Get(int id)
    {
        var e = await _context.Positions.FindAsync(id);
        if (e == null) return NotFound();
        return _mapper.Map<PositionDto>(e);
    }

    /// <summary>
    /// Creates a new position.
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<PositionDto>> Post(PositionDto dto)
    {
        var entity = _mapper.Map<Position>(dto);
        _context.Positions.Add(entity);
        await _context.SaveChangesAsync();
        var resultDto = _mapper.Map<PositionDto>(entity);
        return CreatedAtAction(nameof(Get), new { id = entity.PositionId }, resultDto);
    }

    /// <summary>
    /// Updates a position.
    /// </summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> Put(int id, PositionDto dto)
    {
        if (id != dto.PositionId) return BadRequest();
        var entity = _mapper.Map<Position>(dto);
        _context.Entry(entity).State = EntityState.Modified;
        try { await _context.SaveChangesAsync(); }
        catch (DbUpdateConcurrencyException)
        {
            if (!_context.Positions.Any(x => x.PositionId == id)) return NotFound();
            throw;
        }
        return NoContent();
    }

    /// <summary>
    /// Deletes a position.
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var e = await _context.Positions.FindAsync(id);
        if (e == null) return NotFound();
        _context.Positions.Remove(e);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
