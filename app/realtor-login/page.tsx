"use client"

import type React from "react"

import Link from "next/link"
import { Building2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRealtor } from "@/contexts/realtor-context"

export default function RealtorLoginPage() {
  const router = useRouter()
  const { setRealtor, authenticateRealtor, getAllRealtors } = useRealtor()

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [savedLogin, setSavedLogin] = useState<any>(null)

  // Load saved login info if available
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Check if already logged in as realtor
      const storedRealtor = localStorage.getItem("buyhome_realtor")
      if (storedRealtor) {
        try {
          const parsedRealtor = JSON.parse(storedRealtor)
          console.log("Already logged in as realtor:", parsedRealtor)
          // Redirect to dashboard if already logged in
          router.push("/realtor-dashboard")
          return
        } catch (e) {
          console.error("Failed to parse stored realtor:", e)
          localStorage.removeItem("buyhome_realtor")
        }
      }

      // Load saved login info
      const savedLoginData = localStorage.getItem("buyhome_login")
      if (savedLoginData) {
        try {
          const parsedData = JSON.parse(savedLoginData)
          if (parsedData.role === "realtor") {
            setSavedLogin(parsedData)
            setFormData((prev) => ({
              ...prev,
              email: parsedData.email || "",
            }))
          }
        } catch (e) {
          console.error("Failed to parse saved login data:", e)
        }
      }
    }
  }, [router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      console.log("Attempting to log in realtor:", formData.email)

      // Debug: Check all realtors in the system
      const allRealtors = getAllRealtors()
      console.log("All realtors:", allRealtors)

      // Authenticate the realtor
      const authenticatedRealtor = authenticateRealtor(formData.email, formData.password)

      if (authenticatedRealtor) {
        console.log("Realtor authenticated successfully:", authenticatedRealtor)

        // Clear any existing user data to prevent conflicts
        localStorage.removeItem("buyhome_user")
        document.cookie = "buyhome_user=; path=/; max-age=0"

        // Set the realtor in context and localStorage
        setRealtor(authenticatedRealtor)

        // Ensure the realtor is saved to localStorage
        localStorage.setItem("buyhome_realtor", JSON.stringify(authenticatedRealtor))

        // Set cookie for authentication
        document.cookie = `buyhome_realtor=${JSON.stringify(authenticatedRealtor)}; path=/; max-age=86400`

        // Update saved login
        localStorage.setItem(
          "buyhome_login",
          JSON.stringify({
            email: formData.email,
            password: formData.password,
            role: "realtor",
          }),
        )

        // Add a delay before redirecting to ensure all state is updated
        setTimeout(() => {
          // Redirect to realtor dashboard
          router.push("/realtor-dashboard")
        }, 500)
      } else {
        console.log("Realtor authentication failed")

        // Check if the realtor exists in the system
        const realtorExists = allRealtors.some((r) => r.email.toLowerCase() === formData.email.toLowerCase())

        if (realtorExists) {
          setError("Invalid password. Please try again.")
        } else {
          setError("No realtor account found with this email. Please register first.")
        }
      }
    } catch (error) {
      console.error("Login error:", error)
      setError("An error occurred during login. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F9FAFB] p-4">
      <div className="flex items-center gap-2 mb-8">
        <Building2 className="h-6 w-6 text-primary" />
        <span className="text-xl">
          <span className="font-normal">BuyHome</span> <span className="font-bold text-accent">ABC</span>{" "}
          <span className="font-normal">to</span> <span className="font-bold text-primary">XYZ</span>
        </span>
      </div>
      <Card className="w-full max-w-md">
        <form onSubmit={handleSubmit}>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center text-primary">Realtor Login</CardTitle>
            <CardDescription className="text-center text-[#1F2937]">
              Enter your credentials to access the realtor portal
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && <div className="p-3 rounded-md bg-red-50 text-red-600 text-sm">{error}</div>}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[#1F2937]">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="your.email@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-[#1F2937]">
                  Password
                </Label>
                <Link href="#" className="text-sm text-accent hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full bg-accent hover:bg-accent/90" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Log In"}
            </Button>
            <div className="text-center text-sm text-[#1F2937]">
              Need an account?{" "}
              <Link href="/signup?role=realtor" className="text-accent hover:underline">
                Register as a Realtor
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
