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
/// API endpoints for employee branch assignment histories.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class EmployeeHistoriesController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;
    /// <summary>
    /// Initializes a new instance of <see cref="EmployeeHistoriesController"/>.
    /// </summary>
    public EmployeeHistoriesController(ApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    /// <summary>
    /// Returns paginated employee history entries.
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<PaginatedResult<EmployeeHistoryDto>>> Get([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        if (page <= 0) page = 1;
        if (pageSize <= 0) pageSize = 20;
        var q = _context.EmployeeHistories.AsQueryable();
        var total = await q.CountAsync();
        var items = await q.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();
        var dtos = _mapper.Map<List<EmployeeHistoryDto>>(items);
        return new PaginatedResult<EmployeeHistoryDto> { Items = dtos, TotalCount = total, Page = page, PageSize = pageSize };
    }

    /// <summary>
    /// Gets an employee history entry by composite id (employeeId, branchId, startDate).
    /// </summary>
    [HttpGet("{employeeId}/{branchId}/{startDate}")]
    public async Task<ActionResult<EmployeeHistoryDto>> Get(int employeeId, int branchId, string startDate)
    {
        if (!DateOnly.TryParse(startDate, out var sd)) return BadRequest("Invalid date format. Use yyyy-MM-dd.");
        var e = await _context.EmployeeHistories.FindAsync(employeeId, branchId, sd);
        if (e == null) return NotFound();
        return _mapper.Map<EmployeeHistoryDto>(e);
    }

    /// <summary>
    /// Creates an employee history entry.
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<EmployeeHistoryDto>> Post(EmployeeHistoryDto dto)
    {
        var entity = _mapper.Map<EmployeeHistory>(dto);
        _context.EmployeeHistories.Add(entity);
        await _context.SaveChangesAsync();
        var result = _mapper.Map<EmployeeHistoryDto>(entity);
        return CreatedAtAction(nameof(Get), new { employeeId = entity.EmployeeId, branchId = entity.BranchId, startDate = entity.StartDate.ToString("yyyy-MM-dd") }, result);
    }

    /// <summary>
    /// Updates an employee history entry.
    /// </summary>
    [HttpPut("{employeeId}/{branchId}/{startDate}")]
    public async Task<IActionResult> Put(int employeeId, int branchId, string startDate, EmployeeHistoryDto dto)
    {
        if (!DateOnly.TryParse(startDate, out var sd)) return BadRequest("Invalid date format. Use yyyy-MM-dd.");
        var entity = _mapper.Map<EmployeeHistory>(dto);
        if (employeeId != entity.EmployeeId || branchId != entity.BranchId || sd != entity.StartDate) return BadRequest();
        _context.Entry(entity).State = EntityState.Modified;
        try { await _context.SaveChangesAsync(); }
        catch (DbUpdateConcurrencyException)
        {
            if (!await _context.EmployeeHistories.AnyAsync(x => x.EmployeeId == employeeId && x.BranchId == branchId && x.StartDate == sd)) return NotFound();
            throw;
        }
        return NoContent();
    }

    /// <summary>
    /// Deletes an employee history entry.
    /// </summary>
    [HttpDelete("{employeeId}/{branchId}/{startDate}")]
    public async Task<IActionResult> Delete(int employeeId, int branchId, string startDate)
    {
        if (!DateOnly.TryParse(startDate, out var sd)) return BadRequest("Invalid date format. Use yyyy-MM-dd.");
        var e = await _context.EmployeeHistories.FindAsync(employeeId, branchId, sd);
        if (e == null) return NotFound();
        _context.EmployeeHistories.Remove(e);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
