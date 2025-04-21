/**
 * Production-ready invite code service
 * Uses robust storage service to ensure consistent behavior across environments
 */

import { getObject, setObject, STORAGE_KEYS, dumpAllStorage } from "./storage-service"

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

// Initialize storage
export function initStorage(): void {
  console.log("[InviteCodeProd] Initializing storage")

  try {
    // Check if our primary storage exists
    const existingCodes = getObject<InviteCode[]>(STORAGE_KEYS.INVITE_CODES)

    if (!existingCodes) {
      // Create empty array
      setObject(STORAGE_KEYS.INVITE_CODES, [])
      console.log("[InviteCodeProd] Created new primary storage")

      // Migrate from legacy systems
      migrateFromLegacySystems()
    } else {
      console.log(`[InviteCodeProd] Found ${existingCodes.length} codes in primary storage`)
    }
  } catch (error) {
    console.error("[InviteCodeProd] Error initializing storage:", error)
  }
}

// Migrate from legacy systems
function migrateFromLegacySystems(): void {
  console.log("[InviteCodeProd] Checking for legacy data to migrate")

  try {
    const allCodes: InviteCode[] = []

    // Check legacy storage
    const legacyCodes = getObject<any[]>(STORAGE_KEYS.INVITE_CODES_LEGACY)
    if (legacyCodes && Array.isArray(legacyCodes)) {
      console.log(`[InviteCodeProd] Found ${legacyCodes.length} codes in legacy storage`)

      // Convert to our format if needed
      const convertedCodes = legacyCodes.map((code: any) => ({
        code: code.code || code.inviteCode,
        email: code.email,
        realtorId: code.realtorId,
        buyerName: code.buyerName,
        status: code.status || "pending",
        createdAt: code.createdAt || new Date().toISOString(),
      }))

      allCodes.push(...convertedCodes)
    }

    // Check pending invites
    const pendingInvites = getObject<any[]>(STORAGE_KEYS.PENDING_INVITES)
    if (pendingInvites && Array.isArray(pendingInvites)) {
      console.log(`[InviteCodeProd] Found ${pendingInvites.length} codes in pending invites`)

      // Convert to our format
      const convertedCodes = pendingInvites.map((invite: any) => ({
        code: invite.inviteCode,
        email: invite.email,
        realtorId: invite.realtorId,
        status: "pending",
        createdAt: invite.createdAt || new Date().toISOString(),
      }))

      allCodes.push(...convertedCodes)
    }

    // Check realtors for pending invites
    const realtors = getObject<any[]>(STORAGE_KEYS.REALTORS)
    if (realtors && Array.isArray(realtors)) {
      console.log(`[InviteCodeProd] Checking ${realtors.length} realtors for pending invites`)

      for (const realtor of realtors) {
        if (realtor.pendingInvites && Array.isArray(realtor.pendingInvites)) {
          console.log(`[InviteCodeProd] Realtor ${realtor.id} has ${realtor.pendingInvites.length} pending invites`)

          // Convert to our format
          const convertedCodes = realtor.pendingInvites.map((invite: any) => ({
            code: invite.inviteCode,
            email: invite.email,
            realtorId: realtor.id,
            status: "pending",
            createdAt: invite.createdAt || new Date().toISOString(),
          }))

          allCodes.push(...convertedCodes)
        }
      }
    }

    // Remove duplicates by code
    const uniqueCodes: InviteCode[] = []
    const seenCodes = new Set<string>()

    for (const code of allCodes) {
      if (code.code && !seenCodes.has(code.code.toUpperCase())) {
        seenCodes.add(code.code.toUpperCase())
        uniqueCodes.push(code)
      }
    }

    console.log(`[InviteCodeProd] Migrated ${uniqueCodes.length} unique codes from legacy systems`)

    // Save to our primary storage
    if (uniqueCodes.length > 0) {
      saveCodes(uniqueCodes)
    }
  } catch (error) {
    console.error("[InviteCodeProd] Error migrating from legacy systems:", error)
  }
}

