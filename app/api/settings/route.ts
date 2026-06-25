// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/session'

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser() as any
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json({
      refreshInterval: user.refreshInterval,
      currency: user.currency,
      notifications: user.notifications,
      darkMode: user.darkMode,
    })
  } catch (error) {
    console.error('Get settings error:', error)
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser() as any
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { refreshInterval, currency, notifications, darkMode } = body

    const updatedUser = (await prisma.user.update({
      where: { id: user.id },
      data: {
        refreshInterval: typeof refreshInterval === 'number' ? refreshInterval : undefined,
        currency: typeof currency === 'string' ? currency : undefined,
        notifications: typeof notifications === 'boolean' ? notifications : undefined,
        darkMode: typeof darkMode === 'boolean' ? darkMode : undefined,
      },
    })) as any

    return NextResponse.json({
      success: true,
      settings: {
        refreshInterval: updatedUser.refreshInterval,
        currency: updatedUser.currency,
        notifications: updatedUser.notifications,
        darkMode: updatedUser.darkMode,
      },
    })
  } catch (error) {
    console.error('Update settings error:', error)
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
  }
}
