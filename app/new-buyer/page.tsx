"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { ArrowLeft, Check, Copy, Mail } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRealtor } from "@/contexts/realtor-context"
import { useToast } from "@/components/ui/use-toast"
import { RealtorLayout } from "@/components/realtor-layout"
import { createInviteCode, debugListAllInviteCodes, initializeInviteCodesStorage } from "@/lib/invite-code-service"

export default function NewBuyerPage() {
  const router = useRouter()
  const { realtor, isLoading } = useRealtor()
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    name: "",
    email: "",
  })

  const [invitedBuyer, setInvitedBuyer] = useState<{
    name: string
    email: string
    inviteCode: string
  } | null>(null)

  const [isCopied, setIsCopied] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Initialize invite codes storage
  useEffect(() => {
    initializeInviteCodesStorage()

    // Debug: List all invite codes on page load
    if (process.env.NODE_ENV !== "production") {
      debugListAllInviteCodes()
    }
  }, [])

  // Redirect if not authenticated
  if (typeof window !== "undefined" && !isLoading && !realtor) {
    router.push("/realtor-login")
    return null
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    if (!realtor) {
      setIsSubmitting(false)
      return
    }

    try {
      console.log(`[NewBuyer] Creating invite for ${formData.name} (${formData.email})`)

      // Create a new invite code using our service
      const inviteCodeRecord = createInviteCode(formData.email, realtor.id, formData.name)

      // Set the invited buyer state
      setInvitedBuyer({
        name: formData.name,
        email: formData.email,
        inviteCode: inviteCodeRecord.code,
      })

      // Debug: List all invite codes
      debugListAllInviteCodes()

      // Reset the form
      setFormData({
        name: "",
        email: "",
      })

      // Show success toast
      toast({
        title: "Invitation Created",
        description: `Invitation for ${formData.name} has been created successfully.`,
      })
    } catch (error) {
      console.error("[NewBuyer] Error creating invite:", error)
      toast({
        title: "Error",
        description: "Failed to create invitation. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const copyInviteCode = () => {
    if (invitedBuyer) {
      navigator.clipboard.writeText(invitedBuyer.inviteCode)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)

      toast({
        title: "Copied",
        description: "Invite code copied to clipboard",
      })
    }
  }

  const sendEmail = () => {
    // In a real app, this would trigger an API call to send an email
    toast({
      title: "Invitation Sent",
      description: `Invitation email has been sent to ${invitedBuyer?.email}.`,
    })
  }

  return (
    <RealtorLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/realtor-dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Invite New Buyer</h1>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Buyer Information</CardTitle>
              <CardDescription>
                Enter the details of the buyer you want to invite to BuyHome ABC to XYZ.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="John Smith"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="john.smith@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full bg-accent hover:bg-accent/90" disabled={isSubmitting}>
                  {isSubmitting ? "Generating..." : "Generate Invite"}
                </Button>
              </CardFooter>
            </form>
          </Card>

          {invitedBuyer && (
            <Card>
              <CardHeader>
                <CardTitle>Invitation Created</CardTitle>
                <CardDescription>Share this invitation with {invitedBuyer.name}.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-md bg-muted p-4">
                  <div className="mb-2 text-sm font-medium">Invite Code</div>
                  <div className="flex items-center gap-2">
                    <code className="rounded bg-muted-foreground/20 px-2 py-1 font-mono text-lg">
                      {invitedBuyer.inviteCode}
                    </code>
                    <Button variant="ghost" size="icon" onClick={copyInviteCode} className="h-8 w-8">
                      {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                      <span className="sr-only">Copy code</span>
                    </Button>
                  </div>
                </div>

                <div className="rounded-md border p-4">
                  <div className="mb-2 text-sm font-medium">Buyer Details</div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-muted-foreground">Name:</div>
                    <div>{invitedBuyer.name}</div>
                    <div className="text-muted-foreground">Email:</div>
                    <div>{invitedBuyer.email}</div>
                  </div>
                </div>

                <div className="rounded-md bg-accent/10 p-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      <Check className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <div className="font-medium text-accent">Invitation Ready</div>
                      <p className="text-sm mt-1">
                        The buyer can now sign up using this invite code. You can also send them an email with the
                        invitation link.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={sendEmail} className="w-full" variant="outline">
                  <Mail className="mr-2 h-4 w-4" />
                  Send Email Invitation
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>
      </div>
    </RealtorLayout>
  )
}
