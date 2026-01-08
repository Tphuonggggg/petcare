"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

interface Pet {
  petId: number
  name: string
  species: string
  breed: string
  birthDate?: string
  gender?: string
  customer?: {
    customerId: number
    fullName: string
    phone: string
  }
}

export default function VetPetsPage() {
  const [pets, setPets] = useState<Pet[]>([])
  const [filteredPets, setFilteredPets] = useState<Pet[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(20)
  const [totalCount, setTotalCount] = useState(0)
  const [isSearching, setIsSearching] = useState(false)
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const router = useRouter()

  const loadPets = async () => {
    setLoading(true)
    try {
      const branchId = localStorage.getItem('branchId')
      const { apiGet } = await import('@/lib/api')
      
      console.log('[VET PETS] Loading pets for page:', currentPage)
      
      // Load pets with pagination
      const petsResponse = await apiGet(`/pets?page=${currentPage}&pageSize=${pageSize}`)
      console.log('[VET PETS] Pets response:', petsResponse)
      
      let allPets = []
      if (petsResponse?.items && Array.isArray(petsResponse.items)) {
        allPets = petsResponse.items
        setTotalCount(petsResponse.totalCount || 0)
      } else if (Array.isArray(petsResponse)) {
        allPets = petsResponse
      }
      
      console.log('[VET PETS] Total pets loaded:', allPets.length)

      // Load all unique customer IDs in parallel (much faster)
      const customerIds = [...new Set(allPets.map((p: any) => p.customerId).filter(Boolean))]
      console.log('[VET PETS] Loading customers:', customerIds.length)
      
      const customersMap = new Map()
      try {
        // Load all customers in parallel
        const customerPromises = customerIds.map((id: any) => 
          apiGet(`/customers/${id}`)
            .then(customer => ({ id, customer }))
            .catch(err => {
              console.error('[VET PETS] Error loading customer:', id, err)
              return null
            })
        )
        const customerResults = await Promise.all(customerPromises)
        customerResults.forEach((result: any) => {
          if (result) customersMap.set(result.id, result.customer)
        })
      } catch (err) {
        console.error('[VET PETS] Error loading customers:', err)
      }

      // Map pets with customer data
      const petsData: Pet[] = allPets.map((pet: any) => ({
        petId: pet.petId,
        name: pet.name,
        species: pet.species,
        breed: pet.breed,
        birthDate: pet.birthDate,
        gender: pet.gender,
        customer: customersMap.get(pet.customerId)
      }))

      console.log('[VET PETS] Pets with customer data:', petsData.length)
      setPets(petsData)
      setFilteredPets(petsData)
    } catch (err) {
      console.error('[VET PETS] Error loading pets:', err)
    }
    setLoading(false)
  }

  useEffect(() => {
    if (!isSearching) {
      loadPets()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, isSearching])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }
    
    // If empty query, reload current page data
    if (!query.trim()) {
      setIsSearching(false)
      loadPets()
      return
    }

    // Enter search mode
    setIsSearching(true)
    setCurrentPage(1)

    // Debounce search by 300ms
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        setLoading(true)
        const { apiGet } = await import('@/lib/api')
        
        console.log('[VET PETS] Searching for:', query)
        
        // Use server-side search
        const petsData = await apiGet(`/pets?page=1&pageSize=100&search=${encodeURIComponent(query)}`)
        
        let petList = []
        if (Array.isArray(petsData)) {
          petList = petsData
        } else if (petsData && petsData.items) {
          petList = petsData.items
          setTotalCount(petsData.totalCount || 0)
        }
        
        console.log(`[VET PETS] Search results: ${petList.length} pets found`)
        
        // Load customer info in parallel for search results too
        const customerIds = [...new Set(petList.map((p: any) => p.customerId).filter(Boolean))]
        const customersMap = new Map()
        
        try {
          const customerPromises = customerIds.map((id: any) => 
            apiGet(`/customers/${id}`)
              .then(customer => ({ id, customer }))
              .catch(() => null)
          )
          const customerResults = await Promise.all(customerPromises)
          customerResults.forEach((result: any) => {
            if (result) customersMap.set(result.id, result.customer)
          })
        } catch {}
        
        const enrichedPets: Pet[] = petList.map((pet: any) => ({
          petId: pet.petId,
          name: pet.name,
          species: pet.species,
          breed: pet.breed,
          birthDate: pet.birthDate,
          gender: pet.gender,
          customer: customersMap.get(pet.customerId)
        }))
        
        setPets(enrichedPets)
        setFilteredPets(enrichedPets)
      } catch (error) {
        console.error('[VET PETS] Error searching pets:', error)
      } finally {
        setLoading(false)
      }
    }, 300)
  }

  const calculateAge = (birthDate?: string) => {
    if (!birthDate) return 'N/A'
    const birth = new Date(birthDate)
    const today = new Date()
    const years = today.getFullYear() - birth.getFullYear()
    const months = today.getMonth() - birth.getMonth()
    
    if (years > 0) {
      return `${years} tuổi ${months > 0 ? months + ' tháng' : ''}`
    }
    return `${months > 0 ? months : 0} tháng`
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Thú cưng</h1>
        <p className="text-muted-foreground">Danh sách thú cưng trong hệ thống.</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Danh sách thú cưng ({totalCount > 0 ? totalCount : filteredPets.length})</CardTitle>
            <Button variant="outline" size="sm" onClick={loadPets} disabled={loading}>
              Tải lại
            </Button>
          </div>
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm theo tên thú cưng, giống, chủ sở hữu, số điện thoại..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Đang tải...</div>
          ) : (
            <div className="space-y-3">
              {filteredPets.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {searchQuery ? 'Không tìm thấy thú cưng phù hợp.' : 'Không có thú cưng nào trong hệ thống.'}
                </div>
              ) : (
                filteredPets.map((p) => (
                  <div
                    key={p.petId}
                    className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-2 flex-1">
                        <div>
                          <div className="font-semibold text-lg">{p.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {p.species} • {p.breed} • {p.gender || 'N/A'} • {calculateAge(p.birthDate)}
                          </div>
                        </div>
                        {p.customer && (
                          <div className="text-sm">
                            <span className="text-muted-foreground">Chủ sở hữu:</span>{' '}
                            <span className="font-medium">{p.customer.fullName}</span> •{' '}
                            <span className="text-muted-foreground">{p.customer.phone}</span>
                          </div>
                        )}
                      </div>
                      <Button size="sm" onClick={() => router.push(`/vet/pets/${p.petId}`)}>
                        Xem hồ sơ
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {!isSearching && totalCount > pageSize && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1 || loading}
          >
            Trang trước
          </Button>
          <span className="text-sm text-muted-foreground">
            Trang {currentPage} / {Math.ceil(totalCount / pageSize)}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => p + 1)}
            disabled={currentPage >= Math.ceil(totalCount / pageSize) || loading}
          >
            Trang sau
          </Button>
        </div>
      )}
    </div>
  )
}
