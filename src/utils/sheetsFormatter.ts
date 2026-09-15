import {
  cleanStep2StoryboardJson,
  cleanStep3VideoPromptsJson,
  cleanStep4ThumbnailJson,
  cleanStep5JsonOutput,
  countDialogueScenes,
  sanitizeImagePrompt,
} from "./jsonCleaner";

export interface Sheets5ColumnsRow {
  dialogues: string;  // Cột 1: Lời thoại (Cột R)
  storyboard: string; // Cột 2: Copy Tạo storyboard (Cột S)
  scenes: string;     // Cột 3: Image of Sences / Images (Cột T - N+1 Images)
  thumbnail: string;  // Cột 4: Copy Tạo Thumbnail (Cột U)
  videoScripts: string; // Cột 5: Video Scripts (Cột V - N scenes = N lời thoại)
}

/**
 * Escapes a cell value for TSV / CSV copying to clipboard or file.
 * Wraps in quotes and escapes internal quotes if the content has newlines, tabs, or quotes.
 */
export function escapeTsvCell(val: string | undefined | null): string {
  if (!val) return "";
  let str = String(val).trim();
  if (str.includes("\t") || str.includes("\n") || str.includes("\r") || str.includes('"')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Extracts raw prompt text from step 2 (Storyboard)
 */
export function extractStoryboardForSheets(rawStep2: string): string {
  if (!rawStep2) return "";
  const cleaned = cleanStep2StoryboardJson(rawStep2);
  try {
    const parsed = JSON.parse(cleaned);
    if (Array.isArray(parsed) && (parsed[0]?.storyboard_prompt || parsed[0]?.prompt)) {
      return parsed[0].storyboard_prompt || parsed[0].prompt;
    }
  } catch {
    // fallback
  }
  return cleaned || rawStep2;
}

/**
 * Extracts clean dialogues text from step 1
 */
export function extractDialoguesForSheets(rawStep1: string): string {
  if (!rawStep1) return "";
  let text = rawStep1.trim();
  // Strip trailing approval questions and separator rules
  text = text.replace(/\n*\s*(?:\*\*|__)?\s*Bạn có duyệt[^?\n]*\??\s*(?:\*\*|__)?\s*$/i, "");
  text = text.replace(/\n*\s*(?:\*\*|__)?\s*Bạn có đồng ý[^?\n]*\??\s*(?:\*\*|__)?\s*$/i, "");
  text = text.replace(/\n*\s*(?:\*\*|__)?\s*Hãy cho tôi biết[^?\n]*\??\s*(?:\*\*|__)?\s*$/i, "");
  text = text.replace(/\n+\s*---\s*$/g, "").trim();
  return text;
}

/**
 * Extracts clean image prompts (Image of Sences / Step 3) for Sheets (Image 1, Image 2, ..., Image N+1)
 * Strictly zero speech dialogue text in image prompts.
 */
export function extractScenesForSheets(rawStep3: string): string {
  if (!rawStep3) return "";
  const cleaned = cleanStep3VideoPromptsJson(rawStep3);
  try {
    const parsed = JSON.parse(cleaned);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed
        .map((p, idx) => {
          const imgNum = p.image || p.scene || (idx + 1);
          const imageTitle = `Image ${imgNum}`.trim();
          const promptText = sanitizeImagePrompt(p.prompt || "");
          return `${imageTitle}: ${promptText}`;
        })
        .join("\n\n");
    }
  } catch {
    // fallback
  }
  return cleaned || rawStep3;
}

/**
 * Extracts raw thumbnail prompt for step 4
 */
export function extractThumbnailForSheets(rawStep4: string): string {
  if (!rawStep4) return "";
  const cleaned = cleanStep4ThumbnailJson(rawStep4);
  try {
    const parsed = JSON.parse(cleaned);
    if (Array.isArray(parsed) && (parsed[0]?.thumbnail_prompt || parsed[0]?.prompt)) {
      return parsed[0].thumbnail_prompt || parsed[0].prompt;
    }
  } catch {
    // fallback
  }
  return cleaned || rawStep4;
}

/**
 * Extracts compact JSON Video Scripts automation for step 5 without outer [ and ] brackets
 * Automatically ensures exact N scenes matching N dialogues from Step 1 (stripping any accidental scene N+1).
 */
export function extractVideoScriptsForSheets(rawStep5: string, rawStep1?: string): string {
  if (!rawStep5) return "";
  const maxScenes = rawStep1 ? countDialogueScenes(rawStep1) : undefined;
  const cleaned = cleanStep5JsonOutput(rawStep5, "compact", maxScenes);
  try {
    let parsed = JSON.parse(cleaned);
    if (Array.isArray(parsed)) {
      if (typeof maxScenes === "number" && maxScenes > 0 && parsed.length > maxScenes) {
        parsed = parsed.slice(0, maxScenes);
      }
      // Output each scene as a single line JSON object, joined by comma and newline, without outer [ and ]
      return parsed.map((item) => JSON.stringify(item)).join(",\n");
    } else if (typeof parsed === "object" && parsed !== null && Array.isArray(parsed.scenes)) {
      let scenes = parsed.scenes;
      if (typeof maxScenes === "number" && maxScenes > 0 && scenes.length > maxScenes) {
        scenes = scenes.slice(0, maxScenes);
      }
      return scenes.map((item: any) => JSON.stringify(item)).join(",\n");
    }
  } catch {
    // Fallback: strip leading '[' and trailing ']' if present
    let str = (cleaned || rawStep5).trim();
    if (str.startsWith("[") && str.endsWith("]")) {
      str = str.slice(1, -1).trim();
    }
    return str;
  }
  let str = (cleaned || rawStep5).trim();
  if (str.startsWith("[") && str.endsWith("]")) {
    str = str.slice(1, -1).trim();
  }
  return str;
}

/**
 * Builds the 5-column row matching the exact user layout:
 * Cột 1 (R): Lời thoại
 * Cột 2 (S): Copy Tạo storyboard
 * Cột 3 (T): Image of Sences (N+1 Images)
 * Cột 4 (U): Copy Tạo Thumbnail
 * Cột 5 (V): Video Scripts (N scenes = N thoại)
 */
export function buildSheets5ColumnsRow(stepsContent: {
  step1?: string;
  step2?: string;
  step3?: string;
  step4?: string;
  step5?: string;
}): Sheets5ColumnsRow {
  return {
    dialogues: extractDialoguesForSheets(stepsContent.step1 || ""),
    storyboard: extractStoryboardForSheets(stepsContent.step2 || ""),
    scenes: extractScenesForSheets(stepsContent.step3 || ""),
    thumbnail: extractThumbnailForSheets(stepsContent.step4 || ""),
    videoScripts: extractVideoScriptsForSheets(stepsContent.step5 || "", stepsContent.step1 || ""),
  };
}

/**
 * Converts a 5-column row to a TSV string (1 single row with 5 tab-separated cells)
 * When pasted in Google Sheets, it distributes automatically into:
 * [Lời thoại] [Copy Tạo storyboard] [Image of Sences] [Copy Tạo Thumbnail] [Video Scripts]
 */
export function rowToTsvString(row: Sheets5ColumnsRow): string {
  return [
    escapeTsvCell(row.dialogues),
    escapeTsvCell(row.storyboard),
    escapeTsvCell(row.scenes),
    escapeTsvCell(row.thumbnail),
    escapeTsvCell(row.videoScripts),
  ].join("\t");
}

/**
 * Converts multiple rows to a full Google Sheets copyable text (with or without headers)
 */
export function rowsToTsvTable(rows: Sheets5ColumnsRow[], includeHeader = false): string {
  const header = [
    "Lời thoại",
    "Copy Tạo storyboard",
    "Image of Sences",
    "Copy Tạo Thumbnail",
    "Video Scripts",
  ].join("\t");

  const body = rows.map((r) => rowToTsvString(r)).join("\n");
  return includeHeader ? `${header}\n${body}` : body;
}

export const SHEETS_COLUMN_NAMES: Record<keyof Sheets5ColumnsRow, string> = {
  dialogues: "Lời thoại",
  storyboard: "Copy Tạo storyboard",
  scenes: "Image of Sences",
  thumbnail: "Copy Tạo Thumbnail",
  videoScripts: "Video Scripts",
};

/**
 * Extracts a single column vertically across multiple rows (e.g. all Dialogues or all Video Scripts)
 */
export function rowsToSingleColumnTsv(
  rows: Sheets5ColumnsRow[],
  columnKey: keyof Sheets5ColumnsRow,
  includeHeader = false
): string {
  const headerName = SHEETS_COLUMN_NAMES[columnKey];
  const body = rows.map((r) => escapeTsvCell(r[columnKey])).join("\n");
  return includeHeader ? `${headerName}\n${body}` : body;
}

/**
 * Downloads a CSV file with UTF-8 BOM so Excel / Google Sheets preserves Vietnamese characters
 */
export function downloadSheetsCsv(rows: Sheets5ColumnsRow[], filename = "kich_ban_5_cot_sheets.csv"): void {
  const header = [
    '"Lời thoại"',
    '"Copy Tạo storyboard"',
    '"Sences"',
    '"Copy Tạo Thumbnail"',
    '"Video Scripts"',
  ].join(",");

  const csvBody = rows
    .map((r) =>
      [
        escapeTsvCell(r.dialogues),
        escapeTsvCell(r.storyboard),
        escapeTsvCell(r.scenes),
        escapeTsvCell(r.thumbnail),
        escapeTsvCell(r.videoScripts),
      ].join(",")
    )
    .join("\r\n");

  const fullCsv = `\uFEFF${header}\r\n${csvBody}`;
  const blob = new Blob([fullCsv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
