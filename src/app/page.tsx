import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Shield, ArrowRight, Activity, Code, Server } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="border-b bg-white dark:bg-gray-900 sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-xl font-bold">ControlPlane.ai</h1>
          </div>
          <Link href="/dashboard">
            <Button>
              Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <section className="py-20 md:py-32 px-4 text-center max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
            The Trust Layer for <br className="hidden md:block" /> Enterprise Agents
          </h2>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            Enterprises run GenAI across dozens of use cases with different risk tolerances. ControlPlane.ai is a governance middleware that intercepts agent trajectories, applies a tiered risk cascade, and safely routes traffic based on real-time policy.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/dashboard">
              <Button size="lg" className="h-12 px-8 text-base">
                Launch Live Demo
              </Button>
            </Link>
          </div>
        </section>

        <section className="bg-white dark:bg-gray-900 py-20 border-y">
          <div className="container mx-auto px-4">
            <h3 className="text-2xl font-bold text-center mb-12">How It Works: The Tiered Cascade</h3>
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="p-6 rounded-2xl bg-gray-50 dark:bg-gray-950 border">
                <Activity className="h-10 w-10 text-green-500 mb-4" />
                <h4 className="text-xl font-bold mb-2">Tier 1: Deterministic</h4>
                <p className="text-muted-foreground">
                  Sub-10ms evaluation of hard rules: PII regex, prompt injection signatures, financial caps, and bias heuristics.
                </p>
              </div>
              <div className="p-6 rounded-2xl bg-gray-50 dark:bg-gray-950 border">
                <Code className="h-10 w-10 text-blue-500 mb-4" />
                <h4 className="text-xl font-bold mb-2">Tier 2: Semantic Entropy</h4>
                <p className="text-muted-foreground">
                  For complex reasoning, we simulate parallel LLM calls to measure output uniqueness and variance, proxying hallucination confidence.
                </p>
              </div>
              <div className="p-6 rounded-2xl bg-gray-50 dark:bg-gray-950 border">
                <Server className="h-10 w-10 text-purple-500 mb-4" />
                <h4 className="text-xl font-bold mb-2">Tier 3: Policy Router</h4>
                <p className="text-muted-foreground">
                  A dynamic risk score (0-100) dictates routing: Auto-Approve, Auto-Edit (redaction), Human Review Queue, or Hard Reject.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}