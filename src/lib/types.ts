export interface TrajectoryStep {
  type: 'observe' | 'ground' | 'act' | 'verify'
  content: string
  intent?: string
  amount?: number
}

export type RiskCategory =
  | 'financial'
  | 'pii'
  | 'prompt_injection'
  | 'suspicious'
  | 'bias'
  | 'policy'
  | 'hallucination'

export interface RiskTag {
  category: RiskCategory
  confidence: number // 0-100
  detail: string
}

export type FinalDecision =
  | 'AUTO_APPROVED'
  | 'AUTO_EDITED'
  | 'PENDING_HUMAN_REVIEW'
  | 'REJECTED'
  | 'APPROVED_BY_HUMAN'

export interface EvaluationPayload {
  trace_id: string
  use_case: string
  trajectory: TrajectoryStep[]
  risk_tags?: RiskTag[]
  risk_score?: number
  tier_2_entropy?: number
  final_decision?: FinalDecision
  timestamp: number
  client_ip?: string
}

export interface EvaluationResult {
  trace_id: string
  risk_tags: RiskTag[]
  risk_score: number
  tier_2_entropy?: number
  final_decision: FinalDecision
  processing_time_ms: number
  requires_review: boolean
}

export interface QueuedItem extends EvaluationPayload {
  id: string
  status: 'pending' | 'approved' | 'rejected'
  reviewed_by?: string
  reviewed_at?: number
}

export interface UseCaseConfig {
  financialCap: number
  entropyThreshold: number
}

export const USE_CASE_CONFIGS: Record<string, UseCaseConfig> = {
  sap_remediation_agent: { financialCap: 100000, entropyThreshold: 0.6 },
  identity_verification: { financialCap: 0, entropyThreshold: 0.5 },
  chat_assistant: { financialCap: 100, entropyThreshold: 0.8 },
  admin_operations: { financialCap: 5000, entropyThreshold: 0.4 },
  general_chat: { financialCap: 500, entropyThreshold: 0.85 },
  hr_assistant: { financialCap: 0, entropyThreshold: 0.5 },
  default: { financialCap: 50000, entropyThreshold: 0.7 }
}

export function getConfigForUseCase(useCase: string): UseCaseConfig {
  return USE_CASE_CONFIGS[useCase] || USE_CASE_CONFIGS.default
}

export const PII_PATTERNS = [
  /\b\d{3}-\d{2}-\d{4}\b/, // SSN
  /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/, // Credit card
  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, // Email
  /\b(?:\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}\b/, // Phone
]

export const PROMPT_INJECTION_PATTERNS = [
  /ignore\s+previous\s+instructions/i,
  /system\s+prompt/i,
  /you\s+are\s+now/i,
  /forget\s+everything/i,
  /act\s+as\s+if/i,
  /pretend\s+to\s+be/i,
  /roleplay\s+as/i,
  /bypass\s+safety/i,
  /disable\s+filter/i,
]