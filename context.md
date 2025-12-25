# Project Context: SLM Evaluation Framework

## Core Architecture
- **Backend (Python/FastAPI)**: Manages use cases, background evaluation jobs, and JSON persistence (`data/*.json`).
- **Frontend (React/Vite)**: Glassmorphic UI with Tailwind v4, Recharts for analytics, and Framer Motion animations.
- **Inference**: Local via Ollama API (`localhost:11434`).
- **Data**: HuggingFace `datasets` (e.g., `ai2_arc`).

## Domain Model
- **UseCase**: Named evaluation scenario (e.g., GKH - General Knowledge Helper) with a specific HF dataset source.
- **PromptConfig**: Composite prompts with CoT system instructions, few-shot examples, and dynamic `{{placeholders}}`.
- **Job**: Async task tracking evaluation progress (0-100%) and scoring.
- **EvaluationResult**: Final accuracy score and metadata per run.

## Key Files
- `backend/main.py`: The single source of truth for API, logic, and persistence.
- `slm-eval-app/src/pages/`: Modular React components for each dashboard view.
- `README.md`: Detailed setup and tech stack documentation.
