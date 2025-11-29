// Email service utilities
// In production, integrate with services like SendGrid, Resend, or AWS SES

export interface EmailOptions {
  to: string
  subject: string
  html: string
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  // For demo purposes, we log the email
  console.log("📧 Email sent:", {
    to: options.to,
    subject: options.subject,
  })

  // In production, implement actual email sending:
  /*
  import { Resend } from 'resend'
  const resend = new Resend(process.env.RESEND_API_KEY)
  
  await resend.emails.send({
    from: 'LeaveFlow <noreply@leaveflow.com>',
    to: options.to,
    subject: options.subject,
    html: options.html,
  })
  */

  return true
}

export function generateVerificationEmail(name: string, token: string) {
  const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/auth/verify?token=${token}`

  return {
    subject: "Verify your email - LeaveFlow",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #6366f1;">Welcome to LeaveFlow!</h1>
        <p>Hi ${name},</p>
        <p>Thank you for registering. Please verify your email address by clicking the button below:</p>
        <a href="${verifyUrl}" style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 16px 0;">
          Verify Email
        </a>
        <p>Or copy and paste this link: ${verifyUrl}</p>
        <p>If you didn't create an account, you can safely ignore this email.</p>
        <p>Best,<br>The LeaveFlow Team</p>
      </div>
    `,
  }
}

export function generateLeaveAppliedEmail(
  managerName: string,
  employeeName: string,
  leaveType: string,
  startDate: string,
  endDate: string,
  totalDays: number,
  reason: string,
) {
  return {
    subject: `New Leave Request from ${employeeName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #6366f1;">New Leave Request</h1>
        <p>Hi ${managerName},</p>
        <p><strong>${employeeName}</strong> has submitted a new leave request:</p>
        <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p><strong>Type:</strong> ${leaveType}</p>
          <p><strong>Dates:</strong> ${startDate} to ${endDate}</p>
          <p><strong>Duration:</strong> ${totalDays} days</p>
          <p><strong>Reason:</strong> ${reason}</p>
        </div>
        <p>Please review this request in the LeaveFlow dashboard.</p>
        <p>Best,<br>LeaveFlow System</p>
      </div>
    `,
  }
}

export function generateLeaveStatusEmail(
  employeeName: string,
  status: "approved" | "rejected",
  leaveType: string,
  startDate: string,
  endDate: string,
  managerComment?: string,
) {
  const statusColor = status === "approved" ? "#22c55e" : "#ef4444"
  const statusText = status === "approved" ? "Approved" : "Rejected"

  return {
    subject: `Leave Request ${statusText} - LeaveFlow`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #6366f1;">Leave Request Update</h1>
        <p>Hi ${employeeName},</p>
        <p>Your leave request has been <strong style="color: ${statusColor};">${statusText.toLowerCase()}</strong>.</p>
        <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p><strong>Type:</strong> ${leaveType}</p>
          <p><strong>Dates:</strong> ${startDate} to ${endDate}</p>
          <p><strong>Status:</strong> <span style="color: ${statusColor};">${statusText}</span></p>
          ${managerComment ? `<p><strong>Manager's Comment:</strong> ${managerComment}</p>` : ""}
        </div>
        <p>Best,<br>LeaveFlow System</p>
      </div>
    `,
  }
}
