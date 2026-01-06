"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Search, Phone, Mail } from "lucide-react"
import { apiGet } from "@/lib/api"

interface CustomerSearchResult {
  customerId: number
  fullName: string
  phone: string
  email?: string
  petCount?: number
}

export default function SearchCustomerPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<CustomerSearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!searchQuery.trim()) {
      setSearchResults([])
      setSearched(false)
      return
    }

    try {
      setLoading(true)
      setSearched(true)
      const data = await apiGet(`/ReceptionistDashboard/search-customers?query=${encodeURIComponent(searchQuery)}`)
      setSearchResults(data || [])
    } catch (error) {
      console.error("Error searching customers:", error)
      alert("Lỗi khi tìm kiếm khách hàng")
      setSearchResults([])
    } finally {
      setLoading(false)
    }
  }

  const handleViewCustomer = (customerId: number) => {
    router.push(`/reception/customers/${customerId}`)
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/reception")}
            className="bg-transparent"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
          <h1 className="text-2xl font-bold">Tìm kiếm khách hàng</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Tìm kiếm theo tên, số điện thoại hoặc email</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Nhập tên, số điện thoại hoặc email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" disabled={loading} className="gap-2">
                  <Search className="h-4 w-4" />
                  {loading ? "Đang tìm..." : "Tìm kiếm"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {searched && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>
                Kết quả tìm kiếm ({searchResults.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {searchResults.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Không tìm thấy khách hàng nào
                </p>
              ) : (
                <div className="space-y-3">
                  {searchResults.map((customer) => (
                    <div
                      key={customer.customerId}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{customer.fullName}</p>
                        <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                          {customer.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {customer.phone}
                            </span>
                          )}
                          {customer.email && (
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {customer.email}
                            </span>
                          )}
                        </div>
                      </div>
                      <Button
                        onClick={() => handleViewCustomer(customer.customerId)}
                        variant="outline"
                        size="sm"
                      >
                        Xem chi tiết
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
