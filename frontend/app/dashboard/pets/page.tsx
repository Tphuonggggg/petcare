"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Plus } from "lucide-react"

const mockPets = [
  {
    id: 1,
    name: "Milu",
    species: "Chó",
    breed: "Golden Retriever",
    age: "2 tuổi",
    gender: "Đực",
    owner: "Nguyễn Văn A",
    status: "Khỏe mạnh",
    lastVisit: "15/12/2024",
  },
  {
    id: 2,
    name: "Kitty",
    species: "Mèo",
    breed: "Mèo Ba Tư",
    age: "1 tuổi",
    gender: "Cái",
    owner: "Trần Thị B",
    status: "Đang điều trị",
    lastVisit: "20/12/2024",
  },
  {
    id: 3,
    name: "Rocky",
    species: "Chó",
    breed: "Husky",
    age: "3 tuổi",
    gender: "Đực",
    owner: "Lê Văn C",
    status: "Khỏe mạnh",
    lastVisit: "18/12/2024",
  },
]

export default function PetsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [pets, setPets] = useState<any[]>(mockPets)
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(9)
  const [totalCount, setTotalCount] = useState(0)

  useEffect(() => {
    let mounted = true
    async function load() {
      setLoading(true)
      try {
        const { apiGet } = await import('@/lib/api')
        // Fetch pets with pagination and search
        const query = searchTerm ? `?search=${encodeURIComponent(searchTerm)}&page=${currentPage}&pageSize=${pageSize}` : `?page=${currentPage}&pageSize=${pageSize}`
        const data = await apiGet(`/pets${query}`)
        if (mounted) {
          const items = Array.isArray(data) ? data : (data?.items || [])
          const total = data?.totalCount || items.length
          setPets(items)
          setTotalCount(total)
        }
      } catch (e) {
        // keep mockPets on error
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [currentPage, pageSize, searchTerm])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Khỏe mạnh":
        return "bg-green-100 text-green-700"
      case "Đang điều trị":
        return "bg-yellow-100 text-yellow-700"
      case "Cần chăm sóc":
        return "bg-red-100 text-red-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Thú cưng</h1>
          <p className="text-muted-foreground mt-1">Quản lý thông tin thú cưng</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Thêm thú cưng
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm theo tên, loài, chủ nhân..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1)
            }}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Hiển thị:</span>
          <select 
            value={pageSize} 
            onChange={(e) => {
              setPageSize(Number(e.target.value))
              setCurrentPage(1)
            }}
            className="border rounded px-2 py-1 text-sm"
          >
            <option value="6">6</option>
            <option value="9">9</option>
            <option value="12">12</option>
            <option value="20">20</option>
          </select>
          <span className="text-sm text-muted-foreground">mỗi trang</span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {(loading ? [] : pets).map((pet) => {
          const id = pet?.petId ?? pet?.id
          const name = pet?.name ?? pet?.petName ?? 'Thú cưng'
          const species = pet?.species ?? pet?.type ?? ''
          const breed = pet?.breed ?? ''
          const status = pet?.status ?? pet?.healthStatus ?? '—'
          return (
          <Card key={id} className="p-6 hover:shadow-lg transition-shadow">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{name}</h3>
                  <p className="text-sm text-muted-foreground">{species} - {breed}</p>
                </div>
                <Badge className={getStatusColor(status)}>{status}</Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Tuổi</p>
                  <p className="font-medium">{pet.age}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Giới tính</p>
                  <p className="font-medium">{pet.gender}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-muted-foreground">Chủ nhân</p>
                  <p className="font-medium">{pet.owner}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-muted-foreground">Lần khám cuối</p>
                  <p className="font-medium">{pet.lastVisit}</p>
                </div>
              </div>

              <Button variant="outline" className="w-full bg-transparent">
                Xem hồ sơ
              </Button>
            </div>
          </Card>
            )
          })}
      </div>

      {/* Pagination */}
      {totalCount > 0 && (
        <div className="flex items-center justify-between border-t pt-4">
          <div className="text-sm text-muted-foreground">
            Hiển thị <strong>{(currentPage - 1) * pageSize + 1}</strong> đến <strong>{Math.min(currentPage * pageSize, totalCount)}</strong> trong <strong>{totalCount}</strong> thú cưng
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            >
              Trang trước
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.ceil(totalCount / pageSize) }, (_, i) => i + 1)
                .filter(page => {
                  const maxPages = Math.ceil(totalCount / pageSize)
                  if (maxPages <= 5) return true
                  return (
                    page === 1 ||
                    page === maxPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  )
                })
                .map((page, idx, arr) => (
                  <div key={page}>
                    {idx > 0 && arr[idx - 1] !== page - 1 && <span className="px-1">...</span>}
                    <Button
                      variant={page === currentPage ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  </div>
                ))}
            </div>
            <Button 
              variant="outline"
              disabled={currentPage >= Math.ceil(totalCount / pageSize)}
              onClick={() => setCurrentPage(prev => prev + 1)}
            >
              Trang sau
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
