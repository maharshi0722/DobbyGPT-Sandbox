const FIREWORKS_API = "https://api.fireworks.ai/inference/v1/chat/completions";
const API_KEY = "fw_3ZaVJH3usNen6h3NgGhiauL6";
const MODEL = "accounts/sentientfoundation/models/dobby-unhinged-llama-3-3-70b-new";

let memory = [];

function getTrimmedMemory(limit = 6) {
  return memory.slice(-limit);
}

async function callDobby(systemPrompt, userPrompt, retries = 1) {
  const body = {
    model: MODEL,
    temperature: 0.8,
    top_p: 0.9,
    max_tokens: 800,
    messages: [
      ...getTrimmedMemory().map((m) => ({ role: "user", content: m })),
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
  };

  try {
    const res = await fetch(FIREWORKS_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const text = data?.choices?.[0]?.message?.content?.trim();

    if (!text) throw new Error("Empty response");
    console.log(`🔥 Fireworks (${systemPrompt.slice(0, 25)}...):`, text.slice(0, 120), "...");
    return text;
  } catch (err) {
    console.warn("⚠️ Dobby API Error:", err.message);
    if (retries > 0) {
      console.log("🔁 Retrying...");
      await new Promise((r) => setTimeout(r, 1000));
      return callDobby(systemPrompt, userPrompt, retries - 1);
    }
    return `⚠️ Error: ${err.message}`;
  }
}

// 🧩 Orchestrate the multi-agent pipeline
export async function runAgents(prompt, streamLog) {
  console.log("\n🧠 Starting DobbyGPT...");
  console.log("Prompt:", prompt);
  console.log("--------------------------------");

  const agents = [
    {
      
    role: "Researcher",
    system: `
      You are Researcher Dobby.
      - Gather factual, up-to-date, verifiable data.
      - Avoid speculation.
      - Return concise bullet points with sources if possible.
    `,
  },
  {
    role: "Writer",
    system: `
      You are Writer Dobby.
      - Translate complex data into clear, human-readable insights.
      - Use simple analogies.
      - Maintain a confident, neutral tone.
    `,
  },
  {
    role: "Verifier",
    system: `
      You are Verifier Dobby.
      - Evaluate accuracy, logic, and clarity.
      - Highlight contradictions or weak reasoning.
      - Keep output short and decisive.
    `,
  },
];
  streamLog?.("🤖 Agents thinking...");
  const results = await Promise.all(
    agents.map(async (agent) => {
      const output = await callDobby(agent.system, prompt);
      streamLog?.(`✅ ${agent.role} done.`);
      return { ...agent, output };
    })
  );

  // 🔗 Combine outputs for aggregation
  const combined = results
    .map((a) => `--- ${a.role} ---\n${a.output}`)
    .join("\n\n");

  streamLog?.("🧩 Aggregating results...");
  const final = await callDobby(
    "You are Aggregator Dobby. Merge all insights into a concise, well-structured final answer.",
    combined
  );

  // 🧠 Save memory
  memory.push(prompt, final);
  if (memory.length > 12) memory = memory.slice(-12);

  streamLog?.("🏁 All agents complete.");
  console.log("\n✅ Final Output:\n", final.slice(0, 500), "\n--------------------------------\n");

  return {
    final,
    agents: results.map((a) => ({ role: a.role, output: a.output })),
  };
}
