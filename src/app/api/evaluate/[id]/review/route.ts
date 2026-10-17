import { NextRequest, NextResponse } from 'next/server'
import { evaluationStore } from '@/lib/store'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { action, reviewer } = body

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    const success = evaluationStore.updateStatus(id, action === 'approve' ? 'approved' : 'rejected', reviewer || 'human')

    if (!success) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Review error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}