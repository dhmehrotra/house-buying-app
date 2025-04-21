"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Copy, Check, Bug } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { createCode, getCodes } from "@/lib/invite-code-direct"
import { addCode } from "@/lib/invite-code-fix"

export default function NewBuyerPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [inviteCode, setInviteCode] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [debugMode, setDebugMode] = useState(false)
  const [allCodes, setAllCodes] = useState<any[]>([])

  useEffect(() => {
    // Log that we're using the direct system
    console.log("[NewBuyerPage] Using direct invite code system")

    // Load all codes for debugging
    const codes = getCodes()
    setAllCodes(codes)
    console.log("[NewBuyerPage] Loaded", codes.length, "invite codes on page load")
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

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Validate the form
      const isValid = validateForm()
      if (!isValid) {
        setIsSubmitting(false)
        return
      }

      // Get the current realtor
      const realtorJson = localStorage.getItem("buyhome_realtor")
      if (!realtorJson) {
        toast({
          title: "Error",
          description: "You must be logged in as a realtor to create invite codes.",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      const realtor = JSON.parse(realtorJson)
      const buyerName = `${formData.firstName} ${formData.lastName}`

      // Create the invite code using the direct system
      console.log(`[NewBuyerPage] Creating invite code for ${buyerName} (${formData.email})`)
      const invite = createCode(formData.email, realtor.id, buyerName)

      // Add the code to our simplified system as well
      const generatedCode = invite.code
      addCode(generatedCode, formData.email)
      console.log("Added code to simplified system:", generatedCode)

      // Set the invite code for display
      setInviteCode(invite.code)

      // Show success toast
      toast({
        title: "Invite Code Created",
        description: `Invite code for ${buyerName} has been created successfully.`,
      })

      // Refresh the list of codes
      const updatedCodes = getCodes()
      setAllCodes(updatedCodes)
      console.log("[NewBuyerPage] Updated codes after creation:", updatedCodes)

      // Show debug info with the created code
      console.log("[NewBuyerPage] Debug info:", {
        action: "create_code",
        code: invite.code,
        email: formData.email,
        realtorId: realtor.id,
        buyerName: buyerName,
        timestamp: new Date().toISOString(),
        allCodes: updatedCodes,
      })
    } catch (error) {
      console.error("[NewBuyerPage] Error creating invite code:", error)
      toast({
        title: "Error",
        description: "Failed to create invite code. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const copyToClipboard = async () => {
    if (!inviteCode) return

    try {
      await navigator.clipboard.writeText(inviteCode)
      setCopied(true)

      // Reset copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000)

      toast({
        title: "Copied",
        description: "Invite code copied to clipboard.",
      })
    } catch (error) {
      console.error("[NewBuyerPage] Error copying to clipboard:", error)
      toast({
        title: "Error",
        description: "Failed to copy invite code. Please try manually.",
        variant: "destructive",
      })
    }
  }

  const handleDone = () => {
    router.push("/realtor/dashboard")
  }

  const toggleDebugMode = () => {
    setDebugMode(!debugMode)

    // Refresh the list of codes when debug mode is toggled on
    if (!debugMode) {
      const codes = getCodes()
      setAllCodes(codes)
      console.log("[NewBuyerPage] Refreshed codes in debug mode:", codes)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Invite New Buyer</h1>

      <div className="flex justify-end mb-4">
        <Button variant="outline" size="sm" onClick={toggleDebugMode} className={debugMode ? "bg-yellow-100" : ""}>
          <Bug className="h-4 w-4 mr-2" />
          {debugMode ? "Debug Mode ON" : "Debug Mode"}
        </Button>
      </div>

      {!inviteCode ? (
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Create Buyer Invite</CardTitle>
            <CardDescription>Enter the buyer's information to generate an invite code</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First name</Label>
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
                  <Label htmlFor="lastName">Last name</Label>
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
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
              </div>

              {debugMode && allCodes.length > 0 && (
                <div className="p-2 bg-yellow-50 rounded-md border border-yellow-200 mt-4">
                  <h3 className="text-sm font-semibold mb-1">Existing Invite Codes ({allCodes.length})</h3>
                  <div className="max-h-32 overflow-y-auto text-xs">
                    {allCodes.map((code, index) => (
                      <div key={index} className="py-1 border-b border-yellow-100 last:border-0">
                        <span className="font-mono">{code.code}</span> - {code.email} - {code.status}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Generating Invite Code..." : "Generate Invite Code"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      ) : (
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Invite Code Generated</CardTitle>
            <CardDescription>
              Share this invite code with {formData.firstName} {formData.lastName}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-gray-100 rounded-md flex items-center justify-between">
              <span className="font-mono text-lg font-bold">{inviteCode}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={copyToClipboard}
                className="h-8 w-8"
                aria-label="Copy invite code"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>

            <div className="text-sm text-muted-foreground">
              <p>Instructions for {formData.firstName}:</p>
              <ol className="list-decimal pl-5 mt-2 space-y-1">
                <li>
                  Go to <span className="font-semibold">buyhomeabc.xyz/signup</span>
                </li>
                <li>Select "I'm a Home Buyer"</li>
                <li>Enter their personal information</li>
                <li>Enter this invite code when prompted</li>
              </ol>
            </div>

            {debugMode && (
              <div className="p-2 bg-yellow-50 rounded-md border border-yellow-200 mt-4">
                <h3 className="text-sm font-semibold mb-1">Debug Information</h3>
                <pre className="text-xs overflow-auto max-h-32">
                  {JSON.stringify(
                    {
                      code: inviteCode,
                      email: formData.email,
                      buyerName: `${formData.firstName} ${formData.lastName}`,
                      timestamp: new Date().toISOString(),
                    },
                    null,
                    2,
                  )}
                </pre>

                <div className="mt-2">
                  <h4 className="text-xs font-semibold">All Invite Codes ({allCodes.length})</h4>
                  <div className="max-h-32 overflow-y-auto text-xs mt-1">
                    {allCodes.map((code, index) => (
                      <div key={index} className="py-1 border-b border-yellow-100 last:border-0">
                        <span className="font-mono">{code.code}</span> - {code.email} - {code.status}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={handleDone} className="w-full">
              Done
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}
