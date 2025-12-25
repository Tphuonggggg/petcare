using System.Collections.Generic;

namespace PetCareX.Api.Dtos;

/// <summary>
/// Represents a paginated result set.
/// </summary>
/// <typeparam name="T">Type of items in the result.</typeparam>
public class PaginatedResult<T>
{
    /// <summary>Items on the current page.</summary>
    public IEnumerable<T> Items { get; set; } = new List<T>();
    /// <summary>Total number of items available.</summary>
    public int TotalCount { get; set; }
    /// <summary>Current page number (1-based).</summary>
    public int Page { get; set; }
    /// <summary>Size of each page.</summary>
    public int PageSize { get; set; }
}
