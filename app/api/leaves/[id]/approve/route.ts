import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { sendEmail, generateLeaveStatusEmail } from "@/lib/email"

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is manager
    if (session.role !== "manager") {
      return NextResponse.json({ error: "Forbidden: Manager access required" }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const { comment } = body

    // In production: Update in MongoDB and deduct leave balance
    // const leaveRequest = await LeaveRequest.findByIdAndUpdate(
    //   id,
    //   { status: 'approved', managerComment: comment },
    //   { new: true }
    // ).populate('userId', 'name email leaveBalance')
    //
    // // Deduct leave balance
    // const balanceKey = leaveRequest.leaveType + 'Leave'
    // await User.findByIdAndUpdate(leaveRequest.userId._id, {
    //   $inc: { [`leaveBalance.${balanceKey}`]: -leaveRequest.totalDays }
    // })

    // Send email notification to employee
    const emailContent = generateLeaveStatusEmail("Employee", "approved", "sick", "2024-12-10", "2024-12-11", comment)
    await sendEmail({
      to: "employee@company.com",
      subject: emailContent.subject,
      html: emailContent.html,
    })

    return NextResponse.json({
      success: true,
      message: "Leave request approved",
    })
  } catch (error) {
    console.error("Approve leave error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
