// Super-verbose invite code system with extensive debugging

import { dumpLocalStorage, showVisualDebug } from "./debug-utils"

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

// Storage keys - we'll check multiple locations
const STORAGE_KEYS = {
  PRIMARY: "buyhome_invite_codes_super",
  LEGACY: "buyhome_invite_codes",
  LEGACY_V2: "buyhome_invite_codes_v2",
  PENDING: "buyhome_pending_invites",
}

// Initialize storage
export function initStorage(): void {
  console.log("[INVITE_SUPER] Initializing storage")
  if (typeof window === "undefined") return

  try {
    // Dump all localStorage for debugging
    dumpLocalStorage("INVITE_SUPER_INIT")

    // Check if our primary storage exists
    const existing = localStorage.getItem(STORAGE_KEYS.PRIMARY)
    if (!existing) {
      localStorage.setItem(STORAGE_KEYS.PRIMARY, JSON.stringify([]))
      console.log("[INVITE_SUPER] Created new primary storage")
    } else {
      console.log("[INVITE_SUPER] Primary storage already exists")
      try {
        const parsed = JSON.parse(existing)
        console.log(`[INVITE_SUPER] Found ${parsed.length} codes in primary storage`)
      } catch (err) {
        console.error("[INVITE_SUPER] Error parsing primary storage:", err)
      }
    }

    // Check legacy storage and migrate if needed
    migrateFromLegacySystems()
  } catch (error) {
    console.error("[INVITE_SUPER] Error initializing storage:", error)
  }
}

