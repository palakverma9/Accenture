'use client'

import React from 'react'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Eye, AlertTriangle, CheckCircle, XCircle, Loader2, Edit3 } from 'lucide-react'
import { QueuedItem, FinalDecision, RiskCategory } from '@/lib/types'
import { formatTimestamp, formatCurrency } from '@/lib/utils'

interface LiveTrafficTableProps {
  items: QueuedItem[]
  onReviewClick: (item: QueuedItem) => void
  autoRefresh: boolean
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

const DECISION_BADGE_VARIANTS: Record<FinalDecision, 'default' | 'destructive' | 'warning' | 'success' | 'info'> = {
  AUTO_APPROVED: 'success',
  AUTO_EDITED: 'warning',
  PENDING_HUMAN_REVIEW: 'warning',
  REJECTED: 'destructive',
  APPROVED_BY_HUMAN: 'info',
}

export function LiveTrafficTable({ items, onReviewClick, autoRefresh }: LiveTrafficTableProps) {
  const sortedItems = [...items].sort((a, b) => b.timestamp - a.timestamp)
  const [expandedRows, setExpandedRows] = React.useState<Set<string>>(new Set())

  const toggleRow = (id: string) => {
    setExpandedRows(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableCaption className="p-4 bg-muted/30 border-b">
          <div className="flex items-center justify-between">
            <span className="font-medium">Live Traffic Monitor</span>
            <div className="flex items-center gap-2">
              <Badge variant={autoRefresh ? 'success' : 'secondary'} className="gap-1">
                {autoRefresh ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
                {autoRefresh ? 'Auto' : 'Paused'}
              </Badge>
            </div>
          </div>
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40px]"></TableHead>
            <TableHead className="w-[120px]">Time</TableHead>
            <TableHead className="w-[100px]">Trace ID</TableHead>
            <TableHead className="w-[140px]">Use Case</TableHead>
            <TableHead className="w-[200px]">Risk Tags</TableHead>
            <TableHead className="w-[100px]">Risk Score</TableHead>
            <TableHead className="w-[160px]">Decision</TableHead>
            <TableHead className="w-[100px]">Amount</TableHead>
            <TableHead className="w-[80px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedItems.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                No traffic captured yet. Run the demo client to generate traffic.
              </TableCell>
            </TableRow>
          ) : (
            sortedItems.map((item) => {
              const actStep = item.trajectory.find((s) => s.type === 'act')
              const amount = actStep?.amount
              const tags = item.risk_tags || []
              const decision = item.final_decision || 'AUTO_APPROVED'
              const score = item.risk_score || 0
              const isExpanded = expandedRows.has(item.id)

              return (
                <React.Fragment key={item.id}>
                  <TableRow className={`group cursor-pointer ${item.status === 'pending' ? 'bg-amber-50/50' : ''}`} onClick={() => toggleRow(item.id)}>
                    <TableCell>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-muted-foreground">
                        {isExpanded ? '▼' : '▶'}
                      </Button>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{formatTimestamp(item.timestamp)}</TableCell>
                    <TableCell className="font-mono text-xs">{item.trace_id.slice(-12)}</TableCell>
                    <TableCell className="text-xs truncate max-w-[130px]">{item.use_case}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {tags.length === 0 ? (
                          <Badge variant="success" className="text-xs font-normal">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Clear
                          </Badge>
                        ) : (
                          tags.map((tag, idx) => (
                            <span key={idx} className={`px-2 py-0.5 rounded text-xs font-medium ${CATEGORY_COLORS[tag.category]}`}>
                              {tag.category}
                            </span>
                          ))
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`font-mono font-bold ${score > 80 ? 'text-red-600' : score > 50 ? 'text-yellow-600' : score > 20 ? 'text-blue-600' : 'text-green-600'}`}>
                        {score.toFixed(0)}
                      </span>
                      <span className="text-muted-foreground text-xs">/100</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={DECISION_BADGE_VARIANTS[decision]}>
                        {decision === 'AUTO_APPROVED' && <CheckCircle className="h-3 w-3 mr-1" />}
                        {decision === 'AUTO_EDITED' && <Edit3 className="h-3 w-3 mr-1" />}
                        {decision === 'PENDING_HUMAN_REVIEW' && <AlertTriangle className="h-3 w-3 mr-1" />}
                        {decision === 'REJECTED' && <XCircle className="h-3 w-3 mr-1" />}
                        {decision === 'APPROVED_BY_HUMAN' && <CheckCircle className="h-3 w-3 mr-1" />}
                        {decision.replace(/_/g, ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {amount ? formatCurrency(amount) : '—'}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant={item.status === 'pending' ? 'outline' : 'ghost'}
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          onReviewClick(item)
                        }}
                        className="h-8 px-2 gap-1"
                      >
                        <Eye className="h-3 w-3" />
                        {item.status === 'pending' ? 'Review' : 'View'}
                      </Button>
                    </TableCell>
                  </TableRow>
                  {isExpanded && (
                    <TableRow className="bg-muted/30">
                      <TableCell colSpan={9} className="p-0 border-b">
                        <div className="p-4 pl-14">
                          <h4 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Trajectory Trace</h4>
                          <div className="flex gap-2 items-stretch overflow-x-auto pb-2">
                            {item.trajectory.map((step, idx) => (
                              <div key={idx} className="flex-shrink-0 flex items-center gap-2">
                                <div className="bg-white dark:bg-gray-900 border rounded-lg p-3 min-w-[200px] max-w-[300px] text-xs">
                                  <div className="font-bold mb-1 text-primary capitalize">{step.type}</div>
                                  <div className="text-muted-foreground truncate" title={step.content}>{step.content}</div>
                                </div>
                                {idx < item.trajectory.length - 1 && (
                                  <div className="text-muted-foreground/30 font-bold">→</div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              )
            })
          )}
        </TableBody>
      </Table>
    </div>
  )
}