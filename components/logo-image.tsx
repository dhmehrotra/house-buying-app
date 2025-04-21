"use client"

import Image from "next/image"
import { useState } from "react"

export function LogoImage() {
  const [imgSrc, setImgSrc] = useState("/images/buyhome-logo.png")

  return (
    <Image
      src={imgSrc || "/placeholder.svg"}
      alt="BuyHome ABC to XYZ Logo"
      width={40}
      height={40}
      className="h-10 w-10"
      onError={() => {
        setImgSrc(
          "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ChatGPT%20Image%20Mar%2030%2C%202025%2C%2008_53_28%20PM-knLQPhVqYokoDYsIzKEOh00g8ubYEq.png",
        )
      }}
    />
  )
}
