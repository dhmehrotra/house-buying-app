"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  Edit,
  Home,
  LockIcon,
  Mail,
  MessageSquare,
  MoreHorizontal,
  Phone,
  User,
} from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useRealtor, type Buyer } from "@/contexts/realtor-context"
import { useToast } from "@/components/ui/use-toast"
import { RealtorLayout } from "@/components/realtor-layout"

export default function ClientProfilePage({ params }: { params: { id: string } }) {
  const { realtor, buyers, getBuyer, updateBuyer, isLoading } = useRealtor()
  const { toast } = useToast()
  const router = useRouter()

  const [activeTab, setActiveTab] = useState("overview")

  // Redirect if not authenticated
  useEffect(() => {
    if (typeof window !== "undefined" && !isLoading && !realtor) {
      router.push("/realtor-login")
    }
  }, [realtor, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#F9FAFB]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
      </div>
    )
  }

  const buyer = getBuyer(params.id)

  if (!buyer) {
    return (
      <RealtorLayout>
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <User className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold">Client Not Found</h2>
          <p className="text-muted-foreground mt-2">
            The client you're looking for doesn't exist or you don't have access.
          </p>
          <Button className="mt-6" asChild>
            <Link href="/clients">Back to Clients</Link>
          </Button>
        </div>
      </RealtorLayout>
    )
  }

  // Helper function to render status badge
  const renderStatusBadge = (status: Buyer["status"]) => {
    switch (status) {
      case "Active":
        return <Badge className="bg-green-500">{status}</Badge>
      case "Completed":
        return <Badge className="bg-blue-500">{status}</Badge>
      case "Inactive":
        return <Badge variant="outline">{status}</Badge>
    }
  }

  // Steps in the journey
  const steps = [
    "Pre-Qualification & Financial Readiness",
    "Needs Assessment",
    "Property Search",
    "Property Pre-Selection & Status",
    "Offer & Negotiation",
    "Due Diligence",
    "Financing & Closing Preparation",
    "Closing",
    "Post-Transaction Support",
  ]

  const handleStatusChange = (newStatus: Buyer["status"]) => {
    updateBuyer(buyer.id, { status: newStatus })

    toast({
      title: "Status Updated",
      description: `${buyer.name}'s status has been updated to ${newStatus}.`,
    })
  }

  const handleStepChange = (newStep: number) => {
    updateBuyer(buyer.id, { currentStep: newStep })

    toast({
      title: "Progress Updated",
      description: `${buyer.name}'s progress has been updated to Step ${newStep}.`,
    })
  }

  return (
    <RealtorLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/clients">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Clients
              </Link>
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">{buyer.name}'s Journey</h1>
            <div className="ml-auto flex items-center gap-2">
              {renderStatusBadge(buyer.status)}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">More options</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleStatusChange("Active")}>
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                    Mark as Active
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusChange("Completed")}>
                    <CheckCircle className="mr-2 h-4 w-4 text-blue-500" />
                    Complete Transaction
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusChange("Inactive")}>
                    <LockIcon className="mr-2 h-4 w-4" />
                    Mark as Inactive
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <p className="text-muted-foreground">Track and manage {buyer.name}'s home buying progress.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Journey Progress</CardTitle>
                <CardDescription>
                  Current Step: {steps[buyer.currentStep - 1]} ({buyer.currentStep}/9)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="relative">
                    <div className="absolute left-3 top-0 h-full w-px bg-muted-foreground/20"></div>
                    <div className="space-y-6">
                      {steps.map((step, index) => {
                        const stepNumber = index + 1
                        const isCompleted = stepNumber < buyer.currentStep
                        const isCurrent = stepNumber === buyer.currentStep
                        const isLocked = stepNumber > buyer.currentStep

                        return (
                          <div key={index} className="relative flex items-start gap-3">
                            <div className="absolute -left-3 flex h-6 w-6 items-center justify-center">
                              <div
                                className={`h-6 w-6 rounded-full flex items-center justify-center ${
                                  isCompleted
                                    ? "bg-green-500 text-white"
                                    : isCurrent
                                      ? "bg-accent text-white"
                                      : "bg-muted-foreground/20"
                                }`}
                              >
                                {isCompleted ? (
                                  <CheckCircle className="h-4 w-4" />
                                ) : (
                                  <span className="text-xs font-medium">{stepNumber}</span>
                                )}
                              </div>
                            </div>
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <h4 className={`font-medium ${isCurrent ? "text-accent" : ""}`}>{step}</h4>
                                  {isCurrent && (
                                    <Badge variant="outline" className="text-accent border-accent">
                                      Current
                                    </Badge>
                                  )}
                                </div>
                                <div>
                                  {isCompleted && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-7 text-xs"
                                      onClick={() => handleStepChange(stepNumber)}
                                    >
                                      Revert to this step
                                    </Button>
                                  )}
                                  {isCurrent && (
                                    <Button
                                      size="sm"
                                      className="h-7 text-xs bg-accent hover:bg-accent/90"
                                      onClick={() => handleStepChange(stepNumber + 1)}
                                    >
                                      Mark Complete
                                    </Button>
                                  )}
                                  {isLocked && stepNumber === buyer.currentStep + 1 && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="h-7 text-xs"
                                      onClick={() => handleStepChange(stepNumber)}
                                    >
                                      Skip to this step
                                    </Button>
                                  )}
                                </div>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {isCompleted && "Completed"}
                                {isCurrent && "In Progress"}
                                {isLocked && "Locked"}
                              </p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Client Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium">{buyer.name}</div>
                      <div className="text-sm text-muted-foreground">
                        Client since {new Date(buyer.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{buyer.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>Not provided</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Home className="h-4 w-4 text-muted-foreground" />
                      <span>{buyer.onboardingGoals?.preferredLocation || "Not specified"}</span>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <div className="text-sm font-medium mb-2">Invite Code</div>
                    <code className="rounded bg-muted-foreground/20 px-2 py-1 text-xs font-mono">
                      {buyer.inviteCode}
                    </code>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-2">
                <Button className="w-full bg-accent hover:bg-accent/90">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Message Client
                </Button>
                <Button variant="outline" className="w-full">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Details
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Buyer Goals</CardTitle>
                <CardDescription>Information provided during the onboarding process.</CardDescription>
              </CardHeader>
              <CardContent>
                {buyer.onboardingGoals ? (
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Preferred Location</h4>
                        <p>{buyer.onboardingGoals.preferredLocation}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Budget Range</h4>
                        <p>{buyer.onboardingGoals.budget}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Timeframe</h4>
                        <p>{buyer.onboardingGoals.timeframe}</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Property Type</h4>
                        <p>{buyer.onboardingGoals.propertyType}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Must-Have Features</h4>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {buyer.onboardingGoals.mustHaveFeatures.map((feature, index) => (
                            <Badge key={index} variant="outline">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-6 text-center">
                    <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">No onboarding data</h3>
                    <p className="text-muted-foreground mt-1">
                      This client hasn't completed the onboarding process yet.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Property Preferences</CardTitle>
                <CardDescription>Detailed preferences for property search.</CardDescription>
              </CardHeader>
              <CardContent>
                {buyer.onboardingGoals ? (
                  <div className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                      <div>
                        <h4 className="font-medium mb-2">Location Preferences</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Primary Area</span>
                            <span className="text-sm">{buyer.onboardingGoals.preferredLocation}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Alternative Areas</span>
                            <span className="text-sm">Not specified</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Property Details</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Type</span>
                            <span className="text-sm">{buyer.onboardingGoals.propertyType}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Budget</span>
                            <span className="text-sm">{buyer.onboardingGoals.budget}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h4 className="font-medium mb-2">Must-Have Features</h4>
                      <div className="flex flex-wrap gap-2">
                        {buyer.onboardingGoals.mustHaveFeatures.map((feature, index) => (
                          <Badge key={index} variant="outline">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-6 text-center">
                    <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">No preference data</h3>
                    <p className="text-muted-foreground mt-1">This client hasn't provided detailed preferences yet.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notes" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Client Notes</CardTitle>
                <CardDescription>Private notes and reminders about this client.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Edit className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No notes yet</h3>
                  <p className="text-muted-foreground mt-1">
                    Add notes about this client to keep track of important details.
                  </p>
                  <Button className="mt-4 bg-accent hover:bg-accent/90">Add First Note</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </RealtorLayout>
  )
}
