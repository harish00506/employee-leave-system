import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { User, LeaveRequest, Notification, LeaveStatus } from "./types"

// Demo data
const demoUsers: User[] = [
  {
    id: "1",
    name: "John Employee",
    email: "john@company.com",
    role: "employee",
    isEmailVerified: true,
    leaveBalance: { sickLeave: 8, casualLeave: 4, vacation: 3 },
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "2",
    name: "Sarah Manager",
    email: "sarah@company.com",
    role: "manager",
    isEmailVerified: true,
    leaveBalance: { sickLeave: 10, casualLeave: 5, vacation: 5 },
    createdAt: "2024-01-10T10:00:00Z",
    updatedAt: "2024-01-10T10:00:00Z",
  },
  {
    id: "3",
    name: "Mike Developer",
    email: "mike@company.com",
    role: "employee",
    isEmailVerified: true,
    leaveBalance: { sickLeave: 7, casualLeave: 3, vacation: 2 },
    createdAt: "2024-02-01T10:00:00Z",
    updatedAt: "2024-02-01T10:00:00Z",
  },
  {
    id: "4",
    name: "Emily Designer",
    email: "emily@company.com",
    role: "employee",
    isEmailVerified: false,
    leaveBalance: { sickLeave: 10, casualLeave: 5, vacation: 5 },
    createdAt: "2024-03-01T10:00:00Z",
    updatedAt: "2024-03-01T10:00:00Z",
  },
]

const demoLeaveRequests: LeaveRequest[] = [
  {
    id: "lr1",
    userId: "1",
    userName: "John Employee",
    userEmail: "john@company.com",
    leaveType: "sick",
    startDate: "2024-12-10",
    endDate: "2024-12-11",
    totalDays: 2,
    reason: "Feeling unwell, need rest",
    status: "approved",
    managerComment: "Get well soon!",
    createdAt: "2024-12-08T10:00:00Z",
    updatedAt: "2024-12-08T12:00:00Z",
  },
  {
    id: "lr2",
    userId: "1",
    userName: "John Employee",
    userEmail: "john@company.com",
    leaveType: "vacation",
    startDate: "2024-12-24",
    endDate: "2024-12-26",
    totalDays: 2,
    reason: "Christmas holidays with family",
    status: "pending",
    createdAt: "2024-12-01T10:00:00Z",
    updatedAt: "2024-12-01T10:00:00Z",
  },
  {
    id: "lr3",
    userId: "3",
    userName: "Mike Developer",
    userEmail: "mike@company.com",
    leaveType: "casual",
    startDate: "2024-12-15",
    endDate: "2024-12-15",
    totalDays: 0.5,
    reason: "Personal appointment in the morning",
    status: "pending",
    createdAt: "2024-12-05T10:00:00Z",
    updatedAt: "2024-12-05T10:00:00Z",
  },
  {
    id: "lr4",
    userId: "3",
    userName: "Mike Developer",
    userEmail: "mike@company.com",
    leaveType: "sick",
    startDate: "2024-11-20",
    endDate: "2024-11-22",
    totalDays: 3,
    reason: "Flu symptoms",
    status: "approved",
    managerComment: "Approved. Take care!",
    createdAt: "2024-11-18T10:00:00Z",
    updatedAt: "2024-11-18T14:00:00Z",
  },
  {
    id: "lr5",
    userId: "1",
    userName: "John Employee",
    userEmail: "john@company.com",
    leaveType: "casual",
    startDate: "2024-10-05",
    endDate: "2024-10-05",
    totalDays: 1,
    reason: "Moving to new apartment",
    status: "rejected",
    managerComment: "Critical project deadline. Please reschedule.",
    createdAt: "2024-10-01T10:00:00Z",
    updatedAt: "2024-10-02T10:00:00Z",
  },
]

