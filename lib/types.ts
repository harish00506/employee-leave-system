export type UserRole = "employee" | "manager"
export type LeaveType = "sick" | "casual" | "vacation"
export type LeaveStatus = "pending" | "approved" | "rejected"

export interface LeaveBalance {
  sickLeave: number
  casualLeave: number
  vacation: number
}

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  isEmailVerified: boolean
  leaveBalance: LeaveBalance
  createdAt: string
  updatedAt: string
}

export interface LeaveRequest {
  id: string
  userId: string
  userName?: string
  userEmail?: string
  leaveType: LeaveType
  startDate: string
  endDate: string
  totalDays: number
  reason: string
  status: LeaveStatus
  managerComment?: string
  createdAt: string
  updatedAt: string
}

export interface Notification {
  id: string
  userId: string
  title: string
  message: string
  type: "leave_applied" | "leave_approved" | "leave_rejected" | "info"
  isRead: boolean
  createdAt: string
}

export interface DashboardStats {
  totalLeavesTaken: number
  sickLeavesTaken: number
  casualLeavesTaken: number
  vacationTaken: number
  pendingRequests: number
  upcomingLeaves: LeaveRequest[]
  leaveBalance: LeaveBalance
  monthlyData: { month: string; sick: number; casual: number; vacation: number }[]
}

export interface ManagerDashboardStats {
  totalPendingRequests: number
  approvalsToday: number
  approvalsThisMonth: number
  teamLeaveUsage: number
  leaveDistribution: { type: string; count: number }[]
  monthlyTeamData: { month: string; total: number }[]
  recentRequests: LeaveRequest[]
}
