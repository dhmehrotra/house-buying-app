"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface PrivacyModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PrivacyModal({ open, onOpenChange }: PrivacyModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#2B2D42]">Privacy Policy</DialogTitle>
        </DialogHeader>

        <div className="prose prose-sm max-w-none mt-4">
          <p className="my-4">
            We value your privacy. Your data is only shared with your assigned realtor and is never sold to third
            parties. We use secure storage and encrypted transmission to protect your personal information.
          </p>

          <h3 className="text-lg font-semibold text-[#2B2D42] mt-6">Information We Collect</h3>
          <p className="my-4">
            At BuyHome ABC to XYZ, we collect several types of information to provide and improve our service to you:
          </p>
          <ul className="list-disc pl-6 my-4">
            <li>
              <strong>Personal Information:</strong> Name, email address, phone number, and other contact details you
              provide.
            </li>
            <li>
              <strong>Home Buying Preferences:</strong> Information about your desired location, budget, timeline, and
              property features.
            </li>
            <li>
              <strong>Financial Information:</strong> Details about your financial readiness, including income, savings,
              and debt information.
            </li>
            <li>
              <strong>Usage Data:</strong> Information about how you interact with our platform, including pages visited
              and features used.
            </li>
          </ul>

          <h3 className="text-lg font-semibold text-[#2B2D42] mt-6">How We Use Your Information</h3>
          <p className="my-4">We use the information we collect for the following purposes:</p>
          <ul className="list-disc pl-6 my-4">
            <li>To provide and maintain our service</li>
            <li>To match you with appropriate properties and realtors</li>
            <li>To communicate with you about your home buying journey</li>
            <li>To improve our platform and user experience</li>
            <li>To comply with legal obligations</li>
          </ul>

          <h3 className="text-lg font-semibold text-[#2B2D42] mt-6">Data Sharing and Disclosure</h3>
          <p className="my-4">
            Your data is only shared with your assigned realtor to facilitate your home buying process. We do not sell
            your personal information to third parties. We may share anonymized, aggregated data for analytical
            purposes.
          </p>

          <h3 className="text-lg font-semibold text-[#2B2D42] mt-6">Data Security</h3>
          <p className="my-4">
            We implement appropriate security measures to protect your personal information from unauthorized access,
            alteration, disclosure, or destruction. These measures include encryption, secure storage, and regular
            security assessments.
          </p>

          <h3 className="text-lg font-semibold text-[#2B2D42] mt-6">Your Rights</h3>
          <p className="my-4">You have the right to:</p>
          <ul className="list-disc pl-6 my-4">
            <li>Access the personal information we hold about you</li>
            <li>Request correction of inaccurate information</li>
            <li>Request deletion of your data (subject to legal requirements)</li>
            <li>Opt out of certain data processing activities</li>
            <li>Withdraw consent where processing is based on consent</li>
          </ul>

          <h3 className="text-lg font-semibold text-[#2B2D42] mt-6">Changes to This Privacy Policy</h3>
          <p className="my-4">
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new
            Privacy Policy on this page and updating the "last updated" date.
          </p>

          <h3 className="text-lg font-semibold text-[#2B2D42] mt-6">Contact Us</h3>
          <p className="my-4">
            If you have any questions about this Privacy Policy, please contact us through the contact form on our
            website.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
