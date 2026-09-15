import { PromptInputs } from "../types";
import {
  cleanStep5JsonOutput,
  cleanStep2StoryboardJson,
  cleanStep3VideoPromptsJson,
  cleanStep4ThumbnailJson,
  cleanSingleLineJsonOutput,
  countDialogueScenes,
  extractCleanTextFromPotentialSse,
} from "../utils/jsonCleaner";
import { replaceShortcodes } from "../utils/shortcodes";
import { buildDynamicAntiDuplicationInstruction } from "../utils/projectMemory";
import {
  DEFAULT_INPUTS,
  DEFAULT_MASCOT_PROMPT,
  DEFAULT_GLOBAL_SAFETY_RULES,
  DEFAULT_GLOBAL_CHARACTER_RULES,
  DEFAULT_SLANG_WORDS,
  DEFAULT_SAFE_WORDS,
  DEFAULT_PADDING_WORDS,
  DEFAULT_MANDATORY_IMAGE_RULES,
  DEFAULT_MANDATORY_AUDIO_RULES,
  DEFAULT_MANDATORY_VIDEO_RULES,
  DEFAULT_DIALOGUE_PROMPT_TEMPLATE,
  DEFAULT_IMAGE_PROMPT_TEMPLATE,
  DEFAULT_SCENE_PROMPT_TEMPLATE,
  DEFAULT_VIDEO_PROMPT_TEMPLATE,
  DEFAULT_STORYBOARD_PROMPT_TEMPLATE,
  DEFAULT_THUMBNAIL_PROMPT_TEMPLATE,
} from "../data/constants";

export const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

export const MASTER_SYSTEM_PROMPT = `
Đóng vai trò là một chuyên gia sáng tạo nội dung và AI Cinematic Prompt Engineer hàng đầu. Nhiệm vụ của bạn là tư vấn và viết kịch bản video hoạt hình 3D về chủ đề sức khỏe, tối ưu 100% cho TikTok, YouTube Shorts, Reels và các nền tảng mạng xã hội.

1. [GLOBAL SAFETY & BRAND RULES]
All generated content must remain fully compliant with the advertising, monetization, and community guidelines of major platforms including Facebook, TikTok, YouTube, Google Ads, Instagram, and all mainstream social media ecosystems.
- Strictly Prohibited: graphic gore, blood, exposed organs, disturbing medical imagery, body horror, parasites, infected flesh, realistic surgery visuals, violent injury, shocking fear-based visuals, grotesque anatomy, excessive suffering imagery, self-harm, hateful or sexually suggestive elements, misleading medical claims, scam before/after transformations, unsafe health guarantees.
- Medical Visualization: All anatomy, stomach, inflammation, acid, bacteria, or health-related scenes must remain stylized, symbolic, cinematic, educational, family-friendly, non-graphic. Use ONLY soft glowing symbolic visualization, Pixar-style abstraction, cinematic lighting, clean educational rendering.
- Brand & Reference Rules: Maintain clean premium visual quality, single cinematic shot composition (--ar 9:16), no collage, no thumbnail grids inside images.

2. [GLOBAL CHARACTER CONSISTENCY RULES]
All recurring characters must remain visually IDENTICAL across every scene, frame, image, and shot.
- Mandatory Character Consistency: Maintain the EXACT same face, hairstyle, hair color, facial proportions, age appearance, skin tone, body proportions, clothing, outfit colors, and accessories.
- DO NOT: change clothing, hairstyle, facial structure, age, redesign character, generate alternative outfits, or allow style drift. Characters are LOCKED cinematic assets.
- Visual Continuity: Identical rendering style, animation style, color grading, and lighting logic. Single cinematic shot only (--ar 9:16).

3. QUY TẮC TỪ NGỮ AN TOÀN (SAFE WORDS RULES)
Tuân thủ nghiêm ngặt chính sách nền tảng (TikTok, FB, YT). CẤM sử dụng các từ: thuốc, chữa khỏi, bệnh nhân, điều trị, cam kết... Thay bằng: giải pháp, phục hồi, người dùng, hỗ trợ, xoa dịu, an tâm.

4. QUY TẮC HÌNH ẢNH AN TOÀN (SAFE IMAGES RULES)
- Khóa tỷ lệ (--ar 9:16 hoặc --ar 16:9), phong cách 3D Pixar Animation cao cấp, da mịn sáng tự nhiên, ánh sáng ấm áp điện ảnh (cinematic volumetric lighting), phông nền màu đào dịu ấm (soft peach background) kèm vi hạt phát sáng huyền ảo (magical glowing particles).
- Mô phỏng y khoa trừu tượng dễ thương: Dạ dày, vi khuẩn, axit phải được vẽ cách điệu 3D phát sáng khoa học và thân thiện; TUYỆT ĐỐI KHÔNG dùng hình ảnh ghê rợn hay máu me.

5. QUY TẮC TỪ LÓNG VÙNG MIỀN & CHỐNG BẺ GIỌNG AI
- Vị trí bắt buộc: Mỗi cảnh BẮT BUỘC có ít nhất 2 cụm từ mang sắc thái vùng miền (5 từ đầu câu hoặc giữa câu). Luân phiên 5 nhóm (Cảm thán, Nhấn mạnh, Chuyển ý, Gọi người xem, Câu đệm).
- Quy tắc Vùng đệm (Padding Rule): Kẹp thuật ngữ y khoa vào giữa các hư từ ("mấy cái chất axit này nè", "cái lớp niêm mạc đó...") để làm mềm câu văn.
`;

export interface GenerateStepParams {
  step: number;
  inputs: PromptInputs;
  previousStepsData: any;
  customInstructions?: string;
  provider?: "gemini" | "openrouter" | "custom";
  openRouterModel?: string;
  openRouterWritingModel?: string;
  openRouterImageModel?: string;
  openRouterUseSeparateWritingModel?: boolean;
  openRouterUseSeparateImageModel?: boolean;
  customOpenRouterKey?: string;

  // Custom OpenAI-compatible API parameters
  customApiKey?: string;
  customBaseUrl?: string;
  customModelId?: string;
  customWritingModelId?: string;
  customImageModelId?: string;
  customUseSeparateModels?: boolean;
  customUseSeparateWritingModel?: boolean;
  customUseSeparateImageModel?: boolean;
}

/**
 * Xác định model OpenRouter phù hợp cho từng bước kịch bản
 * - Bước 1 & 2: Model viết kịch bản / lời thoại (Writing Model) nếu bật
 * - Bước 3, 4 & 5: Model tạo prompt hình ảnh & video (Image Model) nếu bật
 */
export function resolveModelForStep(
  step: number,
  fallbackModel?: string,
  writingModel?: string,
  imageModel?: string,
  useWritingSeparate?: boolean,
  useImageSeparate?: boolean
): string {
  const savedMain = fallbackModel || localStorage.getItem("custom_openrouter_model") || "anthropic/claude-3.5-sonnet";
  const savedWriting = writingModel || localStorage.getItem("custom_openrouter_writing_model");
  const savedImage = imageModel || localStorage.getItem("custom_openrouter_image_model");

  const separateWritingEnabled = useWritingSeparate ?? (localStorage.getItem("use_separate_writing_model") === "true" || (localStorage.getItem("use_separate_models") !== "false" && !!savedWriting));
  const separateImageEnabled = useImageSeparate ?? (localStorage.getItem("use_separate_image_model") === "true" || (localStorage.getItem("use_separate_models") !== "false" && !!savedImage));

  // Bước 1 & 2: Viết thoại & phân cảnh Storyboard
  if (step === 1 || step === 2) {
    if (separateWritingEnabled && savedWriting && savedWriting.trim()) {
      return savedWriting.trim();
    }
    return savedMain;
  }

  // Bước 3, 4 & 5: Prompts Video, Thumbnail, JSON
  if (step === 3 || step === 4 || step === 5) {
    if (separateImageEnabled && savedImage && savedImage.trim()) {
      return savedImage.trim();
    }
    return savedMain;
  }

  return savedMain;
}

/**
 * Xây dựng prompt chi tiết cho từng bước kịch bản 3D, liên kết chặt chẽ quy tắc & luồng dữ liệu
 */
