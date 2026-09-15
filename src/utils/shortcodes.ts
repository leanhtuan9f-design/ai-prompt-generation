import { PromptInputs } from "../types";

export interface ShortcodeDefinition {
  token: string;             // e.g. "[title]"
  altToken: string;          // e.g. "{{title}}"
  key: string;               // "title"
  label: string;             // "Tiêu đề / Chủ đề"
  category: "input" | "character" | "visual" | "voice" | "mascot" | "safety";
  categoryLabel: string;     // "Đầu Vào Kịch Bản", "Nhân Vật & Ngoại Hình", "Visual & Tỷ Lệ", "Giọng Đọc & Âm Thanh", "Mascot & Thương Hiệu", "Quy Tắc & An Toàn"
  description: string;       // "Tiêu đề chủ đề kịch bản (ví dụ: Mẹo xoa dịu trào ngược...)"
  exampleValue: string;      // "3 Mẹo xoa dịu trào ngược dạ dày"
  badgeColor?: string;
}

export const AVAILABLE_SHORTCODES: ShortcodeDefinition[] = [
  // Nhóm 1: Đầu Vào Kịch Bản
  {
    token: "[title]",
    altToken: "{{title}}",
    key: "title",
    label: "Tiêu đề / Chủ đề",
    category: "input",
    categoryLabel: "Đầu Vào Kịch Bản",
    description: "Tiêu đề hoặc chủ đề kịch bản được nhập ở ô số 1",
    exampleValue: "3 Mẹo xoa dịu trào ngược dạ dày ban đêm",
  },
  {
    token: "[coreContent]",
    altToken: "{{coreContent}}",
    key: "coreContent",
    label: "Nội dung cốt lõi",
    category: "input",
    categoryLabel: "Đầu Vào Kịch Bản",
    description: "Nội dung cốt lõi, vấn đề và 3 giải pháp khoa học (ô số 2)",
    exampleValue: "Trào ngược dạ dày, ợ chua do axit; 3 giải pháp ăn uống, thảo mộc Trà Dây",
  },
  {
    token: "[targetAudience]",
    altToken: "{{targetAudience}}",
    key: "targetAudience",
    label: "Khán giả mục tiêu",
    category: "input",
    categoryLabel: "Đầu Vào Kịch Bản",
    description: "Đối tượng người xem, độ tuổi, nhân khẩu học và nỗi đau",
    exampleValue: "Dân văn phòng 25-45 tuổi, thức khuya, stress, hay ợ chua",
  },
  {
    token: "[context]",
    altToken: "{{context}}",
    key: "context",
    label: "Bối cảnh câu chuyện",
    category: "input",
    categoryLabel: "Đầu Vào Kịch Bản",
    description: "Bối cảnh sinh hoạt, không gian quay và ánh sáng",
    exampleValue: "Không gian làm việc ấm cúng, mô phỏng 3D dạ dày",
  },

  // Nhóm 2: Nhân Vật & Ngoại Hình (Character & Actor)
  {
    token: "[characterRules]",
    altToken: "{{characterRules}}",
    key: "characterRules",
    label: "Quy tắc Khóa Nhân Vật",
    category: "character",
    categoryLabel: "Nhân Vật & Ngoại Hình",
    description: "Toàn bộ quy tắc khóa đồng nhất diện mạo, tóc, trang phục, tỷ lệ cơ thể nhân vật",
    exampleValue: "Strict character consistency: 100% identical face, hairstyle, body proportions across all scenes...",
  },
  {
    token: "[characterAge]",
    altToken: "{{characterAge}}",
    key: "characterAge",
    label: "Tuổi nhân vật",
    category: "character",
    categoryLabel: "Nhân Vật & Ngoại Hình",
    description: "Độ tuổi của nhân vật chính (ví dụ: 25-34, 28 tuổi, 30-45)",
    exampleValue: "25-34",
  },
  {
    token: "[characterGender]",
    altToken: "{{characterGender}}",
    key: "characterGender",
    label: "Giới tính nhân vật",
    category: "character",
    categoryLabel: "Nhân Vật & Ngoại Hình",
    description: "Giới tính nhân vật chính (ví dụ: Vietnamese female, Nữ, Nam)",
    exampleValue: "Vietnamese female",
  },
  {
    token: "[characterOutfit]",
    altToken: "{{characterOutfit}}",
    key: "characterOutfit",
    label: "Trang phục Nữ chính",
    category: "character",
    categoryLabel: "Nhân Vật & Ngoại Hình",
    description: "Trang phục khóa cố định: Áo thun trơn màu xanh lá nhạt, thanh lịch",
    exampleValue: "plain light-green casual t-shirt, relaxed fit",
  },
  {
    token: "[characterHair]",
    altToken: "{{characterHair}}",
    key: "characterHair",
    label: "Kiểu tóc Nữ chính",
    category: "character",
    categoryLabel: "Nhân Vật & Ngoại Hình",
    description: "Kiểu tóc khóa cố định: Tóc đen dài buộc nhẹ tự nhiên",
    exampleValue: "long dark hair loosely tied back, natural bangs",
  },
  {
    token: "[characterFace]",
    altToken: "{{characterFace}}",
    key: "characterFace",
    label: "Gương mặt & Biểu cảm",
    category: "character",
    categoryLabel: "Nhân Vật & Ngoại Hình",
    description: "Đặc tả gương mặt 3D Pixar: Mắt to biểu cảm, da mịn sáng tự nhiên, bụng phẳng",
    exampleValue: "3D Pixar expressive big eyes, smooth natural skin tone, slim flat belly",
  },

  // Nhóm 3: Visual & Tỷ Lệ Khung Hình
  {
    token: "[aspectRatio]",
    altToken: "{{aspectRatio}}",
    key: "aspectRatio",
    label: "Tỷ lệ khung hình",
    category: "visual",
    categoryLabel: "Visual & Tỷ Lệ",
    description: "Tỷ lệ video: 9:16 (Dọc Shorts/TikTok) hoặc 16:9 (Ngang Widescreen)",
    exampleValue: "9:16",
  },
  {
    token: "[arOrientation]",
    altToken: "{{arOrientation}}",
    key: "arOrientation",
    label: "Định dạng khung hình",
    category: "visual",
    categoryLabel: "Visual & Tỷ Lệ",
    description: "Mô tả định dạng: vertical portrait 9:16 format hoặc widescreen landscape 16:9 format",
    exampleValue: "vertical portrait 9:16 format",
  },
  {
    token: "[videoStyle]",
    altToken: "{{videoStyle}}",
    key: "videoStyle",
    label: "Style Visual & Ánh sáng",
    category: "visual",
    categoryLabel: "Visual & Tỷ Lệ",
    description: "Đặc tả phong cách 3D Pixar, màu sắc đào, ánh sáng volumetric, render 8K",
    exampleValue: "3D Pixar style, soft peach background, warm cinematic volumetric lighting, 8k",
  },

  // Nhóm 4: Giọng Đọc & Âm Thanh
  {
    token: "[voice]",
    altToken: "{{voice}}",
    key: "voice",
    label: "Đặc tả Giọng Đọc VEO3",
    category: "voice",
    categoryLabel: "Giọng Đọc & Âm Thanh",
    description: "Mô tả chất giọng, độ tuổi, tone giọng, ngữ điệu và tốc độ",
    exampleValue: "Southern Vietnamese Saigon female voice 25-34 years old, gentle warm soothing, 105-110 wpm",
  },
  {
    token: "[regionAccent]",
    altToken: "{{regionAccent}}",
    key: "regionAccent",
    label: "Vùng miền giọng đọc",
    category: "voice",
    categoryLabel: "Giọng Đọc & Âm Thanh",
    description: "Vùng miền: Miền Nam (Sài Gòn), Miền Bắc, Miền Trung, Miền Tây",
    exampleValue: "Miền Nam (Sài Gòn)",
  },
  {
    token: "[pacingWpm]",
    altToken: "{{pacingWpm}}",
    key: "pacingWpm",
    label: "Tốc độ đọc (WPM)",
    category: "voice",
    categoryLabel: "Giọng Đọc & Âm Thanh",
    description: "Tốc độ đọc (từ/phút), ví dụ: 85, 105, 110 wpm",
    exampleValue: "105",
  },

  // Nhóm 5: Mascot & Thương Hiệu
  {
    token: "[mascot]",
    altToken: "{{mascot}}",
    key: "mascot",
    label: "Mascot 3D / Linh vật",
    category: "mascot",
    categoryLabel: "Mascot & Thương Hiệu",
    description: "Toàn bộ đoạn prompt đặc tả Mascot 3D kèm tên thương hiệu trên khiên vàng",
    exampleValue: "Heroic glowing plump golden liquid drop mascot holding a round golden shield engraved '[mascotName]'",
  },
  {
    token: "[mascotName]",
    altToken: "{{mascotName}}",
    key: "mascotName",
    label: "Tên Mascot / Thương hiệu",
    category: "mascot",
    categoryLabel: "Mascot & Thương Hiệu",
    description: "Tên thương hiệu khắc trên khiên vàng của Mascot",
    exampleValue: "Trà Dây Bstar",
  },
  {
    token: "[brand]",
    altToken: "{{brand}}",
    key: "brand",
    label: "Tên Thương Hiệu",
    category: "mascot",
    categoryLabel: "Mascot & Thương Hiệu",
    description: "Tên thương hiệu sản phẩm giải pháp",
    exampleValue: "Trà Dây Bstar",
  },
  {
    token: "[mascotDescription]",
    altToken: "{{mascotDescription}}",
    key: "mascotDescription",
    label: "Đoạn Prompt Mascot 3D",
    category: "mascot",
    categoryLabel: "Mascot & Thương Hiệu",
    description: "Toàn bộ đoạn prompt tạo hình linh vật giọt thảo mộc 3D Pixar cầm khiên",
    exampleValue: "Heroic glowing plump golden liquid drop mascot holding a shield...",
  },
  {
    token: "[mascot_thumbnail]",
    altToken: "{{mascot_thumbnail}}",
    key: "mascot_thumbnail",
    label: "Mascot Thumbnail (Không Logo)",
    category: "mascot",
    categoryLabel: "Mascot & Thương Hiệu",
    description: "Mascot 3D cầm khiên trơn không logo/không chữ, chuyên dụng cho ảnh Thumbnail",
    exampleValue: "Heroic glowing plump golden liquid drop mascot holding a blank golden shield...",
  },

  // Nhóm 6: Quy Tắc & An Toàn
  {
    token: "[safeWords]",
    altToken: "{{safeWords}}",
    key: "safeWords",
    label: "Bảng Từ An Toàn",
    category: "safety",
    categoryLabel: "Quy Tắc & An Toàn",
    description: "Danh sách từ ngữ thay thế an toàn cho từ cấm y tế",
    exampleValue: "CẤM: Thuốc -> Thay bằng: Thảo mộc, Giải pháp tự nhiên...",
  },
  {
    token: "[slangWords]",
    altToken: "{{slangWords}}",
    key: "slangWords",
    label: "Từ lóng vùng miền",
    category: "safety",
    categoryLabel: "Quy Tắc & An Toàn",
    description: "Danh mục từ lóng bản địa tự nhiên theo vùng miền",
    exampleValue: "nghen, nè, trộm vía, rát ruột, êm ru, dữ thần...",
  },
  {
    token: "[paddingWords]",
    altToken: "{{paddingWords}}",
    key: "paddingWords",
    label: "Vùng đệm từ vựng",
    category: "safety",
    categoryLabel: "Quy Tắc & An Toàn",
    description: "Quy tắc đệm từ chuyên môn y học tự nhiên",
    exampleValue: "hỗ trợ xoa dịu, nuôi dưỡng niêm mạc, thanh nhiệt...",
  },
];

