import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"

export async function GET() {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // In production: Fetch from MongoDB
    // const requests = await LeaveRequest.find({ userId: session.userId }).sort({ createdAt: -1 })

    // For demo, return empty array (client handles mock data)
    return NextResponse.json({
      success: true,
      requests: [],
    })
  } catch (error) {
    console.error("Get my requests error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
