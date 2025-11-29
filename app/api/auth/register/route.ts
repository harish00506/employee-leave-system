import { type NextRequest, NextResponse } from "next/server"
import { signToken, setAuthCookie } from "@/lib/auth"
import { sendEmail, generateVerificationEmail } from "@/lib/email"
import crypto from "crypto"

// In production, this would interact with MongoDB
// For demo, we use in-memory store (the Zustand store handles this client-side)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password } = body

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email, and password are required" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 })
    }

    // In production: Check if user exists in MongoDB
    // const existingUser = await User.findOne({ email })
    // if (existingUser) {
    //   return NextResponse.json({ error: 'Email already registered' }, { status: 400 })
    // }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString("hex")

    // In production: Hash password and create user in MongoDB
    // const hashedPassword = await bcrypt.hash(password, 12)
    // const user = await User.create({
    //   name,
    //   email,
    //   password: hashedPassword,
    //   role: 'employee',
    //   isEmailVerified: false,
    //   verificationToken,
    //   leaveBalance: { sickLeave: 10, casualLeave: 5, vacation: 5 },
    // })

    // For demo, create mock user
    const user = {
      id: `user-${Date.now()}`,
      name,
      email,
      role: "employee" as const,
      isEmailVerified: false,
      leaveBalance: { sickLeave: 10, casualLeave: 5, vacation: 5 },
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

    // Send verification email
    const emailContent = generateVerificationEmail(name, verificationToken)
    await sendEmail({
      to: email,
      subject: emailContent.subject,
      html: emailContent.html,
    })

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        leaveBalance: user.leaveBalance,
      },
      token,
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
