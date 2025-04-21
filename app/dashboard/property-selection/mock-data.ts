// Sample property data for demonstration
export const sampleProperties = [
  {
    id: "prop_1",
    mlsId: "12345",
    address: {
      full: "123 Main St, Austin, TX 78701",
      city: "Austin",
      state: "TX",
    },
    property: {
      bedrooms: 3,
      bathrooms: 2,
      area: 1800,
      type: "Single Family",
    },
    listPrice: 450000,
    photos: ["/placeholder.svg?height=400&width=600"],
    listDate: "2023-05-15",
    status: "active",
    virtualTourUrl: "https://example.com/tour/12345",
  },
  {
    id: "prop_2",
    mlsId: "23456",
    address: {
      full: "456 Oak Ave, Austin, TX 78704",
      city: "Austin",
      state: "TX",
    },
    property: {
      bedrooms: 4,
      bathrooms: 3,
      area: 2200,
      type: "Single Family",
    },
    listPrice: 575000,
    photos: ["/placeholder.svg?height=400&width=600"],
    listDate: "2023-06-01",
    status: "active",
    openHouse: [
      {
        date: "2023-07-15",
        startTime: "10:00 AM",
        endTime: "2:00 PM",
      },
    ],
  },
  {
    id: "prop_3",
    mlsId: "34567",
    address: {
      full: "789 Pine Ln, Austin, TX 78745",
      city: "Austin",
      state: "TX",
    },
    property: {
      bedrooms: 2,
      bathrooms: 2,
      area: 1200,
      type: "Condo",
    },
    listPrice: 325000,
    photos: ["/placeholder.svg?height=400&width=600"],
    listDate: "2023-06-10",
    status: "active",
  },
  {
    id: "prop_4",
    mlsId: "45678",
    address: {
      full: "101 River Rd, Austin, TX 78730",
      city: "Austin",
      state: "TX",
    },
    property: {
      bedrooms: 5,
      bathrooms: 4,
      area: 3500,
      type: "Single Family",
    },
    listPrice: 950000,
    photos: ["/placeholder.svg?height=400&width=600"],
    listDate: "2023-05-20",
    status: "pending",
  },
  {
    id: "prop_5",
    mlsId: "56789",
    address: {
      full: "222 Lake View Dr, Austin, TX 78732",
      city: "Austin",
      state: "TX",
    },
    property: {
      bedrooms: 4,
      bathrooms: 3.5,
      area: 2800,
      type: "Single Family",
    },
    listPrice: 750000,
    photos: ["/placeholder.svg?height=400&width=600"],
    listDate: "2023-06-05",
    status: "active",
    virtualTourUrl: "https://example.com/tour/56789",
    openHouse: [
      {
        date: "2023-07-22",
        startTime: "1:00 PM",
        endTime: "4:00 PM",
      },
    ],
  },
]

// Initialize the property workflow with sample data
export function initializePropertyWorkflow() {
  // Check if workflow data already exists
  const existingData = localStorage.getItem("buyhome_property_workflow")
  if (existingData) return

  // Get saved properties from Step 3
  const savedFromLocalStorage = localStorage.getItem("buyhome_saved_properties")
  let savedProps = savedFromLocalStorage ? JSON.parse(savedFromLocalStorage) : []

  // If no saved properties, use sample data
  if (savedProps.length === 0) {
    // Save sample properties to localStorage
    localStorage.setItem("buyhome_saved_properties", JSON.stringify(sampleProperties.slice(0, 3)))
    savedProps = sampleProperties.slice(0, 3)
  }

  // Initialize workflow with saved properties
  const workflowData = {
    saved: savedProps.map((prop) => ({
      ...prop,
      buyerStatus: "saved",
      selected: false,
      buyerNotes: "",
      agentNotes: "",
    })),
    viewingRequested: [
      {
        ...sampleProperties[3],
        buyerStatus: "viewing-requested",
        viewingStatus: "pending",
        selected: false,
        buyerNotes: "",
        agentNotes: "",
      },
    ],
    viewingScheduled: [
      {
        ...sampleProperties[4],
        buyerStatus: "viewing-scheduled",
        viewingStatus: "confirmed",
        viewingDate: "2023-07-25",
        selected: false,
        buyerNotes: "Looking forward to seeing this property. Need to check the backyard size.",
        agentNotes: "Great neighborhood with excellent schools. Recent renovations to kitchen and master bath.",
      },
    ],
    viewed: [],
    offerSubmitted: [],
    archived: [],
  }

  localStorage.setItem("buyhome_property_workflow", JSON.stringify(workflowData))
}
