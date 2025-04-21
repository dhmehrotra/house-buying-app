"use client"

import { ChatAssistant } from "@/components/chat-assistant"
import { FinancialSummary } from "@/components/financial-summary"

export default function PreQualificationPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold text-[#002b40] mb-6">Pre-Qualification & Financial Readiness</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left content (2/3 width) */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Why Get Pre-Qualified?</h2>
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
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">What You'll Need</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>Recent pay stubs</li>
                <li>W-2s or tax returns from the past two years</li>
                <li>Bank statements</li>
                <li>Information about your assets (retirement accounts, investments, etc.)</li>
                <li>Details about your debts (credit cards, student loans, car loans, etc.)</li>
                <li>Employment history</li>
              </ul>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Next Steps</h2>
              <p className="mb-4">
                Once you're pre-qualified, you'll receive a pre-qualification letter that you can show to sellers when
                making an offer. This letter typically includes the loan amount you're qualified for and is valid for a
                specific period (usually 60-90 days).
              </p>
              <p>
                Remember that pre-qualification is just an estimate. The actual loan amount you're approved for may
                change based on the formal verification of your financial information during the pre-approval process.
              </p>
            </div>
          </div>

          {/* Right sidebar (1/3 width) */}
          <div className="lg:col-span-1">
            {/* FIRST: AI Assistant at the top right */}
            <div style={{ marginBottom: "24px" }}>
              <div style={{ height: "500px", minHeight: "500px" }}>
                <ChatAssistant context="pre-qualification" minHeight="500px" />
              </div>
            </div>

            {/* SECOND: Financial Summary below AI Assistant */}
            <div style={{ marginTop: "24px", marginBottom: "24px" }}>
              <FinancialSummary />
            </div>

            {/* Any other components would go here in their original order */}
          </div>
        </div>
      </div>
    </div>
  )
}
