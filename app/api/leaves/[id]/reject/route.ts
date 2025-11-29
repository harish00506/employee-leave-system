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

    // Validate comment is provided for rejection
    if (!comment || !comment.trim()) {
      return NextResponse.json({ error: "Rejection reason is required" }, { status: 400 })
    }

    // In production: Update in MongoDB
    // const leaveRequest = await LeaveRequest.findByIdAndUpdate(
    //   id,
    //   { status: 'rejected', managerComment: comment },
    //   { new: true }
    // ).populate('userId', 'name email')

    // Send email notification to employee
    const emailContent = generateLeaveStatusEmail("Employee", "rejected", "sick", "2024-12-10", "2024-12-11", comment)
    await sendEmail({
      to: "employee@company.com",
      subject: emailContent.subject,
      html: emailContent.html,
    })

    return NextResponse.json({
      success: true,
      message: "Leave request rejected",
    })
  } catch (error) {
    console.error("Reject leave error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
