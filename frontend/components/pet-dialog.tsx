"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { apiPost } from "@/lib/api"

const petFormSchema = z.object({
  name: z.string().min(1, "Tên thú cưng là bắt buộc"),
  species: z.string().min(1, "Loài thú là bắt buộc"),
  breed: z.string().optional(),
  birthDate: z.string().optional(),
  gender: z.string().optional(),
  status: z.string().optional().default("active"),
})

type PetFormValues = z.infer<typeof petFormSchema>

interface PetDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
  customerId?: number
}

export function PetDialog({
  open,
  onOpenChange,
  onSuccess,
  customerId,
}: PetDialogProps) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const form = useForm<PetFormValues>({
    resolver: zodResolver(petFormSchema),
    defaultValues: {
      name: "",
      species: "",
      breed: "",
      birthDate: "",
      gender: "",
      status: "active",
    },
  })

  async function onSubmit(values: PetFormValues) {
    try {
      setLoading(true)

      const userData = localStorage.getItem("user")
      if (!userData) {
        toast({
          title: "Lỗi",
          description: "Vui lòng đăng nhập lại",
          variant: "destructive",
        })
        return
      }

      const user = JSON.parse(userData)
      const cId = customerId || user.id || user.customerId || user.CustomerId

      const petData = {
        customerId: cId,
        name: values.name,
        species: values.species && values.species !== "auto" ? values.species : null,
        breed: values.breed || null,
        birthDate: values.birthDate || null,
        gender: values.gender && values.gender !== "auto" ? values.gender : null,
        status: values.status || "active",
      }

      await apiPost("/pets", petData)

      toast({
        title: "Thành công",
        description: "Thêm thú cưng thành công",
      })

      form.reset()
      onOpenChange(false)
      onSuccess?.()
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể thêm thú cưng",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Thêm thú cưng mới</DialogTitle>
          <DialogDescription>
            Nhập thông tin chi tiết của thú cưng mới
          </DialogDescription>
        </DialogHeader>

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
                  <Select onValueChange={field.onChange} defaultValue={field.value || "auto"}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn loài thú" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="auto" disabled>Chọn loài thú</SelectItem>
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
                    <Input placeholder="VD: Golden Retriever, Mèo Anh Lông Ngắn..." {...field} />
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
                      <Input
                        type="date"
                        {...field}
                      />
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
                    <Select onValueChange={field.onChange} defaultValue={field.value || "auto"}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn giới tính" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="auto" disabled>Chọn giới tính</SelectItem>
                        <SelectItem value="M">Đực</SelectItem>
                        <SelectItem value="F">Cái</SelectItem>
                        <SelectItem value="U">Chưa xác định</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Đang lưu..." : "Thêm thú cưng"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
