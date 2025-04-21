"use server"

// This file is kept for backward compatibility but is no longer used for contact form submissions.
// Contact form submissions are now handled directly by Web3Forms.

import { z } from "zod"

// Define a schema for form validation
const contactFormSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  name: z.string().min(1, { message: "Name is required" }),
  phone: z.string().optional(),
  message: z.string().min(1, { message: "Message is required" }),
})

type ContactFormData = z.infer<typeof contactFormSchema>

export async function sendContactEmail(formData: ContactFormData) {
  console.log("This function is deprecated. Contact forms now use Web3Forms directly.")
  return {
    success: false,
    message: "This method is deprecated. Please update your code to use the Web3Forms integration.",
  }
}
