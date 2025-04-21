"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Bed,
  Calendar,
  Heart,
  Home,
  Info,
  MapPin,
  MessageSquare,
  Ruler,
  Share2,
  ShowerHead,
  ChevronLeft,
  ChevronRight,
  School,
  Clock,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"

// Property type definition
interface Property {
  mlsId: string
  address: {
    full: string
    city: string
    state: string
    postalCode: string
  }
  property: {
    bedrooms: number
    bathsFull: number
    bathsHalf?: number
    area: number
    type?: string
    stories?: number
    yearBuilt?: number
    parking?: {
      spaces?: number
      description?: string
    }
    lotSize?: string
    style?: string
  }
  listPrice: number
  photos: string[]
  listDate: string
  mls: {
    status: string
    daysOnMarket: number
    area?: string
  }
  remarks: string
  agent?: {
    firstName: string
    lastName: string
    contact?: {
      email?: string
      office?: string
    }
  }
  school?: {
    district?: string
    elementarySchool?: string
    middleSchool?: string
    highSchool?: string
  }
  geo?: {
    lat?: number
    lng?: number
  }
  tax?: {
    taxYear?: number
    taxAnnualAmount?: number
  }
  association?: {
    fee?: number
    amenities?: string
  }
}

export default function PropertyDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [property, setProperty] = useState<Property | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [savedProperties, setSavedProperties] = useState<Property[]>([])
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
  const [similarProperties, setSimilarProperties] = useState<Property[]>([])

  // Load saved properties from localStorage on component mount
  useEffect(() => {
    const savedItems = localStorage.getItem("buyhome_saved_properties")
    if (savedItems) {
      setSavedProperties(JSON.parse(savedItems))
    }

    fetchPropertyDetails()
  }, [params.id])

  // Save properties to localStorage whenever savedProperties changes
  useEffect(() => {
    localStorage.setItem("buyhome_saved_properties", JSON.stringify(savedProperties))
  }, [savedProperties])

  // Fetch property details from SimplyRETS API
  const fetchPropertyDetails = async () => {
    setIsLoading(true)

    try {
      // Fetch data from SimplyRETS API
      const response = await fetch(`https://api.simplyrets.com/properties/${params.id}`, {
        headers: {
          Authorization: "Basic c2ltcGx5cmV0czpzaW1wbHlyZXRz",
        },
      })

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`)
      }

      const data = await response.json()
      setProperty(data)

      // Fetch similar properties
      fetchSimilarProperties(data)
    } catch (error) {
      console.error("Error fetching property details:", error)
      toast({
        title: "Error",
        description: "Failed to fetch property details. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch similar properties
  const fetchSimilarProperties = async (propertyData: Property) => {
    try {
      // Build query parameters for similar properties
      const params = new URLSearchParams()

      // Use the same city
      if (propertyData.address.city) {
        params.append("cities", propertyData.address.city)
      }

      // Similar price range (±15%)
      const minPrice = Math.floor(propertyData.listPrice * 0.85)
      const maxPrice = Math.ceil(propertyData.listPrice * 1.15)
      params.append("minprice", minPrice.toString())
      params.append("maxprice", maxPrice.toString())

      // Similar bedrooms (±1)
      const minBeds = Math.max(propertyData.property.bedrooms - 1, 1)
      params.append("minbeds", minBeds.toString())
      params.append("maxbeds", (propertyData.property.bedrooms + 1).toString())

      // Limit results to 3
      params.append("limit", "3")

      // Fetch data from SimplyRETS API
      const response = await fetch(`https://api.simplyrets.com/properties?${params.toString()}`, {
        headers: {
          Authorization: "Basic c2ltcGx5cmV0czpzaW1wbHlyZXRz",
        },
      })

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`)
      }

      const data = await response.json()

      // Filter out the current property
      const filteredData = data.filter((p: Property) => p.mlsId !== propertyData.mlsId)

      // Take only the first 2
      setSimilarProperties(filteredData.slice(0, 2))
    } catch (error) {
      console.error("Error fetching similar properties:", error)
    }
  }

  // Toggle save property
  const toggleSaveProperty = () => {
    if (!property) return

    const isAlreadySaved = savedProperties.some((p) => p.mlsId === property.mlsId)

    if (isAlreadySaved) {
      // Remove from saved properties
      setSavedProperties((prev) => prev.filter((p) => p.mlsId !== property.mlsId))
      toast({
        title: "Property Removed",
        description: "Property has been removed from your saved listings.",
      })
    } else {
      // Add to saved properties
      setSavedProperties((prev) => [...prev, property])
      toast({
        title: "Property Saved",
        description: "Property has been added to your saved listings.",
      })
    }
  }

  // Check if a property is saved
  const isPropertySaved = () => {
    if (!property) return false
    return savedProperties.some((p) => p.mlsId === property.mlsId)
  }

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(price)
  }

  // Format address
  const formatAddress = (address: Property["address"]) => {
    return `${address.full}, ${address.city}, ${address.state} ${address.postalCode}`
  }

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date)
  }

  // Navigate to next photo
  const nextPhoto = () => {
    if (!property) return
    setCurrentPhotoIndex((prev) => (prev + 1) % property.photos.length)
  }

  // Navigate to previous photo
  const prevPhoto = () => {
    if (!property) return
    setCurrentPhotoIndex((prev) => (prev === 0 ? property.photos.length - 1 : prev - 1))
  }

  // Calculate total baths
  const calculateTotalBaths = (bathsFull: number, bathsHalf?: number) => {
    return bathsFull + (bathsHalf ? bathsHalf * 0.5 : 0)
  }

  // Schedule a viewing
  const scheduleViewing = () => {
    toast({
      title: "Viewing Request Sent",
      description:
        "Your request to schedule a viewing has been sent to the listing agent. They will contact you shortly.",
    })
  }

  // Contact agent
  const contactAgent = () => {
    toast({
      title: "Message Sent",
      description: "Your message has been sent to the listing agent. They will respond to your inquiry soon.",
    })
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="outline" size="sm" asChild className="border-primary text-primary hover:bg-primary/5">
            <Link href="/dashboard/property-search">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Search
            </Link>
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-6">
            <Skeleton className="aspect-video w-full rounded-lg" />
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((_, index) => (
                <Skeleton key={index} className="aspect-video w-full rounded-lg" />
              ))}
            </div>
            <div className="space-y-2">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-6 w-1/4 mt-2" />
            </div>
            <Skeleton className="h-[400px] w-full rounded-lg" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-[200px] w-full rounded-lg" />
            <Skeleton className="h-[200px] w-full rounded-lg" />
            <Skeleton className="h-[200px] w-full rounded-lg" />
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (!property) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="outline" size="sm" asChild className="border-primary text-primary hover:bg-primary/5">
            <Link href="/dashboard/property-search">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Search
            </Link>
          </Button>
        </div>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Info className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">Property Not Found</h3>
            <p className="text-muted-foreground mt-1">The property you're looking for could not be found.</p>
            <Button asChild className="mt-4 bg-accent hover:bg-accent/90">
              <Link href="/dashboard/property-search">Return to Search</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" asChild className="border-primary text-primary hover:bg-primary/5">
          <Link href="/dashboard/property-search">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Search
          </Link>
        </Button>
        <div className="flex gap-2">
          <Button
            size="icon"
            variant="outline"
            onClick={toggleSaveProperty}
            className={isPropertySaved() ? "text-accent border-accent" : ""}
          >
            <Heart className={`h-4 w-4 ${isPropertySaved() ? "fill-accent" : ""}`} />
            <span className="sr-only">{isPropertySaved() ? "Unsave property" : "Save property"}</span>
          </Button>
          <Button size="icon" variant="outline">
            <Share2 className="h-4 w-4" />
            <span className="sr-only">Share property</span>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          {/* Photo Gallery */}
          <div className="relative aspect-video overflow-hidden rounded-lg">
            <img
              src={property.photos[currentPhotoIndex] || "/placeholder.svg?height=400&width=600"}
              alt={`Property image ${currentPhotoIndex + 1}`}
              className="h-full w-full object-cover"
            />
            {property.photos.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/50 text-white hover:bg-black/70"
                  onClick={prevPhoto}
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="sr-only">Previous photo</span>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/50 text-white hover:bg-black/70"
                  onClick={nextPhoto}
                >
                  <ChevronRight className="h-4 w-4" />
                  <span className="sr-only">Next photo</span>
                </Button>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 text-white px-2 py-1 rounded-full text-xs">
                  {currentPhotoIndex + 1} / {property.photos.length}
                </div>
              </>
            )}
          </div>

          {/* Thumbnail Gallery */}
          {property.photos.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {property.photos.slice(0, 4).map((photo, index) => (
                <button
                  key={index}
                  className={`aspect-video overflow-hidden rounded-lg border-2 ${
                    currentPhotoIndex === index ? "border-accent" : "border-transparent"
                  }`}
                  onClick={() => setCurrentPhotoIndex(index)}
                >
                  <img
                    src={photo || "/placeholder.svg?height=100&width=150"}
                    alt={`Property thumbnail ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
              {property.photos.length > 4 && (
                <button
                  className="aspect-video overflow-hidden rounded-lg bg-muted flex items-center justify-center"
                  onClick={() => setCurrentPhotoIndex(4)}
                >
                  <span className="text-sm font-medium">+{property.photos.length - 4} more</span>
                </button>
              )}
            </div>
          )}

          <div>
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold">{formatPrice(property.listPrice)}</h1>
              <Badge variant="outline" className="text-accent border-accent">
                {property.mls.status}
              </Badge>
            </div>
            <div className="flex items-center text-muted-foreground gap-1 mt-1">
              <MapPin className="h-4 w-4" />
              <span>{formatAddress(property.address)}</span>
            </div>
            <div className="mt-2 flex items-center gap-6 text-sm">
              <div className="flex items-center gap-1">
                <Bed className="h-4 w-4" />
                <span>{property.property.bedrooms} Beds</span>
              </div>
              <div className="flex items-center gap-1">
                <ShowerHead className="h-4 w-4" />
                <span>{calculateTotalBaths(property.property.bathsFull, property.property.bathsHalf)} Baths</span>
              </div>
              <div className="flex items-center gap-1">
                <Ruler className="h-4 w-4" />
                <span>{property.property.area.toLocaleString()} sqft</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{property.mls.daysOnMarket} days on market</span>
              </div>
            </div>
          </div>

          <Tabs defaultValue="details">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="features">Features</TabsTrigger>
              <TabsTrigger value="location">Location</TabsTrigger>
            </TabsList>
            <TabsContent value="details" className="space-y-4">
              <div className="mt-4">
                <h2 className="text-xl font-semibold">Description</h2>
                <p className="mt-2 text-muted-foreground whitespace-pre-line">{property.remarks}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium">Property Type</h3>
                  <p className="text-muted-foreground">{property.property.type || "Residential"}</p>
                </div>
                <div>
                  <h3 className="font-medium">Year Built</h3>
                  <p className="text-muted-foreground">{property.property.yearBuilt || "Not specified"}</p>
                </div>
                <div>
                  <h3 className="font-medium">MLS #</h3>
                  <p className="text-muted-foreground">{property.mlsId}</p>
                </div>
                <div>
                  <h3 className="font-medium">Status</h3>
                  <p className="text-muted-foreground">{property.mls.status}</p>
                </div>
                <div>
                  <h3 className="font-medium">Days on Market</h3>
                  <p className="text-muted-foreground">{property.mls.daysOnMarket}</p>
                </div>
                <div>
                  <h3 className="font-medium">Lot Size</h3>
                  <p className="text-muted-foreground">{property.property.lotSize || "Not specified"}</p>
                </div>
                <div>
                  <h3 className="font-medium">Listed Date</h3>
                  <p className="text-muted-foreground">{formatDate(property.listDate)}</p>
                </div>
                {property.property.stories && (
                  <div>
                    <h3 className="font-medium">Stories</h3>
                    <p className="text-muted-foreground">{property.property.stories}</p>
                  </div>
                )}
                {property.tax && (
                  <>
                    <div>
                      <h3 className="font-medium">Tax Year</h3>
                      <p className="text-muted-foreground">{property.tax.taxYear || "Not specified"}</p>
                    </div>
                    <div>
                      <h3 className="font-medium">Annual Tax</h3>
                      <p className="text-muted-foreground">
                        {property.tax.taxAnnualAmount ? formatPrice(property.tax.taxAnnualAmount) : "Not specified"}
                      </p>
                    </div>
                  </>
                )}
                {property.association && (
                  <div>
                    <h3 className="font-medium">HOA Fee</h3>
                    <p className="text-muted-foreground">
                      {property.association.fee ? `$${property.association.fee}/month` : "Not specified"}
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
            <TabsContent value="features">
              <div className="mt-4 grid grid-cols-2 gap-2">
                {property.property.stories && (
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-primary"></div>
                    <span>{property.property.stories} Stories</span>
                  </div>
                )}
                {property.property.parking && (
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-primary"></div>
                    <span>
                      {property.property.parking.spaces
                        ? `${property.property.parking.spaces} Parking Spaces`
                        : property.property.parking.description || "Parking Available"}
                    </span>
                  </div>
                )}
                {property.property.style && (
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-primary"></div>
                    <span>{property.property.style}</span>
                  </div>
                )}
                {property.association?.amenities && (
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-primary"></div>
                    <span>{property.association.amenities}</span>
                  </div>
                )}

                {/* Add more features based on property data */}
                {/* These are examples that might not be in the API data */}
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary"></div>
                  <span>Central Air Conditioning</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary"></div>
                  <span>Forced Air Heating</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary"></div>
                  <span>Washer/Dryer Hookups</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary"></div>
                  <span>Dishwasher</span>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="location">
              <div className="mt-4">
                {property.geo?.lat && property.geo?.lng ? (
                  <iframe
                    width="100%"
                    height="300"
                    frameBorder="0"
                    style={{ border: 0 }}
                    src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${property.geo.lat},${property.geo.lng}`}
                    allowFullScreen
                  ></iframe>
                ) : (
                  <div className="aspect-video rounded-lg bg-muted flex items-center justify-center">
                    <p className="text-muted-foreground">Map location not available</p>
                  </div>
                )}

                {property.school && (
                  <div className="mt-4">
                    <h3 className="font-medium mb-2 flex items-center gap-2">
                      <School className="h-4 w-4 text-accent" />
                      School Information
                    </h3>
                    <div className="space-y-2">
                      {property.school.district && (
                        <div>
                          <span className="text-sm font-medium">District:</span>{" "}
                          <span className="text-sm text-muted-foreground">{property.school.district}</span>
                        </div>
                      )}
                      {property.school.elementarySchool && (
                        <div>
                          <span className="text-sm font-medium">Elementary School:</span>{" "}
                          <span className="text-sm text-muted-foreground">{property.school.elementarySchool}</span>
                        </div>
                      )}
                      {property.school.middleSchool && (
                        <div>
                          <span className="text-sm font-medium">Middle School:</span>{" "}
                          <span className="text-sm text-muted-foreground">{property.school.middleSchool}</span>
                        </div>
                      )}
                      {property.school.highSchool && (
                        <div>
                          <span className="text-sm font-medium">High School:</span>{" "}
                          <span className="text-sm text-muted-foreground">{property.school.highSchool}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="mt-4">
                  <h3 className="font-medium mb-2 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-accent" />
                    Neighborhood
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    This property is located in {property.address.city}, {property.address.state}. The area offers
                    convenient access to local amenities, schools, and transportation.
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact Realtor</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                  {property.agent ? (
                    <span className="text-primary font-medium">
                      {property.agent.firstName.charAt(0)}
                      {property.agent.lastName.charAt(0)}
                    </span>
                  ) : (
                    <span className="text-primary font-medium">LA</span>
                  )}
                </div>
                <div>
                  <p className="font-medium">
                    {property.agent ? `${property.agent.firstName} ${property.agent.lastName}` : "Listing Agent"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {property.agent?.contact?.office || "Listing Brokerage"}
                  </p>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <Button className="w-full bg-accent hover:bg-accent/90" onClick={contactAgent}>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Message
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-primary text-primary hover:bg-primary/5"
                  onClick={scheduleViewing}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  Schedule Viewing
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="h-5 w-5 text-accent" />
                Property Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Price</span>
                <span className="text-sm font-medium">{formatPrice(property.listPrice)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <span className="text-sm font-medium">{property.mls.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">MLS #</span>
                <span className="text-sm font-medium">{property.mlsId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Days on Market</span>
                <span className="text-sm font-medium">{property.mls.daysOnMarket}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Year Built</span>
                <span className="text-sm font-medium">{property.property.yearBuilt || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Property Type</span>
                <span className="text-sm font-medium">{property.property.type || "Residential"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Lot Size</span>
                <span className="text-sm font-medium">{property.property.lotSize || "N/A"}</span>
              </div>
              {property.tax?.taxAnnualAmount && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Annual Tax</span>
                  <span className="text-sm font-medium">{formatPrice(property.tax.taxAnnualAmount)}</span>
                </div>
              )}
              {property.association?.fee && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">HOA Fee</span>
                  <span className="text-sm font-medium">${property.association.fee}/month</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Similar Properties</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {similarProperties.length > 0 ? (
                similarProperties.map((similarProperty) => (
                  <div key={similarProperty.mlsId} className="flex gap-3">
                    <div className="h-16 w-24 rounded-md overflow-hidden">
                      <img
                        src={similarProperty.photos[0] || "/placeholder.svg?height=64&width=96"}
                        alt="Similar property"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">Similar Home in {similarProperty.address.city}</p>
                      <p className="text-sm text-muted-foreground">{formatPrice(similarProperty.listPrice)}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{similarProperty.property.bedrooms} bd</span>
                        <span>•</span>
                        <span>
                          {calculateTotalBaths(similarProperty.property.bathsFull, similarProperty.property.bathsHalf)}{" "}
                          ba
                        </span>
                        <span>•</span>
                        <span>{similarProperty.property.area.toLocaleString()} sqft</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground">No similar properties found</p>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button variant="link" className="w-full text-accent" asChild>
                <Link href="/dashboard/property-search">View More Similar Properties</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Suggested Tasks for This Step</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <ul className="mt-2 space-y-2">
                <li className="flex items-center gap-2">
                  <div className="h-5 w-5 rounded-full border border-muted-foreground flex items-center justify-center">
                    <div className="h-2.5 w-2.5 rounded-full bg-primary"></div>
                  </div>
                  <span>Search for properties in your desired area</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-5 w-5 rounded-full border border-muted-foreground flex items-center justify-center">
                    <div className="h-2.5 w-2.5 rounded-full"></div>
                  </div>
                  <span>Save at least 3 properties you're interested in</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-5 w-5 rounded-full border border-muted-foreground flex items-center justify-center">
                    <div className="h-2.5 w-2.5 rounded-full"></div>
                  </div>
                  <span>Schedule viewings for your favorite properties</span>
                </li>
              </ul>
            </div>
            <div className="text-sm text-muted-foreground">You'll need to save at least one property to continue.</div>
            <Separator />
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <Button variant="outline" asChild className="border-primary text-primary hover:bg-primary/5">
                <Link href="/dashboard/property-search">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Previous: Property Search
                </Link>
              </Button>
              <Button className="bg-accent hover:bg-accent/90" onClick={toggleSaveProperty}>
                {isPropertySaved() ? "Remove from Saved" : "Save This Property"}
                <Heart className={`ml-2 h-4 w-4 ${isPropertySaved() ? "fill-white" : ""}`} />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