// Get all codes
export function getAllCodes(): InviteCode[] {
  console.log("[InviteCodeProd] Getting all codes")

  try {
    const codes = getObject<InviteCode[]>(STORAGE_KEYS.INVITE_CODES)
    if (!codes) {
      console.log("[InviteCodeProd] No codes found in primary storage")
      return []
    }

    console.log(`[InviteCodeProd] Found ${codes.length} codes in primary storage`)
    return codes
  } catch (error) {
    console.error("[InviteCodeProd] Error getting codes:", error)
    return []
  }
}

// Save all codes
function saveCodes(codes: InviteCode[]): void {
  console.log(`[InviteCodeProd] Saving ${codes.length} codes to primary storage`)

  try {
    // Save to primary storage
    setObject(STORAGE_KEYS.INVITE_CODES, codes)
    console.log("[InviteCodeProd] Codes saved successfully")

    // Also save to legacy storage for compatibility
    setObject(STORAGE_KEYS.INVITE_CODES_LEGACY, codes)
  } catch (error) {
    console.error("[InviteCodeProd] Error saving codes:", error)
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
  console.log(`[InviteCodeProd] Creating code for ${email}, realtorId: ${realtorId}`)

  const code = generateCode()
  const newCode: InviteCode = {
    code,
    email: email.toLowerCase().trim(),
    realtorId,
    buyerName,
    status: "pending",
    createdAt: new Date().toISOString(),
  }

  // Get existing codes
  const codes = getAllCodes()

  // Add new code
  codes.push(newCode)

  // Save all codes
  saveCodes(codes)

  console.log(`[InviteCodeProd] Created code: ${code}`)

  // Also save to legacy systems for compatibility
  try {
    // Save to pending invites
    const pendingInvites = getObject<any[]>(STORAGE_KEYS.PENDING_INVITES) || []
    pendingInvites.push({
      inviteCode: code,
      email: email.toLowerCase().trim(),
      realtorId,
      createdAt: new Date().toISOString(),
    })
    setObject(STORAGE_KEYS.PENDING_INVITES, pendingInvites)

    // Save to realtor's pending invites
    const realtors = getObject<any[]>(STORAGE_KEYS.REALTORS) || []
    const realtorIndex = realtors.findIndex((r: any) => r.id === realtorId)

    if (realtorIndex !== -1) {
      const realtor = realtors[realtorIndex]
      realtor.pendingInvites = realtor.pendingInvites || []
      realtor.pendingInvites.push({
        inviteCode: code,
        email: email.toLowerCase().trim(),
        createdAt: new Date().toISOString(),
      })
      realtors[realtorIndex] = realtor
      setObject(STORAGE_KEYS.REALTORS, realtors)
    }

    console.log("[InviteCodeProd] Code also saved to legacy systems")
  } catch (err) {
    console.error("[InviteCodeProd] Error saving to legacy systems:", err)
  }

  return newCode
}

// Find a code by its value
export function findCode(code: string): InviteCode | null {
  if (!code) return null

  const normalizedCode = code.trim().toUpperCase()
  console.log(`[InviteCodeProd] Looking for code: ${normalizedCode}`)

  try {
    // First check our primary storage
    const codes = getAllCodes()

    for (const invite of codes) {
      const inviteCode = invite.code.trim().toUpperCase()

      if (inviteCode === normalizedCode) {
        console.log(`[InviteCodeProd] Found matching code in primary storage:`, invite)
        return invite
      }
    }

    // If not found, check legacy systems
    console.log("[InviteCodeProd] Code not found in primary storage, checking legacy systems")

    // Check legacy storage
    const legacyCodes = getObject<any[]>(STORAGE_KEYS.INVITE_CODES_LEGACY)
    if (legacyCodes && Array.isArray(legacyCodes)) {
      for (const invite of legacyCodes) {
        const inviteCode = (invite.code || invite.inviteCode || "").trim().toUpperCase()

        if (inviteCode === normalizedCode) {
          console.log(`[InviteCodeProd] Found matching code in legacy storage:`, invite)

          // Convert to our format
          const convertedCode: InviteCode = {
            code: invite.code || invite.inviteCode,
            email: invite.email,
            realtorId: invite.realtorId,
            buyerName: invite.buyerName,
            status: invite.status || "pending",
            createdAt: invite.createdAt || new Date().toISOString(),
          }

          // Save to our primary storage for next time
          const allCodes = getAllCodes()
          allCodes.push(convertedCode)
          saveCodes(allCodes)

          return convertedCode
        }
      }
    }

    // Check pending invites
    const pendingInvites = getObject<any[]>(STORAGE_KEYS.PENDING_INVITES)
    if (pendingInvites && Array.isArray(pendingInvites)) {
      for (const invite of pendingInvites) {
        const inviteCode = (invite.inviteCode || "").trim().toUpperCase()

        if (inviteCode === normalizedCode) {
          console.log(`[InviteCodeProd] Found matching code in pending invites:`, invite)

          // Convert to our format
          const convertedCode: InviteCode = {
            code: invite.inviteCode,
            email: invite.email,
            realtorId: invite.realtorId,
            status: "pending",
            createdAt: invite.createdAt || new Date().toISOString(),
          }

          // Save to our primary storage for next time
          const allCodes = getAllCodes()
          allCodes.push(convertedCode)
          saveCodes(allCodes)

          return convertedCode
        }
      }
    }

    // Check realtors for pending invites
    const realtors = getObject<any[]>(STORAGE_KEYS.REALTORS)
    if (realtors && Array.isArray(realtors)) {
      for (const realtor of realtors) {
        if (realtor.pendingInvites && Array.isArray(realtor.pendingInvites)) {
          for (const invite of realtor.pendingInvites) {
            const inviteCode = (invite.inviteCode || "").trim().toUpperCase()

            if (inviteCode === normalizedCode) {
              console.log(`[InviteCodeProd] Found matching code in realtor ${realtor.id}'s pending invites:`, invite)

              // Convert to our format
              const convertedCode: InviteCode = {
                code: invite.inviteCode,
                email: invite.email,
                realtorId: realtor.id,
                status: "pending",
                createdAt: invite.createdAt || new Date().toISOString(),
              }

              // Save to our primary storage for next time
              const allCodes = getAllCodes()
              allCodes.push(convertedCode)
              saveCodes(allCodes)

              return convertedCode
            }
          }
        }
      }
    }

    console.log(`[InviteCodeProd] No matching code found for: ${normalizedCode}`)

    // Dump all storage for debugging
    const allStorage = dumpAllStorage()
    console.log("[InviteCodeProd] All storage:", allStorage)

    return null
  } catch (error) {
    console.error(`[InviteCodeProd] Error finding code ${normalizedCode}:`, error)
    return null
  }
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
  console.log(`[InviteCodeProd] Validating code: ${normalizedCode}`)

  // Special case for realtor code
  if (normalizedCode === "REALTOR") {
    return {
      valid: true,
      realtorId: null,
      message: "Valid realtor code",
      debugInfo: { special: "realtor_code" },
    }
  }

  try {
    // Find the code
    const invite = findCode(normalizedCode)

    if (!invite) {
      // Dump all storage for debugging
      const allStorage = dumpAllStorage()

      return {
        valid: false,
        realtorId: null,
        message: "This invite code is not valid. Please check the code or contact your realtor.",
        debugInfo: {
          reason: "Code not found",
          storage: allStorage,
        },
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
  } catch (error) {
    console.error(`[InviteCodeProd] Error validating code ${normalizedCode}:`, error)

    return {
      valid: false,
      realtorId: null,
      message: "An error occurred while validating the invite code",
      debugInfo: { reason: "Error", error: String(error) },
    }
  }
}

// Mark a code as used
export function markAsUsed(code: string): boolean {
  if (!code) return false

  const normalizedCode = code.trim().toUpperCase()
  console.log(`[InviteCodeProd] Marking code as used: ${normalizedCode}`)

  try {
    const codes = getAllCodes()
    const index = codes.findIndex((invite) => invite.code.trim().toUpperCase() === normalizedCode)

    if (index === -1) {
      console.log(`[InviteCodeProd] Code not found in primary storage: ${normalizedCode}`)

      // Try to find in legacy systems
      const invite = findCode(normalizedCode)
      if (invite) {
        invite.status = "used"
        invite.usedAt = new Date().toISOString()

        codes.push(invite)
        saveCodes(codes)

        console.log(`[InviteCodeProd] Code found in legacy system and marked as used: ${normalizedCode}`)
        return true
      }

      return false
    }

    codes[index].status = "used"
    codes[index].usedAt = new Date().toISOString()

    saveCodes(codes)
    console.log(`[InviteCodeProd] Code marked as used in primary storage: ${normalizedCode}`)

    // Also update legacy systems
    try {
      // Update in legacy storage
      const legacyCodes = getObject<any[]>(STORAGE_KEYS.INVITE_CODES_LEGACY) || []
      const legacyIndex = legacyCodes.findIndex(
        (invite: any) => (invite.code || invite.inviteCode || "").trim().toUpperCase() === normalizedCode,
      )

      if (legacyIndex !== -1) {
        legacyCodes[legacyIndex].status = "used"
        legacyCodes[legacyIndex].usedAt = new Date().toISOString()
        setObject(STORAGE_KEYS.INVITE_CODES_LEGACY, legacyCodes)
      }

      // Remove from pending invites
      const pendingInvites = getObject<any[]>(STORAGE_KEYS.PENDING_INVITES) || []
      const filteredInvites = pendingInvites.filter(
        (invite: any) => (invite.inviteCode || "").trim().toUpperCase() !== normalizedCode,
      )

      if (filteredInvites.length < pendingInvites.length) {
        setObject(STORAGE_KEYS.PENDING_INVITES, filteredInvites)
      }

      // Remove from realtors' pending invites
      const realtors = getObject<any[]>(STORAGE_KEYS.REALTORS) || []
      let updated = false

      for (const realtor of realtors) {
        if (realtor.pendingInvites && Array.isArray(realtor.pendingInvites)) {
          const originalLength = realtor.pendingInvites.length
          realtor.pendingInvites = realtor.pendingInvites.filter(
            (invite: any) => (invite.inviteCode || "").trim().toUpperCase() !== normalizedCode,
          )

          if (realtor.pendingInvites.length < originalLength) {
            updated = true
          }
        }
      }

      if (updated) {
        setObject(STORAGE_KEYS.REALTORS, realtors)
      }

      console.log("[InviteCodeProd] Code also updated in legacy systems")
    } catch (err) {
      console.error("[InviteCodeProd] Error updating legacy systems:", err)
    }

    return true
  } catch (error) {
    console.error(`[InviteCodeProd] Error marking code as used ${normalizedCode}:`, error)
    return false
  }
}

// Add a test code (for debugging)
export function addTestCode(code: string, email: string, realtorId: string): InviteCode {
  console.log(`[InviteCodeProd] Adding test code: ${code}`)

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

  console.log(`[InviteCodeProd] Test code added: ${code}`)
  return newCode
}

// Clear all codes (for debugging)
export function clearAllCodes(): void {
  console.log("[InviteCodeProd] Clearing all codes")

  try {
    setObject(STORAGE_KEYS.INVITE_CODES, [])
    setObject(STORAGE_KEYS.INVITE_CODES_LEGACY, [])
    console.log("[InviteCodeProd] All codes cleared")
  } catch (error) {
    console.error("[InviteCodeProd] Error clearing codes:", error)
  }
}

// Initialize on import
initStorage()
