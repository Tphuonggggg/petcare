"use client"

import { useRouter, useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Save } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { useToast } from "@/hooks/use-toast"
import { apiGet, apiPut } from "@/lib/api"

const petFormSchema = z.object({
  name: z.string().min(1, "Tên thú cưng là bắt buộc"),
  species: z.string().min(1, "Loài thú là bắt buộc"),
  breed: z.string().optional(),
  birthDate: z.string().optional(),
  gender: z.string().optional(),
})

type PetFormValues = z.infer<typeof petFormSchema>

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

export default function EditPetPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const petId = params.id as string

  const [pet, setPet] = useState<Pet | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const form = useForm<PetFormValues>({
    resolver: zodResolver(petFormSchema),
    defaultValues: {
      name: "",
      species: "",
      breed: "",
      birthDate: "",
      gender: "",
    },
  })

  useEffect(() => {
    loadPet()
  }, [petId])

  const loadPet = async () => {
    try {
      setLoading(true)
      
      // Kiểm tra quyền truy cập
      const userData = localStorage.getItem("user")
      if (!userData) {
        router.push("/login")
        return
      }

      const currentUser = JSON.parse(userData)
      const customerId = currentUser.id || currentUser.customerId || currentUser.CustomerId

      // Lấy pet của user hiện tại
      const allPets = await apiGet(`/pets?customerId=${customerId}`)
      let found: Pet | null = null

      if (Array.isArray(allPets)) {
        found = allPets.find(
          (p: Pet) => p.petId === Number(petId) || p.id === Number(petId)
        )
      } else if (allPets && typeof allPets === 'object' && allPets.items && Array.isArray(allPets.items)) {
        found = allPets.items.find(
          (p: Pet) => p.petId === Number(petId) || p.id === Number(petId)
        )
      }

      if (found) {
        setPet(found)
        const birthDate = found.birthDate
          ? new Date(found.birthDate).toISOString().split("T")[0]
          : ""
        form.reset({
          name: found.name,
          species: found.species,
          breed: found.breed,
          birthDate,
          gender: found.gender,
        })
      }
    } catch (error: any) {
      console.error("Error loading pet:", error)
      toast({
        title: "Lỗi",
        description: error.message || "Không thể tải thông tin thú cưng",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  async function onSubmit(values: PetFormValues) {
    if (!pet) return

    try {
      setSubmitting(true)

      const petData = {
        PetId: pet.petId || pet.id,
        CustomerId: pet.customerId,
        Name: values.name,
        Species: values.species,
        Breed: values.breed || null,
        BirthDate: values.birthDate ? new Date(values.birthDate).toISOString() : null,
        Gender: values.gender || null,
      }

      await apiPut(`/pets/${pet.petId || pet.id}`, petData)

      toast({
        title: "Thành công",
        description: "Cập nhật thú cưng thành công",
      })

      router.push(`/customer/pets/${pet.petId || pet.id}`)
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể cập nhật thú cưng",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại
        </Button>
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64">
            <p className="text-muted-foreground">Đang tải...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!pet) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại
        </Button>
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64">
            <p className="text-muted-foreground">Không tìm thấy thú cưng</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Chỉnh sửa thú cưng</CardTitle>
          <CardDescription>Cập nhật thông tin của {pet.name}</CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên thú cưng *</FormLabel>
                    <FormControl>
                      <Input placeholder="VD: Milu, Bella, Max..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="species"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Loài thú *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn loài thú" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Chó">Chó</SelectItem>
                        <SelectItem value="Mèo">Mèo</SelectItem>
                        <SelectItem value="Thỏ">Thỏ</SelectItem>
                        <SelectItem value="Chim">Chim</SelectItem>
                        <SelectItem value="Chuột">Chuột</SelectItem>
                        <SelectItem value="Khác">Khác</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="breed"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Giống loài</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="VD: Golden Retriever, Mèo Anh Lông Ngắn..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="birthDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ngày sinh</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Giới tính</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ""}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn giới tính" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Đực">Đực</SelectItem>
                          <SelectItem value="Cái">Cái</SelectItem>
                          <SelectItem value="Chưa xác định">Chưa xác định</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                >
                  Hủy
                </Button>
                <Button type="submit" disabled={submitting} className="flex-1">
                  <Save className="h-4 w-4 mr-2" />
                  {submitting ? "Đang lưu..." : "Lưu thay đổi"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
