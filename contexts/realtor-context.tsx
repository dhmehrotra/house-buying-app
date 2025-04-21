"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"

// Types
export type Buyer = {
  id: string
  name: string
  email: string
  currentStep: number // 1-9
  status: "Active" | "Completed" | "Inactive"
  inviteCode: string
  realtorId: string
  password?: string // Added for authentication
  onboardingGoals?: {
    preferredLocation: string
    budget: string
    timeframe: string
    propertyType: string
    mustHaveFeatures: string[]
  }
  needsAssessment?: {
    locations?: string[]
    locationNotes?: string
    household?: {
      adults: boolean
      children: boolean
      pets: boolean
    }
    accessibility?: {
      wheelchair: boolean
      singleLevel: boolean
      other: boolean
    }
    hostGuests?: boolean
    propertyTypes?: string[]
    willingToRenovate?: number
    features?: {
      garage: boolean
      outdoorSpace: boolean
      homeOffice: boolean
    }
    homeAge?: string[]
    sustainability?: string[]
    neighborhoodVibe?: string[]
    nearby?: string[]
    developmentConcerns?: string
    schoolImportant?: boolean
    schoolRating?: string
    preferredSchools?: string
    limitCommute?: boolean
    commuteAddress?: string
    commuteTime?: number
    maxHOA?: string
    workFromHome?: boolean
    dedicatedOffice?: boolean
    timeline?: number
    purpose?: string
    stayDuration?: string
  }
  savedProperties?: BuyerProperty[]
  viewingRequested?: BuyerProperty[]
  viewingScheduled?: BuyerProperty[]
  propertiesViewed?: BuyerProperty[]
  offerSubmitted?: BuyerProperty[]
  archivedProperties?: BuyerProperty[]
  createdAt: Date
}

export type BuyerProperty = {
  id: string
  mlsId: string
  address: {
    full: string
    street: string
    city: string
    state: string
    zip: string
  }
  price: number
  beds: number
  baths: number
  sqft: number
  lotSize?: number
  yearBuilt?: number
  description?: string
  features?: string[]
  status: "active" | "pending" | "sold"
  daysOnMarket?: number
  images: string[]
  buyerStatus?: string
  viewingStatus?: string
  offerStatus?: string
  buyerNotes?: string
  agentNotes?: string
}

export type Realtor = {
  id: string
  name: string
  email: string
  password?: string // Added for authentication
  buyers: string[] // Array of buyer IDs
  pendingInvites?: {
    email: string
    inviteCode: string
    createdAt: Date
  }[]
}

// Define a type for pending invites
export type PendingInvite = {
  email: string
  inviteCode: string
  realtorId: string
  createdAt: Date
}

type RealtorContextType = {
  realtor: Realtor | null
  setRealtor: (realtor: Realtor | null) => void
  buyers: Buyer[]
  setBuyers: (buyers: Buyer[]) => void
  addBuyer: (buyer: Omit<Buyer, "id" | "inviteCode" | "createdAt">) => Buyer
  updateBuyer: (id: string, updates: Partial<Buyer>) => void
  getBuyer: (id: string) => Buyer | undefined
  getBuyerProperties: (buyerId: string) => {
    savedProperties: BuyerProperty[]
    viewingRequested: BuyerProperty[]
    viewingScheduled: BuyerProperty[]
    propertiesViewed: BuyerProperty[]
    offerSubmitted: BuyerProperty[]
    archivedProperties: BuyerProperty[]
  }
  isLoading: boolean
  createInviteCode: (email: string, realtorId: string) => string
  validateInviteCode: (code: string) => { valid: boolean; realtorId: string | null }
  getAllRealtors: () => Realtor[]
  authenticateRealtor: (email: string, password: string) => Realtor | null
  pendingInvites: PendingInvite[]
  setPendingInvites: (invites: PendingInvite[]) => void
}

