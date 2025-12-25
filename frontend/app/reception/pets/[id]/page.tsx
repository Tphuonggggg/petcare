"use client"

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, PawPrint } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

export default function ReceptionPetDetail() {
  const router = useRouter()
  const params = useParams() as { id?: string }
  const id = params?.id ? Number(params.id) : undefined

  const [pet, setPet] = useState<any | null>(null)
  const [owner, setOwner] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let mounted = true
    if (!id) return
    ;(async () => {
      try {
        const { apiGet } = await import('@/lib/api')
        const p = await apiGet(`/pets/${id}`)
        if (!mounted) return
        setPet(p)
        try {
          const c = await apiGet(`/customers/${p.customerId}`)
          if (mounted) setOwner(c)
        } catch {}
      } catch (err) {
        toast({ title: 'Lỗi', description: 'Không tải được dữ liệu thú cưng.' })
      } finally { if (mounted) setLoading(false) }
    })()
    return () => { mounted = false }
  }, [id])

  if (!id) return <div className="p-6">ID không hợp lệ.</div>
  if (loading) return <div className="p-6">Đang tải...</div>
  if (!pet) return <div className="p-6">Không tìm thấy thú cưng.</div>

  async function save() {
    setSaving(true)
    try {
      const { apiPut } = await import('@/lib/api')
      const body = {
        name: pet.name,
        species: pet.species,
        breed: pet.breed,
        birthDate: pet.birthDate,
        gender: pet.gender,
        notes: pet.notes,
        customerId: pet.customerId,
      }
      const updated = await apiPut(`/pets/${id}`, body)
      setPet(updated)
      toast({ title: 'Đã lưu', description: 'Thông tin thú cưng đã được cập nhật.' })
    } catch (err) {
      toast({ title: 'Lỗi', description: 'Không thể lưu thay đổi.' })
    } finally { setSaving(false) }
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.push('/reception/pets')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <PawPrint className="h-6 w-6 text-primary" />
              <span className="font-bold">PetCare - Tiếp tân</span>
            </div>
          </div>
          <div>
            <Button variant="outline" onClick={() => { import('@/lib/auth').then(m => m.logout('/')) }}>Đăng xuất</Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Chi tiết thú cưng</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-muted-foreground mb-1">Tên</label>
                    <Input value={pet.name || ''} onChange={(e) => setPet({ ...pet, name: (e.target as HTMLInputElement).value })} />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm text-muted-foreground mb-1">Loài</label>
                      <Input value={pet.species || ''} onChange={(e) => setPet({ ...pet, species: (e.target as HTMLInputElement).value })} />
                    </div>
                    <div>
                      <label className="block text-sm text-muted-foreground mb-1">Giống</label>
                      <Input value={pet.breed || ''} onChange={(e) => setPet({ ...pet, breed: (e.target as HTMLInputElement).value })} />
                    </div>
                    <div>
                      <label className="block text-sm text-muted-foreground mb-1">Ngày sinh</label>
                      <Input type="date" value={pet.birthDate || ''} onChange={(e) => setPet({ ...pet, birthDate: (e.target as HTMLInputElement).value })} />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-muted-foreground mb-1">Giới tính</label>
                    <select className="w-full rounded-md border px-3 py-2" value={pet.gender || ''} onChange={(e) => setPet({ ...pet, gender: (e.target as HTMLSelectElement).value })}>
                      <option value="">Không xác định</option>
                      <option value="M">Đực</option>
                      <option value="F">Cái</option>
                      <option value="O">Khác</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-muted-foreground mb-1">Ghi chú</label>
                    <Textarea value={pet.notes || ''} onChange={(e) => setPet({ ...pet, notes: (e.target as HTMLTextAreaElement).value })} />
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={save} disabled={saving}>{saving ? 'Đang lưu...' : 'Lưu thay đổi'}</Button>
                    <Button variant="outline" onClick={() => router.push('/reception/pets')}>Quay lại</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <aside>
            <Card>
              <CardHeader>
                <CardTitle>Chủ</CardTitle>
              </CardHeader>
              <CardContent>
                {owner ? (
                  <div className="space-y-2">
                    <div className="font-medium">{owner.fullName}</div>
                    <div className="text-sm text-muted-foreground">{owner.phone}</div>
                    <div className="text-sm text-muted-foreground">{owner.email}</div>
                    <div className="mt-3">
                      <Button size="sm" onClick={() => router.push('/reception/customers')}>Xem khách hàng</Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">Chủ không tìm thấy.</div>
                )}
              </CardContent>
            </Card>
          </aside>
        </div>
      </main>
    </div>
  )
}
