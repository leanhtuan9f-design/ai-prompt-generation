import { PromptInputs } from "../types";
import {
  PromptTemplate,
  StandardRuleFile,
  StandardPromptFile,
  StandardBundleFile,
  ImportableFieldKey,
} from "../types/template";
import {
  IMPORTABLE_FIELDS_CONFIG,
  STANDARD_RULES_DATA,
  STANDARD_PROMPTS_DATA,
  STANDARD_BUNDLE_DATA,
} from "../data/standardFiles";
import { DEFAULT_INPUTS } from "../data/constants";

export interface ParsedImportFieldItem {
  key: ImportableFieldKey;
  label: string;
  category: "rules" | "prompts" | "config";
  categoryLabel: string;
  badge: string;
  description: string;
  value: any;
  previewText: string;
  hasContent: boolean;
}

export interface ParsedImportResult {
  success: boolean;
  format: "rules_standard" | "prompts_standard" | "bundle_standard" | "template_single" | "template_list" | "custom_json" | "unknown";
  formatTitle: string;
  formatBadge: string;
  title?: string;
  description?: string;
  version?: string;
  availableFields: ParsedImportFieldItem[];
  fullValues: Record<string, any>;
  rawObject: any;
  error?: string;
}

/**
 * Triggers a browser download for a formatted JSON file
 */
export function downloadJsonFile(filename: string, data: any): void {
  try {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error("Lỗi khi tải xuống file JSON:", err);
  }
}

/**
 * Export only Rules in standard schema
 */
export function exportStandardRules(data: Partial<PromptInputs>, customTitle?: string): void {
  const fileData: StandardRuleFile = {
    version: "2.0.0",
    type: "rules_standard",
    title: customTitle || "Bộ Quy Tắc Chuẩn 3D Health Video",
    description: "Tập tin quy tắc an toàn y tế, khóa nhân vật, quy chuẩn ảnh/audio/video và từ lóng",
    author: "3D Health Video Prompt Studio",
    updatedAt: new Date().toISOString(),
    rules: {
      globalSafetyRules: typeof data.globalSafetyRules === "string" ? data.globalSafetyRules : DEFAULT_INPUTS.globalSafetyRules,
      globalCharacterRules: typeof data.globalCharacterRules === "string" ? data.globalCharacterRules : DEFAULT_INPUTS.globalCharacterRules,
      mandatoryImageRules: typeof data.mandatoryImageRules === "string" ? data.mandatoryImageRules : DEFAULT_INPUTS.mandatoryImageRules,
      mandatoryAudioRules: typeof data.mandatoryAudioRules === "string" ? data.mandatoryAudioRules : DEFAULT_INPUTS.mandatoryAudioRules,
      mandatoryVideoRules: typeof data.mandatoryVideoRules === "string" ? data.mandatoryVideoRules : DEFAULT_INPUTS.mandatoryVideoRules,
      customSlangWords: typeof data.customSlangWords === "string" ? data.customSlangWords : DEFAULT_INPUTS.customSlangWords,
      customSafeWords: typeof data.customSafeWords === "string" ? data.customSafeWords : DEFAULT_INPUTS.customSafeWords,
      customPaddingWords: typeof data.customPaddingWords === "string" ? data.customPaddingWords : DEFAULT_INPUTS.customPaddingWords,
    },
  };
  const cleanName = (customTitle || "Standard_Rules").toLowerCase().replace(/[^a-z0-9]+/g, "_");
  downloadJsonFile(`${cleanName}_rules_v2.json`, fileData);
}

/**
 * Export only Prompts in standard schema
 */
