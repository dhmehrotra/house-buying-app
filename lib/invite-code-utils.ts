// Helper functions for invite code management

// Store an invite code in multiple locations for redundancy
export function storeInviteCode(email: string, inviteCode: string, realtorId: string) {
  try {
    // 1. Store in dedicated invite codes storage
    const storedCodes = localStorage.getItem("buyhome_invite_codes") || "[]"
    const codes = JSON.parse(storedCodes)

    codes.push({
      email,
      inviteCode,
      realtorId,
      createdAt: new Date().toISOString(),
    })

    localStorage.setItem("buyhome_invite_codes", JSON.stringify(codes))
    console.log("Stored invite code in dedicated storage:", inviteCode)

    // 2. Store in pending invites
    const storedInvites = localStorage.getItem("buyhome_pending_invites") || "[]"
    const invites = JSON.parse(storedInvites)

    invites.push({
      email,
      inviteCode,
      realtorId,
      createdAt: new Date().toISOString(),
    })

    localStorage.setItem("buyhome_pending_invites", JSON.stringify(invites))

    // 3. Update realtor's pending invites
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
            inviteCode,
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

    return true
  } catch (error) {
    console.error("Failed to store invite code:", error)
    return false
  }
}

// Validate an invite code across all storage locations
export function validateInviteCode(code: string): { valid: boolean; realtorId: string | null } {
  if (!code) return { valid: false, realtorId: null }

  // Normalize the code for comparison
  const normalizedCode = code.trim().toUpperCase()

  console.log("Validating invite code (normalized):", normalizedCode)

  try {
    // Check in dedicated invite codes storage
    const storedCodes = localStorage.getItem("buyhome_invite_codes")
    if (storedCodes) {
      const codes = JSON.parse(storedCodes)
      console.log("Checking dedicated invite codes storage:", codes)

      const matchingCode = codes.find((c: any) => c.inviteCode && c.inviteCode.trim().toUpperCase() === normalizedCode)

      if (matchingCode) {
        console.log("Found matching code in dedicated storage:", matchingCode)
        return { valid: true, realtorId: matchingCode.realtorId }
      }
    }

    // Check in pending invites
    const pendingInvites = localStorage.getItem("buyhome_pending_invites")
    if (pendingInvites) {
      const invites = JSON.parse(pendingInvites)
      console.log("Checking pending invites:", invites)

      const matchingInvite = invites.find(
        (invite: any) => invite.inviteCode && invite.inviteCode.trim().toUpperCase() === normalizedCode,
      )

      if (matchingInvite) {
        console.log("Found matching invite in pending invites:", matchingInvite)
        return { valid: true, realtorId: matchingInvite.realtorId }
      }
    }

    // Check in realtors' pendingInvites
    const allRealtors = localStorage.getItem("buyhome_all_realtors")
    if (allRealtors) {
      const realtors = JSON.parse(allRealtors)
      console.log("Checking realtors for invite code:", realtors)

      for (const realtor of realtors) {
        if (realtor.pendingInvites && Array.isArray(realtor.pendingInvites)) {
          const invite = realtor.pendingInvites.find(
            (inv: any) => inv.inviteCode && inv.inviteCode.trim().toUpperCase() === normalizedCode,
          )

          if (invite) {
            console.log("Found matching invite in realtor pending invites:", invite, "for realtor:", realtor.id)
            return { valid: true, realtorId: realtor.id }
          }
        }
      }
    }

    // Check in existing buyers (in case it's a reused code)
    const allBuyers = localStorage.getItem("buyhome_all_buyers")
    if (allBuyers) {
      const buyers = JSON.parse(allBuyers)
      console.log("Checking buyers for invite code:", buyers)

      const buyerWithCode = buyers.find(
        (buyer: any) => buyer.inviteCode && buyer.inviteCode.trim().toUpperCase() === normalizedCode,
      )

      if (buyerWithCode) {
        console.log("Found matching invite code in existing buyers:", buyerWithCode)
        return { valid: true, realtorId: buyerWithCode.realtorId }
      }
    }

    // For testing purposes, accept some hardcoded codes
    if (normalizedCode === "TEST1234" || normalizedCode === "DEMO5678") {
      console.log("Using test invite code")
      return { valid: true, realtorId: "r1" }
    }

    console.log("No valid invite code found")
    return { valid: false, realtorId: null }
  } catch (error) {
    console.error("Error validating invite code:", error)
    return { valid: false, realtorId: null }
  }
}
