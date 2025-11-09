import { runAgents } from "@/lib/orchestrator";

export async function POST(req) {
  const { prompt } = await req.json();

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (msg) => controller.enqueue(encoder.encode(msg + "\n"));
      send("🧠 Starting agents...\n");

      const result = await runAgents(prompt, send);

      send("\n--- Final Answer ---\n" + result.final + "\n");
      controller.close();
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
