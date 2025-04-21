"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowRight, Clock, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useRealtor } from "@/contexts/realtor-context"
import { getAllInviteCodes, type InviteCode } from "@/lib/invite-code-service"
import { RealtorLayout } from "@/components/realtor/realtor-layout"

export default function RealtorDashboardPage() {
  const router = useRouter()
  const { realtor, buyers, isLoading } = useRealtor()
  const [pendingInvites, setPendingInvites] = useState<InviteCode[]>([])
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  useEffect(() => {
    // Check if we're in the browser
    if (typeof window !== "undefined") {
      // Redirect to login if no realtor is found and loading is complete
      if (!isLoading && !realtor) {
        console.log("No realtor found, redirecting to login")
        router.push("/realtor/login")
        return
      }
    }
  }, [realtor, isLoading, router])

  // Load pending invites
  useEffect(() => {
    if (realtor) {
      // Get all invite codes
      const allCodes = getAllInviteCodes()

      // Filter for pending invites created by this realtor
      const pendingCodes = allCodes.filter((code) => code.realtorId === realtor.id && code.status === "pending")

      setPendingInvites(pendingCodes)
    }
  }, [realtor])

  const copyToClipboard = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopiedCode(code)

      // Reset copied state after 2 seconds
      setTimeout(() => setCopiedCode(null), 2000)
    } catch (error) {
      console.error("Failed to copy:", error)
    }
  }

  // Show loading while checking authentication
  if (isLoading || !realtor) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
      </div>
    )
  }

  // Filter buyers by status
  const activeBuyers = buyers.filter((buyer) => buyer.status === "Active" && buyer.realtorId === realtor?.id)
  const completedBuyers = buyers.filter((buyer) => buyer.status === "Completed" && buyer.realtorId === realtor?.id)

  // Get buyers by step
  const buyersByStep = Array(9)
    .fill(0)
    .map((_, i) => activeBuyers.filter((buyer) => buyer.currentStep === i + 1).length)

  // Get recent buyers (last 30 days)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const recentBuyers = buyers.filter(
    (buyer) => buyer.realtorId === realtor?.id && new Date(buyer.createdAt) > thirtyDaysAgo,
  )

  return (
    <RealtorLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Welcome, {realtor?.name || "Realtor"}</h1>
          <p className="text-muted-foreground">Manage your clients and track their home buying progress.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Active Clients</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{activeBuyers.length}</div>
              <p className="text-sm text-muted-foreground mt-1">Clients currently in the buying process</p>
            </CardContent>
            <CardFooter>
              <Button asChild variant="ghost" size="sm" className="text-accent">
                <Link href="/realtor/clients">
                  View All Clients <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Buyers in Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {activeBuyers.filter((b) => b.currentStep > 1 && b.currentStep < 9).length}
              </div>
              <p className="text-sm text-muted-foreground mt-1">Clients actively house hunting</p>
            </CardContent>
            <CardFooter>
              <Button asChild variant="ghost" size="sm" className="text-accent">
                <Link href="/realtor/clients">
                  View Active Buyers <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Completed Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{completedBuyers.length}</div>
              <p className="text-sm text-muted-foreground mt-1">Successfully closed deals</p>
            </CardContent>
            <CardFooter>
              <Button asChild variant="ghost" size="sm" className="text-accent">
                <Link href="/realtor/clients?status=Completed">
                  View Completed <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Client Journey Progress</CardTitle>
            <CardDescription>Number of clients at each stage of the home buying process</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                "Pre-Qualification",
                "Needs Assessment",
                "Property Search",
                "Property Pre-Selection",
                "Offer & Negotiation",
                "Due Diligence",
                "Financing & Closing Prep",
                "Closing",
                "Post-Transaction Support",
              ].map((stage, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-48 text-sm">{stage}</div>
                  <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent rounded-full"
                      style={{
                        width: `${buyersByStep[index] ? Math.min(100, (buyersByStep[index] / activeBuyers.length) * 100) : 0}%`,
                      }}
                    ></div>
                  </div>
                  <div className="w-8 text-sm font-medium text-right">{buyersByStep[index]}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {recentBuyers.length > 0 ? (
                <div className="space-y-4">
                  {recentBuyers.slice(0, 5).map((buyer) => (
                    <div key={buyer.id} className="flex items-start gap-3">
                      <div className="mt-0.5 h-2 w-2 rounded-full bg-accent"></div>
                      <div>
                        <p className="text-sm font-medium">New client added: {buyer.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(buyer.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <Clock className="h-10 w-10 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No recent activity</p>
                  <p className="text-sm text-muted-foreground mt-1">Add new clients to see activity here</p>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button asChild variant="outline" className="w-full">
                <Link href="/realtor/clients">View All Clients</Link>
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button asChild className="w-full bg-accent hover:bg-accent/90">
                <Link href="/realtor/new-buyer">
                  <Users className="mr-2 h-4 w-4" />
                  Invite New Buyer
                </Link>
              </Button>

              <Button asChild variant="outline" className="w-full">
                <Link href="/realtor/clients">View All Clients</Link>
              </Button>

              <Button asChild variant="outline" className="w-full">
                <Link href="#">Schedule Viewings</Link>
              </Button>

              <Button asChild variant="outline" className="w-full">
                <Link href="#">Generate Reports</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </RealtorLayout>
  )
}