// Mock data for buyer properties
const mockProperties: BuyerProperty[] = [
  {
    id: "prop1",
    mlsId: "MLS12345",
    address: {
      full: "123 Main St, Austin, TX 78701",
      street: "123 Main St",
      city: "Austin",
      state: "TX",
      zip: "78701",
    },
    price: 450000,
    beds: 3,
    baths: 2,
    sqft: 1800,
    yearBuilt: 2010,
    status: "active",
    daysOnMarket: 14,
    images: ["/placeholder.svg?height=300&width=500"],
    buyerStatus: "saved",
  },
  {
    id: "prop2",
    mlsId: "MLS67890",
    address: {
      full: "456 Oak Ave, Austin, TX 78704",
      street: "456 Oak Ave",
      city: "Austin",
      state: "TX",
      zip: "78704",
    },
    price: 525000,
    beds: 4,
    baths: 3,
    sqft: 2200,
    yearBuilt: 2015,
    status: "active",
    daysOnMarket: 7,
    images: ["/placeholder.svg?height=300&width=500"],
    buyerStatus: "viewing-requested",
    viewingStatus: "pending",
  },
  {
    id: "prop3",
    mlsId: "MLS24680",
    address: {
      full: "789 Pine Ln, Austin, TX 78745",
      street: "789 Pine Ln",
      city: "Austin",
      state: "TX",
      zip: "78745",
    },
    price: 380000,
    beds: 2,
    baths: 2,
    sqft: 1500,
    yearBuilt: 2005,
    status: "active",
    daysOnMarket: 21,
    images: ["/placeholder.svg?height=300&width=500"],
    buyerStatus: "viewed",
    viewingStatus: "completed",
    buyerNotes: "Loved the backyard but kitchen needs updating.",
  },
]

// Initial mock data
const initialMockBuyers: Buyer[] = [
  {
    id: "b1",
    name: "John Smith",
    email: "john.smith@example.com",
    password: "password123",
    currentStep: 3,
    status: "Active",
    inviteCode: "JS123456",
    realtorId: "r1",
    onboardingGoals: {
      preferredLocation: "Downtown Austin",
      budget: "$400,000 - $500,000",
      timeframe: "3-6 months",
      propertyType: "Condo",
      mustHaveFeatures: ["Parking", "Gym", "Pet-friendly"],
    },
    needsAssessment: {
      locations: ["Downtown Austin", "South Congress"],
      locationNotes: "Prefer areas with good walkability and nightlife",
      household: {
        adults: true,
        children: false,
        pets: true,
      },
      accessibility: {
        wheelchair: false,
        singleLevel: true,
        other: false,
      },
      hostGuests: true,
      propertyTypes: ["Condo", "Townhouse"],
      willingToRenovate: 30,
      features: {
        garage: true,
        outdoorSpace: true,
        homeOffice: true,
      },
      homeAge: ["New (0-5 yrs)", "Mid-age (5-20 yrs)"],
      sustainability: ["Energy-efficient appliances", "Walkable area"],
      neighborhoodVibe: ["Urban", "Walkable"],
      nearby: ["Restaurants", "Public transport", "Entertainment"],
      developmentConcerns: "Concerned about construction noise in rapidly developing areas",
      schoolImportant: false,
      workFromHome: true,
      dedicatedOffice: true,
      timeline: 6,
      purpose: "primary",
      stayDuration: "5+",
    },
    savedProperties: [mockProperties[0]],
    viewingRequested: [mockProperties[1]],
    propertiesViewed: [mockProperties[2]],
    viewingScheduled: [],
    offerSubmitted: [],
    archivedProperties: [],
    createdAt: new Date(2023, 10, 15),
  },
  {
    id: "b2",
    name: "Sarah Johnson",
    email: "sarah.j@example.com",
    password: "password123",
    currentStep: 5,
    status: "Active",
    inviteCode: "SJ789012",
    realtorId: "r1",
    onboardingGoals: {
      preferredLocation: "North Austin",
      budget: "$550,000 - $650,000",
      timeframe: "1-3 months",
      propertyType: "Single Family Home",
      mustHaveFeatures: ["Backyard", "3+ bedrooms", "Good school district"],
    },
    savedProperties: [
      {
        ...mockProperties[0],
        id: "prop4",
        address: {
          ...mockProperties[0].address,
          full: "555 Elm St, Austin, TX 78731",
          street: "555 Elm St",
          zip: "78731",
        },
      },
    ],
    viewingRequested: [],
    viewingScheduled: [
      {
        ...mockProperties[1],
        id: "prop5",
        address: {
          ...mockProperties[1].address,
          full: "777 Maple Dr, Austin, TX 78759",
          street: "777 Maple Dr",
          zip: "78759",
        },
        buyerStatus: "viewing-scheduled",
        viewingStatus: "confirmed",
      },
    ],
    propertiesViewed: [],
    offerSubmitted: [],
    archivedProperties: [],
    createdAt: new Date(2023, 9, 22),
  },
]

