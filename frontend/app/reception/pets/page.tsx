"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, ArrowLeft, Search } from "lucide-react"
import { apiGet } from "@/lib/api"

interface Pet {
  petId: number
  id?: number
  name: string
  species: string
  breed: string
  dateOfBirth: string
  color: string
  weight: number
  microchipNumber: string
  customerId: number
  customerName: string
}

export default function ReceptionPetsPage() {
  const router = useRouter()
  const [pets, setPets] = useState<Pet[]>([])
  const [filteredPets, setFilteredPets] = useState<Pet[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [customers, setCustomers] = useState<any[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)
  const [totalCount, setTotalCount] = useState(0)
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [isSearching, setIsSearching] = useState(false) // Track search state

  useEffect(() => {
    if (!isSearching) { // Only load paginated data when not searching
      loadData()
    }
  }, [currentPage, isSearching])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Reset search query and search state when loading paginated data
      setSearchQuery("")
      setIsSearching(false)
      
      // Get branchId from localStorage
      let branchId = localStorage.getItem("branchId")
      if (!branchId) {
        const employeeId = localStorage.getItem("employeeId")
        if (employeeId) {
          try {
            const empData = await apiGet(`/employees/${employeeId}`)
            branchId = empData.branchId?.toString()
            if (branchId) {
              localStorage.setItem("branchId", branchId)
            }
          } catch (error) {
            console.error("Error loading employee info:", error)
          }
        }
      }
      
      if (!branchId) {
        branchId = "9" // Default to Tân Phú for testing
      }
      
      console.log(`[DEBUG] Loading pets for branchId: ${branchId}`)
      
      // Load both pets and customers with branch filter
      const [petsData, customersData] = await Promise.all([
        apiGet(`/pets?page=${currentPage}&pageSize=${pageSize}&branchId=${branchId}`),
        apiGet("/customers?page=1&pageSize=1000")
      ])
      
      console.log('Pets data:', petsData)
      console.log('Customers data:', customersData)
      
      let petList = []
      if (Array.isArray(petsData)) {
        petList = petsData
      } else if (petsData && petsData.items) {
        petList = petsData.items
        setTotalCount(petsData.totalCount || 0)
      }
      
      let customerList = []
      if (Array.isArray(customersData)) {
        customerList = customersData
      } else if (customersData && customersData.items) {
        customerList = customersData.items
      }
      
      console.log('Pet list:', petList)
      console.log('Customer list:', customerList)
      
      // Map customer names to pets
      const enrichedPets = petList.map(pet => ({
        ...pet,
        customerName: customerList.find(c => c.id === pet.customerId || c.customerId === pet.customerId)?.name || 
                     customerList.find(c => c.id === pet.customerId || c.customerId === pet.customerId)?.fullName ||
                     "Chưa có thông tin"
      }))
      
      console.log('Enriched pets:', enrichedPets)
      console.log(`[DEBUG] Setting ${enrichedPets.length} pets for page ${currentPage}`)
      
      setPets(enrichedPets)
      setFilteredPets(enrichedPets)
      setCustomers(customerList)
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }
    
    // If empty query, reload current page data
    if (!query.trim()) {
      setIsSearching(false) // Exit search mode
      loadData() // Reload paginated data
      return
    }

    // Enter search mode
    setIsSearching(true)
    setCurrentPage(1) // Reset to page 1 when searching

    // Debounce search by 300ms
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        setLoading(true)
        
        // Use server-side search - search across all pets (no branchId filter)
        const petsData = await apiGet(`/pets?page=1&pageSize=100&search=${encodeURIComponent(query)}`)
        
        let petList = []
        if (Array.isArray(petsData)) {
          petList = petsData
        } else if (petsData && petsData.items) {
          petList = petsData.items
          setTotalCount(petsData.totalCount || 0)
        }
        
        console.log(`Search results: ${petList.length} pets found for "${query}"`)
        setPets(petList)
        setFilteredPets(petList)  // Update filteredPets for display
      } catch (error) {
        console.error("Error searching pets:", error)
      } finally {
        setLoading(false)
      }
    }, 300)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Quản lý thú cưng</h1>
            <p className="text-muted-foreground">Danh sách thú cưng và thông tin chủ</p>
          </div>
        </div>
        <Button
          onClick={() => router.push("/reception/pets/new")}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Thêm thú cưng
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm theo tên, chủ, loài..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Pets List */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách thú cưng</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">
              Đang tải...
            </div>
          ) : filteredPets.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">Không tìm thấy thú cưng.</p>
              <Button onClick={() => router.push("/reception/pets/new")}>
                Thêm thú cưng mới
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPets.map((pet, index) => (
                <div
                  key={pet.petId || index}
                  onClick={() => {
                    if (pet.petId) {
                      router.push(`/reception/pets/${pet.petId}`)
                    } else {
                      console.error('Pet ID undefined:', pet)
                    }
                  }}
                  className="p-4 border rounded-lg hover:bg-muted cursor-pointer transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{pet.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {pet.species} {pet.breed && `(${pet.breed})`}
                      </p>
                      <p className="text-sm mt-3">
                        <span className="font-medium">Chủ thú cưng:</span> {pet.customerName || "Chưa có thông tin"}
                      </p>
                    </div>
                    <div className="text-right text-sm">
                      {pet.color && (
                        <p className="text-muted-foreground">
                          Màu: <span className="font-medium">{pet.color}</span>
                        </p>
                      )}
                      {pet.weight && (
                        <p className="text-muted-foreground">
                          Cân nặng: <span className="font-medium">{pet.weight} kg</span>
                        </p>
                      )}
                      {pet.microchipNumber && (
                        <p className="text-muted-foreground text-xs mt-2">
                          Chip: {pet.microchipNumber}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Pagination */}
              <div className="flex items-center justify-between mt-6 pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  Hiển thị {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, totalCount)} của {totalCount} thú cưng
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    Trang trước
                  </Button>
                  <Button
                    variant="outline"
                  >
                    {currentPage}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage * pageSize >= totalCount}
                  >
                    Trang sau
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