export function buildStepPrompt(step: number, inputs: PromptInputs, previousStepsData: any): string {
  const brand = (inputs.mascotName || "").trim();
  const useMascot = inputs.useMascot !== false && brand.length > 0;
  const customMascotDesc = inputs.mascotPrompt 
    ? replaceShortcodes(inputs.mascotPrompt, inputs)
    : brand
    ? `3D Pixar style, a heroic character made of a glowing plump golden liquid drop, confident expression, rosy cheeks. Wearing a green leaf cape with water droplets tied at the neck. Holding a small glowing twig with green leaves in the right hand. Holding a round golden shield in the left hand with clear typography text '[${brand}]' explicitly engraved on the shield. Surrounded by floating magical glowing particles, soft peach background, magical aura, highly detailed.`
    : `3D Pixar style, a heroic character made of a glowing plump golden liquid drop, confident expression, rosy cheeks. Wearing a green leaf cape with water droplets tied at the neck. Holding a small glowing twig with green leaves in the right hand. Holding a round blank golden shield with botanical relief (no text). Surrounded by floating magical glowing particles, soft peach background, magical aura, highly detailed.`;

  const mascotInstruction = useMascot
    ? `SỬ DỤNG MASCOT 3D:\n- Tên Mascot / Khắc trên khiên: ${brand}\n- Đặc tả Mascot: ${customMascotDesc}`
    : brand
    ? `SỬ DỤNG MASCOT 3D:\n- Tên Mascot: ${brand}\n- Đặc tả: ${customMascotDesc}`
    : `KHÔNG BẮT BUỘC KHẮC TÊN THƯƠNG HIỆU CỐ ĐỊNH TRÊN KHIÊN (Sử dụng biểu tượng giọt thảo mộc tự nhiên hoặc khiên sinh học bảo vệ niêm mạc).`;

  const customSlangInstruction = inputs.customSlangWords
    ? `\nDANH MỤC TỪ LÓNG VÙNG MIỀN ÁP DỤNG:\n${replaceShortcodes(inputs.customSlangWords, inputs)}`
    : "";

  const customSafeWordsInstruction = inputs.customSafeWords
    ? `\nQUY TẮC TỪ CẤM & SAFE WORDS:\n${replaceShortcodes(inputs.customSafeWords, inputs)}`
    : "";

  const customPaddingInstruction = inputs.customPaddingWords
    ? `\nQUY TẮC ĐỆM TỪ CHUYÊN MÔN (PADDING WORDS):\n${replaceShortcodes(inputs.customPaddingWords, inputs)}`
    : "";

  const globalSafetyRules = replaceShortcodes(inputs.globalSafetyRules || DEFAULT_GLOBAL_SAFETY_RULES, inputs);
  const globalCharacterRules = replaceShortcodes(inputs.globalCharacterRules || DEFAULT_GLOBAL_CHARACTER_RULES, inputs);
  const mandatoryImageRules = replaceShortcodes(inputs.mandatoryImageRules || DEFAULT_MANDATORY_IMAGE_RULES, inputs);
  const mandatoryAudioRules = replaceShortcodes(inputs.mandatoryAudioRules || DEFAULT_MANDATORY_AUDIO_RULES, inputs);
  const mandatoryVideoRules = replaceShortcodes(inputs.mandatoryVideoRules || DEFAULT_MANDATORY_VIDEO_RULES, inputs);

  const activeVideoStyle = inputs.videoStylePrompt || inputs.style || "3D Pixar Animation, Soft Peach, Cinematic Warm Lighting, Volumetric 8K Render, Fluid Particles";
  const activeAr = inputs.aspectRatio === "16:9" ? "16:9" : "9:16";
  const arOrientation = activeAr === "16:9" ? "widescreen landscape 16:9 format" : "vertical portrait 9:16 format";
  const arStoryboardPanels = activeAr === "16:9" ? "horizontal widescreen 16:9 panels" : "vertical portrait 9:16 panels";

  const topMandatoryRulesHeader = `
================================================================================
🚨 QUY TẮC BẮT BUỘC CẤP CAO NHẤT (HIGHEST PRIORITY HARD CONSTRAINTS) - TUYỆT ĐỐI PHẢI TUÂN THỦ 100% 🚨

1. [GLOBAL SAFETY & BRAND RULES]:
${globalSafetyRules}

2. [GLOBAL CHARACTER CONSISTENCY RULES]:
${globalCharacterRules}

3. QUY TẮC BẮT BUỘC VỀ HÌNH ẢNH & THỊ GIÁC (MANDATORY IMAGE RULES / SAFE IMAGES):
${mandatoryImageRules}

4. QUY TẮC BẮT BUỘC VỀ ÂM THANH & GIỌNG ĐỌC (MANDATORY AUDIO & VOICE RULES):
${mandatoryAudioRules}

5. QUY TẮC BẮT BUỘC VỀ VIDEO & CHUYỂN ĐỘNG (MANDATORY VIDEO & MOTION RULES):
${mandatoryVideoRules}
================================================================================
`;

  if (step === 1) {
    const rawDialogueTemplate = inputs.dialoguePromptTemplate || DEFAULT_DIALOGUE_PROMPT_TEMPLATE;
    const formattedDialogueTemplate = replaceShortcodes(rawDialogueTemplate, inputs);
    const activeProject = inputs.projectName || localStorage.getItem("prompt_studio_active_project_name") || "Trà Dây Bstar";
    const antiDuplicationInstruction = inputs.antiDuplicationRules || buildDynamicAntiDuplicationInstruction(activeProject, inputs.title);

    return `
${topMandatoryRulesHeader}

${antiDuplicationInstruction}

Thực hiện BƯỚC 1: XUẤT LỜI THOẠI & GIẢI THÍCH CHIẾN LƯỢC KỊCH BẢN.

THÔNG TIN ĐẦU VÀO (INPUT PARAMETERS - BẮT BUỘC KHÓA 100% VÀ ĐỒNG NHẤT XUYÊN SUỐT):
- Dự án / Chiến dịch: ${activeProject}
- Tiêu đề / Chủ đề: ${inputs.title || "Giải pháp chăm sóc dạ dày tự nhiên"}
- Nội dung cốt lõi: ${inputs.coreContent || "Phân tích khoa học nguyên nhân và giải pháp thói quen, dinh dưỡng, thảo mộc tự nhiên lành tính"}
- Tỷ lệ khung hình: ${activeAr} (${arOrientation})
- Style: ${activeVideoStyle}
- Nhân vật chính: ${inputs.characterGender || "Vietnamese female"} (${inputs.characterAge || "25-34"} tuổi)
- Giọng đọc: ${inputs.voice || "Southern Vietnamese Saigon female voice 25-34 years old, gentle warm soothing tone, 105-110 wpm"}
- Đối tượng người xem (Target Audience): ${inputs.targetAudience || "Người quan tâm đến chăm sóc sức khỏe và dạ dày"}
- Bối cảnh: ${inputs.context || "Không gian sinh hoạt gia đình ấm cúng, mô phỏng 3D Pixar trực quan sinh động"}
- Cấu hình Mascot: ${mascotInstruction}
${customSlangInstruction}
${customSafeWordsInstruction}
${customPaddingInstruction}

CẤU TRÚC PROMPT TẠO HỘI THOẠI & QUY TẮC PHÂN CẢNH ÁP DỤNG:
${formattedDialogueTemplate}

YÊU CẦU CỤ THỂ BƯỚC 1:
1. Tạo kịch bản phân cảnh chi tiết tuân thủ cấu trúc hội thoại trên (5 cảnh chuẩn Problem - Pain - Solution 1, 2, 3).
2. NGUYÊN TẮC CHÍNH XÁC BỆNH LÝ & ĐÚNG NỖI ĐAU ĐỐI TƯỢNG (PATHOLOGY & CLINICAL ACCURACY MANDATE):
   - AI BẮT BUỘC phân biệt chính xác cơ chế và triệu chứng theo đúng Tiêu đề ("${inputs.title || ""}") và Đối tượng ("${inputs.targetAudience || ""}"):
     * NẾU CHỦ ĐỀ LÀ VIÊM DẠ DÀY / VIÊM LOÉT MÃN TÍNH TÁI PHÁT (Gastritis & Peptic Ulcers):
       + Triệu chứng & Nỗi đau: Đau rát cồn cào, đau âm ỉ, quặn thắt vùng thượng vị (ngay chấn thủy/dưới ức), xót ruột khó chịu khi đói hoặc sau ăn, đầy trướng bụng, tái phát dai dẳng nhiều năm khiến người trung niên (45-55 tuổi) mệt mỏi, mất ngủ.
       + Cơ chế khoa học: Mất cân bằng giữa yếu tố tấn công (axit dư thừa, vi khuẩn HP, stress lo âu, ăn uống thất thường) và yếu tố bảo vệ (lớp màng nhầy niêm mạc bị bào mòn, ổ viêm loét tổn thương không kịp phục hồi).
       + Giải pháp: Sinh hoạt điều độ, kiềm tính thức ăn, và dùng thảo mộc tự nhiên giàu flavonoid/tanin (như Trà Dây) hỗ trợ làm lành ổ viêm và tái tạo màng niêm mạc bảo vệ.
       + TUYỆT ĐỐI KHÔNG: Nhầm lẫn sang cơ chế giãn van cuống bao tử hay ợ chua trào ngược lên thực quản/họng nếu đề bài không yêu cầu trào ngược (GERD).
     * NẾU CHỦ ĐỀ LÀ TRÀO NGƯỢC DẠ DÀY THỰC QUẢN (GERD): Mới phân tích cơ chế ợ chua, ợ nóng, trào ngược axit lên cổ họng do giãn cơ vòng thực quản (van tâm vị).
3. RÀNG BUỘC ĐỒNG BỘ GIỌNG ĐỌC & LỜI THOẠI XUYÊN SUỐT (STRICT VOICE SYNCHRONIZATION & NATURAL CONVERSATIONAL FLOW):
   - LỜI THOẠI TỰ NHIÊN, TRÔI CHẢY, ĐÚNG CÚ PHÁP ĐÀM THOẠI TIẾNG VIỆT:
     * Lời thoại phải tự nhiên, mượt mà, chân thật như người thật đang tâm sự chia sẻ kinh nghiệm sống.
     * TUYỆT ĐỐI CẤM gượng ép chèn từ ngữ lạ hoặc ghép cụm từ vô nghĩa vào câu làm gãy ngữ pháp (ví dụ: TUYỆT ĐỐI KHÔNG ghép 'dữ dằn dữ ta' vào giữa câu khuyên nhủ như 'Đừng ăn cay nóng dữ dằn dữ ta').
     * Trợ từ và ngữ điệu vùng miền (như 'nè', 'nghen', 'nha', 'đó', 'coi bộ', 'êm ru', 'nhẹ nhõm', 'nhé', 'chuẩn bài', 'các bác') phải được dùng mềm mại, đúng ngữ cảnh như gia vị tự nhiên, giúp câu thoại gần gũi, ấm áp và truyền cảm.
   - KHÓA PROFILE GIỌNG ĐỌC & DANH TÍNH 100%:
     * Chỉ định rõ Người nói (Speaker) cho từng phân đoạn/câu thoại.
     * Kịch bản 1 người nói (Độc thoại/Dẫn chuyện): Khóa DUY NHẤT 1 giọng đọc đồng bộ 100% với nhân vật/người dẫn chuyện (${inputs.characterGender || "Vietnamese female"} ${inputs.characterAge || "25-34"} tuổi theo cấu hình: "${inputs.voice || "Southern Vietnamese Saigon female voice 25-34 years old"}"). Tuyệt đối CẤM lệch giới tính, lệch độ tuổi hoặc lệch khẩu âm vùng miền giữa các cảnh.
     * Kịch bản Đối thoại (2 nhân vật trở lên): Mỗi nhân vật sở hữu 1 Profile giọng đọc cố định riêng biệt khớp với giới tính, độ tuổi và vai trò (thoại của nhân vật nào dùng đúng profile giọng nhân vật đó, không dùng chéo giọng).
   - ĐỒNG BỘ BIẾN ĐIỆU CẢM XÚC (EMOTIONAL MODULATION WITHOUT VOCAL DRIFT):
     * Cảm xúc nhân vật chuyển biến tự nhiên theo từng phân cảnh (Cảnh 1: trăn trở/đồng cảm -> Cảnh 2: điềm tĩnh/khoa học -> Cảnh 3-4: ấm áp/khích lệ -> Cảnh 5: tự tin/an tâm).
     * BẮT BUỘC giữ nguyên 100% danh tính giọng đọc (vẫn cùng một người nói, cùng âm sắc timbre, cùng âm hưởng resonance, cùng độ tuổi, cùng khẩu âm vùng miền).
   - ĐỒNG BỘ NGÔI XƯNG & ĐẠI TỪ NHÂN XƯNG: Khóa duy nhất 1 cặp đại từ nhân xưng từ Cảnh 1 đến Cảnh cuối (tuyệt đối không nhảy ngôi xưng lộn xộn giữa các cảnh).
   - THÍCH ỨNG ĐỘNG NGÔN TỪ THEO ĐỐI TƯỢNG VÀ ĐỘ TUỔI (DYNAMIC AUDIENCE & SOCIO-LINGUISTIC ADAPTATION):
     * Phân tích sâu ma trận: Nhân vật chính (${inputs.characterGender || "Vietnamese female"}, ${inputs.characterAge || "25-34"} tuổi), Đối tượng người xem ("${inputs.targetAudience || ""}") và Vùng miền ("${inputs.regionAccent || "south"}") để tự động điều chỉnh đại từ nhân xưng, từ cảm thán, thuật ngữ và sắc thái phù hợp:
     * Đảm bảo tính chân thực và đồng điệu thế hệ: Lời thoại phải khớp chính xác với lứa tuổi của nhân vật và đối tượng người xem (dân văn phòng / người trưởng thành 25-45 tuổi xưng 'mình - các bạn / cả nhà mình / chị em mình'; lời văn văn minh, đồng cảm, ấm áp, đáng tin cậy).
     * Duy trì tính tự nhiên, gần gũi, đồng cảm và thuyết phục theo đúng phong cách đời sống của đối tượng mục tiêu.
   - ĐỘ DÀI & NHỊP ĐỌC: Tối đa 18-26 từ/cảnh (tối đa 28 từ), nhịp đọc 95-110 WPM, vừa vặn khung hình 4-8s kèm nhịp ngắt 0.2s - 0.5s.
   - Áp dụng triệt để Quy tắc vùng đệm (Padding rule) cho các từ chuyên môn một cách mộc mạc, dễ hiểu.
   - Tuyệt đối tuân thủ Safe Words (Không dùng thuốc, chữa khỏi, bệnh nhân...).
3. Bảng phân cảnh:
   Xuất dạng Markdown Table gồm 5 cột chuẩn (hỗ trợ phân vai linh hoạt):
   | Từ lóng vùng miền | Phân đoạn | Người nói (Speaker) | Bối cảnh / Hành động | Lời thoại |
4. Xuất Voice Specification chuẩn hóa cho từng Speaker (để dùng trực tiếp cho TTS/AI Voice):
   [Tên Speaker]: Sound: [Gender, Age, Accent, Base Pacing WPM, Pitch/Resonance]. Voice: consistent [Primary Tone] throughout all segments — naturally shifting emotional inflections across scenes (Scene 1 -> Scene 5) WITHOUT changing vocal identity.
5. GIẢI THÍCH CHIẾN LƯỢC KỊCH BẢN (BẮT BUỘC ĐỒNG NHẤT 100% VỚI DỮ LIỆU ĐẦU VÀO ĐÃ CUNG CẤP):
   - Mục 1. Đối tượng mục tiêu (Target Audience): Trích dẫn CHÍNH XÁC đối tượng người dùng đã nhập ("${inputs.targetAudience || ""}") và độ tuổi ${inputs.characterAge || "25-34"}. Phân tích sâu tâm lý, hành vi, bối cảnh sinh hoạt và nỗi đau thực tế của đúng nhóm đối tượng này. TUYỆT ĐỐI KHÔNG TỰ ĐỘNG THAY THẾ bằng đối tượng mặc định.
   - Mục 2. Điểm chạm tâm lý (Psychological Triggers):
     * Đồng cảm sâu sắc (Empathy): Tái hiện chính xác cảm giác và nỗi đau gắn liền với chủ đề "${inputs.title || ""}" và đối tượng "${inputs.targetAudience || ""}".
     * Minh bạch khoa học (Logic): Phân tích nguyên nhân và cơ chế khoa học liên quan trực tiếp đến chủ đề "${inputs.title || ""}".
     * Giải pháp khả thi (Actionable Hope): Giải pháp thói quen và giải pháp thảo mộc thiên nhiên an toàn, bền vững.
   - Mục 3. Kỹ thuật Neo hình ảnh (Visual Anchoring):
     * Tone màu & Ánh sáng: Phù hợp phong cách thị giác "${activeVideoStyle}".
     * Biểu tượng Mascot / Thảo mộc: ${brand ? `Khớp linh vật Mascot mang khiên [${brand}]` : "Biểu tượng giọt thảo mộc tự nhiên và khiên sinh học bảo vệ niêm mạc"}.
6. Kiểm tra chéo (Self-check list) xác nhận tuân thủ đầy đủ.
7. Câu hỏi kết thúc: "Bạn có duyệt phần lời thoại này không để tôi tiến hành tạo Prompt Ảnh Storyboard (Bước 2)?"

Hãy trả về kết quả định dạng rõ ràng, chuyên nghiệp.
`;
  } else if (step === 2) {
    const rawStoryboardTemplate = inputs.storyboardPromptTemplate || inputs.imagePromptTemplate || DEFAULT_STORYBOARD_PROMPT_TEMPLATE;
    const formattedStoryboardTemplate = replaceShortcodes(rawStoryboardTemplate, inputs);
    const dialogueCount = countDialogueScenes(previousStepsData?.step1);
    const panelCount = dialogueCount + 1;

    return `
${topMandatoryRulesHeader}

Thực hiện BƯỚC 2: TẠO PROMPT ẢNH STORYBOARD "STOP THE SCROLL" (LƯỚI PANELS ẢNH NGUỒN ${activeAr}).

DỰA TRÊN THÔNG TIN VÀ LỜI THOẠI BƯỚC 1 ĐÃ DUYỆT:
- Lời thoại và phân cảnh chi tiết Bước 1: ${JSON.stringify(previousStepsData?.step1 || "Kịch bản phân cảnh")}
- Cấu hình Mascot: ${mascotInstruction}
- Video & Visual Style: ${activeVideoStyle}
- Tỷ lệ khung hình: --ar ${activeAr} (${arOrientation})

CẤU TRÚC TEMPLATE PROMPT STORYBOARD ÁP DỤNG:
${formattedStoryboardTemplate}

YÊU CẦU BƯỚC 2 (QUY TẮC BẮT BUỘC ${panelCount} PANELS ẢNH & BỐI CẢNH SỐNG ĐỘNG CÓ CHIỀU SÂU):
Viết 1 Prompt Tiếng Anh duy nhất tạo Ảnh Storyboard tổng thể (ChatGPT-2 / DALL-E / Midjourney). Tỷ lệ --ar ${activeAr}.
Đảm bảo:
- ${activeVideoStyle} storyboard in one single master image, perfectly divided into a grid of exactly ${panelCount} ${arStoryboardPanels} (strictly --ar ${activeAr}).
- QUY TẮC SỐ LƯỢNG ẢNH: Vì Bước 1 có ${dialogueCount} phân đoạn lời thoại nên Storyboard BẮT BUỘC chia lưới đúng ${panelCount} panels ảnh (Panel 1 đến Panel ${panelCount}) để làm ảnh nguồn nối cặp (1->2, 2->3, ..., ${dialogueCount}->${panelCount}) cho ${dialogueCount} cảnh video.
- LOCKED CHARACTERS: ${inputs.characterGender || "Vietnamese female"} ${inputs.characterAge || inputs.femaleAge || "25-34"} in ${inputs.characterOutfit || "casual outfit"}${useMascot ? (brand ? ` & Heroic glowing mascot holding shield engraved '${brand}'` : ` & Heroic glowing mascot holding natural botanical shield (no text)`) : `. (NO mascot character)`}. Natural lifelike human anatomy (NO plastic doll face, NO uncanny bug-eyes).
- LIVED-IN REALISTIC SETTINGS (Tuyệt đối CẤM phông nền trơn studio vô hồn):
  * Mọi phân cảnh BẮT BUỘC phải có bối cảnh môi trường sống động, chân thực, có chiều sâu không gian (architectural depth, natural window light, tangible furniture, realistic room props, layered background) bám sát nội dung kịch bản và bối cảnh '${inputs.context || "không gian sống thực tế"}'.
  * Phác họa tuần tự từng Panel (Panel 1 đến Panel ${panelCount}) bám sát mạch phát triển của kịch bản đã tạo ở Bước 1.
- Strict rules: No style drift, high environmental detail.

ĐỊNH DẠNG XUẤT:
BẮT BUỘC xuất ra JSON format dạng 1 mảng duy nhất nằm trọn vẹn trên 1 hàng (single line JSON).
Ví dụ:
[{"storyboard_prompt": "${activeVideoStyle} storyboard in one single image, perfectly divided into a grid of ${panelCount} ${arStoryboardPanels} with rich lived-in environmental depth and architectural continuity... --ar ${activeAr}"}]

Sau đó thêm câu hỏi: "Bạn có duyệt Prompt Storyboard này không để tôi xuất file JSON kịch bản tổng hợp (Bước 3)?"
`;
  } else if (step === 3) {
    const rawSceneTemplate = inputs.scenePromptTemplate || inputs.videoPromptTemplate || DEFAULT_SCENE_PROMPT_TEMPLATE;
    const formattedSceneTemplate = replaceShortcodes(rawSceneTemplate, inputs);
    const dialogueCount = countDialogueScenes(previousStepsData?.step1);
    const imageCount = dialogueCount + 1;

    return `
${topMandatoryRulesHeader}

Thực hiện BƯỚC 3: TẠO BỘ PROMPT ẢNH ĐƠN (IMAGE OF SENCES: ĐÚNG ${imageCount} ẢNH ĐƠN LẺ = N+1 TỪ IMAGE 1 ĐẾN IMAGE ${imageCount}).

DỰA TRÊN DỮ LIỆU BƯỚC 1 VÀ BƯỚC 2:
- Dữ liệu các cảnh lời thoại Bước 1: ${JSON.stringify(previousStepsData?.step1 || "Kịch bản lời thoại")}
- Dữ liệu Storyboard Bước 2 (NGUỒN THỊ GIÁC GỐC): ${JSON.stringify(previousStepsData?.step2 || "")}
- Cấu hình Mascot: ${mascotInstruction}
- Visual Style: ${activeVideoStyle}
- Tỷ lệ khung hình: --ar ${activeAr} (${arOrientation})

CẤU TRÚC TEMPLATE PROMPT ÁP DỤNG:
${formattedSceneTemplate}

🚨 NGUYÊN TẮC TRÍCH XUẤT ĐỘNG TỪ STORYBOARD (DYNAMIC STORYBOARD-TO-IMAGE PARSING):
1. TRÍCH XUẤT 1:1 TỪ PROMPT STORYBOARD BƯỚC 2:
   - Đọc và phân tích kỹ toàn bộ nội dung chuỗi Prompt Storyboard Bước 2 ở trên.
   - Nhận diện toàn bộ danh sách các Panel (Panel 1, Panel 2, ..., Panel K) được miêu tả trong Storyboard Bước 2.
   - Với mỗi Panel k: Chuyển đổi mô tả của Panel k đó thành 1 prompt ảnh đơn lẻ 8K hoàn chỉnh cho "Image k", giữ nguyên 100% bối cảnh không gian, ánh sáng, góc máy, nhân vật, đạo cụ và không khí được mô tả trong Panel k của Storyboard.
   - Nếu Storyboard được cập nhật hoặc có bất kỳ thay đổi nào (về địa điểm, phòng ốc, props, chủ đề), các Image Prompts BẮT BUỘC tự động phản ánh và đồng bộ chính xác theo các Panel mới trong Storyboard đó mà KHÔNG ĐƯỢC áp đặt bất kỳ bối cảnh cố định nào khác.
2. ĐỊNH DANH CHUẨN XÁC "IMAGE 1", "IMAGE 2" ĐẾN "IMAGE ${imageCount}":
   - BẮT BUỘC đặt tên từng ảnh là "Image 1", "Image 2", ..., "Image ${imageCount}" tương ứng với từng Panel của Storyboard.
   - TUYỆT ĐỐI KHÔNG dùng "Scene 1", "Scene 2" cho ảnh tĩnh để tránh hiểu nhầm với Phân cảnh Video (Video Scenes ở Bước 5).
3. TUYỆT ĐỐI CẤM LỜI THOẠI TRONG CHUỖI PROMPT TẠO ẢNH:
   - Tuyệt đối CẤM kèm '(Lời thoại: ...)', phụ đề, bong bóng thoại hay câu thoại tiếng Việt nào vào chuỗi prompt tạo ảnh.
   - Chuỗi prompt chỉ chứa duy nhất đoạn văn mô tả thị giác điện ảnh bằng Tiếng Anh (Visual Description). Lời thoại chỉ để ở trường 'dialogue' riêng biệt!
4. THAM SỐ MIDJOURNEY / FLUX ĐẶT Ở CUỐI CÙNG:
   - Chuỗi prompt kết thúc bằng: '--ar ${activeAr} --v 6.1 --style raw'. Không chèn '--ar' ở giữa câu.

YÊU CẦU ĐẦU RA BƯỚC 3:
1. Viết Prompt Tiếng Anh tạo đúng ${imageCount} ẢNH ĐƠN LẺ (Image 1 đến Image ${imageCount}) trích xuất trực tiếp từ các Panel tương ứng trong Storyboard.
2. Tối ưu ảnh đơn lẻ sắc nét 8K cho Midjourney / DALL-E / Flux, ${activeVideoStyle}, --ar ${activeAr} --v 6.1 --style raw.
3. BẮT BUỘC ĐỊNH DẠNG ĐẦU RA LÀ MỘT MẢNG JSON (JSON ARRAY) GỒM ĐÚNG ${imageCount} OBJECTS (Image 1 đến Image ${imageCount}):
[
  {
    "image": 1,
    "image_name": "Image 1",
    "scene": 1,
    "type": "image_prompt",
    "prompt": "${activeVideoStyle}, single full-screen ${arOrientation}, [Faithful extraction of setting, character state with lifelike human anatomy, props and lighting from Panel 1 of Storyboard]... --ar ${activeAr} --v 6.1 --style raw",
    "dialogue": "Lời thoại cảnh 1 (để riêng tại đây)..."
  },
  ...
  {
    "image": ${imageCount},
    "image_name": "Image ${imageCount}",
    "scene": ${imageCount},
    "type": "image_prompt",
    "prompt": "${activeVideoStyle}, single full-screen ${arOrientation}, [Faithful extraction of setting, character state with lifelike human anatomy, props and lighting from Panel ${imageCount} of Storyboard]... --ar ${activeAr} --v 6.1 --style raw",
    "dialogue": "Ảnh chốt kết CTA & thương hiệu"
  }
]
`;
  } else if (step === 4) {
    const rawThumbnailTemplate = inputs.thumbnailPromptTemplate || DEFAULT_THUMBNAIL_PROMPT_TEMPLATE;
    const formattedThumbnailTemplate = replaceShortcodes(rawThumbnailTemplate, inputs);

    return `
${topMandatoryRulesHeader}

Thực hiện BƯỚC 4: TẠO PROMPT ẢNH THUMBNAIL "STOP THE SCROLL" (SẠCH 100%, KHÔNG RÁC TỪ NGỮ).

DỰA TRÊN NỘI DUNG HOOK & ĐIỂM CHẠM TÂM LÝ BƯỚC 1:
- Chủ đề: ${inputs.title || "Giải pháp chăm sóc sức khỏe tự nhiên"}
- Dữ liệu Hook & Giải pháp Bước 1: ${JSON.stringify(previousStepsData?.step1 || "Hook & Solution")}
- Cấu hình Mascot: ${mascotInstruction}
- Visual Style: ${activeVideoStyle}
- Tỷ lệ khung hình: --ar ${activeAr} (${arOrientation})

CẤU TRÚC TEMPLATE THUMBNAIL MẪU ÁP DỤNG:
${formattedThumbnailTemplate}

YÊU CẦU BƯỚC 4:
1. Viết 1 Prompt Tiếng Anh tạo Ảnh Bìa / Thumbnail tỉ lệ --ar ${activeAr} --v 6.1 theo cấu trúc Thumbnail Template.
2. Thị giác: Độ tương phản màu sắc cực mạnh (Ultra high visual contrast), giữ chân người xem ngay lập tức (Stop-the-scroll).
3. Text: Câu text ngắn gọn TỐI ĐA 5 TỪ (ví dụ 'ÊM DẠ DÀY NGAY'). Mô tả trong prompt: "Clean, bold 3D Vietnamese typography centered vertically reading: 'ÊM DẠ DÀY NGAY' (the ONLY text on the thumbnail; strictly NO brand name or commercial logo)".
4. QUY TẮC CẤM XUẤT HIỆN BRAND TRÊN THUMBNAIL (STRICT NO-BRAND ON THUMBNAIL):
   - TUYỆT ĐỐI KHÔNG xuất hiện tên thương hiệu, logo, hoặc nhãn mác sản phẩm lên Thumbnail (kể cả trên khiên mascot, trang phục, chai lọ hay bao bì).
   - Mascot trên Thumbnail (nếu có): Chỉ cầm khiên vàng trơn hoặc khiên chạm nổi họa tiết thảo mộc vàng óng (blank golden shield with subtle botanical relief, strictly NO text, NO logo, NO brand typography on shield or props).
   - Chữ DUY NHẤT trên Thumbnail là câu Hook 3D giật tít tiếng Việt (tối đa 5 từ), TUYỆT ĐỐI KHÔNG CHỨA TÊN BRAND.
5. QUY TẮC PROMPT SẠCH 100% (ZERO ARTIFACTS):
   - TUYỆT ĐỐI KHÔNG chèn tên file (như image_0.png, image_1.png, image_4.png) hay câu tham chiếu '(as defined in image_4.png)'. Hãy miêu tả trực quan nhân vật và Mascot (heroic glowing plump golden droplet mascot holding a blank golden shield).
   - TUYỆT ĐỐI KHÔNG chèn '--ar ${activeAr}' vào giữa câu văn. Tham số '--ar ${activeAr} --v 6.1' BẮT BUỘC chỉ đặt ở CUỐI CÙNG của chuỗi prompt.
   - TUYỆT ĐỐI KHÔNG đưa câu lệnh meta như '(leaving 20% margins top and bottom)' vào nội dung visual prompt.
6. ĐỊNH DẠNG: 1 mảng JSON duy nhất nằm trọn vẹn trên 1 hàng (Single line JSON).
Ví dụ:
[{"prompt": "A vibrant 3D Pixar-style vertical portrait thumbnail for a health video, featuring ultra-high visual contrast to stop the scroll. The central focus is the Vietnamese female character (25-34 years old, long dark hair loosely tied back, plain light-green t-shirt) smiling brightly and looking healthy and relieved, holding glowing golden herbal leaves. Standing proudly next to her is the 3D Mascot character (a heroic glowing plump golden liquid drop, green leaf cape, holding a small glowing twig and a blank golden shield with subtle leaf relief, strictly NO brand text, NO logo on shield). The background is a soft peach gradient with contrasting emerald green and warm golden glowing magical aura and floating particles, creating a powerful visual pop. Clean, bold 3D Vietnamese typography centered vertically reading: 'ÊM DẠ DÀY NGAY' (strictly the ONLY text on image; NO brand name). The overall lighting is warm, cinematic, and inviting, with detailed textures and vibrant healing colors. The render is smooth 8K, optimized for social media platforms. --ar ${activeAr} --v 6.1", "thumbnail_prompt": "...", "aspect_ratio": "${activeAr}"}]

Sau đó kết thúc bằng câu hỏi: "Bạn có duyệt Prompt Thumbnail này không để tôi xuất file JSON kịch bản tổng hợp (Bước 5)?"
`;
  } else if (step === 5) {
    const dialogueCount = countDialogueScenes(previousStepsData?.step1);
    const rawVeoTpl = inputs.veoPromptTemplate || inputs.videoPromptTemplate || DEFAULT_VIDEO_PROMPT_TEMPLATE;
    const customVeoTemplateInstruction = rawVeoTpl
      ? `\nCẤU TRÚC MẪU PROMPT VEO / VIDEO ĐƯỢC CHỈ ĐỊNH:\n${replaceShortcodes(rawVeoTpl, inputs)}\n`
      : "";

    return `
${topMandatoryRulesHeader}

Thực hiện BƯỚC 5: TẠO PROMPT VEO 3 & XUẤT KỊCH BẢN JSON ĐỂ TỰ ĐỘNG HÓA (ĐÚNG ${dialogueCount} SCENES = ${dialogueCount} PHÂN ĐOẠN LỜI THOẠI BƯỚC 1).
${customVeoTemplateInstruction}
DỰA TRÊN TẤT CẢ CÁC BƯỚC TRƯỚC:
- Dữ liệu Lời thoại Bước 1: ${JSON.stringify(previousStepsData?.step1 || {})}
- Dữ liệu Bộ Ảnh Bước 3 (${dialogueCount + 1} ảnh nguồn): ${JSON.stringify(previousStepsData?.step3 || "N+1 keyframes")}
- Nhân vật chính: ${inputs.characterGender || "Vietnamese female"} (${inputs.characterAge || "25-34"} tuổi)
- Giọng đọc: ${inputs.voice || "Southern Vietnamese Saigon female voice 25-34 years old, gentle warm soothing tone, 105-110 wpm"}
- Visual Style: ${activeVideoStyle}
- Cấu hình Mascot: ${mascotInstruction}

🚨 QUY TẮC BẮT BUỘC VỀ SỐ LƯỢNG SCENES & ĐỒNG BỘ GIỌNG ĐỌC:
- Bước 1 kịch bản có đúng ${dialogueCount} phân đoạn lời thoại (Cảnh 1 đến Cảnh ${dialogueCount}).
- DO ĐÓ BƯỚC 5 NÀY BẮT BUỘC CHỈ XUẤT ĐÚNG ${dialogueCount} SCENE OBJECTS (scene: 1 đến scene: ${dialogueCount}).
- TUYỆT ĐỐI CẤM TẠO SCENE ${dialogueCount + 1}! KHÔNG ĐƯỢC TẠO 6 SCENES NẾU BƯỚC 1 CHỈ CÓ 5 THOẠI!
- ĐỒNG BỘ NHÂN VẬT VÀ GIỌNG ĐỌC XUYÊN SUỐT:
  * Khóa Profile giọng đọc cố định của Người nói (Speaker) xuất hiện trong cảnh đó.
  * Trong trường 'voice_identification', BẮT BUỘC chỉ rõ: [Tên/Vai nhân vật đang nói]: Profile giọng đọc chi tiết (giới tính, độ tuổi, âm sắc, tốc độ wpm).
  * Đồng bộ biến điệu cảm xúc: Ghi rõ sắc thái cảm xúc của cảnh hiện tại (ví dụ: Cảnh 1 trăn trở/đồng cảm, Cảnh 2 điềm tĩnh khoa học, Cảnh 3-4 khích lệ ấm áp, Cảnh 5 tự tin an tâm) và khẳng định: "Maintain 100% vocal identity, same timbre, same resonance, same accent, and same pitch baseline without vocal drift from previous scenes."
- Hãy nhớ: Mặc dù Bước 3 (Image of Sences) có ${dialogueCount + 1} ảnh để làm mốc chuyển cảnh, nhưng Video Scripts (Bước 5) CHỈ CÓ ${dialogueCount} CẢNH VIDEO (Scene 1 nối Ảnh 1->2, Scene 2 nối Ảnh 2->3, ..., Scene ${dialogueCount} nối Ảnh ${dialogueCount}->${dialogueCount + 1}).

YÊU CẦU BƯỚC 5:
1. Xuất JSON Array chứa ĐÚNG ${dialogueCount} Scene Objects (Scene 1 đến Scene ${dialogueCount} tương ứng với ${dialogueCount} phân đoạn lời thoại ở Bước 1), trong đó MỖI SCENE LÀ 1 OBJECT NẰM TRỌN VẸN TRÊN 1 HÀNG DUY NHẤT.
   TUYỆT ĐỐI KHÔNG xuống dòng bên trong giá trị chuỗi của JSON.
3. NGUYÊN TẮC BẮT BUỘC ĐẠO DIỄN GÓC QUAY ĐIỆN ẢNH TÙY BIẾN THEO THỰC TẾ (DYNAMIC NARRATIVE & VISUAL-DRIVEN CAMERA DIRECTION):
   - Tuyệt đối CẤM góc quay chung chung, sáo rỗng (như "Medium shot", "Camera moves", "Close-up").
   - Với MỖI PHÂN CẢNH, AI BẮT BUỘC TỔNG HỢP VÀ PHÂN TÍCH 3 NGUỒN DỮ LIỆU ĐÃ TẠO Ở CÁC BƯỚC TRƯỚC:
     (1) Lời thoại & Ý đồ kịch bản ở Bước 1: Xác định chính xác đâu là ĐIỂM CHẠM CẢM XÚC & INSIGHT người xem (ví dụ: nỗi đau âm ỉ cần nhấn mạnh, sự giải tỏa nhẹ nhõm, hay đỉnh cao niềm tin).
     (2) Mô tả bối cảnh và hành động trong Storyboard Panel tương ứng ở Bước 2: Xác định trục không gian, vị trí nhân vật và đạo cụ chính.
     (3) Cấu trúc hình ảnh trong Keyframe Image nguồn ở Bước 3: Xác định tiêu điểm thị giác (visual focal point) để camera bắt đầu và kết thúc chuyển động.
   - TRƯỜNG "camera" VÀ MÔ TẢ PROMPT BẮT BUỘC PHẢI CHỈ ĐỊNH RÕ:
     * Kỹ thuật quang học & Chuyển động máy quay cụ thể (Extreme Close-Up choker shot / Slow dramatic push-in / Macro probe lens 3D orbital wrap / Smooth low-to-high pedestal rise / Dynamic whip-pan / Heroic low-angle arc track).
     * Điểm nhấn thị giác và mục đích tâm lý (Ví dụ: "bắt trọn vi biểu cảm chân mày nhíu lại thể hiện sự bế tắc", "luồn sâu vào mô hình cơ chế làm nổi bật sự tương phản", "lướt từ yếu tố tiêu cực sang giải pháp thanh lành tạo sự thức tỉnh", "tôn vinh hào quang bảo vệ tạo sự an tâm tuyệt đối").
     * Đảm bảo góc máy luôn biến chuyển linh hoạt và khớp 100% với nội dung thực tế của bất kỳ chủ đề/kịch bản nào.

4. 12 YẾU TỐ BẮT BUỘC trong mỗi scene object:
   - "scene": số thứ tự (ví dụ 1, 2, 3... đến ${dialogueCount})
   - "duration": thời lượng (ví dụ "6s", tối đa "8s")
   - "setting": mô tả không gian bối cảnh sống động có chiều sâu
   - "character": mô tả nhân vật, BẮT BUỘC kèm câu: "Character identity consistency is mandatory. Maintain EXACT same face, hairstyle, facial proportions, eye shape, nose shape, body shape, skin tone, outfit, and overall appearance from previous scenes and reference images. DO NOT redesign or reinterpret the character." ${useMascot ? (brand ? `(Include mascot ${brand} where appropriate)` : `(Include natural glowing droplet mascot where appropriate)`) : `(No mascot character)`}
   - "emotion": cảm xúc nhân vật và sự biến chuyển tâm lý
   - "action": hành động chi tiết bắt trọn khoảnh khắc highlight của lời thoại
   - "voice_identification": chất giọng cốt lõi và hướng dẫn đạo diễn (Directing instructions) khớp chuẩn xác với Người nói (Speaker) trong cảnh đó. Ghi rõ: [Tên/Vai nhân vật đang nói]: Profile giọng đọc chi tiết (giới tính, độ tuổi, âm sắc, tốc độ wpm). Giữ nguyên tính nhất quán của từng nhân vật xuyên suốt toàn bộ kịch bản.
   - "dialogue": lời thoại tiếng Việt chuẩn từ lóng & vùng đệm
   - "camera": ĐẠO DIỄN GÓC QUAY CHI TIẾT BẮT TRỌN HIGHLIGHT & INSIGHT (e.g., Extreme Close-up choker shot with slow dramatic push-in on facial micro-expressions; 3D microscopic probe lens orbital wrap; Low-angle heroic arc track)
   - "lighting": ánh sáng cinematic giàu cảm xúc (e.g., Soft warm volumetric peach lighting, morning golden hour rays)
   - "sfx": hiệu ứng âm thanh sống động khớp chuyển động
   - "text_on_screen": BẮT BUỘC để chuỗi rỗng ""

5. BẮT BUỘC CÓ voice_prompt cho VEO3 chuẩn format ở cuối mỗi Prompt video:
"Sound: [Mô tả nhân khẩu học, âm sắc, tốc độ wpm, phong cách, nhịp thở]. Voice: consistent [Tính từ tone] tone throughout all segments — naturally shifting between [các trạng thái cảm xúc theo từng cảnh] WITHOUT changing vocal identity. Same timbre, same resonance, same age [Độ tuổi], same [Vùng miền] accent, same breath pattern, same pacing [100-120 wpm], same pitch modulation across all segments."

QUY TẮC BẮT BUỘC VỀ ĐỊNH DẠNG (FORMATTING ENFORCEMENT):
- CHỈ TRẢ VỀ DUY NHẤT RAW JSON ARRAY BẮT ĐẦU BẰNG '[' VÀ KẾT THÚC BẰNG ']'.
- TUYỆT ĐỐI KHÔNG thêm bất kỳ câu chào hỏi, lời dẫn giải, mở bài hay kết luận nào.
- TUYỆT ĐỐI KHÔNG bọc trong markdown code fence.
- TUYỆT ĐỐI KHÔNG thêm câu hỏi duyệt ở cuối.
`;
  }
  return "";
}

