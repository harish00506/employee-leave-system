"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useAuthStore, useNotificationStore } from "@/lib/store"
import { cn } from "@/lib/utils"
import {
  Menu,
  Bell,
  Calendar,
  LayoutDashboard,
  CalendarPlus,
  FileText,
  User,
  LogOut,
  ClipboardList,
  CheckSquare,
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
  { href: "/manager/pending-requests", label: "Pending", icon: ClipboardList },
  { href: "/manager/all-requests", label: "All Requests", icon: CheckSquare },
  { href: "/employee/apply-leave", label: "Apply Leave", icon: CalendarPlus },
  { href: "/employee/my-requests", label: "My Requests", icon: FileText },
  { href: "/employee/notifications", label: "Notifications", icon: Bell },
  { href: "/employee/profile", label: "Profile", icon: User },
]

export function Header() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuthStore()
  const { notifications, markAsRead, markAllAsRead, getUnreadCount } = useNotificationStore()

  const links = user?.role === "manager" ? managerLinks : employeeLinks
  const unreadCount = user ? getUnreadCount(user.id) : 0
  const userNotifications = notifications.filter((n) => n.userId === user?.id).slice(0, 5)

  const handleLogout = () => {
    logout()
    router.push("/auth")
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-card px-4 lg:px-6">
      <div className="flex items-center gap-4">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="lg:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <div className="flex h-16 items-center gap-2 border-b px-6">
              <Calendar className="h-6 w-6 text-primary" />
              <span className="text-lg font-semibold">LeaveFlow</span>
            </div>
            <nav className="space-y-1 p-4">
              {links.map((link) => {
                const Icon = link.icon
                const isActive = pathname === link.href
                const showBadge = link.href === "/employee/notifications" && unreadCount > 0
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      isActive ? "bg-accent text-accent-foreground" : "hover:bg-accent/50",
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
            <div className="absolute bottom-0 left-0 right-0 border-t p-4">
              <Button variant="ghost" className="w-full justify-start gap-2" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </SheetContent>
        </Sheet>
        <div className="hidden items-center gap-2 lg:flex">
          <h1 className="text-lg font-semibold">{user?.role === "manager" ? "Manager Portal" : "Employee Portal"}</h1>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
              <span className="sr-only">Notifications</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <div className="flex items-center justify-between border-b px-4 py-2">
              <span className="text-sm font-semibold">Notifications</span>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
                  onClick={() => user && markAllAsRead(user.id)}
                >
                  Mark all read
                </Button>
              )}
            </div>
            {userNotifications.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">No notifications</div>
            ) : (
              userNotifications.map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className="flex cursor-pointer flex-col items-start gap-1 p-4"
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex w-full items-start justify-between gap-2">
                    <span className="text-sm font-medium">{notification.title}</span>
                    {!notification.isRead && <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />}
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">{notification.message}</p>
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(notification.createdAt).toLocaleDateString()}
                  </span>
                </DropdownMenuItem>
              ))
            )}
            <div className="border-t p-2">
              <Button variant="ghost" size="sm" className="w-full" asChild>
                <Link href="/employee/notifications">View all notifications</Link>
              </Button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="hidden items-center gap-2 lg:flex">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
            {user?.name?.charAt(0) || "U"}
          </div>
        </div>
      </div>
    </header>
  )
}
