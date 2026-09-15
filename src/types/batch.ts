import { PromptInputs, StepsContent, StepStatusMap } from "../types";

export interface BatchItem {
  id: string;
  projectName?: string;
  topic: string;
  coreContent: string;
  targetAudience: string;
  style: string;
  voice: string;
  mascotName: string;
  regionAccent: "south" | "north" | "central" | "west";
  pacingWpm: number;
  aspectRatio?: "9:16" | "16:9";
  characterAge?: string;
  characterGender?: string;
  femaleAge?: string;
  status: "pending" | "processing" | "completed" | "error";
  currentStep: number; // 1 to 5
  progressPercent: number;
  activeThreadIndex?: number; // 1 to N
  duplicateWarning?: {
    isDuplicate: boolean;
    score: number;
    matchedTopic?: string;
  };
  error?: string;
  result?: {
    inputs: PromptInputs;
    stepsContent: StepsContent;
    stepStatus: StepStatusMap;
  };
}

export interface BatchConfig {
  projectName?: string;
  mascotName: string;
  style: string;
  voice: string;
  regionAccent: "south" | "north" | "central" | "west";
  pacingWpm: number;
  aspectRatio?: "9:16" | "16:9";
  targetAudience: string;
  characterAge?: string;
  characterGender?: string;
  femaleAge?: string;
  concurrency: number; // 1 to 10 threads
  retryAttempts?: number;
  delayBetweenStepsMs?: number;
  autoSaveToHistory?: boolean;
  runScriptStep12?: boolean; // Bật/Tắt chạy Bước 1 & 2
  runVisualStep345?: boolean; // Bật/Tắt chạy Bước 3, 4, 5 (Tạo Prompts Ảnh/Video)
}

