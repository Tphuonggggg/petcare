using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Data.SqlClient;
using PetCareX.Api.Data;
using PetCareX.Api.Models;
using PetCareX.Api.Dtos;
using AutoMapper;
using System.Collections.Generic;
using System.Data;
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

    /// <summary>
    /// Searches for products by keyword.
    /// </summary>
    /// <param name="keyword">Search keyword</param>
    /// <returns>List of products matching the keyword</returns>
    [HttpGet("search")]
    public async Task<ActionResult<List<ProductSearchDto>>> SearchProduct([FromQuery] string keyword)
    {
        var results = new List<ProductSearchDto>();
        
        using (var command = _context.Database.GetDbConnection().CreateCommand())
        {
            command.CommandText = "usp_SearchProduct";
            command.CommandType = CommandType.StoredProcedure;
            
            command.Parameters.Add(new SqlParameter("@Keyword", keyword ?? string.Empty));
            
            await _context.Database.OpenConnectionAsync();
            
            using (var reader = await command.ExecuteReaderAsync())
            {
                while (await reader.ReadAsync())
                {
                    results.Add(new ProductSearchDto
                    {
                        ProductId = reader.GetInt32(0),
                        Name = reader.GetString(1),
                        Category = reader.GetString(2),
                        Price = reader.GetDecimal(3),
                        StockQty = reader.GetInt32(4)
                    });
                }
            }
        }
        
        return results;
    }

    /// <summary>
    /// Searches for medicine products by keyword.
    /// </summary>
    /// <param name="keyword">Search keyword</param>
    /// <returns>List of medicine products matching the keyword</returns>
    [HttpGet("search-medicine")]
    public async Task<ActionResult<List<MedicineSearchDto>>> SearchMedicine([FromQuery] string keyword)
    {
        var results = new List<MedicineSearchDto>();
        
        using (var command = _context.Database.GetDbConnection().CreateCommand())
        {
            command.CommandText = "usp_SearchMedicine";
            command.CommandType = CommandType.StoredProcedure;
            
            command.Parameters.Add(new SqlParameter("@Keyword", keyword ?? string.Empty));
            
            await _context.Database.OpenConnectionAsync();
            
            using (var reader = await command.ExecuteReaderAsync())
            {
                while (await reader.ReadAsync())
                {
                    results.Add(new MedicineSearchDto
                    {
                        ProductId = reader.GetInt32(0),
                        Name = reader.GetString(1),
                        Price = reader.GetDecimal(2),
                        StockQty = reader.GetInt32(3)
                    });
                }
            }
        }
        
        return results;
    }
}

#region DTOs

/// <summary>
/// Product search result DTO.
/// </summary>
public class ProductSearchDto
{
    /// <summary>Product ID</summary>
    public int ProductId { get; set; }
    /// <summary>Product name</summary>
    public string Name { get; set; } = string.Empty;
    /// <summary>Product category</summary>
    public string Category { get; set; } = string.Empty;
    /// <summary>Product price</summary>
    public decimal Price { get; set; }
    /// <summary>Stock quantity</summary>
    public int StockQty { get; set; }
}

/// <summary>
/// Medicine search result DTO.
/// </summary>
public class MedicineSearchDto
{
    /// <summary>Product ID</summary>
    public int ProductId { get; set; }
    /// <summary>Medicine name</summary>
    public string Name { get; set; } = string.Empty;
    /// <summary>Medicine price</summary>
    public decimal Price { get; set; }
    /// <summary>Stock quantity</summary>
    public int StockQty { get; set; }
}

#endregion
