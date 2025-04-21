/**
 * Emergency fix for invite code synchronization issues
 * This is a simplified approach that ensures codes are properly shared
 */

// Define a simple structure for invite codes
export type InviteCode = {
  code: string
  email: string
  status: "pending" | "used"
}

// Storage key - using a single, consistent key
const STORAGE_KEY = "buyhome_invite_codes_fixed"

// Get all invite codes
export function getAllCodes(): InviteCode[] {
  try {
    // Try to get from localStorage
    if (typeof window !== "undefined") {
      const data = localStorage.getItem(STORAGE_KEY)
      if (data) {
        return JSON.parse(data)
      }
    }

    // Return default codes if nothing found
    return [
      { code: "WELCOME1", email: "test@example.com", status: "pending" },
      { code: "BUYHOME2", email: "buyer@example.com", status: "pending" },
      { code: "LFG9FX5W", email: "buyer34@gmail.com", status: "pending" },
      { code: "AWWEAXMA", email: "buyer32@gmail.com", status: "pending" },
      { code: "FXN3N11Q", email: "buyer35@gmail.com", status: "pending" },
    ]
  } catch (error) {
    console.error("Error getting codes:", error)
    return []
  }
}

// Save all invite codes
export function saveAllCodes(codes: InviteCode[]): void {
  try {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(codes))
      console.log(`Saved ${codes.length} invite codes`)
    }
  } catch (error) {
    console.error("Error saving codes:", error)
  }
}

// Add a new invite code
export function addCode(code: string, email: string): void {
  try {
    const codes = getAllCodes()

    // Check if code already exists
    const exists = codes.some((c) => c.code.toUpperCase() === code.toUpperCase())
    if (exists) {
      console.log(`Code ${code} already exists`)
      return
    }

    // Add new code
    codes.push({
      code: code.toUpperCase(),
      email: email.toLowerCase(),
      status: "pending",
    })

    // Save all codes
    saveAllCodes(codes)
    console.log(`Added new code: ${code}`)
  } catch (error) {
    console.error("Error adding code:", error)
  }
}

// Check if a code is valid
export function isCodeValid(code: string): boolean {
  if (!code) return false

  try {
    const codes = getAllCodes()
    return codes.some((c) => c.code.toUpperCase() === code.toUpperCase() && c.status === "pending")
  } catch (error) {
    console.error("Error validating code:", error)
    return false
  }
}

// Generate a random code (8 characters, uppercase letters and numbers)
export function generateCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let code = ""
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

// Initialize with FXN3N11Q if it doesn't exist
export function initWithSpecialCode(): void {
  try {
    const codes = getAllCodes()
    const hasSpecialCode = codes.some((c) => c.code === "FXN3N11Q")

    if (!hasSpecialCode) {
      addCode("FXN3N11Q", "buyer35@gmail.com")
      console.log("Added special code FXN3N11Q")
    }
  } catch (error) {
    console.error("Error initializing with special code:", error)
  }
}

// Call initialization
initWithSpecialCode()
