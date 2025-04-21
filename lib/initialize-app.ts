// Initialize the app with test data
import { createInviteCode, initializeInviteCodesStorage } from "./invite-code-service"

export function initializeApp() {
  if (typeof window === "undefined") return

  console.log("[InitializeApp] Starting app initialization")

  try {
    // Initialize invite codes storage
    initializeInviteCodesStorage()

    // Check if we already have realtors
    const existingRealtors = localStorage.getItem("buyhome_all_realtors")
    if (!existingRealtors || JSON.parse(existingRealtors).length === 0) {
      console.log("[InitializeApp] No realtors found, creating test realtor")

      // Create a test realtor
      const testRealtor = {
        id: "r1",
        name: "Alex Rodriguez",
        email: "alex@buyhomeabc.xyz",
        password: "password123",
        buyers: [],
        pendingInvites: [],
        createdAt: new Date().toISOString(),
      }

      localStorage.setItem("buyhome_all_realtors", JSON.stringify([testRealtor]))

      // Create some test invite codes
      createInviteCode("test1@example.com", "r1", "Test User 1")
      createInviteCode("test2@example.com", "r1", "Test User 2")

      console.log("[InitializeApp] Created test realtor and invite codes")
    } else {
      console.log("[InitializeApp] Realtors already exist, skipping test data creation")
    }

    console.log("[InitializeApp] App initialization complete")
  } catch (error) {
    console.error("[InitializeApp] Error initializing app:", error)
  }
}
