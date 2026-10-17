import { QueuedItem, EvaluationPayload } from '@/lib/types'
import { EventEmitter } from 'events'

class EvaluationStore extends EventEmitter {
  private items: Map<string, QueuedItem> = new Map()
  private maxItems = 100

  constructor() {
    super()
  }

  add(payload: EvaluationPayload, requiresReview: boolean): QueuedItem {
    const item: QueuedItem = {
      ...payload,
      id: payload.trace_id,
      status: requiresReview ? 'pending' : (payload.final_decision === 'REJECTED' ? 'rejected' : 'approved'),
    }

    this.items.set(item.id, item)

    if (this.items.size > this.maxItems) {
      const oldestKey = this.items.keys().next().value
      if (oldestKey) this.items.delete(oldestKey)
    }

    this.emit('update', { type: 'add', item })
    return item
  }

  getAll(): QueuedItem[] {
    return Array.from(this.items.values()).sort((a, b) => b.timestamp - a.timestamp)
  }

  getPending(): QueuedItem[] {
    return this.getAll().filter((item) => item.status === 'pending')
  }

  getById(id: string): QueuedItem | undefined {
    return this.items.get(id)
  }

  updateStatus(id: string, status: 'approved' | 'rejected', reviewer: string = 'human'): boolean {
    const item = this.items.get(id)
    if (!item) return false

    item.status = status
    item.final_decision = status === 'approved' ? 'APPROVED_BY_HUMAN' : 'REJECTED'
    item.reviewed_by = reviewer
    item.reviewed_at = Date.now()

    this.items.set(id, item)
    this.emit('update', { type: 'update', item })
    return true
  }

  clear(): void {
    this.items.clear()
    this.emit('update', { type: 'clear' })
  }

  getStats() {
    const all = this.getAll()
    return {
      total: all.length,
      pending: all.filter((i) => i.status === 'pending').length,
      approved: all.filter((i) => i.status === 'approved').length,
      rejected: all.filter((i) => i.status === 'rejected').length,
      autoApproved: all.filter((i) => i.final_decision === 'AUTO_APPROVED').length,
      autoEdited: all.filter((i) => i.final_decision === 'AUTO_EDITED').length,
    }
  }
}

// Singleton store instance
export const evaluationStore = new EvaluationStore()

export function createEvaluationPayload(
  useCase: string,
  trajectory: EvaluationPayload['trajectory']
): EvaluationPayload {
  return {
    trace_id: `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    use_case: useCase,
    trajectory,
    timestamp: Date.now(),
  }
}