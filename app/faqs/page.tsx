import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Footer } from "@/components/footer"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Frequently Asked Questions | BuyHome ABC to XYZ",
  description: "Find answers to common questions about using BuyHome ABC to XYZ for your home buying journey.",
}

export default function FAQsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 container py-12">
        <div className="mb-8">
          <Button variant="ghost" size="sm" asChild className="mb-6">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
          <h1 className="text-3xl font-bold text-[#2B2D42]">Frequently Asked Questions</h1>
        </div>

        <div className="max-w-3xl mx-auto space-y-12">
          <section>
            <h2 className="text-2xl font-semibold mb-6">About BuyHome ABC to XYZ</h2>

            <div className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="font-medium mb-2">What is BuyHome ABC to XYZ?</h3>
                <p className="text-gray-700">
                  BuyHome ABC to XYZ is a step-by-step, AI-powered home buying platform that helps buyers navigate the
                  full process of purchasing a home—with guidance from their trusted real estate agent.
                </p>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="font-medium mb-2">Does this platform replace my agent?</h3>
                <p className="text-gray-700">
                  Not at all. The platform is designed to enhance your experience by combining AI-driven tools with the
                  personal support of your trusted realtor.
                </p>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="font-medium mb-2">How does BuyHome ABC to XYZ streamline communication?</h3>
                <p className="text-gray-700">
                  For buyers, this platform brings every step of the home buying journey—from qualification to closing
                  —into a single, AI-powered portal. You'll also have 24/7 guidance through an AI chat assistant trained
                  to reflect your agent's expertise. For realtors, all communication, documents, and progress tracking
                  are centralized in one place—making collaboration seamless.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-6">Getting Started</h2>

            <div className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="font-medium mb-2">How do I get started on BuyHome ABC to XYZ?</h3>
                <p className="text-gray-700">
                  To use this platform, you'll need an invite from a realtor who is already using BuyHome ABC to XYZ.
                  Your realtor will generate a unique invite code and send you an email to onboard. Once you've signed
                  up with that code, you'll be guided through your personalized home buying journey.
                </p>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="font-medium mb-2">Can I sign up directly as a buyer?</h3>
                <p className="text-gray-700">
                  Currently, buyers need an invite code from a realtor to access the platform. This ensures you have
                  professional support throughout your home buying journey. If you don't have a realtor yet, we can help
                  connect you with one in your area who uses our platform.
                </p>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="font-medium mb-2">Is there a cost to use BuyHome ABC to XYZ?</h3>
                <p className="text-gray-700">
                  For buyers, the platform is completely free to use. Your realtor covers the cost of the service as
                  part of their commitment to providing you with the best possible home buying experience.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-6">Using the Platform</h2>

            <div className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="font-medium mb-2">What features does the platform offer?</h3>
                <p className="text-gray-700">
                  BuyHome ABC to XYZ includes AI-powered tools for home search, offer strategy, document management, and
                  communication. You'll have access to a personalized dashboard that tracks your progress through each
                  step of the home buying process, from pre-qualification to closing.
                </p>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="font-medium mb-2">How does the AI assistant work?</h3>
                <p className="text-gray-700">
                  Our AI assistant is available 24/7 to answer your questions about the home buying process. It's
                  trained on real estate best practices and can provide guidance on everything from mortgage
                  pre-approval to closing procedures. For questions specific to your situation, it will connect you
                  directly with your realtor.
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}
