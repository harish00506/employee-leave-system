"use client"

import { useState, useMemo } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { StatusBadge } from "@/components/ui/status-badge"
import { useLeaveStore } from "@/lib/store"
import { FileText, Search, ChevronLeft, ChevronRight, Eye } from "lucide-react"
import type { LeaveRequest, LeaveStatus, LeaveType } from "@/lib/types"

const ITEMS_PER_PAGE = 10

export default function AllRequestsPage() {
  const { requests } = useLeaveStore()

  const [searchName, setSearchName] = useState("")
  const [typeFilter, setTypeFilter] = useState<LeaveType | "all">("all")
  const [statusFilter, setStatusFilter] = useState<LeaveStatus | "all">("all")
  const [startDateFilter, setStartDateFilter] = useState("")
  const [endDateFilter, setEndDateFilter] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null)

  const filteredRequests = useMemo(() => {
    return requests
      .filter((r) => !searchName || r.userName?.toLowerCase().includes(searchName.toLowerCase()))
      .filter((r) => typeFilter === "all" || r.leaveType === typeFilter)
      .filter((r) => statusFilter === "all" || r.status === statusFilter)
      .filter((r) => {
        if (!startDateFilter) return true
        return new Date(r.startDate) >= new Date(startDateFilter)
      })
      .filter((r) => {
        if (!endDateFilter) return true
        return new Date(r.endDate) <= new Date(endDateFilter)
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [requests, searchName, typeFilter, statusFilter, startDateFilter, endDateFilter])

  const totalPages = Math.ceil(filteredRequests.length / ITEMS_PER_PAGE)
  const paginatedRequests = filteredRequests.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  const clearFilters = () => {
    setSearchName("")
    setTypeFilter("all")
    setStatusFilter("all")
    setStartDateFilter("")
    setEndDateFilter("")
    setCurrentPage(1)
  }

  return (
    <DashboardLayout requireManager>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">All Leave Requests</h1>
          <p className="text-muted-foreground">Complete leave history across all employees</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Leave History
            </CardTitle>
            <CardDescription>
              {filteredRequests.length} total request{filteredRequests.length !== 1 ? "s" : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex flex-col gap-4">
              <div className="flex flex-col gap-4 sm:flex-row">
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
                  <SelectTrigger className="w-full sm:w-36">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="sick">Sick</SelectItem>
                    <SelectItem value="casual">Casual</SelectItem>
                    <SelectItem value="vacation">Vacation</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as LeaveStatus | "all")}>
                  <SelectTrigger className="w-full sm:w-36">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                <div className="flex-1 space-y-1">
                  <label className="text-sm text-muted-foreground">From Date</label>
                  <Input type="date" value={startDateFilter} onChange={(e) => setStartDateFilter(e.target.value)} />
                </div>
                <div className="flex-1 space-y-1">
                  <label className="text-sm text-muted-foreground">To Date</label>
                  <Input
                    type="date"
                    value={endDateFilter}
                    onChange={(e) => setEndDateFilter(e.target.value)}
                    min={startDateFilter}
                  />
                </div>
                <Button variant="outline" onClick={clearFilters} className="sm:w-auto bg-transparent">
                  Clear Filters
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Date Range</TableHead>
                    <TableHead>Days</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead className="text-right">Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedRequests.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground">
                        No requests found
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
                        <TableCell>
                          <StatusBadge status={request.status} />
                        </TableCell>
                        <TableCell>{new Date(request.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm" onClick={() => setSelectedRequest(request)}>
                                <Eye className="mr-1 h-4 w-4" />
                                View
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Leave Request Details</DialogTitle>
                                <DialogDescription>Full details for this leave request</DialogDescription>
                              </DialogHeader>
                              {selectedRequest && (
                                <div className="space-y-4 py-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <p className="text-sm text-muted-foreground">Employee</p>
                                      <p className="font-medium">{selectedRequest.userName}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-muted-foreground">Email</p>
                                      <p className="font-medium">{selectedRequest.userEmail}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-muted-foreground">Leave Type</p>
                                      <p className="font-medium capitalize">{selectedRequest.leaveType}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-muted-foreground">Status</p>
                                      <StatusBadge status={selectedRequest.status} />
                                    </div>
                                    <div>
                                      <p className="text-sm text-muted-foreground">Start Date</p>
                                      <p className="font-medium">
                                        {new Date(selectedRequest.startDate).toLocaleDateString()}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-muted-foreground">End Date</p>
                                      <p className="font-medium">
                                        {new Date(selectedRequest.endDate).toLocaleDateString()}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-muted-foreground">Total Days</p>
                                      <p className="font-medium">{selectedRequest.totalDays}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-muted-foreground">Submitted</p>
                                      <p className="font-medium">
                                        {new Date(selectedRequest.createdAt).toLocaleString()}
                                      </p>
                                    </div>
                                  </div>
                                  <div>
                                    <p className="text-sm text-muted-foreground">Reason</p>
                                    <p className="mt-1 rounded-lg bg-muted p-3 text-sm">{selectedRequest.reason}</p>
                                  </div>
                                  {selectedRequest.managerComment && (
                                    <div>
                                      <p className="text-sm text-muted-foreground">Manager Comment</p>
                                      <p className="mt-1 rounded-lg bg-muted p-3 text-sm">
                                        {selectedRequest.managerComment}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
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
      </div>
    </DashboardLayout>
  )
}
