using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using PetCareX.Api.Models;

namespace PetCareX.Api.Data;

/// <summary>
/// Entity Framework Core database context for the PetCareX application.
/// Contains DbSet properties for each database table.
/// </summary>
public partial class ApplicationDbContext : DbContext
{
    /// <summary>
    /// Parameterless constructor used by design-time tools.
    /// </summary>
    public ApplicationDbContext()
    {
    }

    /// <summary>
    /// Creates a new <see cref="ApplicationDbContext"/> with the specified options.
    /// </summary>
    /// <param name="options">The options to configure the context.</param>
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    /// <summary>Bookings table.</summary>
    public virtual DbSet<Booking> Bookings { get; set; }

    /// <summary>Booking history entries.</summary>
    public virtual DbSet<BookingHistory> BookingHistories { get; set; }

    /// <summary>Branches table.</summary>
    public virtual DbSet<Branch> Branches { get; set; }

    /// <summary>Branch-specific services (join table).</summary>
    public virtual DbSet<BranchService> BranchServices { get; set; }

    /// <summary>Pet health check records.</summary>
    public virtual DbSet<CheckHealth> CheckHealths { get; set; }

    /// <summary>Customers table.</summary>
    public virtual DbSet<Customer> Customers { get; set; }

    /// <summary>Employees table.</summary>
    public virtual DbSet<Employee> Employees { get; set; }

    /// <summary>Employee branch assignment history.</summary>
    public virtual DbSet<EmployeeHistory> EmployeeHistories { get; set; }

    /// <summary>Invoices table.</summary>
    public virtual DbSet<Invoice> Invoices { get; set; }

    /// <summary>Invoice line items.</summary>
    public virtual DbSet<InvoiceItem> InvoiceItems { get; set; }

    /// <summary>Loyalty transactions.</summary>
    public virtual DbSet<LoyaltyTransaction> LoyaltyTransactions { get; set; }

    /// <summary>Membership tiers.</summary>
    public virtual DbSet<MembershipTier> MembershipTiers { get; set; }

    /// <summary>Pets table.</summary>
    public virtual DbSet<Pet> Pets { get; set; }

    /// <summary>Employee positions.</summary>
    public virtual DbSet<Position> Positions { get; set; }

    /// <summary>Products catalog.</summary>
    public virtual DbSet<Product> Products { get; set; }

    /// <summary>Active promotions.</summary>
    public virtual DbSet<Promotion> Promotions { get; set; }

    /// <summary>Customer reviews.</summary>
    public virtual DbSet<Review> Reviews { get; set; }

    /// <summary>Services offered.</summary>
    public virtual DbSet<Service> Services { get; set; }

    /// <summary>Service vaccination records.</summary>
    public virtual DbSet<ServiceVaccination> ServiceVaccinations { get; set; }

    /// <summary>Vaccines master data.</summary>
    public virtual DbSet<Vaccine> Vaccines { get; set; }

    /// <summary>Vaccine inventory batches.</summary>
    public virtual DbSet<VaccineBatch> VaccineBatches { get; set; }

    /// <summary>Vaccine packages.</summary>
    public virtual DbSet<VaccinePackage> VaccinePackages { get; set; }

    /// <summary>Items in vaccine packages (join table).</summary>
    public virtual DbSet<VaccinePackageItem> VaccinePackageItems { get; set; }

    /// <summary>Vaccine administration records.</summary>
    public virtual DbSet<VaccineRecord> VaccineRecords { get; set; }

