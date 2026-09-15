/**
 * Utility functions to extract, clean, sanitize, and format JSON output
 * from LLM responses (removing preambles, markdown code blocks, conversational text, trailing notes, and SSE chunks).
 */

/**
 * Giải mã chuỗi SSE thô (Server-Sent Events) chứa các dòng `data: {"id":..., "delta": {"content": "..."}}`
 * và trích xuất nội dung văn bản thuần túy (loại bỏ reasoning_content suy nghĩ nội bộ).
 */
export function extractCleanTextFromPotentialSse(raw: string): string {
  if (!raw || typeof raw !== "string") return "";
  const trimmed = raw.trim();

  // Kiểm tra nếu chuỗi chứa các chunk SSE `data: {`
  if (trimmed.includes("data:") || (trimmed.startsWith("{") && trimmed.includes('"delta"'))) {
    const lines = trimmed.split("\n");
    let accumulated = "";
    let foundSseChunks = false;

    for (const line of lines) {
      const l = line.trim();
      if (!l || l.startsWith("event:")) continue;

      let jsonStr = l;
      if (l.startsWith("data:")) {
        jsonStr = l.replace(/^data:\s*/, "").trim();
      }

      if (!jsonStr || jsonStr === "[DONE]") continue;

      try {
        const chunk = JSON.parse(jsonStr);
        const choice = chunk.choices?.[0];
        if (choice) {
          foundSseChunks = true;
          if (typeof choice.delta?.content === "string") {
            accumulated += choice.delta.content;
          } else if (typeof choice.message?.content === "string") {
            accumulated += choice.message.content;
          } else if (typeof choice.text === "string") {
            accumulated += choice.text;
          }
        }
      } catch {
        // Không phải JSON chunk
      }
    }

    if (foundSseChunks && accumulated.trim()) {
      return accumulated.trim();
    }
  }

  return raw;
}

/**
 * Counts the exact number of dialogue scenes N from Step 1 markdown content.
 */
export function countDialogueScenes(step1Text?: string): number {
  if (!step1Text || typeof step1Text !== "string") return 5;
  const cleaned = extractCleanTextFromPotentialSse(step1Text);

  // 1. Check markdown table rows with Cảnh / Scene
  const lines = cleaned.split("\n");
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

  // 2. Check general scene markers (### Cảnh 1, - Cảnh 1:, Scene 1:)
  const matches = Array.from(cleaned.matchAll(/(?:Cảnh|Scene)\s*(\d+)[\s:)\-]/gi));
  if (matches.length > 0) {
    const nums = matches.map(m => parseInt(m[1], 10)).filter(n => !isNaN(n) && n > 0 && n < 50);
    if (nums.length > 0) {
      const unique = Array.from(new Set(nums));
      return Math.max(...unique, unique.length);
    }
  }

  return 5; // Standard default 5 scenes
}

/**
 * Robustly sanitizes and extracts clean JSON from LLM output.
 * If maxScenes is provided, strictly enforces that only the first maxScenes are kept.
 * @param raw Raw text from LLM
 * @param formatStyle 'compact' (each scene on 1 single line) | 'pretty' (standard indented)
 * @param maxScenes Optional maximum number of scenes to keep (matching N dialogue count)
 */
