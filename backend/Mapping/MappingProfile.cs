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
            .ForMember(dest => dest.Cccd, opt => opt.MapFrom(src => src.Cccd));
        CreateMap<Pet, PetDto>();
        CreateMap<Booking, BookingDto>();

            // reverse maps if needed
            CreateMap<CustomerDto, Customer>()
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember, destMember, ctx) => srcMember != null));
            CreateMap<PetDto, Pet>();
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

            CreateMap<Product, ProductDto>();
            CreateMap<ProductDto, Product>();

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

            CreateMap<InvoiceItem, InvoiceItemDto>();
            CreateMap<InvoiceItemDto, InvoiceItem>();

            CreateMap<Invoice, InvoiceDto>();
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
    }
}
