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
/// API endpoints for loyalty transactions.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class LoyaltyTransactionsController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;

    /// <summary>
    /// Initializes a new instance of <see cref="LoyaltyTransactionsController"/>.
    /// </summary>
    public LoyaltyTransactionsController(ApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    /// <summary>
    /// Returns all loyalty transactions.
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<LoyaltyTransactionDto>>> Get()
    {
        var list = await _context.LoyaltyTransactions.ToListAsync();
        return _mapper.Map<List<LoyaltyTransactionDto>>(list);
    }

    /// <summary>
    /// Gets a loyalty transaction by id.
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<LoyaltyTransactionDto>> Get(int id)
    {
        var e = await _context.LoyaltyTransactions.FindAsync(id);
        if (e == null) return NotFound();
        return _mapper.Map<LoyaltyTransactionDto>(e);
    }

    /// <summary>
    /// Creates a loyalty transaction.
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<LoyaltyTransactionDto>> Post(LoyaltyTransactionDto dto)
    {
        var entity = _mapper.Map<LoyaltyTransaction>(dto);
        _context.LoyaltyTransactions.Add(entity);
        await _context.SaveChangesAsync();
        var result = _mapper.Map<LoyaltyTransactionDto>(entity);
        return CreatedAtAction(nameof(Get), new { id = entity.LoyaltyTransId }, result);
    }

    /// <summary>
    /// Updates a loyalty transaction.
    /// </summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> Put(int id, LoyaltyTransactionDto dto)
    {
        if (id != dto.LoyaltyTransId) return BadRequest();
        var entity = _mapper.Map<LoyaltyTransaction>(dto);
        _context.Entry(entity).State = EntityState.Modified;
        try { await _context.SaveChangesAsync(); }
        catch (DbUpdateConcurrencyException)
        {
            if (!_context.LoyaltyTransactions.Any(x => x.LoyaltyTransId == id)) return NotFound();
            throw;
        }
        return NoContent();
    }

    /// <summary>
    /// Deletes a loyalty transaction.
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var e = await _context.LoyaltyTransactions.FindAsync(id);
        if (e == null) return NotFound();
        _context.LoyaltyTransactions.Remove(e);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
