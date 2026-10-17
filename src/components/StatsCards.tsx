'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, AlertTriangle, XCircle, Clock, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatCardProps {
  title: string
  value: number | string
  icon: React.ReactNode
  color: string
  bgColor: string
  trend?: string
  trendUp?: boolean
}

function StatCard({ title, value, icon, color, bgColor, trend, trendUp }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold mt-1">{value}</p>
            {trend && (
              <p className={cn('text-xs mt-1 flex items-center gap-1', trendUp ? 'text-green-600' : 'text-red-600')}>
                <TrendingUp className={cn('h-3 w-3', !trendUp && 'rotate-180')} />
                {trend}
              </p>
            )}
          </div>
          <div className={cn('p-3 rounded-lg', bgColor)}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface StatsCardsProps {
  stats: {
    total: number
    pending: number
    approved: number
    rejected: number
    autoApproved: number
  }
}

export function StatsCards({ stats }: StatsCardsProps) {
  const approvalRate = stats.total > 0 ? Math.round(((stats.approved + stats.autoApproved) / stats.total) * 100) : 0

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      <StatCard
        title="Total Evaluations"
        value={stats.total}
        icon={<Clock className="h-6 w-6 text-blue-600" />}
        color="text-blue-600"
        bgColor="bg-blue-100 dark:bg-blue-900/30"
        trend="+12%"
        trendUp={true}
      />
      <StatCard
        title="Pending Review"
        value={stats.pending}
        icon={<AlertTriangle className="h-6 w-6 text-amber-600" />}
        color="text-amber-600"
        bgColor="bg-amber-100 dark:bg-amber-900/30"
        trend={stats.pending > 0 ? 'Active' : 'Clear'}
        trendUp={stats.pending === 0}
      />
      <StatCard
        title="Auto Approved"
        value={stats.autoApproved}
        icon={<CheckCircle className="h-6 w-6 text-green-600" />}
        color="text-green-600"
        bgColor="bg-green-100 dark:bg-green-900/30"
        trend={`${approvalRate}% rate`}
        trendUp={true}
      />
      <StatCard
        title="Human Approved"
        value={stats.approved}
        icon={<CheckCircle className="h-6 w-6 text-blue-600" />}
        color="text-blue-600"
        bgColor="bg-blue-100 dark:bg-blue-900/30"
      />
      <StatCard
        title="Rejected"
        value={stats.rejected}
        icon={<XCircle className="h-6 w-6 text-red-600" />}
        color="text-red-600"
        bgColor="bg-red-100 dark:bg-red-900/30"
      />
    </div>
  )
}