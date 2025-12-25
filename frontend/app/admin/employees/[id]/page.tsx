"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function AdminEmployeeDetailRedirect() {
  const router = useRouter()
  useEffect(() => {
    // Immediately navigate back to the employees list to keep admin UI inline
    router.replace('/admin/employees')
  }, [router])
  return null
}
