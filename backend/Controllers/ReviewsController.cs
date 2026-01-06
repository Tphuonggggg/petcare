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
/// API endpoints for managing reviews.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class ReviewsController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;
    /// <summary>
    /// Initializes a new instance of <see cref="ReviewsController"/>.
    /// </summary>
    public ReviewsController(ApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    /// <summary>
    /// Returns paginated reviews.
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<PaginatedResult<ReviewDto>>> Get([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        if (page <= 0) page = 1;
        if (pageSize <= 0) pageSize = 20;
        var q = _context.Reviews.AsQueryable();
        var total = await q.CountAsync();
        var items = await q.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();
        var dtos = _mapper.Map<List<ReviewDto>>(items);
        return new PaginatedResult<ReviewDto> { Items = dtos, TotalCount = total, Page = page, PageSize = pageSize };
    }

    /// <summary>
    /// Gets a review by id.
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<ReviewDto>> Get(int id)
    {
        var e = await _context.Reviews.FindAsync(id);
        if (e == null) return NotFound();
        return _mapper.Map<ReviewDto>(e);
    }

    /// <summary>
    /// Creates a review.
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<ReviewDto>> Post(ReviewDto dto)
    {
        var entity = _mapper.Map<Review>(dto);
        _context.Reviews.Add(entity);
        await _context.SaveChangesAsync();
        var result = _mapper.Map<ReviewDto>(entity);
        return CreatedAtAction(nameof(Get), new { id = entity.ReviewId }, result);
    }

    /// <summary>
    /// Updates a review.
    /// </summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> Put(int id, ReviewDto dto)
    {
        if (id != dto.ReviewId) return BadRequest();
        var entity = _mapper.Map<Review>(dto);
        _context.Entry(entity).State = EntityState.Modified;
        try { await _context.SaveChangesAsync(); }
        catch (DbUpdateConcurrencyException)
        {
            if (!_context.Reviews.Any(x => x.ReviewId == id)) return NotFound();
            throw;
        }
        return NoContent();
    }

    /// <summary>
    /// Deletes a review.
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var e = await _context.Reviews.FindAsync(id);
        if (e == null) return NotFound();
        _context.Reviews.Remove(e);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
