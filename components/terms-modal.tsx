"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface TermsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TermsModal({ open, onOpenChange }: TermsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#2B2D42]">Terms of Service</DialogTitle>
        </DialogHeader>

        <div className="prose prose-sm max-w-none mt-4">
          <h2 className="text-xl font-semibold text-[#2B2D42]">Welcome to BuyHome ABC to XYZ</h2>

          <p className="my-4">
            By using our platform, you agree to comply with and be bound by these terms. You must be 18 years or older
            and use the platform only for lawful purposes. We reserve the right to update these terms at any time.
          </p>

          <h3 className="text-lg font-semibold text-[#2B2D42] mt-6">1. Acceptance of Terms</h3>
          <p className="my-4">
            By accessing or using the BuyHome ABC to XYZ platform, you agree to be bound by these Terms of Service and
            all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from
            using or accessing this site.
          </p>

          <h3 className="text-lg font-semibold text-[#2B2D42] mt-6">2. Use License</h3>
          <p className="my-4">
            Permission is granted to temporarily use the BuyHome ABC to XYZ platform for personal, non-commercial
            transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you
            may not:
          </p>
          <ul className="list-disc pl-6 my-4">
            <li>Modify or copy the materials</li>
            <li>Use the materials for any commercial purpose</li>
            <li>Attempt to decompile or reverse engineer any software contained on the platform</li>
            <li>Remove any copyright or other proprietary notations from the materials</li>
            <li>Transfer the materials to another person or "mirror" the materials on any other server</li>
          </ul>

          <h3 className="text-lg font-semibold text-[#2B2D42] mt-6">3. Disclaimer</h3>
          <p className="my-4">
            The materials on the BuyHome ABC to XYZ platform are provided on an 'as is' basis. BuyHome ABC to XYZ makes
            no warranties, expressed or implied, and hereby disclaims and negates all other warranties including,
            without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose,
            or non-infringement of intellectual property or other violation of rights.
          </p>

          <h3 className="text-lg font-semibold text-[#2B2D42] mt-6">4. Limitations</h3>
          <p className="my-4">
            In no event shall BuyHome ABC to XYZ or its suppliers be liable for any damages (including, without
            limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or
            inability to use the materials on the platform, even if BuyHome ABC to XYZ or a BuyHome ABC to XYZ
            authorized representative has been notified orally or in writing of the possibility of such damage.
          </p>

          <h3 className="text-lg font-semibold text-[#2B2D42] mt-6">5. Revisions and Errata</h3>
          <p className="my-4">
            The materials appearing on the BuyHome ABC to XYZ platform could include technical, typographical, or
            photographic errors. BuyHome ABC to XYZ does not warrant that any of the materials on its platform are
            accurate, complete or current. BuyHome ABC to XYZ may make changes to the materials contained on its
            platform at any time without notice.
          </p>

          <h3 className="text-lg font-semibold text-[#2B2D42] mt-6">6. Governing Law</h3>
          <p className="my-4">
            These terms and conditions are governed by and construed in accordance with the laws of the United States
            and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
