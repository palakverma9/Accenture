'use client'

import React, { useMemo } from 'react'
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Connection,
  NodeTypes,
  EdgeTypes,
  Background,
  Controls,
  MiniMap,
  Handle,
  Position,
  MarkerType,
} from 'reactflow'
import { cn } from '@/lib/utils'
import { TrajectoryStep } from '@/lib/types'

const nodeTypes: NodeTypes = {
  observe: ObserveNode,
  ground: GroundNode,
  act: ActNode,
  verify: VerifyNode,
}

const edgeTypes: EdgeTypes = {
  default: DefaultEdge,
}

interface StepNodeData {
  label: string
  content: string
  stepNumber: number
  intent?: string
  amount?: number
}

function ObserveNode({ data }: { data: StepNodeData }) {
  return (
    <div className={cn('react-flow-node observe', 'bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:border-blue-800')}>
      <Handle type="target" position={Position.Top} className="w-2 h-2 bg-blue-500" />
      <div className="p-3">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase">Observe</span>
          <span className="text-xs text-blue-500 dark:text-blue-400">#{data.stepNumber}</span>
        </div>
        <p className="text-sm text-blue-900 dark:text-blue-100">{data.content}</p>
      </div>
      <Handle type="source" position={Position.Bottom} className="w-2 h-2 bg-blue-500" />
    </div>
  )
}

function GroundNode({ data }: { data: StepNodeData }) {
  return (
    <div className={cn('react-flow-node ground', 'bg-green-50 border-green-200 dark:bg-green-900/30 dark:border-green-800')}>
      <Handle type="target" position={Position.Top} className="w-2 h-2 bg-green-500" />
      <div className="p-3">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold text-green-700 dark:text-green-300 uppercase">Ground</span>
          <span className="text-xs text-green-500 dark:text-green-400">#{data.stepNumber}</span>
        </div>
        <p className="text-sm text-green-900 dark:text-green-100">{data.content}</p>
      </div>
      <Handle type="source" position={Position.Bottom} className="w-2 h-2 bg-green-500" />
    </div>
  )
}

function ActNode({ data }: { data: StepNodeData }) {
  return (
    <div className={cn('react-flow-node act', 'bg-orange-50 border-orange-200 dark:bg-orange-900/30 dark:border-orange-800')}>
      <Handle type="target" position={Position.Top} className="w-2 h-2 bg-orange-500" />
      <div className="p-3">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold text-orange-700 dark:text-orange-300 uppercase">Act</span>
          <span className="text-xs text-orange-500 dark:text-orange-400">#{data.stepNumber}</span>
        </div>
        {data.intent && (
          <p className="text-xs text-orange-600 dark:text-orange-400 mb-1 font-mono">{data.intent}</p>
        )}
        <p className="text-sm text-orange-900 dark:text-orange-100">{data.content}</p>
        {data.amount && (
          <p className="text-sm font-bold text-orange-700 dark:text-orange-300 mt-1">
            Amount: ${data.amount.toLocaleString()}
          </p>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} className="w-2 h-2 bg-orange-500" />
    </div>
  )
}

function VerifyNode({ data }: { data: StepNodeData }) {
  return (
    <div className={cn('react-flow-node verify', 'bg-red-50 border-red-200 dark:bg-red-900/30 dark:border-red-800 animate-pulse')}>
      <Handle type="target" position={Position.Top} className="w-2 h-2 bg-red-500" />
      <div className="p-3">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold text-red-700 dark:text-red-300 uppercase">Verify</span>
          <span className="text-xs text-red-500 dark:text-red-400">#{data.stepNumber}</span>
        </div>
        <p className="text-sm text-red-900 dark:text-red-100">{data.content}</p>
        <p className="text-xs text-red-600 dark:text-red-400 mt-1">⏸ Paused - Awaiting Human Review</p>
      </div>
    </div>
  )
}

function DefaultEdge({ id, source, target, style, ...rest }: { id: string; source: string; target: string; style?: React.CSSProperties } & React.SVGProps<SVGPathElement>) {
  return (
    <path
      id={id}
      style={style}
      className="stroke-muted stroke-[1.5] dark:stroke-muted/50"
      markerEnd={MarkerType.ArrowClosed}
      {...rest}
    />
  )
}

interface ReactFlowGraphProps {
  trajectory: TrajectoryStep[]
  entropy?: number
  className?: string
}

export function ReactFlowGraph({ trajectory, entropy, className }: ReactFlowGraphProps) {
  const { nodes, edges } = useMemo(() => {
    const newNodes: Node<StepNodeData>[] = []
    const newEdges: Edge[] = []

    trajectory.forEach((step, index) => {
      const nodeId = `step-${index}`
      const isLast = index === trajectory.length - 1

      let label = step.type.charAt(0).toUpperCase() + step.type.slice(1)
      let content = step.content

      if (step.type === 'act') {
        label = step.intent ? `Act: ${step.intent}` : 'Act'
        content = step.intent ? `${step.content} (${step.intent})` : step.content
      }

      newNodes.push({
        id: nodeId,
        type: step.type,
        position: { x: 0, y: index * 160 },
        data: {
          label,
          content,
          stepNumber: index + 1,
          intent: step.intent,
          amount: step.amount,
        },
        style: { width: 320 },
      })

      if (index > 0) {
        newEdges.push({
          id: `edge-${index - 1}-${index}`,
          source: `step-${index - 1}`,
          target: nodeId,
          type: 'default',
          animated: true,
          style: { strokeWidth: 2 },
        })
      }
    })

    return { nodes: newNodes, edges: newEdges }
  }, [trajectory])

  const onConnect = (connection: Connection) => {
    // Edges are pre-defined, but keep for extensibility
  }

  return (
    <div className={cn('w-full h-96 rounded-lg border', className)}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onConnect={onConnect}
        fitView
        onlyRenderVisibleElements
        attributionPosition="bottom-left"
      >
        <Background color="#e5e7eb" gap={16} />
        <Controls />
        <MiniMap
          nodeColor={(node) => {
            const colors: Record<string, string> = {
              observe: '#3b82f6',
              ground: '#22c55e',
              act: '#f97316',
              verify: '#ef4444',
            }
            return colors[node.type || ''] || '#6b7280'
          }}
        />
      </ReactFlow>
      {entropy !== undefined && (
        <div className="absolute bottom-2 right-2 bg-background/90 backdrop-blur px-3 py-1.5 rounded text-xs font-mono border">
          Entropy: {entropy.toFixed(3)}
        </div>
      )}
    </div>
  )
}

import 'reactflow/dist/style.css'