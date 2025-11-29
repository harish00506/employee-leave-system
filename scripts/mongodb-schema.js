// MongoDB Schema Definitions for Employee Leave Management System
// Run this script to set up the database collections and indexes

/*
 * To use with MongoDB:
 * 1. Install mongoose: npm install mongoose
 * 2. Set MONGODB_URI environment variable
 * 3. Run: node scripts/mongodb-schema.js
 */

const mongoose = require("mongoose")

// User Schema
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["employee", "manager"],
      default: "employee",
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
      default: null,
    },
    leaveBalance: {
      sickLeave: {
        type: Number,
        default: 10,
      },
      casualLeave: {
        type: Number,
        default: 5,
      },
      vacation: {
        type: Number,
        default: 5,
      },
    },
  },
  {
    timestamps: true,
  },
)

// Leave Request Schema
const leaveRequestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    leaveType: {
      type: String,
      enum: ["sick", "casual", "vacation"],
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    totalDays: {
      type: Number,
      required: true,
      min: 0.5,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    managerComment: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  },
)

// Notification Schema
const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["leave_applied", "leave_approved", "leave_rejected", "info"],
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
)

// Create indexes
userSchema.index({ email: 1 })
leaveRequestSchema.index({ userId: 1 })
leaveRequestSchema.index({ status: 1 })
leaveRequestSchema.index({ createdAt: -1 })
notificationSchema.index({ userId: 1, isRead: 1 })

// Export models
const User = mongoose.model("User", userSchema)
const LeaveRequest = mongoose.model("LeaveRequest", leaveRequestSchema)
const Notification = mongoose.model("Notification", notificationSchema)

// Database setup function
async function setupDatabase() {
  const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/leave-management"

  try {
    await mongoose.connect(MONGODB_URI)
    console.log("Connected to MongoDB")

    // Create collections if they don\'t exist
    await User.createCollection()
    await LeaveRequest.createCollection()
    await Notification.createCollection()

    console.log("Collections created successfully")

    // Create a default manager user if none exists
    const managerExists = await User.findOne({ role: "manager" })
    if (!managerExists) {
      const bcrypt = require("bcryptjs")
      const hashedPassword = await bcrypt.hash("manager123", 12)

      await User.create({
        name: "Default Manager",
        email: "manager@company.com",
        password: hashedPassword,
        role: "manager",
        isEmailVerified: true,
      })
      console.log("Default manager created: manager@company.com / manager123")
    }

    console.log("Database setup complete!")
  } catch (error) {
    console.error("Database setup error:", error)
  } finally {
    await mongoose.disconnect()
  }
}

// Run setup if executed directly
if (require.main === module) {
  setupDatabase()
}

module.exports = { User, LeaveRequest, Notification, setupDatabase }
