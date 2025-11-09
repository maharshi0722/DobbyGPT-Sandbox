"use client";
import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { Download, Moon, Sun } from "lucide-react";

export default function DobbyGPT() {
  const [prompt, setPrompt] = useState("");
  const [running, setRunning] = useState(false);
  const [finalText, setFinalText] = useState("");
  const [theme, setTheme] = useState("system");
  const [progress, setProgress] = useState(0);
  const [agents, setAgents] = useState([
    { role: "Researcher", desc: "Finds and analyzes data." },
    { role: "Writer", desc: "Creates clear explanations." },
    { role: "Verifier", desc: "Checks accuracy and logic." },
  ]);

  // 🌙 Auto-theme detection
  useEffect(() => {
    const darkQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const updateTheme = () => {
      const systemDark = darkQuery.matches;
      const activeTheme =
        theme === "system" ? (systemDark ? "dark" : "light") : theme;
      document.documentElement.classList.toggle("dark", activeTheme === "dark");
    };
    updateTheme();
    darkQuery.addEventListener("change", updateTheme);
    return () => darkQuery.removeEventListener("change", updateTheme);
  }, [theme]);

  // 🧩 Font & dark mode styling
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      html, body {
        font-family: 'Satoshi Variable', 'Poppins', 'Inter', system-ui, sans-serif;
        line-height: 1.7;
        -webkit-font-smoothing: antialiased;
      }
      .dark body, .dark {
        background-color: #0f172a !important;
        color: #f1f5f9 !important;
      }
      .dark textarea {
        background-color: #1e293b !important;
        color: #f8fafc !important;
        border-color: #334155 !important;
        caret-color: #38bdf8 !important;
      }
      .dark textarea::placeholder { color: #94a3b8 !important; }
      .dark .prose, .dark .prose * { color: #f1f5f9 !important; }
      .dark .border { border-color: #334155 !important; }
      .dark button { color: #f8fafc !important; }
      .dark .bg-slate-800, .dark .bg-slate-900 { background-color: #0f172a !important; }
      .dark pre code {
        color: #f8fafc !important;
        background: rgba(255,255,255,0.08) !important;
        border-radius: 6px;
        padding: 4px 8px;
      }
      html { font-size: 15px; }
      @media (min-width: 768px){ html{font-size:15.5px;} }
      @media (min-width: 1024px){ html{font-size:16px;} }
      @media (min-width: 1440px){ html{font-size:16.5px;} }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  async function runAgents() {
    if (!prompt) return;
    setRunning(true);
    setFinalText("");
    setProgress(0);

    try {
      const res = await fetch("/api/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      if (!res.ok) throw new Error(await res.text());

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let partial = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        partial += decoder.decode(value);
        setProgress((p) => Math.min(p + 4, 95));
      }

      // Clean unwanted logs & markers
      const clean = partial
        .replace(/🤖.*thinking.../g, "")
        .replace(/✅.*done\./g, "")
        .replace(/🧠.*Starting.*/g, "")
        .replace(/🧩.*results.../g, "")
        .replace(/🏁.*complete.*/g, "")
        .replace(/--- Final Answer ---/g, "")
        .replace(/💬.*Waiting.*/g, "")
        .replace(/\n{2,}/g, "\n\n")
        .trim();

      setFinalText(clean);
      setProgress(100);
    } catch (err) {
      setFinalText(`❌ Error: ${err.message}`);
    } finally {
      setRunning(false);
    }
  }

  function resetSession() {
    setPrompt("");
    setFinalText("");
  }

  function handleExport(format = "md") {
    const content =
      format === "json"
        ? JSON.stringify({ prompt, output: finalText }, null, 2)
        : `# DobbyGPT Session\n\n**Prompt:** ${prompt}\n\n---\n\n${finalText}`;
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `dobby_session.${format}`;
    a.click();
  }

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-300 ${
        theme === "dark"
          ? "bg-slate-900 text-slate-100"
          : "bg-gradient-to-b from-slate-50 to-white text-slate-900"
      }`}
    >
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md border-b bg-white/70 dark:bg-slate-900/60">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-md overflow-hidden bg-slate-100 dark:bg-slate-800 border">
              <img
                src="https://pbs.twimg.com/profile_images/1859727094789660672/h7RM1LNu_400x400.jpg"
                alt="DobbyGPT Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="font-semibold tracking-tight">DobbyGPT</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Adaptive Multi-Agent Sandbox
              </div>
            </div>
          </div>
          <button
            onClick={() =>
              setTheme(
                theme === "dark"
                  ? "light"
                  : theme === "light"
                  ? "system"
                  : "dark"
              )
            }
            title="Toggle theme"
            className="p-2 border rounded-md hover:bg-gray-100 dark:hover:bg-slate-800"
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 space-y-6">
        {running && (
          <div className="w-full bg-gray-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className="bg-sky-500 h-2 transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        )}

        {/* Prompt Section */}
        <section>
          <label className="text-sm font-medium">Enter your prompt</label>
          <textarea
            rows={4}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Example: Compare Sentient and other in decentralized AI."
            className="w-full p-3 mt-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-sky-400 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-400"
          />
          <div className="flex flex-wrap gap-3 mt-3">
            <button
              onClick={runAgents}
              disabled={running}
              className="px-4 py-2 bg-slate-900 text-white rounded-md hover:opacity-90 dark:bg-sky-500"
            >
              {running ? "🧠 Dobby is thinking..." : "Run Agents"}
            </button>
            <button
              onClick={resetSession}
              className="px-4 py-2 border rounded-md hover:bg-gray-100 dark:hover:bg-slate-800"
            >
              Clear
            </button>
          </div>
        </section>

        {/* Agents Section - now responsive grid */}
        <section>
          <h3 className="text-sm font-semibold mb-2">Agents in Action</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {agents.map((a, i) => (
              <div
                key={i}
                className="p-5 rounded-xl border shadow-sm bg-white dark:bg-slate-800 transition-all"
              >
                <div className="font-semibold text-base mb-1">{a.role}</div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {a.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Final Output */}
        <section className="bg-white dark:bg-slate-800 border rounded-xl shadow p-6 flex flex-col">
          <div className="flex justify-between items-center mb-3">
            <div>
              <h3 className="text-sm font-semibold">Answer</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Final refined response
              </p>
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(finalText)}
              className="text-xs border px-3 py-1 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700"
            >
              Copy
            </button>
          </div>

          <div className="flex-1 overflow-y-auto text-sm">
            <div className="prose prose-slate dark:prose-invert max-w-none leading-relaxed">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
              >
                {finalText || "💭 Waiting for your next question..."}
              </ReactMarkdown>
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <button
              onClick={() => handleExport("md")}
              className="flex-1 px-3 py-2 text-sm border rounded-md hover:bg-gray-100 dark:hover:bg-slate-700"
            >
              Export .MD
            </button>
            <button
              onClick={() => handleExport("json")}
              className="flex-1 px-3 py-2 text-sm bg-sky-500 text-white rounded-md flex items-center justify-center gap-2"
            >
              <Download size={16} /> JSON
            </button>
          </div>
        </section>
      </main>

      <footer className="text-center text-xs text-gray-400 dark:text-gray-500 py-4">
        © {new Date().getFullYear()} DobbyGPT - Adaptive Multi-Agent Sandbox 🧠
      </footer>
    </div>
  );
}
