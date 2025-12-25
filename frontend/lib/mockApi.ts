// Lightweight in-memory mock API for frontend-only development
// Supports customers, bookings and invoices with simple localStorage persistence.

type Customer = {
  customerId: number
  fullName: string
  email?: string
  phone?: string
  address?: string
  membershipTier?: string
  pointsBalance?: number
  birthDate?: string | null
  branchId?: number
  gender?: string | null
}

type Booking = {
  bookingId: number
  customerId: number
  serviceName: string
  date: string // yyyy-MM-dd
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled'
  total?: number
  branchId?: number
}

type Invoice = {
  invoiceId: number
  bookingId?: number
  customerId: number
  amount: number
  issuedAt: string // ISO
  paid: boolean
}

type Product = {
  id: number
  name: string
  category?: string
  price: number
  unit?: string
  stock?: number
  description?: string
}

type Pet = {
  petId: number
  customerId: number
  name: string
  species?: string
  breed?: string
  birthDate?: string | null
  gender?: string | null
  notes?: string
  branchId?: number
}

type Branch = {
  id: number
  name: string
  address?: string
  phone?: string
  manager?: string
  status?: string
}

type Employee = {
  employeeId: number
  fullName: string
  email: string
  role?: string
  branchId?: number
}

type VetRecord = {
  id: number
  petId: number
  petName?: string
  notes: string
  createdAt: string
  branchId?: number
  vetEmail?: string
}

type ServiceType = {
  serviceId: number
  name: string
  price?: number
  description?: string
  branchId?: number
}

const STORAGE_CUSTOMERS = 'mock_customers_v1'
const STORAGE_BOOKINGS = 'mock_bookings_v1'
const STORAGE_INVOICES = 'mock_invoices_v1'
const STORAGE_PRODUCTS = 'mock_products_v1'
const STORAGE_PETS = 'mock_pets_v1'
const STORAGE_BRANCHES = 'mock_branches_v1'
const STORAGE_EMPLOYEES = 'mock_employees_v1'
const STORAGE_VET_RECORDS = 'mock_vet_records_v1'
const STORAGE_SERVICES = 'mock_services_v1'
const STORAGE_VACCINES = 'mock_vaccines_v1'
const STORAGE_VACCINE_PACKAGES = 'mock_vaccine_packages_v1'
const STORAGE_VACCINE_PACKAGE_ITEMS = 'mock_vaccine_package_items_v1'
const STORAGE_VACCINE_BATCHES = 'mock_vaccine_batches_v1'
const STORAGE_PROMOTIONS = 'mock_promotions_v1'
const STORAGE_BRANCH_SERVICES = 'mock_branch_services_v1'
const STORAGE_POSITIONS = 'mock_positions_v1'
const STORAGE_EMPLOYEE_HISTORIES = 'mock_employee_histories_v1'
const STORAGE_MEMBERSHIP_TIERS = 'mock_membership_tiers_v1'
const STORAGE_INVOICE_ITEMS = 'mock_invoice_items_v1'
const STORAGE_VACCINE_RECORDS = 'mock_vaccine_records_v1'

function seedCustomers(): Customer[] {
  return [
    { customerId: 1, fullName: 'Nguyễn Văn A', email: 'customer1@gmail.com', phone: '0900000001', address: 'Hà Nội', membershipTier: 'Silver', pointsBalance: 120, birthDate: '1985-07-07', gender: 'M', branchId: 1 },
    { customerId: 2, fullName: 'Trần Thị B', email: 'customer2@gmail.com', phone: '0900000002', address: 'Hồ Chí Minh', membershipTier: 'VIP', pointsBalance: 2300, birthDate: '1990-03-15', gender: 'F', branchId: 2 },
  ]
}

