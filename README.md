---
title: DeepSite v4
emoji: 🐳
colorFrom: blue
colorTo: blue
sdk: docker
pinned: true
app_port: 3001
license: mit
failure_strategy: rollback
short_description: Generate any application by Vibe Coding it
---

# DeepSite 🐳 - The Ultimate Vibe Coding Platform

DeepSite is a powerful, AI-driven website generation platform that allows you to "vibe code" entire applications in seconds. It combines the latest Large Language Models with a seamless multi-file editor and instant preview engine.

## 🚀 Key Features

- **AI-Powered Generation**: Instantly create landing pages, dashboards, and full-stack apps using top-tier models (Qwen, DeepSeek, Llama).
- **Offline Mode (Ollama)**: Zero-latency, 100% private code generation running directly on your local hardware (RTX 4060 optimized).
- **Multi-File Editor**: A complete Monaco-powered IDE experience in your browser.
- **Instant Previews**: Real-time rendering of your HTML/JS code as you edit.
- **MongoDB Drafts**: Securely save your projects locally before publishing.
- **One-Click Deployment**: Deploy directly to Hugging Face Spaces or Vercel.
- **Security Guard**: Integrated code review logic to scan for XSS and vulnerabilities.
- **Brand Kit**: Define global design tokens (colors, fonts, radius) that the AI strictly follows.

## 🛠 Tech Stack

- **Framework**: Next.js 15+ (App Router)
- **Styling**: Tailwind CSS v4 (Alpha/Browser)
- **Database**: MongoDB (via Mongoose)
- **AI Orchestration**: 
  - Hugging Face Hub API (Standard)
  - Groq Cloud (Fast Fallback)
  - Ollama (Local Offline Mode)
- **Deployment**: Hugging Face Spaces & Vercel

## 💻 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (Local or Atlas)
- [Ollama](https://ollama.com/) (For high-performance offline generation)

### 1. Clone & Install
```bash
git clone https://github.com/elangkumaranbs/DeepSite-Production.git
cd DeepSite-Production
npm install
```

### 2. Environment Variables
Create a `.env.local` file and add your credentials:
```env
MONGODB_URI=your_mongodb_uri
NEXTAUTH_SECRET=your_secret
NEXTAUTH_URL=http://localhost:3001
GROQ_API_KEY=your_groq_key
```

### 3. Local Offline Setup (Ollama)
DeepSite is optimized for your local GPU (RTX 4060). To enable offline mode:
1. Ensure Ollama is running.
2. Pull the optimized models:
   ```bash
   ollama pull qwen2.5-coder:7b
   ollama pull qwen2.5-coder:14b
   ```
3. Select the "(Offline)" models in the DeepSite UI dropdown.

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3001](http://localhost:3001) in your browser.

## 🐳 Deployment
DeepSite is production-ready for:
- **Vercel**: Connect this GitHub repo and set environment variables.
- **Hugging Face**: The project is pre-configured with the required metadata for Space hosting.

---
Built with ❤️ for the Vibe Coding Community.
