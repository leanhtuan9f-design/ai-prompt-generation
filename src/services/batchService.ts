import { PromptInputs, StepsContent, StepStatusMap } from "../types";
import { generateStepApi } from "./api";
import { BatchItem, BatchConfig } from "../types/batch";
import { DEFAULT_STORYBOARD_PROMPT_TEMPLATE, DEFAULT_THUMBNAIL_PROMPT_TEMPLATE } from "../data/constants";
import {
  cleanStep5JsonOutput,
  cleanStep2StoryboardJson,
  cleanStep3VideoPromptsJson,
  cleanStep4ThumbnailJson,
} from "../utils/jsonCleaner";
import { extractAngleFeaturesFromScript, saveProjectAngle } from "../utils/projectMemory";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Tự động chạy tuần tự toàn bộ quy trình 5 bước cho một chủ đề kịch bản
 */
export async function generateFullScriptForBatch(
  topic: string,
  coreContent: string,
  config: BatchConfig,
  onProgress?: (step: number, stepName: string) => void,
  delayBetweenStepsMs: number = 300,
  customInputs?: Partial<PromptInputs>
): Promise<{ inputs: PromptInputs; stepsContent: StepsContent; stepStatus: StepStatusMap }> {
  const targetAudience = (customInputs?.targetAudience || config.targetAudience || "").trim() || (topic ? `Người quan tâm đến chủ đề: ${topic}` : "Đối tượng người xem mục tiêu");
  const mascotName = customInputs?.mascotName !== undefined ? customInputs.mascotName : (config.mascotName || "");
  const characterAge = customInputs?.characterAge || config.characterAge || config.femaleAge || "25-34";
  const characterGender = customInputs?.characterGender || config.characterGender || "Vietnamese female";
  const regionAccent = customInputs?.regionAccent || config.regionAccent || "south";
  const pacingWpm = customInputs?.pacingWpm || config.pacingWpm || 105;
  const style = customInputs?.style || config.style || "3D Pixar Animation, Soft Peach, Cinematic Warm Lighting";
  const voice = customInputs?.voice || config.voice || "Southern Vietnamese Saigon female voice 25-34 years old, gentle warm soothing tone, 105-110 wpm";

  const inputs: PromptInputs = {
    title: topic,
    coreContent: coreContent || (topic ? `Chủ đề: ${topic}. Giải pháp hữu ích, phân tích khoa học và lối sống phục hồi an toàn tự nhiên.` : "Giải pháp sức khỏe an toàn và phục hồi tự nhiên."),
    style,
    voice,
    targetAudience,
    context: customInputs?.context || "Không gian sinh hoạt gia đình ấm cúng, mô phỏng 3D Pixar trực quan sinh động",
    mascotName,
    characterAge,
    characterGender,
    femaleAge: characterAge,
    regionAccent,
    pacingWpm,
    aspectRatio: config.aspectRatio || "9:16",
    storyboardPromptTemplate: DEFAULT_STORYBOARD_PROMPT_TEMPLATE,
    thumbnailPromptTemplate: DEFAULT_THUMBNAIL_PROMPT_TEMPLATE,
    customNotes: "",
    ...customInputs,
  };

  const stepsContent: StepsContent = {
    step1: "",
    step2: "",
    step3: "",
    step4: "",
    step5: "",
  };

  const stepStatus: StepStatusMap = {
    1: "idle",
    2: "idle",
    3: "idle",
    4: "idle",
    5: "idle",
  };

  const customKey = localStorage.getItem("custom_openrouter_api_key") || undefined;
  const selectedModel = localStorage.getItem("custom_openrouter_model") || "anthropic/claude-3.5-sonnet";
  const selectedWritingModel = localStorage.getItem("custom_openrouter_writing_model") || "anthropic/claude-3.5-sonnet";
  const selectedImageModel = localStorage.getItem("custom_openrouter_image_model") || "openai/gpt-4o";
  const selectedProvider = (localStorage.getItem("selected_ai_provider") as any) || (customKey ? "openrouter" : "gemini");

  const openRouterUseSeparateWritingModel = localStorage.getItem("use_separate_writing_model") === "true" || localStorage.getItem("use_separate_models") !== "false";
  const openRouterUseSeparateImageModel = localStorage.getItem("use_separate_image_model") === "true" || localStorage.getItem("use_separate_models") !== "false";

  // Custom (OpenAI-compatible) API Config
  const customApiKey = localStorage.getItem("custom_api_key") || undefined;
  const customBaseUrl = localStorage.getItem("custom_base_url") || "https://api.openai.com/v1";
  const customModelId = localStorage.getItem("custom_model_id") || "gpt-4o";
  const customWritingModelId = localStorage.getItem("custom_writing_model_id") || customModelId;
  const customImageModelId = localStorage.getItem("custom_image_model_id") || customModelId;
  const customUseSeparateModels = localStorage.getItem("custom_use_separate_models") === "true";
  const customUseSeparateWritingModel = localStorage.getItem("custom_use_separate_writing_model") === "true" || (customUseSeparateModels && !!customWritingModelId);
  const customUseSeparateImageModel = localStorage.getItem("custom_use_separate_image_model") === "true" || (customUseSeparateModels && !!customImageModelId);

  const commonApiParams = {
    provider: selectedProvider,
    openRouterModel: selectedModel,
    openRouterWritingModel: selectedWritingModel,
    openRouterImageModel: selectedImageModel,
    openRouterUseSeparateWritingModel,
    openRouterUseSeparateImageModel,
    customOpenRouterKey: customKey,
    customApiKey,
    customBaseUrl,
    customModelId,
    customWritingModelId,
    customImageModelId,
    customUseSeparateModels,
    customUseSeparateWritingModel,
    customUseSeparateImageModel,
  };

  const shouldRunScript = config.runScriptStep12 !== false;
  const shouldRunVisual = config.runVisualStep345 !== false;

  // 1. BƯỚC 1: Lời thoại & Chiến lược (Viết Kịch Bản - Bước 1 & 2)
  if (shouldRunScript) {
    onProgress?.(1, "Đang tạo Lời thoại & Chiến lược 5 cảnh...");
    stepStatus[1] = "generating";
    const res1 = await generateStepApi({
      step: 1,
      inputs,
      previousStepsData: {},
      ...commonApiParams,
    });
    if (!res1.success || !res1.content) throw new Error("Thất bại ở Bước 1 (Lời thoại)");
    stepsContent.step1 = res1.content;
    stepStatus[1] = "completed";

    if (delayBetweenStepsMs > 0) await sleep(delayBetweenStepsMs);

    // BƯỚC 2: Storyboard Grid 9:16 (Phân Cảnh Kịch Bản)
    onProgress?.(2, "Đang tạo Prompt Storyboard 9:16...");
    stepStatus[2] = "generating";
    const res2 = await generateStepApi({
      step: 2,
      inputs,
      previousStepsData: { step1: stepsContent.step1 },
      ...commonApiParams,
    });
    if (!res2.success || !res2.content) throw new Error("Thất bại ở Bước 2 (Storyboard)");
    stepsContent.step2 = res2.content;
    stepStatus[2] = "completed";

    if (delayBetweenStepsMs > 0) await sleep(delayBetweenStepsMs);
  }

  // 2. BƯỚC 3, 4 & 5: Tạo Prompts Visual Ảnh 3D / Video Veo / Thumbnail
  if (shouldRunVisual) {
    // BƯỚC 3: Prompts Video N+1 (Veo 3 / Kling)
    onProgress?.(3, "Đang tạo Prompt Video N+1 (Veo 3 / Kling)...");
    stepStatus[3] = "generating";
    const res3 = await generateStepApi({
      step: 3,
      inputs,
      previousStepsData: { step1: stepsContent.step1, step2: stepsContent.step2 },
      ...commonApiParams,
    });
    if (!res3.success || !res3.content) throw new Error("Thất bại ở Bước 3 (Prompts Video)");
    stepsContent.step3 = res3.content;
    stepStatus[3] = "completed";

    if (delayBetweenStepsMs > 0) await sleep(delayBetweenStepsMs);

    // BƯỚC 4: Thumbnail & Hook titles
    onProgress?.(4, "Đang thiết kế Thumbnail Stop-the-Scroll 9:16...");
    stepStatus[4] = "generating";
    const res4 = await generateStepApi({
      step: 4,
      inputs,
      previousStepsData: {
        step1: stepsContent.step1,
        step2: stepsContent.step2,
        step3: stepsContent.step3,
      },
      ...commonApiParams,
    });
    if (!res4.success || !res4.content) throw new Error("Thất bại ở Bước 4 (Thumbnail)");
    stepsContent.step4 = res4.content;
    stepStatus[4] = "completed";

    if (delayBetweenStepsMs > 0) await sleep(delayBetweenStepsMs);

    // BƯỚC 5: JSON Automation đóng gói
    onProgress?.(5, "Đang đóng gói JSON kịch bản tự động hóa...");
    stepStatus[5] = "generating";
    const res5 = await generateStepApi({
      step: 5,
      inputs,
      previousStepsData: {
        step1: stepsContent.step1,
        step2: stepsContent.step2,
        step3: stepsContent.step3,
        step4: stepsContent.step4,
      },
      ...commonApiParams,
    });
    if (!res5.success || !res5.content) throw new Error("Thất bại ở Bước 5 (JSON Automation)");
    stepsContent.step5 = res5.content;
    stepStatus[5] = "completed";
  }

  // Tự động lưu góc giải pháp vào Bộ nhớ Dự án (Project Memory Bank) để chống lặp cho các kịch bản tiếp theo
  try {
    const activeProj = inputs.projectName || config.projectName || localStorage.getItem("prompt_studio_active_project_name") || "Trà Dây Bstar";
    const angleSummary = extractAngleFeaturesFromScript(activeProj, inputs.title, inputs.targetAudience, stepsContent.step1);
    saveProjectAngle(angleSummary);
  } catch (err) {
    console.warn("Lỗi lưu angle vào project memory:", err);
  }

  return {
    inputs,
    stepsContent,
    stepStatus,
  };
}