function seedBookings(): Booking[] {
  return [
    { bookingId: 1, customerId: 1, serviceName: 'Spa for dog', date: '2025-12-01', status: 'Completed', total: 200, branchId: 1 },
    { bookingId: 2, customerId: 1, serviceName: 'Vaccination', date: '2025-12-20', status: 'Confirmed', total: 150, branchId: 1 },
    { bookingId: 3, customerId: 2, serviceName: 'Grooming', date: '2025-11-15', status: 'Completed', total: 120, branchId: 2 },
  ]
}

function seedInvoices(): Invoice[] {
  return [
    { invoiceId: 1, bookingId: 1, customerId: 1, amount: 200, issuedAt: new Date('2025-12-01').toISOString(), paid: true },
    { invoiceId: 2, bookingId: 2, customerId: 1, amount: 150, issuedAt: new Date('2025-12-20').toISOString(), paid: false },
  ]
}

function seedProducts(): Product[] {
  return [
    { id: 1, name: 'Thức ăn cho chó Royal Canin', category: 'Thức ăn', price: 450, unit: 'Túi 2kg', stock: 150, description: 'Thức ăn cao cấp cho chó.' },
    { id: 2, name: 'Thuốc tẩy giun Drontal', category: 'Thuốc', price: 120, unit: 'Hộp 10 viên', stock: 80, description: 'Điều trị giun sán cho chó mèo.' },
    { id: 3, name: 'Vòng cổ phát sáng LED', category: 'Phụ kiện', price: 95, unit: 'Chiếc', stock: 45, description: 'Vòng cổ an toàn ban đêm.' },
    { id: 4, name: 'Cát vệ sinh cho mèo', category: 'Vệ sinh', price: 180, unit: 'Túi 5kg', stock: 200, description: 'Cát vệ sinh thấm hút tốt.' },
  ]
}

function seedPets(): Pet[] {
  return [
    { petId: 1, customerId: 1, name: 'Bingo', species: 'Dog', breed: 'Labrador', birthDate: '2020-05-01', gender: 'M', notes: 'Very friendly', branchId: 1 },
    { petId: 2, customerId: 1, name: 'Mimi', species: 'Cat', breed: 'Siamese', birthDate: '2019-11-12', gender: 'F', notes: '', branchId: 1 },
    { petId: 3, customerId: 2, name: 'Cuddles', species: 'Rabbit', breed: 'Netherland Dwarf', birthDate: '2021-03-03', gender: 'F', notes: 'Needs special diet', branchId: 2 },
  ]
}

function seedEmployees(): Employee[] {
  return [
    { employeeId: 1, fullName: 'Nhân viên Tiếp tân 1', email: 'receptionist@petcare.vn', role: 'receptionist', branchId: 1, code: 'EMP001' },
    { employeeId: 2, fullName: 'Nhân viên Bán hàng 1', email: 'sales@petcare.vn', role: 'sales', branchId: 2, code: 'EMP002' },
    { employeeId: 3, fullName: 'Admin', email: 'admin@petcare.vn', role: 'admin', branchId: undefined, code: 'ADMIN' },
    { employeeId: 4, fullName: 'Bác sĩ Thú y 1', email: 'vet@petcare.vn', role: 'vet', branchId: 1, code: 'EMP004' },
    { employeeId: 5, fullName: 'Quản lý Chi nhánh 1', email: 'manager@petcare.vn', role: 'branch_manager', branchId: 2, code: 'MGR001' },
  ]
}

function seedServices(): ServiceType[] {
  return [
    { serviceId: 1, name: 'Khám bệnh tổng quát', price: 150, description: 'Khám sức khỏe tổng quát cho thú cưng', branchId: 1 },
    { serviceId: 2, name: 'Tiêm phòng cơ bản', price: 200, description: 'Tiêm phòng vắc xin cơ bản', branchId: 1 },
    { serviceId: 3, name: 'Cắt tỉa lông', price: 120, description: 'Grooming và cắt tỉa lông', branchId: 2 },
  ]
}

