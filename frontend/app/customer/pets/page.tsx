"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PawPrint, ArrowLeft, Plus } from "lucide-react"
import { Badge } from "@/components/ui/badge"

const mockPets = [
  {
    id: 1,
    name: "Max",
    species: "Chó",
    breed: "Golden Retriever",
    age: 3,
    gender: "Đực",
    weight: 28,
    color: "Vàng",
    vaccinations: [
      { name: "Dại", date: "15/06/2024", nextDue: "15/06/2025" },
      { name: "Care", date: "20/05/2024", nextDue: "20/05/2025" },
    ],
    medicalHistory: "Khỏe mạnh, không có bệnh lý nền",
  },
  {
    id: 2,
    name: "Luna",
    species: "Mèo",
    breed: "Ba Tư",
    age: 2,
    gender: "Cái",
    weight: 4.5,
    color: "Trắng",
    vaccinations: [{ name: "3 bệnh mèo", date: "10/07/2024", nextDue: "10/07/2025" }],
    medicalHistory: "Từng bị viêm da, đã khỏi",
  },
]

export default function CustomerPetsPage() {
  const router = useRouter()
  const [pets, setPets] = useState<any[]>(mockPets)

  useEffect(() => {
    async function load() {
      try {
        const userData = localStorage.getItem('user')
        if (!userData) return
        const user = JSON.parse(userData)
        const { apiGet } = await import('@/lib/api')
        const all = await apiGet('/pets')
        if (Array.isArray(all)) {
          const my = all.filter((p: any) => p.customerId === user.id || p.customerId === user.customerId || p.customerId === user.CustomerId)
          if (my.length) setPets(my)
        }
      } catch (e) {
        // ignore
      }
    }
    load()
  }, [])

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.push("/customer")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <PawPrint className="h-6 w-6 text-primary" />
              <span className="font-bold">PetCare</span>
            </div>
          </div>
          <Button variant="outline" onClick={() => { import('@/lib/auth').then(m => m.logout('/')) }}>
            Đăng xuất
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Thú cưng của tôi</h1>
            <p className="text-muted-foreground">Quản lý thông tin và hồ sơ sức khỏe thú cưng</p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Thêm thú cưng
          </Button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {pets.map((pet) => (
            <Card key={pet.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <PawPrint className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl">{pet.name}</CardTitle>
                      <p className="text-muted-foreground">
                        {pet.species} {pet.breed}
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary">{pet.age} tuổi</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Giới tính</p>
                    <p className="font-medium">{pet.gender}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Cân nặng</p>
                    <p className="font-medium">{pet.weight} kg</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Màu lông</p>
                    <p className="font-medium">{pet.color}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium mb-2">Tiêm phòng</p>
                  <div className="space-y-2">
                    {pet.vaccinations.map((vac, idx) => (
                      <div key={idx} className="flex justify-between items-center text-sm p-2 bg-muted rounded">
                        <span>{vac.name}</span>
                        <span className="text-muted-foreground">Hạn: {vac.nextDue}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium mb-1">Lịch sử y tế</p>
                  <p className="text-sm text-muted-foreground">{pet.medicalHistory}</p>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1 bg-transparent">
                    Xem hồ sơ
                  </Button>
                  <Button variant="outline" className="flex-1 bg-transparent">
                    Đặt lịch khám
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}
