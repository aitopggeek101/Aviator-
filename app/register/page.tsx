"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/components/ui/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

const formSchema = z
  .object({
    name: z.string().min(2, {
      message: "Name must be at least 2 characters.",
    }),
    email: z.string().email({
      message: "Please enter a valid email address.",
    }),
    password: z.string().min(8, {
      message: "Password must be at least 8 characters.",
    }),
    confirmPassword: z.string(),
    hasChild: z.boolean().default(false),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [parentData, setParentData] = useState(null)
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      hasChild: false,
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setError("")

      if (!values.hasChild) {
        setError("You need to have a child in order to register")
        return
      }

      // Save parent data and move to child registration
      setParentData(values)
      setStep(2)
    } catch (error) {
      setError(error.message || "Something went wrong. Please try again.")
      toast({
        title: "Error",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Create an account</CardTitle>
            <CardDescription>
              {step === 1 ? "Enter your information to create an account" : "Register your child"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {step === 1 ? (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="john.doe@example.com" type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input placeholder="********" type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <Input placeholder="********" type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="hasChild"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>I have a child to register</FormLabel>
                          <p className="text-sm text-muted-foreground">You need to have a child in order to register</p>
                        </div>
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={!form.watch("hasChild")}>
                    Continue
                  </Button>
                </form>
              </Form>
            ) : (
              <ChildRegistrationForm parentData={parentData} setError={setError} />
            )}
          </CardContent>
          <CardFooter className="flex justify-center">
            <div className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-primary underline">
                Login
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

function ChildRegistrationForm({ parentData, setError }) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const childFormSchema = z.object({
    childName: z.string().min(2, {
      message: "Name must be at least 2 characters.",
    }),
    childAge: z.string().refine((val) => !isNaN(Number.parseInt(val)) && Number.parseInt(val) > 0, {
      message: "Please enter a valid age.",
    }),
    childGrade: z.string().min(1, {
      message: "Please enter a grade.",
    }),
    childSchool: z.string().min(2, {
      message: "School name must be at least 2 characters.",
    }),
  })

  const form = useForm<z.infer<typeof childFormSchema>>({
    resolver: zodResolver(childFormSchema),
    defaultValues: {
      childName: "",
      childAge: "",
      childGrade: "",
      childSchool: "",
    },
  })

  async function onSubmit(values: z.infer<typeof childFormSchema>) {
    setIsSubmitting(true)
    setError("")

    try {
      // Simulate successful registration
      console.log("Registration data:", { parent: parentData, child: values })

      // Store in localStorage for demo purposes
      const userData = {
        id: Date.now().toString(),
        parent: {
          name: parentData.name,
          email: parentData.email,
          // Don't store actual password in localStorage
        },
        child: {
          name: values.childName,
          age: values.childAge,
          grade: values.childGrade,
          school: values.childSchool,
        },
      }

      localStorage.setItem("currentUser", JSON.stringify(userData))

      toast({
        title: "Registration successful",
        description: "Your account has been created.",
      })

      // Redirect to dashboard
      router.push("/dashboard")
    } catch (error) {
      console.error("Registration error:", error)
      setError(error.message || "Something went wrong. Please try again.")
      toast({
        title: "Error",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="childName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Child's Full Name</FormLabel>
              <FormControl>
                <Input placeholder="Jane Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="childAge"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Child's Age</FormLabel>
              <FormControl>
                <Input placeholder="10" type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="childGrade"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Child's Grade</FormLabel>
              <FormControl>
                <Input placeholder="5th" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="childSchool"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Child's School</FormLabel>
              <FormControl>
                <Input placeholder="Lincoln Elementary" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Registering..." : "Complete Registration"}
        </Button>
      </form>
    </Form>
  )
}
