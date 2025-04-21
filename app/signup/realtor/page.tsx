"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Building2, Eye, EyeOff } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { useRealtor } from "@/contexts/realtor-context"
import { validateInviteCode } from "@/lib/invite-code-service"

export default function RealtorSignupPage() {
  const router = useRouter()
  const { setRealtor } = useRealtor()
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    company: "",
    inviteCode: "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [inviteCodeValidation, setInviteCodeValidation] = useState<{
    valid: boolean
    status: "valid" | "invalid" | "used"
    message: string
  } | null>(null)

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

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    if (!formData.company.trim()) {
      newErrors.company = "Company name is required"
    }

    // Validate invite code
    if (!formData.inviteCode.trim()) {
      newErrors.inviteCode = "Signup code is required"
    } else {
      // Validate the invite code with role-specific validation
      const validation = validateInviteCode(formData.inviteCode, "realtor")

      if (!validation.valid) {
        newErrors.inviteCode = validation.message
      }

      // Store validation result
      setInviteCodeValidation({
        valid: validation.valid,
        status: validation.status,
        message: validation.message,
      })

      console.log(`[RealtorSignup] Invite code validation:`, validation)
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      console.log(`[RealtorSignup] Starting signup process`)

      // Validate the form
      const isValid = validateForm()
      if (!isValid) {
        console.log(`[RealtorSignup] Form validation failed:`, errors)
        setIsSubmitting(false)
        return
      }

      console.log(`[RealtorSignup] Form is valid, proceeding with signup`)

      // Validate the invite code one more time
      const validation = validateInviteCode(formData.inviteCode, "realtor")

      if (!validation.valid) {
        console.log(`[RealtorSignup] Invite code validation failed:`, validation)
        setErrors((prev) => ({ ...prev, inviteCode: validation.message }))
        setIsSubmitting(false)
        return
      }

      console.log(`[RealtorSignup] Creating realtor account`)

      // Create the realtor account
      const realtorId = `r${Date.now()}`
      const realtor = {
        id: realtorId,
        firstName: formData.firstName,
        lastName: formData.lastName,
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
        company: formData.company,
        buyers: [],
        pendingInvites: [],
        createdAt: new Date().toISOString(),
      }

      // Store the realtor in localStorage
      try {
        // Get existing realtors
        const existingRealtorsJson = localStorage.getItem("buyhome_all_realtors")
        const existingRealtors = existingRealtorsJson ? JSON.parse(existingRealtorsJson) : []

        // Check if realtor already exists
        const realtorExists = existingRealtors.some((r: any) => r.email.toLowerCase() === realtor.email.toLowerCase())

        if (realtorExists) {
          console.log(`[RealtorSignup] Realtor with email ${realtor.email} already exists`)
          setErrors((prev) => ({ ...prev, email: "Email already registered. Please use a different email or log in." }))
          setIsSubmitting(false)
          return
        }

        // Add the new realtor
        existingRealtors.push(realtor)

        // Save back to localStorage
        localStorage.setItem("buyhome_all_realtors", JSON.stringify(existingRealtors))

        // Also store in buyhome_realtor for current session
        localStorage.setItem("buyhome_realtor", JSON.stringify(realtor))
        document.cookie = `buyhome_realtor=${JSON.stringify(realtor)}; path=/; max-age=86400`

        // Update context
        setRealtor(realtor)

        console.log(`[RealtorSignup] Realtor account created successfully:`, realtor)

        // Show success toast
        toast({
          title: "Account Created",
          description: "Your realtor account has been created successfully.",
        })

        // Redirect to dashboard
        router.push("/realtor/dashboard")
      } catch (error) {
        console.error("[RealtorSignup] Error creating realtor account:", error)
        toast({
          title: "Error",
          description: "Failed to create your account. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("[RealtorSignup] Error during signup:", error)
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
      const validation = validateInviteCode(formData.inviteCode, "realtor")

      setInviteCodeValidation({
        valid: validation.valid,
        status: validation.status,
        message: validation.message,
      })

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
        <CardHeader>
          <div className="flex items-center mb-2">
            <Button variant="ghost" size="icon" className="h-8 w-8 mr-2" onClick={() => router.push("/signup")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <CardTitle className="text-2xl font-bold text-primary">Realtor Signup</CardTitle>
          </div>
          <CardDescription className="text-[#1F2937]">
            Create your account to manage buyers and help them close confidently
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
              <Label htmlFor="company" className="text-[#1F2937]">
                Real Estate Company
              </Label>
              <Input
                id="company"
                name="company"
                placeholder="ABC Realty"
                value={formData.company}
                onChange={handleChange}
                className={errors.company ? "border-red-500" : ""}
              />
              {errors.company && <p className="text-red-500 text-sm">{errors.company}</p>}
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
              <Label htmlFor="confirmPassword" className="text-[#1F2937]">
                Confirm Password
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={errors.confirmPassword ? "border-red-500 pr-10" : "pr-10"}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="inviteCode" className="text-[#1F2937]">
                Signup Code
              </Label>
              <Input
                id="inviteCode"
                name="inviteCode"
                placeholder="Enter signup code"
                value={formData.inviteCode}
                onChange={handleChange}
                onBlur={checkInviteCode}
                className={errors.inviteCode ? "border-red-500" : inviteCodeValidation?.valid ? "border-green-500" : ""}
              />
              {errors.inviteCode && <p className="text-red-500 text-sm">{errors.inviteCode}</p>}
              {!errors.inviteCode && inviteCodeValidation?.valid && (
                <p className="text-green-500 text-sm">Valid signup code</p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full bg-[#ff6a00] hover:bg-[#e05e00] text-white" disabled={isSubmitting}>
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
