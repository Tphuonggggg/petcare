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
/// API endpoints for managing services.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class ServicesController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;
    /// <summary>
    /// Initializes a new instance of <see cref="ServicesController"/>.
    /// </summary>
    public ServicesController(ApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    /// <summary>
    /// Returns paginated services.
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<PaginatedResult<ServiceDto>>> Get([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        if (page <= 0) page = 1;
        if (pageSize <= 0) pageSize = 20;
        var q = _context.Services.AsQueryable();
        var total = await q.CountAsync();
        var items = await q.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();
        var dtos = _mapper.Map<List<ServiceDto>>(items);
        return new PaginatedResult<ServiceDto> { Items = dtos, TotalCount = total, Page = page, PageSize = pageSize };
    }

    /// <summary>
    /// Gets a service by id.
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<ServiceDto>> Get(int id)
    {
        var e = await _context.Services.FindAsync(id);
        if (e == null) return NotFound();
        return _mapper.Map<ServiceDto>(e);
    }

    /// <summary>
    /// Creates a service.
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<ServiceDto>> Post(ServiceDto dto)
    {
        var entity = _mapper.Map<Service>(dto);
        _context.Services.Add(entity);
        await _context.SaveChangesAsync();
        var result = _mapper.Map<ServiceDto>(entity);
        return CreatedAtAction(nameof(Get), new { id = entity.ServiceId }, result);
    }

    /// <summary>
    /// Updates a service.
    /// </summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> Put(int id, ServiceDto dto)
    {
        if (id != dto.ServiceId) return BadRequest();
        var entity = _mapper.Map<Service>(dto);
        _context.Entry(entity).State = EntityState.Modified;
        try { await _context.SaveChangesAsync(); }
        catch (DbUpdateConcurrencyException)
        {
            if (!_context.Services.Any(x => x.ServiceId == id)) return NotFound();
            throw;
        }
        return NoContent();
    }

    /// <summary>
    /// Deletes a service.
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var e = await _context.Services.FindAsync(id);
        if (e == null) return NotFound();
        _context.Services.Remove(e);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
