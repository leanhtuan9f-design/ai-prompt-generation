import { PromptInputs } from "../types";
export type { PromptInputs };

export interface PromptTemplate {
  id: string;
  name: string;
  tag: string;
  description: string;
  isDefault?: boolean;
  isBuiltIn?: boolean;
  createdAt?: string;
  updatedAt?: string;
  data: PromptInputs;
}

export interface StandardRuleFile {
  version: string;
  type: "rules_standard";
  title?: string;
  description?: string;
  author?: string;
  updatedAt?: string;
  rules: {
    globalSafetyRules?: string;
    globalCharacterRules?: string;
    mandatoryImageRules?: string;
    mandatoryAudioRules?: string;
    mandatoryVideoRules?: string;
    customSlangWords?: string;
    customSafeWords?: string;
    customPaddingWords?: string;
  };
}

export interface StandardPromptFile {
  version: string;
  type: "prompts_standard";
  title?: string;
  description?: string;
  author?: string;
  updatedAt?: string;
  prompts: {
    dialoguePromptTemplate?: string;
    storyboardPromptTemplate?: string;
    scenePromptTemplate?: string;
    videoPromptTemplate?: string;
    thumbnailPromptTemplate?: string;
    mascotPrompt?: string;
    videoStylePrompt?: string;
    coreContent?: string;
  };
}

export interface StandardBundleFile {
  version: string;
  type: "bundle_standard";
  title?: string;
  tag?: string;
  description?: string;
  author?: string;
  updatedAt?: string;
  rules: {
    globalSafetyRules?: string;
    globalCharacterRules?: string;
    mandatoryImageRules?: string;
    mandatoryAudioRules?: string;
    mandatoryVideoRules?: string;
    customSlangWords?: string;
    customSafeWords?: string;
    customPaddingWords?: string;
  };
  prompts: {
    dialoguePromptTemplate?: string;
    storyboardPromptTemplate?: string;
    scenePromptTemplate?: string;
    videoPromptTemplate?: string;
    thumbnailPromptTemplate?: string;
    mascotPrompt?: string;
    videoStylePrompt?: string;
    coreContent?: string;
  };
  config?: {
    useMascot?: boolean;
    mascotName?: string;
    characterAge?: string;
    characterGender?: string;
    regionAccent?: "south" | "north" | "central" | "west";
    pacingWpm?: number;
    aspectRatio?: "9:16" | "16:9";
    style?: string;
    voice?: string;
    targetAudience?: string;
    context?: string;
  };
}

export type ImportableFieldKey =
  // Rules
  | "globalSafetyRules"
  | "globalCharacterRules"
  | "mandatoryImageRules"
  | "mandatoryAudioRules"
  | "mandatoryVideoRules"
  | "customSlangWords"
  | "customSafeWords"
  | "customPaddingWords"
  // Prompts
  | "dialoguePromptTemplate"
  | "storyboardPromptTemplate"
  | "scenePromptTemplate"
  | "videoPromptTemplate"
  | "thumbnailPromptTemplate"
  | "mascotPrompt"
  | "videoStylePrompt"
  | "coreContent"
  // Config & Metadata
  | "title"
  | "style"
  | "voice"
  | "targetAudience"
  | "context"
  | "useMascot"
  | "mascotName"
  | "characterAge"
  | "characterGender"
  | "regionAccent"
  | "pacingWpm"
  | "aspectRatio"
  | "customNotes";

export interface ImportableFieldMeta {
  key: ImportableFieldKey;
  label: string;
  category: "rules" | "prompts" | "config";
  categoryLabel: string;
  description: string;
  iconName: string;
  badge: string;
}
