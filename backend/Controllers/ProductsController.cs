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
    /// Returns paginated products.
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<PaginatedResult<ProductDto>>> Get([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        if (page <= 0) page = 1;
        if (pageSize <= 0) pageSize = 20;
        var q = _context.Products.AsQueryable();
        var total = await q.CountAsync();
        var items = await q.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();
        var dtos = _mapper.Map<List<ProductDto>>(items);
        return new PaginatedResult<ProductDto> { Items = dtos, TotalCount = total, Page = page, PageSize = pageSize };
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
    /// Searches for products by keyword with pagination.
    /// </summary>
    /// <param name="keyword">Search keyword</param>
    /// <param name="page">Page number (default: 1)</param>
    /// <param name="pageSize">Items per page (default: 20)</param>
    /// <returns>Paginated list of products matching the keyword</returns>
    [HttpGet("search")]
    public async Task<ActionResult<PaginatedResult<ProductSearchDto>>> SearchProduct([FromQuery] string keyword, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        if (page <= 0) page = 1;
        if (pageSize <= 0) pageSize = 20;

        var allResults = new List<ProductSearchDto>();
        
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
                    allResults.Add(new ProductSearchDto
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
        
        var total = allResults.Count;
        var items = allResults.Skip((page - 1) * pageSize).Take(pageSize).ToList();
        return new PaginatedResult<ProductSearchDto> { Items = items, TotalCount = total, Page = page, PageSize = pageSize };
    }

    /// <summary>
    /// Searches for medicine products by keyword with pagination.
    /// </summary>
    /// <param name="keyword">Search keyword</param>
    /// <param name="page">Page number (default: 1)</param>
    /// <param name="pageSize">Items per page (default: 20)</param>
    /// <returns>Paginated list of medicine products matching the keyword</returns>
    [HttpGet("search-medicine")]
    public async Task<ActionResult<PaginatedResult<MedicineSearchDto>>> SearchMedicine([FromQuery] string keyword, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        if (page <= 0) page = 1;
        if (pageSize <= 0) pageSize = 20;

        var allResults = new List<MedicineSearchDto>();
        
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
                    allResults.Add(new MedicineSearchDto
                    {
                        ProductId = reader.GetInt32(0),
                        Name = reader.GetString(1),
                        Price = reader.GetDecimal(2),
                        StockQty = reader.GetInt32(3)
                    });
                }
            }
        }
        
        var total = allResults.Count;
        var items = allResults.Skip((page - 1) * pageSize).Take(pageSize).ToList();
        return new PaginatedResult<MedicineSearchDto> { Items = items, TotalCount = total, Page = page, PageSize = pageSize };
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
