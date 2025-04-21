// Comprehensive invite code service with proper storage, validation, and logging

// Type definitions
export type InviteCodeStatus = "pending" | "used"

export type InviteCode = {
  code: string
  email: string
  realtorId: string
  buyerName?: string
  status: InviteCodeStatus
  createdAt: string
  usedAt?: string
}

// Constants
const STORAGE_KEY = "buyhome_invite_codes"
const REALTOR_CODE = "REALTOR"

// Generate a random invite code (8 alphanumeric characters)
export function generateInviteCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let code = ""
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

// Initialize the invite codes storage
export function initializeInviteCodesStorage(): void {
  if (typeof window === "undefined") return

  try {
    const existingCodes = localStorage.getItem(STORAGE_KEY)
    if (!existingCodes) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([]))
      console.log("[InviteCodeService] Initialized invite codes storage")
    }
  } catch (error) {
    console.error("[InviteCodeService] Error initializing invite codes storage:", error)
  }
}

// Get all invite codes
export function getAllInviteCodes(): InviteCode[] {
  if (typeof window === "undefined") return []

  try {
    const codesJson = localStorage.getItem(STORAGE_KEY)
    if (!codesJson) return []

    return JSON.parse(codesJson)
  } catch (error) {
    console.error("[InviteCodeService] Error getting invite codes:", error)
    return []
  }
}

// Save all invite codes
function saveAllInviteCodes(codes: InviteCode[]): void {
  if (typeof window === "undefined") return

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(codes))
    console.log("[InviteCodeService] Saved invite codes:", codes.length)
  } catch (error) {
    console.error("[InviteCodeService] Error saving invite codes:", error)
  }
}

// Create and store a new invite code
export function createInviteCode(email: string, realtorId: string, buyerName?: string): InviteCode {
  console.log(`[InviteCodeService] Creating invite code for email: ${email}, realtorId: ${realtorId}`)

  // Generate a unique code
  const code = generateInviteCode()

  // Create the invite record
  const inviteCode: InviteCode = {
    code,
    email: email.toLowerCase().trim(),
    realtorId,
    buyerName,
    status: "pending",
    createdAt: new Date().toISOString(),
  }

  // Store in localStorage
  const allCodes = getAllInviteCodes()
  allCodes.push(inviteCode)
  saveAllInviteCodes(allCodes)

  console.log(`[InviteCodeService] Created new invite code: ${code} for email: ${email}`)

  // Also update the realtor's pending invites for backward compatibility
  updateRealtorPendingInvites(inviteCode)

  return inviteCode
}

// Update the realtor's pending invites (for backward compatibility)
function updateRealtorPendingInvites(inviteCode: InviteCode): void {
  if (typeof window === "undefined") return

  try {
    // Get all realtors
    const realtorsJson = localStorage.getItem("buyhome_all_realtors")
    if (!realtorsJson) return

    const realtors = JSON.parse(realtorsJson)

    // Find the realtor
    const realtorIndex = realtors.findIndex((r: any) => r.id === inviteCode.realtorId)
    if (realtorIndex === -1) return

    // Update their pending invites
    const realtor = realtors[realtorIndex]
    const pendingInvites = realtor.pendingInvites || []

    pendingInvites.push({
      email: inviteCode.email,
      inviteCode: inviteCode.code,
      createdAt: inviteCode.createdAt,
    })

    realtor.pendingInvites = pendingInvites
    realtors[realtorIndex] = realtor

    // Save back to localStorage
    localStorage.setItem("buyhome_all_realtors", JSON.stringify(realtors))

    // Also update the current realtor if logged in
    const currentRealtorJson = localStorage.getItem("buyhome_realtor")
    if (currentRealtorJson) {
      const currentRealtor = JSON.parse(currentRealtorJson)
      if (currentRealtor.id === inviteCode.realtorId) {
        currentRealtor.pendingInvites = pendingInvites
        localStorage.setItem("buyhome_realtor", JSON.stringify(currentRealtor))
      }
    }

    // Also update the pendingInvites in localStorage
    try {
      const pendingInvitesJson = localStorage.getItem("buyhome_pending_invites")
      let pendingInvitesArray = []

      if (pendingInvitesJson) {
        pendingInvitesArray = JSON.parse(pendingInvitesJson)
      }

      pendingInvitesArray.push({
        email: inviteCode.email,
        inviteCode: inviteCode.code,
        realtorId: inviteCode.realtorId,
        createdAt: inviteCode.createdAt,
      })

      localStorage.setItem("buyhome_pending_invites", JSON.stringify(pendingInvitesArray))
    } catch (error) {
      console.error("[InviteCodeService] Error updating pending invites:", error)
    }

    console.log(`[InviteCodeService] Updated realtor pending invites for realtor: ${inviteCode.realtorId}`)
  } catch (error) {
    console.error("[InviteCodeService] Error updating realtor pending invites:", error)
  }
}

