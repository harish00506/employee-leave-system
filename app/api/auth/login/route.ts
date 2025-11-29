import { type NextRequest, NextResponse } from "next/server"
import { signToken, setAuthCookie } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    // Validate input
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // In production: Verify credentials against MongoDB
    // const user = await User.findOne({ email })
    // if (!user || !(await bcrypt.compare(password, user.password))) {
    //   return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    // }

    // For demo, use mock users
    const mockUsers = [
      {
        id: "1",
        name: "John Employee",
        email: "john@company.com",
        role: "employee" as const,
        isEmailVerified: true,
        leaveBalance: { sickLeave: 8, casualLeave: 4, vacation: 3 },
      },
      {
        id: "2",
        name: "Sarah Manager",
        email: "sarah@company.com",
        role: "manager" as const,
        isEmailVerified: true,
        leaveBalance: { sickLeave: 10, casualLeave: 5, vacation: 5 },
      },
    ]

    const user = mockUsers.find((u) => u.email === email)
    if (!user || password.length < 6) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    // Generate JWT token
    const token = await signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
    })

    // Set auth cookie
    await setAuthCookie(token)

    return NextResponse.json({
      success: true,
      user,
      token,
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
