# RepoGenius AI 🧠⚡

> **Understand code. Contribute smarter.**  
> A minimal, professional AI developer tool built for Hacktoberfest hackathons.

[![React](https://img.shields.io/badge/React-19.3-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?logo=vite&logoColor=white)](https://vite.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![AI Model](https://img.shields.io/badge/AI%20Model-Google%20Gemma%204-4285F4?logo=google&logoColor=white)](https://ai.google.dev/gemma)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

---

## 🎯 Three Core Features

### 1. 🔍 Repository Analyzer
- **URL Validation**: Accepts full GitHub URLs (`https://github.com/owner/repo`) or shorthand (`owner/repo`).
- **Real GitHub REST API Data**: Fetches repository name, description, stars, primary language, license, default branch, raw README, and top-level directory file contents (`/contents`).
- **Clear States**: User-friendly error messaging for invalid formats, private or missing repositories (404), and rate limits (403).
- **Gemma 4 Architecture Breakdown**: Produces a structured architectural summary when Gemma 4 is configured, or provides clean setup instructions when unconfigured.

### 2. 💡 AI Code Explainer
- **Code Submission**: Clean code editor with language selection (Python, JS, TS, Rust, Go, Java, C++) and optional context.
- **Sample Snippets**: Instant one-click presets for rapid testing (Python async tasks, React hooks, Rust binary search).
- **Gemma 4 Analysis**: Returns a plain-English summary, a step-by-step breakdown of how the code functions, and key takeaways.
- **Config Guidance**: Displays a helpful setup card if the backend or API key is not yet configured.

### 3. 📸 Visual Debugger
- **Screenshot Ingestion**: Drag-and-drop or upload error screenshots (PNG, JPEG, WebP; up to 10MB).
- **Image Preview**: Displays uploaded images with file format, resolution, and quick removal.
- **Multimodal Error Diagnosis**: Dispatches screenshot tensors to Google Gemma 4 to analyze root causes and generate concrete code fixes with a one-click copy button.
- **Integrity Guarantee**: Never simulates fake AI outputs; returns genuine model responses when keys are active or clear configuration guidance when unconfigured.

---

## 🎨 Design System

- **Background**: `#0B1020`
- **Cards**: `#111827`
- **Primary Accent**: `#6366F1` (Indigo/Violet)
- **Text**: White and readable neutral gray (`#9CA3AF`, `#D1D5DB`)
- **Icons**: Lucide React
- **Restrained Styling**: Clean typography, subtle borders (`rgba(255, 255, 255, 0.08)`), responsive single-workspace layout without decorative charts, oversized stats, or unnecessary modals.

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js** (v18+) & `npm`
- **Python** (v3.10+) & `pip`

---

### Step 1: Run the Frontend
```bash
# 1. Install dependencies
npm install

# 2. Start Vite development server
npm run dev
```
Open **`http://localhost:5173`** in your browser.

---

### Step 2: Run the FastAPI AI Backend
In a separate terminal window:
```bash
# 1. Create and activate a Python virtual environment
python3 -m venv backend/venv
source backend/venv/bin/activate  # Windows: backend\venv\Scripts\activate.bat

# 2. Install backend requirements
pip install -r backend/requirements.txt

# 3. Create your local .env file
cp .env.example .env
```

To enable live Gemma 4 responses, add your API key in `.env`:
```env
GEMMA_API_KEY=your_google_ai_studio_api_key_here
GEMMA_MODEL=gemma-4
HOST=127.0.0.1
PORT=8000
```

Start the backend server:
```bash
uvicorn backend.main:app --reload --port 8000
```
Backend health check is accessible at **`http://127.0.0.1:8000/api/health`**.

---

## 🧪 Testing & Verification

### Test Frontend Build
```bash
npm run build
```
*Builds production client bundle with 0 errors in under 200ms.*

### Test Backend Endpoints
```bash
./backend/venv/bin/python3 backend/test_backend.py
```
*Verifies all 5 endpoints: `/api/health`, `/api/explain-repo`, `/api/explain-code`, `/api/debug-screenshot`, and input validation.*

---

## 🤖 AI Model Attribution

This application integrates with **Google Gemma 4**, an open-weights state-of-the-art model developed by **Google DeepMind**.
- Model family: `gemma-4`
- Multimodal capability: Image understanding for visual code debugging and structured architectural explanation.
- Official model documentation: [https://ai.google.dev/gemma](https://ai.google.dev/gemma)

---

## 🔒 Security & Code Integrity

- **Zero Code Execution**: Repository code is never executed.
- **Credential Protection**: All API keys remain strictly in backend environment variables (`.env`) and are excluded from Git via `.gitignore`.
- **Upload Validation**: Image uploads are bounded by a 10MB limit and restricted to valid image MIME types (`image/png`, `image/jpeg`, `image/webp`).

---

## 📄 License

This project is licensed under the [MIT License](./LICENSE).
