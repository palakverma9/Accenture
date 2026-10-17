'use client'

import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react'
import { QueuedItem, RiskCategory } from '@/lib/types'
import { ReactFlowGraph } from '@/components/ReactFlowGraph'
import { formatTimestamp, formatCurrency } from '@/lib/utils'

interface InterventionQueueProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: QueuedItem | null
  onApprove: (id: string, reviewer?: string) => void
  onReject: (id: string, reviewer?: string) => void
}

const CATEGORY_COLORS: Record<RiskCategory, string> = {
  financial: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  pii: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  prompt_injection: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  suspicious: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  bias: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  policy: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  hallucination: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
}

export function InterventionQueue({ open, onOpenChange, item, onApprove, onReject }: InterventionQueueProps) {
  if (!item) return null

  const tags = item.risk_tags || []
  const entropy = item.tier_2_entropy
  const score = item.risk_score || 0
  const actStep = item.trajectory.find((s) => s.type === 'act')
  const amount = actStep?.amount

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className={`h-5 w-5 ${item.status === 'pending' ? 'text-amber-500' : 'text-primary'}`} />
            {item.status === 'pending' ? 'Intervention Required' : 'Trace Details'}
          </DialogTitle>
          <DialogDescription>
            Trace ID: <code className="font-mono text-xs bg-muted px-1 rounded">{item.trace_id}</code>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-2">
            <ReactFlowGraph trajectory={item.trajectory} entropy={entropy} className="h-[350px]" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 p-4 bg-muted/30 rounded-lg">
                <h4 className="font-medium text-sm">Risk Assessment</h4>
                
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Cumulative Score</span>
                  <span className={`font-mono font-bold text-lg ${score > 80 ? 'text-red-600' : score > 50 ? 'text-yellow-600' : score > 20 ? 'text-blue-600' : 'text-green-600'}`}>
                    {score.toFixed(0)}/100
                  </span>
                </div>

                <div className="space-y-2">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Triggered Tags</span>
                  {tags.length === 0 ? (
                    <div className="text-sm flex items-center text-green-600">
                      <CheckCircle className="h-4 w-4 mr-1" /> All clear
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {tags.map((tag, idx) => (
                        <div key={idx} className="flex flex-col gap-1 border-l-2 border-primary/20 pl-2">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${CATEGORY_COLORS[tag.category]}`}>
                              {tag.category}
                            </span>
                            <span className="text-xs text-muted-foreground font-mono">Conf: {tag.confidence}</span>
                          </div>
                          <span className="text-xs leading-snug">{tag.detail}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {entropy !== undefined && (
                  <div className="flex items-center justify-between text-sm pt-2 border-t mt-3">
                    <span className="text-muted-foreground">Semantic Entropy</span>
                    <span className={`font-mono font-bold ${entropy > 0.7 ? 'text-red-600' : entropy > 0.5 ? 'text-yellow-600' : 'text-green-600'}`}>
                      {entropy.toFixed(3)}
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-2 p-4 bg-muted/30 rounded-lg flex flex-col justify-between">
                <div>
                  <h4 className="font-medium text-sm mb-3">Action Details</h4>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Use Case</span>
                    <span className="font-medium">{item.use_case}</span>
                  </div>
                  {actStep && (
                    <>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Intent</span>
                        <Badge variant="outline" className="font-mono text-xs">
                          {actStep.intent || 'UNKNOWN'}
                        </Badge>
                      </div>
                      {amount && (
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-muted-foreground">Amount</span>
                          <span className="font-bold text-lg text-red-600">{formatCurrency(amount)}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Timestamp</span>
                        <span className="font-mono text-xs">{formatTimestamp(item.timestamp)}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {item.status === 'pending' ? (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg dark:bg-amber-900/30 dark:border-amber-800">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-amber-900 dark:text-amber-100">
                    <p className="font-medium mb-1">Human Review Required</p>
                    {tags.length === 0 && entropy && entropy > 0.6 ? (
                      <p>
                        Although this action passed all Tier 1 deterministic checks ('All clear'), the Tier 2 engine detected <strong>high semantic entropy ({entropy.toFixed(3)})</strong>. This pushed the cumulative risk score to <strong>{score.toFixed(0)}/100</strong>. This indicates the agent may be hallucinating or highly uncertain, requiring human validation before execution.
                      </p>
                    ) : (
                      <p>
                        The cumulative risk score for this action reached <strong>{score.toFixed(0)}/100</strong>, exceeding the auto-approve threshold. Please review the ReAct trajectory above before approving.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className={`p-4 rounded-lg border ${item.status === 'approved' ? 'bg-green-50 border-green-200 dark:bg-green-900/30 dark:border-green-800' : 'bg-red-50 border-red-200 dark:bg-red-900/30 dark:border-red-800'}`}>
                <div className="flex items-start gap-3">
                  <Info className={`h-5 w-5 mt-0.5 flex-shrink-0 ${item.status === 'approved' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`} />
                  <div className={`text-sm ${item.status === 'approved' ? 'text-green-900 dark:text-green-100' : 'text-red-900 dark:text-red-100'}`}>
                    <p className="font-medium mb-1">Decision: {item.final_decision?.replace(/_/g, ' ')}</p>
                    <p>
                      {item.final_decision === 'AUTO_APPROVED' && 'This action was automatically approved by the risk cascade.'}
                      {item.final_decision === 'AUTO_EDITED' && 'This action was automatically edited/redacted to remove sensitive elements.'}
                      {item.final_decision === 'REJECTED' && 'This action was automatically rejected due to a critical risk score.'}
                      {item.final_decision === 'APPROVED_BY_HUMAN' && `This action was approved by a human reviewer${item.reviewed_by ? ` (${item.reviewed_by})` : ''}.`}
                      {(item.status === 'rejected' && item.final_decision !== 'REJECTED') && `This action was rejected by a human reviewer${item.reviewed_by ? ` (${item.reviewed_by})` : ''}.`}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2 p-4 bg-muted/30 rounded-lg">
              <h4 className="font-medium text-sm">Trajectory Steps</h4>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {item.trajectory.map((step, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-2 p-2 bg-background rounded text-xs border"
                  >
                    <span className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold bg-primary text-primary-foreground">
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium capitalize">{step.type}</p>
                      <p className="truncate text-muted-foreground">{step.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {item.status === 'pending' ? (
              <div className="space-y-2 p-4 bg-muted/30 rounded-lg border-t-2 border-amber-500">
                <h4 className="font-medium text-sm">Decision</h4>
                <div className="flex gap-2">
                  <Button
                    variant="default"
                    className="flex-1"
                    onClick={() => {
                      onApprove(item.id, 'human')
                      onOpenChange(false)
                    }}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => {
                      onReject(item.id, 'human')
                      onOpenChange(false)
                    }}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-2 p-4 bg-muted/30 rounded-lg border-t-2 border-primary">
                <h4 className="font-medium text-sm">Override Decision</h4>
                <div className="flex gap-2">
                  {item.status === 'rejected' ? (
                    <Button
                      variant="default"
                      className="flex-1"
                      onClick={() => {
                        onApprove(item.id, 'human_override')
                        onOpenChange(false)
                      }}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Overturn — Approve Anyway
                    </Button>
                  ) : (
                    <Button
                      variant="destructive"
                      className="flex-1"
                      onClick={() => {
                        onReject(item.id, 'human_override')
                        onOpenChange(false)
                      }}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Overturn — Reject Anyway
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
      </DialogContent>
    </Dialog>
  )
}