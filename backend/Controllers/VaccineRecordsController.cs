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
/// API endpoints for managing vaccine records.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class VaccineRecordsController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;
    /// <summary>
    /// Initializes a new instance of <see cref="VaccineRecordsController"/>.
    /// </summary>
    public VaccineRecordsController(ApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    /// <summary>
    /// Returns all vaccine records.
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<VaccineRecordDto>>> Get()
    {
        var list = await _context.VaccineRecords.ToListAsync();
        return _mapper.Map<List<VaccineRecordDto>>(list);
    }

    /// <summary>
    /// Gets a vaccine record by id.
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<VaccineRecordDto>> Get(int id)
    {
        var e = await _context.VaccineRecords.FindAsync(id);
        if (e == null) return NotFound();
        return _mapper.Map<VaccineRecordDto>(e);
    }

    /// <summary>
    /// Creates a vaccine record.
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<VaccineRecordDto>> Post(VaccineRecordDto dto)
    {
        var entity = _mapper.Map<VaccineRecord>(dto);
        _context.VaccineRecords.Add(entity);
        await _context.SaveChangesAsync();
        var result = _mapper.Map<VaccineRecordDto>(entity);
        return CreatedAtAction(nameof(Get), new { id = entity.VaccinationRecordId }, result);
    }

    /// <summary>
    /// Updates a vaccine record.
    /// </summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> Put(int id, VaccineRecordDto dto)
    {
        if (id != dto.VaccinationRecordId) return BadRequest();
        var entity = _mapper.Map<VaccineRecord>(dto);
        _context.Entry(entity).State = EntityState.Modified;
        try { await _context.SaveChangesAsync(); }
        catch (DbUpdateConcurrencyException)
        {
            if (!_context.VaccineRecords.Any(x => x.VaccinationRecordId == id)) return NotFound();
            throw;
        }
        return NoContent();
    }

    /// <summary>
    /// Deletes a vaccine record.
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var e = await _context.VaccineRecords.FindAsync(id);
        if (e == null) return NotFound();
        _context.VaccineRecords.Remove(e);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
