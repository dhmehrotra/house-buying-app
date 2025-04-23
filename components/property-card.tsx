"use client"

import { memo } from "react"
import Image from "next/image"
import { Calendar, CheckCircle, Eye, FileText, Send, Trash2, Video, BarChart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { usePropertyStateStore } from "@/app/dashboard/property-pre-selection/property-state-store"
import { useToast } from "@/components/ui/use-toast"

// Property type definition
export type Property = {
  id: string
  mlsId: string
  address: {
    full: string
    city: string
    state: string
  }
  property: {
    bedrooms: number
    bathrooms: number
    area: number
    type: string
  }
  listPrice: number
  photos: string[]
  listDate: string
  status: "active" | "pending" | "sold"
  virtualTourUrl?: string
  openHouse?: {
    date: string
    startTime: string
    endTime: string
  }[]
}

// Extended property with buyer-specific status
export type BuyerProperty = Property & {
  buyerStatus: "saved" | "viewing-requested" | "viewing-scheduled" | "viewed" | "offer-submitted" | "archived"
  viewingStatus?: "pending" | "confirmed" | "completed" | "cancelled"
  viewingDate?: string
  buyerNotes?: string
  agentNotes?: string
  offerStatus?: "submitted" | "countered" | "accepted" | "rejected"
  offerAmount?: number
  showSubmittedPill?: boolean
}

// Property card props
interface PropertyCardProps {
  property: BuyerProperty
  section: string
  onToggleSelection?: (id: string, section: string) => void
  onArchive?: (id: string) => void
  onRequestAnalysis?: (id: string) => void
  onRequestVirtualTour?: (id: string) => void
  onMarkAsViewed?: (id: string) => void
  onUpdateNotes?: (id: string, notes: string) => void
  onSubmitOffer?: (id: string) => void
  onRestore?: (id: string) => void
  onProceedToOfferSubmission?: (id: string) => void
}

// Format price helper
const formatPrice = (price: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(price)
}

// Memoized PropertyCard component to prevent unnecessary re-renders
export const PropertyCard = memo(function PropertyCard({
  property,
  section,
  onToggleSelection,
  onArchive,
  onRequestAnalysis,
  onRequestVirtualTour,
  onMarkAsViewed,
  onUpdateNotes,
  onSubmitOffer,
  onRestore,
  onProceedToOfferSubmission,
}: PropertyCardProps) {
  // Get property state from store
  const {
    selectedMap,
    analysisRequestedMap,
    virtualTourRequestedMap,
    toggleSelection,
    setAnalysisRequested,
    setVirtualTourRequested,
  } = usePropertyStateStore()

  const { toast } = useToast()

  // Local state for this specific property
  const isSelected = selectedMap.get(property.id) || false
  const isAnalysisRequested = analysisRequestedMap.get(property.id) || false
  const isVirtualTourRequested = virtualTourRequestedMap.get(property.id) || false

  // Handle selection toggle
  const handleToggleSelection = () => {
    toggleSelection(property.id)
    if (onToggleSelection) onToggleSelection(property.id, section)
  }

  // Handle analysis request
  const handleRequestAnalysis = () => {
    setAnalysisRequested(property.id, true)
    if (onRequestAnalysis) onRequestAnalysis(property.id)
  }

  // Handle virtual tour request
  const handleRequestVirtualTour = () => {
    setVirtualTourRequested(property.id, true)
    if (onRequestVirtualTour) onRequestVirtualTour(property.id)
  }

  return (
    <Card className="mb-4 overflow-hidden hover:shadow-lg transition-shadow">
      <div className="flex flex-col md:flex-row">
        <div className="relative h-48 md:w-1/3">
          <Image
            src={property.photos[0] || "/placeholder.svg?height=200&width=300"}
            alt={property.address.full}
            className="object-cover"
          />
        </div>
        <div className="flex-1 p-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold">{property.address.full}</h3>
              <p className="text-xl font-bold text-primary">{formatPrice(property.listPrice)}</p>
              <div className="flex gap-4 mt-1 text-sm text-gray-600">
                <span>{property.property.bedrooms} beds</span>
                <span>{property.property.bathrooms} baths</span>
                <span>{property.property.area.toLocaleString()} sqft</span>
              </div>
            </div>
            <div className="flex items-center">
              {(section === "saved" || section === "viewingRequested") && (
                <Checkbox checked={isSelected} onCheckedChange={handleToggleSelection} className="mr-2" />
              )}
              {section !== "archived" && onArchive && (
                <Button variant="ghost" size="icon" onClick={() => onArchive(property.id)} title="Archive property">
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Section-specific content */}
          {section === "saved" && (
            <div className="mt-3">
              {isAnalysisRequested && (
                <Alert className="mb-3 bg-green-50 text-green-800 border-green-200">
                  <AlertDescription>
                    Analysis request submitted. You'll receive a report by email within 24 hours.
                  </AlertDescription>
                </Alert>
              )}

              {isVirtualTourRequested && (
                <Alert className="mb-3 bg-blue-50 text-blue-800 border-blue-200">
                  <AlertDescription>
                    If a virtual tour is available, you'll receive a link by email within 2 hours. If not, we'll let you
                    know.
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex flex-wrap gap-2 mt-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center rounded shadow-sm"
                  onClick={handleRequestAnalysis}
                >
                  <BarChart className="h-4 w-4 mr-1" />
                  Analyze Property
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center rounded shadow-sm"
                  onClick={handleRequestVirtualTour}
                >
                  <Video className="h-4 w-4 mr-1" />
                  Request Virtual Tour
                </Button>
              </div>
            </div>
          )}

          {section === "viewingRequested" && (
            <div className="mt-3">
              <div className="flex items-center justify-between">
                <Badge variant={property.viewingStatus === "pending" ? "secondary" : "accent"}>
                  {property.viewingStatus === "pending" ? "Pending" : "Confirmed"}
                </Badge>

                {property.openHouse && property.openHouse.length > 0 && (
                  <div className="flex items-center text-sm text-blue-600">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>Open House: {new Date(property.openHouse[0].date).toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              {property.virtualTourUrl && (
                <a
                  href={property.virtualTourUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center mt-2 text-sm text-blue-600 hover:underline"
                >
                  <Video className="h-4 w-4 mr-1" />
                  <span>View Virtual Tour</span>
                </a>
              )}
            </div>
          )}

          {section === "viewingScheduled" && (
            <div className="mt-3">
              <div className="flex items-center mb-2">
                <Calendar className="h-4 w-4 mr-1 text-green-600" />
                <span className="text-sm">Viewing scheduled for: {property.viewingDate || "Date to be confirmed"}</span>
              </div>

              <div className="mt-2">
                <Textarea
                  placeholder="Add your notes about this property..."
                  value={property.buyerNotes || ""}
                  onChange={(e) => onUpdateNotes && onUpdateNotes(property.id, e.target.value)}
                  className="text-sm"
                  rows={2}
                />
              </div>

              <div className="mt-3 flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onMarkAsViewed && onMarkAsViewed(property.id)}
                  className="flex items-center rounded shadow-sm"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Mark as Viewed
                </Button>
              </div>
            </div>
          )}

          {section === "viewed" && (
            <div className="mt-3">
              {isVirtualTourRequested && (
                <Alert className="mb-3 bg-blue-50 text-blue-800 border-blue-200">
                  <AlertDescription>
                    If a virtual tour is available, you'll receive a link by email within 2 hours. If not, we'll let you
                    know.
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500">Your Notes:</label>
                  <Textarea
                    placeholder="Your thoughts on this property..."
                    value={property.buyerNotes || ""}
                    onChange={(e) => onUpdateNotes && onUpdateNotes(property.id, e.target.value)}
                    className="text-sm"
                    rows={2}
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Agent Notes:</label>
                  <p className="text-sm border rounded-md p-2 bg-gray-50 h-[74px] overflow-auto">
                    {property.agentNotes || "No agent notes yet."}
                  </p>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2 justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center rounded shadow-sm"
                  onClick={handleRequestVirtualTour}
                >
                  <Video className="h-4 w-4 mr-1" />
                  Request Virtual Tour
                </Button>

                <Button variant="outline" size="sm" className="flex items-center rounded shadow-sm">
                  <FileText className="h-4 w-4 mr-1" />
                  Review Disclosures
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center rounded shadow-sm"
                  onClick={() => onSubmitOffer && onSubmitOffer(property.id)}
                >
                  Consider for Offer
                  <Send className="h-4 w-4 mr-1" />
                </Button>
              </div>
            </div>
          )}
          {section === "offerSubmitted" && (
            <div className="mt-3">
              <div className="flex items-center justify-between">
                {property.showSubmittedPill && (
                  <Badge
                    variant={
                      property.offerStatus === "accepted"
                        ? "accent"
                        : property.offerStatus === "rejected"
                          ? "destructive"
                          : "secondary"
                    }
                  >
                    {property.offerStatus === "submitted"
                      ? "Submitted"
                      : property.offerStatus === "countered"
                        ? "Countered"
                        : property.offerStatus === "accepted"
                          ? "Accepted"
                          : "Rejected"}
                  </Badge>
                )}
                <Button variant="outline" size="sm" className="flex items-center rounded shadow-sm">
                  <FileText className="h-4 w-4 mr-1" />
                  View Offer Details
                </Button>
                <Button variant="outline" size="sm" className="flex items-center rounded shadow-sm">
                  <FileText className="h-4 w-4 mr-1" />
                  Review Disclosures
                </Button>
                <Button variant="outline" size="sm" className="flex items-center rounded shadow-sm">
                  Proceed to Offer Submission
                </Button>
              </div>

              {property.offerAmount && (
                <p className="mt-2 text-sm">
                  <span className="font-medium">Offer Amount:</span> {formatPrice(property.offerAmount)}
                </p>
              )}
            </div>
          )}

          {section === "archived" && (
            <div className="mt-3 flex justify-between items-center">
              <Badge variant={property.status === "active" ? "secondary" : "destructive"}>
                {property.status === "active"
                  ? "Active Listing"
                  : property.status === "pending"
                    ? "Pending Sale"
                    : "Sold"}
              </Badge>

              {property.status === "active" && onRestore && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onRestore(property.id)}
                  className="flex items-center rounded shadow-sm"
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Restore to Saved
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  )
})
