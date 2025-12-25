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
/// API endpoints for managing vaccine package items.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class VaccinePackageItemsController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;
    /// <summary>
    /// Initializes a new instance of <see cref="VaccinePackageItemsController"/>.
    /// </summary>
    public VaccinePackageItemsController(ApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    /// <summary>
    /// Returns all vaccine package items.
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<VaccinePackageItemDto>>> Get()
    {
        var list = await _context.VaccinePackageItems.ToListAsync();
        return _mapper.Map<List<VaccinePackageItemDto>>(list);
    }

    /// <summary>
    /// Gets a vaccine package item by composite id.
    /// </summary>
    [HttpGet("{packageId}/{vaccineId}")]
    public async Task<ActionResult<VaccinePackageItemDto>> Get(int packageId, int vaccineId)
    {
        var e = await _context.VaccinePackageItems.FindAsync(packageId, vaccineId);
        if (e == null) return NotFound();
        return _mapper.Map<VaccinePackageItemDto>(e);
    }

    /// <summary>
    /// Creates a vaccine package item.
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<VaccinePackageItemDto>> Post(VaccinePackageItemDto dto)
    {
        var entity = _mapper.Map<VaccinePackageItem>(dto);
        _context.VaccinePackageItems.Add(entity);
        await _context.SaveChangesAsync();
        var result = _mapper.Map<VaccinePackageItemDto>(entity);
        return CreatedAtAction(nameof(Get), new { packageId = entity.PackageId, vaccineId = entity.VaccineId }, result);
    }

    /// <summary>
    /// Updates a vaccine package item.
    /// </summary>
    [HttpPut("{packageId}/{vaccineId}")]
    public async Task<IActionResult> Put(int packageId, int vaccineId, VaccinePackageItemDto dto)
    {
        if (packageId != dto.PackageId || vaccineId != dto.VaccineId) return BadRequest();
        var entity = _mapper.Map<VaccinePackageItem>(dto);
        _context.Entry(entity).State = EntityState.Modified;
        try { await _context.SaveChangesAsync(); }
        catch (DbUpdateConcurrencyException)
        {
            if (!await _context.VaccinePackageItems.AnyAsync(x => x.PackageId == packageId && x.VaccineId == vaccineId)) return NotFound();
            throw;
        }
        return NoContent();
    }

    /// <summary>
    /// Deletes a vaccine package item.
    /// </summary>
    [HttpDelete("{packageId}/{vaccineId}")]
    public async Task<IActionResult> Delete(int packageId, int vaccineId)
    {
        var e = await _context.VaccinePackageItems.FindAsync(packageId, vaccineId);
        if (e == null) return NotFound();
        _context.VaccinePackageItems.Remove(e);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
