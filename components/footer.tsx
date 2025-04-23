import Link from "next/link"
import { Building2, Linkedin } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-[#1F2937] text-white py-8">
      <div className="container mx-auto px-4">
        <div className="border-b border-gray-700 pb-8 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <Building2 className="h-6 w-6 mr-2 text-[#ff6a00]" />
              <span className="text-xl footer-brand">
                BuyHome <span className="footer-brand-highlight">ABC</span> to <span className="font-medium">XYZ</span>
              </span>
            </div>

            <div className="footer-text text-sm text-gray-300 max-w-2xl">
              Step-by-step home buying—with you in control, powered by AI, supported by your agent.
            </div>

            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="/terms" className="footer-text text-sm text-gray-300 hover:text-white">
                Terms
              </Link>
              <Link href="/privacy" className="footer-text text-sm text-gray-300 hover:text-white">
                Privacy
              </Link>
              <Link href="/contact" className="footer-text text-sm text-gray-300 hover:text-white">
                Contact
              </Link>
              <Link href="/faqs" className="footer-text text-sm text-gray-300 hover:text-white">
                FAQs
              </Link>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="footer-text text-sm text-gray-400 mb-4 md:mb-0">
            © {new Date().getFullYear()} BuyHome ABC to XYZ. All rights reserved.
          </div>

          <div className="flex space-x-4">
            {/* Only LinkedIn icon with the requested link */}
            <Link
              href="https://www.linkedin.com/company/buyhome-abc-to-xyz/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors"
            >
              <Linkedin className="h-5 w-5" />
              <span className="sr-only">LinkedIn</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