/**
 * Chuẩn hóa URL endpoint OpenAI-compatible (tự động thêm /chat/completions nếu cần)
 */
export function normalizeOpenAiEndpoint(baseUrl: string): string {
  let clean = (baseUrl || "").trim();
  if (!clean) clean = "https://api.openai.com/v1";
  // Loại bỏ dấu gạch chéo cuối
  clean = clean.replace(/\/+$/, "");
  // Nếu đã kết thúc bằng /chat/completions thì giữ nguyên
  if (clean.endsWith("/chat/completions")) {
    return clean;
  }
  if (!clean.endsWith("/v1") && !clean.includes("/v1")) {
    clean = `${clean}/v1`;
  }
  return `${clean}/chat/completions`;
}

/**
 * Lấy giới hạn max_tokens an toàn để tránh bị trừ quá mức hoặc bị lỗi 402 khi OpenRouter pre-authorize
 */
export function getSafeMaxTokens(): number {
  const custom = localStorage.getItem("ai_max_tokens");
  if (custom) {
    const parsed = parseInt(custom, 10);
    if (!isNaN(parsed) && parsed >= 512 && parsed <= 16384) {
      return parsed;
    }
  }
  return 4096;
}

/**
 * Xử lý và định dạng thông điệp lỗi từ API AI thành tiếng Việt dễ hiểu
 */
