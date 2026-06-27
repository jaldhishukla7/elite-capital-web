import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/session'

export async function POST(req: NextRequest) {
  try {
    const admin = await getCurrentUser() as any
    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { userId, amount, note } = body

    if (!userId || typeof amount !== 'number' || amount < 0) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { dummyBalance: amount },
    })

    await prisma.adminTransaction.create({
      data: {
        adminId: admin.id,
        userId,
        amount,
        note: note?.toString() || null,
      },
    })

    return NextResponse.json({
      success: true,
      message: `₹${amount.toFixed(2)} credited successfully to ${updatedUser.firstName} ${updatedUser.lastName}`,
      dummyBalance: updatedUser.dummyBalance,
    })
  } catch (error) {
    console.error('Admin credit failed:', error)
    return NextResponse.json({ error: 'Failed to credit amount' }, { status: 500 })
  }
}
