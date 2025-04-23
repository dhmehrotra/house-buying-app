import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Get the user and realtor cookies
  const userCookie = request.cookies.get("buyhome_user")?.value
  const realtorCookie = request.cookies.get("buyhome_realtor")?.value

  // Check if user is authenticated
  const isUserAuthenticated = userCookie !== undefined
  const isRealtorAuthenticated = realtorCookie !== undefined

  // Public paths that don't require authentication
  const isPublicPath =
    path === "/login" ||
    path === "/signup" ||
    path === "/signup/buyer" ||
    path === "/signup/realtor" ||
    path.startsWith("/api/") ||
    path === "/" ||
    path === "/faqs" ||
    path === "/contact" ||
    path === "/terms" ||
    path === "/privacy"

  // Buyer-specific paths
  const isBuyerPath = path === "/dashboard" || path.startsWith("/dashboard/")

  // Realtor-specific paths
  const isRealtorPath = path === "/realtor/dashboard" || path.startsWith("/realtor/")

  // If the path is public, allow access
  if (isPublicPath) {
    return NextResponse.next()
  }

  // If trying to access buyer paths but not authenticated as a buyer
  if (isBuyerPath && !isUserAuthenticated) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // If trying to access realtor paths but not authenticated as a realtor
  if (isRealtorPath && !isRealtorAuthenticated) {
    return NextResponse.redirect(new URL("/login?role=realtor", request.url))
  }

  // Allow access to all other paths
  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
}
