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
        modelBuilder.Entity<Invoice>(entity =>
        {
            // Configure to avoid OUTPUT clause conflicts with triggers
            entity.Property(e => e.InvoiceId)
                .ValueGeneratedOnAdd()
                .HasAnnotation("SqlServer:ValueGenerationStrategy", Microsoft.EntityFrameworkCore.Metadata.SqlServerValueGenerationStrategy.IdentityColumn);
                
            // Mark table as having triggers to disable OUTPUT clause
            entity.ToTable("Invoice", tb => tb.HasTrigger("trg_InvoiceItem_UpdateInvoiceTotal"));
        });
        
        // Configure InvoiceItem table triggers  
        modelBuilder.Entity<InvoiceItem>(entity =>
        {
            // Mark table as having triggers to disable OUTPUT clause
            entity.ToTable("InvoiceItem", tb => tb.HasTrigger("trg_InvoiceItem_UpdateInvoiceTotal"));
        });
    }
}
