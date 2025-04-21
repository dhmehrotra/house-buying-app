"use client"

import type React from "react"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/components/ui/use-toast"
import { useUser } from "@/contexts/user-context"
import { useRealtor } from "@/contexts/realtor-context"
import Logo from "@/components/logo"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const defaultRole = searchParams.get("role") || "buyer"
  const { setUser } = useUser()
  const { setRealtor, authenticateRealtor } = useRealtor()
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: defaultRole as "buyer" | "realtor",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

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

    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleRoleChange = (value: "buyer" | "realtor") => {
    setFormData((prev) => ({ ...prev, role: value }))
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      console.log(`[Login] Starting login process for ${formData.role}`)

      // Validate the form
      const isValid = validateForm()
      if (!isValid) {
        console.log(`[Login] Form validation failed:`, errors)
        setIsSubmitting(false)
        return
      }

      console.log(`[Login] Form is valid, proceeding with login`)

      // Authenticate based on role
      if (formData.role === "buyer") {
        // Get all buyers
        const buyersJson = localStorage.getItem("buyhome_all_buyers")
        const buyers = buyersJson ? JSON.parse(buyersJson) : []

        // Find the buyer by email and password
        const buyer = buyers.find(
          (b: any) => b.email.toLowerCase() === formData.email.toLowerCase() && b.password === formData.password,
        )

        if (!buyer) {
          console.log(`[Login] Buyer authentication failed for email: ${formData.email}`)
          setErrors({ form: "Invalid email or password" })
          setIsSubmitting(false)
          return
        }

        console.log(`[Login] Buyer authenticated successfully:`, buyer)

        // Store in localStorage and cookie
        localStorage.setItem("buyhome_user", JSON.stringify(buyer))
        document.cookie = `buyhome_user=${JSON.stringify(buyer)}; path=/; max-age=86400`

        // Update context
        setUser(buyer)

        // Show success toast
        toast({
          title: "Login Successful",
          description: "Welcome back to your home buying journey!",
        })

        // Redirect to dashboard
        router.push("/dashboard")
      } else if (formData.role === "realtor") {
        // Authenticate realtor
        const realtor = authenticateRealtor(formData.email, formData.password)

        if (!realtor) {
          console.log(`[Login] Realtor authentication failed for email: ${formData.email}`)
          setErrors({ form: "Invalid email or password" })
          setIsSubmitting(false)
          return
        }

        console.log(`[Login] Realtor authenticated successfully:`, realtor)

        // Store in localStorage and cookie
        localStorage.setItem("buyhome_realtor", JSON.stringify(realtor))
        document.cookie = `buyhome_realtor=${JSON.stringify(realtor)}; path=/; max-age=86400`

        // Update context
        setRealtor(realtor)

        // Show success toast
        toast({
          title: "Login Successful",
          description: "Welcome back to your realtor dashboard!",
        })

        // Redirect to dashboard
        router.push("/realtor/dashboard")
      }
    } catch (error) {
      console.error("[Login] Error during login:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F9FAFB] p-4">
      <div className="flex items-center gap-2 mb-8">
        <Logo />
      </div>

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center text-primary">Log in to your account</CardTitle>
          <CardDescription className="text-center text-[#1F2937]">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="role" className="text-[#1F2937]">
                I am a:
              </Label>
              <RadioGroup
                id="role"
                value={formData.role}
                onValueChange={(value) => handleRoleChange(value as "buyer" | "realtor")}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="buyer" id="buyer" className="text-accent" />
                  <Label htmlFor="buyer" className="cursor-pointer text-[#1F2937]">
                    Buyer
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="realtor" id="realtor" className="text-accent" />
                  <Label htmlFor="realtor" className="cursor-pointer text-[#1F2937]">
                    Realtor
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {errors.form && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                {errors.form}
              </div>
            )}

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
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className={`w-full ${formData.role === "buyer" ? "bg-accent hover:bg-accent/90" : "bg-primary hover:bg-primary/90"}`}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Logging in..." : "Log in"}
            </Button>

            <div className="text-center text-sm text-[#1F2937]">
              Don't have an account?{" "}
              <Link href="/signup" className="text-accent hover:underline">
                Sign up
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