export interface BatchCallbacks {
  onItemStart: (id: string, threadIndex: number) => void;
  onItemProgress: (id: string, step: number, stepName: string, threadIndex: number) => void;
  onItemComplete: (
    id: string,
    result: { inputs: PromptInputs; stepsContent: StepsContent; stepStatus: StepStatusMap },
    threadIndex: number
  ) => void;
  onItemError: (id: string, error: string, threadIndex: number) => void;
  isStopRequested: () => boolean;
}

/**
 * Quản lý hàng đợi chạy Đa Luồng (Multi-threading Concurrency Pool)
 * Phân bổ các kịch bản vào song song N luồng (Threads / Workers)
 */
export async function runBatchConcurrent(
  itemsToProcess: BatchItem[],
  config: BatchConfig,
  callbacks: BatchCallbacks,
  customInputs?: Partial<PromptInputs>
): Promise<void> {
  const pendingItems = [...itemsToProcess];
  if (pendingItems.length === 0) return;

  const maxWorkers = Math.max(1, Math.min(config.concurrency || 3, pendingItems.length, 10));
  let currentIndex = 0;

  const worker = async (threadIndex: number) => {
    while (currentIndex < pendingItems.length) {
      if (callbacks.isStopRequested()) break;

      const itemIdx = currentIndex++;
      if (itemIdx >= pendingItems.length) break;

      const item = pendingItems[itemIdx];
      callbacks.onItemStart(item.id, threadIndex);

      const maxAttempts = (config.retryAttempts ?? 2) + 1;
      let attempt = 0;
      let isSuccess = false;
      let lastErrorMessage = "";

      while (attempt < maxAttempts && !isSuccess) {
        if (callbacks.isStopRequested()) break;
        attempt++;

        try {
          const itemSpecificInputs: Partial<PromptInputs> = {
            ...customInputs,
            targetAudience: item.targetAudience || config.targetAudience || customInputs?.targetAudience || "",
            ...(item.characterAge ? { characterAge: item.characterAge, femaleAge: item.characterAge } : {}),
            ...(item.characterGender ? { characterGender: item.characterGender } : {}),
            ...(item.mascotName !== undefined ? { mascotName: item.mascotName } : {}),
            ...(item.aspectRatio ? { aspectRatio: item.aspectRatio } : {}),
            ...(item.regionAccent ? { regionAccent: item.regionAccent } : {}),
            ...(item.pacingWpm ? { pacingWpm: item.pacingWpm } : {}),
            ...(item.style ? { style: item.style } : {}),
            ...(item.voice ? { voice: item.voice } : {}),
          };

          const result = await generateFullScriptForBatch(
            item.topic,
            item.coreContent,
            config,
            (stepNum, stepName) => {
              callbacks.onItemProgress(item.id, stepNum, stepName, threadIndex);
            },
            config.delayBetweenStepsMs ?? 350,
            itemSpecificInputs
          );

          callbacks.onItemComplete(item.id, result, threadIndex);
          isSuccess = true;
        } catch (err: any) {
          lastErrorMessage = err?.message || "Lỗi tạo kịch bản";
          console.warn(`[Luồng ${threadIndex}] Lỗi lần ${attempt}/${maxAttempts} cho "${item.topic}":`, err);

          if (attempt < maxAttempts && !callbacks.isStopRequested()) {
            // Chờ trước khi retry (exponential backoff nhẹ)
            await sleep(1000 * attempt);
          }
        }
      }

      if (!isSuccess && !callbacks.isStopRequested()) {
        callbacks.onItemError(item.id, lastErrorMessage || "Lỗi không xác định sau khi thử lại", threadIndex);
      }
    }
  };

  // Kích hoạt đồng thời N luồng worker
  const workers = Array.from({ length: maxWorkers }, (_, i) => worker(i + 1));
  await Promise.all(workers);
}

