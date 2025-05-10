"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { MapPin } from "lucide-react"

export default function LiveTracking({ user }) {
  const mapRef = useRef(null)
  const [selectedChild, setSelectedChild] = useState(user.children?.[0]?.id || "")
  const [tracking, setTracking] = useState(false)
  const [location, setLocation] = useState({ lat: 40.7128, lng: -74.006 }) // Default to NYC
  const [busLocation, setBusLocation] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Initialize the map
    if (mapRef.current) {
      const ctx = mapRef.current.getContext("2d")
      drawMap(ctx)
    }
  }, [])

  useEffect(() => {
    // Update the map when locations change
    if (mapRef.current && busLocation) {
      const ctx = mapRef.current.getContext("2d")
      drawMap(ctx)
    }
  }, [location, busLocation])

  useEffect(() => {
    let interval

    if (tracking) {
      // Poll for vehicle location updates
      setIsLoading(true)

      const fetchLocation = async () => {
        try {
          // For demo purposes, generate random movement
          setBusLocation({
            lat: location.lat + (Math.random() * 0.01 - 0.005),
            lng: location.lng + (Math.random() * 0.01 - 0.005),
          })
          setIsLoading(false)
        } catch (error) {
          console.error("Error fetching location:", error)
          setIsLoading(false)
        }
      }

      // Initial fetch
      fetchLocation()

      // Set up polling interval
      interval = setInterval(fetchLocation, 5000) // Poll every 5 seconds

      toast({
        title: "Tracking started",
        description: "Live tracking has been enabled.",
      })
    } else if (interval) {
      clearInterval(interval)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [tracking, location])

  const drawMap = (ctx) => {
    if (!ctx) return

    const width = ctx.canvas.width
    const height = ctx.canvas.height

    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    // Draw background
    ctx.fillStyle = "#f0f0f0"
    ctx.fillRect(0, 0, width, height)

    // Draw grid lines
    ctx.strokeStyle = "#ddd"
    ctx.lineWidth = 1

    // Horizontal grid lines
    for (let i = 0; i < height; i += 20) {
      ctx.beginPath()
      ctx.moveTo(0, i)
      ctx.lineTo(width, i)
      ctx.stroke()
    }

    // Vertical grid lines
    for (let i = 0; i < width; i += 20) {
      ctx.beginPath()
      ctx.moveTo(i, 0)
      ctx.lineTo(i, height)
      ctx.stroke()
    }

    // Draw roads
    ctx.strokeStyle = "#999"
    ctx.lineWidth = 8

    // Main roads
    ctx.beginPath()
    ctx.moveTo(width * 0.1, height * 0.5)
    ctx.lineTo(width * 0.9, height * 0.5)
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(width * 0.5, height * 0.1)
    ctx.lineTo(width * 0.5, height * 0.9)
    ctx.stroke()

    // Secondary roads
    ctx.strokeStyle = "#aaa"
    ctx.lineWidth = 4

    ctx.beginPath()
    ctx.moveTo(width * 0.2, height * 0.2)
    ctx.lineTo(width * 0.8, height * 0.8)
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(width * 0.2, height * 0.8)
    ctx.lineTo(width * 0.8, height * 0.2)
    ctx.stroke()

    // Draw home location
    const homeX = width * 0.3
    const homeY = height * 0.7

    // Home icon
    ctx.fillStyle = "#4f46e5"
    ctx.beginPath()
    ctx.arc(homeX, homeY, 10, 0, Math.PI * 2)
    ctx.fill()

    // Home label
    ctx.fillStyle = "#000"
    ctx.font = "14px Arial"
    ctx.fillText("Home", homeX - 20, homeY - 15)

    // Draw school location
    const schoolX = width * 0.7
    const schoolY = height * 0.3

    // School icon
    ctx.fillStyle = "#10b981"
    ctx.beginPath()
    ctx.arc(schoolX, schoolY, 10, 0, Math.PI * 2)
    ctx.fill()

    // School label
    ctx.fillStyle = "#000"
    ctx.font = "14px Arial"
    ctx.fillText("School", schoolX - 25, schoolY - 15)

    // Draw bus location if available
    if (busLocation) {
      // Calculate position on canvas based on GPS coordinates
      // This is a simplified calculation - in a real app, you would use proper map projection
      const busX = width * (0.3 + (busLocation.lng - location.lng) * 0.01)
      const busY = height * (0.3 + (busLocation.lat - location.lat) * 0.01)

      // Bus icon
      ctx.fillStyle = "#f59e0b"
      ctx.beginPath()
      ctx.arc(busX, busY, 8, 0, Math.PI * 2)
      ctx.fill()

      // Bus label
      ctx.fillStyle = "#000"
      ctx.font = "14px Arial"
      ctx.fillText("Bus", busX - 15, busY - 15)

      // Draw route line
      ctx.strokeStyle = "#f59e0b"
      ctx.lineWidth = 2
      ctx.setLineDash([5, 3])

      ctx.beginPath()
      ctx.moveTo(homeX, homeY)
      ctx.lineTo(busX, busY)
      ctx.lineTo(schoolX, schoolY)
      ctx.stroke()

      ctx.setLineDash([])
    }
  }

  const toggleTracking = () => {
    setTracking(!tracking)
    if (!tracking && !busLocation) {
      // Initialize bus location near home for demo
      setBusLocation({
        lat: location.lat + 0.005,
        lng: location.lng + 0.005,
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="space-y-1">
          <Label htmlFor="child-select">Select Child</Label>
          <Select value={selectedChild} onValueChange={setSelectedChild} disabled={user.children?.length === 0}>
            <SelectTrigger id="child-select" className="w-[200px]">
              <SelectValue placeholder="Select a child" />
            </SelectTrigger>
            <SelectContent>
              {user.children?.map((child) => (
                <SelectItem key={child.id} value={child.id}>
                  {child.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button onClick={toggleTracking} disabled={!selectedChild} variant={tracking ? "destructive" : "default"}>
          {tracking ? "Stop Tracking" : "Start Tracking"}
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="aspect-video relative bg-muted rounded-md overflow-hidden">
            <canvas ref={mapRef} width={800} height={450} className="w-full h-full" />

            <div className="absolute bottom-4 left-4 bg-white p-3 rounded-md shadow-md">
              <div className="flex items-center gap-2 text-sm">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-[#4f46e5] mr-1"></div>
                  <span>Home</span>
                </div>
                <div className="flex items-center ml-3">
                  <div className="w-3 h-3 rounded-full bg-[#10b981] mr-1"></div>
                  <span>School</span>
                </div>
                <div className="flex items-center ml-3">
                  <div className="w-3 h-3 rounded-full bg-[#f59e0b] mr-1"></div>
                  <span>Bus</span>
                </div>
              </div>
            </div>

            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                <div className="bg-white p-4 rounded-md shadow-md">Loading location data...</div>
              </div>
            )}
          </div>

          {tracking && busLocation && (
            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-md">
              <h3 className="font-medium flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Current Status
              </h3>
              <p className="mt-2">The bus is currently en route. Last updated: {new Date().toLocaleTimeString()}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {!user.children?.length && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-md">
          <p className="text-amber-800">You need to add a child profile before you can use the tracking feature.</p>
        </div>
      )}
    </div>
  )
}
