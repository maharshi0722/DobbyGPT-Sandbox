# 🧠 DobbyGPT — Adaptive Multi-Agent Sandbox  

> A personal AGI experiment built with **Next.js 19**, **Fireworks AI**, and **Sentient Dobby models**, exploring how multiple specialized AI agents can collaborate to produce intelligent, verifiable results.


## 🚀 Overview  

**DobbyGPT** is an open sandbox for running **multi-agent reasoning loops** powered by `dobby-unhinged-llama-3-3-70b` via the Fireworks API.  
It allows you to spawn specialized agents like:  

| Agent | Role | Description |
|:------|:------|:-------------|
| 🧩 **Researcher** | Context & fact gathering | Finds relevant information and structure |
| ✍️ **Writer** | Generation & synthesis | Produces clear, human-like explanations |
| 🧠 **Verifier** | Evaluation & logic | Reviews for factual and logical accuracy |

Each agent collaborates recursively to refine the final answer — simulating a *mini AGI workflow.*

---

## 🧩 Features  

✅ Multi-agent orchestration (Researcher → Writer → Verifier)  
✅ Fireworks AI integration with real-time streaming  
✅ Clean modern UI built with TailwindCSS + Next.js App Router  
✅ Dark / light / system theme with auto-detection  
✅ Export sessions to `.md` or `.json`  
✅ Memory persistence across prompts  
✅ Fully responsive layout (mobile → desktop)  
✅ Smooth Markdown rendering with syntax highlighting  

---

## 🧱 Tech Stack  

| Layer | Tools |
|:------|:------|
| Frontend | Next.js 16 (React 19) + TailwindCSS |
| Backend | Fireworks AI Inference API |
| Styling | Tailwind + custom typography |
| State | React Hooks |
| Code Highlighting | `rehype-highlight` + `react-markdown` |
| Markdown | `remark-gfm` |
| Hosting | Vercel / Netlify (serverless ready) |

---

## ⚙️ Setup  

### 1️⃣ Clone the repo  
```bash
git clone https://github.com/maharshi0722/DobbyGPT-Sandbox.git
cd DobbyGPT-Sandbox
