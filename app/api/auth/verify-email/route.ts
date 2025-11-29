import { type NextRequest, NextResponse } from "next/server"
import { getSession, signToken, setAuthCookie } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token: verificationToken } = body

    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // In production: Verify token and update user
    // const user = await User.findOneAndUpdate(
    //   { _id: session.userId, verificationToken },
    //   { isEmailVerified: true, verificationToken: null },
    //   { new: true }
    // )

    // For demo, just mark as verified
    const newToken = await signToken({
      ...session,
      isEmailVerified: true,
    })

    await setAuthCookie(newToken)

    return NextResponse.json({
      success: true,
      message: "Email verified successfully",
    })
  } catch (error) {
    console.error("Verify email error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