export function formatAiApiError(status: number, errorText: string, providerName: string = "OpenRouter"): string {
  let message = errorText;
  try {
    const parsed = JSON.parse(errorText);
    if (parsed.error?.message) {
      message = parsed.error.message;
    } else if (parsed.message) {
      message = parsed.message;
    }
  } catch {
    // Nếu phản hồi là HTML (502, 504, 404 hoặc trang chào mừng máy chủ)
    if (errorText.trim().startsWith("<") || errorText.toLowerCase().includes("<!doctype")) {
      const titleMatch = errorText.match(/<title>([^<]+)<\/title>/i);
      const h1Match = errorText.match(/<h1>([^<]+)<\/h1>/i);
      if (titleMatch && titleMatch[1]) {
        message = titleMatch[1].trim();
      } else if (h1Match && h1Match[1]) {
        message = h1Match[1].trim();
      } else {
        message = `Máy chủ trả về trang lỗi HTML thay vì JSON API (${status})`;
      }
    }
  }

  const lower = (message || "").toLowerCase();

  // Xử lý lỗi 502 / 504 / 503 Bad Gateway / Service Unavailable
  if (status === 502 || status === 504 || status === 503 || lower.includes("bad gateway") || lower.includes("gateway timeout")) {
    return `Máy chủ ${providerName} phản hồi lỗi kết nối (${status} - ${message}). Vui lòng kiểm tra lại địa chỉ Base URL hoặc thử lại sau vài giây.`;
  }

  // Xử lý lỗi 402 / thiếu credits / yêu cầu giảm max_tokens
  if (status === 402 || lower.includes("requires more credits") || lower.includes("fewer max_tokens") || lower.includes("insufficient_quota")) {
    return `Tài khoản ${providerName} của bạn không đủ số dư credits (Lỗi 402 - Insufficient Balance). Vui lòng nạp thêm tín dụng tại https://openrouter.ai/settings/credits hoặc chuyển sang dùng Custom API / Google Gemini trong phần Cài đặt.`;
  }

  // Xử lý lỗi 401 / sai API Key
  if (status === 401 || lower.includes("invalid api key") || lower.includes("unauthorized")) {
    return `API Key của ${providerName} không hợp lệ hoặc đã hết hạn (Lỗi 401). Vui lòng kiểm tra lại Key trong phần Cài đặt.`;
  }

  // Xử lý lỗi 429 / Rate Limit
  if (status === 429 || lower.includes("rate limit") || lower.includes("too many requests")) {
    return `Hệ thống ${providerName} đang bị nghẽn hoặc vượt hạn mức tần suất (Lỗi 429 - Rate Limit). Vui lòng chờ vài giây rồi thử lại.`;
  }

  // Xử lý lỗi 404 / Model không tồn tại
  if (status === 404 || lower.includes("model not found") || lower.includes("does not exist")) {
    return `Mô hình AI chỉ định không tồn tại hoặc đã bị đổi tên trên ${providerName} (Lỗi 404). Vui lòng kiểm tra lại Model ID.`;
  }

  return `Lỗi ${providerName} (${status}): ${message.slice(0, 300)}`;
}