    /// <summary>
    /// Configures the context if not already configured. Reads connection string from
    /// environment variable `ConnectionStrings__DefaultConnection` when available.
    /// </summary>
    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        if (!optionsBuilder.IsConfigured)
        {
            // If no configuration was provided (e.g., during design-time), try to read
            // connection string from the environment variable `ConnectionStrings__DefaultConnection`.
            var conn = Environment.GetEnvironmentVariable("ConnectionStrings__DefaultConnection");
            if (!string.IsNullOrEmpty(conn))
            {
                optionsBuilder.UseSqlServer(conn, options => 
                    options.UseCompatibilityLevel(130)); // SQL Server 2016+
            }
        }
    }

    /// <summary>
    /// Configures EF Core model mappings and constraints generated from the database schema.
    /// </summary>
    /// <param name="modelBuilder">The model builder.</param>
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Booking>(entity =>
        {
            entity.HasKey(e => e.BookingId).HasName("PK__Booking__73951ACD05DB25ED");

            entity.ToTable("Booking");

            entity.Property(e => e.BookingId).HasColumnName("BookingID");
            entity.Property(e => e.BookingType).HasMaxLength(50);
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.CustomerId).HasColumnName("CustomerID");
            entity.Property(e => e.Notes).HasMaxLength(255);
            entity.Property(e => e.PetId).HasColumnName("PetID");
            entity.Property(e => e.RequestedDateTime).HasColumnType("datetime");
            entity.Property(e => e.Status).HasMaxLength(20);

            entity.HasOne(d => d.Customer).WithMany(p => p.Bookings)
                .HasForeignKey(d => d.CustomerId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Booking__Custome__498EEC8D");

            entity.HasOne(d => d.Pet).WithMany(p => p.Bookings)
                .HasForeignKey(d => d.PetId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Booking__PetID__4A8310C6");
        });

        modelBuilder.Entity<BookingHistory>(entity =>
        {
            entity.HasKey(e => e.HistoryId).HasName("PK__BookingH__4D7B4ADD17B65468");

            entity.ToTable("BookingHistory");

            entity.Property(e => e.HistoryId).HasColumnName("HistoryID");
            entity.Property(e => e.ActionType).HasMaxLength(30);
            entity.Property(e => e.BookingId).HasColumnName("BookingID");
            entity.Property(e => e.NewDateTime).HasColumnType("datetime");
            entity.Property(e => e.NewStatus).HasMaxLength(20);
            entity.Property(e => e.Notes).HasMaxLength(255);
            entity.Property(e => e.OldDateTime).HasColumnType("datetime");
            entity.Property(e => e.OldStatus).HasMaxLength(20);
            entity.Property(e => e.Timestamp)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");

            entity.HasOne(d => d.Booking).WithMany(p => p.BookingHistories)
                .HasForeignKey(d => d.BookingId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__BookingHi__Booki__4F47C5E3");
        });

        modelBuilder.Entity<Branch>(entity =>
        {
            entity.HasKey(e => e.BranchId).HasName("PK__Branch__A1682FA5C7C619CB");

            entity.ToTable("Branch");

            entity.Property(e => e.BranchId)
                .ValueGeneratedNever()
                .HasColumnName("BranchID");
            entity.Property(e => e.Address).HasMaxLength(255);
            entity.Property(e => e.Name).HasMaxLength(100);
            entity.Property(e => e.Phone)
                .HasMaxLength(20)
                .IsUnicode(false);
        });

        modelBuilder.Entity<BranchService>(entity =>
        {
            entity.HasKey(e => new { e.BranchId, e.ServiceId }).HasName("PK__BranchSe__1D3994AB575DB8D7");

            entity.ToTable("BranchService");

            entity.Property(e => e.BranchId).HasColumnName("BranchID");
            entity.Property(e => e.ServiceId).HasColumnName("ServiceID");
            entity.Property(e => e.Price).HasColumnType("decimal(12, 2)");

            entity.HasOne(d => d.Branch).WithMany(p => p.BranchServices)
                .HasForeignKey(d => d.BranchId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__BranchSer__Branc__693CA210");

            entity.HasOne(d => d.Service).WithMany(p => p.BranchServices)
                .HasForeignKey(d => d.ServiceId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__BranchSer__Servi__6A30C649");
        });

        modelBuilder.Entity<CheckHealth>(entity =>
        {
            entity.HasKey(e => e.CheckId).HasName("PK__CheckHea__86815706ED7000CC");

            entity.ToTable("CheckHealth");

            entity.Property(e => e.CheckId).HasColumnName("CheckID");
            entity.Property(e => e.CheckDate)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.Diagnosis).HasMaxLength(255);
            entity.Property(e => e.DoctorId).HasColumnName("DoctorID");
            entity.Property(e => e.FollowUpDate).HasColumnType("datetime");
            entity.Property(e => e.PetId).HasColumnName("PetID");
            entity.Property(e => e.Prescription).HasMaxLength(255);
            entity.Property(e => e.Symptoms).HasMaxLength(255);

            entity.HasOne(d => d.Doctor).WithMany(p => p.CheckHealths)
                .HasForeignKey(d => d.DoctorId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__CheckHeal__Docto__2EDAF651");

            entity.HasOne(d => d.Pet).WithMany(p => p.CheckHealths)
                .HasForeignKey(d => d.PetId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__CheckHeal__PetID__2DE6D218");
        });

        modelBuilder.Entity<Customer>(entity =>
        {
            entity.HasKey(e => e.CustomerId).HasName("PK__Customer__A4AE64B88C4ACAF4");

            entity.ToTable("Customer");

            entity.HasIndex(e => e.Phone, "UQ__Customer__5C7E359E4B10E6CD").IsUnique();

            entity.HasIndex(e => e.Email, "UQ__Customer__A9D105347AE47E81").IsUnique();

            entity.Property(e => e.CustomerId).HasColumnName("CustomerID");
            entity.Property(e => e.Cccd)
                .HasMaxLength(12)
                .IsUnicode(false)
                .HasColumnName("CCCD");
            entity.Property(e => e.Email)
                .HasMaxLength(100)
                .IsUnicode(false);
            entity.Property(e => e.FullName).HasMaxLength(100);
            entity.Property(e => e.Gender)
                .HasMaxLength(1)
                .IsUnicode(false)
                .IsFixedLength();
            entity.Property(e => e.MemberSince).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.MembershipTierId).HasColumnName("MembershipTierID");
            entity.Property(e => e.Phone)
                .HasMaxLength(15)
                .IsUnicode(false);
            entity.Property(e => e.TotalYearlySpend).HasColumnType("decimal(14, 2)");

            entity.HasOne(d => d.MembershipTier).WithMany(p => p.Customers)
                .HasForeignKey(d => d.MembershipTierId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Customer__Member__0E6E26BF");
        });

        modelBuilder.Entity<Employee>(entity =>
        {
            entity.HasKey(e => e.EmployeeId).HasName("PK__Employee__7AD04FF1B8102140");

            entity.ToTable("Employee");

            entity.Property(e => e.EmployeeId).HasColumnName("EmployeeID").ValueGeneratedOnAdd();
            entity.Property(e => e.BaseSalary).HasColumnType("decimal(14, 2)");
            entity.Property(e => e.BranchId).HasColumnName("BranchID");
            entity.Property(e => e.FullName).HasMaxLength(150);
            entity.Property(e => e.Gender).HasMaxLength(10);
            entity.Property(e => e.PositionId).HasColumnName("PositionID");

            entity.HasOne(d => d.Branch).WithMany(p => p.Employees)
                .HasForeignKey(d => d.BranchId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Employee__Branch__778AC167");

            entity.HasOne(d => d.Position).WithMany(p => p.Employees)
                .HasForeignKey(d => d.PositionId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Employee__Positi__787EE5A0");
        });

        modelBuilder.Entity<EmployeeHistory>(entity =>
        {
            entity.HasKey(e => new { e.EmployeeId, e.BranchId, e.StartDate }).HasName("PK__Employee__C688D4F7F91C8B3D");

            entity.ToTable("EmployeeHistory");

            entity.Property(e => e.EmployeeId).HasColumnName("EmployeeID");
            entity.Property(e => e.BranchId).HasColumnName("BranchID");

            entity.HasOne(d => d.Branch).WithMany(p => p.EmployeeHistories)
                .HasForeignKey(d => d.BranchId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__EmployeeH__Branc__7D439ABD");

            entity.HasOne(d => d.Employee).WithMany(p => p.EmployeeHistories)
                .HasForeignKey(d => d.EmployeeId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__EmployeeH__Emplo__7C4F7684");
        });

        modelBuilder.Entity<Invoice>(entity =>
        {
            entity.HasKey(e => e.InvoiceId).HasName("PK__Invoice__D796AAD5306B9C9C");

            entity.ToTable("Invoice");

            entity.Property(e => e.InvoiceId).HasColumnName("InvoiceID");
            entity.Property(e => e.BranchId).HasColumnName("BranchID");
            entity.Property(e => e.CustomerId).HasColumnName("CustomerID");
            entity.Property(e => e.DiscountAmount).HasColumnType("decimal(14, 2)");
            entity.Property(e => e.EmployeeId).HasColumnName("EmployeeID");
            entity.Property(e => e.FinalAmount)
                .HasComputedColumnSql("([TotalAmount]-[DiscountAmount])", false)
                .HasColumnType("decimal(15, 2)");
            entity.Property(e => e.InvoiceDate)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.PaymentMethod).HasMaxLength(20);
            entity.Property(e => e.PetId).HasColumnName("PetID");
            entity.Property(e => e.TotalAmount).HasColumnType("decimal(14, 2)");

            entity.HasOne(d => d.Branch).WithMany(p => p.Invoices)
                .HasForeignKey(d => d.BranchId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Invoice__BranchI__22751F6C");

            entity.HasOne(d => d.Customer).WithMany(p => p.Invoices)
                .HasForeignKey(d => d.CustomerId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Invoice__Custome__236943A5");

            entity.HasOne(d => d.Employee).WithMany(p => p.Invoices)
                .HasForeignKey(d => d.EmployeeId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Invoice__Employe__245D67DE");

            entity.HasOne(d => d.Pet).WithMany(p => p.Invoices)
                .HasForeignKey(d => d.PetId)
                .HasConstraintName("FK__Invoice__PetID__25518C17");
        });

        modelBuilder.Entity<InvoiceItem>(entity =>
        {
            entity.HasKey(e => e.InvoiceItemId).HasName("PK__InvoiceI__478FE0FC2F04F880");

            entity.ToTable("InvoiceItem");

            entity.Property(e => e.InvoiceItemId).HasColumnName("InvoiceItemID");
            entity.Property(e => e.InvoiceId).HasColumnName("InvoiceID");
            entity.Property(e => e.ItemType).HasMaxLength(20);
            entity.Property(e => e.ProductId).HasColumnName("ProductID");
            entity.Property(e => e.ServiceId).HasColumnName("ServiceID");
            entity.Property(e => e.TotalPrice)
                .HasComputedColumnSql("([Quantity]*[UnitPrice])", false)
                .HasColumnType("decimal(25, 2)");
            entity.Property(e => e.UnitPrice).HasColumnType("decimal(14, 2)");

            entity.HasOne(d => d.Invoice).WithMany(p => p.InvoiceItems)
                .HasForeignKey(d => d.InvoiceId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__InvoiceIt__Invoi__3493CFA7");

            entity.HasOne(d => d.Product).WithMany(p => p.InvoiceItems)
                .HasForeignKey(d => d.ProductId)
                .HasConstraintName("FK__InvoiceIt__Produ__3587F3E0");

            entity.HasOne(d => d.Service).WithMany(p => p.InvoiceItems)
                .HasForeignKey(d => d.ServiceId)
                .HasConstraintName("FK__InvoiceIt__Servi__367C1819");
        });

        modelBuilder.Entity<LoyaltyTransaction>(entity =>
        {
            entity.HasKey(e => e.LoyaltyTransId).HasName("PK__LoyaltyT__D9DADBAF19C76676");

            entity.ToTable("LoyaltyTransaction");

            entity.Property(e => e.LoyaltyTransId).HasColumnName("LoyaltyTransID");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.CustomerId).HasColumnName("CustomerID");
            entity.Property(e => e.InvoiceId).HasColumnName("InvoiceID");
            entity.Property(e => e.Reason).HasMaxLength(255);

            entity.HasOne(d => d.Customer).WithMany(p => p.LoyaltyTransactions)
                .HasForeignKey(d => d.CustomerId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__LoyaltyTr__Custo__3B40CD36");

            entity.HasOne(d => d.Invoice).WithMany(p => p.LoyaltyTransactions)
                .HasForeignKey(d => d.InvoiceId)
                .HasConstraintName("FK__LoyaltyTr__Invoi__3C34F16F");
        });

        modelBuilder.Entity<MembershipTier>(entity =>
        {
            entity.HasKey(e => e.MembershipTierId).HasName("PK__Membersh__B741E010CBEEA87D");

            entity.ToTable("MembershipTier");

            entity.HasIndex(e => e.Name, "UQ__Membersh__737584F6049698C7").IsUnique();

            entity.Property(e => e.MembershipTierId).HasColumnName("MembershipTierID");
            entity.Property(e => e.Benefits).HasMaxLength(255);
            entity.Property(e => e.MaintainSpend).HasColumnType("decimal(14, 2)");
            entity.Property(e => e.MinSpend).HasColumnType("decimal(14, 2)");
            entity.Property(e => e.Name).HasMaxLength(50);
        });

        modelBuilder.Entity<Pet>(entity =>
        {
            entity.HasKey(e => e.PetId).HasName("PK__Pet__48E538021481DDAC");

            entity.ToTable("Pet");

            entity.HasIndex(e => new { e.CustomerId, e.Name }, "UQ_Pet_Customer_Name").IsUnique();

            entity.Property(e => e.PetId).HasColumnName("PetID");
            entity.Property(e => e.Breed).HasMaxLength(100);
            entity.Property(e => e.CustomerId).HasColumnName("CustomerID");
            entity.Property(e => e.Gender)
                .HasMaxLength(1)
                .IsUnicode(false)
                .IsFixedLength();
            entity.Property(e => e.Name).HasMaxLength(100);
            entity.Property(e => e.Species).HasMaxLength(50);
            entity.Property(e => e.Status).HasMaxLength(50);

            entity.HasOne(d => d.Customer).WithMany(p => p.Pets)
                .HasForeignKey(d => d.CustomerId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Pet__CustomerID__1AD3FDA4");
        });

        modelBuilder.Entity<Position>(entity =>
        {
            entity.HasKey(e => e.PositionId).HasName("PK__Position__60BB9A59EDFCE764");

            entity.ToTable("Position");

            entity.HasIndex(e => e.Name, "UQ__Position__737584F623B6A206").IsUnique();

            entity.Property(e => e.PositionId).HasColumnName("PositionID");
            entity.Property(e => e.Description).HasMaxLength(255);
            entity.Property(e => e.Name).HasMaxLength(100);
        });

        modelBuilder.Entity<Product>(entity =>
        {
            entity.HasKey(e => e.ProductId).HasName("PK__Product__B40CC6ED7EE7F7AB");

            entity.ToTable("Product");

            entity.Property(e => e.ProductId).HasColumnName("ProductID");
            entity.Property(e => e.Category).HasMaxLength(50);
            entity.Property(e => e.Description).HasMaxLength(255);
            entity.Property(e => e.Name).HasMaxLength(100);
            entity.Property(e => e.Price).HasColumnType("decimal(14, 2)");
            entity.Property(e => e.ReorderPoint).HasDefaultValue(10);
        });

        modelBuilder.Entity<Promotion>(entity =>
        {
            entity.HasKey(e => e.PromotionId).HasName("PK__Promotio__52C42F2F2AAD4369");

            entity.ToTable("Promotion");

            entity.Property(e => e.PromotionId)
                .ValueGeneratedNever()
                .HasColumnName("PromotionID");
            entity.Property(e => e.ApplicableTo).HasMaxLength(50);
            entity.Property(e => e.Name).HasMaxLength(100);
            entity.Property(e => e.Type).HasMaxLength(50);
            entity.Property(e => e.Value).HasColumnType("decimal(10, 2)");

            entity.HasMany(d => d.Branches).WithMany(p => p.Promotions)
                .UsingEntity<Dictionary<string, object>>(
                    "PromotionBranch",
                    r => r.HasOne<Branch>().WithMany()
                        .HasForeignKey("BranchId")
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("FK__Promotion__Branc__6E01572D"),
                    l => l.HasOne<Promotion>().WithMany()
                        .HasForeignKey("PromotionId")
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("FK__Promotion__Promo__6D0D32F4"),
                    j =>
                    {
                        j.HasKey("PromotionId", "BranchId").HasName("PK__Promotio__18D2ADD51A60BCE9");
                        j.ToTable("PromotionBranch");
                        j.IndexerProperty<int>("PromotionId").HasColumnName("PromotionID");
                        j.IndexerProperty<int>("BranchId").HasColumnName("BranchID");
                    });
        });

        modelBuilder.Entity<Review>(entity =>
        {
            entity.HasKey(e => e.ReviewId).HasName("PK__Review__74BC79AE0FA32303");

            entity.ToTable("Review");

            entity.Property(e => e.ReviewId).HasColumnName("ReviewID");
            entity.Property(e => e.BranchId).HasColumnName("BranchID");
            entity.Property(e => e.Comment).HasMaxLength(500);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(sysdatetime())");
            entity.Property(e => e.CustomerId).HasColumnName("CustomerID");
            entity.Property(e => e.EmployeeId).HasColumnName("EmployeeID");

            entity.HasOne(d => d.Branch).WithMany(p => p.Reviews)
                .HasForeignKey(d => d.BranchId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Review__BranchID__43D61337");

            entity.HasOne(d => d.Customer).WithMany(p => p.Reviews)
                .HasForeignKey(d => d.CustomerId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Review__Customer__42E1EEFE");

            entity.HasOne(d => d.Employee).WithMany(p => p.Reviews)
                .HasForeignKey(d => d.EmployeeId)
                .HasConstraintName("FK__Review__Employee__44CA3770");
        });

        modelBuilder.Entity<Service>(entity =>
        {
            entity.HasKey(e => e.ServiceId).HasName("PK__Service__C51BB0EA014B10BA");

            entity.ToTable("Service");

            entity.HasIndex(e => e.Name, "UQ__Service__737584F63CCD4376").IsUnique();

            entity.Property(e => e.ServiceId).HasColumnName("ServiceID");
            entity.Property(e => e.BasePrice).HasColumnType("decimal(14, 2)");
            entity.Property(e => e.Description).HasMaxLength(255);
            entity.Property(e => e.Name).HasMaxLength(100);
            entity.Property(e => e.ServiceType).HasMaxLength(30);
        });

        modelBuilder.Entity<ServiceVaccination>(entity =>
        {
            entity.HasKey(e => e.VaccinationId).HasName("PK__ServiceV__466BCFA75B461AC1");

            entity.ToTable("ServiceVaccination");

            entity.Property(e => e.VaccinationId).HasColumnName("VaccinationID");
            entity.Property(e => e.Date).HasColumnType("datetime");
            entity.Property(e => e.VaccineId).HasColumnName("VaccineID");

            entity.HasOne(d => d.Vaccine).WithMany(p => p.ServiceVaccinations)
                .HasForeignKey(d => d.VaccineId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_ServiceVaccination_Vaccine");
        });

        modelBuilder.Entity<Vaccine>(entity =>
        {
            entity.HasKey(e => e.VaccineId).HasName("PK__Vaccine__45DC68E9B5FCDE3E");

            entity.ToTable("Vaccine");

            entity.Property(e => e.VaccineId).HasColumnName("VaccineID");
            entity.Property(e => e.Description).HasMaxLength(255);
            entity.Property(e => e.StandardDose).HasColumnType("decimal(6, 2)");
            entity.Property(e => e.Type).HasMaxLength(50);
        });

        modelBuilder.Entity<VaccineBatch>(entity =>
        {
            entity.HasKey(e => e.BatchId).HasName("PK__VaccineB__5D55CE380B81CF5B");

            entity.ToTable("VaccineBatch");

            entity.Property(e => e.BatchId).HasColumnName("BatchID");
            entity.Property(e => e.BranchId).HasColumnName("BranchID");
            entity.Property(e => e.VaccineId).HasColumnName("VaccineID");

            entity.HasOne(d => d.Branch).WithMany(p => p.VaccineBatches)
                .HasForeignKey(d => d.BranchId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__VaccineBa__Branc__60A75C0F");

            entity.HasOne(d => d.Vaccine).WithMany(p => p.VaccineBatches)
                .HasForeignKey(d => d.VaccineId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__VaccineBa__Vacci__5FB337D6");
        });

        modelBuilder.Entity<VaccinePackage>(entity =>
        {
            entity.HasKey(e => e.PackageId).HasName("PK__VaccineP__322035ECFCF38554");

            entity.ToTable("VaccinePackage");

            entity.Property(e => e.PackageId).HasColumnName("PackageID");
            entity.Property(e => e.DiscountPercent).HasColumnType("decimal(5, 2)");
            entity.Property(e => e.Item).HasMaxLength(255);
            entity.Property(e => e.Name).HasMaxLength(100);
            entity.Property(e => e.Price).HasColumnType("decimal(14, 2)");
        });

        modelBuilder.Entity<VaccinePackageItem>(entity =>
        {
            entity.HasKey(e => new { e.PackageId, e.VaccineId }).HasName("PK__VaccineP__B67DF36287DD5B8C");

            entity.ToTable("VaccinePackageItem");

            entity.Property(e => e.PackageId).HasColumnName("PackageID");
            entity.Property(e => e.VaccineId).HasColumnName("VaccineID");
            entity.Property(e => e.Dose).HasColumnType("decimal(6, 2)");

            entity.HasOne(d => d.Package).WithMany(p => p.VaccinePackageItems)
                .HasForeignKey(d => d.PackageId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__VaccinePa__Packa__534D60F1");

            entity.HasOne(d => d.Vaccine).WithMany(p => p.VaccinePackageItems)
                .HasForeignKey(d => d.VaccineId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__VaccinePa__Vacci__5441852A");
        });

        modelBuilder.Entity<VaccineRecord>(entity =>
        {
            entity.HasKey(e => e.VaccinationRecordId).HasName("PK__VaccineR__AEF2975C305C155D");

            entity.ToTable("VaccineRecord");

            entity.Property(e => e.VaccinationRecordId).HasColumnName("VaccinationRecordID");
            entity.Property(e => e.BranchId).HasColumnName("BranchID");
            entity.Property(e => e.DoctorId).HasColumnName("DoctorID");
            entity.Property(e => e.Dose).HasColumnType("decimal(6, 2)");
            entity.Property(e => e.InvoiceItemId).HasColumnName("InvoiceItemID");
            entity.Property(e => e.PetId).HasColumnName("PetID");
            entity.Property(e => e.VaccineId).HasColumnName("VaccineID");

            entity.HasOne(d => d.Branch).WithMany(p => p.VaccineRecords)
                .HasForeignKey(d => d.BranchId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__VaccineRe__Branc__540C7B00");

            entity.HasOne(d => d.Doctor).WithMany(p => p.VaccineRecords)
                .HasForeignKey(d => d.DoctorId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__VaccineRe__Docto__55009F39");

            entity.HasOne(d => d.InvoiceItem).WithMany(p => p.VaccineRecords)
                .HasForeignKey(d => d.InvoiceItemId)
                .HasConstraintName("FK__VaccineRe__Invoi__55F4C372");

            entity.HasOne(d => d.Pet).WithMany(p => p.VaccineRecords)
                .HasForeignKey(d => d.PetId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__VaccineRe__PetID__5224328E");

            entity.HasOne(d => d.Vaccine).WithMany(p => p.VaccineRecords)
                .HasForeignKey(d => d.VaccineId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__VaccineRe__Vacci__531856C7");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
