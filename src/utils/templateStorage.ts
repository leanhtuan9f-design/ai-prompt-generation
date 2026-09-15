import { PromptTemplate } from "../types";
import {
  DEFAULT_INPUTS,
  DEFAULT_DIALOGUE_PROMPT_TEMPLATE,
  DEFAULT_STORYBOARD_PROMPT_TEMPLATE,
  DEFAULT_SCENE_PROMPT_TEMPLATE,
  DEFAULT_THUMBNAIL_PROMPT_TEMPLATE,
  DEFAULT_VEO_PROMPT_TEMPLATE,
  DEFAULT_MANDATORY_AUDIO_RULES,
  DEFAULT_MANDATORY_IMAGE_RULES,
  DEFAULT_MANDATORY_VIDEO_RULES,
  DEFAULT_GLOBAL_SAFETY_RULES,
  DEFAULT_GLOBAL_CHARACTER_RULES,
  DEFAULT_SLANG_WORDS,
  DEFAULT_SAFE_WORDS,
  DEFAULT_PADDING_WORDS,
  DEFAULT_MASCOT_PROMPT,
} from "../data/constants";

export const BUILTIN_PROMPT_TEMPLATES: PromptTemplate[] = [
  {
    id: "tpl_tra_day_trao_nguoc",
    name: "Trà Dây Bstar - Trào Ngược Dạ Dày",
    tag: "Tiêu hóa & Dạ dày",
    description: "Kịch bản chuẩn 5 cảnh giải thích cơ chế axit dư thừa & thảo mộc Trà Dây bảo vệ niêm mạc",
    isBuiltIn: true,
    isDefault: true,
    createdAt: "2025-01-01T00:00:00.000Z",
    data: {
      ...DEFAULT_INPUTS,
    },
  },
  {
    id: "tpl_duong_tam_an_than",
    name: "Dưỡng Tâm Thảo Mộc - Giấc Ngủ Sâu",
    tag: "Giấc ngủ & Thần kinh",
    description: "Giải pháp thư giãn thần kinh, xua tan âu lo và phục hồi giấc ngủ tự nhiên",
    isBuiltIn: true,
    createdAt: "2025-01-01T00:00:00.000Z",
    data: {
      ...DEFAULT_INPUTS,
      title: "Giải pháp êm dịu cho người hay trằn trọc, mất ngủ về đêm",
      coreContent: "Vấn đề: Trằn trọc 2-3 tiếng không ngủ được do hormone Cortisol tăng cao vì căng thẳng. Nỗi đau: Ánh sáng xanh điện thoại, ăn quá no ban đêm, tuần hoàn máu kém. 3 Giải pháp: (1) Ngâm chân nước ấm thảo mộc 15 phút; (2) Tắt điện thoại trước ngủ 45 phút, tập thở 4-7-8; (3) Uống trà thảo mộc hoa cúc tâm sen Trà Dây Bstar giúp thư giãn thần kinh nhẹ nhàng.",
      style: "3D Pixar style, deep cozy indigo and soft lavender twilight, dreamy glowing stars, magical warm floating dust",
      videoStylePrompt: "3D Pixar style, deep cozy indigo and soft lavender twilight, dreamy glowing stars, magical warm floating dust, gentle soothing motion, cinematic 8K render",
      voice: "Southern Vietnamese Saigon female voice 30-40 years old, gentle whispering cadence, melodious comforting warmth, 90-100 wpm",
      targetAudience: "Người làm việc trí óc, phụ nữ hay lo âu, khó vào giấc ngủ",
      context: "Phòng ngủ ấm áp ánh đèn ngủ dịu nhẹ, ban công ngập ánh trăng êm ả",
      mascotName: "Trà Dây Bstar An Thần",
      characterAge: "28-35",
      characterGender: "Vietnamese female",
      femaleAge: "28-35",
      regionAccent: "south",
      pacingWpm: 95,
      customNotes: "Nhấn mạnh thư giãn tinh thần tự nhiên, không cam kết an thần cưỡng bức.",
    },
  },
  {
    id: "tpl_thao_duoc_duong_gan",
    name: "Thảo Dược Dưỡng Gan - Tươi Tắn Làn Da",
    tag: "Thải độc & Gan mật",
    description: "Xoa dịu nóng trong, mụn nhọt và thanh lọc cơ thể từ gốc",
    isBuiltIn: true,
    createdAt: "2025-01-01T00:00:00.000Z",
    data: {
      ...DEFAULT_INPUTS,
      title: "Bí quyết thanh lọc nóng trong, giải độc gan cho người hay thức khuya",
      coreContent: "Vấn đề: Cơ thể bốc hỏa, nổi mụn, mẩn ngứa và hơi thở nóng nực. Nỗi đau: Thức đêm làm việc, ăn đồ chiên rán cay nồng, độc tố tích tụ quá tải ở gan. 3 Giải pháp: (1) Uống đủ 2 lít nước ấm rải đều trong ngày; (2) Đi ngủ trước 23h để gan tự phục hồi sinh học; (3) Bổ sung chiết xuất thảo mộc Atiso & Trà Dây Bstar giàu Silymarin tự nhiên.",
      style: "3D Pixar style, fresh emerald green and golden sunlight, crisp morning dew drops, botanical serenity",
      videoStylePrompt: "3D Pixar style, fresh emerald green and golden sunlight, crisp morning dew drops, botanical serenity, fluid organic healing motion, 8k",
      voice: "Northern Vietnamese Hanoi female voice 28-35 years old, clear crisp articulation, inspiring friendly medical educator tone, 110 wpm",
      targetAudience: "Nhân viên văn phòng, người hay thức khuya, ăn uống nhiều dầu mỡ đồ cay nóng",
      context: "Không gian bếp xanh mát ngập tràn cây cối và bình minh rạng rỡ",
      mascotName: "Trà Dây Bstar Thanh Mát",
      characterAge: "25-30",
      characterGender: "Vietnamese female",
      femaleAge: "25-30",
      regionAccent: "north",
      pacingWpm: 110,
      customNotes: "Tập trung thói quen lành mạnh và thảo mộc mát gan.",
    },
  },
  {
    id: "tpl_duong_khop_linh_hoat",
    name: "Dưỡng Khớp Linh Hoạt - Vận Động Êm Ái",
    tag: "Xương khớp",
    description: "Giúp người đau mỏi vai gáy, khớp gối khô kêu lục cục nhẹ nhõm",
    isBuiltIn: true,
    createdAt: "2025-01-01T00:00:00.000Z",
    data: {
      ...DEFAULT_INPUTS,
      title: "Giải pháp xoa dịu đau mỏi vai gáy và khô khớp gối cho dân văn phòng",
      coreContent: "Vấn đề: Ngồi lì 8 tiếng khiến cổ vai gáy cứng đờ, khớp gối lục cục khi đứng lên. Nỗi đau: Sai tư thế ngồi, thiếu dịch khớp bôi trơn, thoái hóa do ít vận động. 3 Giải pháp: (1) Đứng dậy kéo giãn cơ gân 5 phút sau mỗi 1 tiếng; (2) Bổ sung thực phẩm giàu Omega 3 & Collagen; (3) Dùng thảo mộc dưỡng khớp Trà Dây Bstar giúp lưu thông khí huyết.",
      style: "3D Pixar style, energizing soft morning glow, clean ergonomic modern workspace, floating vitality sparkles",
      videoStylePrompt: "3D Pixar style, energizing soft morning glow, clean ergonomic modern workspace, floating vitality sparkles, smooth natural dynamic movement, 8k",
      voice: "Central Vietnamese Da Nang female voice 30-45 years old, hearty warm and reassuring tone, rhythmic and engaging, 105 wpm",
      targetAudience: "Dân văn phòng, người ngồi nhiều một chỗ, ít vận động, hay đau mỏi cơ xương",
      context: "Góc làm việc hiện đại tràn ngập ánh sáng và công viên tập thể dục rợp bóng cây",
      mascotName: "Trà Dây Bstar Khớp Khỏe",
      characterAge: "30-40",
      characterGender: "Vietnamese female",
      femaleAge: "30-40",
      regionAccent: "central",
      pacingWpm: 105,
      customNotes: "Khuyến khích vận động kéo giãn kết hợp thảo mộc tự nhiên.",
    },
  },
  {
    id: "tpl_tieu_hoa_tre_nho",
    name: "Tiêu Hóa Trẻ Em - Bụng Khỏe Ăn Ngon",
    tag: "Nhi khoa & Tiêu hóa",
    description: "Bảo vệ hệ vi sinh đường ruột cho trẻ nhỏ biếng ăn, hay đầy hơi chướng bụng",
    isBuiltIn: true,
    createdAt: "2025-01-01T00:00:00.000Z",
    data: {
      ...DEFAULT_INPUTS,
      title: "Mẹo nhỏ giúp bé hết đầy hơi, tiêu hóa êm ru và ăn ngon miệng",
      coreContent: "Vấn đề: Trẻ quấy khóc, đầy hơi, lười ăn do men vi sinh đường ruột chưa ổn định. Nỗi đau: Uống nhiều sữa công thức, ăn đồ ngọt, hệ tiêu hóa non nớt quá tải. 3 Giải pháp: (1) Massage bụng cho bé theo chiều kim đồng hồ 10 phút sau ăn; (2) Tăng cường rau củ quả nghiền giàu chất xơ hòa tan; (3) Bổ sung men vi sinh và siro thảo mộc tự nhiên dịu nhẹ.",
      style: "3D Pixar style, bright colorful playful pastel, cute soft warm lighting, joyful floating bubbles and sparkles",
      videoStylePrompt: "3D Pixar style, bright colorful playful pastel, cute soft warm lighting, joyful floating bubbles and sparkles, delightful smooth animations, 8k",
      voice: "Mekong Delta Western Vietnamese female voice 25-35 years old, sweet gentle maternal storytelling tone, smiling voice, 100 wpm",
      targetAudience: "Các bà mẹ bỉm sữa, phụ huynh có con nhỏ biếng ăn, khó tiêu",
      context: "Phòng khách gia đình ấm cúng với đồ chơi nhiều màu sắc và nhà bếp dễ thương",
      mascotName: "Bstar Bé Khỏe",
      characterAge: "26-32",
      characterGender: "Vietnamese female",
      femaleAge: "26-32",
      regionAccent: "west",
      pacingWpm: 100,
      customNotes: "Giọng điệu ấm áp, ân cần tình mẫu tử, minh họa 3D dễ thương gần gũi.",
    },
  },
];

