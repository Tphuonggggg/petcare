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
/// API endpoints for managing vaccine batches.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class VaccineBatchesController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;
    /// <summary>
    /// Initializes a new instance of <see cref="VaccineBatchesController"/>.
    /// </summary>
    public VaccineBatchesController(ApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    /// <summary>
    /// Returns all vaccine batches.
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<VaccineBatchDto>>> Get()
    {
        var list = await _context.VaccineBatches.ToListAsync();
        return _mapper.Map<List<VaccineBatchDto>>(list);
    }

    /// <summary>
    /// Gets a vaccine batch by id.
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<VaccineBatchDto>> Get(int id)
    {
        var e = await _context.VaccineBatches.FindAsync(id);
        if (e == null) return NotFound();
        return _mapper.Map<VaccineBatchDto>(e);
    }

    /// <summary>
    /// Creates a vaccine batch.
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<VaccineBatchDto>> Post(VaccineBatchDto dto)
    {
        var entity = _mapper.Map<VaccineBatch>(dto);
        _context.VaccineBatches.Add(entity);
        await _context.SaveChangesAsync();
        var result = _mapper.Map<VaccineBatchDto>(entity);
        return CreatedAtAction(nameof(Get), new { id = entity.BatchId }, result);
    }

    /// <summary>
    /// Updates a vaccine batch.
    /// </summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> Put(int id, VaccineBatchDto dto)
    {
        if (id != dto.BatchId) return BadRequest();
        var entity = _mapper.Map<VaccineBatch>(dto);
        _context.Entry(entity).State = EntityState.Modified;
        try { await _context.SaveChangesAsync(); }
        catch (DbUpdateConcurrencyException)
        {
            if (!_context.VaccineBatches.Any(x => x.BatchId == id)) return NotFound();
            throw;
        }
        return NoContent();
    }

    /// <summary>
    /// Deletes a vaccine batch.
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var e = await _context.VaccineBatches.FindAsync(id);
        if (e == null) return NotFound();
        _context.VaccineBatches.Remove(e);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
