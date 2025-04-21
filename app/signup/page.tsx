"use client"

import Link from "next/link"
import { Building2, Home, User } from "lucide-react"

export default function SignupLandingPage() {
  return (
    <div className="flex min-h-screen bg-[#F9FAFB]">
      {/* Left side - Illustration */}
      <div className="hidden lg:flex lg:w-1/2 bg-white items-center justify-center p-12">
        <div className="max-w-md">
          <div className="flex items-center gap-2 mb-6">
            <Building2 className="h-8 w-8 text-primary" />
            <span className="text-2xl">
              <span className="font-normal">BuyHome</span> <span className="font-bold text-accent">ABC</span>{" "}
              <span className="font-normal">to</span> <span className="font-bold text-primary">XYZ</span>
            </span>
          </div>

          <div className="relative aspect-square w-full max-w-md mx-auto">
            {/* Placeholder for illustration - in production, replace with actual image */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 rounded-xl flex items-center justify-center">
              <div className="text-center p-8">
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    <div className="w-32 h-32 rounded-full bg-accent/10 flex items-center justify-center">
                      <Home className="h-16 w-16 text-accent" />
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                </div>
                <h2 className="text-xl font-semibold text-primary mb-2">Your Home Buying Journey</h2>
                <p className="text-muted-foreground">
                  AI-powered guidance from search to closing, with your trusted agent by your side.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Role selection */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary mb-2">Create your account</h1>
            <p className="text-muted-foreground">Select your role to get started</p>
          </div>

          <div className="space-y-6">
            <Link
              href="/signup/buyer"
              className="block w-full p-6 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-200"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-full bg-accent/10">
                  <Home className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-primary mb-1">I'm a Home Buyer</h2>
                  <p className="text-muted-foreground text-sm">
                    Get step-by-step guidance with your trusted agent and AI.
                  </p>
                </div>
              </div>
            </Link>

            <Link
              href="/signup/realtor"
              className="block w-full p-6 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-200"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-primary mb-1">I'm a Realtor</h2>
                  <p className="text-muted-foreground text-sm">
                    Manage buyers and help them close confidently with AI support.
                  </p>
                </div>
              </div>
            </Link>
          </div>

          <div className="text-center mt-8">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-accent hover:underline">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
