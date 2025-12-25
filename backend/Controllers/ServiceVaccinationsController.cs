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
/// API endpoints for service vaccinations.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class ServiceVaccinationsController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;
    /// <summary>
    /// Initializes a new instance of <see cref="ServiceVaccinationsController"/>.
    /// </summary>
    public ServiceVaccinationsController(ApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    /// <summary>
    /// Returns all service vaccination records.
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<ServiceVaccinationDto>>> Get()
    {
        var list = await _context.ServiceVaccinations.ToListAsync();
        return _mapper.Map<List<ServiceVaccinationDto>>(list);
    }

    /// <summary>
    /// Gets a service vaccination record by id.
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<ServiceVaccinationDto>> Get(int id)
    {
        var e = await _context.ServiceVaccinations.FindAsync(id);
        if (e == null) return NotFound();
        return _mapper.Map<ServiceVaccinationDto>(e);
    }

    /// <summary>
    /// Creates a service vaccination record.
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<ServiceVaccinationDto>> Post(ServiceVaccinationDto dto)
    {
        var entity = _mapper.Map<ServiceVaccination>(dto);
        _context.ServiceVaccinations.Add(entity);
        await _context.SaveChangesAsync();
        var result = _mapper.Map<ServiceVaccinationDto>(entity);
        return CreatedAtAction(nameof(Get), new { id = entity.VaccinationId }, result);
    }

    /// <summary>
    /// Updates a service vaccination record.
    /// </summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> Put(int id, ServiceVaccinationDto dto)
    {
        if (id != dto.VaccinationId) return BadRequest();
        var entity = _mapper.Map<ServiceVaccination>(dto);
        _context.Entry(entity).State = EntityState.Modified;
        try { await _context.SaveChangesAsync(); }
        catch (DbUpdateConcurrencyException)
        {
            if (!_context.ServiceVaccinations.Any(x => x.VaccinationId == id)) return NotFound();
            throw;
        }
        return NoContent();
    }

    /// <summary>
    /// Deletes a service vaccination record.
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var e = await _context.ServiceVaccinations.FindAsync(id);
        if (e == null) return NotFound();
        _context.ServiceVaccinations.Remove(e);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
