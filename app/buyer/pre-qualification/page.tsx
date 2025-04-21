"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ChatAssistant } from "@/components/chat-assistant"
import { FinancialSummary } from "@/components/financial-summary"
import { ArrowRight, Check } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { useStepCompletion } from "@/hooks/use-step-completion"

export default function PreQualificationPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { markStepComplete } = useStepCompletion()

  const handleMarkComplete = () => {
    markStepComplete("step1")
    toast({
      title: "Step completed!",
      description: "You've completed the Pre-Qualification & Financial Readiness step.",
    })
  }

  const handleNextStep = () => {
    router.push("/buyer/needs-assessment")
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-[#002b40] mb-6">Pre-Qualification & Financial Readiness</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left content (2/3 width) */}
        <div className="lg:col-span-2">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Why Get Pre-Qualified?</CardTitle>
              <CardDescription>
                Understanding the importance of pre-qualification in your home buying journey.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Getting pre-qualified for a mortgage is an important first step in your home buying journey. It gives
                you an estimate of how much you might be able to borrow and shows sellers that you're a serious buyer.
              </p>
              <p className="mb-4">
                During pre-qualification, lenders will look at your income, assets, and debts to determine how much they
                might be willing to lend you. This helps you understand your budget and narrow down your home search.
              </p>
              <p>
                Pre-qualification is different from pre-approval. Pre-qualification is a quick estimate based on
                information you provide, while pre-approval involves verification of your financial information and is a
                more formal step.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>What You'll Need</CardTitle>
              <CardDescription>
                Documents and information you'll need for the pre-qualification process.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 space-y-2">
                <li>Recent pay stubs</li>
                <li>W-2s or tax returns from the past two years</li>
                <li>Bank statements</li>
                <li>Information about your assets (retirement accounts, investments, etc.)</li>
                <li>Details about your debts (credit cards, student loans, car loans, etc.)</li>
                <li>Employment history</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Next Steps</CardTitle>
              <CardDescription>What to expect after you've been pre-qualified.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Once you're pre-qualified, you'll receive a pre-qualification letter that you can show to sellers when
                making an offer. This letter typically includes the loan amount you're qualified for and is valid for a
                specific period (usually 60-90 days).
              </p>
              <p>
                Remember that pre-qualification is just an estimate. The actual loan amount you're approved for may
                change based on the formal verification of your financial information during the pre-approval process.
              </p>
            </CardContent>
            <CardFooter className="flex justify-end gap-4">
              <Button variant="outline" onClick={handleMarkComplete} className="flex items-center gap-2">
                <Check size={16} />
                Mark Step Complete
              </Button>
              <Button
                onClick={handleNextStep}
                className="bg-[#ff6a00] hover:bg-[#e05e00] text-white flex items-center gap-2"
              >
                Next: Needs Assessment
                <ArrowRight size={16} />
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Right sidebar (1/3 width) */}
        <div className="lg:col-span-1 space-y-6">
          {/* FIRST: AI Assistant at the top right */}
          <div className="w-full mb-6">
            <ChatAssistant context="pre-qualification" minHeight="500px" />
          </div>

          {/* SECOND: Financial Summary below AI Assistant */}
          <div className="w-full mb-6">
            <FinancialSummary />
          </div>

          {/* Suggested Next Steps */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Suggested Next Steps</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <div className="bg-green-100 text-green-800 rounded-full p-1 mt-0.5">
                    <Check size={14} />
                  </div>
                  <span>Contact 3-5 lenders for pre-qualification quotes</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="bg-green-100 text-green-800 rounded-full p-1 mt-0.5">
                    <Check size={14} />
                  </div>
                  <span>Gather your financial documents</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="bg-green-100 text-green-800 rounded-full p-1 mt-0.5">
                    <Check size={14} />
                  </div>
                  <span>Review your credit report for errors</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Educational Resources */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Educational Resources</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="text-blue-600 hover:underline cursor-pointer">Understanding Mortgage Types</li>
                <li className="text-blue-600 hover:underline cursor-pointer">How to Improve Your Credit Score</li>
                <li className="text-blue-600 hover:underline cursor-pointer">First-Time Homebuyer Programs</li>
              </ul>
            </CardContent>
          </Card>

          {/* Message Realtor */}
          <Card>
            <CardHeader>
              <CardTitle>Message Your Realtor</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 mb-4">
                Have questions about pre-qualification? Your realtor is here to help.
              </p>
              <Button className="w-full bg-[#002b40] hover:bg-[#003b5c] text-white">Contact Realtor</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
