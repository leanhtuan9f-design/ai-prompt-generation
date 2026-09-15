export interface OpenRouterPricing {
  prompt: number; // Cost per 1M prompt tokens in USD (e.g. 2.5)
  completion: number; // Cost per 1M completion tokens in USD (e.g. 10.0)
  inputCostPer1M: string; // e.g. "$2.50"
  outputCostPer1M: string; // e.g. "$10.00"
  isFree?: boolean;
}

export interface OpenRouterModelItem {
  id: string;
  name: string;
  provider: "grok" | "gpt" | "deepseek" | "claude" | "gemini" | "meta" | "mistral" | "qwen" | "other";
  providerName: string;
  recommendedFor?: "writing" | "image" | "both";
  description?: string;
  contextLength?: number;
  pricing: OpenRouterPricing;
  isNew?: boolean;
  tier?: "flagship" | "balanced" | "budget" | "free";
}

/**
 * Danh sách Model OpenRouter MỚI NHẤT 2025/2026 kèm giá chi tiết (Input/Output per 1M tokens)
 */
export const PRESET_OPENROUTER_MODELS: OpenRouterModelItem[] = [
  // ==========================================
  // --- 1. xAI / GROK (MỚI NHẤT) ---
  // ==========================================
  {
    id: "x-ai/grok-3",
    name: "Grok 3 (Flagship Reasoning)",
    provider: "grok",
    providerName: "xAI / Grok",
    recommendedFor: "both",
    description: "Model cao cấp nhất của Elon Musk / xAI. Khả năng tư duy logic và sáng tạo kịch bản đỉnh cao.",
    contextLength: 131072,
    isNew: true,
    tier: "flagship",
    pricing: {
      prompt: 3.00,
      completion: 15.00,
      inputCostPer1M: "$3.00",
      outputCostPer1M: "$15.00",
    },
  },
  {
    id: "x-ai/grok-3-mini",
    name: "Grok 3 Mini",
    provider: "grok",
    providerName: "xAI / Grok",
    recommendedFor: "writing",
    description: "Tốc độ chớp nhoáng, lý luận logic cao cấp với chi phí siêu tiết kiệm.",
    contextLength: 131072,
    isNew: true,
    tier: "budget",
    pricing: {
      prompt: 0.30,
      completion: 1.50,
      inputCostPer1M: "$0.30",
      outputCostPer1M: "$1.50",
    },
  },
  {
    id: "x-ai/grok-2-1212",
    name: "Grok 2 (1212 Update)",
    provider: "grok",
    providerName: "xAI / Grok",
    recommendedFor: "writing",
    description: "Văn phong sắc sảo, tự nhiên, bám sát yêu cầu từ lóng & sáng tạo thoại.",
    contextLength: 131072,
    tier: "balanced",
    pricing: {
      prompt: 2.00,
      completion: 10.00,
      inputCostPer1M: "$2.00",
      outputCostPer1M: "$10.00",
    },
  },
  {
    id: "x-ai/grok-2-vision-1212",
    name: "Grok 2 Vision (1212)",
    provider: "grok",
    providerName: "xAI / Grok",
    recommendedFor: "image",
    description: "Thế mạnh phân tích không gian, mô tả ánh sáng & visual cinematic 3D.",
    contextLength: 32768,
    tier: "balanced",
    pricing: {
      prompt: 2.00,
      completion: 10.00,
      inputCostPer1M: "$2.00",
      outputCostPer1M: "$10.00",
    },
  },

  // ==========================================
  // --- 2. OPENAI / GPT & O-SERIES (MỚI NHẤT) ---
  // ==========================================
  {
    id: "openai/gpt-4.5-preview",
    name: "GPT-4.5 Preview (Orion)",
    provider: "gpt",
    providerName: "OpenAI / GPT",
    recommendedFor: "both",
    description: "Model lớn nhất và thông minh nhất lịch sử OpenAI. Chi tiết visual điện ảnh và văn phong đạt đỉnh.",
    contextLength: 128000,
    isNew: true,
    tier: "flagship",
    pricing: {
      prompt: 75.00,
      completion: 150.00,
      inputCostPer1M: "$75.00",
      outputCostPer1M: "$150.00",
    },
  },
  {
    id: "openai/o3-mini",
    name: "OpenAI o3-mini (High Reasoning)",
    provider: "gpt",
    providerName: "OpenAI / GPT",
    recommendedFor: "writing",
    description: "Model suy luận thế hệ mới nhất của OpenAI. Lập luận kịch bản chặt chẽ, tối ưu logic.",
    contextLength: 200000,
    isNew: true,
    tier: "budget",
    pricing: {
      prompt: 1.10,
      completion: 4.40,
      inputCostPer1M: "$1.10",
      outputCostPer1M: "$4.40",
    },
  },
  {
    id: "openai/o1",
    name: "OpenAI o1 (Full Reasoning)",
    provider: "gpt",
    providerName: "OpenAI / GPT",
    recommendedFor: "writing",
    description: "Suy luận đa tầng phức tạp cho kịch bản y khoa & phân tích dược tính chuyên sâu.",
    contextLength: 200000,
    tier: "flagship",
    pricing: {
      prompt: 15.00,
      completion: 60.00,
      inputCostPer1M: "$15.00",
      outputCostPer1M: "$60.00",
    },
  },
  {
    id: "openai/gpt-4o",
    name: "GPT-4o (Omni Flagship)",
    provider: "gpt",
    providerName: "OpenAI / GPT",
    recommendedFor: "image",
    description: "Chuẩn vàng tạo Prompt 3D Pixar, Storyboard 9:16 & tuân thủ Safe Words tuyệt đối.",
    contextLength: 128000,
    tier: "balanced",
    pricing: {
      prompt: 2.50,
      completion: 10.00,
      inputCostPer1M: "$2.50",
      outputCostPer1M: "$10.00",
    },
  },
  {
    id: "openai/gpt-4o-mini",
    name: "GPT-4o Mini",
    provider: "gpt",
    providerName: "OpenAI / GPT",
    recommendedFor: "both",
    description: "Tốc độ cực nhanh, giá siêu rẻ, phù hợp tạo hàng loạt số lượng lớn.",
    contextLength: 128000,
    tier: "budget",
    pricing: {
      prompt: 0.15,
      completion: 0.60,
      inputCostPer1M: "$0.15",
      outputCostPer1M: "$0.60",
    },
  },

  // ==========================================
  // --- 3. DEEPSEEK (V3 & R1 MỚI NHẤT) ---
  // ==========================================
  {
    id: "deepseek/deepseek-r1",
    name: "DeepSeek R1 (Full Reasoning)",
    provider: "deepseek",
    providerName: "DeepSeek",
    recommendedFor: "writing",
    description: "Model suy luận mã nguồn mở số 1 thế giới. Lập luận kịch bản, cấu trúc Hook - Solution xuất sắc.",
    contextLength: 64000,
    isNew: true,
    tier: "budget",
    pricing: {
      prompt: 0.55,
      completion: 2.19,
      inputCostPer1M: "$0.55",
      outputCostPer1M: "$2.19",
    },
  },
  {
    id: "deepseek/deepseek-chat",
    name: "DeepSeek V3 (671B MoE)",
    provider: "deepseek",
    providerName: "DeepSeek",
    recommendedFor: "writing",
    description: "Siêu thông minh, tiếng Việt cực mượt, tốc độ cao với giá thành rẻ kỷ lục.",
    contextLength: 64000,
    isNew: true,
    tier: "budget",
    pricing: {
      prompt: 0.14,
      completion: 0.28,
      inputCostPer1M: "$0.14",
      outputCostPer1M: "$0.28",
    },
  },
  {
    id: "deepseek/deepseek-r1-distill-llama-70b",
    name: "DeepSeek R1 Distill Llama 70B",
    provider: "deepseek",
    providerName: "DeepSeek",
    recommendedFor: "writing",
    description: "Bản distill R1 trên nền Llama 70B cực kỳ cân bằng tốc độ và chất lượng.",
    contextLength: 131072,
    tier: "budget",
    pricing: {
      prompt: 0.23,
      completion: 0.69,
      inputCostPer1M: "$0.23",
      outputCostPer1M: "$0.69",
    },
  },

  // ==========================================
  // --- 4. ANTHROPIC / CLAUDE (MỚI NHẤT) ---
  // ==========================================
  {
    id: "anthropic/claude-3.7-sonnet",
    name: "Claude 3.7 Sonnet (Hybrid Reasoning)",
    provider: "claude",
    providerName: "Anthropic / Claude",
    recommendedFor: "both",
    description: "Mô hình mới nhất tích hợp suy luận Hybrid & năng lực viết kịch bản đỉnh cao nhất hiện nay.",
    contextLength: 200000,
    isNew: true,
    tier: "flagship",
    pricing: {
      prompt: 3.00,
      completion: 15.00,
      inputCostPer1M: "$3.00",
      outputCostPer1M: "$15.00",
    },
  },
  {
    id: "anthropic/claude-3.7-sonnet:thinking",
    name: "Claude 3.7 Sonnet (Thinking Mode)",
    provider: "claude",
    providerName: "Anthropic / Claude",
    recommendedFor: "writing",
    description: "Chế độ suy nghĩ chuyên sâu của Claude 3.7, bám sát các ràng buộc khắt khe nhất.",
    contextLength: 200000,
    isNew: true,
    tier: "flagship",
    pricing: {
      prompt: 3.00,
      completion: 15.00,
      inputCostPer1M: "$3.00",
      outputCostPer1M: "$15.00",
    },
  },
  {
    id: "anthropic/claude-3.5-sonnet",
    name: "Claude 3.5 Sonnet (V2)",
    provider: "claude",
    providerName: "Anthropic / Claude",
    recommendedFor: "both",
    description: "Chuẩn vàng văn phong kịch bản, lời thoại tự nhiên, bẻ AI và prompt hình ảnh thẩm mỹ.",
    contextLength: 200000,
    tier: "balanced",
    pricing: {
      prompt: 3.00,
      completion: 15.00,
      inputCostPer1M: "$3.00",
      outputCostPer1M: "$15.00",
    },
  },
  {
    id: "anthropic/claude-3.5-haiku",
    name: "Claude 3.5 Haiku",
    provider: "claude",
    providerName: "Anthropic / Claude",
    recommendedFor: "writing",
    description: "Nhanh như chớp, văn phong gãy gọn, tiết kiệm chi phí.",
    contextLength: 200000,
    tier: "budget",
    pricing: {
      prompt: 0.80,
      completion: 4.00,
      inputCostPer1M: "$0.80",
      outputCostPer1M: "$4.00",
    },
  },

  // ==========================================
  // --- 5. GOOGLE / GEMINI (MỚI NHẤT) ---
  // ==========================================
  {
    id: "google/gemini-2.5-flash",
    name: "Gemini 2.5 Flash via OpenRouter",
    provider: "gemini",
    providerName: "Google / Gemini",
    recommendedFor: "image",
    description: "Mô hình mới nhất của Google với tốc độ xử lý vượt trội và hiểu visual prompt cực sâu.",
    contextLength: 1000000,
    isNew: true,
    tier: "budget",
    pricing: {
      prompt: 0.10,
      completion: 0.40,
      inputCostPer1M: "$0.10",
      outputCostPer1M: "$0.40",
    },
  },
  {
    id: "google/gemini-2.0-flash-001",
    name: "Gemini 2.0 Flash",
    provider: "gemini",
    providerName: "Google / Gemini",
    recommendedFor: "both",
    description: "Cân bằng hoàn hảo tốc độ và chi phí, context window 1 triệu tokens.",
    contextLength: 1000000,
    tier: "budget",
    pricing: {
      prompt: 0.10,
      completion: 0.40,
      inputCostPer1M: "$0.10",
      outputCostPer1M: "$0.40",
    },
  },
  {
    id: "google/gemini-2.0-pro-exp-02-05",
    name: "Gemini 2.0 Pro Experimental",
    provider: "gemini",
    providerName: "Google / Gemini",
    recommendedFor: "both",
    description: "Bản thử nghiệm Pro mạnh mẽ cho lập luận cốt truyện và kịch bản y khoa.",
    contextLength: 2000000,
    isNew: true,
    tier: "free",
    pricing: {
      prompt: 0,
      completion: 0,
      inputCostPer1M: "Miễn phí",
      outputCostPer1M: "Miễn phí",
      isFree: true,
    },
  },

  // ==========================================
  // --- 6. META LLAMA & QWEN & MISTRAL ---
  // ==========================================
  {
    id: "meta-llama/llama-3.3-70b-instruct",
    name: "Llama 3.3 70B Instruct",
    provider: "meta",
    providerName: "Meta / Llama",
    recommendedFor: "writing",
    description: "Mô hình mã nguồn mở thế hệ mới nhất của Meta, chất lượng tương đương GPT-4.",
    contextLength: 131072,
    tier: "budget",
    pricing: {
      prompt: 0.12,
      completion: 0.30,
      inputCostPer1M: "$0.12",
      outputCostPer1M: "$0.30",
    },
  },
  {
    id: "qwen/qwen-2.5-72b-instruct",
    name: "Qwen 2.5 72B Instruct",
    provider: "qwen",
    providerName: "Alibaba / Qwen",
    recommendedFor: "writing",
    description: "Xử lý tiếng Việt và cấu trúc câu cực kỳ mượt mà, thông minh.",
    contextLength: 131072,
    tier: "budget",
    pricing: {
      prompt: 0.35,
      completion: 0.40,
      inputCostPer1M: "$0.35",
      outputCostPer1M: "$0.40",
    },
  },
  {
    id: "mistralai/mistral-large-2411",
    name: "Mistral Large 2411",
    provider: "mistral",
    providerName: "Mistral AI",
    recommendedFor: "writing",
    description: "Flagship của Mistral AI, kiểm soát câu thoại chặt chẽ và không lan man.",
    contextLength: 128000,
    tier: "balanced",
    pricing: {
      prompt: 2.00,
      completion: 6.00,
      inputCostPer1M: "$2.00",
      outputCostPer1M: "$6.00",
    },
  },
];

