'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Shield, Zap, RefreshCw, Play, Pause, Activity } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { LiveTrafficTable } from '@/components/LiveTrafficTable'
import { InterventionQueue } from '@/components/InterventionQueue'
import { StatsCards } from '@/components/StatsCards'
import { QueuedItem } from '@/lib/types'
import { evaluationStore } from '@/lib/store'
import { cn } from '@/lib/utils'

export default function DashboardPage() {
  const [items, setItems] = useState<QueuedItem[]>([])
  const [stats, setStats] = useState({
    total: 0, pending: 0, approved: 0, rejected: 0, autoApproved: 0, autoEdited: 0
  })
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [selectedItem, setSelectedItem] = useState<QueuedItem | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [sseStatus, setSseStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected')

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch('/api/evaluate')
      if (response.ok) {
        const data = await response.json()
        setItems(data.items)
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    }
  }, [])

  useEffect(() => {
    if (!autoRefresh) {
      setSseStatus('disconnected')
      return
    }

    const eventSource = new EventSource('/api/stream')
    setSseStatus('connecting')

    eventSource.onopen = () => {
      setSseStatus('connected')
    }

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        setItems(data.items)
        setStats(data.stats)
      } catch (e) {
        console.error('Error parsing SSE data', e)
      }
    }

    eventSource.onerror = () => {
      setSseStatus('disconnected')
      // EventSource will automatically try to reconnect
    }

    return () => {
      eventSource.close()
    }
  }, [autoRefresh])

  // Initial fetch just in case
  useEffect(() => {
    if (!autoRefresh) fetchData()
  }, [fetchData, autoRefresh])

  const handleReviewClick = (item: QueuedItem) => {
    setSelectedItem(item)
  }

  const handleApprove = async (id: string, reviewer: string = 'human') => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/evaluate/${id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve', reviewer }),
      })
      if (response.ok && !autoRefresh) {
        fetchData()
      }
    } catch (error) {
      console.error('Failed to approve:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleReject = async (id: string, reviewer: string = 'human') => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/evaluate/${id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject', reviewer }),
      })
      if (response.ok && !autoRefresh) {
        fetchData()
      }
    } catch (error) {
      console.error('Failed to reject:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleManualRefresh = () => {
    fetchData()
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="border-b bg-white dark:bg-gray-900 sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold">ControlPlane.ai</h1>
                <p className="text-xs text-muted-foreground">Governance Middleware Dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  await fetch('/api/simulate', { method: 'POST', body: JSON.stringify({ count: 3 }) })
                }}
                className="gap-1 border-primary/20 hover:bg-primary/5"
              >
                <Zap className="h-3 w-3 text-amber-500" />
                Inject Test Traffic
              </Button>
              <div className="flex items-center gap-2 border-l pl-3 ml-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  className={cn('gap-1 transition-colors', autoRefresh && 'bg-green-100 text-green-700 border-green-300 hover:bg-green-200')}
                >
                  {autoRefresh ? (
                    <>
                      <Activity className={cn("h-4 w-4", sseStatus === 'connected' ? 'animate-pulse' : '')} />
                      Live Stream
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" />
                      Paused
                    </>
                  )}
                </Button>
                {!autoRefresh && (
                  <Button variant="outline" size="sm" onClick={handleManualRefresh} disabled={isLoading}>
                    <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
                    Refresh
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-6 space-y-6">
        <StatsCards stats={stats} />

        <Card className="shadow-sm border-0 ring-1 ring-black/5">
          <CardContent className="p-0">
            <LiveTrafficTable
              items={items}
              onReviewClick={handleReviewClick}
              autoRefresh={autoRefresh}
            />
          </CardContent>
        </Card>

        <Card className="shadow-sm border-0 ring-1 ring-black/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg">System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-2 mb-2">
                  <span className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="font-medium text-green-800 dark:text-green-200">Tier 1 Engine</span>
                </div>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Deterministic heuristics running &lt;10ms
                </p>
              </div>
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-2 mb-2">
                  <span className="h-2 w-2 rounded-full bg-blue-500" />
                  <span className="font-medium text-blue-800 dark:text-blue-200">Tier 2 Engine</span>
                </div>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Semantic entropy via parallel sampling
                </p>
              </div>
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                <div className="flex items-center gap-2 mb-2">
                  <span className="h-2 w-2 rounded-full bg-amber-500" />
                  <span className="font-medium text-amber-800 dark:text-amber-200">Auto-Edit Tier</span>
                </div>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  Inline PII redaction active
                </p>
              </div>
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                <div className="flex items-center gap-2 mb-2">
                  <span className={cn("h-2 w-2 rounded-full", sseStatus === 'connected' ? 'bg-purple-500 animate-pulse' : 'bg-gray-400')} />
                  <span className="font-medium text-purple-800 dark:text-purple-200">Transport Layer</span>
                </div>
                <p className="text-sm text-purple-700 dark:text-purple-300">
                  {sseStatus === 'connected' ? 'SSE active: Real-time stream connected' : 'SSE inactive: Polling/Manual mode'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      <InterventionQueue
        open={!!selectedItem}
        onOpenChange={(open) => !open && setSelectedItem(null)}
        item={selectedItem}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  )
}