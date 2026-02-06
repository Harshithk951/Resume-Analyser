# ResumeOptima 🚀

> **Beat the ATS. Land Your Dream MNC Job.**  
> An elite AI-powered Resume Analyzer with **Ultra-Strict MNC Scoring** and **iPhone-Style Glassmorphism UI** built with **Google Gemini 3 Pro**.

<div align="center">

![Status](https://img.shields.io/badge/Status-Active-success?style=for-the-badge&logo=statuspage)
![AI Model](https://img.shields.io/badge/AI_Model-Gemini_3_Pro-blue?style=for-the-badge&logo=google)
![Framework](https://img.shields.io/badge/Framework-React_19-cyan?style=for-the-badge&logo=react)
![UI Design](https://img.shields.io/badge/UI-Glassmorphism-pink?style=for-the-badge&logo=apple)
![License](https://img.shields.io/badge/License-MIT-purple?style=for-the-badge)

</div>

<br />

## ✨ Overview

**ResumeOptima** is a high-performance **Applicant Tracking System (ATS) Auditor** designed for **top-tier MNC recruitment** (Google, Meta, Amazon, Microsoft, Apple). Unlike generic text checkers, it leverages **Gemini 3 Pro's multimodal vision capabilities** to "see" your resume exactly how enterprise ATS systems (Workday, Taleo, Greenhouse) parse it.

It features an **ultra-strict scoring system** that ensures only truly exceptional resumes score 85+, providing realistic feedback aligned with FAANG and Fortune 500 expectations. The modern **glassmorphism UI** delivers a premium, iPhone-style experience with light gradients and frosted glass effects.

---

## 🎥 Features

### 🎨 iPhone-Style Glassmorphism UI
*   **Light Gradient Backgrounds:** Soft blue → purple → pink gradients create an airy, premium feel.
*   **Frosted Glass Effects:** All cards use `backdrop-blur` for a modern, translucent aesthetic.
*   **Glow Effects:** Score circles feature vibrant glows (blue, green) for visual impact.
*   **Soft Pastel Colors:** Carefully curated color palette for readability and elegance.
*   **Perfect Text Fitting:** All content is optimized for clarity across all screen sizes.

### ⚡ Real-Time ATS Audit
*   **Vision-Based Parsing:** Uses multimodal AI to detect visual layout errors that standard text scrapers miss.
*   **Structure Validation:** Flags tables, columns, headers/footers, and non-standard fonts.
*   **Two-Pass System:**
    1.  **Parsing Pass (30%):** Can the machine read it?
    2.  **Content Pass (45%):** Is the content high-impact?
    3.  **Keyword Pass (25%):** Are critical skills present?

### 🎯 Ultra-Strict MNC Scoring Engine
*   **Realistic Scores:** Entry-level resumes score 55-65, not 99. Only exceptional resumes reach 85+.
*   **Scale/Impact Required:** High scores require quantified achievements (millions of users, revenue impact, performance metrics).
*   **Hard Score Caps:** 
    - Parsing: Max 90
    - Keywords: Max 90
    - Final: Max 88 (without exceptional scale/impact)
*   **Reduced Bonuses:** All bonuses cut 50-60% to prevent score inflation.
*   **MNC-Focused Criteria:** Evaluates based on FAANG and Fortune 500 expectations.

### 🔍 Deep Dive Analysis
*   **Critical Issue Flagging:** Identifies specific blocks that will cause auto-rejection.
*   **Keyword Gap Analysis:** Compares your resume against industry-standard keywords for your role.
*   **Vocabulary Check:** Detects weak verbs ("Used", "Helped") and suggests power verbs ("Architected", "Spearheaded").
*   **Transparency Panel:** Shows exact penalties and bonuses applied to your score.

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
| **Styling** | Tailwind CSS | Utility-first styling with **Glassmorphism effects** (`backdrop-blur`, gradients). |
| **Visualization** | Recharts | Radial gauges for score visualization with glow effects. |
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

This repo is configured to load Vite env files from `env/` (see `env/README.md` and `vite.config.ts`). For Gemini API credentials, use **either** `VITE_API_KEY` (direct browser key; recommended only for local/dev) **or** the **serverless proxy** (`/api/gemini`)—`env/README.md` shows the supported options and where to put them.

If you need a base path (GitHub Pages), you can also set it inline when running commands:

```bash
VITE_BASE=/ResumeOptima/ npm run build
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

## 📸 Screenshots

### Glassmorphism UI - Light & Modern Design

**Score Dashboard with Glow Effects**
![Score Dashboard](https://github.com/user-attachments/assets/glassmorphism-scores.png)
*Light gradient background (blue → purple → pink) with frosted glass cards and vibrant score circle glows*

**Critical Fixes - Glass Cards**
![Critical Fixes](https://github.com/user-attachments/assets/glassmorphism-fixes.png)
*Translucent issue cards with backdrop-blur effects and soft pastel severity badges*

**Keyword Analysis - Premium Layout**
![Keyword Analysis](https://github.com/user-attachments/assets/glassmorphism-keywords.png)
*Glass containers with matched/missing keywords in a clean, readable layout*

### Key Design Features:
1.  **Light Gradient Backgrounds:** Soft, airy feel with blue/purple/pink tones
2.  **Frosted Glass Effects:** All cards use `backdrop-blur-2xl` for premium aesthetic
3.  **Glow Effects:** Score circles feature vibrant colored glows
4.  **Perfect Text Fitting:** Optimized typography for all screen sizes

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
