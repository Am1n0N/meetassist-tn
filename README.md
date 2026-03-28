# 🇹🇳 MeetAssist TN

AI-powered meeting assistant for Tunisian businesses — Derija/French transcription with A2UI.

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org)
[![CopilotKit](https://img.shields.io/badge/CopilotKit-A2UI-blue)](https://copilotkit.ai)
[![Groq](https://img.shields.io/badge/Groq-LLaMA%203.3-orange)](https://groq.com)
[![Python](https://img.shields.io/badge/Python-3.11+-green)](https://python.org)

## Overview

MeetAssist TN records meetings, transcribes them from **Tunisian Arabic (Derija) and French**, and automatically generates concise summaries, action items, and interactive dashboards using **AG-UI** and **A2UI** (AI-Augmented UI) via CopilotKit.

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 15 (App Router), React, TypeScript, Tailwind CSS, shadcn/ui |
| **AI-UI Protocol** | AG-UI via **CopilotKit** (`@copilotkit/react-core`, `@copilotkit/react-ui`, `@copilotkit/runtime`) |
| **A2UI Engine** | CopilotKit `useCopilotAction` with `render` prop |
| **Backend Agent** | Python with **LangGraph** + **CopilotKit Python SDK** |
| **LLM** | **Groq Cloud** — `llama-3.3-70b-versatile` (free tier) |
| **ASR** | **Groq Whisper API** (`whisper-large-v3-turbo`) |

## Quick Start

### Prerequisites
- Node.js 18+
- Python 3.11+
- [Groq API Key](https://console.groq.com) (free tier)

### 1. Clone & Setup

```bash
git clone https://github.com/Am1n0N/meetassist-tn.git
cd meetassist-tn
```

### 2. Frontend Setup

```bash
cd frontend
cp .env.example .env.local
# Add your GROQ_API_KEY to .env.local
npm install
npm run dev
```

### 3. Backend Setup

```bash
cd backend
cp .env.example .env
# Add your GROQ_API_KEY to .env
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
python server.py
```

### 4. Docker (Alternative)

```bash
cp .env.example .env  # Add GROQ_API_KEY
docker-compose up
```

Frontend: http://localhost:3000 | Backend: http://localhost:8000

## Features

### 🎙️ Meeting Recording
- Browser-based audio recording via Web Audio API
- Real-time audio level visualization
- Chunked recording for live transcription

### 🤖 AI Transcription
- Groq Whisper (`whisper-large-v3-turbo`) for speech-to-text
- Supports Tunisian Derija (Arabic dialect) and French
- Handles code-switching between languages

### 📊 A2UI Dynamic Dashboards
The AI agent dynamically composes 14 interactive UI components:

| Component | Description |
|---|---|
| `ActionItemKanban` | Kanban board: To Do / In Progress / Done |
| `DecisionCard` | Highlighted decision cards with context |
| `SummaryAccordion` | Expandable meeting topic sections |
| `StatusDashboard` | KPI cards with progress indicators |
| `TranscriptTimeline` | Interactive timeline with speaker labels |
| `SentimentTimeline` | Sentiment chart over meeting duration |
| `RiskMatrix` | 2×2 risk/impact assessment grid |
| `ParticipantCards` | Participant profiles with speaking time |
| `DeadlineCalendar` | Calendar view of action item deadlines |
| `ComparisonTable` | Side-by-side option comparison |
| `VotingPanel` | Real-time voting/polling widget |
| `FollowUpEmail` | AI-generated follow-up email draft (French) |
| `DependencyGraph` | Task dependency visualization |
| `DynamicGrid` | CSS Grid renderer for AI-composed layouts |

## Project Structure

```
meetassist-tn/
├── frontend/                    # Next.js 15 app
│   ├── src/
│   │   ├── app/                 # App Router pages
│   │   ├── components/
│   │   │   ├── ui/              # shadcn/ui components
│   │   │   ├── meeting/         # Meeting workspace components
│   │   │   └── a2ui/            # AI-Augmented UI components
│   │   ├── lib/                 # Utilities (Groq client, cn)
│   │   └── types/               # TypeScript types
├── backend/                     # Python LangGraph agent
│   ├── server.py                # FastAPI + CopilotKit endpoint
│   └── agents/                  # LangGraph agent + prompts
├── docker-compose.yml
└── README.md
```

## Environment Variables

### Frontend (`.env.local`)
```
GROQ_API_KEY=gsk_...
NEXT_PUBLIC_COPILOTKIT_URL=http://localhost:8000/copilotkit
```

### Backend (`.env`)
```
GROQ_API_KEY=gsk_...
```

## License

MIT