/**
 * Gọi API tương thích chuẩn OpenAI qua Server Proxy (giúp bypass CORS và Mixed-Content HTTP/HTTPS)
 * Hỗ trợ bất kỳ endpoint nào: IP riêng, OpenAI, DeepSeek, Groq, Together, Ollama, LM Studio, vLLM, v.v.
 */
export async function callCustomApiDirect(
  prompt: string,
  systemInstruction: string = MASTER_SYSTEM_PROMPT,
  model: string = "gpt-4o",
  apiKey?: string,
  baseUrl?: string
): Promise<string> {
  const token = apiKey ?? localStorage.getItem("custom_api_key") ?? "";
  const rawUrl = baseUrl || localStorage.getItem("custom_base_url") || "https://api.openai.com/v1";
  const maxTokens = getSafeMaxTokens();

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 95000); // 95s timeout

  try {
    // 1. Thử gọi qua backend proxy server (đảm bảo an toàn 100% với HTTP và chống lỗi CORS/Mixed-Content)
    let response: Response;
    try {
      response = await fetch("/api/proxy-openai", {
        method: "POST",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          baseUrl: rawUrl,
          apiKey: token,
          model: model || "gpt-4o",
          messages: [
            { role: "system", content: systemInstruction },
            { role: "user", content: prompt },
          ],
          temperature: 0.7,
          max_tokens: maxTokens,
        }),
      });
    } catch (proxyNetworkErr) {
      // Nếu server proxy bị lỗi mạng nội bộ, thử gọi trực tiếp nếu là HTTPS
      if (rawUrl.startsWith("https://")) {
        const endpoint = normalizeOpenAiEndpoint(rawUrl);
        const headers: Record<string, string> = { "Content-Type": "application/json" };
        if (token.trim()) headers["Authorization"] = `Bearer ${token.trim()}`;
        response = await fetch(endpoint, {
          method: "POST",
          signal: controller.signal,
          headers,
          body: JSON.stringify({
            model: model || "gpt-4o",
            messages: [
              { role: "system", content: systemInstruction },
              { role: "user", content: prompt },
            ],
            temperature: 0.7,
            max_tokens: maxTokens,
          }),
        });
      } else {
        throw proxyNetworkErr;
      }
    }

    clearTimeout(timeoutId);

    const responseText = await response.text();
    const trimmed = responseText.trim();

    if (!response.ok) {
      throw new Error(formatAiApiError(response.status, trimmed, "Custom API"));
    }

    // Kiểm tra an toàn: nếu trả về HTML (<!doctype, <html, v.v.)
    if (trimmed.startsWith("<") || trimmed.toLowerCase().startsWith("<!doctype")) {
      let title = "";
      const m = trimmed.match(/<title>([^<]+)<\/title>/i) || trimmed.match(/<h1>([^<]+)<\/h1>/i);
      if (m && m[1]) title = m[1].trim();
      throw new Error(
        `Custom API endpoint trả về trang HTML${title ? ` ("${title}")` : ""} thay vì dữ liệu JSON. Vui lòng kiểm tra lại URL API Base URL trong Cài đặt.`
      );
    }

    let data: any;
    try {
      data = JSON.parse(trimmed);
    } catch (parseErr) {
      throw new Error(`Phản hồi từ Custom API không đúng định dạng JSON: ${trimmed.slice(0, 150)}`);
    }

    const textContent = data.choices?.[0]?.message?.content || data.choices?.[0]?.text || data.content;
    if (!textContent) {
      throw new Error("Custom API không trả về nội dung text (choices[0].message.content).");
    }
    return extractCleanTextFromPotentialSse(textContent);
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === "AbortError") {
      throw new Error("Yêu cầu Custom API bị quá thời gian (Timeout 90s). Vui lòng thử lại.");
    }
    throw err;
  }
}

