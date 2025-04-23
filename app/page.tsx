import Link from "next/link"
import {
  ArrowRight,
  CheckCircle,
  MessageSquare,
  Calendar,
  Search,
  Calculator,
  FileText,
  Clock,
  Users,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { HeroImage } from "@/components/hero-image"
import { LogoImage } from "@/components/logo-image"
import { Footer } from "@/components/footer"

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <LogoImage />
            <span className="font-bold text-xl">
              <span className="font-normal">BuyHome</span> <span className="font-bold text-accent">ABC</span>{" "}
              <span className="font-normal">to</span> <span className="font-bold text-primary">XYZ</span>
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#how-it-works" className="text-sm font-medium hover:underline">
              How It Works
            </Link>
            <Link href="#for-buyers" className="text-sm font-medium hover:underline">
              For Buyers
            </Link>
            <Link href="#for-agents" className="text-sm font-medium hover:underline">
              For Agents
            </Link>
            <Link href="/faqs" className="text-sm font-medium hover:underline">
              FAQs
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="outline">Log In</Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-accent hover:bg-accent/90 text-white">Sign Up</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 md:py-28 bg-white">
          <div className="container grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="flex flex-col items-start text-left">
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-primary mb-4">
                The Smarter Way to Buy a Home
              </h1>
              <p className="text-xl text-foreground/80 mb-8">With your agent. Powered by AI.</p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/signup?role=buyer">
                  <Button size="lg" className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-white">
                    Get Started <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="#how-it-works">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    Explore How It Works
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative h-[400px] flex items-center justify-center">
              {/* Styled container with shadow and gradient background */}
              <div className="relative w-[90%] h-[90%] rounded-xl overflow-hidden shadow-xl bg-gradient-to-br from-accent/5 to-gray-100">
                {/* Decorative elements to mimic a browser window */}
                <div className="absolute top-0 left-0 w-full h-8 bg-white/90 flex items-center px-3">
                  <div className="flex gap-1.5">
                    <div className="h-2.5 w-2.5 rounded-full bg-accent"></div>
                    <div className="h-2.5 w-2.5 rounded-full bg-primary"></div>
                    <div className="h-2.5 w-2.5 rounded-full bg-gray-300"></div>
                  </div>
                </div>

                {/* Image container - slightly smaller than parent */}
                <div className="absolute top-10 left-3 right-3 bottom-3 rounded-lg overflow-hidden bg-white">
                  <HeroImage />
                </div>

                {/* Bottom decorative elements */}
                <div className="absolute bottom-0 left-0 w-full h-0 flex justify-between px-3">
                  <div className="h-6 w-20 -mb-2 rounded-t-md bg-accent/20"></div>
                  <div className="h-6 w-20 -mb-2 rounded-t-md bg-gray-200"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* AI-Enhanced Journey Section */}
        <section id="how-it-works" className="py-20 bg-muted">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Your AI-Enhanced Journey</h2>
              <p className="text-xl max-w-3xl mx-auto text-foreground/80">
                A complete home-buying journey—guided by AI, supported by your agent.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-9 gap-4 mt-12">
              {[
                { step: 1, name: "Pre-Qualification", icon: CheckCircle },
                { step: 2, name: "Needs Assessment", icon: Users },
                { step: 3, name: "Property Search", icon: Search },
                { step: 4, name: "Property Selection", icon: CheckCircle },
                { step: 5, name: "Offer Strategy", icon: Calculator },
                { step: 6, name: "Offer Submission", icon: FileText },
                { step: 7, name: "Escrow Process", icon: Clock },
                { step: 8, name: "Final Walkthrough", icon: CheckCircle },
                { step: 9, name: "Closing", icon: CheckCircle },
              ].map((item, index) => {
                const Icon = item.icon
                return (
                  <div key={index} className="relative flex flex-col items-center p-4 bg-white rounded-lg shadow-sm">
                    <div className="absolute -top-3 -left-3 h-8 w-8 rounded-full bg-accent text-white flex items-center justify-center text-sm font-bold">
                      {item.step}
                    </div>
                    <Icon className="h-8 w-8 text-primary mb-2" />
                    <h3 className="text-sm font-medium text-center">{item.name}</h3>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Comparison Section */}
        <section className="py-20 bg-white">
          <div className="container">
            <h2 className="text-3xl font-bold text-center mb-12">The Traditional Way vs The AI + Agent Way</h2>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="p-4 text-left border-b-2 border-gray-200">Feature</th>
                    <th className="p-4 text-center border-b-2 border-gray-200">Traditional Way</th>
                    <th className="p-4 text-center border-b-2 border-gray-200 bg-accent/5">BuyHome ABC to XYZ</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    "Step-by-step Guidance",
                    "AI-Powered Offer Calculator",
                    "Disclosure Risk Summarizer",
                    "Realtor Communication",
                    "Virtual Tour Scheduling",
                    "Document Handling",
                    "Home Search & Filtering",
                    "Q&A Help",
                    "Agent Experience",
                  ].map((feature, index) => (
                    <tr key={index} className={index % 2 === 0 ? "bg-gray-50" : ""}>
                      <td className="p-4 border-b border-gray-200">{feature}</td>
                      <td className="p-4 text-center border-b border-gray-200">❌</td>
                      <td className="p-4 text-center border-b border-gray-200 bg-accent/5">
                        <span className="text-green-500 text-xl">✅</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Tech Features Section */}
        <section className="py-20 bg-primary text-white">
          <div className="container">
            <h2 className="text-3xl font-bold text-center mb-12">Smarter Tools. Better Buying.</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  name: "AI Chat at Every Step",
                  icon: MessageSquare,
                  description: "Get instant answers to your questions at any point in your journey.",
                },
                {
                  name: "AI Offer Calculator",
                  icon: Calculator,
                  description: "Make competitive offers with AI-powered pricing insights.",
                },
                {
                  name: "Disclosure Analyzer",
                  icon: FileText,
                  description: "AI summarizes property disclosures to highlight potential issues.",
                },
                {
                  name: "Unified Messaging & Docs",
                  icon: MessageSquare,
                  description: "All communications and documents in one secure place.",
                },
                {
                  name: "Personalized Search",
                  icon: Search,
                  description: "AI learns your preferences to find your perfect home faster.",
                },
                {
                  name: "Smart Scheduling",
                  icon: Calendar,
                  description: "Easily coordinate viewings with your agent and sellers.",
                },
                {
                  name: "Real-time Progress Tracking",
                  icon: Clock,
                  description: "Always know exactly where you are in the buying process.",
                },
                {
                  name: "Agent Collaboration",
                  icon: Users,
                  description: "Work seamlessly with your agent through every step.",
                },
              ].map((feature, index) => {
                const Icon = feature.icon
                return (
                  <div
                    key={index}
                    className="flex flex-col items-center text-center p-6 bg-primary-foreground/10 rounded-lg"
                  >
                    <Icon className="h-10 w-10 text-accent mb-4" />
                    <h3 className="text-lg font-bold mb-2">{feature.name}</h3>
                    <p className="text-sm text-white/80">{feature.description}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Buyers & Agents Section */}
        <section id="for-buyers" className="py-20 bg-white">
          <div className="container">
            <h2 className="text-3xl font-bold text-center mb-12">Built for Buyers & Agents</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-8 bg-muted rounded-lg shadow-sm">
                <h3 className="text-2xl font-bold mb-6 text-primary">For Buyers</h3>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-accent mr-2 shrink-0 mt-0.5" />
                    <span>Step-by-step guidance through the entire buying process</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-accent mr-2 shrink-0 mt-0.5" />
                    <span>AI-powered tools to help you make better decisions</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-accent mr-2 shrink-0 mt-0.5" />
                    <span>Seamless communication with your agent</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-accent mr-2 shrink-0 mt-0.5" />
                    <span>Transparent tracking of your home buying progress</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-accent mr-2 shrink-0 mt-0.5" />
                    <span>All your documents organized in one secure place</span>
                  </li>
                </ul>
                <div className="mt-8">
                  <Link href="/signup?role=buyer">
                    <Button className="bg-accent hover:bg-accent/90 text-white">Get Started as a Buyer</Button>
                  </Link>
                </div>
              </div>

              <div id="for-agents" className="p-8 bg-muted rounded-lg shadow-sm">
                <h3 className="text-2xl font-bold mb-6 text-primary">For Agents</h3>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-accent mr-2 shrink-0 mt-0.5" />
                    <span>Manage multiple clients efficiently in one dashboard</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-accent mr-2 shrink-0 mt-0.5" />
                    <span>AI assistance for routine questions, freeing your time</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-accent mr-2 shrink-0 mt-0.5" />
                    <span>Automated document management and reminders</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-accent mr-2 shrink-0 mt-0.5" />
                    <span>Enhanced client satisfaction with transparent process</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-accent mr-2 shrink-0 mt-0.5" />
                    <span>Close more deals with better client engagement</span>
                  </li>
                </ul>
                <div className="mt-8">
                  <Link href="/signup?role=realtor">
                    <Button className="bg-primary hover:bg-primary/90 text-white">Join as an Agent</Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-20 bg-muted">
          <div className="container flex flex-col items-center text-center">
            <h2 className="text-3xl font-bold mb-4">Buying a home doesn't have to feel overwhelming.</h2>
            <p className="mt-4 max-w-2xl text-xl text-foreground/80 mb-8">
              With BuyHome ABC to XYZ, you get tech + expertise in one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/signup">
                <Button size="lg" className="bg-accent hover:bg-accent/90 text-white">
                  Get Started
                </Button>
              </Link>
              <Link href="/login?role=realtor">
                <Button size="lg" variant="outline">
                  Log In as Realtor
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}