/**
 * Xuất toàn bộ danh sách kết quả kịch bản hàng loạt ra file JSON chuẩn cấu trúc
 */
export function exportBatchToJson(items: BatchItem[]): void {
  const completedItems = items.filter((i) => i.status === "completed" && i.result);
  if (completedItems.length === 0) return;

  const exportData = completedItems.map((item) => {
    // Parse Storyboard prompt JSON
    let storyboardPrompt: any = null;
    try {
      storyboardPrompt = JSON.parse(cleanStep2StoryboardJson(item.result?.stepsContent.step2 || ""));
    } catch {
      storyboardPrompt = item.result?.stepsContent.step2 || "";
    }

    // Parse Video prompts N+1 JSON
    let videoPrompts: any = null;
    try {
      videoPrompts = JSON.parse(cleanStep3VideoPromptsJson(item.result?.stepsContent.step3 || ""));
    } catch {
      videoPrompts = item.result?.stepsContent.step3 || "";
    }

    // Parse Thumbnail prompt JSON
    let thumbnailPrompt: any = null;
    try {
      thumbnailPrompt = JSON.parse(cleanStep4ThumbnailJson(item.result?.stepsContent.step4 || ""));
    } catch {
      thumbnailPrompt = item.result?.stepsContent.step4 || "";
    }

    // Parse Automation Scenes JSON
    let parsedScenes: any = null;
    try {
      const cleanStep5 = cleanStep5JsonOutput(item.result?.stepsContent.step5 || "", "compact");
      parsedScenes = JSON.parse(cleanStep5);
    } catch {
      parsedScenes = item.result?.stepsContent.step5 || "";
    }

    return {
      id: item.id,
      topic: item.topic,
      metadata: {
        inputs: item.result?.inputs,
        exportedAt: new Date().toISOString(),
      },
      prompts_json: {
        storyboard_prompt: storyboardPrompt,
        video_prompts_n_plus_1: videoPrompts,
        thumbnail_prompt: thumbnailPrompt,
      },
      automation_scenes_json: parsedScenes,
      raw_dialogues_step1: item.result?.stepsContent.step1,
    };
  });

  const jsonStr = JSON.stringify(exportData, null, 2);
  const blob = new Blob([jsonStr], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `3d_health_prompts_batch_${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