export function cleanStep5JsonOutput(
  raw: string,
  formatStyle: "compact" | "pretty" | "compact-no-brackets" = "compact",
  maxScenes?: number
): string {
  if (!raw || typeof raw !== "string") return "";

  let text = extractCleanTextFromPotentialSse(raw).trim();

  // 1. Remove markdown fences (```json ... ``` or ``` ...)
  text = text.replace(/^```(?:json|JSON)?\s*\n?/i, "");
  text = text.replace(/\n?```\s*$/i, "");

  // If there's still internal markdown block
  const codeBlockMatch = text.match(/```(?:json|JSON)?([\s\S]*?)```/i);
  if (codeBlockMatch && codeBlockMatch[1]) {
    text = codeBlockMatch[1].trim();
  }

  // 2. Remove conversational introductory lines (e.g. "Dưới đây là kịch bản...", "Sau đây là...", "Here is the JSON...")
  const firstBracketIndex = text.indexOf("[");
  const firstBraceIndex = text.indexOf("{");

  let startIndex = -1;
  let isArray = true;

  if (firstBracketIndex !== -1 && (firstBraceIndex === -1 || firstBracketIndex < firstBraceIndex)) {
    startIndex = firstBracketIndex;
    isArray = true;
  } else if (firstBraceIndex !== -1) {
    startIndex = firstBraceIndex;
    isArray = false;
  }

  if (startIndex !== -1) {
    // Look for corresponding closing bracket/brace from the end
    const lastBracketIndex = text.lastIndexOf("]");
    const lastBraceIndex = text.lastIndexOf("}");

    const endIndex = isArray ? lastBracketIndex : lastBraceIndex;

    if (endIndex !== -1 && endIndex >= startIndex) {
      text = text.substring(startIndex, endIndex + 1).trim();
    } else {
      text = text.substring(startIndex).trim();
    }
  }

  // 3. Replace curly / smart quotes with standard ASCII double quotes
  text = text
    .replace(/[\u201C\u201D\u201E\u201F\u00AB\u00BB]/g, '"')
    .replace(/[\u2018\u2019\u201A\u201B]/g, "'");

  // 4. Try parsing JSON
  try {
    let parsed = JSON.parse(text);

    if (Array.isArray(parsed)) {
      if (typeof maxScenes === "number" && maxScenes > 0 && parsed.length > maxScenes) {
        parsed = parsed.slice(0, maxScenes);
      }
      if (formatStyle === "compact-no-brackets") {
        return parsed.map((item) => JSON.stringify(item)).join(",\n");
      } else if (formatStyle === "compact") {
        // Output each scene as a single line object inside the array
        const formattedRows = parsed.map((item) => "  " + JSON.stringify(item));
        return "[\n" + formattedRows.join(",\n") + "\n]";
      } else {
        return JSON.stringify(parsed, null, 2);
      }
    } else if (typeof parsed === "object" && parsed !== null) {
      if (Array.isArray(parsed.scenes)) {
        let scenes = parsed.scenes;
        if (typeof maxScenes === "number" && maxScenes > 0 && scenes.length > maxScenes) {
          scenes = scenes.slice(0, maxScenes);
        }
        if (formatStyle === "compact-no-brackets") {
          return scenes.map((item: any) => JSON.stringify(item)).join(",\n");
        }
        parsed.scenes = scenes;
      }
      return JSON.stringify(parsed, null, 2);
    }
    return JSON.stringify(parsed);
  } catch (err) {
    // 5. If JSON.parse failed, attempt minor common fixes (trailing commas)
    try {
      const fixedText = text
        .replace(/,\s*([\]}])/g, "$1") // Remove trailing commas
        .replace(/\n\s*\n/g, "\n");

      let parsed = JSON.parse(fixedText);
      if (Array.isArray(parsed)) {
        if (typeof maxScenes === "number" && maxScenes > 0 && parsed.length > maxScenes) {
          parsed = parsed.slice(0, maxScenes);
        }
        if (formatStyle === "compact-no-brackets") {
          return parsed.map((item) => JSON.stringify(item)).join(",\n");
        } else if (formatStyle === "compact") {
          const formattedRows = parsed.map((item) => "  " + JSON.stringify(item));
          return "[\n" + formattedRows.join(",\n") + "\n]";
        }
        return JSON.stringify(parsed, null, 2);
      }
      return JSON.stringify(parsed, null, 2);
    } catch {
      // Return cleaned string without conversational intro/outro
      let res = text;
      if (formatStyle === "compact-no-brackets") {
        res = res.trim();
        if (res.startsWith("[") && res.endsWith("]")) {
          res = res.slice(1, -1).trim();
        }
      }
      return res;
    }
  }
}

/**
 * Validates whether the given string is valid JSON and calculates scenes count if it's an array.
 */
export function validateStep5Json(text: string): {
  isValid: boolean;
  sceneCount: number;
  error?: string;
  parsedData?: any;
} {
  if (!text || !text.trim()) {
    return { isValid: false, sceneCount: 0, error: "Nội dung rỗng" };
  }

  try {
    // Try cleaning first
    const cleaned = cleanStep5JsonOutput(text, "compact");
    const parsed = JSON.parse(cleaned);

    if (Array.isArray(parsed)) {
      return {
        isValid: true,
        sceneCount: parsed.length,
        parsedData: parsed,
      };
    } else if (typeof parsed === "object" && parsed !== null) {
      if (Array.isArray(parsed.scenes)) {
        return {
          isValid: true,
          sceneCount: parsed.scenes.length,
          parsedData: parsed,
        };
      }
      return {
        isValid: true,
        sceneCount: 1,
        parsedData: parsed,
      };
    }
    return { isValid: true, sceneCount: 0, parsedData: parsed };
  } catch (err: any) {
    return {
      isValid: false,
      sceneCount: 0,
      error: err?.message || "Cú pháp JSON chưa hợp lệ",
    };
  }
}

