import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/database.types"

// Initialize Supabase client with fallback values for preview
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://your-project.supabase.co"
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "your-anon-key"

// Create a single instance of the Supabase client to be used throughout the app
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// For preview/demo purposes, we'll use in-memory storage
let users = []
let children = []
let drivers = []
let vehicles = []
const locations = []

// Database schema types
export type User = {
  id: string
  name: string
  email: string
  created_at: string
}

export type Child = {
  id: string
  user_id: string
  name: string
  age: number
  grade: string
  school: string
  created_at: string
}

export type Driver = {
  id: string
  user_id: string
  name: string
  license_number: string
  phone_number: string
  vin_number: string
  created_at: string
}

export type Vehicle = {
  id: string
  driver_id: string
  vin_number: string
  make: string
  model: string
  year: number
  created_at: string
}

export type Location = {
  id: string
  vehicle_id: string
  latitude: number
  longitude: number
  timestamp: string
}

// Helper function to determine if we should use Supabase or in-memory storage
export const isSupabaseConfigured = () => {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_URL !== "https://your-project.supabase.co" &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== "your-anon-key"
  )
}

// In-memory database functions for preview/demo
export const inMemoryDb = {
  users: {
    insert: (userData) => {
      users.push(userData)
      return { data: userData }
    },
    select: (id) => {
      const user = users.find((u) => u.id === id)
      return { data: user }
    },
    update: (id, data) => {
      const index = users.findIndex((u) => u.id === id)
      if (index !== -1) {
        users[index] = { ...users[index], ...data }
      }
      return { data: users[index] }
    },
    delete: (id) => {
      users = users.filter((u) => u.id !== id)
      return { data: null }
    },
    findByEmail: (email) => {
      const user = users.find((u) => u.email === email)
      return { data: user ? [user] : [] }
    },
  },
  children: {
    insert: (childData) => {
      children.push(childData)
      return { data: childData }
    },
    select: (userId) => {
      const userChildren = children.filter((c) => c.user_id === userId)
      return { data: userChildren }
    },
    update: (id, data) => {
      const index = children.findIndex((c) => c.id === id)
      if (index !== -1) {
        children[index] = { ...children[index], ...data }
      }
      return { data: children[index] }
    },
    delete: (id) => {
      children = children.filter((c) => c.id !== id)
      return { data: null }
    },
  },
  drivers: {
    insert: (driverData) => {
      drivers.push(driverData)
      return { data: driverData }
    },
    select: (userId) => {
      const userDrivers = drivers.filter((d) => d.user_id === userId)
      return { data: userDrivers }
    },
    update: (id, data) => {
      const index = drivers.findIndex((d) => d.id === id)
      if (index !== -1) {
        drivers[index] = { ...drivers[index], ...data }
      }
      return { data: drivers[index] }
    },
    delete: (id) => {
      drivers = drivers.filter((d) => d.id !== id)
      return { data: null }
    },
  },
  vehicles: {
    insert: (vehicleData) => {
      vehicles.push(vehicleData)
      return { data: vehicleData }
    },
    select: (driverId) => {
      const driverVehicles = vehicles.filter((v) => v.driver_id === driverId)
      return { data: driverVehicles }
    },
    update: (id, data) => {
      const index = vehicles.findIndex((v) => v.id === id)
      if (index !== -1) {
        vehicles[index] = { ...vehicles[index], ...data }
      }
      return { data: vehicles[index] }
    },
    delete: (id) => {
      vehicles = vehicles.filter((v) => v.id !== id)
      return { data: null }
    },
  },
  locations: {
    insert: (locationData) => {
      locations.push(locationData)
      return { data: locationData }
    },
    getLatest: (vehicleId) => {
      const vehicleLocations = locations
        .filter((l) => l.vehicle_id === vehicleId)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

      return { data: vehicleLocations[0] || null }
    },
  },
}
