using AutoMapper;
using PetCareX.Api.Dtos;
using PetCareX.Api.Models;

namespace PetCareX.Api.Mapping;

/// <summary>
/// AutoMapper profile mapping entity models to DTOs and vice versa.
/// </summary>
public class MappingProfile : Profile
{
    /// <summary>
    /// Initializes mapping configuration between entities and DTOs.
    /// </summary>
    public MappingProfile()
    {
        CreateMap<Customer, CustomerDto>()
            .ForMember(dest => dest.MembershipTier, opt => opt.MapFrom(src => src.MembershipTier != null ? src.MembershipTier.Name : null))
            .ForMember(dest => dest.Cccd, opt => opt.MapFrom(src => src.Cccd))
            .ForMember(dest => dest.Pets, opt => opt.MapFrom(src => src.Pets));
        CreateMap<Pet, PetDto>()
            .ForMember(dest => dest.BirthDate, opt => opt.MapFrom(src => src.BirthDate.HasValue ? src.BirthDate.Value.ToDateTime(TimeOnly.MinValue) : (DateTime?)null));
        CreateMap<Booking, BookingDto>()
            .ForMember(dest => dest.DoctorName, opt => opt.MapFrom(src => src.Doctor != null ? src.Doctor.FullName : null))
            .ForMember(dest => dest.DoctorId, opt => opt.MapFrom(src => src.DoctorId));

            // reverse maps if needed
            CreateMap<CustomerDto, Customer>()
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember, destMember, ctx) => srcMember != null));
            CreateMap<PetDto, Pet>()
                .ForMember(dest => dest.BirthDate, opt => opt.MapFrom(src => src.BirthDate.HasValue ? DateOnly.FromDateTime(src.BirthDate.Value) : (DateOnly?)null));
            CreateMap<BookingDto, Booking>();

            // Additional mappings for generated DTOs
            CreateMap<Promotion, PromotionDto>();
            CreateMap<PromotionDto, Promotion>();

            CreateMap<Service, ServiceDto>();
            CreateMap<ServiceDto, Service>();

            CreateMap<Review, ReviewDto>();
            CreateMap<ReviewDto, Review>();

            CreateMap<ServiceVaccination, ServiceVaccinationDto>();
            CreateMap<ServiceVaccinationDto, ServiceVaccination>();

            CreateMap<Product, ProductDto>()
                .ForMember(dest => dest.Quantity, opt => opt.MapFrom(src => src.StockQty));
            CreateMap<ProductDto, Product>()
                .ForMember(dest => dest.StockQty, opt => opt.MapFrom(src => src.Quantity ?? src.StockQty ?? 0))
                .ForMember(dest => dest.Price, opt => opt.MapFrom(src => src.Price ?? 0))
                .ForMember(dest => dest.ReorderPoint, opt => opt.MapFrom(src => src.ReorderPoint ?? 10))
                .ForMember(dest => dest.Category, opt => opt.MapFrom(src => src.Category ?? ""));

            CreateMap<Position, PositionDto>();
            CreateMap<PositionDto, Position>();

            CreateMap<MembershipTier, MembershipTierDto>();
            CreateMap<MembershipTierDto, MembershipTier>();

            CreateMap<Vaccine, VaccineDto>();
            CreateMap<VaccineDto, Vaccine>();

            CreateMap<VaccineBatch, VaccineBatchDto>();
            CreateMap<VaccineBatchDto, VaccineBatch>();

            CreateMap<VaccineRecord, VaccineRecordDto>();
            CreateMap<VaccineRecordDto, VaccineRecord>();

            CreateMap<VaccinePackageItem, VaccinePackageItemDto>();
            CreateMap<VaccinePackageItemDto, VaccinePackageItem>();

            CreateMap<VaccinePackage, VaccinePackageDto>();
            CreateMap<VaccinePackageDto, VaccinePackage>();

            CreateMap<LoyaltyTransaction, LoyaltyTransactionDto>();
            CreateMap<LoyaltyTransactionDto, LoyaltyTransaction>();

            CreateMap<InvoiceItem, InvoiceItemDto>()
                .ForMember(dest => dest.ProductName, opt => opt.MapFrom(src => src.Product != null ? src.Product.Name : null))
                .ForMember(dest => dest.ServiceName, opt => opt.MapFrom(src => src.Service != null ? src.Service.Name : null))
                .ForMember(dest => dest.Category, opt => opt.MapFrom(src => src.Product != null ? src.Product.Category : null))
                .ForMember(dest => dest.Description, opt => opt.MapFrom(src => src.Product != null ? src.Product.Description : null))
                .ForMember(dest => dest.Price, opt => opt.MapFrom(src => src.Product != null ? src.Product.Price : (decimal?)null))
                .ForMember(dest => dest.StockQty, opt => opt.MapFrom(src => src.Product != null ? src.Product.StockQty : (int?)null));
            CreateMap<InvoiceItemDto, InvoiceItem>();

            CreateMap<Invoice, InvoiceDto>()
                .ForMember(dest => dest.BranchName, opt => opt.MapFrom(src => src.Branch != null ? src.Branch.Name : null))
                .ForMember(dest => dest.CustomerName, opt => opt.MapFrom(src => src.Customer != null ? src.Customer.FullName : null))
                .ForMember(dest => dest.CustomerPhone, opt => opt.MapFrom(src => src.Customer != null ? src.Customer.Phone : null))
                .ForMember(dest => dest.CustomerEmail, opt => opt.MapFrom(src => src.Customer != null ? src.Customer.Email : null))
                .ForMember(dest => dest.Items, opt => opt.MapFrom(src => src.InvoiceItems));
            CreateMap<InvoiceDto, Invoice>();

            CreateMap<EmployeeHistory, EmployeeHistoryDto>();
            CreateMap<EmployeeHistoryDto, EmployeeHistory>();

            CreateMap<Employee, EmployeeDto>();
            CreateMap<EmployeeDto, Employee>();

            CreateMap<CheckHealth, CheckHealthDto>();
            CreateMap<CheckHealthDto, CheckHealth>();

            CreateMap<BranchService, BranchServiceDto>();
            CreateMap<BranchServiceDto, BranchService>();

            CreateMap<Branch, BranchDto>();
            CreateMap<BranchDto, Branch>();

            CreateMap<BookingHistory, BookingHistoryDto>();
            CreateMap<BookingHistoryDto, BookingHistory>();

            CreateMap<Employee, EmployeeDto>()
                .ForMember(dest => dest.Branch, opt => opt.MapFrom(src => src.Branch))
                .ForMember(dest => dest.Position, opt => opt.MapFrom(src => src.Position));
            CreateMap<EmployeeDto, Employee>();
    }
}
