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
/// API endpoints for managing promotions.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class PromotionsController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;
    /// <summary>
    /// Initializes a new instance of <see cref="PromotionsController"/>.
    /// </summary>
    public PromotionsController(ApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    /// <summary>
    /// Returns all promotions.
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<PromotionDto>>> Get()
    {
        var list = await _context.Promotions.ToListAsync();
        return _mapper.Map<List<PromotionDto>>(list);
    }

    /// <summary>
    /// Gets a promotion by id.
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<PromotionDto>> Get(int id)
    {
        var e = await _context.Promotions.FindAsync(id);
        if (e == null) return NotFound();
        return _mapper.Map<PromotionDto>(e);
    }

    /// <summary>
    /// Creates a promotion.
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<PromotionDto>> Post(PromotionDto dto)
    {
        var entity = _mapper.Map<Promotion>(dto);
        _context.Promotions.Add(entity);
        await _context.SaveChangesAsync();
        var result = _mapper.Map<PromotionDto>(entity);
        return CreatedAtAction(nameof(Get), new { id = entity.PromotionId }, result);
    }

    /// <summary>
    /// Updates a promotion.
    /// </summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> Put(int id, PromotionDto dto)
    {
        if (id != dto.PromotionId) return BadRequest();
        var entity = _mapper.Map<Promotion>(dto);
        _context.Entry(entity).State = EntityState.Modified;
        try { await _context.SaveChangesAsync(); }
        catch (DbUpdateConcurrencyException)
        {
            if (!_context.Promotions.Any(x => x.PromotionId == id)) return NotFound();
            throw;
        }
        return NoContent();
    }

    /// <summary>
    /// Deletes a promotion.
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var e = await _context.Promotions.FindAsync(id);
        if (e == null) return NotFound();
        _context.Promotions.Remove(e);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
