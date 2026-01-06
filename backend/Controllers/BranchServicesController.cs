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
/// API endpoints for branch-specific services.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class BranchServicesController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;
    /// <summary>
    /// Initializes a new instance of <see cref="BranchServicesController"/>.
    /// </summary>
    public BranchServicesController(ApplicationDbContext context, IMapper mapper) { _context = context; _mapper = mapper; }

    /// <summary>
    /// Returns paginated branch services.
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<PaginatedResult<BranchServiceDto>>> Get([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        if (page <= 0) page = 1;
        if (pageSize <= 0) pageSize = 20;
        var q = _context.BranchServices.AsQueryable();
        var total = await q.CountAsync();
        var items = await q.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();
        var dtos = _mapper.Map<List<BranchServiceDto>>(items);
        return new PaginatedResult<BranchServiceDto> { Items = dtos, TotalCount = total, Page = page, PageSize = pageSize };
    }

    /// <summary>
    /// Gets a branch service by composite id.
    /// </summary>
    [HttpGet("{branchId}/{serviceId}")]
    public async Task<ActionResult<BranchServiceDto>> GetById(int branchId, int serviceId)
    {
        var e = await _context.BranchServices.FindAsync(branchId, serviceId);
        if (e == null) return NotFound();
        return _mapper.Map<BranchServiceDto>(e);
    }

    /// <summary>
    /// Creates a branch service entry.
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<BranchServiceDto>> Post(BranchServiceDto dto)
    {
        var entity = _mapper.Map<BranchService>(dto);
        _context.BranchServices.Add(entity);
        await _context.SaveChangesAsync();
        var result = _mapper.Map<BranchServiceDto>(entity);
        return CreatedAtAction(nameof(GetById), new { branchId = entity.BranchId, serviceId = entity.ServiceId }, result);
    }

    /// <summary>
    /// Updates a branch service entry.
    /// </summary>
    [HttpPut("{branchId}/{serviceId}")]
    public async Task<IActionResult> Put(int branchId, int serviceId, BranchServiceDto dto)
    {
        if (branchId != dto.BranchId || serviceId != dto.ServiceId) return BadRequest();
        var entity = _mapper.Map<BranchService>(dto);
        _context.Entry(entity).State = EntityState.Modified;
        try { await _context.SaveChangesAsync(); }
        catch (DbUpdateConcurrencyException)
        {
            if (!await _context.BranchServices.AnyAsync(x => x.BranchId == branchId && x.ServiceId == serviceId)) return NotFound();
            throw;
        }
        return NoContent();
    }

    /// <summary>
    /// Deletes a branch service entry.
    /// </summary>
    [HttpDelete("{branchId}/{serviceId}")]
    public async Task<IActionResult> Delete(int branchId, int serviceId)
    {
        var e = await _context.BranchServices.FindAsync(branchId, serviceId);
        if (e == null) return NotFound();
        _context.BranchServices.Remove(e);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