export const SHORTCODE_CATEGORIES = [
  { id: "all", label: "Tất cả Shortcode", icon: "✨" },
  { id: "input", label: "Đầu Vào", icon: "📝" },
  { id: "character", label: "Nhân Vật (Character)", icon: "👤" },
  { id: "visual", label: "Visual & Tỷ Lệ", icon: "🎨" },
  { id: "voice", label: "Giọng Đọc", icon: "🎙️" },
  { id: "mascot", label: "Mascot", icon: "🛡️" },
  { id: "safety", label: "An Toàn", icon: "🔒" },
] as const;

/**
 * Đồng bộ hóa triệt để Độ tuổi và Giới tính vào chuỗi Profile Giọng đọc (Voice Prompt)
 * Tự động thay thế các mốc tuổi cũ (25-34, 28-32, v.v.) và giới tính bằng chính xác thông số người dùng chỉ định.
 */
export function syncVoiceProfile(
  rawVoice: string,
  characterAge?: string,
  characterGender?: string
): string {
  if (!rawVoice) return rawVoice;
  let synced = rawVoice;

  const targetAge = (characterAge || "25-34").trim();
  if (targetAge) {
    // 1. Thay thế các token shortcode nếu có
    synced = synced.replace(/\[characterAge\]|\[age\]|\[femaleAge\]|\{\{characterAge\}\}|\{\{age\}\}|\{\{femaleAge\}\}/gi, targetAge);

    // 2. Đồng bộ trong khối Sound: [Gender, Age, ...]
    synced = synced.replace(/(Sound:\s*\[\s*[^,]+,\s*)(?:[0-9]{2}(?:-[0-9]{2})?|\b[0-9]{2}\s*t\b)(,)/gi, `$1${targetAge}$2`);

    // 3. Đồng bộ cụm "same age XX-YY" hoặc "same age XX"
    synced = synced.replace(/same\s+age\s+[0-9]{2}(?:-[0-9]{2})?/gi, `same age ${targetAge}`);

    // 4. Đồng bộ cụm "XX-YY years old" hoặc "XX-YY tuổi"
    synced = synced.replace(/[0-9]{2}-[0-9]{2}\s*(years\s*old|tuổi)/gi, `${targetAge} $1`);
  }

  const targetGender = (characterGender || "").toLowerCase();
  if (targetGender) {
    synced = synced.replace(/\[characterGender\]|\[gender\]|\{\{characterGender\}\}|\{\{gender\}\}/gi, characterGender || "");
    if (targetGender.includes("male") && !targetGender.includes("female")) {
      // Nam
      synced = synced.replace(/\bFemale\b/g, "Male").replace(/\bfemale\b/g, "male");
      synced = synced.replace(/\[Nữ dẫn chuyện/g, "[Nam dẫn chuyện");
    } else if (targetGender.includes("female") || targetGender.includes("nữ")) {
      // Nữ
      synced = synced.replace(/\bMale\b/g, "Female").replace(/\bmale\b/g, "female");
      synced = synced.replace(/\[Nam dẫn chuyện/g, "[Nữ dẫn chuyện");
    }
  }

  return synced;
}

/**
 * Tự động tạo mô tả diện mạo nhân vật (khuôn mặt, tóc, trang phục) chân thực, tinh tế,
 * phù hợp hoàn hảo với Giới tính & Độ tuổi được chọn, loại bỏ hoàn toàn hiện tượng mặt búp bê nhựa / hoạt hình méo mó.
 */
export function getDynamicCharacterProfile(gender: string = "Vietnamese female", age: string = "25-34"): {
  face: string;
  hair: string;
  outfit: string;
} {
  const activeAge = (age || "25-34").trim();
  const lowerGender = (gender || "Vietnamese female").toLowerCase();
  const isMale = (lowerGender.includes("male") && !lowerGender.includes("female")) || lowerGender.includes("nam");
  const isCouple = lowerGender.includes("both") || lowerGender.includes("couple") || lowerGender.includes("cặp");

  // Kiểm tra phân khúc tuổi
  const isSenior = /(?:5[5-9]|[6-9][0-9]|lớn|cao tuổi|senior|ông|bà)/i.test(activeAge);
  const isMiddle = /(?:3[5-9]|4[0-9]|5[0-4]|trung niên|middle)/i.test(activeAge);
  const isYoung = /(?:1[8-9]|2[0-4]|sinh viên|trẻ|teen)/i.test(activeAge);

  if (isCouple) {
    return {
      face: `harmonious pair of authentic Vietnamese man and woman (${activeAge} years old), natural lifelike skin textures, warm expressive eyes, pleasant friendly smiles, refined human facial anatomy (NO plastic doll look, NO uncanny valley caricature)`,
      hair: isSenior
        ? "man with neat silver-flecked short hair, woman with elegant silver-black hair tied in a modest low bun"
        : "man with clean modern short haircut, woman with natural soft shoulder-length dark hair",
      outfit: isSenior
        ? "tasteful traditional linen button-ups and modest warm-toned cardigans"
        : "comfortable coordinating casual linen shirts and modest modern tops in harmonious warm earth tones",
    };
  }

  if (isMale) {
    if (isSenior) {
      return {
        face: `dignified elderly Vietnamese grandfatherly male face (${activeAge} years old), gentle wise eyes with natural laughter lines, warm compassionate smile, healthy lifelike skin texture with realistic age nuances (NO plastic doll face, NO distorted caricature)`,
        hair: "neat silver-grey hair cleanly trimmed, distinguished and well-groomed",
        outfit: "comfortable traditional soft linen button-up shirt or cozy grey cardigan, dignified and relaxed",
      };
    }
    if (isMiddle) {
      return {
        face: `handsome mature Vietnamese male face (${activeAge} years old), dignified confident expression, subtle natural laugh lines around warm intelligent eyes, healthy natural skin tone with realistic fine micro-pores, well-defined jawline (NO plastic doll look, NO exaggerated cartoon bug-eyes)`,
        hair: "neat short dark hair with subtle natural silver highlights at the temples, professional clean cut",
        outfit: "classic dark navy polo shirt or casual breathable linen button-down shirt, neat and tailored fit",
      };
    }
    if (isYoung) {
      return {
        face: `youthful authentic Vietnamese male face (${activeAge} years old), clear healthy skin, bright energetic eyes, friendly approachable smile, natural proportions (NO uncanny doll face)`,
        hair: "stylish modern textured dark haircut, neat and natural",
        outfit: "clean minimalist crewneck t-shirt in muted sage green or crisp white, casual relaxed fit",
      };
    }
    // Default Male (25-34)
    return {
      face: `refined authentic Vietnamese male face (${activeAge} years old), healthy natural skin texture, bright approachable warm eyes, gentle authentic smile, well-groomed handsome look (NO plastic doll look, NO uncanny valley distortion)`,
      hair: "modern neat dark short haircut, natural texture without excessive gel",
      outfit: "minimalist casual light olive or navy crewneck t-shirt, relaxed modern fit, no graphics",
    };
  }

  // Female
  if (isSenior) {
    return {
      face: `graceful elderly Vietnamese grandmotherly female face (${activeAge} years old), kind radiant eyes with soft natural smile lines, maternal comforting expression, realistic healthy skin texture with dignified age details (NO plastic doll look, NO creepy smooth silicone skin)`,
      hair: "neat silver-streaked dark hair softly tied in a low elegant chignon bun",
      outfit: "tasteful modest pastel silk-linen blouse or soft knit cardigan, elegant and comfortable",
    };
  }
  if (isMiddle) {
    return {
      face: `elegant mature Vietnamese female face (${activeAge} years old), warm gentle eyes with subtle natural laugh lines, graceful radiant complexion, maternal comforting smile, refined facial features (NO plastic doll look, NO uncanny bug-eyes, NO exaggerated botox appearance)`,
      hair: "shoulder-length softly styled dark hair with natural volume, tasteful and neat",
      outfit: "comfortable pastel sage or beige linen blouse, modest and flattering relaxed fit",
    };
  }
  if (isYoung) {
    return {
      face: `fresh youthful Vietnamese female face (${activeAge} years old), radiant natural skin with subtle healthy glow, bright expressive eyes, cheerful friendly smile, natural harmonious proportions (NO uncanny doll face, NO bizarre anime eyes)`,
      hair: "natural dark hair in a soft low ponytail with wispy natural bangs",
      outfit: "simple casual pastel t-shirt or modest loose-fit knit top, fresh and youthful",
    };
  }
  // Default Female (25-34)
  return {
    face: `refined authentic Vietnamese female face (${activeAge} years old), natural skin texture with subtle healthy glow, expressive warm intelligent eyes, gentle genuine smile, realistic human facial anatomy (NO uncanny plastic doll look, NO exaggerated cartoon bug-eyes)`,
    hair: "long dark hair loosely styled with natural soft texture and gentle side-swept bangs",
    outfit: "plain light-green casual t-shirt or soft pastel linen top, relaxed comfortable fit, no graphics",
  };
}

/**
 * Replace all shortcode tokens (both [key] and {{key}}) in text with actual values
 */
export function replaceShortcodes(text: string, inputs: Partial<PromptInputs>): string {
  if (!text) return "";

  const ar = inputs.aspectRatio === "16:9" ? "16:9" : "9:16";
  const arOrientation = ar === "16:9" ? "widescreen landscape 16:9 format" : "vertical portrait 9:16 format";
  const brand = (inputs.mascotName || "").trim();
  const brandDisplay = brand || "thảo mộc tự nhiên";
  const regionLabel = inputs.regionAccent === "south"
    ? "Miền Nam (Sài Gòn)"
    : inputs.regionAccent === "north"
    ? "Miền Bắc (Hà Nội)"
    : inputs.regionAccent === "central"
    ? "Miền Trung (Huế/Đà Nẵng)"
    : "Miền Tây";

  const videoStyle = inputs.videoStylePrompt || inputs.style || "3D Pixar Animation, Soft Peach, Cinematic Warm Lighting, Volumetric 8K Render, Fluid Particles";
  const activeAge = inputs.characterAge || inputs.femaleAge || "25-34";
  const activeGender = inputs.characterGender || "Vietnamese female";
  const syncedVoice = syncVoiceProfile(inputs.voice || "", activeAge, activeGender);

  // Sinh động mô tả nhân vật theo giới tính & tuổi nếu chưa được nhập thủ công
  const defaultCharProfile = getDynamicCharacterProfile(activeGender, activeAge);
  const activeFace = inputs.characterFace || defaultCharProfile.face;
  const activeHair = inputs.characterHair || defaultCharProfile.hair;
  const activeOutfit = inputs.characterOutfit || defaultCharProfile.outfit;

  const defaultMascotPrompt = brand
    ? `Heroic glowing plump golden liquid drop mascot holding a round golden shield engraved '${brand}'`
    : `Heroic glowing plump golden liquid drop mascot holding a blank golden shield with botanical relief (no brand text)`;

  const replacements: Record<string, string> = {
    title: inputs.title || "",
    corecontent: inputs.coreContent || "",
    targetaudience: inputs.targetAudience || "",
    context: inputs.context || "",
    // Character shortcodes
    characterrules: inputs.globalCharacterRules || "Strict character consistency across all scenes, lifelike human anatomy (NO plastic doll look)",
    characterage: activeAge,
    character_age: activeAge,
    age: activeAge,
    charactergender: activeGender,
    character_gender: activeGender,
    gender: activeGender,
    femaleage: activeAge, // Backwards-compatible
    characteroutfit: activeOutfit,
    characterhair: activeHair,
    characterface: activeFace,
    // Project & Anti-duplication shortcodes
    projectname: inputs.projectName || "Mặc định",
    project_name: inputs.projectName || "Mặc định",
    antiduplicationrules: inputs.antiDuplicationRules || "",
    anti_duplication_rules: inputs.antiDuplicationRules || "",
    // Visual shortcodes
    aspectratio: ar,
    arorientation: arOrientation,
    videostyle: videoStyle,
    style: videoStyle,
    // Voice shortcodes
    voice: syncedVoice,
    regionaccent: regionLabel,
    pacingwpm: String(inputs.pacingWpm || 105),
    // Mascot shortcodes
    mascot: inputs.mascotPrompt || defaultMascotPrompt,
    mascot_thumbnail: `Heroic glowing plump golden liquid drop mascot wearing a leaf cape, holding a small twig and a blank golden shield with subtle botanical relief (strictly NO brand text, NO logo on shield)`,
    mascotthumbnail: `Heroic glowing plump golden liquid drop mascot wearing a leaf cape, holding a small twig and a blank golden shield with subtle botanical relief (strictly NO brand text, NO logo on shield)`,
    mascot_nobrand: `Heroic glowing plump golden liquid drop mascot wearing a leaf cape, holding a small twig and a blank golden shield with subtle botanical relief (strictly NO brand text, NO logo on shield)`,
    mascotnobrand: `Heroic glowing plump golden liquid drop mascot wearing a leaf cape, holding a small twig and a blank golden shield with subtle botanical relief (strictly NO brand text, NO logo on shield)`,
    mascotname: brandDisplay,
    brand: brandDisplay,
    mascotdescription: inputs.mascotPrompt || defaultMascotPrompt,
    // Safety shortcodes
    safewords: inputs.customSafeWords || "",
    slangwords: inputs.customSlangWords || "",
    paddingwords: inputs.customPaddingWords || "",
  };

  // Replace [key] and {{key}} (case-insensitive)
  let result = text;
  Object.keys(replacements).forEach((k) => {
    const val = replacements[k];
    const regexSquare = new RegExp(`\\[${k}\\]`, "gi");
    const regexCurly = new RegExp(`\\{\\{${k}\\}\\}`, "gi");
    result = result.replace(regexSquare, val).replace(regexCurly, val);
  });

  return result;
}
