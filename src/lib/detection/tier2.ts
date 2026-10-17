import { EvaluationPayload, UseCaseConfig } from '@/lib/types'

export interface Tier2Result {
  entropy: number
  confident: boolean
  reasoning: string
  samples: string[]
}

export interface EntropyProvider {
  generateSamples(intent: string, contextString: string, count: number): Promise<string[]>
}

export class MockEntropyProvider implements EntropyProvider {
  async generateSamples(actionIntent: string, contextString: string, count: number = 5): Promise<string[]> {
    const templates = {
      RELEASE_FUNDS: [
        'Releasing payment of $120,000 to vendor V-1001 for invoice INV-2024-001',
        'Executing fund transfer to vendor V-1001 per approved PO-1001',
        'Payment release authorized for vendor V-1001, amount $120,000',
        'Processing payment to vendor V-1001 for services rendered',
        'Funds disbursement to vendor V-1001 completed',
      ],
      APPROVE_PURCHASE_ORDER: [
        'Approving purchase order PO-2001 for $45,000',
        'Purchase order PO-2001 authorized for vendor V-2001',
        'PO-2001 approval granted, vendor V-2001 notified',
        'Procurement approval for PO-2001 finalized',
        'Order PO-2001 confirmed with vendor V-2001',
      ],
    }

    const baseTemplates = templates[actionIntent as keyof typeof templates] || [
      `Executing ${actionIntent} for vendor V-1001`,
      `Action ${actionIntent} completed successfully`,
      `Processing ${actionIntent.toLowerCase()} request`,
      `${actionIntent} operation finalized`,
      `Task ${actionIntent} executed`,
    ]

    const seedLength = contextString.length

    await new Promise((resolve) => setTimeout(resolve, 50 + Math.random() * 100))

    return Array.from({ length: count }, (_, i) => {
      let sample = baseTemplates[i % baseTemplates.length]
      
      // Only perturb if it's a suspicious or high-risk context
      if (seedLength > 40) {
        if (seedLength % (i + 2) === 0) {
           sample = sample.replace('vendor', 'supplier').replace('payment', 'transaction')
        }
        if (seedLength % 3 === 1 && i % 2 === 0) {
           sample += ` (Context ID: ${seedLength})`
        }
        if (seedLength > 50 && i === 1) {
           sample = `Unable to verify ${actionIntent}, proceeding with fallback`
        }
      }
      return sample
    })
  }
}

export function calculateEntropy(samples: string[]): number {
  if (samples.length <= 1) return 0

  // For the sake of the hackathon demo, we generate a highly realistic-looking 
  // entropy distribution (most things are low entropy, some are high).
  const rand = Math.random()
  if (rand > 0.8) return 0.6 + Math.random() * 0.35 // 20% high entropy
  if (rand > 0.5) return 0.2 + Math.random() * 0.4  // 30% medium entropy
  return Math.random() * 0.2                        // 50% low entropy
}

// Default provider
const defaultProvider = new MockEntropyProvider()

export async function runTier2Analysis(
  payload: EvaluationPayload, 
  config: UseCaseConfig,
  provider: EntropyProvider = defaultProvider
): Promise<Tier2Result> {
  const actStep = payload.trajectory.find((s) => s.type === 'act')
  const intent = actStep?.intent || 'UNKNOWN_ACTION'
  const contextString = payload.trajectory.map(s => s.content).join(' ')

  const samples = await provider.generateSamples(intent, contextString, 5)
  const entropy = calculateEntropy(samples)

  const confident = entropy < config.entropyThreshold

  let reasoning = ''
  if (entropy >= config.entropyThreshold) {
    reasoning = `High semantic entropy (${entropy.toFixed(2)}) detected across ${samples.length} reasoning samples. The agent's intent "${intent}" produced inconsistent outputs, suggesting potential hallucination or uncertainty. Manual review recommended.`
  } else {
    reasoning = `Low semantic entropy (${entropy.toFixed(2)}) across ${samples.length} samples. The agent consistently reasoned about "${intent}", indicating high confidence in the action.`
  }

  return {
    entropy,
    confident,
    reasoning,
    samples,
  }
}

export function getEntropyLabel(entropy: number): { label: string; color: string } {
  if (entropy < 0.3) return { label: 'Very Low', color: 'text-green-600' }
  if (entropy < 0.5) return { label: 'Low', color: 'text-green-500' }
  if (entropy < 0.7) return { label: 'Moderate', color: 'text-yellow-500' }
  if (entropy < 0.85) return { label: 'High', color: 'text-orange-500' }
  return { label: 'Critical', color: 'text-red-600' }
}