/**
 * Kiểm tra kết nối nhanh tới Custom (OpenAI-compatible) API endpoint qua server proxy
 */
export async function testCustomApiConnection(
  apiKey?: string,
  baseUrl?: string,
  model?: string
): Promise<{ success: boolean; message: string; latencyMs?: number }> {
  const token = apiKey ?? localStorage.getItem("custom_api_key") ?? "";
  const rawUrl = baseUrl || localStorage.getItem("custom_base_url") || "https://api.openai.com/v1";
  const targetModel = model || localStorage.getItem("custom_model_id") || "gpt-4o";

  const startTime = Date.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 25000); // 25s test timeout

  try {
    const res = await fetch("/api/proxy-openai", {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        baseUrl: rawUrl,
        apiKey: token,
        model: targetModel,
        messages: [{ role: "user", content: "Say OK in one word." }],
        max_tokens: 10,
      }),
    });

    clearTimeout(timeoutId);
    const latencyMs = Date.now() - startTime;

    const resText = await res.text();
    const trimmed = resText.trim();

    if (!res.ok) {
      return {
        success: false,
        message: formatAiApiError(res.status, trimmed, "Custom API"),
        latencyMs,
      };
    }

    if (trimmed.startsWith("<") || trimmed.toLowerCase().startsWith("<!doctype")) {
      let title = "";
      const m = trimmed.match(/<title>([^<]+)<\/title>/i) || trimmed.match(/<h1>([^<]+)<\/h1>/i);
      if (m && m[1]) title = m[1].trim();
      return {
        success: false,
        message: `Endpoint phản hồi trang HTML${title ? ` ("${title}")` : ""} thay vì JSON. Vui lòng kiểm tra lại URL API Base URL.`,
        latencyMs,
      };
    }

    let data: any;
    try {
      data = JSON.parse(trimmed);
    } catch {
      return {
        success: false,
        message: `Endpoint không trả về định dạng JSON hợp lệ: ${trimmed.slice(0, 100)}`,
        latencyMs,
      };
    }

    const reply = data.choices?.[0]?.message?.content?.trim() || "OK";
    return {
      success: true,
      message: `Kết nối Custom API thành công tới model "${targetModel}" (${latencyMs}ms)! Phản hồi: "${reply}"`,
      latencyMs,
    };
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === "AbortError") {
      return {
        success: false,
        message: "Kết nối Custom API bị quá thời gian (Timeout 25s). Vui lòng kiểm tra lại địa chỉ IP/URL hoặc cổng kết nối.",
      };
    }
    return {
      success: false,
      message: `Không thể kết nối tới Custom API: ${err.message}`,
    };
  }
}

