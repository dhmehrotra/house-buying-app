"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowRight,
  Calendar,
  Car,
  CheckCircle,
  ChevronsUpDown,
  DollarSign,
  HelpCircle,
  Home,
  Laptop,
  MapPin,
  Plus,
  School,
  Settings,
  Users,
  X,
  ArrowLeft,
  Bed,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

export default function NeedsAssessmentPage() {
  const router = useRouter()

  // Target Locations
  const [locations, setLocations] = useState<string[]>([])
  const [locationInput, setLocationInput] = useState("")
  const [locationNotes, setLocationNotes] = useState("")

  // Price Range
  const [minPrice, setMinPrice] = useState<string>("300000")
  const [maxPrice, setMaxPrice] = useState<string>("500000")

  // Property Types
  const [propertyTypes, setPropertyTypes] = useState<string[]>([])

  // Bedroom & Bathroom Preferences
  const [minBeds, setMinBeds] = useState<string>("3")
  const [minBaths, setMinBaths] = useState<string>("2")

  // Household & Lifestyle
  const [household, setHousehold] = useState({
    adults: false,
    children: false,
    pets: false,
  })
  const [accessibility, setAccessibility] = useState({
    wheelchair: false,
    singleLevel: false,
    other: false,
  })
  const [hostGuests, setHostGuests] = useState(false)

  // Home Needs
  const [willingToRenovate, setWillingToRenovate] = useState(50)
  const [features, setFeatures] = useState({
    garage: false,
    outdoorSpace: false,
    homeOffice: false,
  })
  const [homeAge, setHomeAge] = useState<string[]>([])
  const [sustainability, setSustainability] = useState<string[]>([])

  // Location Priorities
  const [neighborhoodVibe, setNeighborhoodVibe] = useState<string[]>([])
  const [nearby, setNearby] = useState<string[]>([])
  const [developmentConcerns, setDevelopmentConcerns] = useState("")

  // School Considerations
  const [schoolImportant, setSchoolImportant] = useState(false)
  const [schoolRating, setSchoolRating] = useState("8")
  const [preferredSchools, setPreferredSchools] = useState("")

  // Commute Preferences
  const [limitCommute, setLimitCommute] = useState(false)
  const [commuteAddress, setCommuteAddress] = useState("")
  const [commuteTime, setCommuteTime] = useState(30)

  // Budget Sensitivities
  const [maxHOA, setMaxHOA] = useState("")

  // Work-from-Home Preferences
  const [workFromHome, setWorkFromHome] = useState(false)
  const [dedicatedOffice, setDedicatedOffice] = useState(false)

  // Timeline & Intent
  const [timeline, setTimeline] = useState(6)
  const [purpose, setPurpose] = useState<string>("primary")
  const [stayDuration, setStayDuration] = useState<string>("5+")

  // Additional Considerations
  const [additionalOpen, setAdditionalOpen] = useState(false)

  // AI Assistant
  const [aiMessage, setAiMessage] = useState("")
  const [aiConversation, setAiConversation] = useState<{ role: string; content: string }[]>([
    {
      role: "assistant",
      content:
        "Hello! I'm your home search assistant. I can help answer questions about neighborhoods, home features, or the buying process. What would you like to know?",
    },
  ])

  // Property type mapping for display
  const propertyTypeMap: Record<string, string> = {
    SingleFamily: "Single Family",
    MultiFamily: "Multi Family",
    Condo: "Condo",
    Townhouse: "Townhouse",
    Land: "Land",
  }

  // Handle adding a location
  const handleAddLocation = () => {
    if (locationInput.trim() && !locations.includes(locationInput.trim())) {
      setLocations([...locations, locationInput.trim()])
      setLocationInput("")
    }
  }

  // Handle removing a location
  const handleRemoveLocation = (location: string) => {
    setLocations(locations.filter((loc) => loc !== location))
  }

  // Handle property type selection
  const handlePropertyTypeChange = (type: string) => {
    if (propertyTypes.includes(type)) {
      setPropertyTypes(propertyTypes.filter((t) => t !== type))
    } else {
      setPropertyTypes([...propertyTypes, type])
    }
  }

  // Handle home age selection
  const handleHomeAgeChange = (age: string) => {
    if (homeAge.includes(age)) {
      setHomeAge(homeAge.filter((a) => a !== age))
    } else {
      setHomeAge([...homeAge, age])
    }
  }

  // Handle sustainability selection
  const handleSustainabilityChange = (item: string) => {
    if (sustainability.includes(item)) {
      setSustainability(sustainability.filter((s) => s !== item))
    } else {
      setSustainability([...sustainability, item])
    }
  }

  // Handle neighborhood vibe selection
  const handleVibeChange = (vibe: string) => {
    if (neighborhoodVibe.includes(vibe)) {
      setNeighborhoodVibe(neighborhoodVibe.filter((v) => v !== vibe))
    } else {
      setNeighborhoodVibe([...neighborhoodVibe, vibe])
    }
  }

  // Handle nearby amenities selection
  const handleNearbyChange = (amenity: string) => {
    if (nearby.includes(amenity)) {
      setNearby(nearby.filter((a) => a !== amenity))
    } else {
      setNearby([...nearby, amenity])
    }
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
        "I understand you're interested in that. As you continue to fill out your preferences, I can provide more tailored information about homes that might match your criteria."

      if (aiMessage.toLowerCase().includes("school")) {
        response =
          "School districts are an important consideration! You can specify your school preferences in the 'School Considerations' section under 'Additional Considerations'."
      } else if (aiMessage.toLowerCase().includes("commute") || aiMessage.toLowerCase().includes("work")) {
        response =
          "Commute time is crucial for many buyers. You can set your preferred commute time and destination in the 'Commute Preferences' section under 'Additional Considerations'."
      } else if (aiMessage.toLowerCase().includes("timeline") || aiMessage.toLowerCase().includes("when")) {
        response =
          "Your timeline helps us understand your urgency. You've indicated you're looking to buy in " +
          formatTimeline(timeline) +
          ". Is there anything specific about this timeline you'd like to discuss?"
      }

      setAiConversation([...newConversation, { role: "assistant", content: response }])
    }, 1000)
  }

  // Format timeline display
  const formatTimeline = (value: number) => {
    if (value === 0) return "Immediately"
    if (value === 12) return "12+ months"
    return `${value} month${value !== 1 ? "s" : ""}`
  }

  // Format price for display
  const formatPrice = (price: string) => {
    if (price === "no-min") return "No Minimum"
    if (price === "no-max") return "No Maximum"

    const numPrice = Number.parseInt(price)
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(numPrice)
  }

  // Save data to localStorage when values change
  useEffect(() => {
    const saveData = {
      locations,
      locationNotes,
      minPrice,
      maxPrice,
      propertyTypes,
      minBeds,
      minBaths,
      household,
      accessibility,
      hostGuests,
      willingToRenovate,
      features,
      homeAge,
      sustainability,
      neighborhoodVibe,
      nearby,
      developmentConcerns,
      schoolImportant,
      schoolRating,
      preferredSchools,
      limitCommute,
      commuteAddress,
      commuteTime,
      maxHOA,
      workFromHome,
      dedicatedOffice,
      timeline,
      purpose,
      stayDuration,
    }

    localStorage.setItem("buyhome_needs_assessment", JSON.stringify(saveData))
  }, [
    locations,
    locationNotes,
    minPrice,
    maxPrice,
    propertyTypes,
    minBeds,
    minBaths,
    household,
    accessibility,
    hostGuests,
    willingToRenovate,
    features,
    homeAge,
    sustainability,
    neighborhoodVibe,
    nearby,
    developmentConcerns,
    schoolImportant,
    schoolRating,
    preferredSchools,
    limitCommute,
    commuteAddress,
    commuteTime,
    maxHOA,
    workFromHome,
    dedicatedOffice,
    timeline,
    purpose,
    stayDuration,
  ])

  // Load data from localStorage on component mount
  useEffect(() => {
    // First check if we have data from Property Search (Step 3)
    const searchToNeeds = localStorage.getItem("buyhome_search_to_needs")

    if (searchToNeeds) {
      try {
        const searchData = JSON.parse(searchToNeeds)

        // Update state with data from Property Search
        if (searchData.locations) setLocations(searchData.locations)
        if (searchData.minPrice) setMinPrice(searchData.minPrice)
        if (searchData.maxPrice) setMaxPrice(searchData.maxPrice)
        if (searchData.propertyTypes && searchData.propertyTypes.length > 0) {
          setPropertyTypes(searchData.propertyTypes)
        }
        if (searchData.minBeds) setMinBeds(searchData.minBeds)
        if (searchData.minBaths) setMinBaths(searchData.minBaths)

        // Clear the temporary storage to avoid using outdated data in the future
        localStorage.removeItem("buyhome_search_to_needs")

        // Save the updated data to the regular needs assessment storage
        const updatedData = {
          locations: searchData.locations || locations,
          locationNotes,
          minPrice: searchData.minPrice || minPrice,
          maxPrice: searchData.maxPrice || maxPrice,
          propertyTypes: searchData.propertyTypes || propertyTypes,
          minBeds: searchData.minBeds || minBeds,
          minBaths: searchData.minBaths || minBaths,
          household,
          accessibility,
          hostGuests,
          willingToRenovate,
          features,
          homeAge,
          sustainability,
          neighborhoodVibe,
          nearby,
          developmentConcerns,
          schoolImportant,
          schoolRating,
          preferredSchools,
          limitCommute,
          commuteAddress,
          commuteTime,
          maxHOA,
          workFromHome,
          dedicatedOffice,
          timeline,
          purpose,
          stayDuration,
        }

        localStorage.setItem("buyhome_needs_assessment", JSON.stringify(updatedData))
        return // Skip loading from regular storage since we already have data
      } catch (error) {
        console.error("Error parsing search data:", error)
      }
    }

    // If no data from Property Search, load from regular storage as before
    const savedData = localStorage.getItem("buyhome_needs_assessment")
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData)

        // Set all the state values from saved data
        setLocations(parsedData.locations || [])
        setLocationNotes(parsedData.locationNotes || "")
        setMinPrice(parsedData.minPrice || "300000")
        setMaxPrice(parsedData.maxPrice || "500000")
        setPropertyTypes(parsedData.propertyTypes || [])
        setMinBeds(parsedData.minBeds || "3")
        setMinBaths(parsedData.minBaths || "2")
        setHousehold(parsedData.household || { adults: false, children: false, pets: false })
        setAccessibility(parsedData.accessibility || { wheelchair: false, singleLevel: false, other: false })
        setHostGuests(parsedData.hostGuests || false)
        setWillingToRenovate(parsedData.willingToRenovate || 50)
        setFeatures(parsedData.features || { garage: false, outdoorSpace: false, homeOffice: false })
        setHomeAge(parsedData.homeAge || [])
        setSustainability(parsedData.sustainability || [])
        setNeighborhoodVibe(parsedData.neighborhoodVibe || [])
        setNearby(parsedData.nearby || [])
        setDevelopmentConcerns(parsedData.developmentConcerns || "")
        setSchoolImportant(parsedData.schoolImportant || false)
        setSchoolRating(parsedData.schoolRating || "8")
        setPreferredSchools(parsedData.preferredSchools || "")
        setLimitCommute(parsedData.limitCommute || false)
        setCommuteAddress(parsedData.commuteAddress || "")
        setCommuteTime(parsedData.commuteTime || 30)
        setMaxHOA(parsedData.maxHOA || "")
        setWorkFromHome(parsedData.workFromHome || false)
        setDedicatedOffice(parsedData.dedicatedOffice || false)
        setTimeline(parsedData.timeline || 6)
        setPurpose(parsedData.purpose || "primary")
        setStayDuration(parsedData.stayDuration || "5+")
      } catch (error) {
        console.error("Error parsing saved data:", error)
      }
    }
  }, [])

  // Sync data with buyer profile in realtor view
  useEffect(() => {
    // In a real app, this would be an API call to update the buyer's profile
    // For now, we'll simulate this by updating the mock data in localStorage

    const buyerData = localStorage.getItem("buyhome_user")
    if (!buyerData) return

    try {
      const buyer = JSON.parse(buyerData)

      // Get the buyer's ID or use a placeholder
      const buyerId = buyer.id || "current_buyer"

      // Create a needsAssessment object with all the current state
      const needsAssessment = {
        locations,
        locationNotes,
        minPrice,
        maxPrice,
        propertyTypes,
        minBeds,
        minBaths,
        household,
        accessibility,
        hostGuests,
        willingToRenovate,
        features,
        homeAge,
        sustainability,
        neighborhoodVibe,
        nearby,
        developmentConcerns,
        schoolImportant,
        schoolRating,
        preferredSchools,
        limitCommute,
        commuteAddress,
        commuteTime,
        maxHOA,
        workFromHome,
        dedicatedOffice,
        timeline,
        purpose,
        stayDuration,
      }

      // Store this data in a format that could be accessed by the realtor
      localStorage.setItem(`buyhome_buyer_${buyerId}_needs_assessment`, JSON.stringify(needsAssessment))

      // In a real app with a database, you would update the buyer's record
      // For example: await updateBuyerProfile(buyerId, { needsAssessment });
    } catch (error) {
      console.error("Error syncing buyer data:", error)
    }
  }, [
    locations,
    locationNotes,
    minPrice,
    maxPrice,
    propertyTypes,
    minBeds,
    minBaths,
    household,
    accessibility,
    hostGuests,
    willingToRenovate,
    features,
    homeAge,
    sustainability,
    neighborhoodVibe,
    nearby,
    developmentConcerns,
    schoolImportant,
    schoolRating,
    preferredSchools,
    limitCommute,
    commuteAddress,
    commuteTime,
    maxHOA,
    workFromHome,
    dedicatedOffice,
    timeline,
    purpose,
    stayDuration,
  ])

  // Handle navigation to Property Search and ensure data is passed correctly
  const handleNextStep = () => {
    // Save the current needs assessment data to be used in Property Search
    const searchData = {
      locations,
      minPrice,
      maxPrice,
      propertyTypes,
      minBeds,
      minBaths,
    }

    // Store in localStorage for Property Search to pick up
    localStorage.setItem(
      "buyhome_search_filters",
      JSON.stringify({
        locations: locations,
        minPrice: minPrice,
        maxPrice: maxPrice,
        propertyType: propertyTypes.length > 0 ? propertyTypes[0] : "",
        minBeds: minBeds,
        minBaths: minBaths,
        keywords: "",
      }),
    )

    // Navigate to Property Search
    router.push("/dashboard/property-search")
  }

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-[#2B2D42]">Needs Assessment</h1>
          <p className="text-muted-foreground">
            Tell us about your ideal home to help us find the perfect match for you.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-7 space-y-6">
          {/* Target Locations */}
          <Card className="bg-white rounded-xl shadow-sm">
            <CardHeader className="pb-2 p-6">
              <CardTitle className="flex items-center gap-2 text-[#2B2D42]">
                <MapPin className="h-5 w-5 text-[#EF8354]" />
                Target Locations
              </CardTitle>
              <CardDescription>Where are you looking to buy a home?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 p-6 pt-0">
              <div className="space-y-3">
                <Label htmlFor="location">Cities or ZIP codes</Label>
                <div className="flex gap-2">
                  <Input
                    id="location"
                    placeholder="Enter a city or ZIP code"
                    value={locationInput}
                    onChange={(e) => setLocationInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        handleAddLocation()
                      }
                    }}
                  />
                  <Button type="button" onClick={handleAddLocation} className="bg-[#EF8354] hover:bg-[#EF8354]/90">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {locations.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {locations.map((location, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-1 bg-[#EF8354]/10 text-[#EF8354] px-3 py-1 rounded-full"
                      >
                        <span>{location}</span>
                        <button
                          onClick={() => handleRemoveLocation(location)}
                          className="h-4 w-4 rounded-full flex items-center justify-center hover:bg-[#EF8354]/20"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <Label htmlFor="locationNotes">Tell us more about your location preferences (optional)</Label>
                <Textarea
                  id="locationNotes"
                  placeholder="E.g., specific neighborhoods, proximity to work, etc."
                  value={locationNotes}
                  onChange={(e) => setLocationNotes(e.target.value)}
                  className="min-h-[80px]"
                />
              </div>
            </CardContent>
          </Card>

          {/* Price Range and Property Type - NEW SECTION */}
          <Card className="bg-white rounded-xl shadow-sm">
            <CardHeader className="pb-2 p-6">
              <CardTitle className="flex items-center gap-2 text-[#2B2D42]">
                <DollarSign className="h-5 w-5 text-[#EF8354]" />
                Price Range & Property Type
              </CardTitle>
              <CardDescription>What's your price range and preferred property type?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 p-6 pt-0">
              <div className="space-y-3">
                <Label>Price Range</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="min-price">Minimum Price</Label>
                    <Select value={minPrice} onValueChange={setMinPrice}>
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
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="max-price">Maximum Price</Label>
                    <Select value={maxPrice} onValueChange={setMaxPrice}>
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
                </div>
                <div className="flex justify-between text-sm text-muted-foreground mt-1">
                  <span>
                    Selected range: {formatPrice(minPrice)} - {formatPrice(maxPrice)}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <Label>Property Type</Label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: "SingleFamily", label: "Single Family" },
                    { value: "Condo", label: "Condo" },
                    { value: "Townhouse", label: "Townhouse" },
                    { value: "MultiFamily", label: "Multi Family" },
                    { value: "Land", label: "Land" },
                  ].map((type) => (
                    <button
                      key={type.value}
                      onClick={() => handlePropertyTypeChange(type.value)}
                      className={`px-4 py-2 rounded-full text-sm ${
                        propertyTypes.includes(type.value)
                          ? "bg-[#EF8354] text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  This will help personalize the properties we show you in the next step.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Bedroom & Bathroom Preferences */}
          <Card className="bg-white rounded-xl shadow-sm">
            <CardHeader className="pb-2 p-6">
              <CardTitle className="flex items-center gap-2 text-[#2B2D42]">
                <Bed className="h-5 w-5 text-[#EF8354]" />
                Bedroom & Bathroom Preferences
              </CardTitle>
              <CardDescription>Let us know how many bedrooms and bathrooms you'd ideally like.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 p-6 pt-0">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="beds">Beds</Label>
                  <Select value={minBeds} onValueChange={setMinBeds}>
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
                  <Select value={minBaths} onValueChange={setMinBaths}>
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
            </CardContent>
          </Card>

          {/* Household & Lifestyle */}
          <Card className="bg-white rounded-xl shadow-sm">
            <CardHeader className="pb-2 p-6">
              <CardTitle className="flex items-center gap-2 text-[#2B2D42]">
                <Users className="h-5 w-5 text-[#EF8354]" />
                Household & Lifestyle
              </CardTitle>
              <CardDescription>Tell us about who will be living in the home.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 p-6 pt-0">
              <div className="space-y-3">
                <Label>Household Members</Label>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => setHousehold({ ...household, adults: !household.adults })}
                    className={`px-4 py-2 rounded-full text-sm flex items-center gap-2 ${
                      household.adults ? "bg-[#EF8354] text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {household.adults && <CheckCircle className="h-4 w-4" />}
                    Adults
                  </button>
                  <button
                    onClick={() => setHousehold({ ...household, children: !household.children })}
                    className={`px-4 py-2 rounded-full text-sm flex items-center gap-2 ${
                      household.children ? "bg-[#EF8354] text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {household.children && <CheckCircle className="h-4 w-4" />}
                    Children
                  </button>
                  <button
                    onClick={() => setHousehold({ ...household, pets: !household.pets })}
                    className={`px-4 py-2 rounded-full text-sm flex items-center gap-2 ${
                      household.pets ? "bg-[#EF8354] text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {household.pets && <CheckCircle className="h-4 w-4" />}
                    Pets
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <Label>Accessibility Needs</Label>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => setAccessibility({ ...accessibility, wheelchair: !accessibility.wheelchair })}
                    className={`px-4 py-2 rounded-full text-sm flex items-center gap-2 ${
                      accessibility.wheelchair
                        ? "bg-[#EF8354] text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {accessibility.wheelchair && <CheckCircle className="h-4 w-4" />}
                    Wheelchair access
                  </button>
                  <button
                    onClick={() => setAccessibility({ ...accessibility, singleLevel: !accessibility.singleLevel })}
                    className={`px-4 py-2 rounded-full text-sm flex items-center gap-2 ${
                      accessibility.singleLevel
                        ? "bg-[#EF8354] text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {accessibility.singleLevel && <CheckCircle className="h-4 w-4" />}
                    Single-level
                  </button>
                  <button
                    onClick={() => setAccessibility({ ...accessibility, other: !accessibility.other })}
                    className={`px-4 py-2 rounded-full text-sm flex items-center gap-2 ${
                      accessibility.other ? "bg-[#EF8354] text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {accessibility.other && <CheckCircle className="h-4 w-4" />}
                    Other
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="hostGuests" className="flex-1">
                  Do you frequently host guests or family overnight?
                </Label>
                <Switch id="hostGuests" checked={hostGuests} onCheckedChange={setHostGuests} />
              </div>
            </CardContent>
          </Card>

          {/* Home Needs */}
          <Card className="bg-white rounded-xl shadow-sm">
            <CardHeader className="pb-2 p-6">
              <CardTitle className="flex items-center gap-2 text-[#2B2D42]">
                <Home className="h-5 w-5 text-[#EF8354]" />
                Home Needs
              </CardTitle>
              <CardDescription>What type of property are you looking for?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 p-6 pt-0">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <Label htmlFor="renovate">Willing to Renovate</Label>
                  <span className="text-sm">
                    {willingToRenovate === 0
                      ? "Not at all"
                      : willingToRenovate === 100
                        ? "Completely"
                        : `${willingToRenovate}%`}
                  </span>
                </div>
                <Slider
                  id="renovate"
                  min={0}
                  max={100}
                  step={10}
                  value={[willingToRenovate]}
                  onValueChange={(value) => setWillingToRenovate(value[0])}
                />
              </div>

              <div className="space-y-3">
                <Label>Features</Label>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => setFeatures({ ...features, garage: !features.garage })}
                    className={`px-4 py-2 rounded-full text-sm flex items-center gap-2 ${
                      features.garage ? "bg-[#EF8354] text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {features.garage && <CheckCircle className="h-4 w-4" />}
                    Garage
                  </button>
                  <button
                    onClick={() => setFeatures({ ...features, outdoorSpace: !features.outdoorSpace })}
                    className={`px-4 py-2 rounded-full text-sm flex items-center gap-2 ${
                      features.outdoorSpace ? "bg-[#EF8354] text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {features.outdoorSpace && <CheckCircle className="h-4 w-4" />}
                    Outdoor space
                  </button>
                  <button
                    onClick={() => setFeatures({ ...features, homeOffice: !features.homeOffice })}
                    className={`px-4 py-2 rounded-full text-sm flex items-center gap-2 ${
                      features.homeOffice ? "bg-[#EF8354] text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {features.homeOffice && <CheckCircle className="h-4 w-4" />}
                    Home office
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <Label>Home Age Preference</Label>
                <div className="flex flex-wrap gap-2">
                  {["New (0-5 yrs)", "Mid-age (5-20 yrs)", "Older (20+ yrs)"].map((age) => (
                    <button
                      key={age}
                      onClick={() => handleHomeAgeChange(age)}
                      className={`px-4 py-2 rounded-full text-sm ${
                        homeAge.includes(age)
                          ? "bg-[#EF8354] text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {age}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label>Sustainability Preferences (optional)</Label>
                <div className="flex flex-wrap gap-2">
                  {["Solar panels", "EV charging", "Energy-efficient appliances", "Walkable area"].map((item) => (
                    <button
                      key={item}
                      onClick={() => handleSustainabilityChange(item)}
                      className={`px-4 py-2 rounded-full text-sm ${
                        sustainability.includes(item)
                          ? "bg-[#EF8354] text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location Priorities */}
          <Card className="bg-white rounded-xl shadow-sm">
            <CardHeader className="pb-2 p-6">
              <CardTitle className="flex items-center gap-2 text-[#2B2D42]">
                <MapPin className="h-5 w-5 text-[#EF8354]" />
                Location Priorities
              </CardTitle>
              <CardDescription>What's important to you in a neighborhood?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 p-6 pt-0">
              <div className="space-y-3">
                <Label>Neighborhood Vibe</Label>
                <div className="flex flex-wrap gap-2">
                  {["Urban", "Suburban", "Quiet", "Walkable"].map((vibe) => (
                    <button
                      key={vibe}
                      onClick={() => handleVibeChange(vibe)}
                      className={`px-4 py-2 rounded-full text-sm ${
                        neighborhoodVibe.includes(vibe)
                          ? "bg-[#EF8354] text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {vibe}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label>Nearby Amenities</Label>
                <div className="flex flex-wrap gap-2">
                  {["Schools", "Parks", "Public transport", "Restaurants", "Healthcare", "Entertainment"].map(
                    (item) => (
                      <button
                        key={item}
                        onClick={() => handleNearbyChange(item)}
                        className={`px-4 py-2 rounded-full text-sm ${
                          nearby.includes(item)
                            ? "bg-[#EF8354] text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {item}
                      </button>
                    ),
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="developmentConcerns">Any concerns about future development in the area?</Label>
                <Textarea
                  id="developmentConcerns"
                  placeholder="E.g., construction, zoning changes, etc."
                  value={developmentConcerns}
                  onChange={(e) => setDevelopmentConcerns(e.target.value)}
                  className="min-h-[80px]"
                />
              </div>
            </CardContent>
          </Card>

          {/* Additional Considerations */}
          <Collapsible
            open={additionalOpen}
            onOpenChange={setAdditionalOpen}
            className="bg-white rounded-xl shadow-sm border"
          >
            <div className="p-6">
              <CollapsibleTrigger className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-[#EF8354]" />
                  <h3 className="text-lg font-semibold text-[#2B2D42]">Additional Considerations (Optional)</h3>
                </div>
                <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
              </CollapsibleTrigger>
            </div>
            <CollapsibleContent className="space-y-6 p-6 pt-0">
              {/* School Considerations */}
              <Card className="bg-white rounded-xl shadow-sm border">
                <CardHeader className="pb-2 p-6">
                  <CardTitle className="flex items-center gap-2 text-[#2B2D42]">
                    <School className="h-5 w-5 text-[#EF8354]" />
                    School Considerations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 p-6 pt-0">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="schoolImportant" className="flex-1">
                      School ratings are important to me
                    </Label>
                    <Switch id="schoolImportant" checked={schoolImportant} onCheckedChange={setSchoolImportant} />
                  </div>

                  {schoolImportant && (
                    <>
                      <div className="space-y-3">
                        <Label htmlFor="schoolRating">Only show districts with rating above</Label>
                        <Select value={schoolRating} onValueChange={setSchoolRating}>
                          <SelectTrigger id="schoolRating">
                            <SelectValue placeholder="Select minimum rating" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="6">6</SelectItem>
                            <SelectItem value="7">7</SelectItem>
                            <SelectItem value="8">8</SelectItem>
                            <SelectItem value="9">9</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="preferredSchools">List preferred school districts (optional)</Label>
                        <Textarea
                          id="preferredSchools"
                          placeholder="E.g., Austin ISD, Eanes ISD, etc."
                          value={preferredSchools}
                          onChange={(e) => setPreferredSchools(e.target.value)}
                          className="min-h-[80px]"
                        />
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Commute Preferences */}
              <Card className="bg-white rounded-xl shadow-sm border">
                <CardHeader className="pb-2 p-6">
                  <CardTitle className="flex items-center gap-2 text-[#2B2D42]">
                    <Car className="h-5 w-5 text-[#EF8354]" />
                    Commute Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 p-6 pt-0">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="limitCommute" className="flex-1">
                      I want to limit my commute time
                    </Label>
                    <Switch id="limitCommute" checked={limitCommute} onCheckedChange={setLimitCommute} />
                  </div>

                  {limitCommute && (
                    <>
                      <div className="space-y-3">
                        <Label htmlFor="commuteAddress">Destination address</Label>
                        <Input
                          id="commuteAddress"
                          placeholder="Enter work or school address"
                          value={commuteAddress}
                          onChange={(e) => setCommuteAddress(e.target.value)}
                        />
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <Label htmlFor="commuteTime">Maximum commute time</Label>
                          <span className="text-sm">{commuteTime} minutes</span>
                        </div>
                        <Slider
                          id="commuteTime"
                          min={5}
                          max={90}
                          step={5}
                          value={[commuteTime]}
                          onValueChange={(value) => setCommuteTime(value[0])}
                        />
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Budget Sensitivities */}
              <Card className="bg-white rounded-xl shadow-sm border">
                <CardHeader className="pb-2 p-6">
                  <CardTitle className="flex items-center gap-2 text-[#2B2D42]">
                    <DollarSign className="h-5 w-5 text-[#EF8354]" />
                    Budget Sensitivities
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 p-6 pt-0">
                  <div className="space-y-3">
                    <Label htmlFor="maxHOA">Max HOA or monthly property fees I'm comfortable with</Label>
                    <Input
                      id="maxHOA"
                      placeholder="E.g., $300"
                      value={maxHOA}
                      onChange={(e) => setMaxHOA(e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Work-from-Home Preferences */}
              <Card className="bg-white rounded-xl shadow-sm border">
                <CardHeader className="pb-2 p-6">
                  <CardTitle className="flex items-center gap-2 text-[#2B2D42]">
                    <Laptop className="h-5 w-5 text-[#EF8354]" />
                    Work-from-Home Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 p-6 pt-0">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="workFromHome" className="flex-1">
                      I work from home full- or part-time
                    </Label>
                    <Switch id="workFromHome" checked={workFromHome} onCheckedChange={setWorkFromHome} />
                  </div>

                  {workFromHome && (
                    <div className="flex items-center justify-between">
                      <Label htmlFor="dedicatedOffice" className="flex-1">
                        Dedicated home office is essential to me
                      </Label>
                      <Switch id="dedicatedOffice" checked={dedicatedOffice} onCheckedChange={setDedicatedOffice} />
                    </div>
                  )}
                </CardContent>
              </Card>
            </CollapsibleContent>
          </Collapsible>

          {/* Timeline & Intent */}
          <Card className="bg-white rounded-xl shadow-sm">
            <CardHeader className="pb-2 p-6">
              <CardTitle className="flex items-center gap-2 text-[#2B2D42]">
                <Calendar className="h-5 w-5 text-[#EF8354]" />
                Timeline & Intent
              </CardTitle>
              <CardDescription>When are you looking to buy and for what purpose?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 p-6 pt-0">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <Label htmlFor="timeline">Timeline</Label>
                  <span className="text-sm font-medium">{formatTimeline(timeline)}</span>
                </div>
                <Slider
                  id="timeline"
                  min={0}
                  max={12}
                  step={1}
                  value={[timeline]}
                  onValueChange={(value) => setTimeline(value[0])}
                />
              </div>

              <div className="space-y-3">
                <Label>Purpose</Label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setPurpose("primary")}
                    className={`px-4 py-2 rounded-full text-sm ${
                      purpose === "primary" ? "bg-[#EF8354] text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Primary Home
                  </button>
                  <button
                    onClick={() => setPurpose("investment")}
                    className={`px-4 py-2 rounded-full text-sm ${
                      purpose === "investment"
                        ? "bg-[#EF8354] text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Investment
                  </button>
                  <button
                    onClick={() => setPurpose("vacation")}
                    className={`px-4 py-2 rounded-full text-sm ${
                      purpose === "vacation" ? "bg-[#EF8354] text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Vacation
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="stayDuration">Planned Duration of Stay</Label>
                <Select value={stayDuration} onValueChange={setStayDuration}>
                  <SelectTrigger id="stayDuration">
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="<2">Less than 2 years</SelectItem>
                    <SelectItem value="2-5">2-5 years</SelectItem>
                    <SelectItem value="5+">5+ years</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-5 space-y-6">
          {/* Live Summary Card */}
          <div className="lg:sticky lg:top-6">
            <Card className="bg-white rounded-xl shadow-sm">
              <CardHeader className="pb-2 p-6">
                <CardTitle className="text-[#2B2D42]">Your Home Search Summary</CardTitle>
                <CardDescription>
                  Based on your preferences, here's what we understand about your ideal home.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 p-6 pt-0">
                {locations.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-[#2B2D42]">Target Locations</h3>
                    <p className="text-sm text-muted-foreground">{locations.join(", ")}</p>
                    {locationNotes && <p className="text-xs text-muted-foreground mt-1 italic">"{locationNotes}"</p>}
                  </div>
                )}

                {(minPrice !== "no-min" || maxPrice !== "no-max") && (
                  <div>
                    <h3 className="text-sm font-medium text-[#2B2D42]">Price Range</h3>
                    <p className="text-sm text-muted-foreground">
                      {formatPrice(minPrice)} - {formatPrice(maxPrice)}
                    </p>
                  </div>
                )}

                {propertyTypes.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-[#2B2D42]">Property Types</h3>
                    <p className="text-sm text-muted-foreground">
                      {propertyTypes.map((type) => propertyTypeMap[type] || type).join(", ")}
                    </p>
                  </div>
                )}

                {(minBeds !== "any" || minBaths !== "any") && (
                  <div>
                    <h3 className="text-sm font-medium text-[#2B2D42]">Bedroom & Bathroom Preferences</h3>
                    <p className="text-sm text-muted-foreground">
                      {minBeds !== "any" ? `${minBeds}+ Beds` : "Any number of beds"}
                      {minBaths !== "any" ? `, ${minBaths}+ Baths` : ", Any number of baths"}
                    </p>
                  </div>
                )}

                {(household.adults || household.children || household.pets) && (
                  <div>
                    <h3 className="text-sm font-medium text-[#2B2D42]">Household</h3>
                    <p className="text-sm text-muted-foreground">
                      {[
                        household.adults ? "Adults" : null,
                        household.children ? "Children" : null,
                        household.pets ? "Pets" : null,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                    {(accessibility.wheelchair || accessibility.singleLevel || accessibility.other) && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Accessibility:{" "}
                        {[
                          accessibility.wheelchair ? "Wheelchair access" : null,
                          accessibility.singleLevel ? "Single-level" : null,
                          accessibility.other ? "Other" : null,
                        ]
                          .filter(Boolean)
                          .join(", ")}
                      </p>
                    )}
                    {hostGuests && (
                      <p className="text-xs text-muted-foreground mt-1">Frequently hosts overnight guests</p>
                    )}
                  </div>
                )}

                <div>
                  <h3 className="text-sm font-medium text-[#2B2D42]">Home Features</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {willingToRenovate === 0
                      ? "Not willing to renovate"
                      : willingToRenovate === 100
                        ? "Completely willing to renovate"
                        : `${willingToRenovate}% willing to renovate`}
                  </p>
                  {(features.garage || features.outdoorSpace || features.homeOffice) && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Features:{" "}
                      {[
                        features.garage ? "Garage" : null,
                        features.outdoorSpace ? "Outdoor space" : null,
                        features.homeOffice ? "Home office" : null,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  )}
                  {homeAge.length > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">Home Age: {homeAge.join(", ")}</p>
                  )}
                  {sustainability.length > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">Sustainability: {sustainability.join(", ")}</p>
                  )}
                </div>

                {(neighborhoodVibe.length > 0 || nearby.length > 0) && (
                  <div>
                    <h3 className="text-sm font-medium text-[#2B2D42]">Location Priorities</h3>
                    {neighborhoodVibe.length > 0 && (
                      <p className="text-sm text-muted-foreground">Vibe: {neighborhoodVibe.join(", ")}</p>
                    )}
                    {nearby.length > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">Nearby: {nearby.join(", ")}</p>
                    )}
                    {developmentConcerns && (
                      <p className="text-xs text-muted-foreground mt-1 italic">"Concerns: {developmentConcerns}"</p>
                    )}
                  </div>
                )}

                {/* Additional Considerations Summary */}
                {(schoolImportant || limitCommute || maxHOA || workFromHome) && (
                  <div>
                    <h3 className="text-sm font-medium text-[#2B2D42]">Additional Considerations</h3>
                    {schoolImportant && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Schools: Rating above {schoolRating}
                        {preferredSchools && `, Preferred: ${preferredSchools}`}
                      </p>
                    )}
                    {limitCommute && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Commute: Max {commuteTime} minutes
                        {commuteAddress && ` to ${commuteAddress}`}
                      </p>
                    )}
                    {maxHOA && <p className="text-xs text-muted-foreground mt-1">Max HOA/fees: {maxHOA}</p>}
                    {workFromHome && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Works from home{dedicatedOffice ? ", dedicated office essential" : ""}
                      </p>
                    )}
                  </div>
                )}

                <div>
                  <h3 className="text-sm font-medium text-[#2B2D42]">Timeline & Intent</h3>
                  <p className="text-sm text-muted-foreground">Looking to buy in {formatTimeline(timeline)}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Purpose:{" "}
                    {purpose === "primary" ? "Primary Home" : purpose === "investment" ? "Investment" : "Vacation"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Planning to stay:{" "}
                    {stayDuration === "<2" ? "Less than 2 years" : stayDuration === "2-5" ? "2-5 years" : "5+ years"}
                  </p>
                </div>

                <Separator />

                <div className="rounded-lg bg-[#EF8354]/10 p-4">
                  <div className="flex items-start gap-2">
                    <Home className="h-5 w-5 text-[#EF8354] mt-0.5" />
                    <div>
                      <p className="font-medium text-[#EF8354]">Your Ideal Home</p>
                      <p className="text-sm mt-1">
                        {propertyTypes.length > 0
                          ? propertyTypes.map((type) => propertyTypeMap[type] || type).join(" or ")
                          : "Home"}
                        {locations.length > 0 ? ` in ${locations.join(" or ")}` : ""}
                        {neighborhoodVibe.length > 0 ? ` with a ${neighborhoodVibe.join("/")} vibe` : ""}
                        {minBeds !== "any" ? ` with ${minBeds}+ beds` : ""}
                        {minBaths !== "any" ? ` and ${minBaths}+ baths` : ""}
                        {nearby.length > 0 ? `, near ${nearby.join(", ")}` : ""}
                        {timeline === 0
                          ? ", looking to buy immediately"
                          : timeline === 12
                            ? ", looking to buy in 12+ months"
                            : `, looking to buy in ${timeline} months`}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI Assistant */}
            <Card className="bg-white rounded-xl shadow-sm mt-6">
              <CardHeader className="pb-2 p-6">
                <CardTitle className="flex items-center gap-2 text-[#2B2D42]">
                  <HelpCircle className="h-5 w-5 text-[#EF8354]" />
                  AI Assistant
                </CardTitle>
                <CardDescription>Ask questions about your home search.</CardDescription>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <div className="rounded-lg border p-4 h-[300px] flex flex-col">
                  <div className="flex-1 space-y-4 overflow-auto">
                    {aiConversation.map((message, index) => (
                      <div key={index} className="flex gap-3">
                        <div
                          className={`h-8 w-8 rounded-full ${
                            message.role === "assistant"
                              ? "bg-[#EF8354]/20 text-[#EF8354]"
                              : "bg-primary/20 text-primary"
                          } flex items-center justify-center text-sm font-medium`}
                        >
                          {message.role === "assistant" ? "AI" : "You"}
                        </div>
                        <div className="bg-muted rounded-lg p-3 text-sm max-w-[80%]">
                          <p>{message.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Input
                      placeholder="Ask a question..."
                      value={aiMessage}
                      onChange={(e) => setAiMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && aiMessage.trim()) {
                          handleSendAiMessage()
                        }
                      }}
                    />
                    <Button
                      className="bg-[#EF8354] hover:bg-[#EF8354]/90"
                      onClick={handleSendAiMessage}
                      disabled={!aiMessage.trim()}
                    >
                      Send
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 mt-8">
        <Button variant="outline" asChild className="border-primary text-primary hover:bg-primary/5">
          <Link href="/dashboard/pre-qualification">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Previous: Pre-Qualification
          </Link>
        </Button>
        <Button onClick={handleNextStep} className="bg-[#EF8354] hover:bg-[#EF8354]/90">
          Next: Property Search
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
