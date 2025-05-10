"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import ProfileManagement from "@/components/profile-management"
import LiveTracking from "@/components/live-tracking"

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem("currentUser")

    if (!storedUser) {
      router.push("/login")
      return
    }

    try {
      const userData = JSON.parse(storedUser)

      // Format the user data to match the expected structure
      setUser({
        id: userData.id,
        parent: {
          id: userData.id,
          name: userData.parent.name,
          email: userData.parent.email,
        },
        children: [
          {
            id: `child_${userData.id}`,
            name: userData.child.name,
            age: userData.child.age,
            grade: userData.child.grade,
            school: userData.child.school,
          },
        ],
        drivers: [],
      })
    } catch (error) {
      console.error("Failed to parse user data:", error)
      router.push("/login")
    } finally {
      setLoading(false)
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("currentUser")
    router.push("/login")
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
