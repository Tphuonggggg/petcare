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
/// API endpoints for managing employees.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class EmployeesController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;

    /// <summary>
    /// Initializes a new instance of <see cref="EmployeesController"/>.
    /// </summary>
    public EmployeesController(ApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    /// <summary>
    /// Returns all employees.
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<EmployeeDto>>> Get()
    {
        var list = await _context.Employees.ToListAsync();
        return _mapper.Map<List<EmployeeDto>>(list);
    }

    /// <summary>
    /// Gets an employee by id.
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<EmployeeDto>> Get(int id)
    {
        var e = await _context.Employees.FindAsync(id);
        if (e == null) return NotFound();
        return _mapper.Map<EmployeeDto>(e);
    }

    /// <summary>
    /// Creates an employee.
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<EmployeeDto>> Post(EmployeeDto dto)
    {
        var entity = _mapper.Map<Employee>(dto);
        _context.Employees.Add(entity);
        await _context.SaveChangesAsync();
        var result = _mapper.Map<EmployeeDto>(entity);
        return CreatedAtAction(nameof(Get), new { id = entity.EmployeeId }, result);
    }

    /// <summary>
    /// Updates an employee.
    /// </summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> Put(int id, EmployeeDto dto)
    {
        if (id != dto.EmployeeId) return BadRequest();
        var entity = _mapper.Map<Employee>(dto);
        _context.Entry(entity).State = EntityState.Modified;
        try { await _context.SaveChangesAsync(); }
        catch (DbUpdateConcurrencyException)
        {
            if (!_context.Employees.Any(x => x.EmployeeId == id)) return NotFound();
            throw;
        }
        return NoContent();
    }

    /// <summary>
    /// Deletes an employee.
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var e = await _context.Employees.FindAsync(id);
        if (e == null) return NotFound();
        _context.Employees.Remove(e);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
