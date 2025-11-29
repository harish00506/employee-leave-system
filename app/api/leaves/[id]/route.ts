import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    // In production: Verify ownership and delete from MongoDB
    // const request = await LeaveRequest.findOne({ _id: id, userId: session.userId })
    // if (!request) {
    //   return NextResponse.json({ error: 'Request not found' }, { status: 404 })
    // }
    // if (request.status !== 'pending') {
    //   return NextResponse.json({ error: 'Can only cancel pending requests' }, { status: 400 })
    // }
    // await LeaveRequest.deleteOne({ _id: id })

    return NextResponse.json({
      success: true,
      message: "Leave request cancelled",
    })
  } catch (error) {
    console.error("Cancel leave error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
