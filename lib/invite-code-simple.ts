// Simple, direct invite code system with extensive logging

// Type definitions
export type InviteCode = {
  code: string
  email: string
  realtorId: string
  buyerName?: string
  status: "pending" | "used"
  createdAt: string
  usedAt?: string
}

// Storage key
const STORAGE_KEY = "buyhome_invite_codes_v2"

// Initialize storage
export function initStorage(): void {
  console.log("[INVITE_SIMPLE] Initializing storage")
  if (typeof window === "undefined") return

  try {
    const existing = localStorage.getItem(STORAGE_KEY)
    if (!existing) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([]))
      console.log("[INVITE_SIMPLE] Created new storage")
    } else {
      console.log("[INVITE_SIMPLE] Storage already exists")
    }
  } catch (error) {
    console.error("[INVITE_SIMPLE] Error initializing storage:", error)
  }
}

// Get all codes
export function getAllCodes(): InviteCode[] {
  console.log("[INVITE_SIMPLE] Getting all codes")
  if (typeof window === "undefined") return []

  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (!data) return []

    const codes = JSON.parse(data)
    console.log(`[INVITE_SIMPLE] Found ${codes.length} codes`)
    return codes
  } catch (error) {
    console.error("[INVITE_SIMPLE] Error getting codes:", error)
    return []
  }
}

// Save all codes
function saveCodes(codes: InviteCode[]): void {
  console.log(`[INVITE_SIMPLE] Saving ${codes.length} codes`)
  if (typeof window === "undefined") return

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(codes))
    console.log("[INVITE_SIMPLE] Codes saved successfully")
  } catch (error) {
    console.error("[INVITE_SIMPLE] Error saving codes:", error)
  }
}

// Generate a random code
function generateCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let code = ""
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

// Create a new invite code
export function createCode(email: string, realtorId: string, buyerName?: string): InviteCode {
  console.log(`[INVITE_SIMPLE] Creating code for ${email}, realtorId: ${realtorId}`)

  const code = generateCode()
  const newCode: InviteCode = {
    code,
    email: email.toLowerCase().trim(),
    realtorId,
    buyerName,
    status: "pending",
    createdAt: new Date().toISOString(),
  }

  const codes = getAllCodes()
  codes.push(newCode)
  saveCodes(codes)

  console.log(`[INVITE_SIMPLE] Created code: ${code}`)
  return newCode
}

// Find a code by its value
export function findCode(code: string): InviteCode | null {
  if (!code || typeof window === "undefined") return null

  const normalizedCode = code.trim().toUpperCase()
  console.log(`[INVITE_SIMPLE] Looking for code: ${normalizedCode}`)

  const codes = getAllCodes()

  for (const invite of codes) {
    const inviteCode = invite.code.trim().toUpperCase()
    console.log(`[INVITE_SIMPLE] Comparing with: ${inviteCode}`)

    if (inviteCode === normalizedCode) {
      console.log(`[INVITE_SIMPLE] Found matching code:`, invite)
      return invite
    }
  }

  console.log(`[INVITE_SIMPLE] No matching code found for: ${normalizedCode}`)
  return null
}

// Validate a code
export function validateCode(code: string): {
  valid: boolean
  realtorId: string | null
  message: string
  debugInfo: any
} {
  if (!code) {
    return {
      valid: false,
      realtorId: null,
      message: "Please enter an invite code",
      debugInfo: { reason: "No code provided" },
    }
  }

  const normalizedCode = code.trim().toUpperCase()
  console.log(`[INVITE_SIMPLE] Validating code: ${normalizedCode}`)

  // Special case for realtor code
  if (normalizedCode === "REALTOR") {
    return {
      valid: true,
      realtorId: null,
      message: "Valid realtor code",
      debugInfo: { special: "realtor_code" },
    }
  }

  const invite = findCode(normalizedCode)

  if (!invite) {
    return {
      valid: false,
      realtorId: null,
      message: "This invite code is not valid. Please check the code or contact your realtor.",
      debugInfo: { reason: "Code not found" },
    }
  }

  if (invite.status === "used") {
    return {
      valid: false,
      realtorId: invite.realtorId,
      message: "This invite code has already been used",
      debugInfo: { reason: "Code already used", invite },
    }
  }

  return {
    valid: true,
    realtorId: invite.realtorId,
    message: "Valid invite code",
    debugInfo: { invite },
  }
}

// Mark a code as used
export function markAsUsed(code: string): boolean {
  if (!code || typeof window === "undefined") return false

  const normalizedCode = code.trim().toUpperCase()
  console.log(`[INVITE_SIMPLE] Marking code as used: ${normalizedCode}`)

  const codes = getAllCodes()
  const index = codes.findIndex((invite) => invite.code.trim().toUpperCase() === normalizedCode)

  if (index === -1) {
    console.log(`[INVITE_SIMPLE] Code not found: ${normalizedCode}`)
    return false
  }

  codes[index].status = "used"
  codes[index].usedAt = new Date().toISOString()

  saveCodes(codes)
  console.log(`[INVITE_SIMPLE] Code marked as used: ${normalizedCode}`)
  return true
}

// Add a test code (for debugging)
export function addTestCode(code: string, email: string, realtorId: string): InviteCode {
  console.log(`[INVITE_SIMPLE] Adding test code: ${code}`)

  const newCode: InviteCode = {
    code,
    email,
    realtorId,
    status: "pending",
    createdAt: new Date().toISOString(),
  }

  const codes = getAllCodes()

  // Remove if exists
  const existingIndex = codes.findIndex((c) => c.code.trim().toUpperCase() === code.trim().toUpperCase())
  if (existingIndex >= 0) {
    codes.splice(existingIndex, 1)
  }

  codes.push(newCode)
  saveCodes(codes)

  console.log(`[INVITE_SIMPLE] Test code added: ${code}`)
  return newCode
}

// Clear all codes (for debugging)
export function clearAllCodes(): void {
  console.log("[INVITE_SIMPLE] Clearing all codes")
  if (typeof window === "undefined") return

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]))
    console.log("[INVITE_SIMPLE] All codes cleared")
  } catch (error) {
    console.error("[INVITE_SIMPLE] Error clearing codes:", error)
  }
}

// Initialize on import
initStorage()
