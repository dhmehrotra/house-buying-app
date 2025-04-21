// A dedicated service to handle invite code operations
// This centralizes all invite code logic in one place

// Type for pending invites
export type PendingInvite = {
  email: string
  inviteCode: string
  realtorId: string
  createdAt: string // ISO string for better serialization
}

const STORAGE_KEY = "buyhome_invite_codes"

// Get all invite codes from localStorage
export function getAllInviteCodes(): PendingInvite[] {
  if (typeof window === "undefined") return []

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []

    const parsed = JSON.parse(stored)
    console.log("Retrieved invite codes from storage:", parsed)
    return Array.isArray(parsed) ? parsed : []
  } catch (error) {
    console.error("Error retrieving invite codes:", error)
    return []
  }
}

// Save all invite codes to localStorage
export function saveAllInviteCodes(codes: PendingInvite[]): void {
  if (typeof window === "undefined") return

  try {
    // Ensure dates are serialized as strings
    const codesToSave = codes.map((code) => ({
      ...code,
      createdAt: typeof code.createdAt === "string" ? code.createdAt : new Date(code.createdAt).toISOString(),
    }))

    localStorage.setItem(STORAGE_KEY, JSON.stringify(codesToSave))
    console.log("Saved invite codes to storage:", codesToSave)
  } catch (error) {
    console.error("Error saving invite codes:", error)
  }
}

// Generate a new invite code
export function generateInviteCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let code = ""
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

// Create and save a new invite code
export function createInviteCode(email: string, realtorId: string): string {
  const code = generateInviteCode()

  const newInvite: PendingInvite = {
    email,
    inviteCode: code,
    realtorId,
    createdAt: new Date().toISOString(),
  }

  const existingCodes = getAllInviteCodes()
  const updatedCodes = [...existingCodes, newInvite]

  saveAllInviteCodes(updatedCodes)

  // Also save to the realtor's pending invites for backward compatibility
  try {
    const storedRealtors = localStorage.getItem("buyhome_all_realtors")
    if (storedRealtors) {
      const realtors = JSON.parse(storedRealtors)
      const realtorIndex = realtors.findIndex((r: any) => r.id === realtorId)

      if (realtorIndex >= 0) {
        const realtor = realtors[realtorIndex]
        const pendingInvites = realtor.pendingInvites || []

        realtor.pendingInvites = [
          ...pendingInvites,
          {
            email,
            inviteCode: code,
            createdAt: new Date().toISOString(),
          },
        ]

        realtors[realtorIndex] = realtor
        localStorage.setItem("buyhome_all_realtors", JSON.stringify(realtors))

        // Update current realtor if logged in
        const currentRealtor = localStorage.getItem("buyhome_realtor")
        if (currentRealtor) {
          const parsedRealtor = JSON.parse(currentRealtor)
          if (parsedRealtor.id === realtorId) {
            parsedRealtor.pendingInvites = realtor.pendingInvites
            localStorage.setItem("buyhome_realtor", JSON.stringify(parsedRealtor))
          }
        }
      }
    }
  } catch (error) {
    console.error("Error updating realtor with invite code:", error)
  }

  return code
}

// Validate an invite code
export function validateInviteCode(code: string): { valid: boolean; realtorId: string | null } {
  if (!code) return { valid: false, realtorId: null }

  // Normalize the code for comparison
  const normalizedCode = code.trim().toUpperCase()

  // Check in the centralized invite codes storage
  const allCodes = getAllInviteCodes()
  const matchingInvite = allCodes.find((invite) => invite.inviteCode.trim().toUpperCase() === normalizedCode)

  if (matchingInvite) {
    console.log("Found matching invite code in central storage:", matchingInvite)
    return { valid: true, realtorId: matchingInvite.realtorId }
  }

  // Fallback: Check in the realtors' pending invites
  try {
    const storedRealtors = localStorage.getItem("buyhome_all_realtors")
    if (storedRealtors) {
      const realtors = JSON.parse(storedRealtors)

      for (const realtor of realtors) {
        if (realtor.pendingInvites && Array.isArray(realtor.pendingInvites)) {
          const invite = realtor.pendingInvites.find(
            (inv: any) => inv.inviteCode && inv.inviteCode.trim().toUpperCase() === normalizedCode,
          )

          if (invite) {
            console.log("Found matching invite code in realtor pending invites:", invite, "for realtor:", realtor.id)
            return { valid: true, realtorId: realtor.id }
          }
        }
      }
    }
  } catch (error) {
    console.error("Error checking realtors for invite code:", error)
  }

  // Fallback: Check in buyers list (in case it's a reused code)
  try {
    const storedBuyers = localStorage.getItem("buyhome_all_buyers")
    if (storedBuyers) {
      const buyers = JSON.parse(storedBuyers)
      const buyerWithCode = buyers.find(
        (buyer: any) => buyer.inviteCode && buyer.inviteCode.trim().toUpperCase() === normalizedCode,
      )

      if (buyerWithCode) {
        console.log("Found matching invite code in existing buyers:", buyerWithCode)
        return { valid: true, realtorId: buyerWithCode.realtorId }
      }
    }
  } catch (error) {
    console.error("Error checking buyers for invite code:", error)
  }

  console.log("No valid invite code found for:", normalizedCode)
  return { valid: false, realtorId: null }
}
