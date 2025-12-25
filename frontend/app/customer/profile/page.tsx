"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PawPrint, ArrowLeft, User, Mail, Phone, MapPin, Award } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { toast } from '@/hooks/use-toast'

export default function CustomerProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>({
    customerId: undefined,
    fullName: "Nguyễn Văn A",
    email: "nguyenvana@email.com",
    phone: "0901234567",
    address: "123 Nguyễn Trãi, Quận 1, TP.HCM",
    membershipTier: "VIP",
    pointsBalance: 1500,
    birthDate: undefined,
    gender: undefined,
    memberSince: undefined,
  })
  const [useMocksFlag, setUseMocksFlag] = useState<boolean>(false)
  const [bookings, setBookings] = useState<any[]>([])
  const [invoices, setInvoices] = useState<any[]>([])
  const [bookingsLoading, setBookingsLoading] = useState(false)
  const [invoicesLoading, setInvoicesLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<{ fullName?: string; phone?: string; email?: string }>({})

  useEffect(() => {
    const userData = localStorage.getItem("user")
    const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams('')
    const mocksFromQuery = urlParams.get('useMocks') === 'true'
    const mocks = mocksFromQuery || localStorage.getItem('useMocks') === 'true'
    setUseMocksFlag(mocks)
    if (!userData) {
      // if `?useMocks=true` was provided, persist it so subsequent navigation keeps mocks
      if (mocksFromQuery) {
        try { localStorage.setItem('useMocks', 'true') } catch {}
      }
      // if no stored user but mocks are enabled, try load mock customer 1
      if (mocks) {
        ;(async () => {
          try {
            const { apiGet } = await import('@/lib/api')
            const data = await apiGet('/customers/1')
            if (data) {
              localStorage.setItem('user', JSON.stringify(data))
              setUser(data)
              return
            }
          } catch (e) {
            // ignore
          }
        })()
      } else {
        router.push("/login")
        return
      }
      return
    }
    const parsed = JSON.parse(userData)
    ;(async () => {
      try {
        const { apiGet } = await import('@/lib/api')
        // try to fetch profile from backend
        if (parsed && (parsed.id || parsed.customerId || parsed.CustomerId)) {
          const id = parsed.id || parsed.customerId || parsed.CustomerId
          const data = await apiGet(`/customers/${id}`)
          if (data) setUser(data)
          // load related mock data (bookings, invoices)
          try {
              setBookingsLoading(true)
              const b = await apiGet(`/bookings?customerId=${id}`)
              setBookings(Array.isArray(b) ? b : [])
              setBookingsLoading(false)
          } catch {}
          try {
            setInvoicesLoading(true)
            const inv = await apiGet(`/invoices?customerId=${id}`)
            setInvoices(Array.isArray(inv) ? inv : [])
            setInvoicesLoading(false)
          } catch {}
          return
        }
      } catch (e) {
        // ignore and keep local
      }
    })()
  }, [router])

  // also reload related data when user changes (e.g., after save)
  useEffect(() => {
    ;(async () => {
      try {
        const id = user?.customerId || user?.id || user?.CustomerId
        if (!id) return
        const { apiGet } = await import('@/lib/api')
        setBookingsLoading(true)
        const b = await apiGet(`/bookings?customerId=${id}`)
        setBookings(Array.isArray(b) ? b : [])
        setBookingsLoading(false)
        setInvoicesLoading(true)
        const inv = await apiGet(`/invoices?customerId=${id}`)
        setInvoices(Array.isArray(inv) ? inv : [])
        setInvoicesLoading(false)
      } catch (e) {
        // ignore
      }
    })()
  }, [user])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const fd = new FormData(form)
    const rawBirth = fd.get('birthDate') ? String(fd.get('birthDate')) : undefined
    // if date came from <input type="date"> it's already yyyy-MM-dd; avoid Date() to prevent TZ shifts
    const birthIso = rawBirth || undefined

    // select now provides backend gender codes directly (M/F/O)
    const rawGender = fd.get('gender') ? String(fd.get('gender')) : ''
    const genderCode = rawGender || undefined

    const payload: any = {
      fullName: String(fd.get('fullName') || '').trim(),
      email: String(fd.get('email') || '').trim(),
      phone: String(fd.get('phone') || '').trim(),
      // optional fields
      birthDate: birthIso,
      gender: genderCode,
      address: String(fd.get('address') || '').trim(),
    }

    // client-side validation (inline)
    const errors: any = {}
    if (!payload.fullName) errors.fullName = 'Họ và tên là bắt buộc.'
    const phoneDigits = (payload.phone || '').replace(/[^0-9]/g, '')
    if (!phoneDigits || phoneDigits.length < 9) errors.phone = 'Số điện thoại không hợp lệ.'
    if (payload.email) {
      const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRe.test(payload.email)) errors.email = 'Email không hợp lệ.'
    }
    if (Object.keys(errors).length) {
      setFieldErrors(errors)
      return
    }
    setFieldErrors({})

    try {
      setIsSaving(true)
      const stored = localStorage.getItem('user')
      const parsed = stored ? JSON.parse(stored) : null
      const id = parsed && (parsed.id || parsed.customerId || parsed.CustomerId)
      if (id) {
        // preserve id in payload (backend expects customerId)
        payload.customerId = id
        await import('@/lib/api').then(async ({ apiPut }) => {
          // apiPut may return JSON or null; prefer returned object when available
          const result = await apiPut(`/customers/${id}`, payload)
          // update localStorage with returned result or with payload merged with id
          const updated = result || { ...payload, customerId: id }
          const storedUser = { ...updated }
          localStorage.setItem('user', JSON.stringify(storedUser))
          setUser(storedUser)
        })
      } else {
        await import('@/lib/api').then(async ({ apiPost }) => {
          const created = await apiPost('/customers', payload)
          if (created) {
            // store created user id locally
            const storedUser = { ...created }
            localStorage.setItem('user', JSON.stringify(storedUser))
            setUser(storedUser)
          }
        })
      }
      // optimistic update of local state if backend did not return content
      setUser((u: any) => ({ ...u, ...payload }))
      toast({ title: 'Đã lưu', description: 'Thông tin của bạn đã được cập nhật.' })
    } catch (err: any) {
      console.error(err)
      const msg = err?.message || String(err)
      toast({ title: 'Lưu thất bại', description: `${msg}. Hãy đảm bảo backend đang chạy và NEXT_PUBLIC_API_URL trỏ đúng.`, variant: 'destructive' })
    } finally {
      setIsSaving(false)
    }
  }

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

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {!useMocksFlag && (
          <div className="mb-4 p-3 rounded-md bg-yellow-50 border border-yellow-200 flex items-center justify-between">
            <div className="text-sm text-yellow-800">Chạy giao diện không phụ thuộc backend? Bạn có thể bật chế độ mock để thử nghiệm UI.</div>
            <div>
              <Button onClick={async () => {
                try {
                  localStorage.setItem('useMocks', 'true')
                  setUseMocksFlag(true)
                  const { apiGet } = await import('@/lib/api')
                  const data = await apiGet('/customers/1')
                  if (data) {
                    localStorage.setItem('user', JSON.stringify(data))
                    setUser(data)
                    toast({ title: 'Mock bật', description: 'Dữ liệu mock đã được nạp.' })
                  }
                } catch (err) {
                  toast({ title: 'Lỗi', description: 'Không thể nạp dữ liệu mock.' , variant: 'destructive'})
                }
              }}>Bật mock UI</Button>
            </div>
          </div>
        )}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Hồ sơ của tôi</h1>
          <p className="text-muted-foreground">Quản lý thông tin cá nhân và ưu đãi</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle className="text-center">Thông tin thành viên</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-center">
                <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-12 w-12 text-primary" />
                </div>
              </div>
              <div className="text-center">
                <Badge className="bg-purple-100 text-purple-800 text-base px-4 py-1">
                  <Award className="h-4 w-4 mr-1 inline" />
                  {user.membershipTier}
                </Badge>
                <p className="text-2xl font-bold mt-3">{user.points}</p>
                <p className="text-sm text-muted-foreground">Điểm tích lũy</p>
              </div>
              <div className="pt-4 border-t text-center">
                <p className="text-sm text-muted-foreground">Thành viên từ</p>
                <p className="font-medium">{user.joinDate}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Thông tin cá nhân</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleSubmit as any}>
                <div className="space-y-2">
                    <Label htmlFor="fullName">Họ và tên</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="fullName" name="fullName" defaultValue={user.fullName || user.name} className="pl-10" aria-invalid={!!fieldErrors.fullName} disabled={isSaving} />
                    {fieldErrors.fullName && <p className="text-destructive text-sm mt-1">{fieldErrors.fullName}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="email" name="email" type="email" defaultValue={user.email} className="pl-10" aria-invalid={!!fieldErrors.email} disabled={isSaving} />
                    {fieldErrors.email && <p className="text-destructive text-sm mt-1">{fieldErrors.email}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Số điện thoại</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="phone" name="phone" type="tel" defaultValue={user.phone} className="pl-10" aria-invalid={!!fieldErrors.phone} disabled={isSaving} />
                    {fieldErrors.phone && <p className="text-destructive text-sm mt-1">{fieldErrors.phone}</p>}
                  </div>
                </div>

                <div className="space-y-2 md:flex md:gap-4">
                  <div className="flex-1">
                    <Label htmlFor="birthDate">Ngày sinh</Label>
                    <Input id="birthDate" name="birthDate" type="date" defaultValue={user.birthDate ? String(user.birthDate) : ''} />
                  </div>
                  <div className="w-40">
                    <Label htmlFor="gender">Giới tính</Label>
                    <select id="gender" name="gender" value={user.gender || ''} onChange={(e) => setUser((u: any) => ({ ...u, gender: e.target.value }))} className="w-full rounded-md border bg-input px-3 py-2" disabled={isSaving}>
                      <option value="">Chưa chọn</option>
                      <option value="M">Nam</option>
                      <option value="F">Nữ</option>
                      <option value="O">Khác</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Địa chỉ</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="address" name="address" defaultValue={user.address} className="pl-10" />
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1" disabled={isSaving}>
                    {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
                  </Button>
                  <Button type="button" variant="outline" className="flex-1 bg-transparent">
                    Đổi mật khẩu
                  </Button>
                  <Button type="button" variant="destructive" className="flex-1" onClick={async () => {
                    const ok = confirm('Bạn có chắc muốn xóa tài khoản của mình? Hành động này không thể hoàn tác.')
                    if (!ok) return
                    try {
                      const id = user?.customerId || user?.id || user?.CustomerId
                      if (!id) throw new Error('Không tìm thấy id khách hàng')
                      const { apiDelete } = await import('@/lib/api')
                      await apiDelete(`/customers/${id}`)
                      try { localStorage.removeItem('user') } catch {}
                      toast({ title: 'Đã xóa', description: 'Tài khoản của bạn đã được xóa.' })
                      router.push('/')
                    } catch (err: any) {
                      console.error(err)
                      toast({ title: 'Lỗi', description: err?.message || String(err), variant: 'destructive' })
                    }
                  }}>
                    Xóa tài khoản
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Ưu đãi của tôi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-4 border rounded-lg bg-gradient-to-r from-purple-50 to-blue-50">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-lg">Giảm 20% dịch vụ Spa</p>
                    <p className="text-sm text-muted-foreground">Áp dụng cho thành viên VIP</p>
                  </div>
                  <Badge>Còn 15 ngày</Badge>
                </div>
              </div>
              <div className="p-4 border rounded-lg bg-gradient-to-r from-green-50 to-emerald-50">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-lg">Miễn phí khám tổng quát</p>
                    <p className="text-sm text-muted-foreground">Dành cho thú cưng sinh nhật trong tháng</p>
                  </div>
                  <Badge>Còn 7 ngày</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Đặt lịch của tôi</CardTitle>
            </CardHeader>
            <CardContent>
              {bookings.length === 0 ? (
                <p className="text-sm text-muted-foreground">Không có lịch.</p>
              ) : (
                <ul className="space-y-3">
                  {bookings.map((b) => {
                    const id = b?.bookingId ?? b?.id
                    const service = b?.serviceName ?? b?.service ?? 'Dịch vụ'
                    const date = b?.date ?? b?.appointmentDate ?? ''
                    const status = b?.status ?? ''
                    const total = b?.total ?? b?.amount ?? null
                    return (
                    <li key={id} className="p-3 border rounded-md cursor-pointer" role="button" tabIndex={0} onClick={() => router.push(`/customer/bookings/${id}`)} onKeyDown={(e) => { if (e.key === 'Enter') router.push(`/customer/bookings/${id}`) }}>
                      <div className="flex justify-between">
                        <div>
                          <div className="font-medium">{service}</div>
                          <div className="text-sm text-muted-foreground">{date}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm">{status}</div>
                          <div className="font-bold">{total ? (typeof total === 'number' ? total + 'k' : String(total)) : '-'}</div>
                        </div>
                      </div>
                    </li>
                  )})}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Hóa đơn</CardTitle>
            </CardHeader>
            <CardContent>
              {invoices.length === 0 ? (
                <p className="text-sm text-muted-foreground">Không có hóa đơn.</p>
              ) : (
                <ul className="space-y-3">
                  {invoices.map((i) => {
                    const id = i?.invoiceId ?? i?.id
                    const issued = i?.issuedAt ?? i?.createdAt ?? i?.date
                    const amount = i?.amount ?? i?.total ?? null
                    const paid = !!i?.paid
                    return (
                    <li key={id} className="p-3 border rounded-md flex justify-between items-center cursor-pointer" role="button" tabIndex={0} onClick={() => router.push(`/customer/invoices/${id}`)} onKeyDown={(e) => { if (e.key === 'Enter') router.push(`/customer/invoices/${id}`) }}>
                      <div>
                        <div className="font-medium">Invoice #{id}</div>
                        <div className="text-sm text-muted-foreground">{issued ? new Date(issued).toLocaleString() : ''}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{amount ? (typeof amount === 'number' ? amount + 'k' : String(amount)) : '-'}</div>
                        <div className={`text-sm ${paid ? 'text-green-600' : 'text-red-600'}`}>{paid ? 'Đã thanh toán' : 'Chưa trả'}</div>
                      </div>
                    </li>
                  )})}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
