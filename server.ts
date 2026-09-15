import express, { Request, Response } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Helper to get GoogleGenAI client
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Master System Prompt based on user requirements
const MASTER_SYSTEM_PROMPT = `
Đóng vai trò là một chuyên gia sáng tạo nội dung và AI Cinematic Prompt Engineer hàng đầu. Nhiệm vụ của bạn là tư vấn và viết kịch bản video hoạt hình 3D về chủ đề sức khỏe.

QUY TẮC KHÓA ĐỒNG NHẤT 100% GIỌNG ĐỌC & CHỐNG LỆCH GIỚI TÍNH VOICE (CRITICAL VOCAL & GENDER CONSISTENCY)
- DUY NHẤT 1 NGƯỜI ĐỌC XUYÊN SUỐT: Toàn bộ các cảnh trong video (Cảnh 1 đến cảnh cuối) BẮT BUỘC dùng DUY NHẤT 1 profile giọng đọc cố định theo đúng cấu hình [voice] (Ví dụ nếu chọn giọng Nam Sài Gòn thì 100% các cảnh 1, 2, 3, 4, 5... đều là giọng Nam đó; nếu chọn giọng Nữ thì 100% các cảnh đều là giọng Nữ đó).
- TUYỆT ĐỐI CẤM LỆCH VOICE (LÚC NAM LÚC NỮ): Nghiêm cấm hoàn toàn hiện tượng cảnh này giọng Nam, cảnh sau lại nhảy sang giọng Nữ hoặc ngược lại. Toàn bộ kịch bản là 1 giọng đọc đồng nhất 100%.
- ĐỘC LẬP GIỮA HÌNH ẢNH VÀ GIỌNG ĐỌC (NARRATOR VOICEOVER): Giọng đọc là người dẫn chuyện lồng tiếng. Dù hình ảnh mô tả nhân vật Nữ hay Nam thì giọng đọc vẫn cố định 100% theo trường cấu hình Giọng đọc (Voice). TUYỆT ĐỐI KHÔNG tự động đổi giọng đọc sang giới tính của nhân vật trong hình ảnh.
- GIỮ NGUYÊN ĐẠI TỪ XƯNG HÔ VÀ TONE CẢM XÚC: Giữ nguyên một ngôi xưng nhất quán, cùng một văn phong ấm áp, ân cần, chia sẻ kinh nghiệm từ đầu đến cuối mà không đổi danh tính.

QUY TẮC TỪ LÓNG VÙNG MIỀN & CHỐNG BẺ GIỌNG AI (ƯU TIÊN CAO NHẤT)
- Vị trí bắt buộc: Mỗi cảnh BẮT BUỘC có ít nhất 2 cụm từ mang sắc thái vùng miền. Từ/cụm từ vùng miền BẮT BUỘC phải xuất hiện trong 5 từ đầu câu hoặc ngay giữa câu thoại.
- Tần suất: Không lặp lại cùng một từ/cụm từ quá 2 lần trong toàn bộ video. Phải luân phiên giữa các nhóm: (1) Cảm thán, (2) Nhấn mạnh, (3) Chuyển ý, (4) Gọi người xem, (5) Câu đệm.
- Quy tắc Vùng đệm (Padding Rule): KHÔNG để thuật ngữ y khoa (ví dụ: axit, vi khuẩn, tanin, niêm mạc...) đứng trơ trọi. Phải kẹp chúng vào giữa các "hư từ", "đại từ" (ví dụ: "mấy cái chất axit này nè", "nó làm cho", "cái lớp niêm mạc đó...") để làm mềm câu văn, ép AI đọc đúng giọng đời thường.
- Đời thường hóa: Không dùng văn viết, phải dùng động từ/tính từ sinh hoạt hằng ngày. Bẻ gãy các câu khẩu hiệu/CTA thành văn nói kể chuyện tự nhiên.

QUY TẮC TỪ NGỮ & HÌNH ẢNH AN TOÀN (SAFE WORDS & SAFE IMAGES)
- CẤM các từ cấm chính sách (TikTok, FB, YT): "thuốc", "chữa khỏi", "bệnh nhân", "điều trị", "cam kết", "khỏi hẳn".
- THAY BẰNG: "giải pháp", "phục hồi", "người dùng", "hỗ trợ", "xoa dịu", "an tâm", "chăm sóc".
- Hình ảnh y tế/dạ dày: BẮT BUỘC stylized, 3D Pixar, trừu tượng, phát sáng nhẹ nhàng (soft glowing symbolic visualization), giáo dục, thân thiện gia đình. TUYỆT ĐỐI KHÔNG nội tạng gớm ghiếc, máu me, vi khuẩn kinh dị.

QUY TẮC NHÂN VẬT & TÍNH ĐỒNG NHẤT (GLOBAL CHARACTER CONSISTENCY)
- Mascot: "3D Pixar style, a heroic character made of a glowing plump golden liquid drop, confident expression, rosy cheeks. Wearing a green leaf cape with water droplets tied at the neck. Holding a small glowing twig with green leaves in the right hand. Holding a round golden shield in the left hand with clear typography text '[Tên Sản Phẩm / Trà Dây Bstar]' explicitly engraved on the shield. Surrounded by floating magical glowing particles, soft peach background, magical aura, highly detailed."
- Nhân vật người (Female lead): Nữ 25-34 tuổi người Việt, mặt tròn phúc hậu, tóc nâu sẫm buộc đuôi ngựa thấp gọn gàng, mặc áo thun cổ tròn cộc tay màu xanh lá nhạt, bụng phẳng bình thường (không có thai).
- Đồng nhất 100% về gương mặt, trang phục, màu sắc, phụ kiện qua tất cả các cảnh.
`;

// Endpoint for generating individual steps or running the AI Prompt Studio
function syncVoiceProfile(
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

  return synced;
}

function resolveShortcodes(text: string, inputs: any): string {
  if (!text) return "";
  const ar = inputs.aspectRatio === "16:9" ? "16:9" : "9:16";
  const arOrientation = ar === "16:9" ? "widescreen landscape 16:9 format" : "vertical portrait 9:16 format";
  const brand = inputs.mascotName || "Trà Dây Bstar";
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

  const map: Record<string, string> = {
    title: inputs.title || "",
    corecontent: inputs.coreContent || "",
    targetaudience: inputs.targetAudience || "",
    context: inputs.context || "",
    // Character shortcodes
    characterrules: inputs.globalCharacterRules || "Strict character consistency across all scenes",
    characterage: activeAge,
    character_age: activeAge,
    age: activeAge,
    charactergender: activeGender,
    character_gender: activeGender,
    gender: activeGender,
    femaleage: activeAge, // Backwards-compatible
    characteroutfit: "plain light-green casual t-shirt, relaxed fit, no graphics",
    characterhair: "long dark hair loosely tied back, natural bangs",
    characterface: "3D Pixar expressive big eyes, smooth natural skin tone, slim flat belly",
    // Visual & Aspect Ratio
    aspectratio: ar,
    arorientation: arOrientation,
    videostyle: videoStyle,
    style: videoStyle,
    // Voice & Audio
    voice: syncedVoice,
    regionaccent: regionLabel,
    pacingwpm: String(inputs.pacingWpm || 105),
    // Mascot & Brand
    mascot: inputs.mascotPrompt || `Heroic glowing plump golden liquid drop mascot holding a round golden shield engraved '${brand}'`,
    mascotname: brand,
    brand: brand,
    mascotdescription: inputs.mascotPrompt || `Heroic glowing plump golden liquid drop mascot holding a round golden shield engraved '${brand}'`,
    // Safety & Rules
    safewords: inputs.customSafeWords || "",
    slangwords: inputs.customSlangWords || "",
    paddingwords: inputs.customPaddingWords || "",
  };

  let res = text;
  Object.keys(map).forEach((k) => {
    const val = map[k];
    const regexSquare = new RegExp(`\\[${k}\\]`, "gi");
    const regexCurly = new RegExp(`\\{\\{${k}\\}\\}`, "gi");
    res = res.replace(regexSquare, val).replace(regexCurly, val);
  });
  return res;
}

// Helper to count dialogue scenes from step 1
function countDialogueScenes(step1Text?: string): number {
  if (!step1Text || typeof step1Text !== "string") return 5;
  const lines = step1Text.split("\n");
  const tableRows = lines.filter(line => line.includes("|") && !line.includes("---") && !line.includes("Phân đoạn"));
  const tableScenes = new Set<number>();
  for (const row of tableRows) {
    const m = row.match(/(?:Cảnh|Scene)\s*(\d+)/i);
    if (m && m[1]) {
      const num = parseInt(m[1], 10);
      if (!isNaN(num) && num > 0 && num < 50) {
        tableScenes.add(num);
      }
    }
  }
  if (tableScenes.size > 0) {
    return Math.max(...Array.from(tableScenes), tableScenes.size);
  }
  const matches = Array.from(step1Text.matchAll(/(?:Cảnh|Scene)\s*(\d+)[\s:)\-]/gi));
  if (matches.length > 0) {
    const nums = matches.map(m => parseInt(m[1], 10)).filter(n => !isNaN(n) && n > 0 && n < 50);
    if (nums.length > 0) {
      const unique = Array.from(new Set(nums));
      return Math.max(...unique, unique.length);
    }
  }
  return 5;
}

// Helper to normalize OpenAI endpoint
function normalizeOpenAiEndpoint(url: string): string {
  if (!url || !url.trim()) return "https://api.openai.com/v1/chat/completions";
  let clean = url.trim().replace(/\/+$/, "");
  if (clean.endsWith("/chat/completions")) return clean;
  if (!clean.endsWith("/v1") && !clean.includes("/v1")) {
    clean = `${clean}/v1`;
  }
  return `${clean}/chat/completions`;
}

