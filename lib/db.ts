// Database configuration and utilities
// This file provides the database connection setup for MongoDB

export interface DbConfig {
  uri: string
  dbName: string
}

// For demo purposes, we're using in-memory storage via Zustand
// In production, replace with actual MongoDB connection using mongoose

/*
Example MongoDB setup with Mongoose:

import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/leave-management'

let cached = global.mongoose

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

export async function connectDB() {
  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI).then((mongoose) => {
      return mongoose
    })
  }
  cached.conn = await cached.promise
  return cached.conn
}
*/

// For this demo, we export a simple in-memory database connector
export const db = {
  isConnected: false,
  connect: async () => {
    // Simulate connection
    await new Promise((resolve) => setTimeout(resolve, 100))
    db.isConnected = true
    return true
  },
}
