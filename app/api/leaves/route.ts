import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { sendEmail, generateLeaveAppliedEmail } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { leaveType, startDate, endDate, totalDays, reason } = body

    // Validate input
    if (!leaveType || !startDate || !endDate || !totalDays || !reason) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    // Validate leave type
    if (!["sick", "casual", "vacation"].includes(leaveType)) {
      return NextResponse.json({ error: "Invalid leave type" }, { status: 400 })
    }

    // Validate dates
    if (new Date(endDate) < new Date(startDate)) {
      return NextResponse.json({ error: "End date must be after start date" }, { status: 400 })
    }

    // In production: Check leave balance and create request in MongoDB
    // const user = await User.findById(session.userId)
    // const balanceKey = leaveType === 'sick' ? 'sickLeave' : leaveType === 'casual' ? 'casualLeave' : 'vacation'
    // if (user.leaveBalance[balanceKey] < totalDays) {
    //   return NextResponse.json({ error: 'Insufficient leave balance' }, { status: 400 })
    // }
    // const leaveRequest = await LeaveRequest.create({
    //   userId: session.userId,
    //   leaveType,
    //   startDate,
    //   endDate,
    //   totalDays,
    //   reason,
    //   status: 'pending',
    // })

    // For demo, create mock request
    const leaveRequest = {
      id: `lr-${Date.now()}`,
      userId: session.userId,
      leaveType,
      startDate,
      endDate,
      totalDays,
      reason,
      status: "pending",
      createdAt: new Date().toISOString(),
    }

    // Send email to manager
    const emailContent = generateLeaveAppliedEmail(
      "Manager",
      session.email,
      leaveType,
      startDate,
      endDate,
      totalDays,
      reason,
    )
    await sendEmail({
      to: "manager@company.com",
      subject: emailContent.subject,
      html: emailContent.html,
    })

    return NextResponse.json({
      success: true,
      leaveRequest,
    })
  } catch (error) {
    console.error("Apply leave error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