/**
 * Giải mã và chuẩn hóa phản hồi từ OpenAI-compatible API.
 * Tự động xử lý cả JSON tiêu chuẩn lẫn luồng SSE Stream (data: {"id": ..., "delta": {"content": "..."}}),
 * tự động loại bỏ reasoning_content (suy nghĩ nội bộ của mô hình suy luận) và ghép nối thành chuỗi nội dung hoàn chỉnh.
 */
function decodeOpenAiResponseBody(rawText: string): any {
  const trimmed = (rawText || "").trim();
  if (!trimmed) {
    return { choices: [{ message: { role: "assistant", content: "" } }] };
  }

  // 1. Thử parse trực tiếp JSON thông thường
  try {
    const parsed = JSON.parse(trimmed);
    if (parsed.choices?.[0]?.message?.content !== undefined) {
      return parsed;
    }
    if (parsed.choices?.[0]?.text !== undefined) {
      return {
        ...parsed,
        choices: [{ index: 0, message: { role: "assistant", content: parsed.choices[0].text } }]
      };
    }
    if (parsed.content !== undefined) {
      return {
        choices: [{ index: 0, message: { role: "assistant", content: parsed.content } }]
      };
    }
  } catch {
    // Không phải JSON nguyên khối, tiếp tục kiểm tra định dạng SSE
  }

  // 2. Xử lý định dạng SSE Stream (Server-Sent Events) chunked response: `data: {...}`
  if (trimmed.includes("data:") || trimmed.startsWith("{") && trimmed.includes('"delta"')) {
    const lines = trimmed.split("\n");
    let accumulatedContent = "";
    let lastFinishReason = "stop";
    let modelName = "";

    for (const line of lines) {
      const l = line.trim();
      if (!l) continue;
      
      // Bỏ qua dòng event: hoặc các metadata khác
      if (l.startsWith("event:")) continue;

      let jsonStr = l;
      if (l.startsWith("data:")) {
        jsonStr = l.replace(/^data:\s*/, "").trim();
      }

      if (!jsonStr || jsonStr === "[DONE]") continue;

      try {
        const chunk = JSON.parse(jsonStr);
        if (chunk.model) modelName = chunk.model;
        const choice = chunk.choices?.[0];
        if (choice) {
          if (choice.finish_reason) lastFinishReason = choice.finish_reason;
          
          // Lấy delta content (nội dung kết quả chính thức), bỏ qua reasoning_content (suy nghĩ thô)
          if (typeof choice.delta?.content === "string") {
            accumulatedContent += choice.delta.content;
          } else if (typeof choice.message?.content === "string") {
            accumulatedContent += choice.message.content;
          } else if (typeof choice.text === "string") {
            accumulatedContent += choice.text;
          }
        }
      } catch {
        // Bỏ qua các dòng không phải JSON hợp lệ
      }
    }

    if (accumulatedContent.trim()) {
      return {
        id: `sse-reconstructed-${Date.now()}`,
        object: "chat.completion",
        model: modelName || "custom-model",
        choices: [
          {
            index: 0,
            message: {
              role: "assistant",
              content: accumulatedContent,
            },
            finish_reason: lastFinishReason,
          },
        ],
      };
    }
  }

  // 3. Fallback: Nếu không parse được gì thì trả về chuỗi text nguyên bản
  return { choices: [{ index: 0, message: { role: "assistant", content: rawText } }] };
}

// Proxy endpoint for Custom OpenAI / OpenRouter to bypass CORS & Mixed Content (HTTP/HTTPS) issues
app.post("/api/proxy-openai", async (req: Request, res: Response) => {
  try {
    const { baseUrl, apiKey, model, messages, temperature = 0.7, max_tokens = 4096 } = req.body;
    const endpoint = normalizeOpenAiEndpoint(baseUrl);

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "User-Agent": "3D-Health-Studio/1.0",
    };
    if (apiKey && typeof apiKey === "string" && apiKey.trim()) {
      headers["Authorization"] = `Bearer ${apiKey.trim()}`;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 95000);

    const apiRes = await fetch(endpoint, {
      method: "POST",
      signal: controller.signal,
      headers,
      body: JSON.stringify({
        model: model || "gpt-4o",
        messages: messages || [{ role: "user", content: "Hello" }],
        temperature,
        max_tokens,
        stream: false, // Bắt buộc yêu cầu endpoint trả về JSON hoàn chỉnh, không phân mảnh SSE
      }),
    });

    clearTimeout(timeout);

    const text = await apiRes.text();
    if (!apiRes.ok) {
      return res.status(apiRes.status).send(text);
    }

    const decoded = decodeOpenAiResponseBody(text);
    return res.json(decoded);
  } catch (err: any) {
    console.error("Proxy OpenAI Error:", err);
    if (err.name === "AbortError") {
      return res.status(504).json({ error: { message: "Gateway Timeout (95s) khi kết nối tới Custom API" } });
    }
    return res.status(502).json({ error: { message: `Lỗi kết nối tới Custom API: ${err.message}` } });
  }
});

