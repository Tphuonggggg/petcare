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
/// API endpoints for managing pets.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class PetsController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;
    /// <summary>
    /// Initializes a new instance of <see cref="PetsController"/>.
    /// </summary>
    public PetsController(ApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    /// <summary>
    /// Returns paginated pets.
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<PaginatedResult<PetDto>>> Get([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        if (page <= 0) page = 1;
        if (pageSize <= 0) pageSize = 20;
        var q = _context.Pets.AsQueryable();
        var total = await q.CountAsync();
        var items = await q.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();
        var dtos = _mapper.Map<List<PetDto>>(items);
        return new PaginatedResult<PetDto> { Items = dtos, TotalCount = total, Page = page, PageSize = pageSize };
    }

    /// <summary>
    /// Gets a pet by id.
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<PetDto>> Get(int id)
    {
        var e = await _context.Pets.FindAsync(id);
        if (e == null) return NotFound();
        return _mapper.Map<PetDto>(e);
    }

    /// <summary>
    /// Creates a pet.
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<PetDto>> Post(PetDto dto)
    {
        var entity = _mapper.Map<Pet>(dto);
        _context.Pets.Add(entity);
        await _context.SaveChangesAsync();
        var result = _mapper.Map<PetDto>(entity);
        return CreatedAtAction(nameof(Get), new { id = entity.PetId }, result);
    }

    /// <summary>
    /// Updates a pet.
    /// </summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> Put(int id, PetDto dto)
    {
        if (id != dto.PetId) return BadRequest();
        var entity = _mapper.Map<Pet>(dto);
        _context.Entry(entity).State = EntityState.Modified;
        try { await _context.SaveChangesAsync(); }
        catch (DbUpdateConcurrencyException)
        {
            if (!_context.Pets.Any(x => x.PetId == id)) return NotFound();
            throw;
        }
        return NoContent();
    }

    /// <summary>
    /// Deletes a pet.
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var e = await _context.Pets.FindAsync(id);
        if (e == null) return NotFound();
        _context.Pets.Remove(e);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
