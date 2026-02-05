import { NextResponse } from "next/server";
import { InferenceClient } from "@huggingface/inference";

import { FOLLOW_UP_SYSTEM_PROMPT, INITIAL_SYSTEM_PROMPT } from "@/lib/prompts";
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
  } = body;

  if (!prompt) {
    return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
  }
  if (!model || !MODELS.find((m: (typeof MODELS)[0]) => m.value === model)) {
    return NextResponse.json({ error: "Model is required" }, { status: 400 });
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
                  files.length > 0
                    ? FOLLOW_UP_SYSTEM_PROMPT
                    : INITIAL_SYSTEM_PROMPT,
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
            if (
              errorMessage?.includes("exceeded your monthly included credits") ||
              errorMessage?.includes("reached the free monthly usage limit")
            ) {
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
