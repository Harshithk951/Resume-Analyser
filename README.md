# ResumeOptima 🚀

> **Beat the ATS. Get the Job.**  
> An elite AI-powered Resume Analyzer & Career Coach built with **Google Gemini 3 Pro**.

<div align="center">

![Status](https://img.shields.io/badge/Status-Active-success?style=for-the-badge&logo=statuspage)
![AI Model](https://img.shields.io/badge/AI_Model-Gemini_3_Pro-blue?style=for-the-badge&logo=google)
![Framework](https://img.shields.io/badge/Framework-React_19-cyan?style=for-the-badge&logo=react)
![License](https://img.shields.io/badge/License-MIT-purple?style=for-the-badge)

</div>

<br />

## ✨ Overview

**ResumeOptima** is a high-performance **Applicant Tracking System (ATS) Auditor**. Unlike generic text checkers, it leverages **Gemini 3 Pro's multimodal vision capabilities** to "see" your resume exactly how a recruiter or enterprise parser (Workday, Taleo, Greenhouse) sees it.

It identifies "ATS Killers" (like multi-column tables, graphics, and broken reading orders) and provides a **deterministic score** based on hard technical rules, not just AI opinion.

---

## 🎥 Features

### ⚡ Real-Time ATS Audit
*   **Vision-Based Parsing:** Uses multimodal AI to detect visual layout errors that standard text scrapers miss.
*   **Structure Validation:** Flags tables, columns, headers/footers, and non-standard fonts.

### 🎯 Deterministic Scoring Engine
*   **No Randomness:** Scores are calculated using a strict mathematical engine (e.g., `Tables detected = -20 points`).
*   **Two-Pass System:**
    1.  **Parsing Pass:** Can the machine read it?
    2.  **Content Pass:** Is the content high-impact?

### 🔍 Deep Dive Analysis
*   **Critical Issue Flagging:** Identifies specific blocks that will cause auto-rejection.
*   **Keyword Gap Analysis:** Compares your resume against industry-standard keywords for your role.
*   **Vocabulary check:** Detects weak verbs ("Used", "Helped") and suggests power verbs ("Architected", "Spearheaded").

### 🤖 AI Career Architect
*   **Context-Aware Chat:** A floating assistant that knows the context of your uploaded resume.
*   **Technical Advice:** Ask questions like *"How do I rewrite my summary to sound more senior?"*

---

## 🛠️ Tech Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Core** | React 19 + TypeScript | High-performance frontend with strict typing. |
| **Build Tool** | Vite | Lightning-fast HMR and bundling. |
| **AI Model** | **Gemini 3 Pro** | Leverages `@google/genai` SDK for multimodal vision analysis. |
| **Styling** | Tailwind CSS | Utility-first styling with Glassmorphism effects. |
| **Visualization** | Recharts | Radial gauges for score visualization. |
| **Icons** | Lucide React | Clean, consistent SVG icons. |

---

## 🧠 Architecture Logic

This project moves away from "AI Hallucinated Scores" to a **Hybrid Scoring Model**:

1.  **File Ingestion:** Browser converts PDF/DOCX to Base64 (No backend storage).
2.  **Signal Extraction (AI):** 
    *   The image is sent to Gemini 3 Pro with a strict `SYSTEM_PROMPT`.
    *   Role: "Senior ATS Parsing Agent".
    *   Output: **Raw Signals** (e.g., `hasTables: true`, `bulletCount: 15`).
3.  **Deterministic Scoring (Code):**
    *   A TypeScript logic layer (`scoringLogic.ts`) takes the signals.
    *   Applies penalties: `if (hasTables) score -= 20`.
    *   Applies bonuses: `if (metricDensity > 40%) score += 15`.
4.  **UI Hydration:** Results are rendered into the React Dashboard.

---

## 🚀 Quick Start

### Prerequisites
*   Node.js 18+
*   Google Cloud Project with Gemini API enabled.

### 1. Clone & Install

```bash
git clone https://github.com/yourusername/resume-optima.git
cd resume-optima
npm install
```

### 2. Environment Setup

Create a `.env` file in the root directory:

```env
# Get key from https://aistudio.google.com/
API_KEY=your_gemini_api_key_here
```

### 3. Run Development Server

```bash
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`) to view the app.

---

## 🌍 Deployment (Fixing 404s on refresh / deep links)

Static hosts can return **404** when you refresh a non-root URL unless they rewrite all routes back to `index.html`.
This repo includes the standard configs:

- **Vercel**: `vercel.json` rewrite to `/`
- **Netlify**: `netlify.toml` redirect `/* -> /index.html (200)`
- **GitHub Pages**: `public/404.html` fallback + `public/.nojekyll`

### GitHub Pages base path

If your repo is served from a subpath like `/ResumeOptima/`, set a base path at build time:

```bash
VITE_BASE=/ResumeOptima/ npm run build
```

---

## 📸 Screen Preview

> *Add screenshots of the Dashboard here*

1.  **Landing Page:** Clean, animated dropzone.
2.  **Dashboard:** Radial gauges showing the 3-point score breakdown.
3.  **Transparency Panel:** Dropdown showing exact penalties applied.
4.  **Chat Assistant:** Floating bot for real-time Q&A.

---

## 🔮 Roadmap

- [ ] **Job Description Matcher:** Upload a JD to score compatibility against a specific role.
- [ ] **PDF Export:** Download the audit report as a PDF.
- [ ] **Resume Rewriter:** AI agent that directly edits the uploaded DOCX file.
- [ ] **History:** LocalStorage saving of previous scans.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

<div align="center">
  <sub>Built with ❤️ using Google Gemini API</sub>
</div>