const TEMPLATES_STORAGE_KEY = "custom_prompt_templates_v5";
const DEFAULT_TEMPLATE_ID_KEY = "default_selected_template_id";

// Helper to normalize and ensure prompt templates have latest complete rules
function normalizeTemplateData(raw: any, isBuiltIn: boolean = false, templateId?: string) {
  if (isBuiltIn && templateId) {
    const matched = BUILTIN_PROMPT_TEMPLATES.find((b) => b.id === templateId);
    if (matched) {
      return {
        ...matched.data,
      };
    }
  }

  const d = { ...DEFAULT_INPUTS, ...raw };

  // Ensure latest rules are enforced even if loaded from older custom templates
  if (!d.dialoguePromptTemplate || !d.dialoguePromptTemplate.includes("ĐỒNG NHẤT 100% GIỌNG ĐỌC")) {
    d.dialoguePromptTemplate = DEFAULT_DIALOGUE_PROMPT_TEMPLATE;
  }
  if (!d.mandatoryAudioRules || !d.mandatoryAudioRules.includes("ĐỒNG NHẤT 100% GIỚI TÍNH")) {
    d.mandatoryAudioRules = DEFAULT_MANDATORY_AUDIO_RULES;
  }
  if (!d.mandatoryImageRules || !d.mandatoryImageRules.includes("TUYỆT ĐỐI CẤM LỜI THOẠI TRONG PROMPT TẠO ẢNH") || !d.mandatoryImageRules.includes("IMAGE 1") || !d.mandatoryImageRules.includes("STRICT NO-BRAND ON THUMBNAIL RULE")) {
    d.mandatoryImageRules = DEFAULT_MANDATORY_IMAGE_RULES;
  }
  if (!d.mandatoryVideoRules || !d.mandatoryVideoRules.includes("CINEMATIC CAMERA WORK")) {
    d.mandatoryVideoRules = DEFAULT_MANDATORY_VIDEO_RULES;
  }
  if (!d.storyboardPromptTemplate || !d.storyboardPromptTemplate.includes("Vertical Panels")) {
    d.storyboardPromptTemplate = DEFAULT_STORYBOARD_PROMPT_TEMPLATE;
  }
  if (!d.scenePromptTemplate || !d.scenePromptTemplate.includes("No Dialogue on Image") || !d.scenePromptTemplate.includes("Image 1")) {
    d.scenePromptTemplate = DEFAULT_SCENE_PROMPT_TEMPLATE;
  }
  if (!d.imagePromptTemplate) {
    d.imagePromptTemplate = d.scenePromptTemplate;
  }
  if (!d.veoPromptTemplate || !d.veoPromptTemplate.includes("Đồng nhất 100% Giọng đọc")) {
    d.veoPromptTemplate = DEFAULT_VEO_PROMPT_TEMPLATE;
  }
  if (!d.videoPromptTemplate) {
    d.videoPromptTemplate = d.veoPromptTemplate;
  }
  if (!d.thumbnailPromptTemplate || d.thumbnailPromptTemplate.includes("UI Safe Zone: Leave 20%") || !d.thumbnailPromptTemplate.includes("strictly NO brand") || !d.thumbnailPromptTemplate.includes("blank golden shield")) {
    d.thumbnailPromptTemplate = DEFAULT_THUMBNAIL_PROMPT_TEMPLATE;
  }
  if (!d.globalSafetyRules) {
    d.globalSafetyRules = DEFAULT_GLOBAL_SAFETY_RULES;
  }
  if (!d.globalCharacterRules) {
    d.globalCharacterRules = DEFAULT_GLOBAL_CHARACTER_RULES;
  }
  if (!d.customSlangWords) {
    d.customSlangWords = DEFAULT_SLANG_WORDS;
  }
  if (!d.customSafeWords) {
    d.customSafeWords = DEFAULT_SAFE_WORDS;
  }
  if (!d.customPaddingWords) {
    d.customPaddingWords = DEFAULT_PADDING_WORDS;
  }
  if (!d.mascotPrompt) {
    d.mascotPrompt = DEFAULT_MASCOT_PROMPT;
  }

  return d;
}

