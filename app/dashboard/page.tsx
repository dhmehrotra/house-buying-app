"use client"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowRight, CheckCircle, Clock, LockIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useUser } from "@/contexts/user-context"

export default function DashboardPage() {
  const { user } = useUser()
  const router = useRouter()

  // Calculate progress percentage
  const progressPercentage = user?.currentStep ? Math.round((user.currentStep / 9) * 100) : 0

  // Determine if user has started the journey
  const hasStartedJourney =
    typeof window !== "undefined" &&
    (localStorage.getItem("buyhome_completed_intro") === "true" || (user?.currentStep && user.currentStep > 1))

  // Get the next step URL based on current step
  const getNextStepUrl = () => {
    if (!user?.currentStep) return "/dashboard/intro"

    switch (user.currentStep) {
      case 1:
        return "/dashboard/pre-qualification"
      case 2:
        return "/dashboard/needs-assessment"
      case 3:
        return "/dashboard/property-search"
      case 4:
        return "/dashboard/property-pre-selection"
      case 5:
        return "/dashboard/offer-negotiation"
      case 6:
        return "/dashboard/due-diligence"
      case 7:
        return "/dashboard/financing-closing"
      case 8:
        return "/dashboard/closing"
      case 9:
        return "/dashboard/post-transaction"
      default:
        return "/dashboard/intro"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Welcome, {user?.firstName || "User"}</h1>
        <p className="text-muted-foreground">Track your home buying progress and continue your journey.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Home Buying Progress</CardTitle>
          <CardDescription>
            You've completed {user?.currentStep ? user.currentStep - 1 : 0} of 9 steps ({progressPercentage}%)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={progressPercentage} className="h-2" />
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-sm">{user?.currentStep ? user.currentStep - 1 : 0} Steps Completed</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-500" />
              <span className="text-sm">1 Step In Progress</span>
            </div>
            <div className="flex items-center gap-2">
              <LockIcon className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm">{9 - (user?.currentStep || 1)} Steps Remaining</span>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button asChild className="bg-accent hover:bg-accent/90">
            <Link href={getNextStepUrl()}>
              Continue Your Journey <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardFooter>
      </Card>

      {/* Intro Card - Only shown if user hasn't started their journey */}
      {!hasStartedJourney && (
        <Card className="bg-accent/10 border-accent">
          <CardHeader>
            <CardTitle>Start Your Home Buying Journey</CardTitle>
            <CardDescription>You haven't begun your home buying process yet.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Our guided 9-step process will help you navigate the home buying journey from start to finish.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild className="bg-accent hover:bg-accent/90">
              <Link href="/dashboard/intro">
                Begin My Journey <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Your Realtor</CardTitle>
            <CardDescription>Sarah Thompson</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-muted"></div>
              <div>
                <p className="text-sm">ABC Realty Group</p>
                <p className="text-sm text-muted-foreground">10+ years experience</p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary/5">
              Contact Realtor
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Current Step</CardTitle>
            <CardDescription>Property Search</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Find properties that match your criteria and save your favorites.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full bg-accent hover:bg-accent/90">
              <Link href="/dashboard/property-search">
                Continue <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest actions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-2">
                <div className="mt-0.5 h-2 w-2 rounded-full bg-green-500"></div>
                <div>
                  <p className="text-sm font-medium">Needs Assessment Completed</p>
                  <p className="text-xs text-muted-foreground">2 days ago</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="mt-0.5 h-2 w-2 rounded-full bg-blue-500"></div>
                <div>
                  <p className="text-sm font-medium">Started Property Search</p>
                  <p className="text-xs text-muted-foreground">1 day ago</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="mt-0.5 h-2 w-2 rounded-full bg-blue-500"></div>
                <div>
                  <p className="text-sm font-medium">Saved 2 Properties</p>
                  <p className="text-xs text-muted-foreground">12 hours ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
