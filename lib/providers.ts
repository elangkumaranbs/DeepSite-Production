import DeepSeekLogo from "@/assets/deepseek.svg";
import QwenLogo from "@/assets/qwen.svg";
import KimiLogo from "@/assets/kimi.svg";
import ZaiLogo from "@/assets/zai.svg";
import MiniMaxLogo from "@/assets/minimax.svg";

export const MODELS = [
  {
    value: "deepseek-ai/DeepSeek-V3-0324",
    label: "DeepSeek V3 O324",
    providers: ["fireworks-ai", "nebius", "sambanova", "novita", "hyperbolic"],
    autoProvider: "novita",
    logo: DeepSeekLogo,
    companyName: "DeepSeek",
    isBestSeller: true,
  },
  {
    value: "deepseek-ai/DeepSeek-V3.2",
    label: "DeepSeek V3.2",
    logo: DeepSeekLogo,
    companyName: "DeepSeek",
  },
  {
    value: "Qwen/Qwen3-Coder-30B-A3B-Instruct",
    label: "Qwen3 Coder 30B A3B Instruct",
    providers: ["novita", "hyperbolic"],
    autoProvider: "novita",
    logo: QwenLogo,
    companyName: "Qwen",
  },
  {
    value: "moonshotai/Kimi-K2-Instruct-0905",
    label: "Kimi K2 Instruct",
    providers: ["together", "novita", "groq"],
    autoProvider: "groq",
    logo: KimiLogo,
    companyName: "Kimi",
  },
  {
    value: "zai-org/GLM-4.7",
    label: "GLM-4.7",
    logo: ZaiLogo,
    companyName: "Z.ai",
    isNew: true,
    isBestSeller: true,
  },
  {
    value: "MiniMaxAI/MiniMax-M2.1",
    label: "MiniMax M2.1",
    logo: MiniMaxLogo,
    companyName: "MiniMax",
    top_k: 40,
    temperature: 1.0,
    top_p: 0.95,
    isNew: true,
    isBestSeller: true,
  },
];

export const getProviders = async (model: string) => {
  const response = await fetch(
    `https://router.huggingface.co/v1/models/${model}`
  );
  const { data } = await response.json();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return data.providers.map((provider: any) => provider.provider);
};
