"use client"

import { useEffect, useState } from "react"
import { getSelectedBranchId } from '@/lib/branch'
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PawPrint, ArrowLeft, Search, Plus } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function ReceptionPetsPage() {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [pets, setPets] = useState<any[]>([])
  const [customers, setCustomers] = useState<any[]>([])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const { apiGet } = await import('@/lib/api')
        const branchId = getSelectedBranchId()
        const petsReq = branchId ? apiGet('/pets?branchId=' + encodeURIComponent(branchId)) : apiGet('/pets')
        const customersReq = branchId ? apiGet('/customers?branchId=' + encodeURIComponent(branchId)) : apiGet('/customers')
        const [petsRes, customersRes] = await Promise.all([petsReq, customersReq])
        if (!mounted) return
        setPets(Array.isArray(petsRes) ? petsRes : [])
        setCustomers(Array.isArray(customersRes) ? customersRes : [])
      } catch (err) {
        // ignore
      }
    })()
    const onBranch = () => { if (mounted) { (async () => { try { const { apiGet } = await import('@/lib/api'); const branchId = getSelectedBranchId(); const petsReq = branchId ? apiGet('/pets?branchId=' + encodeURIComponent(branchId)) : apiGet('/pets'); const customersReq = branchId ? apiGet('/customers?branchId=' + encodeURIComponent(branchId)) : apiGet('/customers'); const [petsRes, customersRes] = await Promise.all([petsReq, customersReq]); setPets(Array.isArray(petsRes) ? petsRes : []); setCustomers(Array.isArray(customersRes) ? customersRes : []); } catch {} })() } }
    window.addEventListener('branch-changed', onBranch as EventListener)
    return () => { mounted = false; window.removeEventListener('branch-changed', onBranch as EventListener) }
  }, [])

  const lookupOwner = (customerId: number) => customers.find(c => c.customerId === customerId)?.fullName || 'Khách lạ'

  const filtered = pets.filter(p => {
    if (!query) return true
    const q = query.toLowerCase()
    return p.name?.toLowerCase().includes(q) || lookupOwner(p.customerId).toLowerCase().includes(q) || (p.species || '').toLowerCase().includes(q)
  })

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.push('/reception')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <PawPrint className="h-6 w-6 text-primary" />
              <span className="font-bold">PetCare - Tiếp tân</span>
            </div>
          </div>
          <Button variant="outline" onClick={() => { import('@/lib/auth').then(m => m.logout('/')) }}>Đăng xuất</Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Quản lý thú cưng</h1>
            <p className="text-muted-foreground">Danh sách thú cưng và thông tin chủ</p>
          </div>
          <Button onClick={() => router.push('/reception/pets/new')}>
            <Plus className="h-4 w-4 mr-2" />
            Thêm thú cưng
          </Button>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Tìm theo tên, chủ, loài..." className="pl-10" value={query} onChange={(e) => setQuery((e.target as HTMLInputElement).value)} />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Danh sách thú cưng</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filtered.map((pet) => {
                const id = pet?.petId ?? pet?.id
                const name = pet?.name ?? pet?.petName ?? 'Thú cưng'
                const species = pet?.species ?? pet?.type ?? ''
                const breed = pet?.breed ?? ''
                const ownerId = pet?.customerId ?? pet?.ownerId
                return (
                <div key={id} className="p-4 border rounded-lg hover:bg-muted/50">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <p className="font-medium text-lg">{name}</p>
                        <Badge variant="outline">{species}</Badge>
                      </div>
                      <div className="flex flex-col gap-1">
                        <div className="text-sm text-muted-foreground">Chủ: {lookupOwner(ownerId)}</div>
                        <div className="text-sm text-muted-foreground">Giống: {breed || '—'}</div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="text-sm text-muted-foreground">Tuổi: {pet.birthDate ? Math.max(0, new Date().getFullYear() - new Date(pet.birthDate).getFullYear()) : '—'}</div>
                      <Button size="sm" onClick={() => router.push(`/reception/pets/${id}`)}>Xem chi tiết</Button>
                    </div>
                  </div>
                </div>
              )})}
              {filtered.length === 0 && <div className="p-4 text-sm text-muted-foreground">Không tìm thấy thú cưng.</div>}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
