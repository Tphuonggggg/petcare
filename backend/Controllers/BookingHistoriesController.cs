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
/// API endpoints for managing booking history entries.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class BookingHistoriesController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;
    /// <summary>
    /// Creates a new instance of <see cref="BookingHistoriesController"/>.
    /// </summary>
    public BookingHistoriesController(ApplicationDbContext context, IMapper mapper) { _context = context; _mapper = mapper; }

    /// <summary>
    /// Returns paginated booking history entries.
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<PaginatedResult<BookingHistoryDto>>> Get([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        if (page <= 0) page = 1;
        if (pageSize <= 0) pageSize = 20;
        var q = _context.BookingHistories.AsQueryable();
        var total = await q.CountAsync();
        var items = await q.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();
        var dtos = _mapper.Map<List<BookingHistoryDto>>(items);
        return new PaginatedResult<BookingHistoryDto> { Items = dtos, TotalCount = total, Page = page, PageSize = pageSize };
    }

    /// <summary>
    /// Returns a specific booking history entry by id.
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<BookingHistoryDto>> Get(int id)
    {
        var e = await _context.BookingHistories.FindAsync(id);
        if (e == null) return NotFound();
        return _mapper.Map<BookingHistoryDto>(e);
    }

    /// <summary>
    /// Creates a booking history entry.
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<BookingHistoryDto>> Post(BookingHistoryDto dto)
    {
        var entity = _mapper.Map<BookingHistory>(dto);
        _context.BookingHistories.Add(entity);
        await _context.SaveChangesAsync();
        var result = _mapper.Map<BookingHistoryDto>(entity);
        return CreatedAtAction(nameof(Get), new { id = entity.HistoryId }, result);
    }

    /// <summary>
    /// Updates an existing booking history entry.
    /// </summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> Put(int id, BookingHistoryDto dto)
    {
        if (id != dto.HistoryId.GetValueOrDefault()) return BadRequest();
        var entity = _mapper.Map<BookingHistory>(dto);
        _context.Entry(entity).State = EntityState.Modified;
        try { await _context.SaveChangesAsync(); }
        catch (DbUpdateConcurrencyException)
        {
            if (!_context.BookingHistories.Any(x => x.HistoryId == id)) return NotFound();
            throw;
        }
        return NoContent();
    }

    /// <summary>
    /// Deletes a booking history entry.
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var e = await _context.BookingHistories.FindAsync(id);
        if (e == null) return NotFound();
        _context.BookingHistories.Remove(e);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
