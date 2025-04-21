"use client"

import { useState, useRef, type FormEvent } from "react"
import Link from "next/link"
import { ArrowLeft, CheckCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Footer } from "@/components/footer"

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const formRef = useRef<HTMLFormElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const validateForm = () => {
    if (!formRef.current) return false

    const form = formRef.current
    const requiredFields = form.querySelectorAll("[required]")
    let isValid = true

    requiredFields.forEach((field) => {
      if (!(field as HTMLInputElement).value.trim()) {
        isValid = false
        const feedbackEl = field.parentElement?.querySelector(".empty-feedback")
        if (feedbackEl) feedbackEl.classList.add("block")
      } else {
        const feedbackEl = field.parentElement?.querySelector(".empty-feedback")
        if (feedbackEl) feedbackEl.classList.remove("block")
      }

      // Email validation
      if (field.id === "email") {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test((field as HTMLInputElement).value)) {
          isValid = false
          const invalidFeedback = field.parentElement?.querySelector(".invalid-feedback")
          if (invalidFeedback) invalidFeedback.classList.add("block")
        } else {
          const invalidFeedback = field.parentElement?.querySelector(".invalid-feedback")
          if (invalidFeedback) invalidFeedback.classList.remove("block")
        }
      }
    })

    return isValid
  }

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrorMessage("")

    if (!validateForm()) return

    // Use traditional form submission
    setIsSubmitting(true)

    // Set a timeout to handle cases where the form submission doesn't trigger the iframe load event
    const timeoutId = setTimeout(() => {
      setIsSubmitting(false)
      setErrorMessage("The request timed out. Please try again later.")
    }, 10000)

    // Listen for iframe load event
    if (iframeRef.current) {
      iframeRef.current.onload = () => {
        clearTimeout(timeoutId)
        setIsSubmitting(false)
        setIsSubmitted(true)
        if (formRef.current) formRef.current.reset()
      }
    }

    // Submit the form
    if (formRef.current) {
      formRef.current.submit()
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 container py-12">
        <div className="mb-8">
          <Button variant="ghost" size="sm" asChild className="mb-6">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
          <h1 className="text-3xl font-bold text-[#2B2D42]">Contact Us</h1>
          <p className="text-muted-foreground mt-2">
            We'd love to hear from you. Fill out the form below to send us a message.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Contact Form */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            {isSubmitted ? (
              <div className="text-center py-10">
                <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
                <h3 className="text-2xl font-semibold text-[#2B2D42] mb-2">Message Sent!</h3>
                <p className="text-gray-600 mb-6">
                  Thank you for contacting us. We'll get back to you as soon as possible.
                </p>
                <Button onClick={() => setIsSubmitted(false)} className="bg-[#EF8354] hover:bg-[#EF8354]/90 text-white">
                  Send Another Message
                </Button>
              </div>
            ) : (
              <form
                ref={formRef}
                action="https://api.web3forms.com/submit"
                method="POST"
                onSubmit={handleSubmit}
                className="space-y-4"
                target="hidden_iframe"
              >
                <input type="hidden" name="access_key" value="562c20dc-8150-44d7-845d-8e0536a431f2" />
                <input type="hidden" name="subject" value="New Contact Form Submission - BuyHome ABC to XYZ" />
                <input type="hidden" name="from_name" value="BuyHome ABC to XYZ Contact Form" />
                <input type="hidden" name="redirect" value="https://web3forms.com/success" />
                <input type="checkbox" name="botcheck" className="hidden" />

                <div className="flex flex-col md:flex-row gap-4">
                  <div className="w-full md:w-1/2 space-y-2">
                    <Label htmlFor="first_name">
                      First Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="first_name"
                      name="name"
                      placeholder="John"
                      required
                      className="p-3 rounded-md shadow-sm"
                    />
                    <div className="empty-feedback text-red-500 text-sm mt-1 hidden">
                      Please provide your first name.
                    </div>
                  </div>
                  <div className="w-full md:w-1/2 space-y-2">
                    <Label htmlFor="last_name">
                      Last Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="last_name"
                      name="last_name"
                      placeholder="Doe"
                      required
                      className="p-3 rounded-md shadow-sm"
                    />
                    <div className="empty-feedback text-red-500 text-sm mt-1 hidden">
                      Please provide your last name.
                    </div>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-4">
                  <div className="w-full md:w-1/2 space-y-2">
                    <Label htmlFor="email">
                      Email Address <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="you@example.com"
                      required
                      className="p-3 rounded-md shadow-sm"
                    />
                    <div className="empty-feedback text-red-500 text-sm mt-1 hidden">
                      Please provide your email address.
                    </div>
                    <div className="invalid-feedback text-red-500 text-sm mt-1 hidden">
                      Please provide a valid email address.
                    </div>
                  </div>
                  <div className="w-full md:w-1/2 space-y-2">
                    <Label htmlFor="phone">
                      Phone Number <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="phone"
                      name="phone"
                      placeholder="(123) 456-7890"
                      required
                      className="p-3 rounded-md shadow-sm"
                    />
                    <div className="empty-feedback text-red-500 text-sm mt-1 hidden">
                      Please provide your phone number.
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">
                    Message <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="message"
                    name="message"
                    placeholder="How can we help you?"
                    className="p-3 rounded-md shadow-sm min-h-[150px]"
                    required
                  />
                  <div className="empty-feedback text-red-500 text-sm mt-1 hidden">Please enter your message.</div>
                </div>

                {errorMessage && (
                  <div className="bg-red-50 p-3 rounded-md flex items-start gap-2 text-sm text-red-700">
                    <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                    <div>{errorMessage}</div>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full bg-[#EF8354] hover:bg-[#EF8354]/90 text-white"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Sending..." : "Send Message"}
                </Button>
              </form>
            )}

            {/* Hidden iframe for form submission target */}
            <iframe
              name="hidden_iframe"
              id="hidden_iframe"
              ref={iframeRef}
              style={{ display: "none" }}
              title="Form submission target"
            ></iframe>
          </div>

          {/* Google Map */}
          <div className="h-[400px] md:h-auto bg-white rounded-xl shadow-sm overflow-hidden">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d50758.10305828611!2d-122.18233974069154!3d37.42989759428341!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x808fb07b9dba1c39%3A0xe1ff55235f576cf!2sPalo%20Alto%2C%20CA!5e0!3m2!1sen!2sus!4v1711842000000!5m2!1sen!2sus"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="BuyHome ABC to XYZ Location"
              className="w-full h-full"
            ></iframe>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
