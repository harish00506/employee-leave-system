import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"

export async function GET() {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // In production: Fetch from MongoDB
    // const user = await User.findById(session.userId)

    // For demo, return default balance
    return NextResponse.json({
      success: true,
      balance: {
        sickLeave: 10,
        casualLeave: 5,
        vacation: 5,
      },
    })
  } catch (error) {
    console.error("Get balance error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
