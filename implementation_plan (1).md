# ControlPlane.ai - Hackathon-Grade Implementation Plan

## 1. Executive Summary & Goal
This document outlines the revised, rapid-development architecture for the **ControlPlane.ai** Round 2 prototype. 
We are pivoting to a "Hackathon-Grade" stack (Next.js API Routes + shadcn/ui + React Flow) to build a single-repo, easily deployable prototype. This system acts as a high-speed governance middleware layer that intercepts AI traffic, utilizing a Tier 1 (Fast) / Tier 2 (Deep) detection cascade to enforce risk budgets without destroying latency.

---

## 2. System Architecture (Single-Repo Next.js)

We adopt a proxy-layer architecture that combines the frontend dashboard and the middleware backend into a single deployable Vercel project.

```mermaid
graph TD
    Client[Client Apps / Downstream Agents] -->|Request Payload| NextAPI[Next.js API Route: /api/evaluate]
    
    subgraph ControlPlane Middleware (Next.js API)
        T1[Tier 1: Fast Heuristics & Regex]
        Router{Is Risk Flagged?}
        T2[Tier 2: Heavy LLM Reasoner]
    end
    
    NextAPI --> T1
    T1 --> Router
    Router -->|Clear / Safe| Accept[Auto-Approve]
    Router -->|Borderline / High-Risk| T2
    
    T2 -->|Semantic Entropy > Threshold| Flag[Flag for Intervention]
    T2 -->|Confident| Accept
    
    subgraph Human-in-the-Lead Dashboard
        UI[shadcn/ui Intervention Queue]
        ReactFlow[React Flow ReAct Visualizer]
    end
    
    Flag --> UI
    UI --- ReactFlow
    UI -->|Human Clicks Approve| SAP[Execute Downstream Action]
```

---

## 3. Core Engine Components & Research Integration

### A. The Middleware: Tier 1 vs Tier 2 Routing
*   **Research Basis:** *FrugalGPT (Cost Routing)* & *Llama Guard (Taxonomy)*.
*   **Tier 1 (Cheap/Fast):** Runs on *every* single payload in < 10ms. Uses local TypeScript logic to check financial caps (e.g., action amount > $50k) and regex-based PII/Prompt Injection checks.
*   **Tier 2 (Heavy/Deep):** Triggers only when Tier 1 flags a payload. Uses **Groq** (or simulated fast LLM calls) to run *Semantic Entropy* checks (multi-sampling the response to ensure the AI isn't hallucinating facts before it executes a high-risk SAP action).

### B. Auditability: ReAct Visualized with React Flow
*   **Research Basis:** *ReAct (Yao et al., 2023)*.
*   **Implementation:** Human reviewers cannot audit opaque AI outputs. When a payload hits the Review Queue, the dashboard uses `React Flow` to render a node-based graph of the agent's exact loop:
    1.  `Observe` (e.g., "PO_1001 is stuck")
    2.  `Ground` (e.g., "Check vendor master data")
    3.  `Act` (e.g., "Release payment")
    4.  `Verify` (The node where execution is currently paused)

---

## 4. Tech Stack & Libraries

*   **Framework:** Next.js 14 (App Router). `app/api/...` for the ControlPlane middleware, `app/(dashboard)/...` for the UI.
*   **Styling & UI:** Tailwind CSS + `shadcn/ui` (for enterprise-grade, accessible components built rapidly).
*   **Graph Visualization:** `React Flow` (to map the AI trajectories).
*   **Database / State:** Simulated in-memory array for the rapid prototype (easily swappable to Supabase Postgres).
*   **Deployment:** Vercel (allows for one-click deployment so Accenture judges can test a live URL).

---

## 5. Data Models (Schemas)

### The Evaluation Payload (Intercepted by `/api/evaluate`)
```json
{
  "trace_id": "req-99123",
  "use_case": "sap_remediation_agent",
  "trajectory": [
    {"type": "observe", "content": "Address mismatch detected."},
    {"type": "ground", "content": "Validating master data... Match found."},
    {"type": "act", "intent": "RELEASE_FUNDS", "amount": 120000}
  ],
  "tier_1_status": "FLAGGED_FINANCIAL_CAP",
  "tier_2_entropy": 0.85,
  "final_decision": "PENDING_HUMAN_REVIEW"
}
```

---

## 6. Execution Roadmap & Next Steps

*   **Phase 1: Project Initialization**
    *   Run `create-next-app` with Tailwind.
    *   Initialize `shadcn/ui` and install base components (Cards, Buttons, Badges, Tables).
    *   Install `reactflow` for graph visualization.
*   **Phase 2: Build the ControlPlane API (Middleware)**
    *   Create `/api/evaluate/route.ts`.
    *   Implement the Tier 1 deterministic checks and the Tier 2 simulated LLM routing logic.
*   **Phase 3: Build the Dashboard UI**
    *   Create the Live Traffic table.
    *   Build the Intervention Queue overlay featuring the React Flow graph.
*   **Phase 4: Simulated End-to-End Demo**
    *   Write a client script that spams the `/api/evaluate` endpoint with varying payloads (safe chats, prompt injections, and high-value SAP actions) to populate the dashboard dynamically.