// Find an invite code by its code (case-insensitive)
export function findInviteCodeByCode(code: string): InviteCode | null {
  if (!code || typeof window === "undefined") return null

  const normalizedCode = code.trim().toUpperCase()
  console.log(`[InviteCodeService] Looking for invite code: ${normalizedCode}`)

  // First, check in the new system
  const allCodes = getAllInviteCodes()
  console.log(`[InviteCodeService] Found ${allCodes.length} invite codes in storage`)

  for (const invite of allCodes) {
    console.log(`[InviteCodeService] Comparing ${invite.code.trim().toUpperCase()} with ${normalizedCode}`)
    if (invite.code.trim().toUpperCase() === normalizedCode) {
      console.log(`[InviteCodeService] Found matching invite code in new system:`, invite)
      return invite
    }
  }

  // If not found in the new system, check the old system
  try {
    console.log(`[InviteCodeService] Checking old system for invite code: ${normalizedCode}`)

    // Check in the pending invites
    const pendingInvitesJson = localStorage.getItem("buyhome_pending_invites")
    if (pendingInvitesJson) {
      const pendingInvites = JSON.parse(pendingInvitesJson)

      for (const invite of pendingInvites) {
        if (invite.inviteCode && invite.inviteCode.trim().toUpperCase() === normalizedCode) {
          console.log(`[InviteCodeService] Found invite code in pending invites:`, invite)

          // Create a new invite code record in the new system
          const newInviteCode: InviteCode = {
            code: invite.inviteCode,
            email: invite.email,
            realtorId: invite.realtorId,
            status: "pending",
            createdAt: invite.createdAt || new Date().toISOString(),
          }

          // Save to the new system
          const allCodes = getAllInviteCodes()
          allCodes.push(newInviteCode)
          saveAllInviteCodes(allCodes)

          return newInviteCode
        }
      }
    }

    // Check in the realtors' pending invites
    const realtorsJson = localStorage.getItem("buyhome_all_realtors")
    if (realtorsJson) {
      const realtors = JSON.parse(realtorsJson)

      for (const realtor of realtors) {
        if (realtor.pendingInvites && Array.isArray(realtor.pendingInvites)) {
          console.log(
            `[InviteCodeService] Checking realtor ${realtor.id} with ${realtor.pendingInvites.length} pending invites`,
          )

          for (const invite of realtor.pendingInvites) {
            if (invite.inviteCode && invite.inviteCode.trim().toUpperCase() === normalizedCode) {
              console.log(`[InviteCodeService] Found invite code in old system:`, invite)

              // Create a new invite code record in the new system
              const newInviteCode: InviteCode = {
                code: invite.inviteCode,
                email: invite.email,
                realtorId: realtor.id,
                status: "pending",
                createdAt: invite.createdAt || new Date().toISOString(),
              }

              // Save to the new system
              const allCodes = getAllInviteCodes()
              allCodes.push(newInviteCode)
              saveAllInviteCodes(allCodes)

              return newInviteCode
            }
          }
        }
      }
    }

    console.log(`[InviteCodeService] No matching invite code found in old system for: ${normalizedCode}`)
  } catch (error) {
    console.error("[InviteCodeService] Error checking old system for invite code:", error)
  }

  console.log(`[InviteCodeService] No matching invite code found for: ${normalizedCode}`)
  return null
}

