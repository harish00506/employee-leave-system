"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { useAuthStore, useNotificationStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  CalendarPlus,
  FileText,
  User,
  LogOut,
  ClipboardList,
  CheckSquare,
  Calendar,
  Bell,
} from "lucide-react"

const employeeLinks = [
  { href: "/employee/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/employee/apply-leave", label: "Apply Leave", icon: CalendarPlus },
  { href: "/employee/my-requests", label: "My Requests", icon: FileText },
  { href: "/employee/notifications", label: "Notifications", icon: Bell },
  { href: "/employee/profile", label: "Profile", icon: User },
]

const managerLinks = [
  { href: "/manager/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/manager/pending-requests", label: "Pending Requests", icon: ClipboardList },
  { href: "/manager/all-requests", label: "All Requests", icon: CheckSquare },
  { href: "/employee/apply-leave", label: "Apply Leave", icon: CalendarPlus },
  { href: "/employee/my-requests", label: "My Requests", icon: FileText },
  { href: "/employee/notifications", label: "Notifications", icon: Bell },
  { href: "/employee/profile", label: "Profile", icon: User },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuthStore()
  const { getUnreadCount } = useNotificationStore()

  const links = user?.role === "manager" ? managerLinks : employeeLinks
  const unreadCount = user ? getUnreadCount(user.id) : 0

  const handleLogout = () => {
    logout()
    router.push("/auth")
  }

  return (
    <aside className="hidden w-64 flex-col border-r border-border bg-sidebar lg:flex">
      <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-6">
        <Calendar className="h-6 w-6 text-primary" />
        <span className="text-lg font-semibold text-sidebar-foreground">LeaveFlow</span>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {links.map((link) => {
          const Icon = link.icon
          const isActive = pathname === link.href
          const showBadge = link.href === "/employee/notifications" && unreadCount > 0
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50",
              )}
            >
              <Icon className="h-4 w-4" />
              {link.label}
              {showBadge && (
                <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Link>
          )
        })}
      </nav>
      <div className="border-t border-sidebar-border p-4">
        <div className="mb-3 flex items-center gap-3 px-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
            {user?.name?.charAt(0) || "U"}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="truncate text-sm font-medium text-sidebar-foreground">{user?.name}</p>
            <p className="truncate text-xs text-muted-foreground capitalize">{user?.role}</p>
          </div>
        </div>
        <Button variant="ghost" className="w-full justify-start gap-2" onClick={handleLogout}>
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </aside>
  )
}
