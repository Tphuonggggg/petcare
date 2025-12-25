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
/// API endpoints for managing bookings.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class BookingsController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;

    /// <summary>
    /// Initializes a new instance of the <see cref="BookingsController"/> class.
    /// </summary>
    public BookingsController(ApplicationDbContext context, IMapper mapper) { _context = context; _mapper = mapper; }

    /// <summary>
    /// Returns paginated booking records.
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<PaginatedResult<BookingDto>>> Get([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        if (page <= 0) page = 1;
        if (pageSize <= 0) pageSize = 20;
        var q = _context.Bookings.AsQueryable();
        var total = await q.CountAsync();
        var items = await q.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();
        var dtos = _mapper.Map<List<BookingDto>>(items);
        return new PaginatedResult<BookingDto> { Items = dtos, TotalCount = total, Page = page, PageSize = pageSize };
    }

    /// <summary>
    /// Returns a booking by id.
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<BookingDto>> Get(int id)
    {
        var e = await _context.Bookings.FindAsync(id);
        if (e == null) return NotFound();
        return _mapper.Map<BookingDto>(e);
    }

    /// <summary>
    /// Creates a new booking.
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<BookingDto>> Post(BookingDto dto)
    {
        var entity = _mapper.Map<Booking>(dto);
        _context.Bookings.Add(entity);
        await _context.SaveChangesAsync();
        var result = _mapper.Map<BookingDto>(entity);
        return CreatedAtAction(nameof(Get), new { id = entity.BookingId }, result);
    }

    /// <summary>
    /// Updates an existing booking.
    /// </summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> Put(int id, BookingDto dto)
    {
        if (id != dto.BookingId) return BadRequest();
        var entity = _mapper.Map<Booking>(dto);
        _context.Entry(entity).State = EntityState.Modified;
        try { await _context.SaveChangesAsync(); }
        catch (DbUpdateConcurrencyException)
        {
            if (!_context.Bookings.Any(x => x.BookingId == id)) return NotFound();
            throw;
        }
        return NoContent();
    }

    /// <summary>
    /// Deletes a booking.
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var e = await _context.Bookings.FindAsync(id);
        if (e == null) return NotFound();
        _context.Bookings.Remove(e);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
