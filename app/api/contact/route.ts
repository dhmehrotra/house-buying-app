import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"

// Define a schema for form validation
const contactFormSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  name: z.string().min(1, { message: "Name is required" }),
  phone: z.string().optional(),
  message: z.string().min(1, { message: "Message is required" }),
})

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json()

    // Validate the form data
    const validatedData = contactFormSchema.parse(body)

    // Log the submission (in a real app, you would send this to your email service)
    console.log("Contact form submission:", validatedData)

    // In a real application, you would integrate with an email service here
    // For example, using SendGrid, Mailgun, or AWS SES

    // For demonstration purposes, we'll simulate a successful email send
    // In production, replace this with actual email sending code

    // Simulate API call to email service
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Return success response
    return NextResponse.json({
      success: true,
      message: "Thanks! We've received your message and will get back to you shortly.",
    })
  } catch (error) {
    console.error("Error processing contact form:", error)

    if (error instanceof z.ZodError) {
      // Return validation errors
      return NextResponse.json(
        {
          success: false,
          message: "Please check your form inputs",
          errors: error.errors.reduce(
            (acc, curr) => {
              const field = curr.path[0] as string
              acc[field] = curr.message
              return acc
            },
            {} as Record<string, string>,
          ),
        },
        { status: 400 },
      )
    }

    // Return generic error
    return NextResponse.json(
      {
        success: false,
        message: "Failed to send your message. Please try again later.",
      },
      { status: 500 },
    )
  }
}
