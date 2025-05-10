"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function ProfileManagement({ user }) {
  const router = useRouter()
  const [parentProfile, setParentProfile] = useState(user.parent)
  const [childProfiles, setChildProfiles] = useState(user.children || [])
  const [driverProfiles, setDriverProfiles] = useState(user.drivers || [])

  const [isUpdating, setIsUpdating] = useState(false)
  const [showAddChildDialog, setShowAddChildDialog] = useState(false)
  const [showAddDriverDialog, setShowAddDriverDialog] = useState(false)

  // Form states
  const [newChildData, setNewChildData] = useState({
    name: "",
    age: "",
    grade: "",
    school: "",
  })

  const [newDriverData, setNewDriverData] = useState({
    name: "",
    licenseNumber: "",
    phoneNumber: "",
    vinNumber: "",
  })

  const handleParentUpdate = async () => {
    setIsUpdating(true)
    try {
      // Update the user in localStorage
      const storedUser = JSON.parse(localStorage.getItem("currentUser") || "{}")
      storedUser.parent.name = parentProfile.name
      storedUser.parent.email = parentProfile.email
      localStorage.setItem("currentUser", JSON.stringify(storedUser))

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      })
    } catch (error) {
      toast({
        title: "Update failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleChildUpdate = async (childId, updatedData) => {
    setIsUpdating(true)
    try {
      // Update the child in localStorage
      const storedUser = JSON.parse(localStorage.getItem("currentUser") || "{}")

      if (storedUser.child) {
        Object.assign(storedUser.child, {
          name: updatedData.name || storedUser.child.name,
          age: updatedData.age || storedUser.child.age,
          grade: updatedData.grade || storedUser.child.grade,
          school: updatedData.school || storedUser.child.school,
        })

        localStorage.setItem("currentUser", JSON.stringify(storedUser))
      }

      // Update the UI
      setChildProfiles(childProfiles.map((child) => (child.id === childId ? { ...child, ...updatedData } : child)))

      toast({
        title: "Child profile updated",
        description: "Child profile has been updated successfully.",
      })
    } catch (error) {
      toast({
        title: "Update failed",
        description: "Failed to update child profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDeleteChild = async (childId) => {
    try {
      // For demo purposes, deleting a child means deleting the account
      localStorage.removeItem("currentUser")

      toast({
        title: "Account deleted",
        description: "Your account has been deleted because you have no children registered.",
      })

      router.push("/register")
    } catch (error) {
      toast({
        title: "Deletion failed",
        description: "Failed to delete child profile. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleAddChild = async () => {
    try {
      const newChild = {
        id: `child_${Date.now()}`,
        name: newChildData.name,
        age: Number.parseInt(newChildData.age),
        grade: newChildData.grade,
        school: newChildData.school,
      }

      setChildProfiles([...childProfiles, newChild])
      setNewChildData({ name: "", age: "", grade: "", school: "" })
      setShowAddChildDialog(false)

      toast({
        title: "Child added",
        description: "Child profile has been added successfully.",
      })
    } catch (error) {
      toast({
        title: "Failed to add child",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleAddDriver = async () => {
    try {
      // Validate VIN number
      if (newDriverData.vinNumber.length !== 17) {
        toast({
          title: "Invalid VIN",
          description: "VIN number must be exactly 17 characters.",
          variant: "destructive",
        })
        return
      }

      const newDriver = {
        id: `driver_${Date.now()}`,
        name: newDriverData.name,
        licenseNumber: newDriverData.licenseNumber,
        phoneNumber: newDriverData.phoneNumber,
        vinNumber: newDriverData.vinNumber,
      }

      setDriverProfiles([...driverProfiles, newDriver])
      setNewDriverData({ name: "", licenseNumber: "", phoneNumber: "", vinNumber: "" })
      setShowAddDriverDialog(false)

      toast({
        title: "Driver added",
        description: "Driver profile has been added successfully.",
      })
    } catch (error) {
      toast({
        title: "Failed to add driver",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDriverUpdate = (driverId, updatedData) => {
    setDriverProfiles(driverProfiles.map((driver) => (driver.id === driverId ? { ...driver, ...updatedData } : driver)))

    toast({
      title: "Driver updated",
      description: "Driver profile has been updated successfully.",
    })
  }

  const handleDeleteDriver = (driverId) => {
    setDriverProfiles(driverProfiles.filter((driver) => driver.id !== driverId))

    toast({
      title: "Driver deleted",
      description: "Driver profile has been deleted successfully.",
    })
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="parent">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="parent">Parent Profile</TabsTrigger>
          <TabsTrigger value="children">Children</TabsTrigger>
          <TabsTrigger value="drivers">Drivers</TabsTrigger>
        </TabsList>

        {/* Parent Profile Tab */}
        <TabsContent value="parent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Parent Information</CardTitle>
              <CardDescription>Update your personal information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="parent-name">Full Name</Label>
                <Input
                  id="parent-name"
                  value={parentProfile.name}
                  onChange={(e) => setParentProfile({ ...parentProfile, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="parent-email">Email</Label>
                <Input
                  id="parent-email"
                  type="email"
                  value={parentProfile.email}
                  onChange={(e) => setParentProfile({ ...parentProfile, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="parent-phone">Phone Number</Label>
                <Input
                  id="parent-phone"
                  value={parentProfile.phone || ""}
                  onChange={(e) => setParentProfile({ ...parentProfile, phone: e.target.value })}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleParentUpdate} disabled={isUpdating}>
                {isUpdating ? "Updating..." : "Update Profile"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Children Tab */}
        <TabsContent value="children" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Registered Children</h3>
            <Dialog open={showAddChildDialog} onOpenChange={setShowAddChildDialog}>
              <DialogTrigger asChild>
                <Button>Add Child</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add a Child</DialogTitle>
                  <DialogDescription>Enter your child's information below.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="child-name">Full Name</Label>
                    <Input
                      id="child-name"
                      value={newChildData.name}
                      onChange={(e) => setNewChildData({ ...newChildData, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="child-age">Age</Label>
                    <Input
                      id="child-age"
                      type="number"
                      value={newChildData.age}
                      onChange={(e) => setNewChildData({ ...newChildData, age: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="child-grade">Grade</Label>
                    <Input
                      id="child-grade"
                      value={newChildData.grade}
                      onChange={(e) => setNewChildData({ ...newChildData, grade: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="child-school">School</Label>
                    <Input
                      id="child-school"
                      value={newChildData.school}
                      onChange={(e) => setNewChildData({ ...newChildData, school: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button onClick={handleAddChild}>Add Child</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {childProfiles.length === 0 ? (
            <Card>
              <CardContent className="py-6 text-center text-muted-foreground">
                No children registered. Add a child to continue.
              </CardContent>
            </Card>
          ) : (
            childProfiles.map((child) => (
              <Card key={child.id}>
                <CardHeader>
                  <CardTitle>{child.name}</CardTitle>
                  <CardDescription>
                    Age: {child.age} | Grade: {child.grade}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor={`child-school-${child.id}`}>School</Label>
                    <Input
                      id={`child-school-${child.id}`}
                      value={child.school}
                      onChange={(e) => handleChildUpdate(child.id, { school: e.target.value })}
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive">Delete</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription className="space-y-2">
                          <p>This will permanently delete your child's profile.</p>
                          <p className="font-bold text-red-600">
                            Warning: If this is your only child, your parent account will also be deleted.
                          </p>
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteChild(child.id)}>Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  <Button onClick={() => handleChildUpdate(child.id, child)}>Update</Button>
                </CardFooter>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Drivers Tab */}
        <TabsContent value="drivers" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Registered Drivers</h3>
            <Dialog open={showAddDriverDialog} onOpenChange={setShowAddDriverDialog}>
              <DialogTrigger asChild>
                <Button>Add Driver</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add a Driver</DialogTitle>
                  <DialogDescription>Enter the driver's information below.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="driver-name">Full Name</Label>
                    <Input
                      id="driver-name"
                      value={newDriverData.name}
                      onChange={(e) => setNewDriverData({ ...newDriverData, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="driver-license">License Number</Label>
                    <Input
                      id="driver-license"
                      value={newDriverData.licenseNumber}
                      onChange={(e) => setNewDriverData({ ...newDriverData, licenseNumber: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="driver-phone">Phone Number</Label>
                    <Input
                      id="driver-phone"
                      value={newDriverData.phoneNumber}
                      onChange={(e) => setNewDriverData({ ...newDriverData, phoneNumber: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="driver-vin">Vehicle VIN Number (17 characters)</Label>
                    <Input
                      id="driver-vin"
                      value={newDriverData.vinNumber}
                      onChange={(e) => setNewDriverData({ ...newDriverData, vinNumber: e.target.value })}
                      maxLength={17}
                    />
                    {newDriverData.vinNumber && newDriverData.vinNumber.length !== 17 && (
                      <p className="text-sm text-red-500">VIN must be exactly 17 characters</p>
                    )}
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button onClick={handleAddDriver}>Add Driver</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {driverProfiles.length === 0 ? (
            <Card>
              <CardContent className="py-6 text-center text-muted-foreground">
                No drivers registered. Add a driver to continue.
              </CardContent>
            </Card>
          ) : (
            driverProfiles.map((driver) => (
              <Card key={driver.id}>
                <CardHeader>
                  <CardTitle>{driver.name}</CardTitle>
                  <CardDescription>License: {driver.licenseNumber}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor={`driver-phone-${driver.id}`}>Phone Number</Label>
                    <Input
                      id={`driver-phone-${driver.id}`}
                      value={driver.phoneNumber}
                      onChange={(e) => handleDriverUpdate(driver.id, { phoneNumber: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`driver-vin-${driver.id}`}>Vehicle VIN Number (17 characters)</Label>
                    <Input
                      id={`driver-vin-${driver.id}`}
                      value={driver.vinNumber}
                      onChange={(e) => handleDriverUpdate(driver.id, { vinNumber: e.target.value })}
                      maxLength={17}
                    />
                    {driver.vinNumber && driver.vinNumber.length !== 17 && (
                      <p className="text-sm text-red-500">VIN must be exactly 17 characters</p>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="destructive" onClick={() => handleDeleteDriver(driver.id)}>
                    Delete
                  </Button>
                  <Button onClick={() => handleDriverUpdate(driver.id, driver)}>Update</Button>
                </CardFooter>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