// Validate an invite code for a specific role and email
export function validateInviteCode(
  code: string,
  role: "buyer" | "realtor",
  email?: string,
): {
  valid: boolean
  realtorId: string | null
  status: "valid" | "invalid" | "used"
  message: string
  debugInfo: {
    entered_invite_code: string
    invite_found: boolean
    status?: string
    email_matched?: boolean
    rejection_reason?: string
  }
} {
  // Create debug info object
  const debugInfo = {
    entered_invite_code: code,
    invite_found: false,
    status: undefined as string | undefined,
    email_matched: undefined as boolean | undefined,
    rejection_reason: undefined as string | undefined,
  }

  if (!code) {
    debugInfo.rejection_reason = "No code provided"
    return {
      valid: false,
      realtorId: null,
      status: "invalid",
      message: "Please enter an invite code.",
      debugInfo,
    }
  }

  // Normalize the code (trim whitespace, uppercase)
  const normalizedCode = code.trim().toUpperCase()
  debugInfo.entered_invite_code = normalizedCode

  console.log(
    `[InviteCodeService] Validating invite code: ${normalizedCode} for role: ${role}, email: ${email || "not provided"}`,
  )

  // REALTOR VALIDATION
  if (role === "realtor") {
    // For realtors, only the REALTOR code is valid
    if (normalizedCode === REALTOR_CODE) {
      debugInfo.invite_found = true
      debugInfo.status = "valid"

      return {
        valid: true,
        realtorId: null,
        status: "valid",
        message: "Valid realtor signup code.",
        debugInfo,
      }
    } else {
      debugInfo.rejection_reason = "Invalid realtor code"
      return {
        valid: false,
        realtorId: null,
        status: "invalid",
        message: "Invalid signup code. Realtors must use the REALTOR code.",
        debugInfo,
      }
    }
  }

  // BUYER VALIDATION
  if (role === "buyer") {
    // For buyers, the REALTOR code is NOT valid
    if (normalizedCode === REALTOR_CODE) {
      debugInfo.rejection_reason = "Buyers cannot use REALTOR code"
      return {
        valid: false,
        realtorId: null,
        status: "invalid",
        message: "This invite code is not valid. Please check the code or contact your realtor.",
        debugInfo,
      }
    }

    // Find the matching code
    const matchingCode = findInviteCodeByCode(normalizedCode)

    if (!matchingCode) {
      debugInfo.rejection_reason = "No matching invite code found"
      return {
        valid: false,
        realtorId: null,
        status: "invalid",
        message: "This invite code is not valid. Please check the code or contact your realtor.",
        debugInfo,
      }
    }

    // Update debug info
    debugInfo.invite_found = true
    debugInfo.status = matchingCode.status

    // Check if the code has already been used
    if (matchingCode.status === "used") {
      debugInfo.rejection_reason = "Invite code already used"
      return {
        valid: false,
        realtorId: matchingCode.realtorId,
        status: "used",
        message: "This invite code has already been used. Please request a new invite from your realtor.",
        debugInfo,
      }
    }

    // If email is provided, check if it matches
    if (email) {
      const normalizedEmail = email.toLowerCase().trim()
      const codeEmail = matchingCode.email.toLowerCase().trim()

      debugInfo.email_matched = normalizedEmail === codeEmail

      // For now, disable email matching to debug the issue
      // if (normalizedEmail !== codeEmail) {
      //   debugInfo.rejection_reason = "Email does not match invite code"
      //   return {
      //     valid: false,
      //     realtorId: matchingCode.realtorId,
      //     status: "invalid",
      //     message: "This invite code is not valid for this email address.",
      //     debugInfo,
      //   }
      // }
    }

    // Valid pending code
    return {
      valid: true,
      realtorId: matchingCode.realtorId,
      status: "valid",
      message: "Valid invite code.",
      debugInfo,
    }
  }

  // Should never reach here, but just in case
  debugInfo.rejection_reason = "Unknown role"
  return {
    valid: false,
    realtorId: null,
    status: "invalid",
    message: "Invalid role specified.",
    debugInfo,
  }
}

