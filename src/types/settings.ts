export interface SystemSettings {
  // OpenRouter & AI
  openRouterApiKey: string;
  openRouterModel: string;
  openRouterWritingModel?: string;
  openRouterImageModel?: string;
  useSeparateModels?: boolean;
  useSeparateWritingModel?: boolean; // Bật/Tắt riêng model Bước 1 & 2
  useSeparateImageModel?: boolean; // Bật/Tắt riêng model Tạo Ảnh / Prompt Visual (Bước 3, 4, 5)
  aiProvider: "openrouter" | "gemini" | "custom";
  customModelName?: string;

  // Custom (OpenAI-compatible) API Configuration
  customApiKey?: string;
  customBaseUrl?: string; // e.g. "https://api.openai.com/v1" or "https://your-api.com/v1"
  customModelId?: string; // e.g. "gpt-4o", "my-model-v1"
  customWritingModelId?: string;
  customImageModelId?: string;
  customUseSeparateModels?: boolean;
  customUseSeparateWritingModel?: boolean; // Bật/Tắt riêng model Viết kịch bản (B1 & B2)
  customUseSeparateImageModel?: boolean; // Bật/Tắt riêng model Tạo Ảnh / Visual (B3, 4, 5)

  // Execution Step Toggles for Batch & Generation
  batchRunScriptStep12?: boolean; // Bật/Tắt chạy Bước 1 & 2 (Viết Lời thoại & Storyboard)
  batchRunVisualStep345?: boolean; // Bật/Tắt chạy Bước 3, 4, 5 (Tạo Prompts Ảnh 3D, Video Veo, Thumbnail)

  // Concurrency & Batch Processing
  concurrency: number; // 1 to 10 threads
  retryAttempts: number; // 0 to 3
  delayBetweenStepsMs: number; // 0, 300, 500, 1000, 2000
  autoSaveToHistory: boolean;

  // Script & Mascot Presets
  defaultMascotName: string;
  defaultRegionAccent: "south" | "north" | "central" | "west";
  defaultPacingWpm: number;
  defaultStyle: string;
  defaultVoice: string;
  defaultTargetAudience: string;
  defaultTemplateId?: string;
  maxTokens?: number; // Safe limit per step request (default 4096)
}

export const DEFAULT_SYSTEM_SETTINGS: SystemSettings = {
  openRouterApiKey: "",
  openRouterModel: "anthropic/claude-3.5-sonnet",
  openRouterWritingModel: "anthropic/claude-3.5-sonnet",
  openRouterImageModel: "openai/gpt-4o",
  useSeparateModels: true,
  useSeparateWritingModel: true,
  useSeparateImageModel: true,
  aiProvider: "gemini",
  customModelName: "",
  customApiKey: "",
  customBaseUrl: "https://api.openai.com/v1",
  customModelId: "gpt-4o",
  customWritingModelId: "ag/gemini-3.7-flash-medium",
  customImageModelId: "gpt-4o",
  customUseSeparateModels: true,
  customUseSeparateWritingModel: true,
  customUseSeparateImageModel: true,
  batchRunScriptStep12: true,
  batchRunVisualStep345: true,
  concurrency: 3,
  retryAttempts: 2,
  delayBetweenStepsMs: 400,
  autoSaveToHistory: true,
  defaultMascotName: "Trà Dây Bstar",
  defaultRegionAccent: "south",
  defaultPacingWpm: 105,
  defaultStyle: "3D Pixar Animation, Soft Peach, Cinematic Warm Lighting",
  defaultVoice: "Giọng Nam Sài Gòn 55-70 tuổi, trầm ấm, kể chuyện, tốc độ 100-110 wpm",
  defaultTargetAudience: "Người bị trào ngược, đau dạ dày, dân văn phòng 25-45 tuổi",
  defaultTemplateId: "tpl_tra_day_trao_nguoc",
  maxTokens: 4096,
};
