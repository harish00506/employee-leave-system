"use client"

import { useMemo } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { StatCard } from "@/components/ui/stat-card"
import { StatusBadge } from "@/components/ui/status-badge"
import { Button } from "@/components/ui/button"
import { useLeaveStore } from "@/lib/store"
import Link from "next/link"
import { ClipboardList, CheckCircle2, Users, TrendingUp, Clock, ArrowRight } from "lucide-react"
import { XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line } from "recharts"

const COLORS = ["#6366f1", "#22c55e", "#f59e0b"]

export default function ManagerDashboard() {
  const { requests } = useLeaveStore()

  const stats = useMemo(() => {
    const pending = requests.filter((r) => r.status === "pending")
    const today = new Date().toDateString()
    const thisMonth = new Date().getMonth()
    const thisYear = new Date().getFullYear()

    const approvalsToday = requests.filter(
      (r) => r.status === "approved" && new Date(r.updatedAt).toDateString() === today,
    ).length

    const approvalsThisMonth = requests.filter((r) => {
      const date = new Date(r.updatedAt)
      return r.status === "approved" && date.getMonth() === thisMonth && date.getFullYear() === thisYear
    }).length

    const teamUsage = requests.filter((r) => r.status === "approved").reduce((sum, r) => sum + r.totalDays, 0)

    return {
      pendingCount: pending.length,
      approvalsToday,
      approvalsThisMonth,
      teamUsage,
      recentPending: pending.slice(0, 5),
    }
  }, [requests])

  const leaveDistribution = useMemo(() => {
    const approved = requests.filter((r) => r.status === "approved")
    return [
      { name: "Sick", value: approved.filter((r) => r.leaveType === "sick").reduce((s, r) => s + r.totalDays, 0) },
      { name: "Casual", value: approved.filter((r) => r.leaveType === "casual").reduce((s, r) => s + r.totalDays, 0) },
      {
        name: "Vacation",
        value: approved.filter((r) => r.leaveType === "vacation").reduce((s, r) => s + r.totalDays, 0),
      },
    ].filter((d) => d.value > 0)
  }, [requests])

  const monthlyTrend = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    return months.map((month, index) => {
      const monthRequests = requests.filter((r) => {
        const date = new Date(r.startDate)
        return date.getMonth() === index && r.status === "approved"
      })
      return {
        month,
        total: monthRequests.reduce((sum, r) => sum + r.totalDays, 0),
        count: monthRequests.length,
      }
    })
  }, [requests])

  return (
    <DashboardLayout requireManager>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Manager Dashboard</h1>
            <p className="text-muted-foreground">Team leave overview and management</p>
          </div>
          <Button asChild>
            <Link href="/manager/pending-requests">
              <ClipboardList className="mr-2 h-4 w-4" />
              Review Pending ({stats.pendingCount})
            </Link>
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Pending Requests"
            value={stats.pendingCount}
            subtitle="Awaiting review"
            icon={Clock}
            iconColor="text-amber-500"
          />
          <StatCard
            title="Approved Today"
            value={stats.approvalsToday}
            subtitle="Requests processed"
            icon={CheckCircle2}
            iconColor="text-green-500"
          />
          <StatCard title="This Month" value={stats.approvalsThisMonth} subtitle="Approvals" icon={TrendingUp} />
          <StatCard title="Team Leave Usage" value={`${stats.teamUsage} days`} subtitle="Total approved" icon={Users} />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Leave Trend</CardTitle>
              <CardDescription>Team leave days by month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyTrend}>
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="total"
                      stroke="#6366f1"
                      strokeWidth={2}
                      dot={{ fill: "#6366f1" }}
                      name="Total Days"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Leave Distribution</CardTitle>
              <CardDescription>Team leaves by type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                {leaveDistribution.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={leaveDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {leaveDistribution.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    No leave data available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Pending Requests</CardTitle>
              <CardDescription>Requests awaiting your approval</CardDescription>
            </div>
            {stats.pendingCount > 0 && (
              <Button variant="ghost" size="sm" asChild>
                <Link href="/manager/pending-requests">
                  View all
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {stats.recentPending.length > 0 ? (
              <div className="space-y-3">
                {stats.recentPending.map((request) => (
                  <div
                    key={request.id}
                    className="flex flex-col gap-2 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{request.userName}</p>
                        <StatusBadge status={request.status} />
                      </div>
                      <p className="text-sm text-muted-foreground capitalize">
                        {request.leaveType} Leave • {request.totalDays} days
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(request.startDate).toLocaleDateString()} -{" "}
                        {new Date(request.endDate).toLocaleDateString()}
                      </p>
                    </div>
                    <Button asChild size="sm">
                      <Link href="/manager/pending-requests">Review</Link>
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                <CheckCircle2 className="mx-auto mb-2 h-8 w-8 text-green-500" />
                <p>All caught up! No pending requests.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
