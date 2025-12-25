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
/// API endpoints for managing vaccine packages.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class VaccinePackagesController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;
    /// <summary>
    /// Initializes a new instance of <see cref="VaccinePackagesController"/>.
    /// </summary>
    public VaccinePackagesController(ApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    /// <summary>
    /// Returns all vaccine packages.
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<VaccinePackageDto>>> Get()
    {
        var entities = await _context.VaccinePackages.ToListAsync();
        return _mapper.Map<List<VaccinePackageDto>>(entities);
    }

    /// <summary>
    /// Gets a vaccine package by id.
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<VaccinePackageDto>> Get(int id)
    {
        var e = await _context.VaccinePackages.FindAsync(id);
        if (e == null) return NotFound();
        return _mapper.Map<VaccinePackageDto>(e);
    }

    /// <summary>
    /// Creates a vaccine package.
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<VaccinePackageDto>> Post(VaccinePackageDto dto)
    {
        var entity = _mapper.Map<VaccinePackage>(dto);
        _context.VaccinePackages.Add(entity);
        await _context.SaveChangesAsync();
        var result = _mapper.Map<VaccinePackageDto>(entity);
        return CreatedAtAction(nameof(Get), new { id = entity.PackageId }, result);
    }

    /// <summary>
    /// Updates a vaccine package.
    /// </summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> Put(int id, VaccinePackageDto dto)
    {
        if (id != dto.PackageId) return BadRequest();
        var entity = _mapper.Map<VaccinePackage>(dto);
        _context.Entry(entity).State = EntityState.Modified;
        try { await _context.SaveChangesAsync(); }
        catch (DbUpdateConcurrencyException)
        {
            if (!_context.VaccinePackages.Any(x => x.PackageId == id)) return NotFound();
            throw;
        }
        return NoContent();
    }

    /// <summary>
    /// Deletes a vaccine package.
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var e = await _context.VaccinePackages.FindAsync(id);
        if (e == null) return NotFound();
        _context.VaccinePackages.Remove(e);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
