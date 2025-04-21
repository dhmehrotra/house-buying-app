"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChatAssistant } from "@/components/chat-assistant"
import { PropertyCard } from "@/components/property-card"
import { useRouter } from "next/navigation"
import { ArrowLeft, ArrowRight, Check } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useStepCompletion } from "@/hooks/use-step-completion"

export default function PropertyPreselectionStatusPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [savedProperties, setSavedProperties] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { markStepComplete } = useStepCompletion()

  useEffect(() => {
    // Simulate loading saved properties
    const timer = setTimeout(() => {
      const storedProperties = localStorage.getItem("savedProperties")
      if (storedProperties) {
        setSavedProperties(JSON.parse(storedProperties))
      }
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const handleMarkComplete = () => {
    markStepComplete("step4")
    toast({
      title: "Step completed!",
      description: "You've completed the Property Pre-Selection & Status step.",
    })
  }

  const handleNextStep = () => {
    router.push("/buyer/offer-preparation")
  }

  // Add this function to handle previous step navigation
  const handlePreviousStep = () => {
    router.push("/buyer/property-search")
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-[#002b40] mb-6">Property Pre-Selection & Status</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Your Saved Properties</CardTitle>
              <CardDescription>Review and manage the properties you've saved during your search.</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center h-40">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ff6a00]"></div>
                </div>
              ) : savedProperties.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {savedProperties.map((property, index) => (
                    <PropertyCard key={index} property={property} showActions={true} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">You haven't saved any properties yet.</p>
                  <Button
                    onClick={() => router.push("/buyer/property-search")}
                    className="bg-[#ff6a00] hover:bg-[#e05e00] text-white"
                  >
                    Go to Property Search
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Property Status Tracking</CardTitle>
              <CardDescription>Keep track of your progress with each property you're interested in.</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="interested">
                <TabsList className="mb-4">
                  <TabsTrigger value="interested">Interested</TabsTrigger>
                  <TabsTrigger value="viewed">Viewed</TabsTrigger>
                  <TabsTrigger value="offer">Offer Planned</TabsTrigger>
                  <TabsTrigger value="not-interested">Not Interested</TabsTrigger>
                </TabsList>
                <TabsContent value="interested">
                  {savedProperties.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {savedProperties.slice(0, 2).map((property, index) => (
                        <PropertyCard key={index} property={property} showActions={true} />
                      ))}
                    </div>
                  ) : (
                    <p className="text-center py-4 text-gray-500">No properties marked as interested.</p>
                  )}
                </TabsContent>
                <TabsContent value="viewed">
                  <p className="text-center py-4 text-gray-500">No properties marked as viewed.</p>
                </TabsContent>
                <TabsContent value="offer">
                  <p className="text-center py-4 text-gray-500">No properties marked for offer.</p>
                </TabsContent>
                <TabsContent value="not-interested">
                  <p className="text-center py-4 text-gray-500">No properties marked as not interested.</p>
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="flex justify-between">
              {/* Add the Previous Step button here */}
              <Button variant="outline" onClick={handlePreviousStep} className="flex items-center gap-2">
                <ArrowLeft size={16} />
                Previous: Property Search
              </Button>
              <div className="flex gap-4">
                <Button variant="outline" onClick={handleMarkComplete} className="flex items-center gap-2">
                  <Check size={16} />
                  Mark Step Complete
                </Button>
                <Button
                  onClick={handleNextStep}
                  className="bg-[#ff6a00] hover:bg-[#e05e00] text-white flex items-center gap-2"
                >
                  Next: Offer Preparation
                  <ArrowRight size={16} />
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <div className="mb-6">
            <ChatAssistant context="property-selection" />
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Property Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 mb-4">
                Compare your saved properties side by side to help make your decision.
              </p>
              <Button
                className="w-full bg-[#002b40] hover:bg-[#003b5c] text-white"
                disabled={savedProperties.length < 2}
              >
                Compare Selected Properties
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Schedule a Viewing</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 mb-4">
                Ready to see a property in person? Schedule a viewing with your realtor.
              </p>
              <Button className="w-full bg-[#002b40] hover:bg-[#003b5c] text-white">Request a Viewing</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
