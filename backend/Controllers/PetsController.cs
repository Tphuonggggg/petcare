using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Data.SqlClient;
using PetCareX.Api.Data;
using PetCareX.Api.Models;
using PetCareX.Api.Dtos;
using AutoMapper;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Threading.Tasks;

namespace PetCareX.Api.Controllers;

/// <summary>
/// API endpoints for managing pets.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class PetsController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;
    /// <summary>
    /// Initializes a new instance of <see cref="PetsController"/>.
    /// </summary>
    public PetsController(ApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    /// <summary>
    /// Returns paginated pets.
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<PaginatedResult<PetDto>>> Get([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        if (page <= 0) page = 1;
        if (pageSize <= 0) pageSize = 20;
        var q = _context.Pets.AsQueryable();
        var total = await q.CountAsync();
        var items = await q.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();
        var dtos = _mapper.Map<List<PetDto>>(items);
        return new PaginatedResult<PetDto> { Items = dtos, TotalCount = total, Page = page, PageSize = pageSize };
    }

    /// <summary>
    /// Gets a pet by id.
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<PetDto>> Get(int id)
    {
        var e = await _context.Pets.FindAsync(id);
        if (e == null) return NotFound();
        return _mapper.Map<PetDto>(e);
    }

    /// <summary>
    /// Creates a pet.
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<PetDto>> Post(PetDto dto)
    {
        var entity = _mapper.Map<Pet>(dto);
        _context.Pets.Add(entity);
        await _context.SaveChangesAsync();
        var result = _mapper.Map<PetDto>(entity);
        return CreatedAtAction(nameof(Get), new { id = entity.PetId }, result);
    }

    /// <summary>
    /// Updates a pet.
    /// </summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> Put(int id, PetDto dto)
    {
        if (id != dto.PetId) return BadRequest();
        var entity = _mapper.Map<Pet>(dto);
        _context.Entry(entity).State = EntityState.Modified;
        try { await _context.SaveChangesAsync(); }
        catch (DbUpdateConcurrencyException)
        {
            if (!_context.Pets.Any(x => x.PetId == id)) return NotFound();
            throw;
        }
        return NoContent();
    }

    /// <summary>
    /// Deletes a pet.
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var e = await _context.Pets.FindAsync(id);
        if (e == null) return NotFound();
        _context.Pets.Remove(e);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    /// <summary>
    /// Gets the complete medical history (checkups and vaccinations) for a pet.
    /// </summary>
    /// <param name="id">Pet ID</param>
    /// <returns>Medical history records</returns>
    [HttpGet("{id}/medical-history")]
    public async Task<ActionResult<List<PetMedicalHistoryDto>>> GetPetMedicalHistory(int id)
    {
        var results = new List<PetMedicalHistoryDto>();
        
        using (var command = _context.Database.GetDbConnection().CreateCommand())
        {
            command.CommandText = "usp_GetPetMedicalHistory";
            command.CommandType = CommandType.StoredProcedure;
            
            command.Parameters.Add(new SqlParameter("@PetID", id));
            
            await _context.Database.OpenConnectionAsync();
            
            using (var reader = await command.ExecuteReaderAsync())
            {
                while (await reader.ReadAsync())
                {
                    results.Add(new PetMedicalHistoryDto
                    {
                        RecordType = reader.GetString(0),
                        RecordDate = reader.GetDateTime(1),
                        Diagnosis = reader.GetString(2),
                        Symptoms = reader.IsDBNull(3) ? null : reader.GetString(3),
                        Prescription = reader.IsDBNull(4) ? null : reader.GetString(4),
                        FollowUpDate = reader.IsDBNull(5) ? null : reader.GetDateTime(5),
                        DoctorName = reader.GetString(6)
                    });
                }
            }
        }
        
        return results;
    }

    /// <summary>
    /// Gets the purchase history for a pet (products and services).
    /// </summary>
    /// <param name="id">Pet ID</param>
    /// <returns>Purchase history records</returns>
    [HttpGet("{id}/purchase-history")]
    public async Task<ActionResult<List<PetPurchaseHistoryDto>>> GetPetPurchaseHistory(int id)
    {
        var results = new List<PetPurchaseHistoryDto>();
        
        using (var command = _context.Database.GetDbConnection().CreateCommand())
        {
            command.CommandText = "usp_Pet_GetPurchaseHistory";
            command.CommandType = CommandType.StoredProcedure;
            
            command.Parameters.Add(new SqlParameter("@PetID", id));
            
            await _context.Database.OpenConnectionAsync();
            
            using (var reader = await command.ExecuteReaderAsync())
            {
                while (await reader.ReadAsync())
                {
                    results.Add(new PetPurchaseHistoryDto
                    {
                        InvoiceDate = reader.GetDateTime(0),
                        ItemType = reader.GetString(1),
                        ItemName = reader.GetString(2),
                        Quantity = reader.GetInt32(3),
                        UnitPrice = reader.GetDecimal(4),
                        TotalPrice = reader.GetDecimal(5)
                    });
                }
            }
        }
        
        return results;
    }
}

#region DTOs

/// <summary>
/// Pet medical history record DTO.
/// </summary>
public class PetMedicalHistoryDto
{
    /// <summary>Record type (KHAM or TIEM)</summary>
    public string RecordType { get; set; } = string.Empty;
    /// <summary>Record date</summary>
    public DateTime RecordDate { get; set; }
    /// <summary>Diagnosis</summary>
    public string Diagnosis { get; set; } = string.Empty;
    /// <summary>Symptoms</summary>
    public string? Symptoms { get; set; }
    /// <summary>Prescription</summary>
    public string? Prescription { get; set; }
    /// <summary>Follow-up date</summary>
    public DateTime? FollowUpDate { get; set; }
    /// <summary>Doctor name</summary>
    public string DoctorName { get; set; } = string.Empty;
}

/// <summary>
/// Pet purchase history record DTO.
/// </summary>
public class PetPurchaseHistoryDto
{
    /// <summary>Invoice date</summary>
    public DateTime InvoiceDate { get; set; }
    /// <summary>Item type</summary>
    public string ItemType { get; set; } = string.Empty;
    /// <summary>Item name</summary>
    public string ItemName { get; set; } = string.Empty;
    /// <summary>Quantity</summary>
    public int Quantity { get; set; }
    /// <summary>Unit price</summary>
    public decimal UnitPrice { get; set; }
    /// <summary>Total price</summary>
    public decimal TotalPrice { get; set; }
}

#endregion
