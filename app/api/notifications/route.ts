import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"

export async function GET() {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // In production: Fetch from MongoDB
    // const notifications = await Notification.find({ userId: session.userId })
    //   .sort({ createdAt: -1 })
    //   .limit(50)

    return NextResponse.json({
      success: true,
      notifications: [],
    })
  } catch (error) {
    console.error("Get notifications error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
