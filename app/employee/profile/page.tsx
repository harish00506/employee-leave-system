"use client"

import type React from "react"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuthStore } from "@/lib/store"
import { useToast } from "@/hooks/use-toast"
import { Loader2, User, Shield, CheckCircle2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function ProfilePage() {
  const { user, updateProfile, verifyEmail } = useAuthStore()
  const { toast } = useToast()

  const [name, setName] = useState(user?.name || "")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdating(true)

    const result = await updateProfile({ name })
    if (result.success) {
      toast({ title: "Success", description: "Profile updated successfully" })
    } else {
      toast({ title: "Error", description: result.error, variant: "destructive" })
    }

    setIsUpdating(false)
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (newPassword !== confirmPassword) {
      toast({ title: "Error", description: "Passwords do not match", variant: "destructive" })
      return
    }

    if (newPassword.length < 6) {
      toast({ title: "Error", description: "Password must be at least 6 characters", variant: "destructive" })
      return
    }

    setIsUpdating(true)
    const result = await updateProfile({ password: newPassword })
    if (result.success) {
      toast({ title: "Success", description: "Password changed successfully" })
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } else {
      toast({ title: "Error", description: result.error, variant: "destructive" })
    }
    setIsUpdating(false)
  }

  const handleVerifyEmail = async () => {
    setIsVerifying(true)
    const result = await verifyEmail("demo-token")
    if (result.success) {
      toast({ title: "Success", description: "Email verified successfully" })
    } else {
      toast({ title: "Error", description: result.error, variant: "destructive" })
    }
    setIsVerifying(false)
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Profile Settings</h1>
          <p className="text-muted-foreground">Manage your account settings</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Information
            </CardTitle>
            <CardDescription>Update your personal details</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="flex items-center gap-2">
                  <Input id="email" value={user?.email || ""} disabled className="flex-1" />
                  {user?.isEmailVerified ? (
                    <Badge variant="outline" className="shrink-0 gap-1 text-green-600 border-green-200 bg-green-50">
                      <CheckCircle2 className="h-3 w-3" />
                      Verified
                    </Badge>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleVerifyEmail}
                      disabled={isVerifying}
                      className="shrink-0 bg-transparent"
                    >
                      {isVerifying ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify Email"}
                    </Button>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <div className="flex h-10 items-center rounded-md border bg-muted px-3">
                  <Shield className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span className="capitalize">{user?.role}</span>
                </div>
              </div>
              <Button type="submit" disabled={isUpdating}>
                {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>Update your password to keep your account secure</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  minLength={6}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  minLength={6}
                />
              </div>
              <Button type="submit" disabled={isUpdating || !currentPassword || !newPassword}>
                {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update Password
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Leave Balance</CardTitle>
            <CardDescription>Your current leave balance for this year</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg border p-4 text-center">
                <p className="text-3xl font-bold text-red-500">{user?.leaveBalance.sickLeave || 0}</p>
                <p className="text-sm font-medium">Sick Leave</p>
                <p className="text-xs text-muted-foreground">of 10 days</p>
              </div>
              <div className="rounded-lg border p-4 text-center">
                <p className="text-3xl font-bold text-amber-500">{user?.leaveBalance.casualLeave || 0}</p>
                <p className="text-sm font-medium">Casual Leave</p>
                <p className="text-xs text-muted-foreground">of 5 days</p>
              </div>
              <div className="rounded-lg border p-4 text-center">
                <p className="text-3xl font-bold text-green-500">{user?.leaveBalance.vacation || 0}</p>
                <p className="text-sm font-medium">Vacation</p>
                <p className="text-xs text-muted-foreground">of 5 days</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