export function exportStandardPrompts(data: Partial<PromptInputs>, customTitle?: string): void {
  const fileData: StandardPromptFile = {
    version: "2.0.0",
    type: "prompts_standard",
    title: customTitle || "Bộ Prompt Chuẩn 5 Bước 3D Pixar",
    description: "Tập tin khung prompt tạo hội thoại, storyboard, video motion, thumbnail và mascot",
    author: "3D Health Video Prompt Studio",
    updatedAt: new Date().toISOString(),
    prompts: {
      dialoguePromptTemplate: typeof data.dialoguePromptTemplate === "string" ? data.dialoguePromptTemplate : DEFAULT_INPUTS.dialoguePromptTemplate,
      storyboardPromptTemplate: typeof data.storyboardPromptTemplate === "string" ? data.storyboardPromptTemplate : DEFAULT_INPUTS.storyboardPromptTemplate,
      scenePromptTemplate: typeof data.scenePromptTemplate === "string" ? data.scenePromptTemplate : (typeof data.imagePromptTemplate === "string" ? data.imagePromptTemplate : DEFAULT_INPUTS.scenePromptTemplate),
      videoPromptTemplate: typeof data.videoPromptTemplate === "string" ? data.videoPromptTemplate : (typeof data.veoPromptTemplate === "string" ? data.veoPromptTemplate : DEFAULT_INPUTS.videoPromptTemplate),
      thumbnailPromptTemplate: typeof data.thumbnailPromptTemplate === "string" ? data.thumbnailPromptTemplate : DEFAULT_INPUTS.thumbnailPromptTemplate,
      mascotPrompt: typeof data.mascotPrompt === "string" ? data.mascotPrompt : DEFAULT_INPUTS.mascotPrompt,
      videoStylePrompt: typeof data.videoStylePrompt === "string" ? data.videoStylePrompt : (typeof data.style === "string" ? data.style : DEFAULT_INPUTS.videoStylePrompt),
      coreContent: typeof data.coreContent === "string" ? data.coreContent : DEFAULT_INPUTS.coreContent,
    },
  };
  const cleanName = (customTitle || "Standard_Prompts").toLowerCase().replace(/[^a-z0-9]+/g, "_");
  downloadJsonFile(`${cleanName}_prompts_v2.json`, fileData);
}

/**
 * Export a complete Template as a Standard Bundle
 */
export function exportStandardBundle(template: PromptTemplate): void {
  const tData = template.data || DEFAULT_INPUTS;
  const fileData: StandardBundleFile = {
    version: "2.0.0",
    type: "bundle_standard",
    title: template.name || "Custom Bundle",
    tag: template.tag || "3D Health Video",
    description: template.description || "Gói quy tắc và kịch bản chuẩn phong cách 3D Pixar",
    author: "3D Health Video Prompt Studio",
    updatedAt: new Date().toISOString(),
    rules: {
      globalSafetyRules: typeof tData.globalSafetyRules === "string" ? tData.globalSafetyRules : DEFAULT_INPUTS.globalSafetyRules,
      globalCharacterRules: typeof tData.globalCharacterRules === "string" ? tData.globalCharacterRules : DEFAULT_INPUTS.globalCharacterRules,
      mandatoryImageRules: typeof tData.mandatoryImageRules === "string" ? tData.mandatoryImageRules : DEFAULT_INPUTS.mandatoryImageRules,
      mandatoryAudioRules: typeof tData.mandatoryAudioRules === "string" ? tData.mandatoryAudioRules : DEFAULT_INPUTS.mandatoryAudioRules,
      mandatoryVideoRules: typeof tData.mandatoryVideoRules === "string" ? tData.mandatoryVideoRules : DEFAULT_INPUTS.mandatoryVideoRules,
      customSlangWords: typeof tData.customSlangWords === "string" ? tData.customSlangWords : DEFAULT_INPUTS.customSlangWords,
      customSafeWords: typeof tData.customSafeWords === "string" ? tData.customSafeWords : DEFAULT_INPUTS.customSafeWords,
      customPaddingWords: typeof tData.customPaddingWords === "string" ? tData.customPaddingWords : DEFAULT_INPUTS.customPaddingWords,
    },
    prompts: {
      dialoguePromptTemplate: typeof tData.dialoguePromptTemplate === "string" ? tData.dialoguePromptTemplate : DEFAULT_INPUTS.dialoguePromptTemplate,
      storyboardPromptTemplate: typeof tData.storyboardPromptTemplate === "string" ? tData.storyboardPromptTemplate : DEFAULT_INPUTS.storyboardPromptTemplate,
      scenePromptTemplate: typeof tData.scenePromptTemplate === "string" ? tData.scenePromptTemplate : (typeof tData.imagePromptTemplate === "string" ? tData.imagePromptTemplate : DEFAULT_INPUTS.scenePromptTemplate),
      videoPromptTemplate: typeof tData.videoPromptTemplate === "string" ? tData.videoPromptTemplate : (typeof tData.veoPromptTemplate === "string" ? tData.veoPromptTemplate : DEFAULT_INPUTS.videoPromptTemplate),
      thumbnailPromptTemplate: typeof tData.thumbnailPromptTemplate === "string" ? tData.thumbnailPromptTemplate : DEFAULT_INPUTS.thumbnailPromptTemplate,
      mascotPrompt: typeof tData.mascotPrompt === "string" ? tData.mascotPrompt : DEFAULT_INPUTS.mascotPrompt,
      videoStylePrompt: typeof tData.videoStylePrompt === "string" ? tData.videoStylePrompt : (typeof tData.style === "string" ? tData.style : DEFAULT_INPUTS.videoStylePrompt),
      coreContent: typeof tData.coreContent === "string" ? tData.coreContent : DEFAULT_INPUTS.coreContent,
    },
    config: {
      useMascot: tData.useMascot !== false,
      mascotName: tData.mascotName || "Trà Dây Bstar",
      characterAge: tData.characterAge || tData.femaleAge || "25-34",
      characterGender: tData.characterGender || "Vietnamese female",
      regionAccent: tData.regionAccent || "south",
      pacingWpm: tData.pacingWpm || 105,
      aspectRatio: tData.aspectRatio || "9:16",
      style: tData.style || DEFAULT_INPUTS.style,
      voice: tData.voice || DEFAULT_INPUTS.voice,
      targetAudience: tData.targetAudience || DEFAULT_INPUTS.targetAudience,
      context: tData.context || DEFAULT_INPUTS.context,
    },
  };
  const cleanName = (template.name || "Standard_Bundle").toLowerCase().replace(/[^a-z0-9]+/g, "_");
  downloadJsonFile(`${cleanName}_bundle_v2.json`, fileData);
}