app.post("/api/generate-step", async (req: Request, res: Response) => {
  try {
    const {
      step, // 1 | 2 | 3 | 4 | 5
      inputs, // { title, coreContent, style, voice, targetAudience, context, mascotName, femaleAge }
      previousStepsData, // data from previous steps for context continuity
      customInstructions,
    } = req.body;

    const ai = getGeminiClient();

    const useMascot = inputs.useMascot !== false;
    const brand = inputs.mascotName || "Trà Dây Bstar";
    const customMascotDesc = inputs.mascotPrompt 
      ? resolveShortcodes(inputs.mascotPrompt, inputs)
      : `3D Pixar style, a heroic character made of a glowing plump golden liquid drop, confident expression, rosy cheeks. Wearing a green leaf cape with water droplets tied at the neck. Holding a small glowing twig with green leaves in the right hand. Holding a round golden shield in the left hand with clear typography text '[${brand}]' explicitly engraved on the shield. Surrounded by floating magical glowing particles, soft peach background, magical aura, highly detailed.`;

    const mascotInstruction = useMascot
      ? `SỬ DỤNG MASCOT 3D:\n- Tên Mascot / Khắc trên khiên: ${brand}\n- Đặc tả Mascot: ${customMascotDesc}`
      : `KHÔNG SỬ DỤNG NHÂN VẬT MASCOT TRONG KỊCH BẢN NÀY (TẬP TRUNG HOÀN TOÀN VÀO NHÂN VẬT CHÍNH VÀ CÁC CẢNH QUAY ĐỜI THƯỜNG / 3D Y KHOA TRỪU TƯỢNG). TUYỆT ĐỐI KHÔNG TỰ ĐỘNG THÊM GIỌT NƯỚC MASCOT HAY KHIÊN VÀNG VÀO PROMPT.`;

    const customSlangInstruction = inputs.customSlangWords
      ? `\nDANH MỤC TỪ LÓNG VÙNG MIỀN ÁP DỤNG:\n${resolveShortcodes(inputs.customSlangWords, inputs)}`
      : "";

    const customSafeWordsInstruction = inputs.customSafeWords
      ? `\nQUY TẮC TỪ CẤM & SAFE WORDS:\n${resolveShortcodes(inputs.customSafeWords, inputs)}`
      : "";

    const customPaddingInstruction = inputs.customPaddingWords
      ? `\nQUY TẮC ĐỆM TỪ CHUYÊN MÔN (PADDING WORDS):\n${resolveShortcodes(inputs.customPaddingWords, inputs)}`
      : "";

    const rawMandatoryImageRules = inputs.mandatoryImageRules || `1. KHÔNG BAO GIỜ HIỂN THỊ LỜI THOẠI TRÊN ẢNH (NO DIALOGUE/SPEECH ON IMAGE): Tuyệt đối CẤM render lời thoại, phụ đề (subtitles), bong bóng thoại (speech bubbles), chữ trích dẫn kịch bản lên ảnh. Ảnh phải hoàn toàn là hình ảnh điện ảnh thuần túy, sạch sẽ 100% không dính text thoại.
2. ẢNH PHẢI ĐỒNG NHẤT VỚI TRONG STORYBOARD & BỐI CẢNH NHÂN VẬT (STRICT STORYBOARD & CONTEXT CONTINUITY): Mọi hình ảnh (Image 1 đến Image N+1) phải đồng nhất tuyệt đối với Storyboard: Bối cảnh không gian/môi trường (setting/background) phải đồng nhất với ảnh bối cảnh nhân vật và Storyboard (phòng ngủ, bàn làm việc ấm cúng, mô phỏng 3D y khoa). Giữ nguyên 100% diện mạo khuôn mặt, kiểu tóc, trang phục và Mascot trên khiên vàng.
3. KHÓA TỶ LỆ [aspectRatio] (STRICT [aspectRatio]): Mọi prompt ảnh tĩnh, thumbnail và storyboard BẮT BUỘC có tham số '--ar [aspectRatio]', tối ưu cho [arOrientation].
4. KHÓA ĐỒNG NHẤT NHÂN VẬT (LOCKED CHARACTER IDENTITY): Giữ nguyên 100% đặc điểm khuôn mặt, tuổi [femaleAge], kiểu tóc dài buộc nhẹ, dáng người thanh mảnh bụng phẳng (không vẽ mang thai), mặc áo thun trơn màu xanh lá nhạt (light green t-shirt) qua mọi cảnh và reference images (DO NOT redesign or reinterpret character).
5. ĐỒNG NHẤT STYLE 3D PIXAR: Dựng hình [videoStyle], da mịn sáng tự nhiên, mắt to biểu cảm sinh động, ánh sáng ấm áp điện ảnh (cinematic volumetric lighting), phông nền màu đào dịu ấm (soft peach background) kèm vi hạt phát sáng huyền ảo (magical glowing particles).
6. BỐ CỤC STORYBOARD: Chia lưới ảnh theo các panel [aspectRatio] liền mạch.
7. CẤM RENDER CHỮ RÁC (NO TEXT ARTIFACTS): Tuyệt đối không để AI vẽ chữ nguệch ngoạc, chữ rác vô nghĩa đè lên hình ảnh (ngoại trừ chữ [mascotName] khắc rõ ràng trên khiên Mascot).
8. MÔ PHỎNG Y KHOA TRỪU TƯỢNG DỄ THƯƠNG: Dạ dày, vi khuẩn, axit phải được vẽ cách điệu 3D phát sáng khoa học và thân thiện; TUYỆT ĐỐI KHÔNG dùng hình ảnh ghê rợn hay máu me.`;

    const rawMandatoryAudioRules = inputs.mandatoryAudioRules || `1. KHÓA DANH TÍNH GIỌNG ĐỌC & ĐỒNG NHẤT 100% GIỚI TÍNH / ÂM SẮC (STRICT 100% LOCKED VOCAL IDENTITY & GENDER):
- DUY NHẤT 1 GIỌNG ĐỌC XUYÊN SUỐT TOÀN BỘ KỊCH BẢN: Toàn bộ các cảnh (Cảnh 1 đến cảnh cuối) BẮT BUỘC do DUY NHẤT 1 người dẫn chuyện/chất giọng đọc xuyên suốt theo đúng cấu hình [voice] ([regionAccent], [pacingWpm] WPM).
- TUYỆT ĐỐI CẤM ĐỔI GIỌNG GIỮA CÁC CẢNH: Nghiêm cấm hoàn toàn hiện tượng cảnh này giọng Nam, cảnh sau lại chuyển thành giọng Nữ (hoặc ngược lại). Toàn bộ kịch bản là 1 giọng đọc đồng nhất 100%.
- PHÂN BIỆT RÕ GIỮA NHÂN VẬT HÌNH ẢNH VÀ GIỌNG ĐỌC THOẠI (NARRATOR VOICEOVER): Nhân vật xuất hiện trên video là [characterGender] ([characterAge] tuổi) nhưng giọng đọc là người lồng tiếng/dẫn chuyện cố định theo [voice]. TUYỆT ĐỐI KHÔNG để AI tự ý biến đổi giọng đọc của lời thoại theo giới tính của nhân vật trong hình ảnh.
- GIỮ NGUYÊN ĐẠI TỪ XƯNG HÔ VÀ TONE CẢM XÚC: Cùng 1 ngôi xưng (ví dụ: tôi/bác/chú/mình/anh/chị), cùng một văn phong ấm áp, ân cần, chia sẻ kinh nghiệm từ đầu đến cuối mà không đổi danh tính.
2. KIỂM SOÁT TỐC ĐỘ ĐỌC (STRICT PACING WPM): Tốc độ đọc chuẩn [pacingWpm] WPM (từ/phút), điềm đạm, ân cần, nhịp nhàng. BẮT BUỘC chèn nhịp ngắt nghỉ 0.2s - 0.5s giữa các mệnh đề và dấu câu.
3. RÀNG BUỘC ĐỘ DÀI LỜI THOẠI: Mỗi cảnh tối đa 25-30 từ. Lời thoại phải vừa vặn với thời lượng khung hình 4-8s.
4. BẮT BUỘC TỪ LÓNG VÙNG MIỀN: Mỗi cảnh bắt buộc xuất hiện ít nhất 2 cụm từ lóng vùng miền đặc trưng, đặt tự nhiên ở 5 từ đầu câu hoặc giữa câu để tạo cảm giác gần gũi.
5. TUÂN THỦ SAFE WORDS (CHỐNG VI PHẠM Y TẾ): Tuyệt đối KHÔNG dùng các từ cấm y tế ("Thuốc", "Chữa khỏi", "Khỏi hẳn", "Điều trị", "Bệnh nhân", "Cam kết 100%"). Bắt buộc thay bằng từ an toàn ("Giải pháp thảo mộc tự nhiên", "Xoa dịu", "Phục hồi", "Người dùng/Bạn").
6. ĐỆM TỪ CHUYÊN MÔN: Mọi thuật ngữ khoa học (Axit, Vi khuẩn HP, Niêm mạc, Flavonoid, Van tâm vị) phải đi kèm từ đệm dân dã để người nghe dễ tiếp thu.`;

    const rawMandatoryVideoRules = inputs.mandatoryVideoRules || `1. TỶ LỆ CHUẨN [aspectRatio] TỐI ƯU VEO 3 / KLING / MIDJOURNEY: Tất cả video prompts và phân cảnh chuyển động phải tối ưu khung hình [aspectRatio] ([arOrientation]).
2. THỜI LƯỢNG MỖI SCENE TỪ 4s - 8s: Mỗi cảnh kéo dài 4-8 giây, đủ để truyền tải 1 thông điệp súc tích và chuyển động thị giác rõ nét.
3. CHUYỂN ĐỘNG CAMERA ĐIỆN ẢNH (CINEMATIC CAMERA WORK): Chỉ định rõ ràng góc máy cho từng cảnh:
   - Slow push-in: Đẩy máy chậm vào cận cảnh cảm xúc nhân vật.
   - Smooth Pan / Orbital wrap: Xoay vòng 3D mượt mà quanh mô phỏng dạ dày/thảo mộc hoặc nhân vật.
   - Low-angle tracking: Góc máy thấp tôn lên vẻ tự tin khi tìm ra giải pháp.
4. TÍNH LIÊN TỤC VÀ ỔN ĐỊNH CHUYỂN ĐỘNG (MOTION CONTINUITY): Chuyển động cơ thể, làn da, cử chỉ tay chân mượt mà tự nhiên; TUYỆT ĐỐI CẤM hiện tượng biến dạng dị tật (no morphological warping/glitches), không chuyển cảnh giật cục.
5. HIỆU ỨNG VẬT LÝ & VI HẠT ÁNH SÁNG (PHYSICS & PARTICLES): Chuyển động dòng chảy thảo mộc vàng óng, lớp màng bảo vệ bao bọc niêm mạc mượt mà; các đốm sáng ma thuật lơ lửng tạo cảm giác chữa lành.`;

    const mandatoryImageRules = resolveShortcodes(rawMandatoryImageRules, inputs);
    const mandatoryAudioRules = resolveShortcodes(rawMandatoryAudioRules, inputs);
    const mandatoryVideoRules = resolveShortcodes(rawMandatoryVideoRules, inputs);

    const topMandatoryRulesHeader = `
================================================================================
🚨 QUY TẮC BẮT BUỘC CẤP CAO NHẤT (HIGHEST PRIORITY HARD CONSTRAINTS) - TUYỆT ĐỐI PHẢI TUÂN THỦ 100% 🚨

1. QUY TẮC BẮT BUỘC VỀ HÌNH ẢNH & THỊ GIÁC (MANDATORY IMAGE RULES):
${mandatoryImageRules}

2. QUY TẮC BẮT BUỘC VỀ ÂM THANH & GIỌNG ĐỌC (MANDATORY AUDIO & VOICE RULES):
${mandatoryAudioRules}

3. QUY TẮC BẮT BUỘC VỀ VIDEO & CHUYỂN ĐỘNG (MANDATORY VIDEO & MOTION RULES):
${mandatoryVideoRules}
================================================================================
`;

    let stepPrompt = "";

    const activeVideoStyle = inputs.videoStylePrompt || inputs.style || "3D Pixar Animation, Soft Peach, Cinematic Warm Lighting, Volumetric 8K Render, Fluid Particles";
    const activeAr = inputs.aspectRatio === "16:9" ? "16:9" : "9:16";
    const arOrientation = activeAr === "16:9" ? "widescreen landscape 16:9 format" : "vertical portrait 9:16 format";
    const arStoryboardPanels = activeAr === "16:9" ? "horizontal widescreen 16:9 panels" : "vertical portrait 9:16 panels";

    if (step === 1) {
      const activeAge = (inputs.characterAge || inputs.femaleAge || "25-34").trim();
      const activeGender = inputs.characterGender || "Vietnamese female";
      const syncedVoice = syncVoiceProfile(
        inputs.voice || `Southern Vietnamese Saigon female voice ${activeAge} years old, gentle warm soothing tone, 105-110 wpm`,
        activeAge,
        activeGender
      );

      const customDialogueTemplateInstruction = inputs.dialoguePromptTemplate
        ? `\nCẤU TRÚC MẪU PROMPT HỘI THOẠI ĐƯỢC CHỈ ĐỊNH:\n${resolveShortcodes(inputs.dialoguePromptTemplate, inputs)}\n`
        : "";

      stepPrompt = `
${topMandatoryRulesHeader}

Thực hiện BƯỚC 1: XUẤT LỜI THOẠI & GIẢI THÍCH CHIẾN LƯỢC KỊCH BẢN (ĐỒNG BỘ GIỌNG ĐỌC & TÍNH CÁCH NHÂN VẬT XUYÊN SUỐT CÁC CẢNH).
${customDialogueTemplateInstruction}
THÔNG TIN ĐẦU VÀO:
- Tiêu đề / Chủ đề: ${inputs.title || "Giải pháp xoa dịu trào ngược dạ dày"}
- Nội dung cốt lõi: ${inputs.coreContent || "Trào ngược, ợ chua do thói quen ăn uống, căng thẳng và dư axit; 3 giải pháp khoa học: ăn đúng giờ/kê cao gối, kiêng đồ chua cay, dùng thảo mộc Trà Dây Bstar giàu Flavonoid & Tanin"}
- Tỷ lệ khung hình: ${activeAr} (${arOrientation})
- Style Visual: ${activeVideoStyle}
- Nhân vật chính: ${activeGender} (ĐỘ TUỔI CHÍNH XÁC BẮT BUỘC: ${activeAge} tuổi)
- Giọng đọc cấu hình: ${syncedVoice}
- Đối tượng xem: ${inputs.targetAudience || "Dân văn phòng, người hay thức khuya, ăn uống thất thường 25-45 tuổi"}
- Bối cảnh: ${inputs.context || "Không gian sinh hoạt gia đình, bàn làm việc ấm cúng, mô phỏng dạ dày phát sáng 3D Pixar"}
- Cấu hình Mascot: ${mascotInstruction}
${customSlangInstruction}
${customSafeWordsInstruction}
${customPaddingInstruction}

YÊU CẦU CỤ THỂ BƯỚC 1:
1. Cấu trúc 5 cảnh chuẩn:
   - Cảnh 1: Problem (Hook cực mạnh, giữ chân người xem trong 3 giây đầu)
   - Cảnh 2: Pain (Giải thích khoa học dễ hiểu, chỉ ra ít nhất 3 nguyên nhân)
   - Cảnh 3: Solution 1 (Giải pháp tự nhiên / thói quen sinh hoạt + minh chứng khoa học)
   - Cảnh 4: Solution 2 (Giải pháp dinh dưỡng / ăn uống + minh chứng khoa học)
   - Cảnh 5: Solution 3 (Giải pháp sản phẩm ${brand} + cơ chế Flavonoid/Tanin bảo vệ niêm mạc ${useMascot ? `kèm Mascot ${brand}` : ""})

2. RÀNG BUỘC ĐỒNG BỘ ĐỘ TUỔI & GIỌNG ĐỌC XUYÊN SUỐT (CRITICAL 100% AGE & VOICE SYNCHRONIZATION):
   - 🚨 ĐỘ TUỔI BẮT BUỘC ĐỒNG BỘ: Độ tuổi nhân vật chính và người nói là "${activeAge}" tuổi. TUYỆT ĐỐI KHÔNG tự ý đưa về 25-34 hay 28-32 nếu người dùng đã chỉ định "${activeAge}".
   - Trong "## 1. VOICE SPECIFICATION": Thông số Sound BẮT BUỘC ghi đúng độ tuổi "${activeAge}" (Ví dụ: Sound: [Female, ${activeAge}, Vietnamese Saigon accent, 105 wpm, ...]). Khóa cùng độ tuổi "${activeAge}" trong toàn bộ phần mô tả Voice.
   - Trong "## 2. BẢNG PHÂN CẢNH": Cột Người nói (Speaker) và mô tả hành động BẮT BUỘC ghi đúng "${activeAge} tuổi" (Ví dụ: Nữ chính (${activeAge} tuổi) hoặc Nam chính (${activeAge} tuổi)).
   - Trong "## 4. TÁCH RIÊNG TOÀN BỘ HỘI THOẠI" và "## 5. BẢNG KIỂM TRA TỰ ĐỘNG": Xác nhận đúng profile "${activeAge} tuổi".
   - KHÓA PROFILE GIỌNG ĐỌC & DANH TÍNH 100%:
     * Kịch bản 1 người nói (Độc thoại/Dẫn chuyện): Khóa DUY NHẤT 1 giọng đọc đồng bộ 100% với nhân vật/người dẫn chuyện (${activeGender} ${activeAge} tuổi theo cấu hình: "${syncedVoice}"). Tuyệt đối CẤM lệch giới tính, lệch độ tuổi hoặc lệch khẩu âm vùng miền giữa các cảnh.
     * Kịch bản Đối thoại (2 nhân vật trở lên): Mỗi nhân vật sở hữu 1 Profile giọng đọc cố định riêng biệt khớp với giới tính, độ tuổi và vai trò (thoại của nhân vật nào dùng đúng profile giọng nhân vật đó, không dùng chéo giọng).
   - ĐỒNG BỘ BIẾN ĐIỆU CẢM XÚC (EMOTIONAL MODULATION WITHOUT VOCAL DRIFT):
     * Cảm xúc nhân vật chuyển biến tự nhiên theo từng phân cảnh (Cảnh 1: trăn trở/đồng cảm -> Cảnh 2: điềm tĩnh/khoa học -> Cảnh 3-4: ấm áp/khích lệ -> Cảnh 5: tự tin/an tâm).
     * BẮT BUỘC giữ nguyên 100% danh tính giọng đọc (vẫn cùng một người nói, cùng âm sắc timbre, cùng âm hưởng resonance, cùng độ tuổi ${activeAge}, cùng khẩu âm vùng miền).
   - ĐỒNG BỘ NGÔI XƯNG & ĐẠI TỪ NHÂN XƯNG: Khóa duy nhất 1 cặp đại từ nhân xưng từ Cảnh 1 đến Cảnh cuối (tuyệt đối không nhảy ngôi xưng lộn xộn giữa các cảnh).
   - ĐỘ DÀI & NHỊP ĐỌC: Tối đa 25-30 từ/cảnh, nhịp đọc 95-110 WPM, vừa vặn khung hình 4-8s kèm nhịp ngắt 0.2s - 0.5s.
   - BẮT BUỘC có ít nhất 2 cụm từ lóng vùng miền mỗi cảnh (nằm trong 5 từ đầu câu hoặc giữa câu).
   - Áp dụng triệt để Quy tắc vùng đệm (Padding rule) cho các từ chuyên môn.
   - Không lặp lại cùng 1 từ lóng quá 2 lần.
   - Tuyệt đối tuân thủ Safe Words (Không dùng thuốc, chữa khỏi, bệnh nhân...).

3. Bảng phân cảnh:
   Xuất dạng Markdown Table gồm 5 cột chuẩn (hỗ trợ phân vai linh hoạt):
   | Từ lóng vùng miền | Phân đoạn | Người nói (Speaker) | Bối cảnh / Hành động | Lời thoại |

4. CẤU TRÚC KẾT QUẢ ĐẦU RA BẮT BUỘC XUẤT THEO ĐÚNG 5 MỤC RÕ RÀNG:

# KỊCH BẢN VIDEO HOẠT HÌNH 3D PIXAR: [TIÊU ĐỀ KỊCH BẢN]
**Định dạng:** ${activeAr} (${arOrientation}) | **Thời lượng chuẩn:** ~30 - 35 giây (5 cảnh, 4 - 7s/cảnh)

---

## 1. VOICE SPECIFICATION (CHUẨN HÓA CHO AI VOICE / TTS)
[Tên Speaker]: Sound: [Gender, ${activeAge}, Accent, Base Pacing WPM, Pitch/Resonance]. Voice: consistent [Primary Tone] throughout all segments — naturally shifting emotional inflections across scenes (Scene 1 -> Scene 5) WITHOUT changing vocal identity. Same timbre, same resonance, same age ${activeAge}, same accent...

---

## 2. BẢNG PHÂN CẢNH CHI TIẾT (STORYBOARD SCRIPT TABLE)
| Từ lóng vùng miền | Phân đoạn | Người nói (Speaker) | Bối cảnh / Hành động | Lời thoại (Kèm chỉ dẫn nhịp & sắc thái) |

---

## 3. GIẢI THÍCH CHIẾN LƯỢC KỊCH BẢN
1. Đối tượng mục tiêu (Target Audience)
2. Điểm chạm tâm lý (Psychological Triggers)
3. Kỹ thuật Neo hình ảnh (Visual Anchoring)

---

## 4. TÁCH RIÊNG TOÀN BỘ HỘI THOẠI (DIALOGUE SCRIPT FOR RECORDING / TTS)
(Trích xuất toàn bộ câu thoại của từng cảnh thành danh sách thoại thuần sạch sẽ, rõ ràng Người nói, Sắc thái cảm xúc và nội dung thoại kèm số lượng từ, cực kỳ tiện lợi cho việc thu âm hoặc copy paste vào các phần mềm TTS / AI Voice / ElevenLabs / Minimax / CapCut):
- **Cảnh 1: Problem (Hook)** ([Người nói] - [Sắc thái cảm xúc & nhịp điệu]):
  «[Nội dung câu thoại hoàn chỉnh có từ lóng]» *([Số từ] từ)*
- **Cảnh 2: Pain (Cơ chế)** ([Người nói] - [Sắc thái cảm xúc & nhịp điệu]):
  «[Nội dung câu thoại hoàn chỉnh có từ lóng]» *([Số từ] từ)*
- **Cảnh 3: Solution 1 (Thói quen)** ([Người nói] - [Sắc thái cảm xúc & nhịp điệu]):
  «[Nội dung câu thoại hoàn chỉnh có từ lóng]» *([Số từ] từ)*
- **Cảnh 4: Solution 2 (Dinh dưỡng)** ([Người nói] - [Sắc thái cảm xúc & nhịp điệu]):
  «[Nội dung câu thoại hoàn chỉnh có từ lóng]» *([Số từ] từ)*
- **Cảnh 5: Solution 3 (Hero CTA)** ([Người nói] - [Sắc thái cảm xúc & nhịp điệu]):
  «[Nội dung câu thoại hoàn chỉnh có từ lóng]» *([Số từ] từ)*

---

## 5. BẢNG KIỂM TRA TỰ ĐỘNG (SELF-CHECK PROTOCOL)
- [x] Cấu trúc 5 cảnh chuẩn: Đầy đủ Problem -> Pain -> Solution 1 -> Solution 2 -> Solution 3.
- [x] Đồng bộ giọng đọc & độ tuổi: Khóa 100% hồ sơ ${activeAge} tuổi, chuyển điệu cảm xúc tự nhiên, không lệch giọng.
- [x] Đồng bộ đại từ: Khóa duy nhất 1 cặp đại từ nhân xưng xuyên suốt 5 cảnh.
- [x] Quy tắc Từ lóng: Đúng 2 từ lóng mỗi cảnh, ở đầu/giữa câu.
- [x] Quy tắc Vùng đệm (Padding Rule): Áp dụng cho các thuật ngữ chuyên môn.
- [x] Tuân thủ Safe Words: 100% không chứa từ cấm.
- [x] Thời lượng & Độ dài: 20 - 28 từ/cảnh.

---

❓ "Bạn có duyệt phần lời thoại này không để tôi tiến hành tạo Prompt Ảnh Storyboard (Bước 2)?"

Hãy trả về kết quả định dạng rõ ràng, chuyên nghiệp.
`;
    } else if (step === 2) {
      const activeAge = (inputs.characterAge || inputs.femaleAge || "25-34").trim();
      const activeGender = inputs.characterGender || "Vietnamese female";
      const rawStoryboardTpl = inputs.storyboardPromptTemplate || inputs.imagePromptTemplate;
        const customStoryboardTemplateInstruction = rawStoryboardTpl
        ? `\nCẤU TRÚC MẪU PROMPT STORYBOARD ĐƯỢC CHỈ ĐỊNH:\n${resolveShortcodes(rawStoryboardTpl, inputs)}\n`
        : "";

      stepPrompt = `
${topMandatoryRulesHeader}

Thực hiện BƯỚC 2: TẠO PROMPT ẢNH STORYBOARD "STOP THE SCROLL" (LƯỚI PANELS ẢNH NGUỒN ${activeAr}).
${customStoryboardTemplateInstruction}
DỰA TRÊN THÔNG TIN VÀ LỜI THOẠI BƯỚC 1:
- Lời thoại và phân cảnh đã duyệt: ${JSON.stringify(previousStepsData?.step1 || "Kịch bản phân cảnh")}
- Cấu hình Mascot: ${mascotInstruction}
- Visual Style: ${activeVideoStyle}
- Tỷ lệ khung hình: --ar ${activeAr} (${arOrientation})

YÊU CẦU BƯỚC 2 (QUY TẮC BẮT BUỘC N+1 PANELS ẢNH & BỐI CẢNH SỐNG ĐỘNG CÓ CHIỀU SÂU):
1. Viết 1 Prompt Tiếng Anh duy nhất tạo Ảnh Storyboard (ChatGPT-2 / DALL-E / Midjourney).
2. QUY TẮC SỐ LƯỢNG ẢNH: Nếu kịch bản có N cảnh thoại thì Storyboard BẮT BUỘC chia lưới đúng N+1 panels ảnh (ví dụ 5 cảnh thoại thì tạo đúng lưới 6 panels: Panel 1 đến Panel N+1) để làm ảnh nguồn nối cặp (1->2, 2->3, ..., N->N+1) cho N cảnh video.
3. LOCKED CHARACTERS: ${activeGender} (${activeAge} years old, ${inputs.characterFace || "expressive face"}, ${inputs.characterHair || "long dark hair loosely tied back"}, wearing ${inputs.characterOutfit || "plain casual outfit"})${useMascot ? ` & Heroic mascot holding shield engraved '${brand}'` : `. (NO mascot character)`}. (BẮT BUỘC dùng đúng độ tuổi "${activeAge} years old", tuyệt đối không dùng 25-34 hay 28-32 nếu người dùng chọn khác).
4. LIVED-IN REALISTIC SETTINGS (Tuyệt đối CẤM phông nền trơn studio vô hồn):
   - Mọi phân cảnh BẮT BUỘC phải có bối cảnh môi trường sống động, chân thực, có chiều sâu không gian (architectural depth, natural window light, tangible furniture, realistic props, layered background) bám sát trực tiếp vào nội dung kịch bản và bối cảnh '${inputs.context || "không gian sống thực tế"}'.
   - Phác họa tuần tự từng Panel (Panel 1, Panel 2, ..., Panel N+1) bám sát mạch diễn biến của kịch bản đã tạo ở Bước 1.
5. QUY TẮC PROMPT SẠCH 100%:
   - TUYỆT ĐỐI KHÔNG chèn tên file (như image_0.png, image_1.png...) vào prompt.
   - TUYỆT ĐỐI KHÔNG đặt tham số '--ar' ở giữa câu. Tham số '--ar ${activeAr} --v 6.1 --style raw' BẮT BUỘC đặt ở CUỐI CÙNG của prompt.

ĐỊNH DẠNG XUẤT:
BẮT BUỘC xuất ra JSON format dạng 1 mảng duy nhất nằm trọn vẹn trên 1 hàng (single line JSON).
Ví dụ:
[{"storyboard_prompt": "3D Pixar style storyboard in one single master image, perfectly divided into a grid of vertical portrait ${activeAr} panels with rich lived-in environmental depth and architectural continuity... --ar ${activeAr} --v 6.1 --style raw", "aspect_ratio": "${activeAr}", "style": "3D Pixar Animation"}]

Sau đó thêm câu hỏi: "Bạn có duyệt Prompt Storyboard này không để tôi xuất file JSON kịch bản tổng hợp (Bước 3)?"
`;
    } else if (step === 3) {
      const rawSceneTpl = inputs.scenePromptTemplate || inputs.imagePromptTemplate;
      const customSceneTemplateInstruction = rawSceneTpl
        ? `\nCẤU TRÚC MẪU PROMPT ẢNH ĐƠN (IMAGE OF SENCES) ĐƯỢC CHỈ ĐỊNH:\n${resolveShortcodes(rawSceneTpl, inputs)}\n`
        : "";

      stepPrompt = `
${topMandatoryRulesHeader}

Thực hiện BƯỚC 3: TẠO BỘ PROMPT ẢNH ĐƠN (IMAGE OF SENCES: N+1 ẢNH ĐƠN LẺ TỪ IMAGE 1 ĐẾN IMAGE N+1).
${customSceneTemplateInstruction}
DỰA TRÊN BƯỚC 1 & BƯỚC 2:
- Dữ liệu các cảnh lời thoại Bước 1: ${JSON.stringify(previousStepsData?.step1 || "Kịch bản lời thoại")}
- Dữ liệu Storyboard Bước 2 (NGUỒN THỊ GIÁC GỐC): ${JSON.stringify(previousStepsData?.step2 || "")}
- Cấu hình Mascot: ${mascotInstruction}
- Visual Style: ${activeVideoStyle}
- Tỷ lệ khung hình: --ar ${activeAr} (${arOrientation})

🚨 NGUYÊN TẮC TRÍCH XUẤT ĐỘNG TỪ STORYBOARD (DYNAMIC STORYBOARD-TO-IMAGE PARSING):
1. TRÍCH XUẤT 1:1 TỪ PROMPT STORYBOARD BƯỚC 2:
   - Đọc và phân tích kỹ nội dung chuỗi Prompt Storyboard Bước 2 ở trên.
   - Nhận diện toàn bộ danh sách các Panel (Panel 1, Panel 2, ..., Panel K) được mô tả trong Storyboard Bước 2.
   - Với mỗi Panel k: Chuyển đổi mô tả của Panel k đó thành 1 prompt ảnh đơn lẻ 8K hoàn chỉnh cho "Image k", giữ nguyên 100% bối cảnh không gian, ánh sáng, góc máy, nhân vật, đạo cụ và không khí được mô tả trong Panel k của Storyboard.
   - Nếu Storyboard được cập nhật hoặc có bất kỳ thay đổi nào (về địa điểm, phòng ốc, props, chủ đề), các Image Prompts BẮT BUỘC tự động phản ánh và đồng bộ chính xác theo các Panel mới trong Storyboard đó mà KHÔNG ĐƯỢC áp đặt bất kỳ bối cảnh cố định nào khác.
2. ĐỊNH DANH CHUẨN XÁC "IMAGE 1", "IMAGE 2" ĐẾN "IMAGE N+1":
   - BẮT BUỘC đặt tên từng ảnh là "Image 1", "Image 2", ..., "Image N+1" tương ứng với từng Panel của Storyboard.
   - TUYỆT ĐỐI KHÔNG dùng "Scene 1", "Scene 2" cho ảnh tĩnh để tránh hiểu nhầm với Phân cảnh Video (Video Scenes ở Bước 5).
3. TUYỆT ĐỐI CẤM LỜI THOẠI TRONG PROMPT TẠO ẢNH:
   - Tuyệt đối CẤM kèm '(Lời thoại: ...)', phụ đề, bong bóng thoại, hoặc câu thoại tiếng Việt nào vào chuỗi prompt tạo ảnh.
   - Chuỗi prompt chỉ chứa duy nhất đoạn văn mô tả thị giác điện ảnh 3D Pixar bằng Tiếng Anh (Visual Description). Lời thoại chỉ để ở trường 'dialogue' riêng biệt!
4. QUY TẮC PROMPT SẠCH (CLEAN PROMPT):
   - TUYỆT ĐỐI KHÔNG chèn tên file (như image_0.png, image_1.png) hoặc câu dẫn meta.
   - Tham số '--ar ${activeAr} --v 6.1 --style raw' BẮT BUỘC đặt ở CUỐI CÙNG của mỗi prompt, không chèn giữa câu.

YÊU CẦU ĐẦU RA BƯỚC 3:
1. Viết Prompt Tiếng Anh tạo đúng N+1 ẢNH ĐƠN LẺ (Image 1 đến Image N+1) trích xuất trực tiếp từ các Panel tương ứng trong Storyboard.
2. Tối ưu ảnh đơn lẻ sắc nét 8K cho Midjourney / DALL-E / Flux, 3D Pixar style, --ar ${activeAr} --v 6.1 --style raw.
3. BẮT BUỘC ĐỊNH DẠNG ĐẦU RA LÀ MỘT MẢNG JSON (JSON ARRAY) GỒM ĐÚNG N+1 OBJECTS:
[
  {
    "image": 1,
    "image_name": "Image 1",
    "scene": 1,
    "type": "image_prompt",
    "prompt": "3D Pixar animation style, single full-screen ${arOrientation}, [Faithful extraction of setting, character state, props and lighting from Panel 1 of Storyboard]... --ar ${activeAr} --v 6.1 --style raw",
    "dialogue": "Lời thoại cảnh 1 (để riêng tại đây)..."
  },
  ...
  {
    "image": 6,
    "image_name": "Image 6",
    "scene": 6,
    "type": "image_prompt",
    "prompt": "3D Pixar animation style, single full-screen ${arOrientation}, [Faithful extraction of setting, character state, props and lighting from Panel N+1 of Storyboard]... --ar ${activeAr} --v 6.1 --style raw",
    "dialogue": "Ảnh chốt kết CTA & thương hiệu"
  }
]
`;
    } else if (step === 4) {
      const customThumbnailTemplateInstruction = inputs.thumbnailPromptTemplate
        ? `\nCẤU TRÚC MẪU PROMPT THUMBNAIL ĐƯỢC CHỈ ĐỊNH:\n${resolveShortcodes(inputs.thumbnailPromptTemplate, inputs)}\n`
        : "";

      stepPrompt = `
${topMandatoryRulesHeader}

Thực hiện BƯỚC 4: TẠO PROMPT ẢNH THUMBNAIL "STOP THE SCROLL" (SẠCH, CHẤT LƯỢNG CAO, KHÔNG RÁC TỪ NGỮ).
${customThumbnailTemplateInstruction}
DỰA TRÊN CHỦ ĐỀ:
- Chủ đề: ${inputs.title || "Trào ngược dạ dày"}
- Cấu hình Mascot: ${mascotInstruction}
- Visual Style: ${activeVideoStyle}
- Tỷ lệ khung hình: --ar ${activeAr} (${arOrientation})

YÊU CẦU BƯỚC 4:
1. Viết 1 Prompt Tiếng Anh tạo Ảnh Bìa / Thumbnail tỉ lệ --ar ${activeAr} --v 6.1.
2. Thị giác: Độ tương phản màu sắc cực mạnh (Ultra high visual contrast), khắc họa trực diện cảm xúc tươi sáng, giải pháp an lành để giữ chân người xem ngay lập tức (Stop-the-scroll).
3. Text: Câu chữ 3D nổi bật TỐI ĐA 5 TỪ (ví dụ 'ÊM DẠ DÀY NGAY'). Mô tả trong prompt: "Clean, bold 3D Vietnamese typography centered vertically reading: 'ÊM DẠ DÀY NGAY' (the ONLY text on the thumbnail; strictly NO brand name or commercial logo)".
4. QUY TẮC CẤM XUẤT HIỆN BRAND TRÊN THUMBNAIL (STRICT NO-BRAND ON THUMBNAIL):
   - TUYỆT ĐỐI KHÔNG xuất hiện tên thương hiệu (${brand}), logo, hoặc nhãn mác sản phẩm lên Thumbnail (kể cả trên khiên mascot, trang phục, chai lọ hay bao bì).
   - Mascot trên Thumbnail (nếu có): Chỉ cầm khiên vàng trơn hoặc khiên chạm nổi họa tiết thảo mộc vàng óng (blank golden shield with subtle botanical relief, strictly NO text, NO logo, NO brand typography on shield or props).
   - Chữ DUY NHẤT trên Thumbnail là câu Hook 3D giật tít tiếng Việt (tối đa 5 từ), TUYỆT ĐỐI KHÔNG CHỨA TÊN BRAND.
5. QUY TẮC PROMPT SẠCH 100% (ZERO ARTIFACTS):
   - TUYỆT ĐỐI KHÔNG chèn tên file (như image_0.png, image_1.png, image_4.png) hay câu tham chiếu '(as defined in image_4.png)'. Hãy miêu tả trực tiếp ngoại hình nhân vật (${inputs.characterGender || "Vietnamese female"}, ${inputs.characterAge || "25-34"} years old, long dark hair tied back, plain light-green t-shirt) và Mascot (heroic glowing plump golden droplet mascot holding a blank golden shield).
   - TUYỆT ĐỐI KHÔNG chèn '--ar ${activeAr}' vào giữa câu văn. Tham số '--ar ${activeAr} --v 6.1' BẮT BUỘC chỉ đặt ở CUỐI CÙNG của chuỗi prompt.
   - TUYỆT ĐỐI KHÔNG đưa câu lệnh meta như '(leaving 20% margins top and bottom)' vào nội dung visual prompt.
6. ĐỊNH DẠNG: 1 mảng JSON duy nhất nằm trọn vẹn trên 1 hàng (Single line JSON).
Ví dụ:
[{"prompt": "A vibrant 3D Pixar-style vertical portrait thumbnail for a health video, featuring ultra-high visual contrast to stop the scroll. The central focus is the Vietnamese female character (25-34 years old, long dark hair loosely tied back, plain light-green t-shirt) smiling brightly and looking healthy and relieved, holding glowing golden herbal leaves. Standing proudly next to her is the 3D Mascot character (a heroic glowing plump golden liquid drop, green leaf cape, holding a small glowing twig and a blank golden shield with subtle leaf relief, strictly NO brand text, NO logo on shield). The background is a soft peach gradient with contrasting emerald green and warm golden glowing magical aura and floating particles, creating a powerful visual pop. Clean, bold 3D Vietnamese typography centered vertically reading: 'ÊM DẠ DÀY NGAY' (strictly the ONLY text on image; NO brand name). The overall lighting is warm, cinematic, and inviting, with detailed textures and vibrant healing colors. The render is smooth 8K, optimized for social media platforms. --ar ${activeAr} --v 6.1", "thumbnail_prompt": "...", "aspect_ratio": "${activeAr}"}]

Sau đó kết thúc bằng câu hỏi: "Bạn có duyệt Prompt Thumbnail này không để tôi xuất file JSON kịch bản tổng hợp (Bước 5)?"
`;
    } else if (step === 5) {
      const dialogueCount = countDialogueScenes(previousStepsData?.step1);
      const rawVeoTpl = inputs.veoPromptTemplate || inputs.videoPromptTemplate;
      const customVeoTemplateInstruction = rawVeoTpl
        ? `\nCẤU TRÚC MẪU PROMPT VEO / VIDEO ĐƯỢC CHỈ ĐỊNH:\n${resolveShortcodes(rawVeoTpl, inputs)}\n`
        : "";

      stepPrompt = `
${topMandatoryRulesHeader}

Thực hiện BƯỚC 5: TẠO PROMPT VEO 3 & XUẤT KỊCH BẢN JSON ĐỂ TỰ ĐỘNG HÓA (ĐÚNG ${dialogueCount} SCENES = ${dialogueCount} PHÂN ĐOẠN LỜI THOẠI BƯỚC 1).
${customVeoTemplateInstruction}
DỰA TRÊN TẤT CẢ CÁC BƯỚC TRƯỚC:
- Dữ liệu kịch bản Bước 1: ${JSON.stringify(previousStepsData?.step1 || {})}
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
   - "character": mô tả nhân vật, BẮT BUỘC kèm câu: "Character identity consistency is mandatory. Maintain EXACT same face, hairstyle, facial proportions, eye shape, nose shape, body shape, skin tone, outfit, and overall appearance from previous scenes and reference images. DO NOT redesign or reinterpret the character." ${useMascot ? `(Include mascot ${brand} where appropriate)` : `(No mascot character)`}
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

    if (customInstructions) {
      stepPrompt += `\n\nLƯU Ý BỔ SUNG TỪ NGƯỜI DÙNG: ${customInstructions}`;
    }

    let resultText = "";

    if (ai) {
      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: stepPrompt,
        config: {
          systemInstruction: MASTER_SYSTEM_PROMPT,
          temperature: 0.7,
        },
      });
      resultText = response.text || "";
    } else {
      // High quality fallback simulation if Gemini API key is not yet configured
      resultText = generateMockFallbackStep(step, inputs, previousStepsData);
    }

    // Auto cleanup for step 5 JSON on server side
    if (step === 5 && resultText) {
      const dialogueCount = countDialogueScenes(previousStepsData?.step1);
      let cleaned = resultText.trim();
      cleaned = cleaned.replace(/^```(?:json|JSON)?\s*\n?/i, "").replace(/\n?```\s*$/i, "");
      const match = cleaned.match(/```(?:json|JSON)?([\s\S]*?)```/i);
      if (match && match[1]) cleaned = match[1].trim();

      const start = cleaned.indexOf("[");
      const end = cleaned.lastIndexOf("]");
      if (start !== -1 && end !== -1 && end >= start) {
        cleaned = cleaned.substring(start, end + 1).trim();
      }
      try {
        let parsed = JSON.parse(cleaned);
        if (Array.isArray(parsed)) {
          if (dialogueCount > 0 && parsed.length > dialogueCount) {
            parsed = parsed.slice(0, dialogueCount);
          }
          cleaned = "[\n" + parsed.map((item: any, idx: number) => {
            item.scene = idx + 1;
            return "  " + JSON.stringify(item);
          }).join(",\n") + "\n]";
        }
      } catch (e) {
        // preserve cleaned substring
      }
      resultText = cleaned;
    }

    res.json({
      success: true,
      step,
      content: resultText,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Error generating step:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to generate prompt step",
    });
  }
});

// Health check endpoint
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", service: "3D AI Health Video Prompt Studio" });
});

// Fallback generator for offline/unconfigured environments
function generateMockFallbackStep(
  step: number,
  inputs: any,
  _prevData: any
): string {
  const brand = inputs?.mascotName || "Trà Dây Bstar";
  const title = inputs?.title || "Bí Quyết Xoa Dịu Đau Dạ Dày & Trào Ngược";
  const activeAge = (inputs?.characterAge || inputs?.femaleAge || "25-34").trim();
  const activeGender = inputs?.characterGender || "Vietnamese female";
  const isMale = activeGender.toLowerCase().includes("male") && !activeGender.toLowerCase().includes("female");
  const speakerLabel = isMale ? `Nam chính (${activeAge} tuổi)` : `Nữ chính (${activeAge} tuổi)`;
  const speakerRole = isMale ? "anh chàng" : "bạn nữ";

  if (step === 1) {
    return `### BƯỚC 1: XUẤT LỜI THOẠI & GIẢI THÍCH CHIẾN LƯỢC KỊCH BẢN

#### 📋 BẢNG PHÂN CẢNH KỊCH BẢN (5 CẢNH CHUẨN - PHÂN VAI & ĐỒNG BỘ GIỌNG ĐỌC)

| Từ lóng vùng miền | Phân đoạn | Người nói (Speaker) | Bối cảnh / Hành động | Lời thoại |
| :--- | :--- | :--- | :--- | :--- |
| **Dữ dằn dữ ta**, **Coi bộ** | Cảnh 1 (Problem - Hook) | [Nhân vật ${speakerLabel}] | Bàn làm việc ban đêm, ${speakerRole} ôm bụng khó chịu, nhăn mặt. Mascot Giọt Vàng vỗ vai an ủi. | "Dữ dằn dữ ta! Nửa đêm mà cái bụng cứ cồn cào, nóng rát ngược lên cổ, coi bộ khó ngủ rồi nghen!" |
| **Thiệt tình**, **Nó bào** | Cảnh 2 (Pain - 3 Nguyên nhân) | [Nhân vật ${speakerLabel}] | Mô phỏng 3D dạ dày phát sáng, acid và thói quen thức khuya, ăn cay bốc khói nhẹ. | "Thiệt tình, ăn uống thất thường rồi stress dữ quá, mấy cái axit dư thừa nó bào mòn lớp niêm mạc nè!" |
| **Nghe lời tui**, **Nhẹ bẫng** | Cảnh 3 (Solution 1 - Sinh hoạt) | [Nhân vật ${speakerLabel}] | ${speakerRole} kê cao đầu giường 15 độ, ăn tối cách giờ ngủ 3 tiếng, bụng phát sáng ánh xanh dịu. | "Nghe lời tui nghen, kê gối hơi cao xíu, ăn tối sớm 3 tiếng là cái dạ dày nhẹ bẫng liền hà!" |
| **Trời đất ơi**, **Mát rượi** | Cảnh 4 (Solution 2 - Dinh dưỡng) | [Nhân vật ${speakerLabel}] | ${speakerRole} gạt đĩa ớt cay nồng, chuyển sang ly nước ấm và cháo yến mạch thơm lừng. | "Trời đất ơi, bớt mấy món cay nóng lại, bổ sung rau xanh với nước ấm cho đường ruột mát rượi nghen!" |
| **Hết sẩy**, **An tâm** | Cảnh 5 (Solution 3 - ${brand}) | [Nhân vật ${speakerLabel}] | Mascot giơ cao khiên vàng ${brand} tỏa ánh hào quang bảo vệ dạ dày, ${speakerRole} thưởng thức trà thơm. | "Uống thêm ${brand} giàu flavonoid tự nhiên này nè, hỗ trợ xoa dịu niêm mạc, êm ru hết sẩy luôn đó!" |

---

#### 🎙️ VOCAL SPECIFICATION (ĐỒNG BỘ GIỌNG ĐỌC XUYÊN SUỐT CÁC CẢNH):
- **Speaker**: ${speakerLabel} (${activeGender} ${activeAge} tuổi, giọng Nam Bộ Sài Gòn êm dịu, 105 WPM).
- **Voice Prompt**: Sound: [${isMale ? "Male" : "Female"}, ${activeAge}, Southern Vietnamese Saigon accent, 105 wpm, warm empathetic, chest resonance]. Voice: consistent gentle empathetic tone throughout all segments — naturally shifting emotional inflections (Cảnh 1: trăn trở đồng cảm -> Cảnh 2: điềm tĩnh khoa học -> Cảnh 3-4: ấm áp khích lệ -> Cảnh 5: tự tin an tâm) WITHOUT changing vocal identity. Same timbre, same resonance, same age ${activeAge}, same Saigon accent, same breath pattern, same pacing 105-110 wpm across all segments.

---

#### 💡 GIẢI THÍCH CHIẾN LƯỢC KỊCH BẢN:
1. **Đối tượng khách hàng nhắm tới**: Dân văn phòng, người trẻ & trung niên ${activeAge} tuổi thường xuyên thức khuya, stress, hay bị trào ngược, ợ chua.
2. **Điểm chạm tâm lý (Pain Trigger)**: Nỗi ám ảnh trào ngược ban đêm gây mất ngủ, mệt mỏi vào sáng hôm sau.
3. **Kỹ thuật Neo hình ảnh (Visual Anchoring)**: Biến tinh chất thảo mộc thành dũng sĩ giọt nước vàng đeo khiên **${brand}**, tạo cảm giác bảo vệ vững chắc, an toàn tuyệt đối.

#### 🛡️ KIỂM TRA CHÉO (SELF-CHECK):
- [x] Đồng bộ giọng đọc & độ tuổi: Khóa 100% profile giọng ${speakerLabel} (${activeAge} tuổi) giọng Sài Gòn, cùng ngôi xưng 'tui', biến điệu cảm xúc tự nhiên không drift voice.
- [x] Độ dài: Tất cả các cảnh đều < 30 từ, nhịp đọc 4-8s.
- [x] Từ lóng vùng miền: Xuất hiện ngay 5 từ đầu câu và giữa câu, phân bổ luân phiên các nhóm.
- [x] Quy tắc vùng đệm (Padding Rule): Kẹp từ chuyên môn ("mấy cái axit dư thừa", "cái dạ dày", "lớp niêm mạc").
- [x] Safe Words: Không dùng từ cấm (thuốc, chữa khỏi, bệnh nhân), dùng "hỗ trợ", "xoa dịu", "an tâm".
- [x] 12 yếu tố kịch bản tuân thủ chính sách quảng cáo và gia đình.

---
**Bạn có duyệt phần lời thoại này không để tôi tiến hành tạo Prompt Ảnh Storyboard (Bước 2)?**`;
  }

  if (step === 2) {
    return `[{"storyboard_prompt": "3D Pixar style storyboard in one single image, perfectly divided into a grid of exactly 5 vertical portrait panels, every individual panel MUST be a tall vertical frame resembling a 9:16 smartphone screen aspect ratio for short video format, strictly NO horizontal strips, NO square panels, perfect visual continuity. LOCKED CHARACTERS: ${activeGender} ${activeAge} years old, fair skin, expressive pleasant face, neat hair, wearing casual light green short-sleeved crew-neck t-shirt, normal flat stomach, NOT pregnant. Mascot: Heroic glowing plump golden liquid drop character with confident smile, rosy cheeks, green leaf cape with dew drops tied at neck, holding glowing herbal twig in right hand and round golden shield with clear engraved typography text '${brand}' in left hand. LOCKED SETTING: Soft peach background, warm cinematic educational lighting, continuous environment. PANEL SEQUENCE: Panel 1: Character holding upper stomach in mild discomfort at nighttime desk while glowing mascot gently pats shoulder encouragingly. Panel 2: 3D stylized soft glowing stomach illustration showing peaceful symbolic warm light soothing abstract acid particles. Panel 3: Character comfortably relaxing on elevated pillow with peaceful expression as subtle cool blue aura surrounds torso. Panel 4: Character happily pushing away a plate of spicy red chili and smiling beside a glass of soothing warm water. Panel 5: Character cheerfully drinking a warm golden tea cup while mascot proudly raises golden shield engraved '${brand}' casting an impenetrable glowing golden protective shield around stomach. Ultra detailed 3D Pixar render, octane render, 8k --ar 9:16"}]

Bạn có duyệt Prompt Storyboard này không để tôi xuất file JSON kịch bản tổng hợp (Bước 3)?`;
  }

  if (step === 3) {
    return JSON.stringify(
      [
        {
          image: 1,
          image_name: "Image 1",
          scene: 1,
          type: "image_prompt",
          prompt: `3D Pixar style cinematic medium shot, a ${activeAge}-year-old ${activeGender} with friendly face, wearing a plain light green crew-neck t-shirt, sitting at a cozy desk at night holding stomach with uncomfortable expression. Beside stands a glowing plump golden liquid droplet mascot with rosy cheeks and green leaf cape. Soft warm peach ambient lighting, volumetric glow, high dynamic range, clean visual without speech text or dialogue. --ar 9:16 --v 6.1 --style raw`,
          dialogue: "Dữ dằn dữ ta! Nửa đêm mà cái bụng cứ cồn cào, nóng rát ngược lên cổ, coi bộ khó ngủ rồi nghen!",
        },
        {
          image: 2,
          image_name: "Image 2",
          scene: 2,
          type: "image_prompt",
          prompt: `3D Pixar style symbolic medical visualization, abstract glowing translucent stomach chamber in soft pink and warm tones, tiny harmless dark particles gently swept away by a wave of golden soothing light, clean educational rendering, non-graphic, family safe, beautiful cinematic ray tracing. Beside it, the golden droplet mascot points with a tiny glowing leaf twig. --ar 9:16 --v 6.1 --style raw`,
          dialogue: "Thiệt tình, ăn uống thất thường rồi stress dữ quá, mấy cái axit dư thừa nó bào mòn lớp niêm mạc nè!",
        },
        {
          image: 3,
          image_name: "Image 3",
          scene: 3,
          type: "image_prompt",
          prompt: `3D Pixar style cozy bedroom interior, the ${activeGender} in green t-shirt happily reclining on bed with head elevated at 15 degrees on a fluffy pillow, looking relieved and calm. A subtle gentle blue glow emanates around abdomen area. The golden mascot floats nearby giving a thumbs up. --ar 9:16 --v 6.1 --style raw`,
          dialogue: "Nghe lời tui nghen, kê gối hơi cao xíu, ăn tối sớm 3 tiếng là cái dạ dày nhẹ bẫng liền hà!",
        },
        {
          image: 4,
          image_name: "Image 4",
          scene: 4,
          type: "image_prompt",
          prompt: `3D Pixar style dining area, the ${activeGender} pushing away a bowl of oily spicy red food with a gentle smile, reaching for a clean transparent glass of warm water and a bowl of fresh oatmeal porridge. Bright wholesome morning kitchen lighting, Pixar aesthetics. --ar 9:16 --v 6.1 --style raw`,
          dialogue: "Trời đất ơi, bớt mấy món cay nóng lại, bổ sung rau xanh với nước ấm cho đường ruột mát rượi nghen!",
        },
        {
          image: 5,
          image_name: "Image 5",
          scene: 5,
          type: "image_prompt",
          prompt: `3D Pixar style cinematic close-up shot, the ${activeGender} happily holding a steaming ceramic cup of golden herbal tea, glowing droplet mascot heroically raising its polished golden shield with engraved text '${brand}', projecting a brilliant golden protective dome enveloping stomach. Rich warm colors, magical golden sparkle particles. --ar 9:16 --v 6.1 --style raw`,
          dialogue: `Uống thêm ${brand} giàu flavonoid tự nhiên này nè, hỗ trợ xoa dịu niêm mạc, êm ru hết sẩy luôn đó!`,
        },
        {
          image: 6,
          image_name: "Image 6",
          scene: 6,
          type: "image_prompt",
          prompt: `3D Pixar style celebratory finale shot, the ${activeGender} looking energetic and radiating vibrant health, standing side by side with the glowing golden mascot holding the '${brand}' shield, both smiling warmly and waving at camera against a soft glowing peach bokeh background. Confetti of tiny herbal sparkles floating in air. --ar 9:16 --v 6.1 --style raw`,
          dialogue: "Ảnh chốt kết CTA & thương hiệu",
        },
      ],
      null,
      2
    );
  }

  if (step === 4) {
    return `[{"thumbnail_prompt": "3D Pixar style high impact YouTube and TikTok video cover, extreme visual contrast with warm vibrant peach and glowing emerald tones. In the center, a ${activeAge}-year-old ${activeGender} with expressive wide eyes holding glowing herbal leaves beside an oversized heroic glowing golden droplet mascot holding a blank sparkling golden shield with subtle botanical relief (strictly NO brand text, NO logo on shield). Bold stylized 3D Vietnamese typography text: 'ÊM DẠ DÀY NGAY' (the ONLY text on the thumbnail; strictly NO brand name), text placed strictly in the center UI safe zone. Ultra sharp focus, volumetric magical lighting, stop-the-scroll visual tension, 8k render --ar 9:16"}]

Bạn có duyệt Prompt Thumbnail này không để tôi xuất file JSON kịch bản tổng hợp (Bước 5)?`;
  }

  if (step === 5) {
    return `[{"scene":1,"duration":"6s","setting":"Cozy nighttime bedroom desk, warm lamp, soft peach wallpaper","character":"Character identity consistency is mandatory. Maintain EXACT same face, hairstyle, facial proportions, eye shape, nose shape, body shape, skin tone, outfit, and overall appearance from previous scenes and reference images. DO NOT redesign or reinterpret the character. ${activeGender} ${activeAge}yo in light green t-shirt and glowing golden droplet mascot with '${brand}' shield.","emotion":"Grimacing in discomfort, turning to surprise as mascot comforts her","action":"Character clutches upper abdomen with one hand, mascot gently touches arm with leaf twig","voice_identification":"Southern Vietnamese Saigon ${isMale ? "male" : "female"} voice ${activeAge} years old, gentle warm and soothing tone, empathetic and friendly storytelling style, 105-110 wpm, 0.2-0.5s pauses","dialogue":"Dữ dằn dữ ta! Nửa đêm mà cái bụng cứ cồn cào, nóng rát ngược lên cổ, coi bộ khó ngủ rồi nghen!","camera":"Extreme close-up choker shot with slow dramatic push-in focusing on micro-facial tension and trembling hand clutching chest","lighting":"Warm cinematic rim lighting with soft peach ambient glow","sfx":"Subtle ambient night crickets, gentle glowing shimmer sound","text_on_screen":""},
{"scene":2,"duration":"7s","setting":"Abstract 3D stylized stomach chamber, soft pink and translucent gold","character":"Character identity consistency is mandatory. Maintain EXACT same face, hairstyle, facial proportions, eye shape, nose shape, body shape, skin tone, outfit, and overall appearance from previous scenes and reference images. DO NOT redesign or reinterpret the character. Golden droplet mascot holding glowing twig.","emotion":"Educational, focused, explanatory","action":"Mascot waves herbal twig as golden light sweeps over harmless symbolic dark bubbles on stomach wall","voice_identification":"Southern Vietnamese Saigon ${isMale ? "male" : "female"} voice ${activeAge} years old, informative and caring scientific explanation tone","dialogue":"Thiệt tình, ăn uống thất thường rồi stress dữ quá, mấy cái axit dư thừa nó bào mòn lớp niêm mạc nè!","camera":"Microscopic macro probe lens 3D orbital wrap diving into glowing translucent mucosal lining","lighting":"Volumetric golden ray tracing and soft pink subsurface scattering","sfx":"Gentle whoosh sound effect and calming chime","text_on_screen":""},
{"scene":3,"duration":"6s","setting":"Clean modern bedroom with comfortable wooden bed and fluffy pillows","character":"Character identity consistency is mandatory. Maintain EXACT same face, hairstyle, facial proportions, eye shape, nose shape, body shape, skin tone, outfit, and overall appearance from previous scenes and reference images. DO NOT redesign or reinterpret the character. ${activeGender} ${activeAge}yo in light green t-shirt.","emotion":"Relaxed, relieved, peaceful","action":"Character adjusts pillows to 15 degree incline and breathes deeply, smiling gently","voice_identification":"Southern Vietnamese Saigon ${isMale ? "male" : "female"} voice ${activeAge} years old, warm and encouraging conversational guidance","dialogue":"Nghe lời tui nghen, kê gối hơi cao xíu, ăn tối sớm 3 tiếng là cái dạ dày nhẹ bẫng liền hà!","camera":"Smooth low-to-high pedestal rise capturing instant facial relief and peaceful breathing relaxation","lighting":"Soft pastel twilight lighting through sheer curtains","sfx":"Soft exhale sound and calm ambient breeze","text_on_screen":""},
{"scene":4,"duration":"6s","setting":"Bright kitchen dining table with fresh green plants","character":"Character identity consistency is mandatory. Maintain EXACT same face, hairstyle, facial proportions, eye shape, nose shape, body shape, skin tone, outfit, and overall appearance from previous scenes and reference images. DO NOT redesign or reinterpret the character. ${activeGender} ${activeAge}yo in light green t-shirt.","emotion":"Joyful, confident, empowered","action":"Character gently pushes away spicy chili dish and takes a sip of warm pure water","voice_identification":"Southern Vietnamese Saigon ${isMale ? "male" : "female"} voice ${activeAge} years old, enthusiastic lifestyle mentor tone","dialogue":"Trời đất ơi, bớt mấy món cay nóng lại, bổ sung rau xanh với nước ấm cho đường ruột mát rượi nghen!","camera":"Dynamic top-down flatlay tilt tracking sharply from spicy chili plate to steaming pure water glass under morning sun","lighting":"Bright natural morning sunlight with soft warm fill","sfx":"Gentle glass clink and cheerful tone","text_on_screen":""},
{"scene":5,"duration":"7s","setting":"Serene living space bathed in golden afternoon sunlight","character":"Character identity consistency is mandatory. Maintain EXACT same face, hairstyle, facial proportions, eye shape, nose shape, body shape, skin tone, outfit, and overall appearance from previous scenes and reference images. DO NOT redesign or reinterpret the character. ${activeGender} in light green t-shirt holding tea cup, glowing golden droplet mascot holding '${brand}' shield.","emotion":"Utterly relaxed, secure, grateful","action":"Character sips aromatic golden tea while mascot raises shield casting a protective golden aura bubble over abdomen","voice_identification":"Southern Vietnamese Saigon ${isMale ? "male" : "female"} voice ${activeAge} years old, persuasive and soothing closing reassurance. Sound: Southern Vietnamese Saigon ${isMale ? "male" : "female"} voice ${activeAge} years old, gentle warm soothing, pace 105-110 wpm, empathetic friendly storytelling style, 0.2-0.5s pauses. Voice: consistent warm empathetic tone throughout all segments — naturally shifting between questioning, informing, persuading, soothing, firm, cautious, authentic, and engaging WITHOUT changing vocal identity. Same timbre, same resonance, same age ${activeAge}, same Southern Vietnamese Saigon accent, same breath pattern, same pacing 105-110 wpm, same pitch modulation across all segments.","dialogue":"Uống thêm ${brand} giàu flavonoid tự nhiên này nè, hỗ trợ xoa dịu niêm mạc, êm ru hết sẩy luôn đó!","camera":"Epic low-angle heroic arc push-in bathing character in warm golden volumetric rays of complete reassurance","lighting":"Golden hour sunlight with sparkling magical amber particles","sfx":"Soothing liquid pour, warm protective energy hum, joyful bell chime","text_on_screen":""}]`;
  }

  return `Thành công!`;
}

// Vite middleware or production static serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