/**
 * Extracts clean JSON or text for single line prompt steps (Step 2 and Step 4)
 */
export function cleanSingleLineJsonOutput(raw: string): string {
  if (!raw) return "";
  let text = extractCleanTextFromPotentialSse(raw).trim();

  // Strip code blocks
  text = text.replace(/^```(?:json|JSON)?\s*\n?/i, "");
  text = text.replace(/\n?```\s*$/i, "");

  const match = text.match(/```(?:json|JSON)?([\s\S]*?)```/i);
  if (match && match[1]) {
    text = match[1].trim();
  }

  // Look for JSON array or object
  const start = text.indexOf("[");
  const end = text.lastIndexOf("]");
  if (start !== -1 && end !== -1 && end > start) {
    const jsonCandidate = text.substring(start, end + 1).trim();
    try {
      const parsed = JSON.parse(jsonCandidate);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return jsonCandidate;
    }
  }

  return text;
}

/**
 * Sanitizes image & thumbnail prompts to remove junk metadata, file name references (image_0.png, etc.),
 * developer notes, leaked UI margin comments, and ensures Midjourney/Flux parameters
 * are cleanly placed strictly at the end of the prompt.
 */
export function sanitizeImagePrompt(prompt: string, defaultAr: string = "9:16"): string {
  if (!prompt || typeof prompt !== "string") return "";
  let p = prompt.trim();

  // 1. Clean speech dialogue text / parenthesized dialogue / script quotes FIRST
  p = p.replace(/\s*\(?\s*(?:Lời thoại|Thoại|Dialogue|Voiceover|Lồng tiếng|Narrator|Phụ đề|Subtitles?)\s*:\s*[^)\n]*\)?/gi, " ");
  p = p.replace(/\s*\(\s*(?:Lời thoại|Thoại)[^)]*\)/gi, " ");
  p = p.replace(/\b(?:Lời thoại|Dialogue)\s*:[^\n]*/gi, " ");

  // 2. Clean compound phrase references and parenthesized file references (STRICTLY matching filenames with extensions or numeric index, NOT normal English words)
  p = p.replace(/,?\s*as\s+(?:defined|seen|shown|described|specified)\s+in\s+[^,\)\.]*(?:\.[a-z0-9]+)?/gi, "");
  p = p.replace(/,?\s*(?:same\s+appearance\s+as\s+(?:in\s+)?|consistent\s+with\s+|matching\s+)(?:image|panel|scene|ref|img)s?_?\d+(?:\.[a-z0-9]+)?(?:\s*,?\s*etc\.?)?,?\s*/gi, ", ");
  p = p.replace(/,?\s*\(?\s*(?:reference|matching)\s+(?:image|scene|panel)\s*#?\d+(?:\.[a-z0-9]+)?\)?\s*,?/gi, " ");
  p = p.replace(/\b(?:image|img|panel|frame|ref|scene)s?_\d+(?:\.(?:png|jpg|jpeg|webp))?\b/gi, "");
  p = p.replace(/\b(?:image|img|panel|frame|ref|scene)s?\d+\.(?:png|jpg|jpeg|webp)\b/gi, "");

  // 3. Remove meta instructions & UI margin instructions leaked into prompt
  p = p.replace(/IMPORTANT:\s*Generate ONLY ONE[^\.\n]*\.?/gi, "");
  p = p.replace(/DO NOT recreate the storyboard sheet[^\.\n]*\.?/gi, "");
  p = p.replace(/DO NOT generate multiple panels[^\.\n]*\.?/gi, "");
  p = p.replace(/\(leaving\s+\d+%\s+margins?\s+(?:from\s+)?top\s+and\s+bottom\)/gi, "");
  p = p.replace(/within the UI safe zone\s*(?:\(leaving\s+\d+%\s+margins?\s+(?:from\s+)?top\s+and\s+bottom\))?,?/gi, "centered,");
  p = p.replace(/centered\s+vertically\s+centered/gi, "centered vertically");
  p = p.replace(/text placed strictly in the center UI safe zone,?\s*(?:keeping \d+% margin from the top and bottom edges)?,?/gi, "");
  p = p.replace(/keeping \d+% margin from the top and bottom edges,?/gi, "");

  // 4. Extract and strip mid-sentence midjourney params
  const arMatch = p.match(/--ar\s+(\d+:\d+)/i);
  const foundAr = arMatch ? arMatch[1] : defaultAr;
  p = p.replace(/,?\s*--ar\s+\d+:\d+/gi, "");

  const vMatch = p.match(/--v\s+([\d\.]+)/i);
  const foundV = vMatch ? vMatch[1] : "6.1";
  p = p.replace(/,?\s*--v\s+[\d\.]+/gi, "");

  const hasStyleRaw = /--style\s+raw/i.test(p);
  p = p.replace(/,?\s*--style\s+\w+/gi, "");

  // 5. Clean messy punctuation & wording
  p = p.replace(/\(\s*,\s*/g, "(");
  p = p.replace(/\(\s*25-34\s*,/g, "(25-34 years old,");
  p = p.replace(/,\s*\)/g, ")");
  p = p.replace(/\(\s*\)/g, "");
  p = p.replace(/,\s*,+/g, ",");
  p = p.replace(/,\s*\./g, ".");
  p = p.replace(/\.\s*,/g, ".");
  p = p.replace(/\s+/g, " ").trim();
  p = p.replace(/,\s*$/g, "").trim();
  if (p.endsWith(".")) {
    p = p.slice(0, -1).trim();
  }

  const finalParams = `--ar ${foundAr} --v ${foundV}${hasStyleRaw ? " --style raw" : ""}`;
  return `${p}. ${finalParams}`.trim();
}

/**
 * Standardize Step 2 (Storyboard Prompt) into valid JSON string
 */
export function cleanStep2StoryboardJson(raw: string): string {
  if (!raw) return "";
  let text = extractCleanTextFromPotentialSse(raw).trim();
  text = text.replace(/^```(?:json|JSON)?\s*\n?/i, "").replace(/\n?```\s*$/i, "");

  const start = text.indexOf("[");
  const end = text.lastIndexOf("]");
  if (start !== -1 && end !== -1 && end > start) {
    const candidate = text.substring(start, end + 1).trim();
    try {
      const parsed = JSON.parse(candidate);
      if (Array.isArray(parsed)) {
        const sanitized = parsed.map((item) => ({
          ...item,
          storyboard_prompt: sanitizeImagePrompt(item.storyboard_prompt || item.prompt || "", item.aspect_ratio || "9:16"),
        }));
        return JSON.stringify(sanitized, null, 2);
      }
      return JSON.stringify(parsed, null, 2);
    } catch {
      // fallback
    }
  }

  // If raw prompt is string, wrap in standard JSON array format
  const promptCleaned = text
    .replace(/^\[?\s*\{\s*"storyboard_prompt":\s*"?/i, "")
    .replace(/"?\s*\}\s*\]?$/i, "")
    .replace(/(?:\*\*|__)?\s*Bạn có duyệt Prompt[^\n]*$/i, "")
    .trim();

  return JSON.stringify(
    [
      {
        storyboard_prompt: sanitizeImagePrompt(promptCleaned || text, "9:16"),
        aspect_ratio: "9:16",
        style: "3D Pixar Animation",
      },
    ],
    null,
    2
  );
}

/**
 * Standardize Step 3 (Image Prompts N+1: Image 1 to Image N+1) into valid JSON array string
 */
export function cleanStep3VideoPromptsJson(raw: string): string {
  if (!raw) return "";
  let text = extractCleanTextFromPotentialSse(raw).trim();
  text = text.replace(/^```(?:json|JSON)?\s*\n?/i, "").replace(/\n?```\s*$/i, "");

  // Check if already valid JSON array
  const start = text.indexOf("[");
  const end = text.lastIndexOf("]");
  if (start !== -1 && end !== -1 && end > start) {
    const candidate = text.substring(start, end + 1).trim();
    try {
      const parsed = JSON.parse(candidate);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const sanitized = parsed.map((item, idx) => {
          const num = item.image || item.scene || (idx + 1);
          return {
            image: num,
            image_name: `Image ${num}`,
            scene: num,
            type: "image_prompt",
            prompt: sanitizeImagePrompt(item.prompt || "", "9:16"),
            dialogue: item.dialogue ? String(item.dialogue).trim() : undefined,
          };
        });
        return JSON.stringify(sanitized, null, 2);
      }
    } catch {
      // continue to parsing text lines
    }
  }

  // If text was markdown/lines with possible headers, dialogues and clean prompts:
  const lines = text.split("\n").map((l) => l.trim()).filter((l) => l.length > 0);

  const promptsByNumber: Record<number, string> = {};
  const dialoguesByNumber: Record<number, string> = {};
  let currentImgIndex = 1;

  for (const line of lines) {
    // Skip markdown section headers and table separators
    if (
      line.startsWith("#") ||
      line.startsWith("---") ||
      line.startsWith("***") ||
      line.includes("ĐẾN") ||
      line.includes("CLEAN PROMPT") ||
      line.includes("AUDIO ONLY") ||
      line.includes("BƯỚC 3") ||
      line.includes("Bạn có duyệt")
    ) {
      continue;
    }

    const imageMatch = line.match(/^(?:Image|Ảnh|Scene|Cảnh)\s*(\d+)[\s:：\-]+(.*)/i);
    if (imageMatch) {
      const num = parseInt(imageMatch[1], 10) || currentImgIndex;
      currentImgIndex = num;
      let content = (imageMatch[2] || "").trim();

      // Check if content is pure dialogue (starts with quotes or contains Vietnamese words without visual prompt keywords)
      const isPureDialogue =
        content.startsWith('"') ||
        content.startsWith('“') ||
        content.startsWith("'") ||
        (content.includes("!") && !content.toLowerCase().includes("pixar") && !content.toLowerCase().includes("style"));

      if (isPureDialogue) {
        dialoguesByNumber[num] = content.replace(/^["'“]+|["'”]+$/g, "").trim();
      } else {
        // Extract inline dialogue if present
        const inlineDiag = content.match(/\(?(?:Lời thoại|Dialogue)\s*:\s*([^)\n]+)\)?/i);
        if (inlineDiag) {
          dialoguesByNumber[num] = inlineDiag[1].trim();
          content = content.replace(/\(?(?:Lời thoại|Dialogue)\s*:\s*[^)\n]+\)?/i, "").trim();
        }
        promptsByNumber[num] = (promptsByNumber[num] ? promptsByNumber[num] + " " : "") + content;
      }
    } else if (line.toLowerCase().startsWith("lời thoại:") || line.toLowerCase().startsWith("dialogue:")) {
      dialoguesByNumber[currentImgIndex] = line.replace(/^(?:Lời thoại|Dialogue):/i, "").trim();
    } else if (line.startsWith("- ") || line.startsWith("* ")) {
      if (promptsByNumber[currentImgIndex]) {
        promptsByNumber[currentImgIndex] += " " + line.replace(/^[-*]\s*/, "");
      }
    } else if (promptsByNumber[currentImgIndex]) {
      promptsByNumber[currentImgIndex] += " " + line;
    }
  }

  // Gather all unique image numbers in sorted order
  const allNums = Array.from(new Set([...Object.keys(promptsByNumber), ...Object.keys(dialoguesByNumber)]))
    .map(Number)
    .sort((a, b) => a - b);

  if (allNums.length > 0) {
    const promptItems = allNums.map((num) => {
      const promptRaw = promptsByNumber[num] || "";
      const diagRaw = dialoguesByNumber[num] || "";
      return {
        image: num,
        image_name: `Image ${num}`,
        scene: num,
        type: "image_prompt",
        prompt: sanitizeImagePrompt(promptRaw, "9:16"),
        dialogue: diagRaw ? diagRaw.replace(/^["'“]+|["'”]+$/g, "").trim() : undefined,
      };
    });

    return JSON.stringify(promptItems, null, 2);
  }

  // Fallback wrapping
  return JSON.stringify(
    [
      {
        image: 1,
        image_name: "Image 1",
        scene: 1,
        type: "image_prompt",
        prompt: sanitizeImagePrompt(text.replace(/Bạn có duyệt bộ Prompt.*$/i, "").trim(), "9:16"),
      },
    ],
    null,
    2
  );
}

/**
 * Standardize Step 4 (Thumbnail Stop-the-Scroll Prompt) into valid JSON string
 */
export function cleanStep4ThumbnailJson(raw: string): string {
  if (!raw) return "";
  let text = extractCleanTextFromPotentialSse(raw).trim();
  text = text.replace(/^```(?:json|JSON)?\s*\n?/i, "").replace(/\n?```\s*$/i, "");

  const start = text.indexOf("[");
  const end = text.lastIndexOf("]");
  if (start !== -1 && end !== -1 && end > start) {
    const candidate = text.substring(start, end + 1).trim();
    try {
      const parsed = JSON.parse(candidate);
      if (Array.isArray(parsed)) {
        const sanitized = parsed.map((item) => ({
          ...item,
          prompt: sanitizeImagePrompt(item.prompt || item.thumbnail_prompt || "", item.aspect_ratio || "9:16"),
          thumbnail_prompt: sanitizeImagePrompt(item.thumbnail_prompt || item.prompt || "", item.aspect_ratio || "9:16"),
        }));
        return JSON.stringify(sanitized, null, 2);
      }
      if (typeof parsed === "object" && parsed !== null) {
        const p = parsed.prompt || parsed.thumbnail_prompt || "";
        return JSON.stringify(
          [
            {
              prompt: sanitizeImagePrompt(p, parsed.aspect_ratio || "9:16"),
              thumbnail_prompt: sanitizeImagePrompt(p, parsed.aspect_ratio || "9:16"),
              aspect_ratio: parsed.aspect_ratio || "9:16",
              style: parsed.style || "3D Pixar Animation",
            },
          ],
          null,
          2
        );
      }
      return JSON.stringify(parsed, null, 2);
    } catch {
      // fallback
    }
  }

  const promptCleaned = text
    .replace(/^\[?\s*\{\s*"(?:thumbnail_prompt|prompt)":\s*"?/i, "")
    .replace(/"?\s*\}\s*\]?$/i, "")
    .replace(/Bạn có duyệt Prompt.*$/i, "")
    .trim();

  const sanitized = sanitizeImagePrompt(promptCleaned || text, "9:16");

  return JSON.stringify(
    [
      {
        prompt: sanitized,
        thumbnail_prompt: sanitized,
        aspect_ratio: "9:16",
        visual_hook: "Ultra high contrast, Stop-the-scroll expression",
        safe_zone_rule: "Keep 20% margin from top and bottom edges",
      },
    ],
    null,
    2
  );
}

/**
 * Builds a Unified Master JSON Package containing all 3 prompts + scenes automation + metadata
 */
export function buildUnifiedScriptJsonPackage(
  inputs: any,
  stepsContent: { step1?: string; step2?: string; step3?: string; step4?: string; step5?: string }
): string {
  // Parse Step 2 (Storyboard)
  let storyboardJson: any = null;
  try {
    const s2Clean = cleanStep2StoryboardJson(stepsContent.step2 || "");
    storyboardJson = JSON.parse(s2Clean);
  } catch {
    storyboardJson = stepsContent.step2 || "";
  }

  // Parse Step 3 (Video Prompts)
  let videoPromptsJson: any = null;
  try {
    const s3Clean = cleanStep3VideoPromptsJson(stepsContent.step3 || "");
    videoPromptsJson = JSON.parse(s3Clean);
  } catch {
    videoPromptsJson = stepsContent.step3 || "";
  }

  // Parse Step 4 (Thumbnail)
  let thumbnailJson: any = null;
  try {
    const s4Clean = cleanStep4ThumbnailJson(stepsContent.step4 || "");
    thumbnailJson = JSON.parse(s4Clean);
  } catch {
    thumbnailJson = stepsContent.step4 || "";
  }

  // Parse Step 5 (Scenes Automation)
  let scenesJson: any = null;
  try {
    const s5Clean = cleanStep5JsonOutput(stepsContent.step5 || "", "compact");
    scenesJson = JSON.parse(s5Clean);
  } catch {
    scenesJson = stepsContent.step5 || "";
  }

  const masterPackage = {
    title: inputs?.title || inputs?.topic || "Kịch bản Sức Khỏe 3D",
    metadata: {
      mascotName: inputs?.mascotName || "Trà Dây Bstar",
      regionAccent: inputs?.regionAccent || "south",
      style: inputs?.style || inputs?.visualStyle || "3D Pixar Animation",
      voice: inputs?.voice || inputs?.voiceStyle || "Giọng Nam Sài Gòn",
      generatedAt: new Date().toISOString(),
    },
    prompts: {
      storyboard_prompt: storyboardJson,
      video_prompts_n_plus_1: videoPromptsJson,
      thumbnail_prompt: thumbnailJson,
    },
    automation_scenes: scenesJson,
  };

  return JSON.stringify(masterPackage, null, 2);
}

