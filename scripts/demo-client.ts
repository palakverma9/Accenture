import { createEvaluationPayload } from '@/lib/store'
import { ALL_TRAJECTORIES } from '@/lib/demo-data'

const API_URL = process.env.API_URL || 'http://localhost:3000/api/evaluate'

async function sendEvaluation(payload: ReturnType<typeof createEvaluationPayload>) {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const result = await response.json()
    return result
  } catch (error) {
    console.error('Failed to send evaluation:', error)
    return null
  }
}

function getRandomTrajectory() {
  const idx = Math.floor(Math.random() * ALL_TRAJECTORIES.length)
  return ALL_TRAJECTORIES[idx]
}

async function waitForServer(url: string, maxRetries: number = 30): Promise<boolean> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url.replace('/api/evaluate', ''))
      if (response.ok) return true
    } catch {
      // Server not ready yet
    }
    console.log(`⏳ Waiting for server... (${i + 1}/${maxRetries})`)
    await new Promise((resolve) => setTimeout(resolve, 1000))
  }
  return false
}

async function runDemo(iterations: number = 50, intervalMs: number = 1000) {
  console.log(`🚀 Starting ControlPlane.ai demo client`)
  console.log(`   Target: ${API_URL}`)
  console.log(`   Iterations: ${iterations}`)
  console.log(`   Interval: ${intervalMs}ms`)
  console.log('')

  const serverReady = await waitForServer(API_URL)
  if (!serverReady) {
    console.error('❌ Server did not start in time. Make sure `npm run dev` is running.')
    process.exit(1)
  }
  console.log('✅ Server is ready!')
  console.log('')

  for (let i = 0; i < iterations; i++) {
    const { trajectory, use_case, delay } = getRandomTrajectory()
    const payload = createEvaluationPayload(use_case, trajectory)

    const result = await sendEvaluation(payload)

    if (result) {
      const status = result.final_decision
      const riskScore = result.risk_score
      const numTags = result.risk_tags?.length || 0
      const entropy = result.tier_2_entropy?.toFixed(3) || 'N/A'
      const time = result.processing_time_ms

      const statusIcon =
        status === 'AUTO_APPROVED' ? '✅' :
        status === 'AUTO_EDITED' ? '📝' :
        status === 'PENDING_HUMAN_REVIEW' ? '⚠️' :
        status === 'REJECTED' ? '❌' : '✅'

      console.log(
        `[${i + 1}/${iterations}] ${statusIcon} ${payload.trace_id.slice(-12)} | ` +
        `Score: ${riskScore} | Tags: ${numTags} | Entropy: ${entropy} | Decision: ${status} | ${time}ms`
      )
    }

    await new Promise((resolve) => setTimeout(resolve, delay + Math.random() * intervalMs))
  }

  console.log('')
  console.log('✅ Demo complete! Check the dashboard at http://localhost:3000/dashboard')
}

const iterations = parseInt(process.argv[2] || '50')
const interval = parseInt(process.argv[3] || '1000')

runDemo(iterations, interval).catch(console.error)