/**
 * Format giá tiền để hiển thị gọn gàng trên UI
 */
export function formatModelPrice(pricing?: OpenRouterPricing): string {
  if (!pricing) return "Giá cập nhật";
  if (pricing.isFree || (pricing.prompt === 0 && pricing.completion === 0)) {
    return "Miễn phí (Free)";
  }
  return `In: ${pricing.inputCostPer1M} | Out: ${pricing.outputCostPer1M} /1M`;
}

/**
 * Lấy danh sách model trực tiếp từ OpenRouter API kèm giá thực tế
 */
export async function fetchLiveOpenRouterModels(apiKey?: string): Promise<OpenRouterModelItem[]> {
  const headers: Record<string, string> = {};
  if (apiKey) {
    headers["Authorization"] = `Bearer ${apiKey}`;
  }

  const res = await fetch("https://openrouter.ai/api/v1/models", {
    headers,
  });

  if (!res.ok) {
    throw new Error(`Không thể lấy danh sách models từ OpenRouter (${res.status})`);
  }

  const resText = await res.text();
  const trimmed = resText.trim();
  if (trimmed.startsWith("<") || trimmed.toLowerCase().startsWith("<!doctype")) {
    throw new Error("OpenRouter phản hồi trang HTML thay vì danh sách models. Vui lòng kiểm tra lại kết nối mạng.");
  }

  let data: any;
  try {
    data = JSON.parse(trimmed);
  } catch {
    throw new Error("Dữ liệu models trả về từ OpenRouter không phải JSON hợp lệ.");
  }
  const rawList = data?.data || [];

  const mapped: OpenRouterModelItem[] = rawList.map((item: any) => {
    const id = item.id as string;
    const name = item.name || id;
    let provider: OpenRouterModelItem["provider"] = "other";
    let providerName = "Other";

    if (id.startsWith("x-ai/")) {
      provider = "grok";
      providerName = "xAI / Grok";
    } else if (id.startsWith("openai/")) {
      provider = "gpt";
      providerName = "OpenAI / GPT";
    } else if (id.startsWith("deepseek/")) {
      provider = "deepseek";
      providerName = "DeepSeek";
    } else if (id.startsWith("anthropic/")) {
      provider = "claude";
      providerName = "Anthropic / Claude";
    } else if (id.startsWith("google/")) {
      provider = "gemini";
      providerName = "Google / Gemini";
    } else if (id.startsWith("meta-llama/")) {
      provider = "meta";
      providerName = "Meta / Llama";
    } else if (id.startsWith("qwen/")) {
      provider = "qwen";
      providerName = "Alibaba / Qwen";
    } else if (id.startsWith("mistralai/")) {
      provider = "mistral";
      providerName = "Mistral AI";
    }

    let recommendedFor: "writing" | "image" | "both" = "both";
    if (id.includes("vision") || id.includes("image") || id.includes("4o") || id.includes("flash")) {
      recommendedFor = "image";
    } else if (id.includes("r1") || id.includes("chat") || id.includes("reasoning") || id.includes("instruct") || id.includes("thinking")) {
      recommendedFor = "writing";
    }

    // Parse pricing from OpenRouter API (OpenRouter returns price per token)
    const promptPricePerToken = parseFloat(item.pricing?.prompt || "0");
    const completionPricePerToken = parseFloat(item.pricing?.completion || "0");
    
    // Convert to price per 1 Million tokens
    const prompt1M = promptPricePerToken * 1000000;
    const completion1M = completionPricePerToken * 1000000;

    const isFree = prompt1M === 0 && completion1M === 0;

    const formatRate = (val: number) => {
      if (val === 0) return "$0";
      if (val < 0.01) return `$${val.toFixed(4)}`;
      if (val < 1) return `$${val.toFixed(2)}`;
      return `$${val.toFixed(2)}`;
    };

    const pricing: OpenRouterPricing = {
      prompt: prompt1M,
      completion: completion1M,
      inputCostPer1M: isFree ? "Miễn phí" : formatRate(prompt1M),
      outputCostPer1M: isFree ? "Miễn phí" : formatRate(completion1M),
      isFree,
    };

    let tier: OpenRouterModelItem["tier"] = "balanced";
    if (isFree) tier = "free";
    else if (prompt1M >= 5.0) tier = "flagship";
    else if (prompt1M <= 0.5) tier = "budget";

    return {
      id,
      name,
      provider,
      providerName,
      recommendedFor,
      description: item.description?.slice(0, 120),
      contextLength: item.context_length,
      pricing,
      tier,
    };
  });

  return mapped;
}