const demoNotifications: Notification[] = [
  {
    id: "n1",
    userId: "1",
    title: "Leave Approved",
    message: "Your sick leave request for Dec 10-11 has been approved.",
    type: "leave_approved",
    isRead: false,
    createdAt: "2024-12-08T12:00:00Z",
  },
  {
    id: "n2",
    userId: "2",
    title: "New Leave Request",
    message: "John Employee has submitted a vacation leave request.",
    type: "leave_applied",
    isRead: false,
    createdAt: "2024-12-01T10:00:00Z",
  },
]

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  verifyEmail: (token: string) => Promise<{ success: boolean; error?: string }>
  updateProfile: (data: { name?: string; password?: string }) => Promise<{ success: boolean; error?: string }>
}

interface LeaveState {
  requests: LeaveRequest[]
  applyLeave: (
    data: Omit<LeaveRequest, "id" | "userId" | "userName" | "userEmail" | "status" | "createdAt" | "updatedAt">,
  ) => Promise<{ success: boolean; error?: string }>
  cancelLeave: (id: string) => Promise<{ success: boolean; error?: string }>
  approveLeave: (id: string, comment: string) => Promise<{ success: boolean; error?: string }>
  rejectLeave: (id: string, comment: string) => Promise<{ success: boolean; error?: string }>
  getMyRequests: (userId: string) => LeaveRequest[]
  getAllRequests: () => LeaveRequest[]
  getPendingRequests: () => LeaveRequest[]
}

interface NotificationState {
  notifications: Notification[]
  addNotification: (notification: Omit<Notification, "id" | "createdAt">) => void
  markAsRead: (id: string) => void
  markAllAsRead: (userId: string) => void
  getUnreadCount: (userId: string) => number
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: async (email, password) => {
        // Simulate API call
        await new Promise((r) => setTimeout(r, 500))
        const user = demoUsers.find((u) => u.email === email)
        if (user && password.length >= 6) {
          set({ user, token: "demo-jwt-token", isAuthenticated: true })
          return { success: true }
        }
        return { success: false, error: "Invalid email or password" }
      },
      register: async (name, email, password) => {
        await new Promise((r) => setTimeout(r, 500))
        const exists = demoUsers.find((u) => u.email === email)
        if (exists) {
          return { success: false, error: "Email already registered" }
        }
        if (password.length < 6) {
          return { success: false, error: "Password must be at least 6 characters" }
        }
        const newUser: User = {
          id: `user-${Date.now()}`,
          name,
          email,
          role: "employee",
          isEmailVerified: false,
          leaveBalance: { sickLeave: 10, casualLeave: 5, vacation: 5 },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        demoUsers.push(newUser)
        set({ user: newUser, token: "demo-jwt-token", isAuthenticated: true })
        return { success: true }
      },
      logout: () => {
        set({ user: null, token: null, isAuthenticated: false })
      },
      verifyEmail: async () => {
        await new Promise((r) => setTimeout(r, 500))
        const currentUser = get().user
        if (currentUser) {
          const updatedUser = { ...currentUser, isEmailVerified: true }
          set({ user: updatedUser })
          return { success: true }
        }
        return { success: false, error: "User not found" }
      },
      updateProfile: async (data) => {
        await new Promise((r) => setTimeout(r, 500))
        const currentUser = get().user
        if (currentUser) {
          const updatedUser = {
            ...currentUser,
            ...(data.name && { name: data.name }),
            updatedAt: new Date().toISOString(),
          }
          set({ user: updatedUser })
          return { success: true }
        }
        return { success: false, error: "User not found" }
      },
    }),
    { name: "auth-storage" },
  ),
)

