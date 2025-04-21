"use client"

import type React from "react"

import Link from "next/link"
import { Building2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useUser } from "@/contexts/user-context"
import { useToast } from "@/components/ui/use-toast"
import { validateInviteCode } from "@/lib/invite-code-service"

export default function BuyerSignupPage() {
  const router = useRouter()
  const { setUser } = useUser()
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    inviteCode: "",
  })

  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Clear error when user types
    if (error) setError("")
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      // Validate the invite code
      if (!formData.inviteCode) {
        setError("Please enter a valid invite code from your realtor")
        setIsLoading(false)
        return
      }

      console.log("Validating invite code:", formData.inviteCode)
      const { valid, realtorId } = validateInviteCode(formData.inviteCode)

      console.log("Validation result:", { valid, realtorId })

      if (!valid || !realtorId) {
        setError("Invalid invite code. Please check the code provided by your realtor.")
        setIsLoading(false)
        return
      }

      // Clear any existing realtor data to prevent conflicts
      localStorage.removeItem("buyhome_realtor")
      document.cookie = "buyhome_realtor=; path=/; max-age=0"

      // Save user data
      const user = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        role: "buyer" as const,
        inviteCode: formData.inviteCode,
        realtorId: realtorId, // Associate with the correct realtor
        currentStep: 1, // Explicitly set new users to step 1
        completedSteps: [],
      }

      console.log("Creating new buyer user:", user)

      setUser(user)
      localStorage.setItem("buyhome_user", JSON.stringify(user))
      document.cookie = `buyhome_user=${JSON.stringify(user)}; path=/; max-age=86400`

      // Also save login details for future use
      localStorage.setItem(
        "buyhome_login",
        JSON.stringify({
          email: formData.email,
          password: formData.password,
          role: "buyer",
          firstName: formData.firstName,
          lastName: formData.lastName,
        }),
      )

      // Add to all_buyers for persistence
      try {
        const storedBuyers = localStorage.getItem("buyhome_all_buyers") || "[]"
        const buyers = JSON.parse(storedBuyers)

        // Check if buyer already exists
        const buyerExists = buyers.some((b: any) => b.email.toLowerCase() === formData.email.toLowerCase())

        if (!buyerExists) {
          buyers.push({
            ...user,
            id: `b${Date.now()}`,
            createdAt: new Date().toISOString(),
          })
          localStorage.setItem("buyhome_all_buyers", JSON.stringify(buyers))
        }
      } catch (error) {
        console.error("Error updating all_buyers:", error)
      }

      toast({
        title: "Registration successful",
        description: "Your buyer account has been created.",
      })

      // Redirect to onboarding
      router.push("/buyer-onboarding")
    } catch (error) {
      console.error("Signup error:", error)
      setError("An unexpected error occurred. Please try again.")
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
            <CardTitle className="text-2xl font-bold text-center text-primary">Create a buyer account</CardTitle>
            <CardDescription className="text-center text-[#1F2937]">
              Enter your information to start your home buying journey
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && <div className="p-3 rounded-md bg-red-50 text-red-600 text-sm">{error}</div>}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-[#1F2937]">
                  First name
                </Label>
                <Input id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-[#1F2937]">
                  Last name
                </Label>
                <Input id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[#1F2937]">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-[#1F2937]">
                Password
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="inviteCode" className="text-[#1F2937]">
                Invite Code
              </Label>
              <Input
                id="inviteCode"
                name="inviteCode"
                placeholder="Enter the invite code from your realtor"
                value={formData.inviteCode}
                onChange={handleChange}
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                Your realtor should have provided you with an invite code. If you don't have one, please contact your
                realtor.
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full bg-accent hover:bg-accent/90" disabled={isLoading}>
              {isLoading ? "Creating Account..." : "Create Account"}
            </Button>
            <div className="text-center text-sm text-[#1F2937]">
              Already have an account?{" "}
              <Link href="/login" className="text-accent hover:underline">
                Log in
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
