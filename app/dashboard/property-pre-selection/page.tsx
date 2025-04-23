"use client"

import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { FileText, MessageSquare, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { useToast } from "@/components/ui/use-toast"
import { useUser } from "@/contexts/user-context"
import { PropertyCard, type BuyerProperty, type Property } from "@/components/property-card"
import { usePropertyStateStore } from "./property-state-store"
import { Checkbox } from "@/components/ui/checkbox"

// Helper function to ensure unique IDs
function ensureUniqueIds<T extends { id: string }>(items: T[]): T[] {
  const seen = new Set<string>()

  return items.map((item) => {
    // If this ID has been seen before or is not set, generate a new one
    if (!item.id || seen.has(item.id)) {
      const newId = `${Math.random().toString(36).substring(2, 9)}-${Date.now()}`
      return { ...item, id: newId }
    }

    // Otherwise, mark this ID as seen and return the item
    seen.add(item.id)
    return item
  })
}

export default function PropertySelectionPage() {
  const { user } = useUser()
  const router = useRouter()
  const { toast } = useToast()

  // Get property state store
  const { selectedMap, resetPropertyState, toggleSelection: togglePropertySelectionStore } = usePropertyStateStore()

  // State for properties in different stages
  const [savedProperties, setSavedProperties] = useState<BuyerProperty[]>([])
  const [viewingRequested, setViewingRequested] = useState<BuyerProperty[]>([])
  const [viewingScheduled, setViewingScheduled] = useState<BuyerProperty[]>([])
  const [propertiesViewed, setPropertiesViewed] = useState<BuyerProperty[]>([])
  const [offerSubmitted, setOfferSubmitted] = useState<BuyerProperty[]>([])
  const [archivedProperties, setArchivedProperties] = useState<BuyerProperty[]>([])

  // State for sidebar
  const [aiMessage, setAiMessage] = useState("")
  const [realtorMessage, setRealtorMessage] = useState("")

  // State for active section
  const [activeSection, setActiveSection] = useState("saved")

  // State for showing only active listings in archived
  const [showOnlyActive, setShowOnlyActive] = useState(true)

  // State for selected properties in saved tab
  const [selectedSavedProperties, setSelectedSavedProperties] = useState<string[]>([])

  // State for selected properties in viewingRequested tab
  const [selectedViewingRequestedProperties, setSelectedViewingRequestedProperties] = useState<string[]>([])

  // Load properties from localStorage on component mount
  useEffect(() => {
    // Load saved properties from Step 3
    const savedFromLocalStorage = localStorage.getItem("buyhome_saved_properties")
    let savedPropsFromStep3: Property[] = []

    if (savedFromLocalStorage) {
      try {
        const parsedProps = JSON.parse(savedFromLocalStorage)
        // Ensure each property has a unique ID
        savedPropsFromStep3 = ensureUniqueIds(parsedProps)
      } catch (error) {
        console.error("[ERROR] Failed to parse saved properties:", error)
        savedPropsFromStep3 = []
      }
    }

    // Load property workflow data if exists
    const workflowData = localStorage.getItem("buyhome_property_workflow")

    if (workflowData) {
      try {
        // If we have existing workflow data, use it
        const parsedData = JSON.parse(workflowData)

        // Get existing saved properties and ensure they have unique IDs
        const existingSavedProps = ensureUniqueIds(parsedData.saved || [])

        // Sync new saved properties from Step 3
        const existingMlsIds = existingSavedProps.map((prop: BuyerProperty) => prop.mlsId)
        const newSavedProps = savedPropsFromStep3
          .filter((prop: any) => !existingMlsIds.includes(prop.mlsId))
          .map((prop: any) => ({
            ...prop,
            buyerStatus: "saved",
            buyerNotes: "",
            agentNotes: "",
          })) as BuyerProperty[]

        // Combine existing and new saved properties
        const combinedSavedProps = ensureUniqueIds([...existingSavedProps, ...newSavedProps])

        // Ensure all other property lists have unique IDs
        const viewingRequestedProps = ensureUniqueIds(parsedData.viewingRequested || [])
        const viewingScheduledProps = ensureUniqueIds(parsedData.viewingScheduled || [])
        const viewedProps = ensureUniqueIds(parsedData.viewed || [])
        let offerSubmittedProps = ensureUniqueIds(parsedData.offerSubmitted || [])
        offerSubmittedProps = offerSubmittedProps.map((prop) => ({ ...prop, showSubmittedPill: false }))
        const archivedProps = ensureUniqueIds(parsedData.archived || [])

        offerSubmittedProps = offerSubmittedProps.map((prop) => ({ ...prop, showSubmittedPill: false }))

        // Update state with all properties
        setSavedProperties(combinedSavedProps)
        setViewingRequested(viewingRequestedProps)
        setViewingScheduled(viewingScheduledProps)
        setPropertiesViewed(viewedProps)
        setOfferSubmitted(offerSubmittedProps)
        setArchivedProperties(archivedProps)

        // Verify property IDs are unique
        const allProperties = [
          ...combinedSavedProps,
          ...viewingRequestedProps,
          ...viewingScheduledProps,
          ...viewedProps,
          ...offerSubmittedProps,
          ...archivedProps,
        ]

        const propertyIds = allProperties.map((p) => p.id)
        const uniqueIds = new Set(propertyIds)

        if (propertyIds.length !== uniqueIds.size) {
          console.error("[ERROR] Duplicate property IDs detected!", {
            totalIds: propertyIds.length,
            uniqueIds: uniqueIds.size,
          })

          // Find duplicates
          const counts: { [key: string]: number } = {}
          propertyIds.forEach((id) => {
            counts[id] = (counts[id] || 0) + 1
          })

          const duplicates = Object.entries(counts)
            .filter(([_, count]) => count > 1)
            .map(([id]) => id)

          console.error("[ERROR] Duplicate IDs:", duplicates)
        }
      } catch (error) {
        console.error("[ERROR] Failed to parse workflow data:", error)
        // Initialize with saved properties from Step 3 as fallback
        initializeWithSavedProperties(savedPropsFromStep3)
      }
    } else {
      initializeWithSavedProperties(savedPropsFromStep3)
    }
  }, [])

  // Helper function to initialize with saved properties
  const initializeWithSavedProperties = (savedPropsFromStep3: Property[]) => {
    // Initialize with saved properties from Step 3
    const buyerProps: BuyerProperty[] = savedPropsFromStep3.map((prop: any) => ({
      ...prop,
      buyerStatus: "saved",
      buyerNotes: "",
      agentNotes: "",
      showSubmittedPill: false,
    }))

    // Ensure unique IDs
    const uniqueBuyerProps = ensureUniqueIds(buyerProps)
    setSavedProperties(uniqueBuyerProps)
  }

  // Save workflow data to localStorage whenever it changes
  useEffect(() => {
    const workflowData = {
      saved: savedProperties,
      viewingRequested,
      viewingScheduled,
      viewed: propertiesViewed,
      offerSubmitted,
      archived: archivedProperties,
    }

    localStorage.setItem("buyhome_property_workflow", JSON.stringify(workflowData))
  }, [savedProperties, viewingRequested, viewingScheduled, propertiesViewed, archivedProperties])

  // Toggle property selection
  const handleToggleSelection = useCallback((propertyId: string, section: string) => {
    if (section === "saved") {
      setSelectedSavedProperties((prev) =>
        prev.includes(propertyId) ? prev.filter((id) => id !== propertyId) : [...prev, propertyId],
      )
    } else if (section === "viewingRequested") {
      setSelectedViewingRequestedProperties((prev) =>
        prev.includes(propertyId) ? prev.filter((id) => id !== propertyId) : [...prev, propertyId],
      )
    }
  }, [])

  // Request property analysis
  const requestPropertyAnalysis = useCallback(
    (propertyId: string) => {
      // Get property for toast
      const property = savedProperties.find((prop) => prop.id === propertyId)
      if (!property) {
        console.error(`[ERROR] Property ${propertyId} not found`)
        return
      }

      // Show toast notification
      toast({
        title: "Analysis Requested",
        description: `Analysis request submitted for ${property.address.full}. You'll receive a report by email within 24 hours.`,
        variant: "default",
      })
    },
    [savedProperties, toast],
  )

  // Request virtual tour
  const requestVirtualTour = useCallback(
    (propertyId: string) => {
      // Get property for toast
      let property: BuyerProperty | undefined

      if (activeSection === "saved") {
        property = savedProperties.find((prop) => prop.id === propertyId)
      } else if (activeSection === "viewed") {
        property = propertiesViewed.find((prop) => prop.id === propertyId)
      }

      if (!property) {
        console.error(`[ERROR] Property ${propertyId} not found in section ${activeSection}`)
        return
      }

      // Show toast notification
      toast({
        title: "Virtual Tour Requested",
        description: `If available, a virtual tour link will be emailed within 2 hours for ${property.address.full}.`,
        variant: "default",
      })
    },
    [activeSection, savedProperties, propertiesViewed, toast],
  )

  // Mark property as viewed
  const markAsViewed = useCallback(
    (propertyId: string) => {
      const property = viewingScheduled.find((prop) => prop.id === propertyId)

      if (!property) {
        console.error(`[ERROR] Property ${propertyId} not found in viewingScheduled`)
        return
      }

      // Move property to viewed
      const updatedProperty = {
        ...property,
        buyerStatus: "viewed",
        viewingStatus: "completed",
      } as BuyerProperty

      setPropertiesViewed((prev) => [...prev, updatedProperty])

      // Remove from viewing scheduled
      setViewingScheduled((prev) => prev.filter((prop) => prop.id !== propertyId))

      toast({
        title: "Property marked as viewed",
        description: `${property.address.full} has been moved to the 'Properties Viewed' section.`,
        variant: "default",
      })
    },
    [viewingScheduled, toast],
  )

  // Update buyer notes
  const updateBuyerNotes = useCallback(
    (propertyId: string, notes: string) => {
      if (activeSection === "viewingScheduled") {
        setViewingScheduled((prev) =>
          prev.map((prop) => (prop.id === propertyId ? { ...prop, buyerNotes: notes } : prop)),
        )
      } else if (activeSection === "viewed") {
        setPropertiesViewed((prev) =>
          prev.map((prop) => (prop.id === propertyId ? { ...prop, buyerNotes: notes } : prop)),
        )
      }
    },
    [activeSection],
  )

  // Submit offer for property
  const submitOffer = useCallback(
    (propertyId: string) => {
      const property = propertiesViewed.find((prop) => prop.id === propertyId)

      if (!property) {
        console.error(`[ERROR] Property ${propertyId} not found in propertiesViewed`)
        return
      }

      // Move property to offer submitted
      const updatedProperty = {
        ...property,
        buyerStatus: "offer-submitted",
        offerStatus: "submitted",
      } as BuyerProperty

      setOfferSubmitted((prev) => [...prev, updatedProperty])

      // Remove from viewed
      setPropertiesViewed((prev) => prev.filter((prop) => prop.id !== propertyId))

      toast({
        title: "Offer submitted",
        description: `Your offer for ${property.address.full} has been submitted to your realtor for review.`,
        variant: "default",
      })
    },
    [propertiesViewed, toast],
  )

  // Archive property
  const archiveProperty = useCallback(
    (propertyId: string) => {
      let property: BuyerProperty | undefined

      switch (activeSection) {
        case "saved":
          property = savedProperties.find((prop) => prop.id === propertyId)
          if (property) {
            setSavedProperties((prev) => prev.filter((prop) => prop.id !== propertyId))
          }
          break
        case "viewingRequested":
          property = viewingRequested.find((prop) => prop.id === propertyId)
          if (property) {
            setViewingRequested((prev) => prev.filter((prop) => prop.id !== propertyId))
          }
          break
        case "viewingScheduled":
          property = viewingScheduled.find((prop) => prop.id === propertyId)
          if (property) {
            setViewingScheduled((prev) => prev.filter((prop) => prop.id !== propertyId))
          }
          break
        case "viewed":
          property = propertiesViewed.find((prop) => prop.id === propertyId)
          if (property) {
            setPropertiesViewed((prev) => prev.filter((prop) => prop.id !== propertyId))
          }
          break
        case "offerSubmitted":
          property = offerSubmitted.find((prop) => prop.id === propertyId)
          if (property) {
            setOfferSubmitted((prev) => prev.filter((prop) => prop.id !== propertyId))
          }
          break
      }

      if (property) {
        const updatedProperty = {
          ...property,
          buyerStatus: "archived",
        } as BuyerProperty

        setArchivedProperties((prev) => [...prev, updatedProperty])

        // Reset property state
        resetPropertyState(propertyId)

        toast({
          title: "Property archived",
          description: `${property.address.full} has been moved to the 'Archived Properties' section.`,
          variant: "default",
        })
      } else {
        console.error(`[ERROR] Property ${propertyId} not found in section ${activeSection}`)
      }
    },
    [
      activeSection,
      savedProperties,
      viewingRequested,
      viewingScheduled,
      propertiesViewed,
      offerSubmitted,
      resetPropertyState,
      toast,
    ],
  )

  // Restore property from archived
  const restoreProperty = useCallback(
    (propertyId: string) => {
      const property = archivedProperties.find((prop) => prop.id === propertyId)

      if (!property) {
        console.error(`[ERROR] Property ${propertyId} not found in archivedProperties`)
        return
      }

      // Move property back to saved
      const updatedProperty = {
        ...property,
        buyerStatus: "saved",
      } as BuyerProperty

      setSavedProperties((prev) => [...prev, updatedProperty])

      // Remove from archived
      setArchivedProperties((prev) => prev.filter((prop) => prop.id !== propertyId))

      toast({
        title: "Property restored",
        description: `${property.address.full} has been moved back to 'Properties of Interest'.`,
        variant: "default",
      })
    },
    [archivedProperties, toast],
  )

  // Send message to realtor
  const sendRealtorMessage = useCallback(() => {
    if (!realtorMessage.trim()) {
      toast({
        title: "Empty message",
        description: "Please enter a message to send to your realtor.",
        variant: "destructive",
      })
      return
    }

    // In a real app, this would send the message to the realtor
    // For now, just show a success toast
    toast({
      title: "Message sent",
      description: "Your message has been sent to your realtor.",
      variant: "default",
    })

    setRealtorMessage("")
  }, [realtorMessage, toast])

  // Send AI message
  const sendAiMessage = useCallback(() => {
    if (!aiMessage.trim()) {
      toast({
        title: "Empty message",
        description: "Please enter a message to ask the AI assistant.",
        variant: "destructive",
      })
      return
    }

    // In a real app, this would send the message to an AI service
    // For now, just show a success toast
    toast({
      title: "Message sent",
      description: "Your question has been sent to our AI assistant.",
      variant: "default",
    })

    setAiMessage("")
  }, [aiMessage, toast])

  const handleScheduleInPersonTour = () => {
    // Get selected properties
    const selectedProps = savedProperties.filter((prop) => selectedSavedProperties.includes(prop.id))

    if (selectedProps.length === 0) {
      toast({
        title: "No properties selected",
        description: "Please select at least one property to schedule a tour.",
        variant: "destructive",
      })
      return
    }

    // Move selected properties to viewing requested
    const updatedSelected = selectedProps.map((prop) => ({
      ...prop,
      buyerStatus: "viewing-requested",
      viewingStatus: "pending",
    })) as BuyerProperty[]

    setViewingRequested((prev) => [...prev, ...updatedSelected])

    // Remove from saved properties
    setSavedProperties((prev) => prev.filter((prop) => !selectedSavedProperties.includes(prop.id)))

    // Reset selection state
    setSelectedSavedProperties([])

    toast({
      title: "Tour Requested",
      description: `Tour requested for ${selectedProps.length} properties.`,
      variant: "default",
    })
  }

  const handleMarkScheduled = () => {
    // Get selected properties
    const selectedProps = viewingRequested.filter((prop) => selectedViewingRequestedProperties.includes(prop.id))

    if (selectedProps.length === 0) {
      toast({
        title: "No properties selected",
        description: "Please select at least one property to mark as scheduled.",
        variant: "destructive",
      })
      return
    }

    // Move selected properties to viewing scheduled
    const updatedSelected = selectedProps.map((prop) => ({
      ...prop,
      buyerStatus: "viewing-scheduled",
      viewingStatus: "confirmed",
    })) as BuyerProperty[]

    setViewingScheduled((prev) => [...prev, ...updatedSelected])

    // Remove from viewing requested
    setViewingRequested((prev) => prev.filter((prop) => !selectedViewingRequestedProperties.includes(prop.id)))

    // Reset selection state
    setSelectedViewingRequestedProperties([])

    toast({
      title: "Request withdrawn",
      description: `Viewing request withdrawn for ${selectedProps.length} properties.`,
      variant: "default",
    })
  }

  const handleWithdrawRequest = () => {
    // Get selected properties
    const selectedProps = viewingRequested.filter((prop) => selectedViewingRequestedProperties.includes(prop.id))

    if (selectedProps.length === 0) {
      toast({
        title: "No properties selected",
        description: "Please select at least one property to withdraw the request.",
        variant: "destructive",
      })
      return
    }

    // Remove selected properties from viewing requested
    setViewingRequested((prev) => prev.filter((prop) => !selectedViewingRequestedProperties.includes(prop.id)))

    // Reset selection state
    setSelectedViewingRequestedProperties([])

    toast({
      title: "Request withdrawn",
      description: `Viewing request withdrawn for ${selectedProps.length} properties.`,
      variant: "default",
    })
  }

  return (
    <div>
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Left Column - Main Content */}
          <div className="w-full md:w-2/3">
            <div className="mb-6">
              <h1 className="text-2xl font-bold mb-1">Property Pre-Selection & Status</h1>
              <p className="text-gray-600">Manage your property journey from saved listings to offers</p>
            </div>

            <Tabs defaultValue="saved" onValueChange={setActiveSection}>
              <TabsList className="mb-4 w-full grid grid-cols-3 md:grid-cols-6">
                <TabsTrigger value="saved" className="text-xs md:text-sm">
                  Saved ({savedProperties.length})
                </TabsTrigger>
                <TabsTrigger value="viewingRequested" className="text-xs md:text-sm">
                  Requested ({viewingRequested.length})
                </TabsTrigger>
                <TabsTrigger value="viewingScheduled" className="text-xs md:text-sm">
                  Scheduled ({viewingScheduled.length})
                </TabsTrigger>
                <TabsTrigger value="viewed" className="text-xs md:text-sm">
                  Viewed ({propertiesViewed.length})
                </TabsTrigger>
                <TabsTrigger value="offerSubmitted" className="text-xs md:text-sm">
                  Pre-Offer ({offerSubmitted.length})
                </TabsTrigger>
                <TabsTrigger value="archived" className="text-xs md:text-sm">
                  Archived ({archivedProperties.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="saved">
                <div className="mb-4 flex justify-between items-center">
                  <h2 className="text-xl font-semibold">Properties of Interest</h2>
                  <div className="flex gap-2">
                    <Button
                      variant="accent"
                      size="sm"
                      disabled={selectedSavedProperties.length === 0}
                      onClick={handleScheduleInPersonTour}
                    >
                      Schedule In-Person Tour
                    </Button>
                  </div>
                </div>

                {savedProperties.length === 0 ? (
                  <Card className="p-6 text-center">
                    <p className="text-gray-500 mb-4">You haven't saved any properties yet.</p>
                    <Button onClick={() => router.push("/dashboard/property-search")} variant="outline">
                      Go to Property Search
                    </Button>
                  </Card>
                ) : (
                  <div>
                    {savedProperties.map((property) => (
                      <PropertyCard
                        key={property.id}
                        property={property}
                        section="saved"
                        onToggleSelection={handleToggleSelection}
                        onArchive={archiveProperty}
                        onRequestAnalysis={requestPropertyAnalysis}
                        onRequestVirtualTour={requestVirtualTour}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="viewingRequested">
                <div className="mb-4 flex justify-between items-center">
                  <h2 className="text-xl font-semibold">Viewings Requested</h2>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={selectedViewingRequestedProperties.length === 0}
                      onClick={handleMarkScheduled}
                    >
                      Mark Scheduled
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={selectedViewingRequestedProperties.length === 0}
                      onClick={handleWithdrawRequest}
                    >
                      Withdraw Request
                    </Button>
                  </div>
                </div>

                {viewingRequested.length === 0 ? (
                  <Card className="p-6 text-center">
                    <p className="text-gray-500">You haven't requested any viewings yet.</p>
                  </Card>
                ) : (
                  <div>
                    {viewingRequested.map((property) => (
                      <PropertyCard
                        key={property.id}
                        property={property}
                        section="viewingRequested"
                        onToggleSelection={handleToggleSelection}
                        onArchive={archiveProperty}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="viewingScheduled">
                <div className="mb-4">
                  <h2 className="text-xl font-semibold">Viewings Scheduled</h2>
                </div>

                {viewingScheduled.length === 0 ? (
                  <Card className="p-6 text-center">
                    <p className="text-gray-500">You don't have any scheduled viewings yet.</p>
                  </Card>
                ) : (
                  <div>
                    {viewingScheduled.map((property) => (
                      <PropertyCard
                        key={property.id}
                        property={property}
                        section="viewingScheduled"
                        onArchive={archiveProperty}
                        onMarkAsViewed={markAsViewed}
                        onUpdateNotes={updateBuyerNotes}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="viewed">
                <div className="mb-4">
                  <h2 className="text-xl font-semibold">Properties Viewed</h2>
                </div>

                {propertiesViewed.length === 0 ? (
                  <Card className="p-6 text-center">
                    <p className="text-gray-500">You haven't viewed any properties yet.</p>
                  </Card>
                ) : (
                  <div>
                    {propertiesViewed.map((property) => (
                      <PropertyCard
                        key={property.id}
                        property={property}
                        section="viewed"
                        onArchive={archiveProperty}
                        onRequestVirtualTour={requestVirtualTour}
                        onUpdateNotes={updateBuyerNotes}
                        onSubmitOffer={submitOffer}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="offerSubmitted">
                <div className="mb-4">
                  <h2 className="text-xl font-semibold">Pre-Offer</h2>
                </div>

                {offerSubmitted.length === 0 ? (
                  <Card className="p-6 text-center">
                    <p className="text-gray-500">You haven't submitted any offers yet.</p>
                  </Card>
                ) : (
                  <div>
                    {offerSubmitted.map((property) => (
                      <PropertyCard
                        key={property.id}
                        property={property}
                        section="offerSubmitted"
                        onArchive={archiveProperty}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="archived">
                <div className="mb-4 flex justify-between items-center">
                  <h2 className="text-xl font-semibold">Archived Properties</h2>
                  <div className="flex items-center">
                    <Checkbox
                      id="showActive"
                      checked={showOnlyActive}
                      onCheckedChange={(checked) => setShowOnlyActive(!!checked)}
                    />
                    <label htmlFor="showActive" className="ml-2 text-sm">
                      Only show active listings
                    </label>
                  </div>
                </div>

                {archivedProperties.length === 0 ? (
                  <Card className="p-6 text-center">
                    <p className="text-gray-500">You don't have any archived properties.</p>
                  </Card>
                ) : (
                  <div>
                    {archivedProperties
                      .filter((property) => !showOnlyActive || property.status === "active")
                      .map((property) => (
                        <PropertyCard
                          key={property.id}
                          property={property}
                          section="archived"
                          onRestore={restoreProperty}
                        />
                      ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Sidebar */}
          <div className="w-full md:w-1/3">
            {/* Educational Resources */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Educational Resources
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible>
                  <AccordionItem value="item-1">
                    <AccordionTrigger>How to evaluate a property</AccordionTrigger>
                    <AccordionContent>
                      <p className="text-sm text-gray-600">
                        When evaluating a property, consider location, condition, price comparison, and potential for
                        appreciation. Always inspect the property thoroughly and review all disclosures.
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-2">
                    <AccordionTrigger>What's in a disclosure?</AccordionTrigger>
                    <AccordionContent>
                      <p className="text-sm text-gray-600">
                        Property disclosures typically include information about known defects, repairs, renovations,
                        and potential issues like flooding or pest problems. Always read these documents carefully.
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-3">
                    <AccordionTrigger>Tips for submitting a strong offer</AccordionTrigger>
                    <AccordionContent>
                      <p className="text-sm text-gray-600">
                        A strong offer includes a competitive price, minimal contingencies, proof of financing, and a
                        personalized letter to the seller. Work with your realtor to craft the best strategy for the
                        current market.
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>

            {/* AI Assistant */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Ask Our AI Assistant
                </CardTitle>
                <CardDescription>Get instant answers to your home buying questions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 rounded-md p-3 mb-3 h-32 overflow-y-auto">
                  <p className="text-sm text-gray-600">
                    Hello! I'm your AI assistant. How can I help with your home buying journey today?
                  </p>
                </div>

                <div className="flex gap-2 mb-3">
                  <Button variant="outline" size="sm" className="text-xs">
                    What are the key factors in selecting a property?
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs">
                    How do I determine the right offer price?
                  </Button>
                </div>

                <div className="flex gap-2">
                  <Input
                    placeholder="Ask a question..."
                    value={aiMessage}
                    onChange={(e) => setAiMessage(e.target.value)}
                  />
                  <Button onClick={sendAiMessage}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Message Your Realtor */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Message Your Realtor
                </CardTitle>
                <CardDescription>Have questions? Your realtor is here to help</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Type your message here..."
                  value={realtorMessage}
                  onChange={(e) => setRealtorMessage(e.target.value)}
                  className="mb-3"
                  rows={4}
                />
                <Button onClick={sendRealtorMessage} className="w-full" variant="accent">
                  <Send className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
