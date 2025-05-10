"use server"

import { cookies } from "next/headers"
import { v4 as uuidv4 } from "uuid"

// Simple in-memory database for demo purposes
// Using module-level variables to persist data across server actions
const users = []
const children = []
let drivers = []
let vehicles = []

// Simple hash function for demo purposes
function simpleHash(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32bit integer
  }
  return hash.toString()
}

export async function registerUser(userData) {
  try {
    console.log("Registering user:", userData)

    // Hash the password with a simple hash function for demo
    const hashedPassword = simpleHash(userData.parent.password)
    const userId = uuidv4()
    const timestamp = new Date().toISOString()

    // Create a new user
    const newUser = {
      id: userId,
      name: userData.parent.name,
      email: userData.parent.email,
      password_hash: hashedPassword,
      created_at: timestamp,
    }

    users.push(newUser)
    console.log("User created:", newUser)
    console.log("All users:", users)

    // Create a child record if provided
    if (userData.child) {
      const childId = uuidv4()
      const newChild = {
        id: childId,
        user_id: userId,
        name: userData.child.childName,
        age: Number.parseInt(userData.child.childAge),
        grade: userData.child.childGrade,
        school: userData.child.childSchool,
        created_at: timestamp,
      }

      children.push(newChild)
      console.log("Child created:", newChild)
    }

    // Set the session cookie
    cookies().set("userId", userId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 604800, // 1 week
      path: "/",
    })

    return { success: true, userId }
  } catch (error) {
    console.error("Registration error:", error)
    return { success: false, message: "Failed to register user: " + error.message }
  }
}

export async function loginUser({ email, password }) {
  try {
    console.log("Login attempt for:", email)
    console.log("All users:", users)

    // Find user by email
    const user = users.find((u) => u.email === email)

    if (!user) {
      console.log("User not found:", email)
      return { success: false, error: "user_not_found", message: "User not found. Please register first." }
    }

    // Compare passwords using simple hash
    const hashedPassword = simpleHash(password)
    const passwordMatch = hashedPassword === user.password_hash

    if (!passwordMatch) {
      console.log("Invalid password for:", email)
      return { success: false, error: "invalid_credentials", message: "Invalid email or password." }
    }

    console.log("Login successful for:", email)

    // Set the session cookie
    cookies().set("userId", user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 604800, // 1 week
      path: "/",
    })

    return { success: true, userId: user.id }
  } catch (error) {
    console.error("Login error:", error)
    return { success: false, error: "server_error", message: "An error occurred. Please try again." }
  }
}

export async function logoutUser() {
  // Clear the session cookie
  cookies().delete("userId")
  return { success: true }
}

export async function getCurrentUser() {
  try {
    const userId = cookies().get("userId")?.value

    if (!userId) {
      return null
    }

    // Find user by ID
    const user = users.find((u) => u.id === userId)

    if (!user) {
      cookies().delete("userId")
      return null
    }

    // Get the user's children
    const userChildren = children.filter((c) => c.user_id === userId)

    // Get the user's drivers
    const userDrivers = drivers.filter((d) => d.user_id === userId)

    return {
      id: user.id,
      parent: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      children: userChildren || [],
      drivers: userDrivers || [],
    }
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
}

export async function getUserProfile() {
  return getCurrentUser()
}

export async function deleteChildProfile(childId) {
  try {
    const userId = cookies().get("userId")?.value
    if (!userId) return { success: false, message: "Not authenticated" }

    // Find the child
    const childIndex = children.findIndex((c) => c.id === childId && c.user_id === userId)
    if (childIndex === -1) return { success: false, message: "Child not found" }

    // Remove the child
    children.splice(childIndex, 1)

    // Check if there are any children left for this user
    const remainingChildren = children.filter((c) => c.user_id === userId)

    if (remainingChildren.length === 0) {
      // Delete all related records
      drivers = drivers.filter((d) => d.user_id !== userId)
      vehicles = vehicles.filter((v) => {
        const driver = drivers.find((d) => d.id === v.driver_id)
        return driver && driver.user_id !== userId
      })

      // Delete the user
      const userIndex = users.findIndex((u) => u.id === userId)
      if (userIndex !== -1) {
        users.splice(userIndex, 1)
      }

      // Clear the session cookie
      cookies().delete("userId")

      return { success: true, accountDeleted: true }
    }

    return { success: true, accountDeleted: false }
  } catch (error) {
    console.error("Error deleting child profile:", error)
    return { success: false, message: "Failed to delete child profile" }
  }
}

// Export the data stores for other modules to use
export { users, children, drivers, vehicles }