/**
 * Gọi trực tiếp API OpenRouter với headers Authorization (Bearer API Key) & HTTP-Referer
 */
export async function callOpenRouterDirect(
  prompt: string,
  systemInstruction: string = MASTER_SYSTEM_PROMPT,
  model: string = "anthropic/claude-3.5-sonnet",
  apiKey?: string
): Promise<string> {
  const token = apiKey || localStorage.getItem("custom_openrouter_api_key");
  if (!token) {
    throw new Error("Chưa có OpenRouter API Key. Vui lòng nhập API Key trong phần cài đặt OpenRouter.");
  }

  const maxTokens = getSafeMaxTokens();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout

  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Authorization": `Bearer ${token}`,
        "HTTP-Referer": window.location.origin || "https://ai.studio/build",
        "X-Title": "3D Health Video Prompt Studio",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: model || "anthropic/claude-3.5-sonnet",
        messages: [
          { role: "system", content: systemInstruction },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        max_tokens: maxTokens,
      }),
    });

    clearTimeout(timeoutId);

    const responseText = await response.text();
    const trimmed = responseText.trim();

    if (!response.ok) {
      throw new Error(formatAiApiError(response.status, trimmed, "OpenRouter"));
    }

    if (trimmed.startsWith("<") || trimmed.toLowerCase().startsWith("<!doctype")) {
      let title = "";
      const m = trimmed.match(/<title>([^<]+)<\/title>/i) || trimmed.match(/<h1>([^<]+)<\/h1>/i);
      if (m && m[1]) title = m[1].trim();
      throw new Error(`OpenRouter trả về trang HTML${title ? ` ("${title}")` : ""}. Vui lòng kiểm tra lại kết nối mạng hoặc API Key.`);
    }

    let data: any;
    try {
      data = JSON.parse(trimmed);
    } catch {
      throw new Error(`Phản hồi từ OpenRouter không phải JSON hợp lệ: ${trimmed.slice(0, 150)}`);
    }

    const textContent = data.choices?.[0]?.message?.content;
    if (!textContent) {
      throw new Error("OpenRouter không trả về nội dung.");
    }
    return textContent;
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === "AbortError") {
      throw new Error("Yêu cầu OpenRouter bị quá thời gian (Timeout 60s). Vui lòng thử lại.");
    }
    throw err;
  }
}

