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
        // Configure Employee cascade delete
        modelBuilder.Entity<Employee>()
            .HasMany(e => e.CheckHealths)
            .WithOne(ch => ch.Doctor)
            .OnDelete(DeleteBehavior.Cascade);
            
        modelBuilder.Entity<Employee>()
            .HasMany(e => e.EmployeeHistories)
            .WithOne(eh => eh.Employee)
            .OnDelete(DeleteBehavior.Cascade);
            
        modelBuilder.Entity<Employee>()
            .HasMany(e => e.Invoices)
            .WithOne(i => i.Employee)
            .OnDelete(DeleteBehavior.Cascade);
            
        modelBuilder.Entity<Employee>()
            .HasMany(e => e.Reviews)
            .WithOne(r => r.Employee)
            .OnDelete(DeleteBehavior.Cascade);
            
        modelBuilder.Entity<Employee>()
            .HasMany(e => e.VaccineRecords)
            .WithOne(vr => vr.Doctor)
            .OnDelete(DeleteBehavior.Cascade);

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

        // Configure VaccineRecord table to work with database triggers
        modelBuilder.Entity<VaccineRecord>(entity =>
        {
            // Mark table as having triggers to disable OUTPUT clause
            entity.ToTable("VaccineRecord", tb => tb.HasTrigger("trg_VaccineRecord_Insert_FEFO"));
        });
        
        // Configure InvoiceItem table triggers  
        modelBuilder.Entity<InvoiceItem>(entity =>
        {
            // Mark table as having triggers to disable OUTPUT clause
            entity.ToTable("InvoiceItem", tb => tb.HasTrigger("trg_InvoiceItem_UpdateInvoiceTotal"));
        });
    }
}
