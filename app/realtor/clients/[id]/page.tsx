"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
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
import { useRealtor, type Buyer, type BuyerProperty } from "@/contexts/realtor-context"
import { useToast } from "@/components/ui/use-toast"

export default function ClientProfilePage({ params }: { params: { id: string } }) {
  const { buyers, getBuyer, updateBuyer, getBuyerProperties } = useRealtor()
  const { toast } = useToast()

  const buyer = getBuyer(params.id)
  const buyerProperties = buyer
    ? getBuyerProperties(buyer.id)
    : {
        savedProperties: [],
        viewingRequested: [],
        viewingScheduled: [],
        propertiesViewed: [],
        offerSubmitted: [],
        archivedProperties: [],
      }

  const [activeTab, setActiveTab] = useState("overview")
  const [activePropertiesTab, setActivePropertiesTab] = useState("saved")

  if (!buyer) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <User className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold">Client Not Found</h2>
        <p className="text-muted-foreground mt-2">
          The client you're looking for doesn't exist or you don't have access.
        </p>
        <Button className="mt-6" asChild>
          <Link href="/realtor/clients">Back to Clients</Link>
        </Button>
      </div>
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
    "Pre-Qualification",
    "Needs Assessment",
    "Property Search",
    "Property Pre-Selection",
    "Offer & Negotiation",
    "Due Diligence",
    "Financing & Closing Prep",
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

  // Helper function to render property cards
  const renderPropertyCard = (property: BuyerProperty) => {
    return (
      <Card key={property.id} className="mb-4">
        <div className="flex flex-col md:flex-row">
          <div className="relative w-full md:w-1/3 h-48">
            <Image
              src={property.images[0] || "/placeholder.svg?height=300&width=500"}
              alt={property.address.full}
              fill
              className="object-cover rounded-t-lg md:rounded-l-lg md:rounded-t-none"
            />
          </div>
          <div className="p-4 flex-1">
            <h3 className="text-lg font-semibold">{property.address.full}</h3>
            <p className="text-xl font-bold mt-1">${property.price.toLocaleString()}</p>
            <div className="flex gap-4 mt-2 text-sm text-gray-600">
              <span>{property.beds} beds</span>
              <span>{property.baths} baths</span>
              <span>{property.sqft.toLocaleString()} sqft</span>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {property.buyerStatus === "viewing-requested" && (
                <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                  Viewing Requested
                </Badge>
              )}
              {property.buyerStatus === "viewing-scheduled" && (
                <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
                  Viewing Scheduled
                </Badge>
              )}
              {property.buyerStatus === "viewed" && (
                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                  Viewed
                </Badge>
              )}
              {property.buyerStatus === "offer-submitted" && (
                <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300">
                  Offer Submitted
                </Badge>
              )}
              {property.offerStatus === "accepted" && (
                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                  Offer Accepted
                </Badge>
              )}
            </div>

            {property.buyerNotes && (
              <div className="mt-3 p-2 bg-gray-50 rounded-md">
                <p className="text-sm font-medium">Buyer Notes:</p>
                <p className="text-sm">{property.buyerNotes}</p>
              </div>
            )}
          </div>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/realtor/clients">
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
                  <code className="rounded bg-muted-foreground/20 px-2 py-1 text-xs font-mono">{buyer.inviteCode}</code>
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
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="properties">Properties</TabsTrigger>
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
                  <p className="text-muted-foreground mt-1">This client hasn't completed the onboarding process yet.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Needs Assessment Data */}
          <Card>
            <CardHeader>
              <CardTitle>Needs Assessment Details</CardTitle>
              <CardDescription>Information provided during the needs assessment step.</CardDescription>
            </CardHeader>
            <CardContent>
              {buyer.needsAssessment ? (
                <div className="space-y-6">
                  {/* Location Preferences */}
                  {(buyer.needsAssessment.locations?.length > 0 || buyer.needsAssessment.locationNotes) && (
                    <div>
                      <h3 className="text-sm font-medium text-[#2B2D42] mb-2">Target Locations</h3>
                      {buyer.needsAssessment.locations?.length > 0 && (
                        <p className="text-sm">{buyer.needsAssessment.locations.join(", ")}</p>
                      )}
                      {buyer.needsAssessment.locationNotes && (
                        <p className="text-xs text-muted-foreground mt-1 italic">
                          "{buyer.needsAssessment.locationNotes}"
                        </p>
                      )}
                    </div>
                  )}

                  {/* Household & Lifestyle */}
                  {(buyer.needsAssessment.household?.adults ||
                    buyer.needsAssessment.household?.children ||
                    buyer.needsAssessment.household?.pets ||
                    buyer.needsAssessment.accessibility?.wheelchair ||
                    buyer.needsAssessment.accessibility?.singleLevel ||
                    buyer.needsAssessment.accessibility?.other ||
                    buyer.needsAssessment.hostGuests) && (
                    <div>
                      <h3 className="text-sm font-medium text-[#2B2D42] mb-2">Household & Lifestyle</h3>
                      {(buyer.needsAssessment.household?.adults ||
                        buyer.needsAssessment.household?.children ||
                        buyer.needsAssessment.household?.pets) && (
                        <p className="text-sm">
                          Household:{" "}
                          {[
                            buyer.needsAssessment.household?.adults ? "Adults" : null,
                            buyer.needsAssessment.household?.children ? "Children" : null,
                            buyer.needsAssessment.household?.pets ? "Pets" : null,
                          ]
                            .filter(Boolean)
                            .join(", ")}
                        </p>
                      )}
                      {(buyer.needsAssessment.accessibility?.wheelchair ||
                        buyer.needsAssessment.accessibility?.singleLevel ||
                        buyer.needsAssessment.accessibility?.other) && (
                        <p className="text-sm mt-1">
                          Accessibility:{" "}
                          {[
                            buyer.needsAssessment.accessibility?.wheelchair ? "Wheelchair access" : null,
                            buyer.needsAssessment.accessibility?.singleLevel ? "Single-level" : null,
                            buyer.needsAssessment.accessibility?.other ? "Other" : null,
                          ]
                            .filter(Boolean)
                            .join(", ")}
                        </p>
                      )}
                      {buyer.needsAssessment.hostGuests && (
                        <p className="text-sm mt-1">Frequently hosts overnight guests</p>
                      )}
                    </div>
                  )}

                  {/* Additional sections omitted for brevity */}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No needs assessment data</h3>
                  <p className="text-muted-foreground mt-1">
                    This client hasn't completed the needs assessment step yet.
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
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Max Commute</span>
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
                          <span className="text-sm text-muted-foreground">Bedrooms</span>
                          <span className="text-sm">Not specified</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Bathrooms</span>
                          <span className="text-sm">Not specified</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-medium mb-2">Financial Information</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Budget Range</span>
                        <span className="text-sm">{buyer.onboardingGoals.budget}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Pre-Approved</span>
                        <span className="text-sm">Not specified</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Down Payment</span>
                        <span className="text-sm">Not specified</span>
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

        <TabsContent value="properties" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Client Properties</CardTitle>
              <CardDescription>Properties the client has saved, viewed, or made offers on.</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="saved" onValueChange={setActivePropertiesTab}>
                <TabsList className="mb-4 w-full grid grid-cols-3 md:grid-cols-6">
                  <TabsTrigger value="saved" className="text-xs md:text-sm">
                    Saved ({buyerProperties.savedProperties.length})
                  </TabsTrigger>
                  <TabsTrigger value="viewingRequested" className="text-xs md:text-sm">
                    Requested ({buyerProperties.viewingRequested.length})
                  </TabsTrigger>
                  <TabsTrigger value="viewingScheduled" className="text-xs md:text-sm">
                    Scheduled ({buyerProperties.viewingScheduled.length})
                  </TabsTrigger>
                  <TabsTrigger value="viewed" className="text-xs md:text-sm">
                    Viewed ({buyerProperties.propertiesViewed.length})
                  </TabsTrigger>
                  <TabsTrigger value="offerSubmitted" className="text-xs md:text-sm">
                    Offers ({buyerProperties.offerSubmitted.length})
                  </TabsTrigger>
                  <TabsTrigger value="archived" className="text-xs md:text-sm">
                    Archived ({buyerProperties.archivedProperties.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="saved">
                  {buyerProperties.savedProperties.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-6 text-center">
                      <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium">No saved properties</h3>
                      <p className="text-muted-foreground mt-1">This client hasn't saved any properties yet.</p>
                    </div>
                  ) : (
                    <div>{buyerProperties.savedProperties.map((property) => renderPropertyCard(property))}</div>
                  )}
                </TabsContent>

                <TabsContent value="viewingRequested">
                  {buyerProperties.viewingRequested.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-6 text-center">
                      <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium">No viewing requests</h3>
                      <p className="text-muted-foreground mt-1">
                        This client hasn't requested any property viewings yet.
                      </p>
                    </div>
                  ) : (
                    <div>{buyerProperties.viewingRequested.map((property) => renderPropertyCard(property))}</div>
                  )}
                </TabsContent>

                <TabsContent value="viewingScheduled">
                  {buyerProperties.viewingScheduled.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-6 text-center">
                      <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium">No scheduled viewings</h3>
                      <p className="text-muted-foreground mt-1">
                        This client doesn't have any scheduled property viewings yet.
                      </p>
                    </div>
                  ) : (
                    <div>{buyerProperties.viewingScheduled.map((property) => renderPropertyCard(property))}</div>
                  )}
                </TabsContent>

                <TabsContent value="viewed">
                  {buyerProperties.propertiesViewed.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-6 text-center">
                      <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium">No viewed properties</h3>
                      <p className="text-muted-foreground mt-1">This client hasn't viewed any properties yet.</p>
                    </div>
                  ) : (
                    <div>{buyerProperties.propertiesViewed.map((property) => renderPropertyCard(property))}</div>
                  )}
                </TabsContent>

                <TabsContent value="offerSubmitted">
                  {buyerProperties.offerSubmitted.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-6 text-center">
                      <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium">No offers submitted</h3>
                      <p className="text-muted-foreground mt-1">This client hasn't submitted any offers yet.</p>
                    </div>
                  ) : (
                    <div>{buyerProperties.offerSubmitted.map((property) => renderPropertyCard(property))}</div>
                  )}
                </TabsContent>

                <TabsContent value="archived">
                  {buyerProperties.archivedProperties.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-6 text-center">
                      <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium">No archived properties</h3>
                      <p className="text-muted-foreground mt-1">This client doesn't have any archived properties.</p>
                    </div>
                  ) : (
                    <div>{buyerProperties.archivedProperties.map((property) => renderPropertyCard(property))}</div>
                  )}
                </TabsContent>
              </Tabs>
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
  )
}
