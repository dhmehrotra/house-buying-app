"use client"

import type React from "react"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRealtor, getMockRealtorByEmail } from "@/contexts/realtor-context"
import Logo from "@/components/logo"

export default function RealtorLoginPage() {
  const router = useRouter()
  const { setRealtor } = useRealtor()

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [error, setError] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    try {
      // For demo purposes, we'll use a mock realtor
      const mockRealtor = getMockRealtorByEmail(formData.email)

      if (mockRealtor) {
        // Clear any existing user data to prevent conflicts
        localStorage.removeItem("buyhome_user")

        // Set the realtor in context and localStorage
        setRealtor(mockRealtor)
        localStorage.setItem("buyhome_realtor", JSON.stringify(mockRealtor))

        // Force a hard navigation to the realtor dashboard
        window.location.href = "/realtor/dashboard"
      } else {
        // For demo, allow any @buyhomeabc.xyz email to log in
        if (formData.email.endsWith("@buyhomeabc.xyz") && formData.password.length > 0) {
          // Clear any existing user data to prevent conflicts
          localStorage.removeItem("buyhome_user")

          const newRealtor = {
            id: `r${Date.now()}`,
            name: formData.email
              .split("@")[0]
              .split(".")
              .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
              .join(" "),
            email: formData.email,
            buyers: [],
          }

          // Set the realtor in context and localStorage
          setRealtor(newRealtor)
          localStorage.setItem("buyhome_realtor", JSON.stringify(newRealtor))

          // Force a hard navigation to the realtor dashboard
          window.location.href = "/realtor/dashboard"
        } else {
          setError("Invalid credentials. Try using an email ending with @buyhomeabc.xyz")
        }
      }
    } catch (error) {
      console.error("Login error:", error)
      setError("An error occurred during login. Please try again.")
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <div className="flex items-center gap-2 mb-8">
        <Logo />
      </div>
      <Card className="w-full max-w-md">
        <form onSubmit={handleSubmit}>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center text-primary">Realtor Login</CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access the realtor portal
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && <div className="p-3 rounded-md bg-red-50 text-red-600 text-sm">{error}</div>}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="realtor@buyhomeabc.xyz"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
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
            <Button type="submit" className="w-full bg-accent hover:bg-accent/90">
              Log In
            </Button>
            <div className="text-center text-sm">
              Not a realtor?{" "}
              <Link href="/login" className="text-accent hover:underline">
                Buyer Login
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
