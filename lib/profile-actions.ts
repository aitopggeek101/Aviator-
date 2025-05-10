"use server"

import { v4 as uuidv4 } from "uuid"
import { getCurrentUser } from "./auth-actions"
import { redirect } from "next/navigation"
import { users, children, drivers, vehicles } from "./auth-actions"

// In-memory storage for locations
const locations = []

export async function getUserProfile() {
  const user = await getCurrentUser()
  if (!user) {
    return null
  }
  return user
}

export async function updateProfile(type, data) {
  const user = await getCurrentUser()

  if (!user) {
    throw new Error("Not authenticated")
  }

  try {
    if (type === "parent") {
      // Update user in the users array
      const userIndex = users.findIndex((u) => u.id === user.id)
      if (userIndex !== -1) {
        users[userIndex] = {
          ...users[userIndex],
          name: data.name,
          email: data.email,
        }
      }
    } else if (type === "child") {
      // Update child in the children array
      const childIndex = children.findIndex((c) => c.id === data.id && c.user_id === user.id)
      if (childIndex !== -1) {
        children[childIndex] = {
          ...children[childIndex],
          name: data.name,
          age: Number.parseInt(data.age),
          grade: data.grade,
          school: data.school,
        }
      }
    } else if (type === "driver") {
      // Update driver in the drivers array
      const driverIndex = drivers.findIndex((d) => d.id === data.id && d.user_id === user.id)
      if (driverIndex !== -1) {
        drivers[driverIndex] = {
          ...drivers[driverIndex],
          name: data.name,
          license_number: data.licenseNumber,
          phone_number: data.phoneNumber,
        }
      }

      // Update vehicle VIN if provided
      if (data.vinNumber) {
        const vehicleIndex = vehicles.findIndex((v) => v.driver_id === data.id)
        if (vehicleIndex !== -1) {
          // Update existing vehicle
          vehicles[vehicleIndex] = {
            ...vehicles[vehicleIndex],
            vin_number: data.vinNumber,
          }
        } else {
          // Create new vehicle
          vehicles.push({
            id: uuidv4(),
            driver_id: data.id,
            vin_number: data.vinNumber,
            make: "Unknown", // Default values
            model: "Unknown",
            year: new Date().getFullYear(),
            created_at: new Date().toISOString(),
          })
        }
      }
    }

    return { success: true }
  } catch (error) {
    console.error(`Error updating ${type} profile:`, error)
    throw new Error(`Failed to update ${type} profile`)
  }
}

export async function deleteProfile(type, id) {
  const user = await getCurrentUser()

  if (!user) {
    throw new Error("Not authenticated")
  }

  try {
    if (type === "child") {
      // Delete the child from the children array
      const initialLength = children.length
      const newChildren = children.filter((c) => !(c.id === id && c.user_id === user.id))
      children.length = 0
      children.push(...newChildren)

      // Check if there are any children left
      const remainingChildren = children.filter((c) => c.user_id === user.id)

      // If no children left, delete the parent account
      if (remainingChildren.length === 0) {
        // Delete all related records first (drivers, vehicles, etc.)
        const userDriverIds = drivers.filter((d) => d.user_id === user.id).map((d) => d.id)

        // Delete vehicles associated with these drivers
        const newVehicles = vehicles.filter((v) => !userDriverIds.includes(v.driver_id))
        vehicles.length = 0
        vehicles.push(...newVehicles)

        // Delete drivers
        const newDrivers = drivers.filter((d) => d.user_id !== user.id)
        drivers.length = 0
        drivers.push(...newDrivers)

        // Delete the user
        const newUsers = users.filter((u) => u.id !== user.id)
        users.length = 0
        users.push(...newUsers)

        // Redirect to register page
        redirect("/register")
      }
    } else if (type === "driver") {
      // Get the vehicles associated with this driver
      const driverVehicles = vehicles.filter((v) => v.driver_id === id)

      // Delete any vehicles associated with this driver
      const newVehicles = vehicles.filter((v) => v.driver_id !== id)
      vehicles.length = 0
      vehicles.push(...newVehicles)

      // Delete the driver
      const newDrivers = drivers.filter((d) => !(d.id === id && d.user_id === user.id))
      drivers.length = 0
      drivers.push(...newDrivers)
    }

    return { success: true }
  } catch (error) {
    console.error(`Error deleting ${type}:`, error)
    throw new Error(`Failed to delete ${type}`)
  }
}

