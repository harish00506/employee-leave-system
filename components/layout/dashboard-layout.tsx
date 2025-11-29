"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "./sidebar"
import { Header } from "./header"
import { useAuthStore } from "@/lib/store"

interface DashboardLayoutProps {
  children: React.ReactNode
  requireManager?: boolean
}

export function DashboardLayout({ children, requireManager = false }: DashboardLayoutProps) {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth")
      return
    }

    if (requireManager && user?.role !== "manager") {
      router.push("/employee/dashboard")
    }
  }, [isAuthenticated, user, requireManager, router])

  if (!isAuthenticated || !user) {
    return null
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto bg-background p-4 lg:p-6">{children}</main>
      </div>
    </div>
  )
}
