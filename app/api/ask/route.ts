import { NextResponse } from "next/server";
import { InferenceClient } from "@huggingface/inference";

import { FOLLOW_UP_SYSTEM_PROMPT, INITIAL_SYSTEM_PROMPT } from "@/lib/prompts";
import { GROQ_FOLLOW_UP_SYSTEM_PROMPT, GROQ_INITIAL_SYSTEM_PROMPT } from "@/lib/groq-prompts";
import { auth } from "@/lib/auth";
import { File, Message } from "@/lib/type";
import { DEFAULT_MODEL, MODELS } from "@/lib/providers";

export async function POST(request: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const token = session.accessToken;

  const body = await request.json();
  const {
    prompt,
    previousMessages = [],
    files = [],
    provider,
    model,
    redesignMd,
    medias,
    brandKit,
  } = body;

  if (!prompt) {
    return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
  }
  if (!model || !MODELS.find((m: (typeof MODELS)[0]) => m.value === model)) {
    return NextResponse.json({ error: "Model is required" }, { status: 400 });
  }

  // --- Ollama model: route directly to localhost ---
  const isOllamaModel = model.startsWith("ollama:");
  const ollamaModelId = model.replace("ollama:", "");

  if (isOllamaModel) {
    const encoder = new TextEncoder();
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();

    const response = new NextResponse(stream.readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });

    const brandKitPrompt = brandKit
      ? `\n\n=== BRAND KIT RULES ===\nYou MUST strictly follow these global styles across all files. Do not use random colors or fonts.
- Primary Color: ${brandKit.primaryColor} (Use this for primary buttons, active states, main accents, etc using Tailwind arbitrary values like bg-[${brandKit.primaryColor}] or text-[${brandKit.primaryColor}] where appropriate).
- Font Family: ${brandKit.fontFamily} (Include from Google Fonts and apply to body).
- Border Radius: ${brandKit.borderRadius} (Apply rounded-${brandKit.borderRadius} to cards, buttons, inputs, etc).
=======================\n\n`
      : "";

    const baseSysPrompt = files.length > 0 ? FOLLOW_UP_SYSTEM_PROMPT : INITIAL_SYSTEM_PROMPT;
    const ollamaSystemPrompt = baseSysPrompt + brandKitPrompt;

    (async () => {
      try {
        const ollamaRes = await fetch("http://localhost:11434/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: ollamaModelId,
            messages: [
              { role: "system", content: ollamaSystemPrompt },
              ...previousMessages.map((message: Message) => ({
                role: message.role,
                content: message.content,
              })),
              ...(files?.length > 0
                ? [{
                    role: "user",
                    content: `Here are the files that the user has provider:${files
                      .map((file: File) => `File: ${file.path}\nContent: ${file.content}`)
                      .join("\n")}\n\n${prompt}`,
                  }]
                : []),
              {
                role: "user",
                content: `${redesignMd?.url ? `Redesign the following website ${redesignMd.url}, try to use the same images and content, but you can still improve it if needed. Do the best version possibile. Here is the markdown:\n ${redesignMd.md} \n\n` : ""}${prompt} ${medias && medias.length > 0 ? `\nHere is the list of my media files: ${medias.join(", ")}\n` : ""}`,
              },
            ],
            stream: true,
          }),
        });

        if (!ollamaRes.ok || !ollamaRes.body) {
          const errText = await ollamaRes.text();
          let userFriendlyError = errText;
          if (errText.includes("model") && errText.includes("not found")) {
            userFriendlyError = `Ollama model '${ollamaModelId}' is not installed. Please open your terminal and run: ollama pull ${ollamaModelId}`;
          }
          await writer.write(encoder.encode(`\n\n__ERROR__:${JSON.stringify({ messageError: userFriendlyError, isError: true })}`));
          await writer.close();
          return;
        }

        const reader = ollamaRes.body.getReader();
        const decoder = new TextDecoder();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const lines = decoder.decode(value).split("\n").filter(Boolean);
          for (const line of lines) {
            if (line.startsWith("data: ") && line !== "data: [DONE]") {
              try {
                const json = JSON.parse(line.slice(6));
                const chunk = json.choices?.[0]?.delta?.content;
                if (chunk) await writer.write(encoder.encode(chunk));
              } catch { /* skip malformed chunks */ }
            }
          }
        }
        await writer.close();
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Ollama request failed";
        let userFriendlyError = msg;
        if (msg.includes("fetch failed") || msg.includes("ECONNREFUSED")) {
          userFriendlyError = "Failed to connect to Ollama. Please ensure the Ollama app is running on your machine.";
        }
        try {
          await writer.write(encoder.encode(`\n\n__ERROR__:${JSON.stringify({ messageError: userFriendlyError, isError: true })}`));
          await writer.close();
        } catch { /* ignore */ }
      }
    })();

    return response;
  }

  // --- Groq model: route directly to Groq API ---
  const isGroqModel = model.startsWith("groq:");
  const groqModelId = model.replace("groq:", "");

  if (isGroqModel) {
    if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === "your_groq_key_here") {
      return NextResponse.json({ error: "Groq API key not configured on the server." }, { status: 503 });
    }

    const encoder = new TextEncoder();
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();

    const response = new NextResponse(stream.readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });

    // For Groq: use compact prompts + cap history to last 2 messages to stay under TPM limits
    // Groq free = 6000 TPM. max_tokens counts toward TPM. Budget: ~500 input + 3500 output = ~4000 safe.
    const brandKitPrompt = brandKit
      ? `\n\n=== BRAND KIT RULES ===\nYou MUST strictly follow these global styles across all files. Do not use random colors or fonts.
- Primary Color: ${brandKit.primaryColor} (Use this for primary buttons, active states, main accents, etc using Tailwind arbitrary values like bg-[${brandKit.primaryColor}] or text-[${brandKit.primaryColor}] where appropriate).
- Font Family: ${brandKit.fontFamily} (Include from Google Fonts and apply to body).
- Border Radius: ${brandKit.borderRadius} (Apply rounded-${brandKit.borderRadius} to cards, buttons, inputs, etc).
=======================\n\n`
      : "";

    const baseSysPrompt = files.length > 0 ? GROQ_FOLLOW_UP_SYSTEM_PROMPT : GROQ_INITIAL_SYSTEM_PROMPT;
    const groqSystemPrompt = baseSysPrompt + brandKitPrompt;
    const groqHistory = previousMessages.slice(-2).map((message: Message) => ({
      role: message.role,
      content: typeof message.content === "string" ? message.content.slice(0, 300) : message.content,
    }));

    (async () => {
      try {
        const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          },
          body: JSON.stringify({
            model: groqModelId,
            messages: [
              { role: "system", content: groqSystemPrompt },
              ...groqHistory,
              ...(files?.length > 0
                ? [{
                    role: "user",
                    content: `Current files:\n${files
                      .map((file: File) => `--- ${file.path} ---\n${file.content}`)
                      .join("\n")}\n\nUser request: ${prompt}`,
                  }]
                : []),
              {
                role: "user",
                content: `${redesignMd?.url ? `Redesign ${redesignMd.url}.\n` : ""}${prompt}`,
              },
            ],
            stream: true,
            max_tokens: 3500,
          }),
        });

        if (!groqRes.ok || !groqRes.body) {
          const errText = await groqRes.text();
          await writer.write(encoder.encode(`\n\n__ERROR__:${JSON.stringify({ messageError: errText, isError: true })}`));
          await writer.close();
          return;
        }

        const groqReader = groqRes.body.getReader();
        const groqDecoder = new TextDecoder();
        while (true) {
          const { done, value } = await groqReader.read();
          if (done) break;
          const lines = groqDecoder.decode(value).split("\n").filter(Boolean);
          for (const line of lines) {
            if (line.startsWith("data: ") && line !== "data: [DONE]") {
              try {
                const json = JSON.parse(line.slice(6));
                const chunk = json.choices?.[0]?.delta?.content;
                if (chunk) await writer.write(encoder.encode(chunk));
              } catch { /* skip malformed chunks */ }
            }
          }
        }
        await writer.close();
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Groq request failed";
        try {
          await writer.write(encoder.encode(`\n\n__ERROR__:${JSON.stringify({ messageError: msg, isError: true })}`));
          await writer.close();
        } catch { /* ignore */ }
      }
    })();

    return response;
  }

  const client = new InferenceClient(token);

  try {
    const encoder = new TextEncoder();
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();

    const response = new NextResponse(stream.readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
    (async () => {
      let hasRetried = false;
      let currentModel = model;

      const tryGeneration = async (): Promise<void> => {
        try {
          const chatCompletion = client.chatCompletionStream({
            model: currentModel + (provider !== "auto" ? `:${provider}` : ""),
            messages: [
              {
                role: "system",
                content:
                  (files.length > 0
                    ? FOLLOW_UP_SYSTEM_PROMPT
                    : INITIAL_SYSTEM_PROMPT) +
                  (brandKit
                    ? `\n\n=== BRAND KIT RULES ===\nYou MUST strictly follow these global styles across all files. Do not use random colors or fonts.
- Primary Color: ${brandKit.primaryColor} (Use this for primary buttons, active states, main accents, etc using Tailwind arbitrary values like bg-[${brandKit.primaryColor}] or text-[${brandKit.primaryColor}] where appropriate).
- Font Family: ${brandKit.fontFamily} (Include from Google Fonts and apply to body).
- Border Radius: ${brandKit.borderRadius} (Apply rounded-${brandKit.borderRadius} to cards, buttons, inputs, etc).
=======================\n\n`
                    : ""),
              },
              ...previousMessages.map((message: Message) => ({
                role: message.role,
                content: message.content,
              })),
              ...(files?.length > 0
                ? [
                    {
                      role: "user",
                      content: `Here are the files that the user has provider:${files
                        .map(
                          (file: File) =>
                            `File: ${file.path}\nContent: ${file.content}`
                        )
                        .join("\n")}\n\n${prompt}`,
                    },
                  ]
                : []),
              {
                role: "user",
                content: `${
                  redesignMd?.url &&
                  `Redesign the following website ${redesignMd.url}, try to use the same images and content, but you can still improve it if needed. Do the best version possibile. Here is the markdown:\n ${redesignMd.md} \n\n`
                }${prompt} ${
                  medias && medias.length > 0
                    ? `\nHere is the list of my media files: ${medias.join(
                        ", "
                      )}\n`
                    : ""
                }`,
              }
            ],
            stream: true,
            max_tokens: 16_000,
          });
          while (true) {
            const { done, value } = await chatCompletion.next();
            if (done) {
              break;
            }

            const chunk = value.choices[0]?.delta?.content;
            if (chunk) {
              await writer.write(encoder.encode(chunk));
            }
          }

          await writer.close();
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "An error occurred while processing your request";

          if (
            !hasRetried &&
            errorMessage?.includes(
              "Failed to perform inference: Model not found"
            )
          ) {
            hasRetried = true;
            if (model === DEFAULT_MODEL) {
              const availableFallbackModels = MODELS.filter(
                (m) => m.value !== model
              );
              const randomIndex = Math.floor(
                Math.random() * availableFallbackModels.length
              );
              currentModel = availableFallbackModels[randomIndex];
            } else {
              currentModel = DEFAULT_MODEL;
            }
            const switchMessage = `\n\n_Note: The selected model was not available. Switched to \`${currentModel}\`._\n\n`;
            await writer.write(encoder.encode(switchMessage));

            return tryGeneration();
          }

          try {
            let errorPayload = "";
            const isQuotaError =
              errorMessage?.includes("exceeded your monthly included credits") ||
              errorMessage?.includes("reached the free monthly usage limit") ||
              errorMessage?.includes("depleted your monthly included credits");

            // --- Groq Fallback ---
            if (isQuotaError && process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== "your_groq_key_here") {
              const switchNote = `\n\n_Note: HF quota exceeded. Switched to free Groq fallback (llama-3.1-70b)._\n\n`;
              await writer.write(encoder.encode(switchNote));

              try {
                const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
                  },
                  body: JSON.stringify({
                    model: "llama-3.3-70b-versatile",
                    messages: [
                      {
                        role: "system",
                        content: (files.length > 0 ? FOLLOW_UP_SYSTEM_PROMPT : INITIAL_SYSTEM_PROMPT) +
                          (brandKit
                            ? `\n\n=== BRAND KIT RULES ===\nYou MUST strictly follow these global styles across all files. Do not use random colors or fonts.
- Primary Color: ${brandKit.primaryColor} (Use this for primary buttons, active states, main accents, etc using Tailwind arbitrary values like bg-[${brandKit.primaryColor}] or text-[${brandKit.primaryColor}] where appropriate).
- Font Family: ${brandKit.fontFamily} (Include from Google Fonts and apply to body).
- Border Radius: ${brandKit.borderRadius} (Apply rounded-${brandKit.borderRadius} to cards, buttons, inputs, etc).
=======================\n\n`
                            : ""),
                      },
                      ...previousMessages.map((message: Message) => ({
                        role: message.role,
                        content: message.content,
                      })),
                      {
                        role: "user",
                        content: `${redesignMd?.url ? `Redesign ${redesignMd.url}. Here is the markdown:\n${redesignMd.md}\n\n` : ""}${prompt}`,
                      },
                    ],
                    stream: true,
                    max_tokens: 16000,
                  }),
                });

                if (groqRes.ok && groqRes.body) {
                  const groqReader = groqRes.body.getReader();
                  const groqDecoder = new TextDecoder();
                  while (true) {
                    const { done, value } = await groqReader.read();
                    if (done) break;
                    const lines = groqDecoder.decode(value).split("\n").filter(Boolean);
                    for (const line of lines) {
                      if (line.startsWith("data: ") && line !== "data: [DONE]") {
                        try {
                          const json = JSON.parse(line.slice(6));
                          const chunk = json.choices?.[0]?.delta?.content;
                          if (chunk) await writer.write(encoder.encode(chunk));
                        } catch { /* skip malformed chunks */ }
                      }
                    }
                  }
                  await writer.close();
                  return;
                }
              } catch (groqError) {
                console.error("Groq fallback failed:", groqError);
              }
            }

            if (isQuotaError) {
              errorPayload = JSON.stringify({
                messageError: errorMessage,
                showProMessage: true,
                isError: true,
              });
            } else {
              errorPayload = JSON.stringify({
                messageError: errorMessage,
                isError: true,
              });
            }
            await writer.write(encoder.encode(`\n\n__ERROR__:${errorPayload}`));
            await writer.close();
          } catch (closeError) {
            console.error("Failed to send error message:", closeError);
            try {
              await writer.abort(error);
            } catch (abortError) {
              console.error("Failed to abort writer:", abortError);
            }
          }
        }
      };

      await tryGeneration();
    })();

    return response;
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 }
    );
  }
}