function seedVetRecords(): VetRecord[] {
  return [
    { id: 1, petId: 1, petName: 'Bingo', notes: 'Khám định kỳ: sức khỏe tốt.', createdAt: new Date('2025-12-01T09:30:00').toISOString(), branchId: 1, vetEmail: 'vet@petcare.vn' },
    { id: 2, petId: 2, petName: 'Mimi', notes: 'Tiêm phòng mũi A; theo dõi phản ứng.', createdAt: new Date('2025-12-02T11:00:00').toISOString(), branchId: 1, vetEmail: 'vet@petcare.vn' },
  ]
}

function seedBranches(): Branch[] {
  return [
    { id: 1, name: 'Chi nhánh Quận 1', address: '123 Nguyễn Huệ, Quận 1, TP.HCM', phone: '028-1234-5678', manager: 'Nguyễn Văn Manager', status: 'Đang hoạt động' },
    { id: 2, name: 'Chi nhánh Quận 3', address: '456 Lê Văn Sỹ, Quận 3, TP.HCM', phone: '028-8765-4321', manager: 'Trần Thị Quản Lý', status: 'Đang hoạt động' },
    { id: 3, name: 'Chi nhánh Quận 10', address: '789 Ba Tháng Hai, Quận 10, TP.HCM', phone: '028-9999-8888', manager: 'Lê Văn Trưởng', status: 'Tạm ngưng' },
  ]
}

type Vaccine = {
  VaccineID: number
  Type: string
  Description?: string
  StandardDose: number
}

type VaccinePackage = {
  PackageID: number
  Name: string
  DurationMonths: number
  Price: number
  DiscountPercent: number
  Item?: string
}

type VaccinePackageItem = {
  PackageID: number
  VaccineID: number
  RelativeMonth: number
  Dose: number
}

type VaccineBatch = {
  BatchID: number
  VaccineID: number
  BranchID: number
  ManufactureDate: string
  ExpiryDate: string
  Quantity: number
}

type PromotionType = {
  PromotionID: number
  Name: string
  Type: string
  Value: number
  StartDate: string
  EndDate: string
  ApplicableTo: string
}

type BranchServiceType = {
  BranchID: number
  ServiceID: number
  Price?: number
  Active?: boolean
}

type PositionType = {
  PositionID: number
  Name: string
  Description?: string
}

type EmployeeHistoryType = {
  EmployeeID: number
  BranchID: number
  StartDate: string
  EndDate?: string | null
}

type MembershipTierType = {
  MembershipTierID: number
  Name: string
  MinSpend?: number
  MaintainSpend?: number
  Benefits?: string
}

type InvoiceItemType = {
  InvoiceItemID: number
  InvoiceID: number
  ItemType: string
  ProductID?: number | null
  ServiceID?: number | null
  Quantity: number
  UnitPrice: number
}

type VaccineRecordType = {
  VaccinationRecordID: number
  PetID: number
  VaccineID: number
  BranchID: number
  DoctorID: number
  InvoiceItemID?: number | null
  Dose: number
  DateAdministered: string
  NextDueDate?: string | null
}

function seedVaccines(): Vaccine[] {
  return [
    { VaccineID: 1, Type: 'Rabies', Description: 'Vaccine for rabies', StandardDose: 1.0 },
    { VaccineID: 2, Type: 'Distemper', Description: 'Canine distemper vaccine', StandardDose: 1.0 },
  ]
}

function seedVaccinePackages(): VaccinePackage[] {
  return [
    { PackageID: 1, Name: 'Puppy Basic', DurationMonths: 6, Price: 250.00, DiscountPercent: 5.0, Item: 'Rabies;Distemper' },
  ]
}

function seedVaccinePackageItems(): VaccinePackageItem[] {
  return [
    { PackageID: 1, VaccineID: 1, RelativeMonth: 1, Dose: 1.0 },
    { PackageID: 1, VaccineID: 2, RelativeMonth: 2, Dose: 1.0 },
  ]
}

