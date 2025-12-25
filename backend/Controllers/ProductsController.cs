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
/// API endpoints for managing products.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;
    /// <summary>
    /// Initializes a new instance of <see cref="ProductsController"/>.
    /// </summary>
    public ProductsController(ApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    /// <summary>
    /// Returns all products.
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<ProductDto>>> Get()
    {
        var list = await _context.Products.ToListAsync();
        return _mapper.Map<List<ProductDto>>(list);
    }

    /// <summary>
    /// Gets a product by id.
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<ProductDto>> Get(int id)
    {
        var e = await _context.Products.FindAsync(id);
        if (e == null) return NotFound();
        return _mapper.Map<ProductDto>(e);
    }

    /// <summary>
    /// Creates a product.
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<ProductDto>> Post(ProductDto dto)
    {
        var entity = _mapper.Map<Product>(dto);
        _context.Products.Add(entity);
        await _context.SaveChangesAsync();
        var result = _mapper.Map<ProductDto>(entity);
        return CreatedAtAction(nameof(Get), new { id = entity.ProductId }, result);
    }

    /// <summary>
    /// Updates a product.
    /// </summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> Put(int id, ProductDto dto)
    {
        if (id != dto.ProductId) return BadRequest();
        var entity = _mapper.Map<Product>(dto);
        _context.Entry(entity).State = EntityState.Modified;
        try { await _context.SaveChangesAsync(); }
        catch (DbUpdateConcurrencyException)
        {
            if (!_context.Products.Any(x => x.ProductId == id)) return NotFound();
            throw;
        }
        return NoContent();
    }

    /// <summary>
    /// Deletes a product.
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var e = await _context.Products.FindAsync(id);
        if (e == null) return NotFound();
        _context.Products.Remove(e);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
