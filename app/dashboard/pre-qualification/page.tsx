"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowRight,
  CreditCard,
  DollarSign,
  HelpCircle,
  Home,
  MessageSquare,
  Percent,
  PiggyBank,
  Send,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"

export default function PreQualificationPage() {
  const router = useRouter()
  const { toast } = useToast()

  // Home Affordability Estimator state
  const [annualIncome, setAnnualIncome] = useState<number>(120000)
  const [monthlyIncome, setMonthlyIncome] = useState<number>(annualIncome / 12)
  const [incomeInputType, setIncomeInputType] = useState<"annual" | "monthly">("annual")
  const [monthlyDebt, setMonthlyDebt] = useState<number>(1000)
  const [downPaymentPercent, setDownPaymentPercent] = useState<number>(20)
  const [loanTermYears, setLoanTermYears] = useState<number>(30)
  const [interestRate, setInterestRate] = useState<number>(6.5)

  // Savings Readiness Tracker state
  const [currentSavings, setCurrentSavings] = useState<number>(50000)
  const [closingCostsPercent, setClosingCostsPercent] = useState<number>(3)
  const [emergencyReserveMonths, setEmergencyReserveMonths] = useState<number>(3)
  const [estimatedHomePrice, setEstimatedHomePrice] = useState<number>(400000)

  // Checklist state
  const [checklist, setChecklist] = useState({
    preApproved: false,
    financialDocuments: false,
    creditReport: false,
  })

  // AI Assistant state
  const [question, setQuestion] = useState<string>("")
  const [chatHistory, setChatHistory] = useState<Array<{ role: string; content: string }>>([
    {
      role: "assistant",
      content:
        "Hello! I'm your financial readiness assistant. How can I help you with your pre-qualification questions today?",
    },
  ])

  // Message Your Realtor state
  const [realtorMessage, setRealtorMessage] = useState<string>("")

  // Form completion state
  const [isFormComplete, setIsFormComplete] = useState<boolean>(false)

  // Handle income changes
  const handleAnnualIncomeChange = (value: number) => {
    setAnnualIncome(value)
    setMonthlyIncome(value / 12)
    setIncomeInputType("annual")
  }

  const handleMonthlyIncomeChange = (value: number) => {
    setMonthlyIncome(value)
    setAnnualIncome(value * 12)
    setIncomeInputType("monthly")
  }

  // Calculated values
  const monthlyBudget = monthlyIncome * 0.28

  // Calculate mortgage factor
  const monthlyInterestRate = interestRate / 100 / 12
  const numberOfPayments = loanTermYears * 12
  const factor = monthlyInterestRate / (1 - Math.pow(1 + monthlyInterestRate, -numberOfPayments))

  const maxLoanAmount = monthlyBudget / factor
  const maxHomePrice = maxLoanAmount / (1 - downPaymentPercent / 100)
  const estimatedMonthlyPayment = monthlyBudget

  // DTI Calculation
  const dtiRatio = (monthlyDebt / monthlyIncome) * 100

  // Savings Readiness Calculation
  const closingCosts = estimatedHomePrice * (closingCostsPercent / 100)
  const emergencyFund = monthlyIncome * emergencyReserveMonths
  const downPayment = estimatedHomePrice * 0.2
  const totalRequired = downPayment + closingCosts + emergencyFund
  const savingsGap = totalRequired - currentSavings
  const savingsSurplus = savingsGap < 0 ? Math.abs(savingsGap) : 0

  // Get DTI status color
  const getDtiStatusColor = () => {
    if (dtiRatio < 36) return "text-[#4CAF50]"
    if (dtiRatio <= 43) return "text-[#FFA500]"
    return "text-[#DC2626]"
  }

  // Get DTI status text
  const getDtiStatusText = () => {
    if (dtiRatio < 36) return "Excellent"
    if (dtiRatio <= 43) return "Acceptable"
    return "High Risk"
  }

  // Get DTI progress color
  const getDtiProgressColor = () => {
    if (dtiRatio < 36) return "bg-[#4CAF50]"
    if (dtiRatio <= 43) return "bg-[#FFA500]"
    return "bg-[#DC2626]"
  }

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value)
  }

  // Handle AI Assistant question
  const handleAskQuestion = () => {
    if (!question.trim()) return

    // Add user question to chat history
    setChatHistory([...chatHistory, { role: "user", content: question }])

    // Simulate AI response
    setTimeout(() => {
      let response =
        "I'm sorry, I don't have specific information about that. Please consult with your financial advisor or realtor for personalized advice."

      // Simple keyword matching for demo purposes
      if (question.toLowerCase().includes("dti") || question.toLowerCase().includes("debt")) {
        response =
          "DTI (Debt-to-Income) ratio is the percentage of your gross monthly income that goes toward paying debts. Lenders typically prefer a DTI ratio of 36% or less, though some may accept up to 43% for qualified borrowers."
      } else if (question.toLowerCase().includes("down payment")) {
        response =
          "A down payment is the upfront portion of the total purchase price that you pay in cash. While 20% is traditional to avoid PMI (Private Mortgage Insurance), many loan programs allow for lower down payments, such as 3.5% for FHA loans."
      } else if (question.toLowerCase().includes("interest rate") || question.toLowerCase().includes("rates")) {
        response =
          "Mortgage interest rates vary based on market conditions, your credit score, loan term, and loan type. Even a small difference in interest rate can significantly impact your monthly payment and the total cost of your loan over time."
      }

      setChatHistory([...chatHistory, { role: "user", content: question }, { role: "assistant", content: response }])
      setQuestion("")
    }, 1000)
  }

  // Handle sending message to realtor
  const handleSendMessage = () => {
    if (!realtorMessage.trim()) return

    toast({
      title: "Message Sent",
      description: "Your message has been sent to your agent.",
      duration: 3000,
    })

    setRealtorMessage("")
  }

  // Check if form is complete
  useEffect(() => {
    // Simple validation - check if all required fields have values
    if (
      monthlyIncome > 0 &&
      monthlyDebt >= 0 &&
      downPaymentPercent > 0 &&
      loanTermYears > 0 &&
      interestRate > 0 &&
      currentSavings >= 0 &&
      closingCostsPercent > 0 &&
      emergencyReserveMonths > 0 &&
      estimatedHomePrice > 0
    ) {
      setIsFormComplete(true)
    } else {
      setIsFormComplete(false)
    }
  }, [
    monthlyIncome,
    monthlyDebt,
    downPaymentPercent,
    loanTermYears,
    interestRate,
    currentSavings,
    closingCostsPercent,
    emergencyReserveMonths,
    estimatedHomePrice,
  ])

  // Mark the intro as completed when the user reaches this page
  useEffect(() => {
    localStorage.setItem("buyhome_completed_intro", "true")
  }, [])

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-[#2B2D42]">Pre-Qualification & Financial Readiness</h1>
        <p className="text-muted-foreground">
          Understand your budget and get financially prepared for your home purchase.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-7 space-y-6">
          {/* Home Affordability Estimator */}
          <Card className="bg-white rounded-xl shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-[#2B2D42]">
                <Home className="h-5 w-5 text-[#EF8354]" />
                Home Affordability Estimator
              </CardTitle>
              <CardDescription>
                Calculate how much home you can afford based on your income and expenses.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="annualIncome">Annual Income</Label>
                    <span className="text-sm font-medium">{formatCurrency(annualIncome)}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <Input
                      id="annualIncome"
                      type="number"
                      value={annualIncome}
                      onChange={(e) => handleAnnualIncomeChange(Number(e.target.value))}
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="monthlyIncome">Monthly Income</Label>
                    <span className="text-sm font-medium">{formatCurrency(monthlyIncome)}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <Input
                      id="monthlyIncome"
                      type="number"
                      value={monthlyIncome}
                      onChange={(e) => handleMonthlyIncomeChange(Number(e.target.value))}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="monthlyDebt">Monthly Debt</Label>
                  <span className="text-sm font-medium">{formatCurrency(monthlyDebt)}</span>
                </div>
                <div className="flex items-center gap-4">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <Input
                    id="monthlyDebt"
                    type="number"
                    value={monthlyDebt}
                    onChange={(e) => setMonthlyDebt(Number(e.target.value))}
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="downPaymentPercent">Down Payment (%)</Label>
                  <span className="text-sm font-medium">{downPaymentPercent}%</span>
                </div>
                <div className="flex items-center gap-4">
                  <Percent className="h-4 w-4 text-muted-foreground" />
                  <Slider
                    id="downPaymentPercent"
                    min={3}
                    max={50}
                    step={1}
                    value={[downPaymentPercent]}
                    onValueChange={(value) => setDownPaymentPercent(value[0])}
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="loanTermYears">Loan Term</Label>
                  <span className="text-sm font-medium">{loanTermYears} years</span>
                </div>
                <Select value={loanTermYears.toString()} onValueChange={(value) => setLoanTermYears(Number(value))}>
                  <SelectTrigger id="loanTermYears">
                    <SelectValue placeholder="Select loan term" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 years</SelectItem>
                    <SelectItem value="30">30 years</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="interestRate">Interest Rate (%)</Label>
                  <span className="text-sm font-medium">{interestRate}%</span>
                </div>
                <div className="flex items-center gap-4">
                  <Percent className="h-4 w-4 text-muted-foreground" />
                  <Slider
                    id="interestRate"
                    min={2}
                    max={10}
                    step={0.1}
                    value={[interestRate]}
                    onValueChange={(value) => setInterestRate(value[0])}
                    className="flex-1"
                  />
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Max Home Price</p>
                  <p className="text-xl font-bold text-[#2B2D42]">{formatCurrency(maxHomePrice)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Monthly Payment</p>
                  <p className="text-xl font-bold text-[#2B2D42]">{formatCurrency(estimatedMonthlyPayment)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Savings Readiness Tracker */}
          <Card className="bg-white rounded-xl shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-[#2B2D42]">
                <PiggyBank className="h-5 w-5 text-[#EF8354]" />
                Savings Readiness Tracker
              </CardTitle>
              <CardDescription>Track your savings progress toward your home purchase.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="currentSavings">Current Savings</Label>
                  <span className="text-sm font-medium">{formatCurrency(currentSavings)}</span>
                </div>
                <div className="flex items-center gap-4">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <Input
                    id="currentSavings"
                    type="number"
                    value={currentSavings}
                    onChange={(e) => setCurrentSavings(Number(e.target.value))}
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="estimatedHomePrice">Estimated Home Price</Label>
                  <span className="text-sm font-medium">{formatCurrency(estimatedHomePrice)}</span>
                </div>
                <div className="flex items-center gap-4">
                  <Home className="h-4 w-4 text-muted-foreground" />
                  <Input
                    id="estimatedHomePrice"
                    type="number"
                    value={estimatedHomePrice}
                    onChange={(e) => setEstimatedHomePrice(Number(e.target.value))}
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="closingCostsPercent">Closing Costs (%)</Label>
                    <span className="text-sm font-medium">{closingCostsPercent}%</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <Percent className="h-4 w-4 text-muted-foreground" />
                    <Slider
                      id="closingCostsPercent"
                      min={1}
                      max={6}
                      step={0.5}
                      value={[closingCostsPercent]}
                      onValueChange={(value) => setClosingCostsPercent(value[0])}
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="emergencyReserveMonths">Emergency Fund (months)</Label>
                    <span className="text-sm font-medium">{emergencyReserveMonths}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <Slider
                      id="emergencyReserveMonths"
                      min={1}
                      max={12}
                      step={1}
                      value={[emergencyReserveMonths]}
                      onValueChange={(value) => setEmergencyReserveMonths(value[0])}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Down Payment (20%)</p>
                    <p className="text-sm font-medium">{formatCurrency(downPayment)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Closing Costs</p>
                    <p className="text-sm font-medium">{formatCurrency(closingCosts)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Emergency Fund</p>
                    <p className="text-sm font-medium">{formatCurrency(emergencyFund)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Required</p>
                    <p className="text-sm font-medium">{formatCurrency(totalRequired)}</p>
                  </div>
                </div>

                <Separator />

                {savingsGap > 0 ? (
                  <div className="rounded-lg bg-[#DC2626]/10 p-4">
                    <p className="font-medium text-[#DC2626]">Savings Gap</p>
                    <p className="text-xl font-bold text-[#DC2626]">{formatCurrency(savingsGap)}</p>
                    <p className="text-sm mt-1">You need to save more to reach your goal.</p>
                  </div>
                ) : (
                  <div className="rounded-lg bg-[#4CAF50]/10 p-4">
                    <p className="font-medium text-[#4CAF50]">Savings Surplus</p>
                    <p className="text-xl font-bold text-[#4CAF50]">{formatCurrency(savingsSurplus)}</p>
                    <p className="text-sm mt-1">You have enough saved for your home purchase!</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-5 space-y-6">
          {/* Financial Summary Card */}
          <Card className="bg-white rounded-xl shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-[#2B2D42]">Financial Summary</CardTitle>
              <CardDescription>Your financial readiness at a glance.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-[#F9FAFB] p-4 space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Max Home Price</p>
                  <p className="text-2xl font-bold text-[#2B2D42]">{formatCurrency(maxHomePrice)}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Estimated Monthly Payment</p>
                  <p className="text-2xl font-bold text-[#2B2D42]">{formatCurrency(estimatedMonthlyPayment)}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">DTI Ratio</p>
                  <div className="flex items-center gap-2">
                    <p className={`text-2xl font-bold ${getDtiStatusColor()}`}>{dtiRatio.toFixed(1)}%</p>
                    <span className={`text-sm font-medium ${getDtiStatusColor()}`}>({getDtiStatusText()})</span>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">{savingsGap > 0 ? "Savings Gap" : "Savings Surplus"}</p>
                  <p className={`text-2xl font-bold ${savingsGap > 0 ? "text-[#DC2626]" : "text-[#4CAF50]"}`}>
                    {formatCurrency(savingsGap > 0 ? savingsGap : savingsSurplus)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Suggested Prep Checklist */}
          <Card className="bg-white rounded-xl shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-[#2B2D42]">Suggested Next Steps (Optional)</CardTitle>
              <CardDescription>
                You don't need these right now, but you'll need them before applying for a loan. Starting early will
                save time later.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    id="preApproved"
                    className="mt-1"
                    checked={checklist.preApproved}
                    onChange={(e) => setChecklist({ ...checklist, preApproved: e.target.checked })}
                  />
                  <Label htmlFor="preApproved" className="cursor-pointer">
                    Get pre-approved with a lender
                  </Label>
                </div>

                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    id="financialDocuments"
                    className="mt-1"
                    checked={checklist.financialDocuments}
                    onChange={(e) => setChecklist({ ...checklist, financialDocuments: e.target.checked })}
                  />
                  <Label htmlFor="financialDocuments" className="cursor-pointer">
                    Gather financial documents (pay stubs, W2s, bank statements)
                  </Label>
                </div>

                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    id="creditReport"
                    className="mt-1"
                    checked={checklist.creditReport}
                    onChange={(e) => setChecklist({ ...checklist, creditReport: e.target.checked })}
                  />
                  <Label htmlFor="creditReport" className="cursor-pointer">
                    Review your credit report
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Educational Content Section */}
          <Card className="bg-white rounded-xl shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-[#2B2D42]">Educational Resources</CardTitle>
              <CardDescription>Learn more about the pre-qualification process.</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>What is Pre-Qualification?</AccordionTrigger>
                  <AccordionContent>
                    Pre-qualification is an initial assessment of your financial situation to estimate how much you
                    might be able to borrow. It's based on information you provide about your income, assets, and debts,
                    but doesn't involve a thorough credit check or verification of your financial information.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2">
                  <AccordionTrigger>28/36 Rule Explained</AccordionTrigger>
                  <AccordionContent>
                    The 28/36 rule is a guideline used by lenders to determine how much you can afford to spend on
                    housing. It suggests that you should spend no more than 28% of your gross monthly income on housing
                    expenses, and no more than 36% on total debt payments (including housing).
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3">
                  <AccordionTrigger>Mortgage Types: FHA, Conventional, VA</AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-2">
                      <strong>Conventional Loans:</strong> Not insured by the government, typically require higher
                      credit scores and down payments of 3-20%.
                    </p>
                    <p className="mb-2">
                      <strong>FHA Loans:</strong> Insured by the Federal Housing Administration, allow for lower credit
                      scores and down payments as low as 3.5%, but require mortgage insurance.
                    </p>
                    <p className="mb-2">
                      <strong>VA Loans:</strong> Guaranteed by the Department of Veterans Affairs, available to eligible
                      veterans and service members, often with no down payment required and competitive interest rates.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-4">
                  <AccordionTrigger>Credit Score & Its Role</AccordionTrigger>
                  <AccordionContent>
                    Your credit score plays a crucial role in mortgage approval and interest rates. Most lenders require
                    a minimum score of 620 for conventional loans, though FHA loans may accept scores as low as 580.
                    Higher scores typically qualify for better interest rates, potentially saving you thousands over the
                    life of your loan.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-5">
                  <AccordionTrigger>What is DTI? Why It Matters</AccordionTrigger>
                  <AccordionContent>
                    Debt-to-Income (DTI) ratio compares your monthly debt payments to your gross monthly income. Lenders
                    use this to assess your ability to manage monthly payments and repay debts. A lower DTI ratio
                    suggests you have a good balance between debt and income and can comfortably take on a mortgage
                    payment.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-6">
                  <AccordionTrigger>How Interest Rates Impact You</AccordionTrigger>
                  <AccordionContent>
                    Interest rates significantly affect your monthly payment and the total cost of your loan. Even a 1%
                    difference can change your payment by hundreds of dollars each month and tens of thousands over the
                    life of the loan. Rates are influenced by your credit score, loan term, down payment, and market
                    conditions.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          {/* AI Assistant Placeholder */}
          <Card className="bg-white rounded-xl shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-[#2B2D42]">
                <HelpCircle className="h-5 w-5 text-[#EF8354]" />
                AI Assistant
              </CardTitle>
              <CardDescription>Ask questions about pre-qualification and financial readiness.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border p-4 h-[200px] flex flex-col">
                <div className="flex-1 space-y-4 overflow-auto">
                  {chatHistory.map((message, index) => (
                    <div key={index} className="flex gap-3">
                      <div
                        className={`h-8 w-8 rounded-full ${message.role === "assistant" ? "bg-[#EF8354]/20 text-[#EF8354]" : "bg-primary/20 text-primary"} flex items-center justify-center text-sm font-medium`}
                      >
                        {message.role === "assistant" ? "AI" : "You"}
                      </div>
                      <div className="bg-muted rounded-lg p-3 text-sm max-w-[80%]">
                        <p>{message.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 mt-4">
                  <Input
                    placeholder="Ask a question..."
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && question.trim()) {
                        handleAskQuestion()
                      }
                    }}
                  />
                  <Button
                    className="bg-[#EF8354] hover:bg-[#EF8354]/90"
                    onClick={handleAskQuestion}
                    disabled={!question.trim()}
                  >
                    Send
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Message Your Realtor Widget */}
          <Card className="bg-white rounded-xl shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-[#2B2D42]">
                <MessageSquare className="h-5 w-5 text-[#EF8354]" />
                Message Your Realtor
              </CardTitle>
              <CardDescription>Have questions? Send a message to your agent.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Type your message here..."
                className="min-h-[100px]"
                value={realtorMessage}
                onChange={(e) => setRealtorMessage(e.target.value)}
              />
              <Button
                className="w-full bg-[#EF8354] hover:bg-[#EF8354]/90"
                onClick={handleSendMessage}
                disabled={!realtorMessage.trim()}
              >
                <Send className="mr-2 h-4 w-4" />
                Send Message
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Next Button */}
      <div className="flex justify-end mt-8">
        <Button
          onClick={() => router.push("/dashboard/needs-assessment")}
          className="bg-[#EF8354] hover:bg-[#EF8354]/90"
        >
          Next: Needs Assessment
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
