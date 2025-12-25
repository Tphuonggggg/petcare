// Frontend TypeScript interfaces mirroring the SQL schema

export interface Vaccine {
  vaccineId: number
  type: string
  description?: string | null
  standardDose: number
}

export interface VaccinePackage {
  packageId: number
  name: string
  durationMonths: number
  price: number
  discountPercent: number
  item?: string | null
}

export interface VaccinePackageItem {
  packageId: number
  vaccineId: number
  relativeMonth: number
  dose: number
}

export interface Branch {
  branchId: number
  name: string
  phone?: string | null
  openTime?: string | null
  closeTime?: string | null
  address?: string | null
}

export interface Service {
  serviceId: number
  name: string
  serviceType: string
  basePrice: number
  description?: string | null
}

export interface VaccineBatch {
  batchId: number
  vaccineId: number
  branchId: number
  manufactureDate: string
  expiryDate: string
  quantity: number
}

export interface Promotion {
  promotionId: number
  name: string
  type: string
  value: number
  startDate: string
  endDate: string
  applicableTo: string
}

// Add more types as needed

export default {}