const initialMockRealtors: Realtor[] = [
  {
    id: "r1",
    name: "Alex Rodriguez",
    email: "alex@buyhomeabc.xyz",
    password: "password123",
    buyers: ["b1", "b2"],
    pendingInvites: [],
  },
]

// Create context
const RealtorContext = createContext<RealtorContextType | undefined>(undefined)

export function RealtorProvider({ children }: { children: React.ReactNode }) {
  const [realtor, setRealtorState] = useState<Realtor | null>(null)
  const [buyers, setBuyersState] = useState<Buyer[]>([])
  const [realtors, setRealtorsState] = useState<Realtor[]>([])
  const [pendingInvites, setPendingInvitesState] = useState<PendingInvite[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Load data from localStorage
  useEffect(() => {
    // Only run in browser
    if (typeof window !== "undefined") {
      console.log("Loading data from localStorage")

      // Load realtor from localStorage
      const storedRealtor = localStorage.getItem("buyhome_realtor")
      if (storedRealtor) {
        try {
          const parsedRealtor = JSON.parse(storedRealtor)
          console.log("Loaded realtor:", parsedRealtor)
          setRealtorState(parsedRealtor)
        } catch (e) {
          console.error("Failed to parse realtor data:", e)
          localStorage.removeItem("buyhome_realtor")
        }
      }

      // Load all realtors from localStorage
      const storedRealtors = localStorage.getItem("buyhome_all_realtors")
      if (storedRealtors) {
        try {
          const parsedRealtors = JSON.parse(storedRealtors)
          console.log("Loaded all realtors:", parsedRealtors)
          setRealtorsState(parsedRealtors)
        } catch (e) {
          console.error("Failed to parse all realtors data:", e)
          // Initialize with mock data if parsing fails
          setRealtorsState(initialMockRealtors)
          localStorage.setItem("buyhome_all_realtors", JSON.stringify(initialMockRealtors))
        }
      } else {
        // Initialize with mock data if not found
        setRealtorsState(initialMockRealtors)
        localStorage.setItem("buyhome_all_realtors", JSON.stringify(initialMockRealtors))
      }

      // Load buyers from localStorage
      const storedBuyers = localStorage.getItem("buyhome_all_buyers")
      if (storedBuyers) {
        try {
          const parsedBuyers = JSON.parse(storedBuyers)
          console.log("Loaded all buyers:", parsedBuyers)
          setBuyersState(parsedBuyers)
        } catch (e) {
          console.error("Failed to parse all buyers data:", e)
          // Initialize with mock data if parsing fails
          setBuyersState(initialMockBuyers)
          localStorage.setItem("buyhome_all_buyers", JSON.stringify(initialMockBuyers))
        }
      } else {
        // Initialize with mock data if not found
        setBuyersState(initialMockBuyers)
        localStorage.setItem("buyhome_all_buyers", JSON.stringify(initialMockBuyers))
      }

      // Load pending invites from localStorage
      const storedPendingInvites = localStorage.getItem("buyhome_pending_invites")
      if (storedPendingInvites) {
        try {
          const parsedPendingInvites = JSON.parse(storedPendingInvites)
          console.log("Loaded pending invites:", parsedPendingInvites)
          setPendingInvitesState(parsedPendingInvites)
        } catch (e) {
          console.error("Failed to parse pending invites data:", e)
          // Initialize with empty array if parsing fails
          setPendingInvitesState([])
          localStorage.setItem("buyhome_pending_invites", JSON.stringify([]))
        }
      } else {
        // Initialize with empty array if not found
        setPendingInvitesState([])
        localStorage.setItem("buyhome_pending_invites", JSON.stringify([]))
      }

      setIsLoading(false)
    }
  }, [])

  // Fix the setRealtor function to prevent infinite loops
  const setRealtor = (newRealtor: Realtor | null) => {
    try {
      console.log("Setting realtor:", newRealtor)

      // Only update state if the realtor has changed
      if (JSON.stringify(realtor) !== JSON.stringify(newRealtor)) {
        setRealtorState(newRealtor)
      }

      if (newRealtor) {
        // Directly save to localStorage to ensure it's saved
        localStorage.setItem("buyhome_realtor", JSON.stringify(newRealtor))

        // Don't update realtors state here - let the useEffect handle it
        // This prevents the infinite loop
      }
    } catch (e) {
      console.error("Error in setRealtor:", e)
    }
  }

  // Set pending invites with proper state update
  const setPendingInvites = (newPendingInvites: PendingInvite[]) => {
    console.log("Setting pending invites:", newPendingInvites)
    setPendingInvitesState(newPendingInvites)

    // Save to localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("buyhome_pending_invites", JSON.stringify(newPendingInvites))
    }
  }

  // Fix the useEffect dependencies to prevent infinite loops
  // Replace the existing useEffect for saving realtor with this:
  useEffect(() => {
    if (typeof window !== "undefined" && realtor) {
      try {
        console.log("Saving realtor to localStorage:", realtor)
        localStorage.setItem("buyhome_realtor", JSON.stringify(realtor))

        // Update realtors list without triggering a re-render if possible
        const realtorExists = realtors.some((r) => r.id === realtor.id)
        const realtorChanged = !realtors.some(
          (r) => r.id === realtor.id && JSON.stringify(r) === JSON.stringify(realtor),
        )

        // Only update realtors if the realtor doesn't exist or has changed
        if (!realtorExists || realtorChanged) {
          const updatedRealtors = realtorExists
            ? realtors.map((r) => (r.id === realtor.id ? realtor : r))
            : [...realtors, realtor]

          // Only update state if realtors have actually changed
          if (JSON.stringify(updatedRealtors) !== JSON.stringify(realtors)) {
            setRealtorsState(updatedRealtors)
            localStorage.setItem("buyhome_all_realtors", JSON.stringify(updatedRealtors))
          }
        }
      } catch (e) {
        console.error("Error saving realtor to localStorage:", e)
      }
    }
  }, [realtor]) // Only depend on realtor, not realtors

  // Save all realtors to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== "undefined" && realtors.length > 0) {
      try {
        console.log("Saving all realtors to localStorage:", realtors)
        localStorage.setItem("buyhome_all_realtors", JSON.stringify(realtors))
      } catch (e) {
        console.error("Error saving all realtors to localStorage:", e)
      }
    }
  }, [realtors])

  // Save all buyers to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== "undefined" && buyers.length > 0) {
      try {
        console.log("Saving all buyers to localStorage:", buyers)
        localStorage.setItem("buyhome_all_buyers", JSON.stringify(buyers))
      } catch (e) {
        console.error("Error saving all buyers to localStorage:", e)
      }
    }
  }, [buyers])

  // Save pending invites to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        console.log("Saving pending invites to localStorage:", pendingInvites)
        localStorage.setItem("buyhome_pending_invites", JSON.stringify(pendingInvites))
      } catch (e) {
        console.error("Error saving pending invites to localStorage:", e)
      }
    }
  }, [pendingInvites])

  // Set buyers with proper state update
  const setBuyers = (newBuyers: Buyer[]) => {
    console.log("Setting buyers:", newBuyers)
    setBuyersState(newBuyers)
  }

  // Add a new buyer
  const addBuyer = (buyerData: Omit<Buyer, "id" | "inviteCode" | "createdAt">) => {
    console.log("Adding new buyer:", buyerData)

    // Generate a random invite code
    const generateInviteCode = () => {
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
      let code = ""
      for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length))
      }
      return code
    }

    const newBuyer: Buyer = {
      ...buyerData,
      id: `b${Date.now()}`,
      inviteCode: generateInviteCode(),
      savedProperties: [],
      viewingRequested: [],
      viewingScheduled: [],
      propertiesViewed: [],
      offerSubmitted: [],
      archivedProperties: [],
      createdAt: new Date(),
    }

    // Update buyers state
    const updatedBuyers = [...buyers, newBuyer]
    setBuyersState(updatedBuyers)

    // Save to localStorage
    localStorage.setItem("buyhome_all_buyers", JSON.stringify(updatedBuyers))

    // Update realtor's buyers list if a realtor is logged in
    if (realtor) {
      const updatedRealtor = {
        ...realtor,
        buyers: [...realtor.buyers, newBuyer.id],
      }
      setRealtorState(updatedRealtor)

      // Update in realtors list
      const updatedRealtors = realtors.map((r) => (r.id === realtor.id ? updatedRealtor : r))
      setRealtorsState(updatedRealtors)

      // Save to localStorage
      localStorage.setItem("buyhome_realtor", JSON.stringify(updatedRealtor))
      localStorage.setItem("buyhome_all_realtors", JSON.stringify(updatedRealtors))
    }

    return newBuyer
  }

  // Update a buyer
  const updateBuyer = (id: string, updates: Partial<Buyer>) => {
    console.log("Updating buyer:", id, updates)

    const updatedBuyers = buyers.map((buyer) => (buyer.id === id ? { ...buyer, ...updates } : buyer))

    setBuyersState(updatedBuyers)
    localStorage.setItem("buyhome_all_buyers", JSON.stringify(updatedBuyers))
  }

  // Get a buyer by ID
  const getBuyer = (id: string) => {
    return buyers.find((buyer) => buyer.id === id)
  }

  // Get buyer properties
  const getBuyerProperties = (buyerId: string) => {
    const buyer = getBuyer(buyerId)
    return {
      savedProperties: buyer?.savedProperties || [],
      viewingRequested: buyer?.viewingRequested || [],
      viewingScheduled: buyer?.viewingScheduled || [],
      propertiesViewed: buyer?.propertiesViewed || [],
      offerSubmitted: buyer?.offerSubmitted || [],
      archivedProperties: buyer?.archivedProperties || [],
    }
  }

  // Create an invite code for a buyer
  const createInviteCode = (email: string, realtorId: string) => {
    console.log("Creating invite code for:", email, "realtorId:", realtorId)

    // Generate a random invite code
    const generateInviteCode = () => {
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
      let code = ""
      for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length))
      }
      return code
    }

    const inviteCode = generateInviteCode()

    // Find the realtor
    const realtorToUpdate = realtors.find((r) => r.id === realtorId)

    if (realtorToUpdate) {
      // Add the invite to the realtor's pending invites
      const pendingInvitesForRealtor = realtorToUpdate.pendingInvites || []
      const updatedInvites = [
        ...pendingInvitesForRealtor,
        {
          email,
          inviteCode,
          createdAt: new Date(),
        },
      ]

      // Update the realtor
      const updatedRealtor = {
        ...realtorToUpdate,
        pendingInvites: updatedInvites,
      }

      // Update in realtors list
      const updatedRealtors = realtors.map((r) => (r.id === realtorId ? updatedRealtor : r))

      setRealtorsState(updatedRealtors)

      // If this is the current logged in realtor, update that too
      if (realtor && realtor.id === realtorId) {
        setRealtorState(updatedRealtor)
      }

      // Save to localStorage
      localStorage.setItem("buyhome_all_realtors", JSON.stringify(updatedRealtors))

      // Also store in the pendingInvites state
      const newPendingInvite: PendingInvite = {
        email,
        inviteCode,
        realtorId,
        createdAt: new Date(),
      }

      const updatedPendingInvites = [...pendingInvites, newPendingInvite]
      setPendingInvites(updatedPendingInvites)

      console.log("Created invite code:", inviteCode, "for email:", email)
    } else {
      console.error("Realtor not found:", realtorId)
    }

    return inviteCode
  }

  // Validate an invite code
  const validateInviteCode = (code: string) => {
    console.log("Validating invite code:", code)

    // Check in the buyers list
    const buyerWithCode = buyers.find((buyer) => buyer.inviteCode === code)
    if (buyerWithCode) {
      console.log("Found buyer with code:", buyerWithCode)
      return { valid: true, realtorId: buyerWithCode.realtorId }
    }

    // Check in the realtors' pending invites
    for (const r of realtors) {
      if (r.pendingInvites) {
        const invite = r.pendingInvites.find((inv) => inv.inviteCode === code)
        if (invite) {
          console.log("Found pending invite in realtor:", invite, "for realtor:", r.id)
          return { valid: true, realtorId: r.id }
        }
      }
    }

    // Check in the pendingInvites state
    const pendingInviteWithCode = pendingInvites.find((invite) => invite.inviteCode === code)
    if (pendingInviteWithCode) {
      console.log("Found pending invite in state:", pendingInviteWithCode)
      return { valid: true, realtorId: pendingInviteWithCode.realtorId }
    }

    console.log("No valid invite code found")
    return { valid: false, realtorId: null }
  }

  // Get all realtors
  const getAllRealtors = () => {
    return realtors
  }

  // Authenticate a realtor
  const authenticateRealtor = (email: string, password: string) => {
    console.log("Authenticating realtor:", email)

    // Find the realtor by email
    const foundRealtor = realtors.find((r) => r.email.toLowerCase() === email.toLowerCase() && r.password === password)

    if (foundRealtor) {
      console.log("Realtor authenticated:", foundRealtor)
      return foundRealtor
    }

    // Check in buyhome_login as a fallback
    if (typeof window !== "undefined") {
      const savedLoginData = localStorage.getItem("buyhome_login")
      if (savedLoginData) {
        try {
          const savedLogin = JSON.parse(savedLoginData)
          if (
            savedLogin.email.toLowerCase() === email.toLowerCase() &&
            savedLogin.password === password &&
            savedLogin.role === "realtor"
          ) {
            // Try to find the realtor by email only (in case password was updated)
            const realtorByEmail = realtors.find((r) => r.email.toLowerCase() === email.toLowerCase())

            if (realtorByEmail) {
              // Update the password in the stored realtor
              const updatedRealtor = {
                ...realtorByEmail,
                password: password,
              }

              // Update in realtors list
              const updatedRealtors = realtors.map((r) => (r.id === updatedRealtor.id ? updatedRealtor : r))

              setRealtorsState(updatedRealtors)
              localStorage.setItem("buyhome_all_realtors", JSON.stringify(updatedRealtors))

              return updatedRealtor
            }
          }
        } catch (e) {
          console.error("Failed to parse saved login data:", e)
        }
      }
    }

    console.log("Realtor authentication failed")
    return null
  }

  return (
    <RealtorContext.Provider
      value={{
        realtor,
        setRealtor,
        buyers,
        setBuyers,
        addBuyer,
        updateBuyer,
        getBuyer,
        getBuyerProperties,
        isLoading,
        createInviteCode,
        validateInviteCode,
        getAllRealtors,
        authenticateRealtor,
        pendingInvites,
        setPendingInvites,
      }}
    >
      {children}
    </RealtorContext.Provider>
  )
}

export function useRealtor() {
  const context = useContext(RealtorContext)
  if (context === undefined) {
    throw new Error("useRealtor must be used within a RealtorProvider")
  }
  return context
}

// Helper function to get mock realtor by email
export function getMockRealtorByEmail(email: string): Realtor | null {
  // Try to get from localStorage first
  if (typeof window !== "undefined") {
    const storedRealtors = localStorage.getItem("buyhome_all_realtors")
    if (storedRealtors) {
      try {
        const realtors = JSON.parse(storedRealtors)
        const foundRealtor = realtors.find((r: Realtor) => r.email.toLowerCase() === email.toLowerCase())
        if (foundRealtor) {
          console.log("Found realtor by email in localStorage:", foundRealtor)
          return foundRealtor
        }
      } catch (e) {
        console.error("Failed to parse realtors from localStorage:", e)
      }
    }
  }

  // Fallback to initial mock data
  const foundRealtor = initialMockRealtors.find((r) => r.email.toLowerCase() === email.toLowerCase())
  console.log("Found realtor by email in initial data:", foundRealtor)
  return foundRealtor || null
}
