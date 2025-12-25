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
/// API endpoints for branch management.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class BranchesController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;
    /// <summary>
    /// Initializes a new instance of <see cref="BranchesController"/>.
    /// </summary>
    public BranchesController(ApplicationDbContext context, IMapper mapper) { _context = context; _mapper = mapper; }

    /// <summary>
    /// Returns all branches.
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<BranchDto>>> Get()
    {
        var list = await _context.Branches.ToListAsync();
        return _mapper.Map<List<BranchDto>>(list);
    }

    /// <summary>
    /// Gets branch by id.
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<BranchDto>> Get(int id)
    {
        var e = await _context.Branches.FindAsync(id);
        if (e == null) return NotFound();
        return _mapper.Map<BranchDto>(e);
    }

    /// <summary>
    /// Creates a new branch.
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<BranchDto>> Post(BranchDto dto)
    {
        var entity = _mapper.Map<Branch>(dto);
        _context.Branches.Add(entity);
        await _context.SaveChangesAsync();
        var result = _mapper.Map<BranchDto>(entity);
        return CreatedAtAction(nameof(Get), new { id = entity.BranchId }, result);
    }

    /// <summary>
    /// Updates a branch.
    /// </summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> Put(int id, BranchDto dto)
    {
        if (id != dto.BranchId) return BadRequest();
        var entity = _mapper.Map<Branch>(dto);
        _context.Entry(entity).State = EntityState.Modified;
        try { await _context.SaveChangesAsync(); }
        catch (DbUpdateConcurrencyException)
        {
            if (!_context.Branches.Any(x => x.BranchId == id)) return NotFound();
            throw;
        }
        return NoContent();
    }

    /// <summary>
    /// Deletes a branch.
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var e = await _context.Branches.FindAsync(id);
        if (e == null) return NotFound();
        _context.Branches.Remove(e);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
