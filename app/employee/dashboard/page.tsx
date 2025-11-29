"use client"

import { useMemo } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { StatCard } from "@/components/ui/stat-card"
import { StatusBadge } from "@/components/ui/status-badge"
import { useAuthStore, useLeaveStore } from "@/lib/store"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { CalendarDays, Stethoscope, Coffee, Palmtree, Clock, AlertTriangle, CalendarPlus } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts"

const COLORS = ["#6366f1", "#22c55e", "#f59e0b"]

export default function EmployeeDashboard() {
  const { user, verifyEmail } = useAuthStore()
  const { requests } = useLeaveStore()

  const myRequests = useMemo(() => {
    return requests.filter((r) => r.userId === user?.id)
  }, [requests, user?.id])

  const stats = useMemo(() => {
    const approved = myRequests.filter((r) => r.status === "approved")
    const pending = myRequests.filter((r) => r.status === "pending")
    const upcoming = approved.filter((r) => new Date(r.startDate) > new Date())

    const sickTaken = approved.filter((r) => r.leaveType === "sick").reduce((sum, r) => sum + r.totalDays, 0)
    const casualTaken = approved.filter((r) => r.leaveType === "casual").reduce((sum, r) => sum + r.totalDays, 0)
    const vacationTaken = approved.filter((r) => r.leaveType === "vacation").reduce((sum, r) => sum + r.totalDays, 0)

    return {
      totalTaken: approved.reduce((sum, r) => sum + r.totalDays, 0),
      sickTaken,
      casualTaken,
      vacationTaken,
      pendingCount: pending.length,
      upcoming: upcoming.slice(0, 3),
    }
  }, [myRequests])

  const pieData = [
    { name: "Sick", value: stats.sickTaken },
    { name: "Casual", value: stats.casualTaken },
    { name: "Vacation", value: stats.vacationTaken },
  ].filter((d) => d.value > 0)

  const monthlyData = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    return months.map((month, index) => {
      const monthRequests = myRequests.filter((r) => {
        const date = new Date(r.startDate)
        return date.getMonth() === index && r.status === "approved"
      })
      return {
        month,
        sick: monthRequests.filter((r) => r.leaveType === "sick").reduce((sum, r) => sum + r.totalDays, 0),
        casual: monthRequests.filter((r) => r.leaveType === "casual").reduce((sum, r) => sum + r.totalDays, 0),
        vacation: monthRequests.filter((r) => r.leaveType === "vacation").reduce((sum, r) => sum + r.totalDays, 0),
      }
    })
  }, [myRequests])

  const handleVerifyEmail = async () => {
    await verifyEmail("demo-token")
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Welcome back, {user?.name?.split(" ")[0]}!</h1>
            <p className="text-muted-foreground">Here's your leave overview</p>
          </div>
          <Button asChild>
            <Link href="/employee/apply-leave">
              <CalendarPlus className="mr-2 h-4 w-4" />
              Apply Leave
            </Link>
          </Button>
        </div>

        {user && !user.isEmailVerified && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Email Not Verified</AlertTitle>
            <AlertDescription className="flex items-center justify-between">
              <span>Please verify your email to access all features.</span>
              <Button variant="outline" size="sm" onClick={handleVerifyEmail}>
                Verify Now
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total Leaves Taken" value={stats.totalTaken} subtitle="This year" icon={CalendarDays} />
          <StatCard
            title="Sick Leave"
            value={`${user?.leaveBalance.sickLeave || 0} left`}
            subtitle={`${stats.sickTaken} used of 10`}
            icon={Stethoscope}
            iconColor="text-red-500"
          />
          <StatCard
            title="Casual Leave"
            value={`${user?.leaveBalance.casualLeave || 0} left`}
            subtitle={`${stats.casualTaken} used of 5`}
            icon={Coffee}
            iconColor="text-amber-500"
          />
          <StatCard
            title="Vacation"
            value={`${user?.leaveBalance.vacation || 0} left`}
            subtitle={`${stats.vacationTaken} used of 5`}
            icon={Palmtree}
            iconColor="text-green-500"
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Leave Usage</CardTitle>
              <CardDescription>Your leave distribution by month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData}>
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="sick" stackId="a" fill="#ef4444" name="Sick" />
                    <Bar dataKey="casual" stackId="a" fill="#f59e0b" name="Casual" />
                    <Bar dataKey="vacation" stackId="a" fill="#22c55e" name="Vacation" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Leave Distribution</CardTitle>
              <CardDescription>Leaves taken by type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                {pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {pieData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    No leaves taken yet
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Pending Requests
              </CardTitle>
              <CardDescription>Awaiting manager approval</CardDescription>
            </CardHeader>
            <CardContent>
              {stats.pendingCount > 0 ? (
                <div className="space-y-3">
                  {myRequests
                    .filter((r) => r.status === "pending")
                    .slice(0, 3)
                    .map((request) => (
                      <div key={request.id} className="flex items-center justify-between rounded-lg border p-3">
                        <div>
                          <p className="font-medium capitalize">{request.leaveType} Leave</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(request.startDate).toLocaleDateString()} -{" "}
                            {new Date(request.endDate).toLocaleDateString()}
                          </p>
                        </div>
                        <StatusBadge status={request.status} />
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground">No pending requests</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5" />
                Upcoming Leaves
              </CardTitle>
              <CardDescription>Your approved upcoming leaves</CardDescription>
            </CardHeader>
            <CardContent>
              {stats.upcoming.length > 0 ? (
                <div className="space-y-3">
                  {stats.upcoming.map((request) => (
                    <div key={request.id} className="flex items-center justify-between rounded-lg border p-3">
                      <div>
                        <p className="font-medium capitalize">{request.leaveType} Leave</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(request.startDate).toLocaleDateString()} -{" "}
                          {new Date(request.endDate).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="text-sm font-medium text-green-600">{request.totalDays} days</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground">No upcoming leaves</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