function seedVaccineBatches(): VaccineBatch[] {
  return [
    { BatchID: 1, VaccineID: 1, BranchID: 1, ManufactureDate: '2025-01-01', ExpiryDate: '2026-01-01', Quantity: 100 },
  ]
}

function seedPromotions(): PromotionType[] {
  return [
    { PromotionID: 1, Name: 'Summer Sale', Type: 'PERCENT', Value: 10.0, StartDate: '2025-06-01', EndDate: '2025-06-30', ApplicableTo: 'SERVICE' },
  ]
}

function seedBranchServices(): BranchServiceType[] {
  return [
    { BranchID: 1, ServiceID: 1, Price: 150, Active: true },
  ]
}

function seedPositions(): PositionType[] {
  return [
    { PositionID: 1, Name: 'Receptionist', Description: 'Handles front desk' },
    { PositionID: 2, Name: 'Veterinarian', Description: 'Clinical veterinarian' },
  ]
}

function seedEmployeeHistories(): EmployeeHistoryType[] {
  return [
    { EmployeeID: 4, BranchID: 1, StartDate: '2024-01-01', EndDate: null },
  ]
}

function seedMembershipTiers(): MembershipTierType[] {
  return [
    { MembershipTierID: 1, Name: 'Standard', MinSpend: 0, MaintainSpend: 0, Benefits: 'Basic' },
    { MembershipTierID: 2, Name: 'VIP', MinSpend: 1000, MaintainSpend: 800, Benefits: 'Discounts' },
  ]
}

function seedInvoiceItems(): InvoiceItemType[] {
  return [
    { InvoiceItemID: 1, InvoiceID: 1, ItemType: 'SERVICE', ProductID: null, ServiceID: 1, Quantity: 1, UnitPrice: 150 },
  ]
}

function seedVaccineRecords(): VaccineRecordType[] {
  return [
    { VaccinationRecordID: 1, PetID: 1, VaccineID: 1, BranchID: 1, DoctorID: 4, InvoiceItemID: 1, Dose: 1.0, DateAdministered: '2025-12-01', NextDueDate: '2026-12-01' },
  ]
}

function load<T>(key: string, seed: () => T[]): T[] {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) {
      const s = seed()
      localStorage.setItem(key, JSON.stringify(s))
      return s
    }
    return JSON.parse(raw)
  } catch {
    const s = seed()
    localStorage.setItem(key, JSON.stringify(s))
    return s
  }
}

function save<T>(key: string, data: T[]) {
  localStorage.setItem(key, JSON.stringify(data))
}

function delay(ms = 150) {
  return new Promise((r) => setTimeout(r, ms))
}