// Migrate from legacy systems
function migrateFromLegacySystems(): void {
  console.log("[INVITE_SUPER] Checking for legacy data to migrate")
  if (typeof window === "undefined") return

  try {
    const allCodes: InviteCode[] = []

    // Check legacy v2 storage
    const legacyV2Json = localStorage.getItem(STORAGE_KEYS.LEGACY_V2)
    if (legacyV2Json) {
      try {
        const legacyV2Codes = JSON.parse(legacyV2Json)
        console.log(`[INVITE_SUPER] Found ${legacyV2Codes.length} codes in legacy v2 storage`)
        allCodes.push(...legacyV2Codes)
      } catch (err) {
        console.error("[INVITE_SUPER] Error parsing legacy v2 storage:", err)
      }
    }

    // Check original legacy storage
    const legacyJson = localStorage.getItem(STORAGE_KEYS.LEGACY)
    if (legacyJson) {
      try {
        const legacyCodes = JSON.parse(legacyJson)
        console.log(`[INVITE_SUPER] Found ${legacyCodes.length} codes in legacy storage`)

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
      } catch (err) {
        console.error("[INVITE_SUPER] Error parsing legacy storage:", err)
      }
    }

    // Check pending invites
    const pendingJson = localStorage.getItem(STORAGE_KEYS.PENDING)
    if (pendingJson) {
      try {
        const pendingInvites = JSON.parse(pendingJson)
        console.log(`[INVITE_SUPER] Found ${pendingInvites.length} codes in pending invites`)

        // Convert to our format
        const convertedCodes = pendingInvites.map((invite: any) => ({
          code: invite.inviteCode,
          email: invite.email,
          realtorId: invite.realtorId,
          status: "pending",
          createdAt: invite.createdAt || new Date().toISOString(),
        }))

        allCodes.push(...convertedCodes)
      } catch (err) {
        console.error("[INVITE_SUPER] Error parsing pending invites:", err)
      }
    }

    // Check realtors for pending invites
    try {
      const realtorsJson = localStorage.getItem("buyhome_all_realtors")
      if (realtorsJson) {
        const realtors = JSON.parse(realtorsJson)
        console.log(`[INVITE_SUPER] Checking ${realtors.length} realtors for pending invites`)

        for (const realtor of realtors) {
          if (realtor.pendingInvites && Array.isArray(realtor.pendingInvites)) {
            console.log(`[INVITE_SUPER] Realtor ${realtor.id} has ${realtor.pendingInvites.length} pending invites`)

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
    } catch (err) {
      console.error("[INVITE_SUPER] Error checking realtors:", err)
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

    console.log(`[INVITE_SUPER] Migrated ${uniqueCodes.length} unique codes from legacy systems`)

    // Save to our primary storage
    if (uniqueCodes.length > 0) {
      saveCodes(uniqueCodes)
    }
  } catch (error) {
    console.error("[INVITE_SUPER] Error migrating from legacy systems:", error)
  }
}

// Get all codes
export function getAllCodes(): InviteCode[] {
  console.log("[INVITE_SUPER] Getting all codes")
  if (typeof window === "undefined") return []

  try {
    const data = localStorage.getItem(STORAGE_KEYS.PRIMARY)
    if (!data) {
      console.log("[INVITE_SUPER] No codes found in primary storage")
      return []
    }

    const codes = JSON.parse(data)
    console.log(`[INVITE_SUPER] Found ${codes.length} codes in primary storage`)
    return codes
  } catch (error) {
    console.error("[INVITE_SUPER] Error getting codes:", error)
    return []
  }
}

// Save all codes
function saveCodes(codes: InviteCode[]): void {
  console.log(`[INVITE_SUPER] Saving ${codes.length} codes to primary storage`)
  if (typeof window === "undefined") return

  try {
    localStorage.setItem(STORAGE_KEYS.PRIMARY, JSON.stringify(codes))
    console.log("[INVITE_SUPER] Codes saved successfully to primary storage")

    // Also save to legacy systems for compatibility
    try {
      localStorage.setItem(STORAGE_KEYS.LEGACY_V2, JSON.stringify(codes))
      console.log("[INVITE_SUPER] Codes also saved to legacy v2 storage")
    } catch (err) {
      console.error("[INVITE_SUPER] Error saving to legacy v2 storage:", err)
    }
  } catch (error) {
    console.error("[INVITE_SUPER] Error saving codes:", error)
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
  console.log(`[INVITE_SUPER] Creating code for ${email}, realtorId: ${realtorId}`)

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

  console.log(`[INVITE_SUPER] Created code: ${code}`)

  // Also save to legacy systems
  try {
    // Save to pending invites
    const pendingJson = localStorage.getItem(STORAGE_KEYS.PENDING)
    const pendingInvites = pendingJson ? JSON.parse(pendingJson) : []
    pendingInvites.push({
      inviteCode: code,
      email: email.toLowerCase().trim(),
      realtorId,
      createdAt: new Date().toISOString(),
    })
    localStorage.setItem(STORAGE_KEYS.PENDING, JSON.stringify(pendingInvites))

    // Save to realtor's pending invites
    const realtorsJson = localStorage.getItem("buyhome_all_realtors")
    if (realtorsJson) {
      const realtors = JSON.parse(realtorsJson)
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
        localStorage.setItem("buyhome_all_realtors", JSON.stringify(realtors))
      }
    }

    console.log("[INVITE_SUPER] Code also saved to legacy systems")
  } catch (err) {
    console.error("[INVITE_SUPER] Error saving to legacy systems:", err)
  }

  return newCode
}

// Find a code by its value
export function findCode(code: string): InviteCode | null {
  if (!code || typeof window === "undefined") return null

  const normalizedCode = code.trim().toUpperCase()
  console.log(`[INVITE_SUPER] Looking for code: ${normalizedCode}`)

  // First check our primary storage
  const codes = getAllCodes()

  for (const invite of codes) {
    const inviteCode = invite.code.trim().toUpperCase()
    console.log(`[INVITE_SUPER] Comparing with: ${inviteCode}`)

    if (inviteCode === normalizedCode) {
      console.log(`[INVITE_SUPER] Found matching code in primary storage:`, invite)
      return invite
    }
  }

  // If not found, check legacy systems
  console.log("[INVITE_SUPER] Code not found in primary storage, checking legacy systems")

  // Check legacy storage
  try {
    const legacyJson = localStorage.getItem(STORAGE_KEYS.LEGACY)
    if (legacyJson) {
      const legacyCodes = JSON.parse(legacyJson)

      for (const invite of legacyCodes) {
        const inviteCode = (invite.code || invite.inviteCode || "").trim().toUpperCase()

        if (inviteCode === normalizedCode) {
          console.log(`[INVITE_SUPER] Found matching code in legacy storage:`, invite)

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
  } catch (err) {
    console.error("[INVITE_SUPER] Error checking legacy storage:", err)
  }

  // Check pending invites
  try {
    const pendingJson = localStorage.getItem(STORAGE_KEYS.PENDING)
    if (pendingJson) {
      const pendingInvites = JSON.parse(pendingJson)

      for (const invite of pendingInvites) {
        const inviteCode = (invite.inviteCode || "").trim().toUpperCase()

        if (inviteCode === normalizedCode) {
          console.log(`[INVITE_SUPER] Found matching code in pending invites:`, invite)

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
  } catch (err) {
    console.error("[INVITE_SUPER] Error checking pending invites:", err)
  }

  // Check realtors for pending invites
  try {
    const realtorsJson = localStorage.getItem("buyhome_all_realtors")
    if (realtorsJson) {
      const realtors = JSON.parse(realtorsJson)

      for (const realtor of realtors) {
        if (realtor.pendingInvites && Array.isArray(realtor.pendingInvites)) {
          for (const invite of realtor.pendingInvites) {
            const inviteCode = (invite.inviteCode || "").trim().toUpperCase()

            if (inviteCode === normalizedCode) {
              console.log(`[INVITE_SUPER] Found matching code in realtor ${realtor.id}'s pending invites:`, invite)

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
  } catch (err) {
    console.error("[INVITE_SUPER] Error checking realtors:", err)
  }

  console.log(`[INVITE_SUPER] No matching code found for: ${normalizedCode}`)
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
  console.log(`[INVITE_SUPER] Validating code: ${normalizedCode}`)

  // Dump all localStorage for debugging
  dumpLocalStorage("INVITE_SUPER_VALIDATE")

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
    // Create visual debug
    if (typeof window !== "undefined") {
      const debugData = {
        action: "validate_code",
        code: normalizedCode,
        result: "not_found",
        localStorage: {},
        timestamp: new Date().toISOString(),
      }

      // Add localStorage summary
      try {
        const keys = Object.keys(localStorage)
        for (const key of keys) {
          if (key.includes("invite") || key.includes("realtor")) {
            try {
              debugData.localStorage[key] = JSON.parse(localStorage.getItem(key) || "null")
            } catch {
              debugData.localStorage[key] = localStorage.getItem(key)
            }
          }
        }
      } catch (err) {
        console.error("[INVITE_SUPER] Error creating debug data:", err)
      }

      showVisualDebug(debugData)
    }

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
  console.log(`[INVITE_SUPER] Marking code as used: ${normalizedCode}`)

  const codes = getAllCodes()
  const index = codes.findIndex((invite) => invite.code.trim().toUpperCase() === normalizedCode)

  if (index === -1) {
    console.log(`[INVITE_SUPER] Code not found in primary storage: ${normalizedCode}`)

    // Try to find in legacy systems
    const invite = findCode(normalizedCode)
    if (invite) {
      invite.status = "used"
      invite.usedAt = new Date().toISOString()

      codes.push(invite)
      saveCodes(codes)

      console.log(`[INVITE_SUPER] Code found in legacy system and marked as used: ${normalizedCode}`)
      return true
    }

    return false
  }

  codes[index].status = "used"
  codes[index].usedAt = new Date().toISOString()

  saveCodes(codes)
  console.log(`[INVITE_SUPER] Code marked as used in primary storage: ${normalizedCode}`)

  // Also update legacy systems
  try {
    // Update in legacy storage
    const legacyJson = localStorage.getItem(STORAGE_KEYS.LEGACY)
    if (legacyJson) {
      const legacyCodes = JSON.parse(legacyJson)
      const legacyIndex = legacyCodes.findIndex(
        (invite: any) => (invite.code || invite.inviteCode || "").trim().toUpperCase() === normalizedCode,
      )

      if (legacyIndex !== -1) {
        legacyCodes[legacyIndex].status = "used"
        legacyCodes[legacyIndex].usedAt = new Date().toISOString()
        localStorage.setItem(STORAGE_KEYS.LEGACY, JSON.stringify(legacyCodes))
      }
    }

    // Remove from pending invites
    const pendingJson = localStorage.getItem(STORAGE_KEYS.PENDING)
    if (pendingJson) {
      const pendingInvites = JSON.parse(pendingJson)
      const filteredInvites = pendingInvites.filter(
        (invite: any) => (invite.inviteCode || "").trim().toUpperCase() !== normalizedCode,
      )

      if (filteredInvites.length < pendingInvites.length) {
        localStorage.setItem(STORAGE_KEYS.PENDING, JSON.stringify(filteredInvites))
      }
    }

    // Remove from realtors' pending invites
    const realtorsJson = localStorage.getItem("buyhome_all_realtors")
    if (realtorsJson) {
      const realtors = JSON.parse(realtorsJson)
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
        localStorage.setItem("buyhome_all_realtors", JSON.stringify(realtors))
      }
    }

    console.log("[INVITE_SUPER] Code also updated in legacy systems")
  } catch (err) {
    console.error("[INVITE_SUPER] Error updating legacy systems:", err)
  }

  return true
}

// Add a test code (for debugging)
export function addTestCode(code: string, email: string, realtorId: string): InviteCode {
  console.log(`[INVITE_SUPER] Adding test code: ${code}`)

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

  console.log(`[INVITE_SUPER] Test code added: ${code}`)
  return newCode
}

// Clear all codes (for debugging)
export function clearAllCodes(): void {
  console.log("[INVITE_SUPER] Clearing all codes")
  if (typeof window === "undefined") return

  try {
    localStorage.setItem(STORAGE_KEYS.PRIMARY, JSON.stringify([]))
    localStorage.setItem(STORAGE_KEYS.LEGACY_V2, JSON.stringify([]))
    console.log("[INVITE_SUPER] All codes cleared from primary and legacy v2 storage")
  } catch (error) {
    console.error("[INVITE_SUPER] Error clearing codes:", error)
  }
}

// Initialize on import
initStorage()
