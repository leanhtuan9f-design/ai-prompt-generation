export interface PromptInputs {
  title: string;
  coreContent: string;
  style: string;
  voice: string;
  targetAudience: string;
  context: string;
  useMascot?: boolean;
  mascotName: string;
  mascotPrompt?: string;
  femaleAge?: string; // Backwards-compatible alias
  characterAge?: string; // e.g. "25-34", "28 tuổi"
  characterGender?: string; // e.g. "Vietnamese female", "Nữ", "Nam"
  characterFace?: string;
  characterHair?: string;
  characterOutfit?: string;
  regionAccent: "south" | "north" | "central" | "west";
  pacingWpm: number;
  aspectRatio?: "9:16" | "16:9";
  customSlangWords?: string;
  customSafeWords?: string;
  customPaddingWords?: string;
  globalSafetyRules?: string;
  globalCharacterRules?: string;
  mandatoryImageRules?: string;
  mandatoryAudioRules?: string;
  mandatoryVideoRules?: string;
  // Hệ thống Prompt 5 bước & Nâng cao
  dialoguePromptTemplate?: string; // B1: Prompt tạo hội thoại
  storyboardPromptTemplate?: string; // B2: Prompt tạo storyboard
  scenePromptTemplate?: string; // B3: Prompt tạo cảnh
  imagePromptTemplate?: string; // Alias tương thích B3 / B2
  thumbnailPromptTemplate?: string; // B4: Prompt tạo thumbnail
  veoPromptTemplate?: string; // B5: Prompt tạo veo
  videoPromptTemplate?: string; // Alias tương thích B5
  videoStylePrompt?: string; // Nâng cao: Prompt video style
  projectName?: string; // Tên dự án / Chiến dịch (để kiểm soát chống trùng lặp góc kịch bản)
  antiDuplicationRules?: string; // Chỉ thị chống trùng góc kịch bản động
  customNotes?: string;
}

export type StepNumber = 1 | 2 | 3 | 4 | 5;

export interface StepStatusMap {
  1: "idle" | "generating" | "completed" | "approved";
  2: "idle" | "generating" | "completed" | "approved";
  3: "idle" | "generating" | "completed" | "approved";
  4: "idle" | "generating" | "completed" | "approved";
  5: "idle" | "generating" | "completed" | "approved";
}

export interface StepsContent {
  step1: string;
  step2: string;
  step3: string;
  step4: string;
  step5: string;
}

export interface ScriptSceneJson {
  scene: number;
  duration: string;
  setting: string;
  character: string;
  emotion: string;
  action: string;
  voice_identification: string;
  dialogue: string;
  camera: string;
  lighting: string;
  sfx: string;
  text_on_screen: string;
}

export interface SavedScript {
  id: string;
  title?: string;
  createdAt: string;
  inputs: PromptInputs;
  stepsContent: StepsContent;
  status: StepStatusMap;
}

export interface RegionalSlangItem {
  word: string;
  group: "Cảm thán" | "Nhấn mạnh" | "Chuyển ý" | "Gọi người xem" | "Câu đệm";
  region: "Miền Nam" | "Miền Bắc" | "Miền Trung" | "Miền Tây";
  meaning: string;
  example: string;
}

export interface ComplianceCheck {
  id: string;
  label: string;
  status: "pass" | "warning" | "fail";
  details: string;
}

export * from "./types/batch";
export * from "./types/template";
