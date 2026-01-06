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
/// API endpoints for managing membership tiers.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class MembershipTiersController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;

    /// <summary>
    /// Initializes a new instance of <see cref="MembershipTiersController"/>.
    /// </summary>
    public MembershipTiersController(ApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    /// <summary>
    /// Returns paginated membership tiers.
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<PaginatedResult<MembershipTierDto>>> Get([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        if (page <= 0) page = 1;
        if (pageSize <= 0) pageSize = 20;
        var q = _context.MembershipTiers.AsQueryable();
        var total = await q.CountAsync();
        var items = await q.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();
        var dtos = _mapper.Map<List<MembershipTierDto>>(items);
        return new PaginatedResult<MembershipTierDto> { Items = dtos, TotalCount = total, Page = page, PageSize = pageSize };
    }

    /// <summary>
    /// Gets a membership tier by id.
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<MembershipTierDto>> Get(int id)
    {
        var e = await _context.MembershipTiers.FindAsync(id);
        if (e == null) return NotFound();
        return _mapper.Map<MembershipTierDto>(e);
    }

    /// <summary>
    /// Creates a membership tier.
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<MembershipTierDto>> Post(MembershipTierDto dto)
    {
        var entity = _mapper.Map<MembershipTier>(dto);
        _context.MembershipTiers.Add(entity);
        await _context.SaveChangesAsync();
        var result = _mapper.Map<MembershipTierDto>(entity);
        return CreatedAtAction(nameof(Get), new { id = entity.MembershipTierId }, result);
    }

    /// <summary>
    /// Updates a membership tier.
    /// </summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> Put(int id, MembershipTierDto dto)
    {
        if (id != dto.MembershipTierId) return BadRequest();
        var entity = _mapper.Map<MembershipTier>(dto);
        _context.Entry(entity).State = EntityState.Modified;
        try { await _context.SaveChangesAsync(); }
        catch (DbUpdateConcurrencyException)
        {
            if (!_context.MembershipTiers.Any(x => x.MembershipTierId == id)) return NotFound();
            throw;
        }
        return NoContent();
    }

    /// <summary>
    /// Deletes a membership tier.
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var e = await _context.MembershipTiers.FindAsync(id);
        if (e == null) return NotFound();
        _context.MembershipTiers.Remove(e);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