/**
 * Hàm dịch vụ chính thay thế endpoint /api/generate-step
 * Hỗ trợ chuyển tiếp qua Custom API, OpenRouter trực tiếp hoặc máy chủ dự phòng
 */
export async function generateStepApi(params: GenerateStepParams): Promise<{ success: boolean; content: string; warning?: string }> {
  const {
    step,
    inputs,
    previousStepsData,
    customInstructions,
    provider = "gemini",
    openRouterModel,
    openRouterWritingModel,
    openRouterImageModel,
    openRouterUseSeparateWritingModel,
    openRouterUseSeparateImageModel,
    customOpenRouterKey,
    customApiKey,
    customBaseUrl,
    customModelId,
    customWritingModelId,
    customImageModelId,
    customUseSeparateModels,
    customUseSeparateWritingModel,
    customUseSeparateImageModel,
  } = params;

  let rawContent = "";

  // 1. Nếu người dùng chọn Custom (OpenAI-compatible)
  if (provider === "custom") {
    const defaultModel = customModelId || localStorage.getItem("custom_model_id") || "gpt-4o";
    const writingModel = customWritingModelId || localStorage.getItem("custom_writing_model_id") || defaultModel;
    const imageModel = customImageModelId || localStorage.getItem("custom_image_model_id") || defaultModel;

    // Check riêng từng toggle
    const useWritingSeparate = customUseSeparateWritingModel ?? (
      localStorage.getItem("custom_use_separate_writing_model") === "true" ||
      (localStorage.getItem("custom_use_separate_models") === "true" && !!writingModel)
    );
    const useImageSeparate = customUseSeparateImageModel ?? (
      localStorage.getItem("custom_use_separate_image_model") === "true" ||
      (localStorage.getItem("custom_use_separate_models") === "true" && !!imageModel)
    );

    let targetModel = defaultModel;
    if (step === 1 || step === 2) {
      targetModel = (useWritingSeparate && writingModel && writingModel.trim()) ? writingModel.trim() : defaultModel;
    } else {
      targetModel = (useImageSeparate && imageModel && imageModel.trim()) ? imageModel.trim() : defaultModel;
    }

    const prompt = buildStepPrompt(step, inputs, previousStepsData) + (customInstructions ? `\n\nLƯU Ý BỔ SUNG: ${customInstructions}` : "");
    rawContent = await callCustomApiDirect(
      prompt,
      MASTER_SYSTEM_PROMPT,
      targetModel,
      customApiKey,
      customBaseUrl
    );
  }
  // 2. Nếu người dùng chọn OpenRouter (hoặc có customOpenRouterKey)
  else if (provider === "openrouter" || (customOpenRouterKey && provider !== "gemini")) {
    const modelToUse = resolveModelForStep(
      step,
      openRouterModel,
      openRouterWritingModel,
      openRouterImageModel,
      openRouterUseSeparateWritingModel,
      openRouterUseSeparateImageModel
    );
    const prompt = buildStepPrompt(step, inputs, previousStepsData) + (customInstructions ? `\n\nLƯU Ý BỔ SUNG: ${customInstructions}` : "");
    rawContent = await callOpenRouterDirect(
      prompt,
      MASTER_SYSTEM_PROMPT,
      modelToUse,
      customOpenRouterKey
    );
  } else {
    // 3. Nếu dùng server proxy (Gemini hoặc server-configured fallback)
    const modelToUse = resolveModelForStep(
      step,
      openRouterModel,
      openRouterWritingModel,
      openRouterImageModel,
      openRouterUseSeparateWritingModel,
      openRouterUseSeparateImageModel
    );
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout

    try {
      const response = await fetch("/api/generate-step", {
        method: "POST",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          "HTTP-Referer": window.location.origin || "https://ai.studio/build",
        },
        body: JSON.stringify({
          step,
          inputs,
          previousStepsData,
          customInstructions,
          provider,
          openRouterModel: modelToUse,
          customOpenRouterKey,
        }),
      });

      clearTimeout(timeoutId);

      const responseText = await response.text();
      const trimmed = responseText.trim();

      if (!response.ok) {
        if (trimmed.startsWith("<") || trimmed.toLowerCase().startsWith("<!doctype")) {
          let title = "Máy chủ nội bộ phản hồi mã lỗi " + response.status;
          const m = trimmed.match(/<title>([^<]+)<\/title>/i) || trimmed.match(/<h1>([^<]+)<\/h1>/i);
          if (m && m[1]) title = m[1].trim();
          throw new Error(`Máy chủ xử lý gặp sự cố (${response.status} - ${title}). Vui lòng thử lại sau giây lát.`);
        }
        let parsedErr: any;
        try {
          parsedErr = JSON.parse(trimmed);
        } catch {
          parsedErr = null;
        }
        throw new Error(parsedErr?.error || parsedErr?.message || `Lỗi máy chủ (${response.status}): ${trimmed.slice(0, 200)}`);
      }

      if (trimmed.startsWith("<") || trimmed.toLowerCase().startsWith("<!doctype")) {
        throw new Error("Máy chủ nội bộ phản hồi trang HTML thay vì JSON. Vui lòng bấm 'Tạo lại' để hệ thống gửi lại yêu cầu.");
      }

      let data: any;
      try {
        data = JSON.parse(trimmed);
      } catch {
        throw new Error(`Dữ liệu máy chủ trả về không đúng chuẩn JSON: ${trimmed.slice(0, 150)}`);
      }

      if (!data.success) {
        throw new Error(data.error || "Không thể khởi tạo bước kịch bản.");
      }
      rawContent = data.content;
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err.name === "AbortError") {
        throw new Error("Yêu cầu máy chủ xử lý bị quá thời gian (Timeout 60s). Vui lòng thử lại.");
      }
      throw err;
    }
  }

  // Tự động làm sạch chuỗi SSE và kết quả theo từng bước đặc thù thành JSON / Markdown chuẩn
  const sseCleaned = extractCleanTextFromPotentialSse(rawContent);
  let finalContent = sseCleaned;
  if (step === 5) {
    const dialogueCount = countDialogueScenes(previousStepsData?.step1);
    const cleaned = cleanStep5JsonOutput(sseCleaned, "compact", dialogueCount);
    finalContent = cleaned && cleaned.trim().length > 5 ? cleaned : sseCleaned;
  } else if (step === 2) {
    const cleaned = cleanStep2StoryboardJson(sseCleaned);
    finalContent = cleaned && cleaned.trim().length > 5 ? cleaned : sseCleaned;
  } else if (step === 3) {
    const cleaned = cleanStep3VideoPromptsJson(sseCleaned);
    finalContent = cleaned && cleaned.trim().length > 5 ? cleaned : sseCleaned;
  } else if (step === 4) {
    const cleaned = cleanStep4ThumbnailJson(sseCleaned);
    finalContent = cleaned && cleaned.trim().length > 5 ? cleaned : sseCleaned;
  } else {
    // Bước 1: Kịch bản lời thoại Markdown
    finalContent = sseCleaned.trim();
  }

  return {
    success: true,
    content: finalContent || sseCleaned || rawContent,
  };
}