export function getStoredTemplates(): PromptTemplate[] {
  try {
    let raw = localStorage.getItem(TEMPLATES_STORAGE_KEY);
    if (!raw) {
      // Check legacy keys to migrate custom templates
      raw = localStorage.getItem("custom_prompt_templates_v4") ||
            localStorage.getItem("custom_prompt_templates_v3") ||
            localStorage.getItem("custom_prompt_templates_v2") ||
            localStorage.getItem("custom_prompt_templates");
    }

    if (!raw) {
      return BUILTIN_PROMPT_TEMPLATES;
    }

    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Merge built-in templates with latest definitions and keep custom user templates
      const result: PromptTemplate[] = [];

      // 1. Built-in templates: always use updated latest standard
      BUILTIN_PROMPT_TEMPLATES.forEach((builtin) => {
        const existing = parsed.find((p: PromptTemplate) => p.id === builtin.id);
        result.push({
          ...builtin,
          isDefault: existing ? existing.isDefault : builtin.isDefault,
        });
      });

      // 2. Custom templates created by user
      parsed.forEach((custom: PromptTemplate) => {
        if (!BUILTIN_PROMPT_TEMPLATES.some((b) => b.id === custom.id)) {
          result.push({
            ...custom,
            data: normalizeTemplateData(custom.data, false, custom.id),
          });
        }
      });

      return result;
    }
  } catch (e) {
    console.error("Lỗi khi đọc danh sách template từ localStorage:", e);
  }
  return BUILTIN_PROMPT_TEMPLATES;
}

