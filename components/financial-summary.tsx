"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useState, useEffect } from "react"

export function FinancialSummary() {
  const [financialData, setFinancialData] = useState({
    preQualifiedAmount: 0,
    creditScore: 0,
    debtToIncomeRatio: 0,
    savingsForDownPayment: 0,
    monthlyPaymentEstimate: 0,
  })

  useEffect(() => {
    // Simulate loading financial data
    const timer = setTimeout(() => {
      setFinancialData({
        preQualifiedAmount: 350000,
        creditScore: 720,
        debtToIncomeRatio: 32,
        savingsForDownPayment: 50000,
        monthlyPaymentEstimate: 1850,
      })
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const getCreditScoreColor = (score: number) => {
    if (score >= 740) return "text-green-600"
    if (score >= 670) return "text-yellow-600"
    return "text-red-600"
  }

  const getDebtToIncomeColor = (ratio: number) => {
    if (ratio <= 36) return "text-green-600"
    if (ratio <= 43) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Financial Summary</CardTitle>
        <CardDescription>Your current financial readiness for home buying</CardDescription>
      </CardHeader>
      <CardContent>
        {financialData.preQualifiedAmount === 0 ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ff6a00]"></div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Pre-Qualified Amount</span>
                <span className="text-sm font-bold">${financialData.preQualifiedAmount.toLocaleString()}</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Credit Score</span>
                <span className={`text-sm font-bold ${getCreditScoreColor(financialData.creditScore)}`}>
                  {financialData.creditScore}
                </span>
              </div>
              <Progress value={financialData.creditScore / 8.5} className="h-2" />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Debt-to-Income Ratio</span>
                <span className={`text-sm font-bold ${getDebtToIncomeColor(financialData.debtToIncomeRatio)}`}>
                  {financialData.debtToIncomeRatio}%
                </span>
              </div>
              <Progress value={100 - financialData.debtToIncomeRatio} className="h-2" />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Down Payment Savings</span>
                <span className="text-sm font-bold">${financialData.savingsForDownPayment.toLocaleString()}</span>
              </div>
              <div className="text-xs text-gray-500">
                {Math.round((financialData.savingsForDownPayment / financialData.preQualifiedAmount) * 100)}% of
                purchase price
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Est. Monthly Payment</span>
                <span className="text-sm font-bold">${financialData.monthlyPaymentEstimate.toLocaleString()}/mo</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
