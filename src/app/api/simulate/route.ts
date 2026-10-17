import { NextRequest, NextResponse } from 'next/server'
import { getRandomPayload } from '@/lib/demo-data'

export async function POST(request: NextRequest) {
  try {
    const { count = 1 } = await request.json().catch(() => ({}))
    
    const results = []
    
    // Process sequentially to avoid slamming the store synchronously
    for (let i = 0; i < Math.min(count, 10); i++) {
      const payload = getRandomPayload()
      
      const baseUrl = request.nextUrl.origin
      const response = await fetch(`${baseUrl}/api/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      
      if (response.ok) {
        results.push(await response.json())
      }
    }
    
    return NextResponse.json({ success: true, count: results.length, results })
  } catch (error) {
    console.error('Simulator error:', error)
    return NextResponse.json({ error: 'Failed to run simulator' }, { status: 500 })
  }
}
