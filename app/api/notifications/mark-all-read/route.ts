import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"

export async function PUT() {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // In production: Update all in MongoDB
    // await Notification.updateMany(
    //   { userId: session.userId, isRead: false },
    //   { isRead: true }
    // )

    return NextResponse.json({
      success: true,
      message: "All notifications marked as read",
    })
  } catch (error) {
    console.error("Mark all notifications read error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