export async function addChildProfile(childData) {
  const user = await getCurrentUser()

  if (!user) {
    throw new Error("Not authenticated")
  }

  try {
    const childId = uuidv4()
    const timestamp = new Date().toISOString()

    // Create a new child
    const newChild = {
      id: childId,
      user_id: user.id,
      name: childData.name,
      age: Number.parseInt(childData.age),
      grade: childData.grade,
      school: childData.school,
      created_at: timestamp,
    }

    children.push(newChild)

    return {
      id: childId,
      name: childData.name,
      age: Number.parseInt(childData.age),
      grade: childData.grade,
      school: childData.school,
    }
  } catch (error) {
    console.error("Error adding child:", error)
    throw new Error("Failed to add child")
  }
}

export async function addDriverProfile(driverData) {
  const user = await getCurrentUser()

  if (!user) {
    throw new Error("Not authenticated")
  }

  try {
    // Validate VIN number
    if (driverData.vinNumber.length !== 17) {
      throw new Error("VIN number must be exactly 17 characters")
    }

    const driverId = uuidv4()
    const vehicleId = uuidv4()
    const timestamp = new Date().toISOString()

    // Create a new driver
    const newDriver = {
      id: driverId,
      user_id: user.id,
      name: driverData.name,
      license_number: driverData.licenseNumber,
      phone_number: driverData.phoneNumber,
      created_at: timestamp,
    }

    drivers.push(newDriver)

    // Create a new vehicle
    const newVehicle = {
      id: vehicleId,
      driver_id: driverId,
      vin_number: driverData.vinNumber,
      make: "Unknown", // Default values
      model: "Unknown",
      year: new Date().getFullYear(),
      created_at: timestamp,
    }

    vehicles.push(newVehicle)

    return {
      id: driverId,
      name: driverData.name,
      licenseNumber: driverData.licenseNumber,
      phoneNumber: driverData.phoneNumber,
      vinNumber: driverData.vinNumber,
    }
  } catch (error) {
    console.error("Error adding driver:", error)
    throw new Error("Failed to add driver")
  }
}

export async function updateVehicleLocation(vehicleId, latitude, longitude) {
  try {
    const locationId = uuidv4()
    const timestamp = new Date().toISOString()

    // Create a new location
    const newLocation = {
      id: locationId,
      vehicle_id: vehicleId,
      latitude,
      longitude,
      timestamp,
    }

    locations.push(newLocation)

    return { success: true }
  } catch (error) {
    console.error("Error updating vehicle location:", error)
    throw new Error("Failed to update vehicle location")
  }
}

export async function getVehicleLocation(vehicleId) {
  try {
    // Get the latest location for this vehicle
    const vehicleLocations = locations
      .filter((l) => l.vehicle_id === vehicleId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    if (vehicleLocations.length > 0) {
      return vehicleLocations[0]
    }

    // For demo purposes, create a mock location
    const mockLocation = {
      id: uuidv4(),
      vehicle_id: vehicleId,
      latitude: 40.7128 + Math.random() * 0.01,
      longitude: -74.006 + Math.random() * 0.01,
      timestamp: new Date().toISOString(),
    }

    locations.push(mockLocation)
    return mockLocation
  } catch (error) {
    console.error("Error getting vehicle location:", error)

    // For demo purposes, return a mock location
    return {
      id: uuidv4(),
      vehicle_id: vehicleId,
      latitude: 40.7128 + Math.random() * 0.01,
      longitude: -74.006 + Math.random() * 0.01,
      timestamp: new Date().toISOString(),
    }
  }
}
