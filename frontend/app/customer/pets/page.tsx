"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PawPrint, Plus, Heart, Edit2, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { PetDialog } from "@/components/pet-dialog"
import { apiGet, apiDelete } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface Pet {
  petId?: number
  id?: number
  customerId: number
  name: string
  species: string
  breed?: string
  birthDate?: string
  gender?: string
  status?: string
}

export default function CustomerPetsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [pets, setPets] = useState<Pet[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (!userData) {
      router.push("/login")
      return
    }
    setUser(JSON.parse(userData))
    loadPets()
  }, [router])

  const loadPets = async () => {
    try {
      setLoading(true)
      const userData = localStorage.getItem("user")
      if (!userData) return

      const currentUser = JSON.parse(userData)
      // Lấy ID khách hàng từ một trong các field có thể
      const customerId = currentUser.id || currentUser.customerId || currentUser.CustomerId

      console.log("Current user:", currentUser)
      console.log("Customer ID:", customerId)

      // Gọi API với query parameter để lọc theo customerId
      const allPets = await apiGet(`/pets?customerId=${customerId}`)
      console.log("Pets from API (filtered):", allPets)

      if (Array.isArray(allPets)) {
        setPets(allPets)
      } else if (allPets && typeof allPets === 'object' && allPets.items) {
        // Nếu API trả về pagination object
        setPets(allPets.items)
      }
    } catch (error: any) {
      console.error("Error loading pets:", error)
      toast({
        title: "Lỗi",
        description: error.message || "Không thể tải danh sách thú cưng",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeletePet = async (petId: number) => {
    try {
      await apiDelete(`/pets/${petId}`)
      toast({
        title: "Thành công",
        description: "Đã xóa thú cưng",
      })
      loadPets()
      setDeleteId(null)
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể xóa thú cưng",
        variant: "destructive",
      })
    }
  }

  const calculateAge = (birthDate?: string) => {
    if (!birthDate) return "Không rõ"
    try {
      const birth = new Date(birthDate)
      const today = new Date()
      let age = today.getFullYear() - birth.getFullYear()
      const monthDiff = today.getMonth() - birth.getMonth()

      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--
      }

      return age >= 0 ? `${age} tuổi` : "Không rõ"
    } catch {
      return "Không rõ"
    }
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">Thú cưng của tôi</h1>
            <p className="text-muted-foreground">
              Quản lý thông tin và hồ sơ sức khỏe thú cưng
            </p>
          </div>
          <Button
            size="lg"
            onClick={() => setDialogOpen(true)}
            className="gap-2"
          >
            <Plus className="h-5 w-5" />
            Thêm thú cưng
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <PawPrint className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-bounce" />
              <p className="text-muted-foreground">Đang tải danh sách thú cưng...</p>
            </div>
          </div>
        ) : pets.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center h-64">
              <PawPrint className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Chưa có thú cưng nào</h3>
              <p className="text-muted-foreground mb-4 text-center max-w-sm">
                Thêm thú cưng đầu tiên của bạn để bắt đầu quản lý hồ sơ sức khỏe
              </p>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Thêm thú cưng
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pets.map((pet) => (
              <Card
                key={pet.petId || pet.id}
                className="overflow-hidden hover:shadow-lg transition-shadow"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <PawPrint className="h-7 w-7 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-xl truncate">{pet.name}</CardTitle>
                        <p className="text-sm text-muted-foreground truncate">
                          {pet.species}
                          {pet.breed && ` - ${pet.breed}`}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-muted p-3 rounded-lg text-center">
                      <p className="text-xs text-muted-foreground mb-1">Tuổi</p>
                      <p className="font-semibold text-sm">{calculateAge(pet.birthDate)}</p>
                    </div>
                    <div className="bg-muted p-3 rounded-lg text-center">
                      <p className="text-xs text-muted-foreground mb-1">Giới tính</p>
                      <p className="font-semibold text-sm">{pet.gender || "---"}</p>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() =>
                        router.push(
                          `/customer/pets/${pet.petId || pet.id}`
                        )
                      }
                    >
                      <Heart className="h-4 w-4 mr-1" />
                      Xem chi tiết
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        router.push(
                          `/customer/pets/${pet.petId || pet.id}/edit`
                        )
                      }}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => setDeleteId(pet.petId || pet.id || 0)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <PetDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={loadPets}
        customerId={user?.id || user?.customerId || user?.CustomerId}
      />

      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa thú cưng</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa thú cưng này? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogCancel>Hủy</AlertDialogCancel>
          <AlertDialogAction
            className="bg-red-600 hover:bg-red-700"
            onClick={() => deleteId && handleDeletePet(deleteId)}
          >
            Xóa
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
