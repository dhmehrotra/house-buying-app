"use client"

import Image from "next/image"

export function HeroImage() {
  // Use the Vercel blob storage URL directly
  const imageUrl =
    "https://254bekwdae51rgxa.public.blob.vercel-storage.com/couple-home-buying-fyP6sXBb1OLS6KBNMhVJ0hQbalOwJH.png"

  return (
    <div className="relative w-full h-full">
      <Image
        src={imageUrl || "/placeholder.svg"}
        alt="Couple using BuyHome ABC to XYZ platform"
        fill
        className="object-cover p-2"
        priority
      />
    </div>
  )
}
