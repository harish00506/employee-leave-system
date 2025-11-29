"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuthStore, useLeaveStore } from "@/lib/store"
import { useToast } from "@/hooks/use-toast"
import { Loader2, CalendarDays, Info } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { LeaveType } from "@/lib/types"

export default function ApplyLeavePage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const { applyLeave } = useLeaveStore()
  const { toast } = useToast()

  const [isLoading, setIsLoading] = useState(false)
  const [leaveType, setLeaveType] = useState<LeaveType>("sick")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [isHalfDay, setIsHalfDay] = useState(false)
  const [reason, setReason] = useState("")

  const calculateTotalDays = () => {
    if (!startDate || !endDate) return 0
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
    return isHalfDay ? 0.5 : diffDays
  }

  const totalDays = calculateTotalDays()

  const getAvailableBalance = () => {
    if (!user) return 0
    switch (leaveType) {
      case "sick":
        return user.leaveBalance.sickLeave
      case "casual":
        return user.leaveBalance.casualLeave
      case "vacation":
        return user.leaveBalance.vacation
      default:
        return 0
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!startDate || !endDate || !reason) {
      toast({ title: "Error", description: "Please fill all required fields", variant: "destructive" })
      return
    }

    if (new Date(endDate) < new Date(startDate)) {
      toast({ title: "Error", description: "End date must be after start date", variant: "destructive" })
      return
    }

    if (totalDays > getAvailableBalance()) {
      toast({
        title: "Insufficient Balance",
        description: `You only have ${getAvailableBalance()} ${leaveType} leave days available`,
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    const result = await applyLeave({
      leaveType,
      startDate,
      endDate,
      totalDays,
      reason,
    })

    if (result.success) {
      toast({ title: "Success", description: "Leave request submitted successfully" })
      router.push("/employee/my-requests")
    } else {
      toast({ title: "Error", description: result.error, variant: "destructive" })
    }

    setIsLoading(false)
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-2xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Apply for Leave</h1>
          <p className="text-muted-foreground">Submit a new leave request</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5" />
              Leave Application Form
            </CardTitle>
            <CardDescription>Fill in the details below to apply for leave</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="leaveType">Leave Type</Label>
                  <Select value={leaveType} onValueChange={(v) => setLeaveType(v as LeaveType)}>
                    <SelectTrigger id="leaveType">
                      <SelectValue placeholder="Select leave type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sick">Sick Leave ({user?.leaveBalance.sickLeave || 0} available)</SelectItem>
                      <SelectItem value="casual">
                        Casual Leave ({user?.leaveBalance.casualLeave || 0} available)
                      </SelectItem>
                      <SelectItem value="vacation">Vacation ({user?.leaveBalance.vacation || 0} available)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Total Days</Label>
                  <div className="flex h-10 items-center rounded-md border bg-muted px-3 text-lg font-semibold">
                    {totalDays}
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value)
                      if (!endDate) setEndDate(e.target.value)
                    }}
                    min={new Date().toISOString().split("T")[0]}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={startDate || new Date().toISOString().split("T")[0]}
                    required
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="halfDay"
                  checked={isHalfDay}
                  onCheckedChange={(checked) => setIsHalfDay(checked as boolean)}
                />
                <Label htmlFor="halfDay" className="text-sm font-normal">
                  Half-day leave (0.5 days)
                </Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Reason</Label>
                <Textarea
                  id="reason"
                  placeholder="Please provide a reason for your leave request..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={4}
                  required
                />
              </div>

              {totalDays > getAvailableBalance() && (
                <Alert variant="destructive">
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    You don't have enough {leaveType} leave balance. Available: {getAvailableBalance()} days
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => router.back()} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" disabled={isLoading || totalDays > getAvailableBalance()}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Submit Request
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-base">Leave Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg border p-3 text-center">
                <p className="text-2xl font-bold text-red-500">{user?.leaveBalance.sickLeave || 0}</p>
                <p className="text-sm text-muted-foreground">Sick Leave</p>
              </div>
              <div className="rounded-lg border p-3 text-center">
                <p className="text-2xl font-bold text-amber-500">{user?.leaveBalance.casualLeave || 0}</p>
                <p className="text-sm text-muted-foreground">Casual Leave</p>
              </div>
              <div className="rounded-lg border p-3 text-center">
                <p className="text-2xl font-bold text-green-500">{user?.leaveBalance.vacation || 0}</p>
                <p className="text-sm text-muted-foreground">Vacation</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
