"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function RealtorRegisterRedirect() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to the main signup page with realtor role pre-selected
    router.push("/signup?role=realtor")
  }, [router])

  return null
}
