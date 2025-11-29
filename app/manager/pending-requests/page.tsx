"use client"

import { useState, useMemo } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useLeaveStore } from "@/lib/store"
import { useToast } from "@/hooks/use-toast"
import { ClipboardList, Check, X, Search, ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import type { LeaveRequest, LeaveType } from "@/lib/types"

const ITEMS_PER_PAGE = 5

export default function PendingRequestsPage() {
  const { requests, approveLeave, rejectLeave } = useLeaveStore()
  const { toast } = useToast()

  const [searchName, setSearchName] = useState("")
  const [typeFilter, setTypeFilter] = useState<LeaveType | "all">("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null)
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null)
  const [comment, setComment] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  const pendingRequests = useMemo(() => {
    return requests
      .filter((r) => r.status === "pending")
      .filter((r) => !searchName || r.userName?.toLowerCase().includes(searchName.toLowerCase()))
      .filter((r) => typeFilter === "all" || r.leaveType === typeFilter)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [requests, searchName, typeFilter])

  const totalPages = Math.ceil(pendingRequests.length / ITEMS_PER_PAGE)
  const paginatedRequests = pendingRequests.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  const handleAction = (request: LeaveRequest, action: "approve" | "reject") => {
    setSelectedRequest(request)
    setActionType(action)
    setComment("")
  }

  const handleConfirmAction = async () => {
    if (!selectedRequest || !actionType) return

    if (actionType === "reject" && !comment.trim()) {
      toast({ title: "Error", description: "Please provide a reason for rejection", variant: "destructive" })
      return
    }

    setIsProcessing(true)

    const result =
      actionType === "approve"
        ? await approveLeave(selectedRequest.id, comment || "Approved")
        : await rejectLeave(selectedRequest.id, comment)

    if (result.success) {
      toast({
        title: "Success",
        description: `Leave request ${actionType === "approve" ? "approved" : "rejected"} successfully`,
      })
      setSelectedRequest(null)
      setActionType(null)
    } else {
      toast({ title: "Error", description: result.error, variant: "destructive" })
    }

    setIsProcessing(false)
  }

  return (
    <DashboardLayout requireManager>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Pending Requests</h1>
          <p className="text-muted-foreground">Review and manage leave requests</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5" />
              Pending Leave Requests
            </CardTitle>
            <CardDescription>
              {pendingRequests.length} pending request{pendingRequests.length !== 1 ? "s" : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex flex-col gap-4 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by employee name..."
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as LeaveType | "all")}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Leave Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="sick">Sick</SelectItem>
                  <SelectItem value="casual">Casual</SelectItem>
                  <SelectItem value="vacation">Vacation</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Date Range</TableHead>
                    <TableHead>Days</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedRequests.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground">
                        No pending requests
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{request.userName}</p>
                            <p className="text-xs text-muted-foreground">{request.userEmail}</p>
                          </div>
                        </TableCell>
                        <TableCell className="capitalize">{request.leaveType}</TableCell>
                        <TableCell>
                          {new Date(request.startDate).toLocaleDateString()} -{" "}
                          {new Date(request.endDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{request.totalDays}</TableCell>
                        <TableCell className="max-w-[200px]">
                          <p className="truncate" title={request.reason}>
                            {request.reason}
                          </p>
                        </TableCell>
                        <TableCell>{new Date(request.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-600 hover:bg-green-50 hover:text-green-700 bg-transparent"
                              onClick={() => handleAction(request, "approve")}
                            >
                              <Check className="mr-1 h-4 w-4" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:bg-red-50 hover:text-red-700 bg-transparent"
                              onClick={() => handleAction(request, "reject")}
                            >
                              <X className="mr-1 h-4 w-4" />
                              Reject
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog
          open={!!selectedRequest && !!actionType}
          onOpenChange={() => {
            setSelectedRequest(null)
            setActionType(null)
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{actionType === "approve" ? "Approve" : "Reject"} Leave Request</DialogTitle>
              <DialogDescription>
                {selectedRequest && (
                  <>
                    {selectedRequest.userName} - {selectedRequest.leaveType} leave for {selectedRequest.totalDays} days
                    <br />({new Date(selectedRequest.startDate).toLocaleDateString()} -{" "}
                    {new Date(selectedRequest.endDate).toLocaleDateString()})
                  </>
                )}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {selectedRequest && (
                <div className="rounded-lg bg-muted p-3">
                  <p className="text-sm font-medium">Reason:</p>
                  <p className="text-sm text-muted-foreground">{selectedRequest.reason}</p>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="comment">
                  {actionType === "reject" ? "Rejection Reason (required)" : "Comment (optional)"}
                </Label>
                <Textarea
                  id="comment"
                  placeholder={
                    actionType === "reject" ? "Please provide a reason for rejection..." : "Add a comment..."
                  }
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedRequest(null)
                  setActionType(null)
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmAction}
                disabled={isProcessing || (actionType === "reject" && !comment.trim())}
                className={actionType === "approve" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}
              >
                {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Confirm {actionType === "approve" ? "Approval" : "Rejection"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