// Customers, Bookings, Invoices - support optional ?customerId= filter
export async function apiGet(path: string) {
  await delay()
  const pRaw = path.replace(/^\//, '')
  const [p, qs] = pRaw.split('?')
  const params = new URLSearchParams(qs || '')

  // Customers
  if (p.startsWith('customers')) {
    const parts = p.split('/')
    let items = load<Customer>(STORAGE_CUSTOMERS, seedCustomers)
    const branchId = params.get('branchId')
    if (branchId) {
      const b = Number(branchId)
      items = items.filter(c => c.branchId === b)
    }
    if (parts.length === 1 || parts[1] === '') return items
    const id = Number(parts[1])
    const found = items.find(c => c.customerId === id)
    if (!found) throw new Error('Not found')
    return found
  }

  // Bookings
  if (p.startsWith('bookings')) {
    const parts = p.split('/')
    let items = load<Booking>(STORAGE_BOOKINGS, seedBookings)
    // filter by query ?customerId=1
    const customerId = params.get('customerId')
    const branchId = params.get('branchId')
    const date = params.get('date')
    if (customerId) {
      const idNum = Number(customerId)
      items = items.filter(b => b.customerId === idNum)
    }
    if (branchId) {
      const b = Number(branchId)
      items = items.filter(bk => bk.branchId === b)
    }
    if (date) {
      items = items.filter(bk => bk.date === date)
    }
    if (parts.length === 1 || parts[1] === '') return items
    const id = Number(parts[1])
    const found = items.find(b => b.bookingId === id)
    if (!found) throw new Error('Not found')
    return found
  }

  // Invoices
  if (p.startsWith('invoices')) {
    const parts = p.split('/')
    let items = load<Invoice>(STORAGE_INVOICES, seedInvoices)
    const customerId = params.get('customerId')
    if (customerId) {
      const idNum = Number(customerId)
      items = items.filter(i => i.customerId === idNum)
    }
    if (parts.length === 1 || parts[1] === '') return items
    const id = Number(parts[1])
    const found = items.find(i => i.invoiceId === id)
    if (!found) throw new Error('Not found')
    return found
  }

  // Products
  if (p.startsWith('products')) {
    const parts = p.split('/')
    const items = load<Product>(STORAGE_PRODUCTS, seedProducts)
    if (parts.length === 1 || parts[1] === '') return items
    const id = Number(parts[1])
    const found = items.find(i => i.id === id)
    if (!found) throw new Error('Not found')
    return found
  }

  // Pets
  if (p.startsWith('pets')) {
    const parts = p.split('/')
    let items = load<Pet>(STORAGE_PETS, seedPets)
    const customerId = params.get('customerId')
    const branchId = params.get('branchId')
    if (customerId) {
      const idNum = Number(customerId)
      items = items.filter(pt => pt.customerId === idNum)
    }
    if (branchId) {
      const b = Number(branchId)
      items = items.filter(pt => pt.branchId === b)
    }
    if (parts.length === 1 || parts[1] === '') return items
    const id = Number(parts[1])
    const found = items.find(i => i.petId === id)
    if (!found) throw new Error('Not found')
    return found
  }

  // Branches
  if (p.startsWith('branches')) {
    const parts = p.split('/')
    const items = load<Branch>(STORAGE_BRANCHES, seedBranches)
    if (parts.length === 1 || parts[1] === '') return items
    const id = Number(parts[1])
    const found = items.find(i => i.id === id)
    if (!found) throw new Error('Not found')
    return found
  }

  // Employees
  if (p.startsWith('employees')) {
    const parts = p.split('/')
    let items = load<Employee>(STORAGE_EMPLOYEES, seedEmployees)
    const email = params.get('email')
    const code = params.get('code')
    if (email) {
      const found = items.find(e => e.email?.toLowerCase() === email.toLowerCase())
      if (!found) throw new Error('Not found')
      return found
    }
    if (code) {
      const found = items.find(e => String(e.employeeId) === String(code) || (e as any).code === code)
      if (!found) throw new Error('Not found')
      return found
    }
    if (parts.length === 1 || parts[1] === '') return items
    const id = Number(parts[1])
    const found = items.find(i => i.employeeId === id)
    if (!found) throw new Error('Not found')
    return found
  }

  // Vet records (medical notes)
  if (p.startsWith('vetrecords')) {
    const parts = p.split('/')
    let items = load<VetRecord>(STORAGE_VET_RECORDS, seedVetRecords)
    const petId = params.get('petId')
    const branchId = params.get('branchId')
    if (petId) items = items.filter(r => r.petId === Number(petId))
    if (branchId) items = items.filter(r => r.branchId === Number(branchId))
    if (parts.length === 1 || parts[1] === '') return items
    const id = Number(parts[1])
    const found = items.find(i => i.id === id)
    if (!found) throw new Error('Not found')
    return found
  }

  // Services
  if (p.startsWith('services')) {
    const parts = p.split('/')
    const items = load<ServiceType>(STORAGE_SERVICES, seedServices)
    if (parts.length === 1 || parts[1] === '') return items
    const id = Number(parts[1])
    const found = items.find(i => i.serviceId === id || (i as any).id === id)
    if (!found) throw new Error('Not found')
    return found
  }

  // Vaccines
  if (p.startsWith('vaccines')) {
    const parts = p.split('/')
    const items = load<Vaccine>(STORAGE_VACCINES, seedVaccines)
    if (parts.length === 1 || parts[1] === '') return items
    const id = Number(parts[1])
    const found = items.find(i => i.VaccineID === id || (i as any).VaccineID === id)
    if (!found) throw new Error('Not found')
    return found
  }

  // VaccinePackages
  if (p.startsWith('vaccinepackages')) {
    const parts = p.split('/')
    const items = load<VaccinePackage>(STORAGE_VACCINE_PACKAGES, seedVaccinePackages)
    if (parts.length === 1 || parts[1] === '') return items
    const id = Number(parts[1])
    const found = items.find(i => i.PackageID === id)
    if (!found) throw new Error('Not found')
    return found
  }

  // VaccinePackageItems
  if (p.startsWith('vaccinepackageitems')) {
    const items = load<VaccinePackageItem>(STORAGE_VACCINE_PACKAGE_ITEMS, seedVaccinePackageItems)
    return items
  }

  // VaccineBatches
  if (p.startsWith('vaccinebatches')) {
    const parts = p.split('/')
    const items = load<VaccineBatch>(STORAGE_VACCINE_BATCHES, seedVaccineBatches)
    if (parts.length === 1 || parts[1] === '') return items
    const id = Number(parts[1])
    const found = items.find(i => i.BatchID === id)
    if (!found) throw new Error('Not found')
    return found
  }

  // Promotions
  if (p.startsWith('promotions')) {
    const parts = p.split('/')
    const items = load<PromotionType>(STORAGE_PROMOTIONS, seedPromotions)
    if (parts.length === 1 || parts[1] === '') return items
    const id = Number(parts[1])
    const found = items.find(i => i.PromotionID === id)
    if (!found) throw new Error('Not found')
    return found
  }

  // BranchServices
  if (p.startsWith('branchservices')) {
    const items = load<BranchServiceType>(STORAGE_BRANCH_SERVICES, seedBranchServices)
    return items
  }

  // Positions
  if (p.startsWith('positions')) {
    const items = load<PositionType>(STORAGE_POSITIONS, seedPositions)
    return items
  }

  // EmployeeHistories
  if (p.startsWith('employeehistories')) {
    const items = load<EmployeeHistoryType>(STORAGE_EMPLOYEE_HISTORIES, seedEmployeeHistories)
    return items
  }

  // MembershipTiers
  if (p.startsWith('membershiptiers')) {
    const items = load<MembershipTierType>(STORAGE_MEMBERSHIP_TIERS, seedMembershipTiers)
    return items
  }

  // InvoiceItems
  if (p.startsWith('invoiceitems')) {
    const parts = p.split('/')
    const items = load<InvoiceItemType>(STORAGE_INVOICE_ITEMS, seedInvoiceItems)
    if (parts.length === 1 || parts[1] === '') return items
    const id = Number(parts[1])
    const found = items.find(i => i.InvoiceItemID === id)
    if (!found) throw new Error('Not found')
    return found
  }

  // VaccineRecords (detailed vaccination records)
  if (p.startsWith('vaccinerecords')) {
    const items = load<VaccineRecordType>(STORAGE_VACCINE_RECORDS, seedVaccineRecords)
    return items
  }

  throw new Error('Mock route not implemented: ' + path)
}

export async function apiPost(path: string, body: any) {
  await delay()
  const p = path.replace(/^\//, '')
  if (p === 'customers') {
    const items = load<Customer>(STORAGE_CUSTOMERS, seedCustomers)
    const nextId = items.reduce((m, c) => Math.max(m, c.customerId), 0) + 1
    const created: Customer = { customerId: nextId, fullName: body.fullName || 'Khách mới', email: body.email, phone: body.phone, address: body.address, membershipTier: body.membershipTier || 'Standard', pointsBalance: body.pointsBalance || 0, birthDate: body.birthDate || null, gender: body.gender || null }
    items.push(created)
    save(STORAGE_CUSTOMERS, items)
    return created
  }

  if (p === 'bookings') {
    const items = load<Booking>(STORAGE_BOOKINGS, seedBookings)
    const nextId = items.reduce((m, b) => Math.max(m, b.bookingId), 0) + 1
    const created: Booking = { bookingId: nextId, customerId: body.customerId || 0, serviceName: body.serviceName || 'Service', date: body.date || new Date().toISOString().slice(0,10), status: body.status || 'Pending', total: body.total || 0 }
    items.push(created)
    save(STORAGE_BOOKINGS, items)
    return created
  }

  if (p === 'invoices') {
    const items = load<Invoice>(STORAGE_INVOICES, seedInvoices)
    const nextId = items.reduce((m, i) => Math.max(m, i.invoiceId), 0) + 1
    const created: Invoice = { invoiceId: nextId, bookingId: body.bookingId, customerId: body.customerId || 0, amount: body.amount || 0, issuedAt: new Date().toISOString(), paid: !!body.paid }
    items.push(created)
    save(STORAGE_INVOICES, items)
    return created
  }

  if (p === 'pets') {
    const items = load<Pet>(STORAGE_PETS, seedPets)
    const nextId = items.reduce((m, x) => Math.max(m, x.petId), 0) + 1
    const created: Pet = { petId: nextId, customerId: body.customerId || 0, name: body.name || 'Pet', species: body.species || '', breed: body.breed || '', birthDate: body.birthDate || null, gender: body.gender || null, notes: body.notes || '' }
    items.push(created)
    save(STORAGE_PETS, items)
    return created
  }

  if (p === 'branches') {
    const items = load<Branch>(STORAGE_BRANCHES, seedBranches)
    const nextId = items.reduce((m, x) => Math.max(m, x.id), 0) + 1
    const created: Branch = { id: nextId, name: body.name || `Branch ${nextId}`, address: body.address || '', phone: body.phone || '', manager: body.manager || '', status: body.status || 'Đang hoạt động' }
    items.push(created)
    save(STORAGE_BRANCHES, items)
    return created
  }

  if (p === 'vetrecords') {
    const items = load<VetRecord>(STORAGE_VET_RECORDS, seedVetRecords)
    const nextId = items.reduce((m, r) => Math.max(m, r.id), 0) + 1
    const created: VetRecord = { id: nextId, petId: body.petId || 0, petName: body.petName || '', notes: body.notes || '', createdAt: new Date().toISOString(), branchId: body.branchId, vetEmail: body.vetEmail }
    items.push(created)
    save(STORAGE_VET_RECORDS, items)
    return created
  }

  if (p === 'services') {
    const items = load<ServiceType>(STORAGE_SERVICES, seedServices)
    const nextId = items.reduce((m, s) => Math.max(m, s.serviceId), 0) + 1
    const created: ServiceType = { serviceId: nextId, name: body.name || `Service ${nextId}`, price: body.price, description: body.description || '', branchId: body.branchId }
    items.push(created)
    save(STORAGE_SERVICES, items)
    return created
  }

  if (p.startsWith('services/')) {
    const id = Number(p.split('/')[1])
    const items = load<ServiceType>(STORAGE_SERVICES, seedServices)
    const idx = items.findIndex(s => s.serviceId === id)
    if (idx === -1) throw new Error('Not found')
    const updated: ServiceType = { ...items[idx], ...body, serviceId: id }
    items[idx] = updated
    save(STORAGE_SERVICES, items)
    return updated
  }

  throw new Error('Mock POST route not implemented: ' + path)
}

export async function apiPut(path: string, body: any) {
  await delay()
  const p = path.replace(/^\//, '')
  if (p.startsWith('customers/')) {
    const id = Number(p.split('/')[1])
    const items = load<Customer>(STORAGE_CUSTOMERS, seedCustomers)
    const idx = items.findIndex(c => c.customerId === id)
    if (idx === -1) throw new Error('Not found')
    const updated = { ...items[idx], ...body, customerId: id }
    items[idx] = updated
    save(STORAGE_CUSTOMERS, items)
    return updated
  }

  if (p.startsWith('bookings/')) {
    const id = Number(p.split('/')[1])
    const items = load<Booking>(STORAGE_BOOKINGS, seedBookings)
    const idx = items.findIndex(b => b.bookingId === id)
    if (idx === -1) throw new Error('Not found')
    const updated = { ...items[idx], ...body, bookingId: id }
    items[idx] = updated
    save(STORAGE_BOOKINGS, items)
    return updated
  }

  if (p.startsWith('invoices/')) {
    const id = Number(p.split('/')[1])
    const items = load<Invoice>(STORAGE_INVOICES, seedInvoices)
    const idx = items.findIndex(i => i.invoiceId === id)
    if (idx === -1) throw new Error('Not found')
    const updated = { ...items[idx], ...body, invoiceId: id }
    items[idx] = updated
    save(STORAGE_INVOICES, items)
    return updated
  }

  if (p.startsWith('pets/')) {
    const id = Number(p.split('/')[1])
    const items = load<Pet>(STORAGE_PETS, seedPets)
    const idx = items.findIndex(b => b.petId === id)
    if (idx === -1) throw new Error('Not found')
    const updated = { ...items[idx], ...body, petId: id }
    items[idx] = updated
    save(STORAGE_PETS, items)
    return updated
  }

  if (p.startsWith('branches/')) {
    const id = Number(p.split('/')[1])
    const items = load<Branch>(STORAGE_BRANCHES, seedBranches)
    const idx = items.findIndex(b => b.id === id)
    if (idx === -1) throw new Error('Not found')
    const updated = { ...items[idx], ...body, id }
    items[idx] = updated
    save(STORAGE_BRANCHES, items)
    return updated
  }

  if (p.startsWith('vetrecords/')) {
    const id = Number(p.split('/')[1])
    const items = load<VetRecord>(STORAGE_VET_RECORDS, seedVetRecords)
    const idx = items.findIndex(r => r.id === id)
    if (idx === -1) throw new Error('Not found')
    const updated = { ...items[idx], ...body, id }
    items[idx] = updated
    save(STORAGE_VET_RECORDS, items)
    return updated
  }

  throw new Error('Mock PUT route not implemented: ' + path)
}

export async function apiDelete(path: string) {
  await delay()
  const p = path.replace(/^\//, '')
  if (p.startsWith('vetrecords/')) {
    const id = Number(p.split('/')[1])
    const items = load<VetRecord>(STORAGE_VET_RECORDS, seedVetRecords)
    const idx = items.findIndex(r => r.id === id)
    if (idx === -1) throw new Error('Not found')
    items.splice(idx, 1)
    save(STORAGE_VET_RECORDS, items)
    return { success: true }
  }

  if (p.startsWith('services/')) {
    const id = Number(p.split('/')[1])
    const items = load<ServiceType>(STORAGE_SERVICES, seedServices)
    const idx = items.findIndex(s => s.serviceId === id)
    if (idx === -1) throw new Error('Not found')
    items.splice(idx, 1)
    save(STORAGE_SERVICES, items)
    return { success: true }
  }

  // Generic delete could be added for other resources as needed
  throw new Error('Mock DELETE route not implemented: ' + path)
}

export default {
  apiGet,
  apiPost,
  apiPut,
  apiDelete,
}
