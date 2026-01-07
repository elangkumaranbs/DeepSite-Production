/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { InferenceClient } from "@huggingface/inference";

import { FOLLOW_UP_SYSTEM_PROMPT, INITIAL_SYSTEM_PROMPT } from "@/lib/prompts";
import { auth } from "@/lib/auth";
import { File, Message } from "@/lib/type";
import { MODELS } from "@/lib/providers";

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
    provider: initialProvider,
    mentions = [],
    model,
    redesignMd,
  } = body;
  const provider = initialProvider ?? "auto";

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
      try {
        const chatCompletion = client.chatCompletionStream({
          model: model + (provider !== "auto" ? `:${provider}` : ""),
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
              content: `
${prompt}
${
  mentions?.length > 0
    ? `\n\nHere are the informations about the model or dataset that the user has mentioned to use: ${mentions
        .map(
          (mention: any) =>
            `Library: ${mention.library_name}\nPipeline: ${mention.pipeline_tag}\nModel: ${mention.model_id}\nReadme for more information: \n${mention.readme}`
        )
        .join("\n")}`
    : ""
}
            `,
            },
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
        console.error(error);
        try {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "An error occurred while processing your request";
          const errorPayload = JSON.stringify({
            messageError: errorMessage,
            isError: true,
          });
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
    })();

    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
