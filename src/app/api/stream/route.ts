import { NextRequest } from 'next/server'
import { evaluationStore } from '@/lib/store'

// Important: this prevents Next.js from caching the response
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const encoder = new TextEncoder()
  
  const stream = new ReadableStream({
    start(controller) {
      // Send initial data
      const initialData = {
        items: evaluationStore.getAll(),
        stats: evaluationStore.getStats()
      }
      controller.enqueue(encoder.encode(`data: ${JSON.stringify(initialData)}\n\n`))

      // Listen for updates
      const onUpdate = () => {
        const data = {
          items: evaluationStore.getAll(),
          stats: evaluationStore.getStats()
        }
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
      }

      evaluationStore.on('update', onUpdate)

      // Heartbeat to keep connection alive
      const heartbeat = setInterval(() => {
        controller.enqueue(encoder.encode(':\n\n')) // SSE comment
      }, 15000)

      request.signal.addEventListener('abort', () => {
        evaluationStore.off('update', onUpdate)
        clearInterval(heartbeat)
      })
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    },
  })
}