export function saveStoredTemplates(templates: PromptTemplate[], notify: boolean = true): void {
  try {
    localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(templates));
    if (notify) {
      window.dispatchEvent(new Event("prompt_templates_updated"));
    }
  } catch (e) {
    console.error("Lỗi khi lưu template vào localStorage:", e);
  }
}

export function saveOrUpdateTemplate(template: PromptTemplate): PromptTemplate[] {
  const current = getStoredTemplates();
  const index = current.findIndex((t) => t.id === template.id);
  let updated: PromptTemplate[];

  const timestamp = new Date().toISOString();
  const templateToSave = {
    ...template,
    updatedAt: timestamp,
    data: normalizeTemplateData(template.data, template.isBuiltIn, template.id),
  };

  if (index >= 0) {
    updated = [...current];
    updated[index] = templateToSave;
  } else {
    updated = [
      ...current,
      {
        ...templateToSave,
        createdAt: templateToSave.createdAt || timestamp,
      },
    ];
  }

  saveStoredTemplates(updated);
  return updated;
}

export function deleteStoredTemplate(templateId: string): PromptTemplate[] {
  const current = getStoredTemplates();
  const updated = current.filter((t) => t.id !== templateId);
  const finalList = updated.length > 0 ? updated : BUILTIN_PROMPT_TEMPLATES;
  saveStoredTemplates(finalList);
  return finalList;
}

export function resetToBuiltInTemplates(): PromptTemplate[] {
  saveStoredTemplates(BUILTIN_PROMPT_TEMPLATES);
  return BUILTIN_PROMPT_TEMPLATES;
}

export function getDefaultTemplateId(): string {
  const customDefaultId = localStorage.getItem(DEFAULT_TEMPLATE_ID_KEY);
  if (customDefaultId) return customDefaultId;
  const templates = getStoredTemplates();
  const defaultTpl = templates.find((t) => t.isDefault) || templates[0];
  return defaultTpl ? defaultTpl.id : BUILTIN_PROMPT_TEMPLATES[0].id;
}

export function setDefaultTemplateId(templateId: string): void {
  localStorage.setItem(DEFAULT_TEMPLATE_ID_KEY, templateId);
  const templates = getStoredTemplates();
  const updated = templates.map((t) => ({
    ...t,
    isDefault: t.id === templateId,
  }));
  saveStoredTemplates(updated);
}

export function getTemplateById(templateId: string): PromptTemplate | undefined {
  const templates = getStoredTemplates();
  return templates.find((t) => t.id === templateId);
}
