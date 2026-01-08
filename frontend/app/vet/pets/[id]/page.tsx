"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function PetDetailPage() {
  const params = useParams()
  const id = params?.id
  const [pet, setPet] = useState<any | null>(null)
  const [checkHealths, setCheckHealths] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set())
  const router = useRouter()

  const toggleExpand = (checkId: number) => {
    setExpandedIds(prev => {
      const newSet = new Set(prev)
      if (newSet.has(checkId)) {
        newSet.delete(checkId)
      } else {
        newSet.add(checkId)
      }
      return newSet
    })
  }

  useEffect(() => {
    if (!id) return
    loadData()
  }, [id])

  const loadData = async () => {
    setLoading(true)
    try {
      const { apiGet } = await import('@/lib/api')
      
      // Load pet info
      try {
        const p = await apiGet('/pets/' + id)
        setPet(p)
        console.log('[PET DETAIL] Pet loaded:', p)
      } catch (err) {
        console.error('[PET DETAIL] Error loading pet:', err)
        setPet({ name: 'Error loading', species: '', breed: '', customerId: null })
      }
      
      // Load check healths
      try {
        const checks = await apiGet('/CheckHealths?petId=' + encodeURIComponent(String(id)))
        if (Array.isArray(checks)) {
          setCheckHealths(checks)
          console.log('[PET DETAIL] Check healths loaded:', checks.length)
        }
      } catch (err) {
        console.error('[PET DETAIL] Error loading check healths:', err)
      }
    } catch (err) {
      console.error('[PET DETAIL] Error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (!id) return <div>Không tìm thấy Pet ID</div>

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Hồ sơ thú cưng</h1>
          <p className="text-muted-foreground">ID: {id}</p>
        </div>
        <div>
          <Button variant="ghost" onClick={() => router.back()}>Quay lại</Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Thông tin</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? <div>Đang tải...</div> : (
            <div>
              <div className="font-medium">{pet?.name ?? '—'}</div>
              <div className="text-sm text-muted-foreground">{pet?.species ?? ''} — {pet?.breed ?? ''}</div>
              <div className="text-sm text-muted-foreground">Owner ID: {pet?.customerId ?? '—'}</div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Lịch sử khám bệnh ({checkHealths.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {checkHealths.length === 0 ? (
            <div className="text-muted-foreground">Chưa có lịch sử khám.</div>
          ) : (
            <div className="space-y-2">
              {checkHealths.map((check) => {
                const isExpanded = expandedIds.has(check.checkId)
                return (
                  <div
                    key={check.checkId}
                    className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                  >
                    {/* Collapsed Header - Always visible */}
                    <div
                      className="p-4 cursor-pointer hover:bg-muted/50 flex items-center justify-between"
                      onClick={() => toggleExpand(check.checkId)}
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${isExpanded ? 'bg-primary' : 'bg-muted-foreground'}`} />
                          <span className="font-medium">
                            {new Date(check.checkDate).toLocaleDateString('vi-VN', { 
                              day: '2-digit', 
                              month: '2-digit', 
                              year: 'numeric' 
                            })}
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Bác sĩ ID: {check.doctorId || 'N/A'}
                        </div>
                        {check.diagnosis && !isExpanded && (
                          <div className="text-sm text-muted-foreground truncate max-w-md">
                            • {check.diagnosis}
                          </div>
                        )}
                      </div>
                      <Button variant="ghost" size="sm">
                        {isExpanded ? 'Thu gọn' : 'Xem chi tiết'}
                      </Button>
                    </div>

                    {/* Expanded Details - Only visible when expanded */}
                    {isExpanded && (
                      <div className="p-4 pt-0 border-t bg-muted/20">
                        <div className="space-y-3 mt-3">
                          <div>
                            <span className="font-medium text-sm">Triệu chứng:</span>
                            <p className="text-sm text-muted-foreground mt-1">
                              {check.symptoms || 'Không có'}
                            </p>
                          </div>
                          
                          {check.diagnosis && (
                            <div>
                              <span className="font-medium text-sm">Chẩn đoán:</span>
                              <p className="text-sm text-muted-foreground mt-1">
                                {check.diagnosis}
                              </p>
                            </div>
                          )}
                          
                          {check.prescription && (
                            <div>
                              <span className="font-medium text-sm">Đơn thuốc:</span>
                              <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">
                                {check.prescription}
                              </p>
                            </div>
                          )}
                          
                          {check.followUpDate && (
                            <div>
                              <span className="font-medium text-sm">Tái khám:</span>
                              <p className="text-sm text-muted-foreground mt-1">
                                {new Date(check.followUpDate).toLocaleDateString('vi-VN')}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
