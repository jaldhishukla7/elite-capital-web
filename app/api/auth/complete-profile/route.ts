import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/session'
import { isAtLeast18 } from '@/lib/age'

export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      return NextResponse.json({ error: 'Not authenticated. Please log in again.' }, { status: 401 })
    }

    const { dateOfBirth } = await req.json()

    if (!dateOfBirth) {
      return NextResponse.json({ error: 'Date of birth is required.' }, { status: 400 })
    }

    const dob = new Date(dateOfBirth)
    if (isNaN(dob.getTime())) {
      return NextResponse.json({ error: 'Please enter a valid date.' }, { status: 400 })
    }

    if (!isAtLeast18(dob)) {
      return NextResponse.json(
        { error: 'You must be at least 18 years old to use Elite Capital Markets.' },
        { status: 400 }
      )
    }

    await prisma.user.update({
      where: { id: currentUser.id },
      data: { dateOfBirth: dob, isProfileComplete: true },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Complete profile error:', error)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}

/**
 * GET returns the current user's prefill data (First Name, Last Name,
 * Email, Mobile) for the Complete Profile page to display.
 */
export async function GET() {
  const currentUser = await getCurrentUser()

  if (!currentUser) {
    return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 })
  }

  return NextResponse.json({
    firstName: currentUser.firstName,
    lastName: currentUser.lastName,
    email: currentUser.email,
    mobile: currentUser.mobile,
  })
}