export const useLeaveStore = create<LeaveState>()(
  persist(
    (set, get) => ({
      requests: demoLeaveRequests,
      applyLeave: async (data) => {
        await new Promise((r) => setTimeout(r, 500))
        const user = useAuthStore.getState().user
        if (!user) return { success: false, error: "Not authenticated" }

        // Check balance
        const balanceKey =
          data.leaveType === "sick" ? "sickLeave" : data.leaveType === "casual" ? "casualLeave" : "vacation"
        if (user.leaveBalance[balanceKey] < data.totalDays) {
          return { success: false, error: `Insufficient ${data.leaveType} leave balance` }
        }

        const newRequest: LeaveRequest = {
          id: `lr-${Date.now()}`,
          userId: user.id,
          userName: user.name,
          userEmail: user.email,
          ...data,
          status: "pending",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        set({ requests: [...get().requests, newRequest] })

        // Add notification for manager
        useNotificationStore.getState().addNotification({
          userId: "2", // Manager ID
          title: "New Leave Request",
          message: `${user.name} has submitted a ${data.leaveType} leave request.`,
          type: "leave_applied",
          isRead: false,
        })

        return { success: true }
      },
      cancelLeave: async (id) => {
        await new Promise((r) => setTimeout(r, 500))
        const request = get().requests.find((r) => r.id === id)
        if (!request) return { success: false, error: "Request not found" }
        if (request.status !== "pending") {
          return { success: false, error: "Can only cancel pending requests" }
        }
        set({ requests: get().requests.filter((r) => r.id !== id) })
        return { success: true }
      },
      approveLeave: async (id, comment) => {
        await new Promise((r) => setTimeout(r, 500))
        const requests = get().requests
        const request = requests.find((r) => r.id === id)
        if (!request) return { success: false, error: "Request not found" }

        // Deduct from user balance
        const user = demoUsers.find((u) => u.id === request.userId)
        if (user) {
          const balanceKey =
            request.leaveType === "sick" ? "sickLeave" : request.leaveType === "casual" ? "casualLeave" : "vacation"
          user.leaveBalance[balanceKey] -= request.totalDays

          // Update auth store if it's the current user
          const currentUser = useAuthStore.getState().user
          if (currentUser && currentUser.id === user.id) {
            useAuthStore.setState({ user: { ...currentUser, leaveBalance: user.leaveBalance } })
          }
        }

        set({
          requests: requests.map((r) =>
            r.id === id
              ? {
                  ...r,
                  status: "approved" as LeaveStatus,
                  managerComment: comment,
                  updatedAt: new Date().toISOString(),
                }
              : r,
          ),
        })

        // Notify employee
        useNotificationStore.getState().addNotification({
          userId: request.userId,
          title: "Leave Approved",
          message: `Your ${request.leaveType} leave request has been approved.`,
          type: "leave_approved",
          isRead: false,
        })

        return { success: true }
      },
      rejectLeave: async (id, comment) => {
        await new Promise((r) => setTimeout(r, 500))
        const requests = get().requests
        const request = requests.find((r) => r.id === id)
        if (!request) return { success: false, error: "Request not found" }

        set({
          requests: requests.map((r) =>
            r.id === id
              ? {
                  ...r,
                  status: "rejected" as LeaveStatus,
                  managerComment: comment,
                  updatedAt: new Date().toISOString(),
                }
              : r,
          ),
        })

        // Notify employee
        useNotificationStore.getState().addNotification({
          userId: request.userId,
          title: "Leave Rejected",
          message: `Your ${request.leaveType} leave request has been rejected. Comment: ${comment}`,
          type: "leave_rejected",
          isRead: false,
        })

        return { success: true }
      },
      getMyRequests: (userId) => {
        return get().requests.filter((r) => r.userId === userId)
      },
      getAllRequests: () => get().requests,
      getPendingRequests: () => get().requests.filter((r) => r.status === "pending"),
    }),
    { name: "leave-storage" },
  ),
)

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: demoNotifications,
      addNotification: (notification) => {
        const newNotification: Notification = {
          ...notification,
          id: `n-${Date.now()}`,
          createdAt: new Date().toISOString(),
        }
        set({ notifications: [newNotification, ...get().notifications] })
      },
      markAsRead: (id) => {
        set({
          notifications: get().notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
        })
      },
      markAllAsRead: (userId) => {
        set({
          notifications: get().notifications.map((n) => (n.userId === userId ? { ...n, isRead: true } : n)),
        })
      },
      getUnreadCount: (userId) => {
        return get().notifications.filter((n) => n.userId === userId && !n.isRead).length
      },
    }),
    { name: "notification-storage" },
  ),
)
