"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Building2, Eye, EyeOff } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { useUser } from "@/contexts/user-context"
import { getCodes, validateCode, markAsUsed } from "@/lib/invite-code-direct"

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

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [inviteCodeValidation, setInviteCodeValidation] = useState<{
    valid: boolean
    message: string
  } | null>(null)

  // Debug state variables removed
  // const [debugInfo, setDebugInfo] = useState<any>(null)
  // const [allInviteCodes, setAllInviteCodes] = useState<any[]>([])
  // const [debugMode, setDebugMode] = useState(false)

  // Load all invite codes for debugging - simplified to just load codes without debug info
  useEffect(() => {
    try {
      console.log("[BuyerSignupPage] Loading invite codes")
      const codes = getCodes()
      console.log("[BuyerSignupPage] Found", codes.length, "invite codes")
    } catch (error) {
      console.error("[BuyerSignupPage] Error loading invite codes:", error)
    }
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }

    // Clear invite code validation when the code changes
    if (name === "inviteCode") {
      setInviteCodeValidation(null)
      // Debug info setting removed
      // setDebugInfo(null)
    }

    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required"
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required"
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password is required"
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
    }

    // Validate invite code
    if (!formData.inviteCode.trim()) {
      newErrors.inviteCode = "Invite code is required"
    } else {
      // Check if the code exists
      const validation = validateCode(formData.inviteCode)
      console.log("[BuyerSignupPage] Invite code validation:", validation)

      if (!validation.valid) {
        newErrors.inviteCode = validation.message
      }

      // Store validation result
      setInviteCodeValidation({
        valid: validation.valid,
        message: validation.message,
      })

      // Debug info setting removed
      // setDebugInfo(validation.debugInfo)
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      console.log(`[BuyerSignupPage] Starting signup process`)

      // Validate the form
      const isValid = validateForm()
      if (!isValid) {
        console.log(`[BuyerSignupPage] Form validation failed:`, errors)
        setIsSubmitting(false)
        return
      }

      console.log(`[BuyerSignupPage] Form is valid, proceeding with signup`)

      // Validate the invite code one more time
      const validation = validateCode(formData.inviteCode)

      if (!validation.valid) {
        console.log(`[BuyerSignupPage] Invite code validation failed:`, validation)
        setErrors((prev) => ({ ...prev, inviteCode: validation.message }))
        setIsSubmitting(false)
        return
      }

      console.log(`[BuyerSignupPage] Creating buyer account with invite code: ${formData.inviteCode}`)

      // Get the realtor ID from the invite code
      const realtorId = validation.realtorId

      if (!realtorId) {
        console.log(`[BuyerSignupPage] No realtor ID found for invite code: ${formData.inviteCode}`)
        setErrors((prev) => ({ ...prev, inviteCode: "Invalid invite code. No realtor found." }))
        setIsSubmitting(false)
        return
      }

      // Create the buyer account
      const buyerId = `b${Date.now()}`
      const buyer = {
        id: buyerId,
        firstName: formData.firstName,
        lastName: formData.lastName,
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
        role: "buyer" as const,
        currentStep: 1,
        completedSteps: [],
        status: "Active",
        inviteCode: formData.inviteCode,
        realtorId: realtorId,
        createdAt: new Date().toISOString(),
      }

      // Store the buyer in localStorage
      try {
        // Get existing buyers
        const existingBuyersJson = localStorage.getItem("buyhome_all_buyers")
        const existingBuyers = existingBuyersJson ? JSON.parse(existingBuyersJson) : []

        // Check if buyer already exists
        const buyerExists = existingBuyers.some((b: any) => b.email.toLowerCase() === buyer.email.toLowerCase())

        if (buyerExists) {
          console.log(`[BuyerSignupPage] Buyer with email ${buyer.email} already exists`)
          setErrors((prev) => ({ ...prev, email: "Email already registered. Please use a different email or log in." }))
          setIsSubmitting(false)
          return
        }

        // Add the new buyer
        existingBuyers.push(buyer)

        // Save back to localStorage
        localStorage.setItem("buyhome_all_buyers", JSON.stringify(existingBuyers))

        // Also store in buyhome_user for current session
        localStorage.setItem("buyhome_user", JSON.stringify(buyer))
        document.cookie = `buyhome_user=${JSON.stringify(buyer)}; path=/; max-age=86400`

        // Update context
        setUser(buyer)

        console.log(`[BuyerSignupPage] Buyer account created successfully:`, buyer)

        // Mark the invite code as used
        const marked = markAsUsed(formData.inviteCode)
        console.log(`[BuyerSignupPage] Invite code marked as used: ${marked}`)

        // Update the realtor's buyers list
        try {
          const realtorsJson = localStorage.getItem("buyhome_all_realtors")
          if (realtorsJson) {
            const realtors = JSON.parse(realtorsJson)
            const realtorIndex = realtors.findIndex((r: any) => r.id === realtorId)

            if (realtorIndex !== -1) {
              const realtor = realtors[realtorIndex]
              realtor.buyers = [...(realtor.buyers || []), buyerId]
              realtors[realtorIndex] = realtor

              localStorage.setItem("buyhome_all_realtors", JSON.stringify(realtors))
              console.log(`[BuyerSignupPage] Updated realtor's buyers list:`, realtor.buyers)
            }
          }
        } catch (error) {
          console.error("[BuyerSignupPage] Error updating realtor's buyers list:", error)
        }

        // Show success toast
        toast({
          title: "Account Created",
          description: "Your buyer account has been created successfully.",
        })

        // Redirect to dashboard
        router.push("/dashboard")
      } catch (error) {
        console.error("[BuyerSignupPage] Error creating buyer account:", error)
        toast({
          title: "Error",
          description: "Failed to create your account. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("[BuyerSignupPage] Error during signup:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Function to check invite code validity on blur
  const checkInviteCode = () => {
    if (formData.inviteCode.trim()) {
      // Check if the code exists
      const validation = validateCode(formData.inviteCode)
      console.log("[BuyerSignupPage] Checking invite code:", validation)

      setInviteCodeValidation({
        valid: validation.valid,
        message: validation.message,
      })

      // Debug info setting removed
      // setDebugInfo(validation.debugInfo)

      if (!validation.valid) {
        setErrors((prev) => ({ ...prev, inviteCode: validation.message }))
      } else {
        // Clear error if code is valid
        setErrors((prev) => {
          const newErrors = { ...prev }
          delete newErrors.inviteCode
          return newErrors
        })
      }
    }
  }

  // Debug functions removed
  // const manualCheckInviteCode = async () => { ... }
  // const toggleDebugMode = () => { ... }
  // const addCurrentCodeForTesting = () => { ... }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F9FAFB] p-4">
      <div className="flex items-center gap-2 mb-8">
        <Building2 className="h-6 w-6 text-primary" />
        <span className="text-xl">
          <span className="font-normal">BuyHome</span> <span className="font-bold text-accent">ABC</span>{" "}
          <span className="font-normal">to</span> <span className="font-bold text-primary">XYZ</span>
        </span>
      </div>

      {/* Debug button removed */}

      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center mb-2">
            <Button variant="ghost" size="icon" className="h-8 w-8 mr-2" onClick={() => router.push("/signup")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <CardTitle className="text-2xl font-bold text-primary">Buyer Signup</CardTitle>
          </div>
          <CardDescription className="text-[#1F2937]">
            Create your account to start your home buying journey
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-[#1F2937]">
                  First name
                </Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={errors.firstName ? "border-red-500" : ""}
                />
                {errors.firstName && <p className="text-red-500 text-sm">{errors.firstName}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-[#1F2937]">
                  Last name
                </Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={errors.lastName ? "border-red-500" : ""}
                />
                {errors.lastName && <p className="text-red-500 text-sm">{errors.lastName}</p>}
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
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-[#1F2937]">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  className={errors.password ? "border-red-500 pr-10" : "pr-10"}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="inviteCode" className="text-[#1F2937]">
                  Invite Code (from your realtor)
                </Label>
                {/* Debug buttons removed */}
              </div>
              <Input
                id="inviteCode"
                name="inviteCode"
                placeholder="Enter your invite code"
                value={formData.inviteCode}
                onChange={handleChange}
                onBlur={checkInviteCode}
                className={errors.inviteCode ? "border-red-500" : inviteCodeValidation?.valid ? "border-green-500" : ""}
              />
              {errors.inviteCode && <p className="text-red-500 text-sm">{errors.inviteCode}</p>}
              {!errors.inviteCode && inviteCodeValidation?.valid && (
                <p className="text-green-500 text-sm">Valid invite code</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Your realtor should have provided you with an invite code. If you don't have one, please contact your
                realtor.
              </p>
            </div>

            {/* Debug info box removed */}
            {/* Debug invite codes box removed */}
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full bg-accent hover:bg-accent/90" disabled={isSubmitting}>
              {isSubmitting ? "Creating Account..." : "Create Account"}
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
