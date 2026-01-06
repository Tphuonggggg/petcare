using Microsoft.EntityFrameworkCore;
using PetCareX.Api.Models;

namespace PetCareX.Api.Data;

/// <summary>
/// Partial class for additional ApplicationDbContext configuration.
/// </summary>
public partial class ApplicationDbContext
{
    partial void OnModelCreatingPartial(ModelBuilder modelBuilder)
    {
        // Configure Invoice table to work with database triggers
        // by disabling the use of OUTPUT clause
        modelBuilder.Entity<Invoice>(entity =>
        {
            // Disable identity column identity behavior to work with triggers
            entity.Property(e => e.InvoiceId)
                .ValueGeneratedOnAdd();
        });
    }
}
