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
        try
        {
            if (page <= 0) page = 1;
            if (pageSize <= 0) pageSize = 20;
            var q = _context.Products.AsQueryable();
            var total = await q.CountAsync();
            var items = await q.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();
            var dtos = _mapper.Map<List<ProductDto>>(items);
            return new PaginatedResult<ProductDto> { Items = dtos, TotalCount = total, Page = page, PageSize = pageSize };
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Error loading products: {ex.Message}");
        }
    }

    /// <summary>
    /// Gets a product by id.
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<ProductDto>> Get(int id)
    {
        try
        {
            var e = await _context.Products.FindAsync(id);
            if (e == null) return NotFound();
            return _mapper.Map<ProductDto>(e);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Error loading product: {ex.Message}");
        }
    }

    /// <summary>
    /// Creates a product.
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<ProductDto>> Post(ProductDto dto)
    {
        try
        {
            // Validate required fields
            if (string.IsNullOrEmpty(dto.Name)) return BadRequest("Name is required");
            if (string.IsNullOrEmpty(dto.Category)) return BadRequest("Category is required");
            
            // Validate category enum
            var validCategories = new[] { "FOOD", "MEDICINE", "ACCESSORY", "TOY" };
            if (!validCategories.Contains(dto.Category.ToUpper()))
                return BadRequest($"Category must be one of: {string.Join(", ", validCategories)}");
            
            if (!dto.Price.HasValue || dto.Price <= 0) return BadRequest("Price must be greater than 0");
            if (!dto.StockQty.HasValue || dto.StockQty < 0) return BadRequest("StockQty must be non-negative");
            
            // Disable triggers temporarily to avoid OUTPUT clause issue
            await _context.Database.ExecuteSqlRawAsync("DISABLE TRIGGER ALL ON [Product]");
            try
            {
                var entity = new Product
                {
                    Name = dto.Name,
                    Category = dto.Category.ToUpper(),
                    Price = dto.Price.Value,
                    StockQty = dto.StockQty.Value,
                    ReorderPoint = dto.ReorderPoint ?? 10,
                    Description = dto.Description
                };
                
                _context.Products.Add(entity);
                await _context.SaveChangesAsync();
                var result = _mapper.Map<ProductDto>(entity);
                return CreatedAtAction(nameof(Get), new { id = entity.ProductId }, result);
            }
            finally
            {
                // Always re-enable triggers
                await _context.Database.ExecuteSqlRawAsync("ENABLE TRIGGER ALL ON [Product]");
            }
        }
        catch (DbUpdateException ex)
        {
            if (ex.InnerException?.Message.Contains("UNIQUE") == true)
                return BadRequest("Tên sản phẩm đã tồn tại");
            if (ex.InnerException?.Message.Contains("CHECK") == true)
                return BadRequest("Dữ liệu không hợp lệ (kiểm tra giá > 0, loại sản phẩm, số lượng >= 0)");
            return StatusCode(500, $"Database error: {ex.InnerException?.Message}");
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Error: {ex.Message}");
        }
    }

    /// <summary>
    /// Updates a product.
    /// </summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> Put(int id, ProductDto dto)
    {
        try
        {
            // Validate required fields
            if (id != dto.ProductId) return BadRequest("ID mismatch");
            if (string.IsNullOrEmpty(dto.Name)) return BadRequest("Name is required");
            if (string.IsNullOrEmpty(dto.Category)) return BadRequest("Category is required");
            
            // Validate category enum
            var validCategories = new[] { "FOOD", "MEDICINE", "ACCESSORY", "TOY" };
            if (!validCategories.Contains(dto.Category.ToUpper()))
                return BadRequest($"Category must be one of: {string.Join(", ", validCategories)}");
            
            if (!dto.Price.HasValue || dto.Price <= 0) return BadRequest("Price must be greater than 0");
            if (!dto.StockQty.HasValue || dto.StockQty < 0) return BadRequest("StockQty must be non-negative");
            
            // Disable triggers temporarily to avoid OUTPUT clause issue
            await _context.Database.ExecuteSqlRawAsync("DISABLE TRIGGER ALL ON [Product]");
            try
            {
                var entity = await _context.Products.FindAsync(id);
                if (entity == null)
                {
                    await _context.Database.ExecuteSqlRawAsync("ENABLE TRIGGER ALL ON [Product]");
                    return NotFound();
                }
                
                // Update all fields
                entity.Name = dto.Name;
                entity.Category = dto.Category.ToUpper();
                entity.Price = dto.Price.Value;
                entity.StockQty = dto.StockQty.Value;
                entity.ReorderPoint = dto.ReorderPoint ?? 10;
                entity.Description = dto.Description;
                
                await _context.SaveChangesAsync();
            }
            finally
            {
                // Always re-enable triggers
                await _context.Database.ExecuteSqlRawAsync("ENABLE TRIGGER ALL ON [Product]");
            }
            
            return NoContent();
        }
        catch (DbUpdateException ex)
        {
            if (ex.InnerException?.Message.Contains("UNIQUE") == true)
                return BadRequest("Tên sản phẩm đã tồn tại");
            if (ex.InnerException?.Message.Contains("CHECK") == true)
                return BadRequest("Dữ liệu không hợp lệ (kiểm tra giá > 0, loại sản phẩm, số lượng >= 0)");
            return StatusCode(500, $"Database error: {ex.InnerException?.Message}");
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Error: {ex.Message}");
        }
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
