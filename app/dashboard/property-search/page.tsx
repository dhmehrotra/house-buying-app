"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { ArrowRight, Bed, Heart, MapPin, Ruler, ShowerHead, Search, Loader2, X, Info, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Checkbox } from "@/components/ui/checkbox"

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
  }
  listPrice: number
  photos: string[]
  listDate: string
  mls: {
    status: string
    daysOnMarket: number
  }
}

// Search filters type
interface SearchFilters {
  locations: string[]
  minPrice: string
  maxPrice: string
  minBeds: string
  minBaths: string
  propertyType: string
  keywords: string
}

// Tasks type
interface Task {
  id: string
  label: string
  completed: boolean
}

// Property type mapping for display
const propertyTypeMap: Record<string, string> = {
  SingleFamily: "Single Family",
  MultiFamily: "Multi Family",
  Condo: "Condo",
  Townhouse: "Townhouse",
  Land: "Land",
}

export default function PropertySearchPage() {
  const router = useRouter()
  const { toast } = useToast()

  // State for listings
  const [properties, setProperties] = useState<Property[]>([])
  const [savedProperties, setSavedProperties] = useState<Property[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  // State for search filters
  const [filters, setFilters] = useState<SearchFilters>({
    locations: [], // Start with empty locations, will be filled from needs assessment
    minPrice: "300000",
    maxPrice: "500000",
    minBeds: "3",
    minBaths: "2",
    propertyType: "",
    keywords: "",
  })

  // State for location input
  const [locationInput, setLocationInput] = useState("")

  // State for tasks - UPDATED: Removed the "schedule" task and updated the "save" task text
  const [tasks, setTasks] = useState<Task[]>([
    { id: "search", label: "Search for properties in your desired area", completed: false },
    { id: "save", label: "Save at least 1 property you're interested in", completed: false },
  ])

  // State for AI assistant
  const [aiMessage, setAiMessage] = useState("")
  const [aiConversation, setAiConversation] = useState<{ role: string; content: string }[]>([
    {
      role: "assistant",
      content: "Hello! I'm your home search assistant. How can I help you find your perfect home today?",
    },
  ])

  // Ref for scrolling to the bottom of AI conversation
  const aiConversationEndRef = useRef<HTMLDivElement>(null)

  // Flag to track if we're loading saved search results
  const [loadingFromSaved, setLoadingFromSaved] = useState(false)

  // Flag to track initial load
  const initialLoadRef = useRef(true)

  // Flag to track if auto-fetch has been performed
  const autoFetchPerformedRef = useRef(false)

  // Load saved properties, search filters, and search results from localStorage on component mount
  useEffect(() => {
    // Load saved properties
    const savedItems = localStorage.getItem("buyhome_saved_properties")
    if (savedItems) {
      const parsedProperties = JSON.parse(savedItems)
      setSavedProperties(parsedProperties)

      // Update task completion status
      setTasks((prev) =>
        prev.map((task) => (task.id === "save" ? { ...task, completed: parsedProperties.length >= 1 } : task)),
      )
    }

    // Flag to track if we need to fetch properties
    let shouldFetchProperties = true

    // Load saved search results if they exist
    const savedResults = localStorage.getItem("buyhome_search_results")
    if (savedResults) {
      try {
        setLoadingFromSaved(true)
        const parsedResults = JSON.parse(savedResults)
        setProperties(parsedResults)

        // Mark search task as completed if we have results
        if (parsedResults.length > 0) {
          setTasks((prev) => prev.map((task) => (task.id === "search" ? { ...task, completed: true } : task)))
          // We already have results, no need to fetch again
          shouldFetchProperties = false
        }
        setLoadingFromSaved(false)
      } catch (error) {
        console.error("Error parsing saved search results:", error)
        setLoadingFromSaved(false)
      }
    }

    // Load saved search filters if they exist
    const savedFilters = localStorage.getItem("buyhome_search_filters")
    if (savedFilters) {
      try {
        const parsedFilters = JSON.parse(savedFilters)
        setFilters(parsedFilters)
      } catch (error) {
        console.error("Error parsing saved filters:", error)
      }
    } else {
      // Load preferences from needs assessment if available
      loadPreferencesFromNeedsAssessment()
    }

    // Set a short timeout to ensure filters are loaded before fetching
    setTimeout(() => {
      if (shouldFetchProperties && !autoFetchPerformedRef.current) {
        // Auto-fetch properties on initial load
        fetchProperties(true)
        autoFetchPerformedRef.current = true
      }
    }, 300)

    initialLoadRef.current = false
  }, [])

  // Separate function to load preferences from needs assessment
  const loadPreferencesFromNeedsAssessment = () => {
    const needsAssessment = localStorage.getItem("buyhome_needs_assessment")
    if (needsAssessment) {
      try {
        const preferences = JSON.parse(needsAssessment)

        // Update filters based on needs assessment
        const updatedFilters = { ...filters }

        // Set locations from needs assessment
        if (preferences.locations && preferences.locations.length > 0) {
          updatedFilters.locations = preferences.locations
        }

        // Set price range from needs assessment
        if (preferences.minPrice) {
          updatedFilters.minPrice = preferences.minPrice
        }

        if (preferences.maxPrice) {
          updatedFilters.maxPrice = preferences.maxPrice
        }

        // Set property type from needs assessment
        if (preferences.propertyTypes && preferences.propertyTypes.length > 0) {
          // If multiple property types are selected, use the first one
          updatedFilters.propertyType = preferences.propertyTypes[0]
        }

        // Set minimum bedrooms and bathrooms from needs assessment
        if (preferences.minBeds) {
          updatedFilters.minBeds = preferences.minBeds
        }

        if (preferences.minBaths) {
          updatedFilters.minBaths = preferences.minBaths
        }

        // Set keywords based on must-have features and other preferences
        const keywordsList = []

        if (preferences.features) {
          if (preferences.features.garage) keywordsList.push("garage")
          if (preferences.features.outdoorSpace) keywordsList.push("yard")
          if (preferences.features.homeOffice) keywordsList.push("office")
        }

        // Add neighborhood vibe preferences as keywords
        if (preferences.neighborhoodVibe && preferences.neighborhoodVibe.length > 0) {
          keywordsList.push(...preferences.neighborhoodVibe)
        }

        // Add sustainability preferences as keywords
        if (preferences.sustainability && preferences.sustainability.length > 0) {
          keywordsList.push(...preferences.sustainability)
        }

        if (keywordsList.length > 0) {
          updatedFilters.keywords = keywordsList.join(", ")
        }

        setFilters(updatedFilters)
      } catch (error) {
        console.error("Error parsing needs assessment:", error)
      }
    }
  }

  // Save search filters to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("buyhome_search_filters", JSON.stringify(filters))
  }, [filters])

  // Save search results to localStorage whenever they change
  useEffect(() => {
    // Only save if we're not loading from saved results and we have properties
    if (!loadingFromSaved && properties.length > 0) {
      localStorage.setItem("buyhome_search_results", JSON.stringify(properties))
    }
  }, [properties, loadingFromSaved])

  // Save properties to localStorage whenever savedProperties changes
  useEffect(() => {
    localStorage.setItem("buyhome_saved_properties", JSON.stringify(savedProperties))

    // Update task completion status
    setTasks((prev) =>
      prev.map((task) => (task.id === "save" ? { ...task, completed: savedProperties.length >= 1 } : task)),
    )
  }, [savedProperties])

  // Scroll to bottom of AI conversation when new messages are added
  useEffect(() => {
    if (aiConversationEndRef.current) {
      aiConversationEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [aiConversation])

  // Handle adding a location
  const handleAddLocation = () => {
    if (locationInput.trim() && !filters.locations.includes(locationInput.trim())) {
      setFilters((prev) => ({
        ...prev,
        locations: [...prev.locations, locationInput.trim()],
      }))
      setLocationInput("")
    }
  }

  // Handle removing a location
  const handleRemoveLocation = (location: string) => {
    setFilters((prev) => ({
      ...prev,
      locations: prev.locations.filter((loc) => loc !== location),
    }))
  }

  // Handle filter changes
  const handleFilterChange = (name: keyof SearchFilters, value: string | string[]) => {
    setFilters((prev) => ({ ...prev, [name]: value }))
  }

  // Handle task toggle
  const handleTaskToggle = (taskId: string) => {
    setTasks((prev) => prev.map((task) => (task.id === taskId ? { ...task, completed: !task.completed } : task)))
  }

  // Determine if a location is a zip code
  const isZipCode = (location: string) => {
    return /^\d{5}(-\d{4})?$/.test(location.trim())
  }

  // Fetch properties from SimplyRETS API
  const fetchProperties = async (isAutoFetch = false) => {
    setIsLoading(true)
    setApiError(null)
    setTasks((prev) => prev.map((task) => (task.id === "search" ? { ...task, completed: true } : task)))

    try {
      // Build query parameters
      const params = new URLSearchParams()

      // Add locations (cities or zip codes)
      if (filters.locations.length > 0) {
        filters.locations.forEach((location) => {
          const trimmedLocation = location.trim()

          // Check if it's a zip code
          if (isZipCode(trimmedLocation)) {
            params.append("postalCodes", trimmedLocation)
          } else {
            // Extract city name if it includes a comma (e.g., "Austin, TX" -> "Austin")
            const city = trimmedLocation.split(",")[0].trim()
            params.append("cities", city)
          }
        })
      }

      // Add price range (only if not "No Minimum" or "No Maximum")
      if (filters.minPrice !== "no-min") params.append("minprice", filters.minPrice)
      if (filters.maxPrice !== "no-max") params.append("maxprice", filters.maxPrice)

      // Add other filters
      if (filters.minBeds && filters.minBeds !== "any") params.append("minbeds", filters.minBeds)
      if (filters.minBaths && filters.minBaths !== "any") params.append("minbaths", filters.minBaths)
      if (filters.propertyType && filters.propertyType !== "any") params.append("type", filters.propertyType)
      if (filters.keywords) params.append("keywords", filters.keywords)

      // Don't limit results - we want to see all available properties
      // params.append("limit", "12")

      // Log the API request for debugging
      console.log("API Request:", `https://api.simplyrets.com/properties?${params.toString()}`)

      // Fetch data from SimplyRETS API
      const response = await fetch(`https://api.simplyrets.com/properties?${params.toString()}`, {
        headers: {
          Authorization: "Basic c2ltcGx5cmV0czpzaW1wbHlyZXRz",
        },
      })

      // Log the response status for debugging
      console.log("API Response Status:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("API Error Response:", errorText)
        throw new Error(`API request failed with status ${response.status}: ${errorText}`)
      }

      const data = await response.json()

      // Log the response data for debugging
      console.log("API Response Data:", data)
      console.log("Number of properties returned:", data.length)

      // Check if data is an array
      if (!Array.isArray(data)) {
        console.error("API Response is not an array:", data)
        throw new Error("Invalid response format from API")
      }

      setProperties(data)

      // If no properties found, show a toast notification
      if (data.length === 0) {
        toast({
          title: "No Properties Found",
          description: "Try adjusting your search criteria to see more results.",
          variant: "default",
        })
      } else {
        // Only show toast if not initial load or if it's not an automatic fetch
        if (!initialLoadRef.current && !isAutoFetch) {
          toast({
            title: "Properties Found",
            description: `Found ${data.length} properties matching your criteria.`,
            variant: "default",
          })
        }
      }
    } catch (error) {
      console.error("Error fetching properties:", error)
      setApiError(error instanceof Error ? error.message : "An unknown error occurred")
      toast({
        title: "Error",
        description: "Failed to fetch properties. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Toggle save property
  const toggleSaveProperty = (property: Property) => {
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
  const isPropertySaved = (mlsId: string) => {
    return savedProperties.some((p) => p.mlsId === mlsId)
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

  // Handle AI message submission
  const handleSendAiMessage = () => {
    if (!aiMessage.trim()) return

    const newConversation = [...aiConversation, { role: "user", content: aiMessage }]
    setAiConversation(newConversation)
    setAiMessage("")

    // Simulate AI response
    setTimeout(() => {
      let response =
        "I understand you're interested in that. As you continue to search for properties, I can provide more tailored information about homes that might match your criteria."

      if (aiMessage.toLowerCase().includes("property type") || aiMessage.toLowerCase().includes("home type")) {
        response =
          "Based on your needs assessment, I'd recommend looking at properties that offer the space and features you need. Single Family homes provide more privacy and space, while condos and townhouses often require less maintenance. Consider your lifestyle, budget, and long-term plans when choosing."
      } else if (
        aiMessage.toLowerCase().includes("schedule") ||
        aiMessage.toLowerCase().includes("tour") ||
        aiMessage.toLowerCase().includes("viewing")
      ) {
        response =
          "To schedule a viewing, simply click the 'Schedule Viewing' button on any property details page. Your realtor will be notified and will contact you to arrange a convenient time. It's a good idea to view multiple properties to compare options."
      } else if (
        aiMessage.toLowerCase().includes("price") ||
        aiMessage.toLowerCase().includes("afford") ||
        aiMessage.toLowerCase().includes("budget")
      ) {
        response =
          "Your budget is a critical factor in your home search. Remember to consider not just the purchase price, but also property taxes, HOA fees, insurance, and maintenance costs. The pre-qualification step should have given you a good idea of what you can afford."
      }

      setAiConversation([...newConversation, { role: "assistant", content: response }])
    }, 1000)
  }

  // Property card component
  const PropertyCard = ({ property }: { property: Property }) => {
    const isSaved = isPropertySaved(property.mlsId)

    return (
      <Card key={property.mlsId} className="overflow-hidden transition-all duration-200 hover:shadow-md">
        <div className="relative">
          <img
            src={property.photos[0] || "/placeholder.svg?height=200&width=320"}
            alt={property.address.full}
            className="h-48 w-full object-cover"
          />
          <Button
            size="icon"
            variant="ghost"
            className="absolute right-2 top-2 h-8 w-8 rounded-full bg-white/80 text-muted-foreground hover:text-primary"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              toggleSaveProperty(property)
            }}
          >
            <Heart className={`h-4 w-4 ${isSaved ? "fill-accent text-accent" : ""}`} />
            <span className="sr-only">{isSaved ? "Unsave property" : "Save property"}</span>
          </Button>
        </div>
        <CardHeader>
          <CardTitle className="text-lg">{formatPrice(property.listPrice)}</CardTitle>
          <div className="flex items-center text-sm text-muted-foreground gap-1">
            <MapPin className="h-4 w-4" />
            <span className="truncate">{formatAddress(property.address)}</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mt-2 flex items-center justify-between text-sm">
            <div className="flex items-center gap-1">
              <Bed className="h-4 w-4" />
              <span>{property.property.bedrooms} Beds</span>
            </div>
            <div className="flex items-center gap-1">
              <ShowerHead className="h-4 w-4" />
              <span>
                {property.property.bathsFull + (property.property.bathsHalf ? property.property.bathsHalf * 0.5 : 0)}{" "}
                Baths
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Ruler className="h-4 w-4" />
              <span>{property.property.area.toLocaleString()} sqft</span>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button asChild variant="outline" className="w-full border-primary text-primary hover:bg-primary/5">
            <Link href={`/dashboard/property-search/${property.mlsId}`}>
              View Details <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardFooter>
      </Card>
    )
  }

  // Skeleton loader for property cards
  const PropertyCardSkeleton = () => (
    <Card className="overflow-hidden">
      <Skeleton className="h-48 w-full" />
      <CardHeader>
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-full mt-2" />
      </CardHeader>
      <CardContent>
        <div className="flex justify-between mt-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
        </div>
      </CardContent>
      <CardFooter>
        <Skeleton className="h-10 w-full" />
      </CardFooter>
    </Card>
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Property Search</h1>
        <p className="text-muted-foreground">Find properties that match your criteria and save your favorites.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="search">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="search">New Listings</TabsTrigger>
              <TabsTrigger value="saved">Saved Listings</TabsTrigger>
            </TabsList>

            {/* New Listings Tab */}
            <TabsContent value="search" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Search Criteria</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="location">Locations (City, State or ZIP Code)</Label>
                      <div className="flex gap-2">
                        <Input
                          id="location"
                          placeholder="Eg: 77096"
                          value={locationInput}
                          onChange={(e) => setLocationInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault()
                              handleAddLocation()
                            }
                          }}
                        />
                        <Button type="button" onClick={handleAddLocation} className="bg-accent hover:bg-accent/90">
                          Add
                        </Button>
                      </div>

                      {filters.locations.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {filters.locations.map((location, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-1 bg-accent/10 text-accent px-3 py-1 rounded-full"
                            >
                              <span>{location}</span>
                              <button
                                onClick={() => handleRemoveLocation(location)}
                                className="h-4 w-4 rounded-full flex items-center justify-center hover:bg-accent/20"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                      <div className="space-y-2">
                        <Label htmlFor="min-price">Min Price</Label>
                        <Select
                          value={filters.minPrice}
                          onValueChange={(value) => handleFilterChange("minPrice", value)}
                        >
                          <SelectTrigger id="min-price">
                            <SelectValue placeholder="No Minimum" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="no-min">No Minimum</SelectItem>
                            <SelectItem value="100000">$100,000</SelectItem>
                            <SelectItem value="200000">$200,000</SelectItem>
                            <SelectItem value="300000">$300,000</SelectItem>
                            <SelectItem value="400000">$400,000</SelectItem>
                            <SelectItem value="500000">$500,000</SelectItem>
                            <SelectItem value="600000">$600,000</SelectItem>
                            <SelectItem value="700000">$700,000</SelectItem>
                            <SelectItem value="800000">$800,000</SelectItem>
                            <SelectItem value="900000">$900,000</SelectItem>
                            <SelectItem value="1000000">$1,000,000</SelectItem>
                            <SelectItem value="1500000">$1,500,000</SelectItem>
                            <SelectItem value="2000000">$2,000,000</SelectItem>
                            <SelectItem value="2500000">$2,500,000</SelectItem>
                            <SelectItem value="3000000">$3,000,000</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="max-price">Max Price</Label>
                        <Select
                          value={filters.maxPrice}
                          onValueChange={(value) => handleFilterChange("maxPrice", value)}
                        >
                          <SelectTrigger id="max-price">
                            <SelectValue placeholder="No Maximum" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="no-max">No Maximum</SelectItem>
                            <SelectItem value="5000000">$5,000,000</SelectItem>
                            <SelectItem value="4500000">$4,500,000</SelectItem>
                            <SelectItem value="4000000">$4,000,000</SelectItem>
                            <SelectItem value="3500000">$3,500,000</SelectItem>
                            <SelectItem value="3000000">$3,000,000</SelectItem>
                            <SelectItem value="2500000">$2,500,000</SelectItem>
                            <SelectItem value="2000000">$2,000,000</SelectItem>
                            <SelectItem value="1500000">$1,500,000</SelectItem>
                            <SelectItem value="1000000">$1,000,000</SelectItem>
                            <SelectItem value="900000">$900,000</SelectItem>
                            <SelectItem value="800000">$800,000</SelectItem>
                            <SelectItem value="700000">$700,000</SelectItem>
                            <SelectItem value="600000">$600,000</SelectItem>
                            <SelectItem value="500000">$500,000</SelectItem>
                            <SelectItem value="400000">$400,000</SelectItem>
                            <SelectItem value="300000">$300,000</SelectItem>
                            <SelectItem value="200000">$200,000</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="beds">Beds</Label>
                        <Select value={filters.minBeds} onValueChange={(value) => handleFilterChange("minBeds", value)}>
                          <SelectTrigger id="beds">
                            <SelectValue placeholder="Min Beds" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="any">Any</SelectItem>
                            <SelectItem value="1">1+ Beds</SelectItem>
                            <SelectItem value="2">2+ Beds</SelectItem>
                            <SelectItem value="3">3+ Beds</SelectItem>
                            <SelectItem value="4">4+ Beds</SelectItem>
                            <SelectItem value="5">5+ Beds</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="baths">Baths</Label>
                        <Select
                          value={filters.minBaths}
                          onValueChange={(value) => handleFilterChange("minBaths", value)}
                        >
                          <SelectTrigger id="baths">
                            <SelectValue placeholder="Min Baths" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="any">Any</SelectItem>
                            <SelectItem value="1">1+ Baths</SelectItem>
                            <SelectItem value="2">2+ Baths</SelectItem>
                            <SelectItem value="3">3+ Baths</SelectItem>
                            <SelectItem value="4">4+ Baths</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="property-type">Property Type</Label>
                        <Select
                          value={filters.propertyType}
                          onValueChange={(value) => handleFilterChange("propertyType", value)}
                        >
                          <SelectTrigger id="property-type">
                            <SelectValue placeholder="Any" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="any">Any</SelectItem>
                            <SelectItem value="SingleFamily">Single Family</SelectItem>
                            <SelectItem value="Condo">Condo</SelectItem>
                            <SelectItem value="Townhouse">Townhouse</SelectItem>
                            <SelectItem value="MultiFamily">Multi Family</SelectItem>
                            <SelectItem value="Land">Land</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="keywords">Keywords</Label>
                        <Input
                          id="keywords"
                          placeholder="e.g., garage, pool, office"
                          value={filters.keywords}
                          onChange={(e) => handleFilterChange("keywords", e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button
                        className="bg-accent hover:bg-accent/90"
                        onClick={() => fetchProperties(false)}
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Loading...
                          </>
                        ) : (
                          <>
                            <Search className="mr-2 h-4 w-4" />
                            Show Properties
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {apiError && (
                <Card className="bg-red-50 border-red-200">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-2 text-red-600">
                      <Info className="h-5 w-5 mt-0.5" />
                      <div>
                        <h3 className="font-medium">Error fetching properties</h3>
                        <p className="text-sm mt-1">{apiError}</p>
                        <p className="text-sm mt-2">
                          Try using ZIP codes like 77096 or 77429 for best results with the SimplyRETS demo API.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {isLoading ? (
                  // Show skeleton loaders while loading
                  Array(6)
                    .fill(0)
                    .map((_, index) => <PropertyCardSkeleton key={index} />)
                ) : properties.length > 0 ? (
                  // Show property cards
                  properties.map((property) => <PropertyCard key={property.mlsId} property={property} />)
                ) : (
                  // Show empty state
                  <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                    <Search className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">No properties found</h3>
                    <p className="text-muted-foreground mt-1">
                      Try adjusting your search criteria to see more results.
                    </p>
                    <p className="text-muted-foreground mt-2">
                      For the SimplyRETS demo API, try searching with ZIP codes like 77096 or 77429.
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Saved Listings Tab */}
            <TabsContent value="saved" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Your Saved Properties</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {savedProperties.length > 0
                      ? `You have saved ${savedProperties.length} properties.`
                      : "You haven't saved any properties yet."}
                  </p>
                </CardHeader>
                <CardContent>
                  {savedProperties.length > 0 ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {savedProperties.map((property) => (
                        <PropertyCard key={property.mlsId} property={property} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">You haven't saved any properties yet.</p>
                      <p className="text-muted-foreground mt-1">
                        Click the heart icon on properties you're interested in to save them here.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <Card>
            <CardHeader>
              <CardTitle>Suggested Tasks for This Step</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <ul className="mt-2 space-y-2">
                    {tasks.map((task) => (
                      <li key={task.id} className="flex items-center gap-2">
                        <div
                          className="flex items-center justify-center cursor-pointer"
                          onClick={() => handleTaskToggle(task.id)}
                        >
                          <Checkbox
                            id={`task-${task.id}`}
                            checked={task.completed}
                            onCheckedChange={() => handleTaskToggle(task.id)}
                          />
                        </div>
                        <label
                          htmlFor={`task-${task.id}`}
                          className="cursor-pointer"
                          onClick={() => handleTaskToggle(task.id)}
                        >
                          {task.label}
                        </label>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="text-sm text-muted-foreground">
                  You'll need to save at least one property to continue.
                </div>
                <Separator />
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  <Button
                    variant="outline"
                    asChild
                    className="border-primary text-primary hover:bg-primary/5"
                    onClick={() => {
                      // Save current search filters to be used in Needs Assessment
                      const currentFilters = {
                        locations: filters.locations,
                        minPrice: filters.minPrice,
                        maxPrice: filters.maxPrice,
                        propertyTypes: filters.propertyType ? [filters.propertyType] : [],
                        minBeds: filters.minBeds,
                        minBaths: filters.minBaths,
                      }

                      // Store in localStorage for Needs Assessment to pick up
                      localStorage.setItem("buyhome_search_to_needs", JSON.stringify(currentFilters))
                    }}
                  >
                    <Link href="/dashboard/needs-assessment">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Previous: Needs Assessment
                    </Link>
                  </Button>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div>
                          <Button
                            className="bg-accent hover:bg-accent/90"
                            disabled={savedProperties.length < 1}
                            onClick={() => router.push("/dashboard/property-pre-selection")}
                          >
                            {savedProperties.length >= 1 ? (
                              <>
                                Next: Property Pre-Selection
                                <ArrowRight className="ml-2 h-4 w-4" />
                              </>
                            ) : (
                              <>
                                Next: Property Pre-Selection
                                <ArrowRight className="ml-2 h-4 w-4" />
                              </>
                            )}
                          </Button>
                        </div>
                      </TooltipTrigger>
                      {savedProperties.length < 1 && (
                        <TooltipContent>
                          <p>Please save at least one property to proceed.</p>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* AI Assistant */}
          <Card>
            <CardHeader>
              <CardTitle>AI Assistant</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border p-4 h-[300px] flex flex-col">
                <div className="flex-1 space-y-4 overflow-auto">
                  {aiConversation.map((message, index) => (
                    <div key={index} className="flex gap-3">
                      <div
                        className={`h-8 w-8 rounded-full ${
                          message.role === "assistant" ? "bg-accent/20 text-accent" : "bg-primary/20 text-primary"
                        } flex items-center justify-center text-sm font-medium`}
                      >
                        {message.role === "assistant" ? "AI" : "You"}
                      </div>
                      <div className="bg-muted rounded-lg p-3 text-sm max-w-[80%]">
                        <p>{message.content}</p>
                      </div>
                    </div>
                  ))}
                  <div ref={aiConversationEndRef} />
                </div>
                <div className="flex gap-2 mt-4">
                  <Input
                    placeholder="Ask a question about property search..."
                    value={aiMessage}
                    onChange={(e) => setAiMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && aiMessage.trim()) {
                        handleSendAiMessage()
                      }
                    }}
                  />
                  <Button
                    className="bg-accent hover:bg-accent/90"
                    onClick={handleSendAiMessage}
                    disabled={!aiMessage.trim()}
                  >
                    Send
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Educational Resources */}
          <Card>
            <CardHeader>
              <CardTitle>Educational Resources</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-lg border p-3">
                  <h3 className="font-medium">Understanding Property Types</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Learn about different property types and which might be right for you.
                  </p>
                  <Button variant="link" className="px-0 mt-1 text-accent">
                    Read Article
                  </Button>
                </div>
                <div className="rounded-lg border p-3">
                  <h3 className="font-medium">Home Viewing Checklist</h3>
                  <p className="text-sm text-muted-foreground mt-1">What to look for when viewing a potential home.</p>
                  <Button variant="link" className="px-0 mt-1 text-accent">
                    Download PDF
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
