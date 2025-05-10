"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getUserProfile, logoutUser } from "@/lib/auth-actions"
import ProfileManagement from "@/components/profile-management"
import LiveTracking from "@/components/live-tracking"

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadUserProfile() {
      try {
        const profile = await getUserProfile()
        console.log("Loaded user profile:", profile)

        if (!profile) {
          // Redirect to login if no profile is found
          console.log("No profile found, redirecting to login")
          router.push("/login")
          return
        }

        setUser(profile)
      } catch (error) {
        console.error("Failed to load profile:", error)
        router.push("/login")
      } finally {
        setLoading(false)
      }
    }

    loadUserProfile()
  }, [router])

  const handleLogout = async () => {
    try {
      await logoutUser()
      router.push("/login")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Button variant="outline" onClick={handleLogout}>
          Logout
        </Button>
      </div>

      <Tabs defaultValue="tracking" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="tracking">Live Tracking</TabsTrigger>
          <TabsTrigger value="profiles">Profile Management</TabsTrigger>
        </TabsList>

        <TabsContent value="tracking">
          <Card>
            <CardHeader>
              <CardTitle>Live Tracking</CardTitle>
              <CardDescription>Track your child's transportation in real-time</CardDescription>
            </CardHeader>
            <CardContent>
              <LiveTracking user={user} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profiles">
          <Card>
            <CardHeader>
              <CardTitle>Profile Management</CardTitle>
              <CardDescription>Manage your profiles and settings</CardDescription>
            </CardHeader>
            <CardContent>
              <ProfileManagement user={user} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