/**
 * Download sample default standard files
 */
export function downloadBuiltinStandardFile(type: "rules" | "prompts" | "bundle"): void {
  if (type === "rules") {
    downloadJsonFile("Standard_Rules_File_v2.json", STANDARD_RULES_DATA);
  } else if (type === "prompts") {
    downloadJsonFile("Standard_Prompts_File_v2.json", STANDARD_PROMPTS_DATA);
  } else {
    downloadJsonFile("Standard_Full_Bundle_v2.json", STANDARD_BUNDLE_DATA);
  }
}

/**
 * Intelligent JSON Parser that detects any schema, extracts all importable fields
 */
export function parseImportedJson(jsonStr: string): ParsedImportResult {
  const cleanStr = jsonStr.trim();
  if (!cleanStr) {
    return {
      success: false,
      format: "unknown",
      formatTitle: "Dữ liệu trống",
      formatBadge: "Rỗng",
      availableFields: [],
      fullValues: {},
      rawObject: null,
      error: "Vui lòng dán chuỗi JSON hoặc chọn file JSON hợp lệ!",
    };
  }

  let parsed: any;
  try {
    parsed = JSON.parse(cleanStr);
  } catch (err: any) {
    return {
      success: false,
      format: "unknown",
      formatTitle: "Lỗi định dạng JSON",
      formatBadge: "Cú pháp không hợp lệ",
      availableFields: [],
      fullValues: {},
      rawObject: null,
      error: `Cú pháp JSON không hợp lệ: ${err.message}`,
    };
  }

  if (typeof parsed !== "object" || parsed === null) {
    return {
      success: false,
      format: "unknown",
      formatTitle: "Dữ liệu không phải đối tượng JSON",
      formatBadge: "Lỗi",
      availableFields: [],
      fullValues: {},
      rawObject: parsed,
      error: "Tập tin không chứa đối tượng hoặc mảng JSON hợp lệ.",
    };
  }

  // 1. Detect Format
  let format: ParsedImportResult["format"] = "custom_json";
  let formatTitle = "Tập Tin Tùy Chỉnh (Custom JSON)";
  let formatBadge = "Custom";
  let title = parsed.title || parsed.name || "";
  let description = parsed.description || "";
  let version = parsed.version || "1.0.0";

  // Collect all extracted values into a flat key-value map
  const flatValues: Record<string, any> = {};

  if (Array.isArray(parsed)) {
    format = "template_list";
    formatTitle = `Danh Sách ${parsed.length} Templates Kịch Bản`;
    formatBadge = "Danh Sách";
    title = `Gói Sao Lưu ${parsed.length} Template`;
    // Take fields from the first template or default template
    const first = parsed.find((t) => t.isDefault) || parsed[0] || {};
    const tData = first.data || first;
    Object.assign(flatValues, tData);
    if (first.name && !title) title = first.name;
    if (first.description && !description) description = first.description;
  } else if (parsed.type === "rules_standard" || (parsed.rules && !parsed.prompts)) {
    format = "rules_standard";
    formatTitle = "Tập Tin Quy Tắc Chuẩn (Standard Rules File)";
    formatBadge = "Quy Tắc";
    if (parsed.rules && typeof parsed.rules === "object") {
      Object.assign(flatValues, parsed.rules);
    }
  } else if (parsed.type === "prompts_standard" || (parsed.prompts && !parsed.rules)) {
    format = "prompts_standard";
    formatTitle = "Tập Tin Cấu Trúc Prompt Chuẩn (Standard Prompts File)";
    formatBadge = "Prompts";
    if (parsed.prompts && typeof parsed.prompts === "object") {
      Object.assign(flatValues, parsed.prompts);
    }
  } else if (parsed.type === "bundle_standard" || (parsed.rules && parsed.prompts)) {
    format = "bundle_standard";
    formatTitle = "Gói Chuẩn Đầy Đủ (Rules + Prompts Standard Bundle)";
    formatBadge = "Trọn Gói";
    if (parsed.rules && typeof parsed.rules === "object") Object.assign(flatValues, parsed.rules);
    if (parsed.prompts && typeof parsed.prompts === "object") Object.assign(flatValues, parsed.prompts);
    if (parsed.config && typeof parsed.config === "object") Object.assign(flatValues, parsed.config);
  } else if (parsed.data && typeof parsed.data === "object") {
    format = "template_single";
    formatTitle = `Template Kịch Bản: "${parsed.name || 'Không tên'}"`;
    formatBadge = "Template";
    Object.assign(flatValues, parsed.data);
  } else {
    // Raw flat object
    Object.assign(flatValues, parsed);
  }

  // Handle common aliases
  if (flatValues.veoPromptTemplate && !flatValues.videoPromptTemplate) {
    flatValues.videoPromptTemplate = flatValues.veoPromptTemplate;
  }
  if (flatValues.videoPromptTemplate && !flatValues.veoPromptTemplate) {
    flatValues.veoPromptTemplate = flatValues.videoPromptTemplate;
  }
  if (flatValues.imagePromptTemplate && !flatValues.storyboardPromptTemplate) {
    flatValues.storyboardPromptTemplate = flatValues.imagePromptTemplate;
  }
  if (flatValues.femaleAge && !flatValues.characterAge) {
    flatValues.characterAge = flatValues.femaleAge;
  }
  if (flatValues.characterAge && !flatValues.femaleAge) {
    flatValues.femaleAge = flatValues.characterAge;
  }

  // Construct modular available fields list
  const availableFields: ParsedImportFieldItem[] = [];

  for (const meta of IMPORTABLE_FIELDS_CONFIG) {
    const rawVal = flatValues[meta.key];
    const hasContent = rawVal !== undefined && rawVal !== null && String(rawVal).trim().length > 0;
    
    let previewText = "";
    if (hasContent) {
      const s = String(rawVal).trim();
      previewText = s.length > 90 ? s.slice(0, 87) + "..." : s;
    }

    availableFields.push({
      key: meta.key,
      label: meta.label,
      category: meta.category,
      categoryLabel: meta.categoryLabel,
      badge: meta.badge,
      description: meta.description,
      value: rawVal,
      previewText,
      hasContent,
    });
  }

  return {
    success: true,
    format,
    formatTitle,
    formatBadge,
    title,
    description,
    version,
    availableFields,
    fullValues: flatValues,
    rawObject: parsed,
  };
}

/**
 * Apply selected import keys to an existing target PromptInputs object
 */
export function applyImportedFields(
  target: PromptInputs,
  selectedKeys: ImportableFieldKey[],
  sourceValues: Record<string, any>
): PromptInputs {
  const result: PromptInputs = { ...target };

  selectedKeys.forEach((key) => {
    if (sourceValues[key] !== undefined && sourceValues[key] !== null) {
      (result as any)[key] = sourceValues[key];
    }
  });

  // Keep aliases synchronized
  if (selectedKeys.includes("videoPromptTemplate") && result.videoPromptTemplate) {
    result.veoPromptTemplate = result.videoPromptTemplate;
  }
  if (selectedKeys.includes("storyboardPromptTemplate") && result.storyboardPromptTemplate) {
    result.imagePromptTemplate = result.storyboardPromptTemplate;
  }
  if (selectedKeys.includes("characterAge") && result.characterAge) {
    result.femaleAge = result.characterAge;
  }

  return result;
}