// Mark an invite code as used
export function markInviteCodeAsUsed(code: string): boolean {
  if (!code || typeof window === "undefined") return false

  // Normalize the code
  const normalizedCode = code.trim().toUpperCase()

  console.log(`[InviteCodeService] Marking invite code as used: ${normalizedCode}`)

  // Get all codes
  const allCodes = getAllInviteCodes()

  // Find the matching code
  const codeIndex = allCodes.findIndex((invite) => invite.code.trim().toUpperCase() === normalizedCode)

  if (codeIndex === -1) {
    console.log(`[InviteCodeService] No matching invite code found to mark as used: ${normalizedCode}`)

    // Try to find in old system and migrate
    try {
      // Check in pending invites
      const pendingInvitesJson = localStorage.getItem("buyhome_pending_invites")
      if (pendingInvitesJson) {
        const pendingInvites = JSON.parse(pendingInvitesJson)
        const inviteIndex = pendingInvites.findIndex(
          (inv: any) => inv.inviteCode && inv.inviteCode.trim().toUpperCase() === normalizedCode,
        )

        if (inviteIndex !== -1) {
          const invite = pendingInvites[inviteIndex]

          // Create a new invite code record in the new system
          const newInviteCode: InviteCode = {
            code: invite.inviteCode,
            email: invite.email,
            realtorId: invite.realtorId,
            status: "used",
            createdAt: invite.createdAt || new Date().toISOString(),
            usedAt: new Date().toISOString(),
          }

          // Save to the new system
          allCodes.push(newInviteCode)
          saveAllInviteCodes(allCodes)

          // Remove from pending invites
          pendingInvites.splice(inviteIndex, 1)
          localStorage.setItem("buyhome_pending_invites", JSON.stringify(pendingInvites))

          console.log(
            `[InviteCodeService] Migrated and marked invite code as used from pending invites: ${normalizedCode}`,
          )
          return true
        }
      }

      // Check in the realtors' pending invites
      const realtorsJson = localStorage.getItem("buyhome_all_realtors")
      if (realtorsJson) {
        const realtors = JSON.parse(realtorsJson)

        for (const realtor of realtors) {
          if (realtor.pendingInvites) {
            const inviteIndex = realtor.pendingInvites.findIndex(
              (inv: any) => inv.inviteCode && inv.inviteCode.trim().toUpperCase() === normalizedCode,
            )

            if (inviteIndex !== -1) {
              const invite = realtor.pendingInvites[inviteIndex]

              // Create a new invite code record in the new system
              const newInviteCode: InviteCode = {
                code: invite.inviteCode,
                email: invite.email,
                realtorId: realtor.id,
                status: "used",
                createdAt: invite.createdAt || new Date().toISOString(),
                usedAt: new Date().toISOString(),
              }

              // Save to the new system
              allCodes.push(newInviteCode)
              saveAllInviteCodes(allCodes)

              // Remove from old system
              realtor.pendingInvites.splice(inviteIndex, 1)

              // Save back to localStorage
              localStorage.setItem("buyhome_all_realtors", JSON.stringify(realtors))

              console.log(`[InviteCodeService] Migrated and marked invite code as used: ${normalizedCode}`)
              return true
            }
          }
        }
      }
    } catch (error) {
      console.error("[InviteCodeService] Error checking old system for invite code:", error)
    }

    return false
  }

  // Update the code status
  allCodes[codeIndex].status = "used"
  allCodes[codeIndex].usedAt = new Date().toISOString()

  // Save back to localStorage
  saveAllInviteCodes(allCodes)

  // Also update in the old system for backward compatibility
  try {
    // Update in pending invites
    const pendingInvitesJson = localStorage.getItem("buyhome_pending_invites")
    if (pendingInvitesJson) {
      const pendingInvites = JSON.parse(pendingInvitesJson)
      const inviteIndex = pendingInvites.findIndex(
        (inv: any) => inv.inviteCode && inv.inviteCode.trim().toUpperCase() === normalizedCode,
      )

      if (inviteIndex !== -1) {
        pendingInvites.splice(inviteIndex, 1)
        localStorage.setItem("buyhome_pending_invites", JSON.stringify(pendingInvites))
      }
    }

    // Update in realtors
    const realtorsJson = localStorage.getItem("buyhome_all_realtors")
    if (realtorsJson) {
      const realtors = JSON.parse(realtorsJson)

      for (const realtor of realtors) {
        if (realtor.pendingInvites) {
          const inviteIndex = realtor.pendingInvites.findIndex(
            (inv: any) => inv.inviteCode && inv.inviteCode.trim().toUpperCase() === normalizedCode,
          )

          if (inviteIndex !== -1) {
            // Remove from pending invites
            realtor.pendingInvites.splice(inviteIndex, 1)
          }
        }
      }

      // Save back to localStorage
      localStorage.setItem("buyhome_all_realtors", JSON.stringify(realtors))
    }
  } catch (error) {
    console.error("[InviteCodeService] Error updating old system:", error)
  }

  console.log(`[InviteCodeService] Successfully marked invite code as used: ${normalizedCode}`)
  return true
}

