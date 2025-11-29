import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"

export async function GET() {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // In production: Fetch user from MongoDB
    // const user = await User.findById(session.userId)

    return NextResponse.json({
      success: true,
      user: {
        id: session.userId,
        email: session.email,
        role: session.role,
        isEmailVerified: session.isEmailVerified,
      },
    })
  } catch (error) {
    console.error("Get me error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
