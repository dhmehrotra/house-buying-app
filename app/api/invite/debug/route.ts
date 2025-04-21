import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const code = url.searchParams.get("code")

    if (code) {
      // Look up a specific code
      const normalizedCode = code.trim().toUpperCase()
      let foundCode = null

      // Check in buyhome_invite_codes
      try {
        if (typeof window !== "undefined") {
          const inviteCodesJson = localStorage.getItem("buyhome_invite_codes")
          if (inviteCodesJson) {
            const inviteCodes = JSON.parse(inviteCodesJson)
            foundCode = inviteCodes.find(
              (invite: any) => invite.code && invite.code.trim().toUpperCase() === normalizedCode,
            )

            if (foundCode) {
              return NextResponse.json({
                success: true,
                message: "Invite code found in buyhome_invite_codes",
                data: foundCode,
                source: "buyhome_invite_codes",
              })
            }
          }
        }
      } catch (error) {
        console.error("Error checking buyhome_invite_codes:", error)
      }

      // Check in buyhome_pending_invites
      try {
        if (typeof window !== "undefined") {
          const pendingInvitesJson = localStorage.getItem("buyhome_pending_invites")
          if (pendingInvitesJson) {
            const pendingInvites = JSON.parse(pendingInvitesJson)
            const foundInvite = pendingInvites.find(
              (invite: any) => invite.inviteCode && invite.inviteCode.trim().toUpperCase() === normalizedCode,
            )

            if (foundInvite) {
              return NextResponse.json({
                success: true,
                message: "Invite code found in buyhome_pending_invites",
                data: foundInvite,
                source: "buyhome_pending_invites",
              })
            }
          }
        }
      } catch (error) {
        console.error("Error checking buyhome_pending_invites:", error)
      }

      // Check in realtors' pendingInvites
      try {
        if (typeof window !== "undefined") {
          const realtorsJson = localStorage.getItem("buyhome_all_realtors")
          if (realtorsJson) {
            const realtors = JSON.parse(realtorsJson)

            for (const realtor of realtors) {
              if (realtor.pendingInvites) {
                const foundInvite = realtor.pendingInvites.find(
                  (invite: any) => invite.inviteCode && invite.inviteCode.trim().toUpperCase() === normalizedCode,
                )

                if (foundInvite) {
                  return NextResponse.json({
                    success: true,
                    message: "Invite code found in realtor.pendingInvites",
                    data: {
                      ...foundInvite,
                      realtorId: realtor.id,
                    },
                    source: "realtor.pendingInvites",
                  })
                }
              }
            }
          }
        }
      } catch (error) {
        console.error("Error checking realtors:", error)
      }

      return NextResponse.json({
        success: false,
        message: "Invite code not found",
        data: null,
      })
    }

    // Get all invite codes
    const allCodes = {
      buyhome_invite_codes: [],
      buyhome_pending_invites: [],
      realtor_pending_invites: [],
    }

    // Check buyhome_invite_codes
    try {
      if (typeof window !== "undefined") {
        const inviteCodesJson = localStorage.getItem("buyhome_invite_codes")
        if (inviteCodesJson) {
          allCodes.buyhome_invite_codes = JSON.parse(inviteCodesJson)
        }
      }
    } catch (error) {
      console.error("Error checking buyhome_invite_codes:", error)
    }

    // Check buyhome_pending_invites
    try {
      if (typeof window !== "undefined") {
        const pendingInvitesJson = localStorage.getItem("buyhome_pending_invites")
        if (pendingInvitesJson) {
          allCodes.buyhome_pending_invites = JSON.parse(pendingInvitesJson)
        }
      }
    } catch (error) {
      console.error("Error checking buyhome_pending_invites:", error)
    }

    // Check realtors' pendingInvites
    try {
      if (typeof window !== "undefined") {
        const realtorsJson = localStorage.getItem("buyhome_all_realtors")
        if (realtorsJson) {
          const realtors = JSON.parse(realtorsJson)

          for (const realtor of realtors) {
            if (realtor.pendingInvites && realtor.pendingInvites.length > 0) {
              for (const invite of realtor.pendingInvites) {
                allCodes.realtor_pending_invites.push({
                  ...invite,
                  realtorId: realtor.id,
                })
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("Error checking realtors:", error)
    }

    return NextResponse.json({
      success: true,
      message: "Retrieved all invite codes",
      data: allCodes,
    })
  } catch (error) {
    console.error("Error in GET /api/invite/debug:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Error retrieving invite codes",
        error: String(error),
      },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const { action, code, email, realtorId } = data

    if (action === "add_test") {
      // Generate a test invite code
      const testCode = code || "TEST1234"
      const testEmail = email || "test@example.com"
      const testRealtorId = realtorId || "r1"

      // Add to buyhome_invite_codes
      try {
        if (typeof window !== "undefined") {
          const inviteCodesJson = localStorage.getItem("buyhome_invite_codes")
          let inviteCodes = []

          if (inviteCodesJson) {
            inviteCodes = JSON.parse(inviteCodesJson)
          }

          // Check if code already exists
          const existingIndex = inviteCodes.findIndex(
            (c: any) => c.code && c.code.trim().toUpperCase() === testCode.trim().toUpperCase(),
          )

          if (existingIndex >= 0) {
            // Remove existing code
            inviteCodes.splice(existingIndex, 1)
          }

          // Add the new code
          const newCode = {
            code: testCode,
            email: testEmail,
            realtorId: testRealtorId,
            status: "pending",
            createdAt: new Date().toISOString(),
          }

          inviteCodes.push(newCode)
          localStorage.setItem("buyhome_invite_codes", JSON.stringify(inviteCodes))

          return NextResponse.json({
            success: true,
            message: "Added test invite code",
            data: newCode,
          })
        }
      } catch (error) {
        console.error("Error adding test code:", error)
      }
    }

    if (action === "clear_all") {
      // Clear all invite codes
      try {
        if (typeof window !== "undefined") {
          localStorage.setItem("buyhome_invite_codes", JSON.stringify([]))
          localStorage.setItem("buyhome_pending_invites", JSON.stringify([]))

          // Also clear from realtors
          const realtorsJson = localStorage.getItem("buyhome_all_realtors")
          if (realtorsJson) {
            const realtors = JSON.parse(realtorsJson)

            for (const realtor of realtors) {
              realtor.pendingInvites = []
            }

            localStorage.setItem("buyhome_all_realtors", JSON.stringify(realtors))
          }

          return NextResponse.json({
            success: true,
            message: "Cleared all invite codes",
          })
        }
      } catch (error) {
        console.error("Error clearing invite codes:", error)
      }
    }

    return NextResponse.json(
      {
        success: false,
        message: "Invalid action",
      },
      { status: 400 },
    )
  } catch (error) {
    console.error("Error in POST /api/invite/debug:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Error processing request",
        error: String(error),
      },
      { status: 500 },
    )
  }
}
