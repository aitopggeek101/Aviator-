import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col items-center justify-center space-y-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight">Transportation Management System</h1>
        <p className="text-lg text-muted-foreground max-w-[600px]">
          Safely manage transportation for children with real-time tracking and comprehensive profile management.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
          <Card>
            <CardHeader>
              <CardTitle>New User?</CardTitle>
              <CardDescription>Create an account to get started</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Link href="/register" className="w-full">
                <Button className="w-full" size="lg">
                  Register
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Existing User?</CardTitle>
              <CardDescription>Sign in to your account</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Link href="/login" className="w-full">
                <Button className="w-full" variant="outline" size="lg">
                  Login
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
