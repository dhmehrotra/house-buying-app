"use client"

import { useRouter } from "next/navigation"
import { ArrowRight, BookOpen, CheckCircle, Clock, Users } from "lucide-react"
import { motion } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useUser } from "@/contexts/user-context"

export default function IntroPage() {
  const router = useRouter()
  const { user, setUser } = useUser()

  // The 9 steps of the home buying journey
  const steps = [
    {
      title: "Pre-Qualification & Financial Readiness",
      subtitle: "Understand your budget and get pre-approved",
    },
    {
      title: "Needs Assessment",
      subtitle: "Define what you're looking for in a home",
    },
    {
      title: "Property Search",
      subtitle: "Find properties that match your criteria",
    },
    {
      title: "Property Pre-Selection & Status",
      subtitle: "Narrow down your options",
    },
    {
      title: "Offer & Negotiation",
      subtitle: "Make an offer and negotiate terms",
    },
    {
      title: "Due Diligence",
      subtitle: "Inspect and evaluate the property",
    },
    {
      title: "Financing & Closing Preparation",
      subtitle: "Finalize your mortgage and prepare for closing",
    },
    {
      title: "Closing",
      subtitle: "Sign papers and get your keys",
    },
    {
      title: "Post-Transaction Support",
      subtitle: "Settle into your new home",
    },
  ]

  const handleBeginJourney = () => {
    // In a real app, you would update the user's progress in the database
    localStorage.setItem("buyhome_completed_intro", "true")

    // Update the user's current step
    if (user) {
      const updatedUser = {
        ...user,
        currentStep: 1,
      }
      setUser(updatedUser)
    }

    router.push("/dashboard/pre-qualification")
  }

  // Animation variants for staggered children
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 text-center md:text-left"
      >
        <h1 className="text-3xl md:text-4xl font-bold text-[#2B2D42]">Welcome to Your Home Buying Journey</h1>
        <p className="mt-3 text-lg text-muted-foreground">
          We'll guide you through every step — from pre-approval to post-close.
        </p>
      </motion.div>

      {/* Main Content - 2 Column Layout */}
      <div className="flex flex-col space-y-8">
        {/* Cards Container - Equal Height */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Left Column - Journey Steps */}
          <motion.div className="md:col-span-7 flex" variants={container} initial="hidden" animate="show">
            <Card className="bg-white shadow-md rounded-xl overflow-hidden border-0 w-full">
              <CardContent className="p-6 md:p-8">
                <h2 className="text-xl font-bold text-[#2B2D42] mb-6">Your 9-Step Journey</h2>

                <motion.div className="space-y-6" variants={container}>
                  {steps.map((step, index) => (
                    <motion.div key={index} className="flex items-start gap-4" variants={item}>
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#2B2D42] text-white">
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="font-medium text-[#2B2D42]">{step.title}</h3>
                        <p className="text-sm text-muted-foreground">{step.subtitle}</p>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Right Column - What to Expect */}
          <motion.div
            className="md:col-span-5 flex"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="bg-muted shadow-md rounded-xl border-0 w-full">
              <CardContent className="p-6 md:p-8">
                <h2 className="text-xl font-bold text-[#2B2D42] mb-6">What to Expect</h2>

                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EF8354]/10 text-[#EF8354]">
                      <CheckCircle className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium text-[#2B2D42]">Step-by-Step Guidance</h3>
                      <p className="text-sm text-muted-foreground">Clear instructions at each stage of the process</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EF8354]/10 text-[#EF8354]">
                      <Users className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium text-[#2B2D42]">Realtor Support</h3>
                      <p className="text-sm text-muted-foreground">
                        Your realtor will be with you throughout the journey
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EF8354]/10 text-[#EF8354]">
                      <BookOpen className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium text-[#2B2D42]">Educational Resources</h3>
                      <p className="text-sm text-muted-foreground">Helpful articles to make informed decisions</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EF8354]/10 text-[#EF8354]">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium text-[#2B2D42]">Progress Tracking</h3>
                      <p className="text-sm text-muted-foreground">Monitor your progress and see what's coming next</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Centered CTA Button - Outside of both cards */}
        <motion.div
          className="flex justify-center w-full mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Button
            onClick={handleBeginJourney}
            className="bg-[#EF8354] hover:bg-[#EF8354]/90 text-white rounded-full px-10 py-6 h-auto text-lg shadow-md"
          >
            Begin My Journey
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </motion.div>
      </div>
    </div>
  )
}