// Debug function to list all invite codes
export function debugListAllInviteCodes(): void {
  try {
    const codes = getAllInviteCodes()
    console.log("[InviteCodeService] All invite codes:", codes)

    // Also check the old system
    const realtorsJson = localStorage.getItem("buyhome_all_realtors")
    if (realtorsJson) {
      const realtors = JSON.parse(realtorsJson)
      console.log("[InviteCodeService] Checking old system for invite codes")

      for (const realtor of realtors) {
        if (realtor.pendingInvites && realtor.pendingInvites.length > 0) {
          console.log(
            `[InviteCodeService] Realtor ${realtor.id} has ${realtor.pendingInvites.length} pending invites:`,
            realtor.pendingInvites,
          )
        }
      }
    }

    // Check pending invites
    const pendingInvitesJson = localStorage.getItem("buyhome_pending_invites")
    if (pendingInvitesJson) {
      try {
        const pendingInvites = JSON.parse(pendingInvitesJson)
        console.log("[InviteCodeService] Found pending invites:", pendingInvites)
      } catch (error) {
        console.error("[InviteCodeService] Error parsing pending invites:", error)
      }
    }
  } catch (error) {
    console.error("[InviteCodeService] Error listing invite codes:", error)
  }
}

// Debug function to clear all invite codes (for testing)
export function debugClearAllInviteCodes(): void {
  try {
    saveAllInviteCodes([])
    console.log("[InviteCodeService] Cleared all invite codes")
  } catch (error) {
    console.error("[InviteCodeService] Error clearing invite codes:", error)
  }
}

// Debug function to add a test invite code
export function debugAddTestInviteCode(email = "test@example.com", realtorId = "r1"): InviteCode {
  const code = "TEST1234"

  const inviteCode: InviteCode = {
    code,
    email,
    realtorId,
    status: "pending",
    createdAt: new Date().toISOString(),
  }

  const allCodes = getAllInviteCodes()

  // Check if code already exists
  const existingIndex = allCodes.findIndex((c) => c.code.toUpperCase() === code)
  if (existingIndex >= 0) {
    // Remove existing code
    allCodes.splice(existingIndex, 1)
  }

  // Add the new code
  allCodes.push(inviteCode)
  saveAllInviteCodes(allCodes)

  console.log(`[InviteCodeService] Added test invite code: ${code} for email: ${email}`)
  return inviteCode
}
