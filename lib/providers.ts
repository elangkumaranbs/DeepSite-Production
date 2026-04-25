import DeepSeekLogo from "@/assets/deepseek.svg";
import QwenLogo from "@/assets/qwen.svg";
import KimiLogo from "@/assets/kimi.svg";
import ZaiLogo from "@/assets/zai.svg";
import MiniMaxLogo from "@/assets/minimax.svg";
import GroqLogo from "@/assets/groq.svg";
import OllamaLogo from "@/assets/ollama.svg";

export const MODELS = [
  {
    value: "Qwen/Qwen2.5-Coder-32B-Instruct",
    label: "Qwen2.5 Coder 32B",
    logo: QwenLogo,
    companyName: "Qwen",
    isBestSeller: true,
  },
  {
    value: "Qwen/Qwen3-Coder-30B-A3B-Instruct",
    label: "Qwen3 Coder 30B",
    logo: QwenLogo,
    companyName: "Qwen",
    isNew: true,
  },
  {
    value: "deepseek-ai/DeepSeek-V3-0324",
    label: "DeepSeek V3",
    providers: ["fireworks-ai", "nebius", "sambanova", "novita", "hyperbolic"],
    logo: DeepSeekLogo,
    companyName: "DeepSeek",
  },
  {
    value: "deepseek-ai/DeepSeek-V3.2",
    label: "DeepSeek V3.2",
    logo: DeepSeekLogo,
    companyName: "DeepSeek",
    isNew: true,
  },
  {
    value: "moonshotai/Kimi-K2.5",
    label: "Kimi K2",
    providers: ["together", "novita", "groq"],
    logo: KimiLogo,
    companyName: "Kimi",
  },
  {
    value: "zai-org/GLM-4.7",
    label: "GLM-4.7",
    logo: ZaiLogo,
    companyName: "Z.ai",
  },
  {
    value: "MiniMaxAI/MiniMax-M2.1",
    label: "MiniMax M2.1",
    logo: MiniMaxLogo,
    companyName: "MiniMax",
    top_k: 40,
    temperature: 1.0,
    top_p: 0.95,
  },
  // --- Groq Models (server-side key, no HF token needed) ---
  {
    value: "groq:llama-3.1-8b-instant",
    label: "Llama 3.1 8B (Fast)",
    logo: GroqLogo,
    companyName: "Groq",
    apiProvider: "groq",
    isNew: true,
    isBestSeller: true,
  },
  {
    value: "groq:llama-3.3-70b-versatile",
    label: "Llama 3.3 70B",
    logo: GroqLogo,
    companyName: "Groq",
    apiProvider: "groq",
  },
  {
    value: "groq:deepseek-r1-distill-llama-70b",
    label: "DeepSeek R1 70B",
    logo: GroqLogo,
    companyName: "Groq",
    apiProvider: "groq",
  },
  // --- Ollama Models (Local offline models) ---
  {
    value: "ollama:qwen2.5-coder:7b",
    label: "Qwen 2.5 7B (Fast Offline)",
    logo: OllamaLogo,
    companyName: "Ollama",
    apiProvider: "ollama",
    isNew: true,
  },
  {
    value: "ollama:llama3.1:8b",
    label: "Llama 3.1 8B (Offline)",
    logo: OllamaLogo,
    companyName: "Ollama",
    apiProvider: "ollama",
  },
];

export const DEFAULT_MODEL = "Qwen/Qwen2.5-Coder-32B-Instruct";

export const getProviders = async (model: string) => {
  const response = await fetch(
    `https://router.huggingface.co/v1/models/${model}`
  );
  const { data } = await response.json();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return data.providers.map((provider: any) => provider.provider);
};
