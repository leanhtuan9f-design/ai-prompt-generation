import { SavedScript } from "../types";

export interface ProjectAngleSummary {
  id: string;
  projectName: string;
  topic: string;
  targetAudience: string;
  problemAngle?: string;
  solutionMechanism?: string;
  visualMetaphor?: string;
  createdAt: string;
}

const PROJECT_STORAGE_KEY = "prompt_studio_project_memory_bank";
const ACTIVE_PROJECT_KEY = "prompt_studio_active_project_name";
const PROJECT_LIST_KEY = "prompt_studio_all_project_names";

const DEFAULT_PROJECTS = ["Trà Dây Bstar", "Chăm sóc dạ dày", "Sức khỏe toàn diện"];

/**
 * Trích xuất tóm tắt góc giải pháp và vấn đề từ kịch bản để lưu vào bộ nhớ dự án
 */
export function extractAngleFeaturesFromScript(
  projectName: string,
  topic: string,
  targetAudience: string,
  stepsContentText: string
): ProjectAngleSummary {
  // Trích xuất góc vấn đề & giải pháp từ nội dung bước 1 hoặc tiêu đề
  const cleanTopic = topic.trim();
  let problemAngle = cleanTopic;
  let solutionMechanism = "";
  let visualMetaphor = "";

  // Tự động phân tích nhanh cơ chế giải pháp đã dùng
  if (stepsContentText) {
    const lines = stepsContentText.split("\n");
    const solLines = lines.filter(
      (l) =>
        l.toLowerCase().includes("giải pháp") ||
        l.toLowerCase().includes("cơ chế") ||
        l.toLowerCase().includes("solution") ||
        l.toLowerCase().includes("thảo mộc") ||
        l.toLowerCase().includes("thói quen")
    );
    if (solLines.length > 0) {
      solutionMechanism = solLines.slice(0, 2).join("; ").replace(/[*#]/g, "").slice(0, 200);
    }

    const visualLines = lines.filter(
      (l) =>
        l.toLowerCase().includes("bối cảnh") ||
        l.toLowerCase().includes("hình ảnh") ||
        l.toLowerCase().includes("setting") ||
        l.toLowerCase().includes("3d")
    );
    if (visualLines.length > 0) {
      visualMetaphor = visualLines.slice(0, 1).join("").replace(/[*#]/g, "").slice(0, 150);
    }
  }

  return {
    id: `angle_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    projectName: (projectName || "Mặc định").trim(),
    topic: cleanTopic,
    targetAudience: (targetAudience || "").trim(),
    problemAngle,
    solutionMechanism: solutionMechanism || "Cơ chế phục hồi tự nhiên & thói quen sinh hoạt",
    visualMetaphor: visualMetaphor || "Không gian sinh hoạt trực quan",
    createdAt: new Date().toISOString(),
  };
}

/**
 * Lấy danh sách tên tất cả các dự án đã lưu
 */
export function getSavedProjectNames(): string[] {
  try {
    const listRaw = localStorage.getItem(PROJECT_LIST_KEY);
    let explicitNames: string[] = listRaw ? JSON.parse(listRaw) : [];
    
    // Đọc thêm từ angle memory bank
    const raw = localStorage.getItem(PROJECT_STORAGE_KEY);
    const angleList: ProjectAngleSummary[] = raw ? JSON.parse(raw) : [];
    const angleNames = angleList.map((item) => item.projectName.trim()).filter(Boolean);

    // Merge unique
    const merged = Array.from(new Set([...DEFAULT_PROJECTS, ...explicitNames, ...angleNames])).filter(Boolean);
    return merged;
  } catch (e) {
    return DEFAULT_PROJECTS;
  }
}

/**
 * Lưu danh sách dự án
 */
export function saveProjectNamesList(names: string[]): void {
  try {
    const unique = Array.from(new Set(names.map((n) => n.trim()))).filter(Boolean);
    localStorage.setItem(PROJECT_LIST_KEY, JSON.stringify(unique));
  } catch (e) {
    console.error("Lỗi khi lưu danh sách dự án:", e);
  }
}

/**
 * Tạo một dự án mới
 */
export function createNewProject(projectName: string): string[] {
  const clean = projectName.trim();
  if (!clean) return getSavedProjectNames();
  
  const currentList = getSavedProjectNames();
  if (!currentList.includes(clean)) {
    currentList.unshift(clean);
    saveProjectNamesList(currentList);
  }
  setActiveProjectName(clean);
  return currentList;
}

/**
 * Đổi tên một dự án (đồng bộ đổi tên cả trong bộ nhớ kịch bản)
 */
export function renameProject(oldName: string, newName: string): { success: boolean; projects: string[] } {
  const oldClean = oldName.trim();
  const newClean = newName.trim();
  if (!oldClean || !newClean || oldClean === newClean) {
    return { success: false, projects: getSavedProjectNames() };
  }

  const currentList = getSavedProjectNames();
  const updatedList = currentList.map((p) => (p.toLowerCase() === oldClean.toLowerCase() ? newClean : p));
  saveProjectNamesList(updatedList);

  // Đổi tên trong bộ nhớ góc kịch bản
  try {
    const raw = localStorage.getItem(PROJECT_STORAGE_KEY);
    if (raw) {
      const list: ProjectAngleSummary[] = JSON.parse(raw);
      const updatedAngles = list.map((item) =>
        item.projectName.toLowerCase() === oldClean.toLowerCase()
          ? { ...item, projectName: newClean }
          : item
      );
      localStorage.setItem(PROJECT_STORAGE_KEY, JSON.stringify(updatedAngles));
    }
  } catch (e) {
    console.error(e);
  }

  // Đổi tên dự án active nếu đang chọn dự án cũ
  if (getActiveProjectName().toLowerCase() === oldClean.toLowerCase()) {
    setActiveProjectName(newClean);
  }

  return { success: true, projects: updatedList };
}

/**
 * Xóa một dự án và bộ nhớ của nó
 */
export function deleteProject(projectName: string): string[] {
  const clean = projectName.trim();
  const currentList = getSavedProjectNames();
  const updatedList = currentList.filter((p) => p.toLowerCase() !== clean.toLowerCase());
  
  const finalList = updatedList.length > 0 ? updatedList : ["Trà Dây Bstar"];
  saveProjectNamesList(finalList);
  clearProjectMemory(clean);

  if (getActiveProjectName().toLowerCase() === clean.toLowerCase()) {
    setActiveProjectName(finalList[0]);
  }

  return finalList;
}

/**
 * Lấy tên dự án hiện tại đang kích hoạt
 */
export function getActiveProjectName(): string {
  const saved = localStorage.getItem(ACTIVE_PROJECT_KEY);
  if (saved && saved.trim()) return saved.trim();
  return "Trà Dây Bstar";
}

/**
 * Đặt tên dự án hiện tại
 */
export function setActiveProjectName(name: string): void {
  if (name && name.trim()) {
    const clean = name.trim();
    localStorage.setItem(ACTIVE_PROJECT_KEY, clean);
    
    // Đảm bảo tên này có trong danh sách dự án
    const currentList = getSavedProjectNames();
    if (!currentList.includes(clean)) {
      saveProjectNamesList([clean, ...currentList]);
    }
  }
}

/**
 * Lấy toàn bộ lịch sử các góc giải pháp của một dự án
 */
export function getProjectAngles(projectName: string): ProjectAngleSummary[] {
  try {
    const raw = localStorage.getItem(PROJECT_STORAGE_KEY);
    if (!raw) return [];
    const list: ProjectAngleSummary[] = JSON.parse(raw);
    const targetProject = (projectName || "Mặc định").trim().toLowerCase();
    return list.filter((item) => item.projectName.trim().toLowerCase() === targetProject);
  } catch (e) {
    return [];
  }
}

/**
 * Thêm một góc kịch bản mới vào bộ nhớ dự án
 */
export function saveProjectAngle(angle: ProjectAngleSummary): void {
  try {
    const raw = localStorage.getItem(PROJECT_STORAGE_KEY);
    const list: ProjectAngleSummary[] = raw ? JSON.parse(raw) : [];
    
    // Kiểm tra xem đã có topic tương tự chưa, nếu có thì cập nhật, chưa thì thêm mới
    const existingIndex = list.findIndex(
      (item) =>
        item.projectName.toLowerCase() === angle.projectName.toLowerCase() &&
        item.topic.toLowerCase() === angle.topic.toLowerCase()
    );

    if (existingIndex >= 0) {
      list[existingIndex] = angle;
    } else {
      list.unshift(angle);
    }

    // Giữ tối đa 100 góc gần nhất cho mỗi dự án
    localStorage.setItem(PROJECT_STORAGE_KEY, JSON.stringify(list.slice(0, 300)));
  } catch (e) {
    console.error("Lỗi khi lưu project angle:", e);
  }
}

/**
 * Xóa một góc kịch bản khỏi bộ nhớ
 */
export function deleteProjectAngle(id: string): void {
  try {
    const raw = localStorage.getItem(PROJECT_STORAGE_KEY);
    if (!raw) return;
    const list: ProjectAngleSummary[] = JSON.parse(raw);
    const filtered = list.filter((item) => item.id !== id);
    localStorage.setItem(PROJECT_STORAGE_KEY, JSON.stringify(filtered));
  } catch (e) {
    console.error(e);
  }
}

/**
 * Xóa toàn bộ bộ nhớ của 1 dự án
 */
export function clearProjectMemory(projectName: string): void {
  try {
    const raw = localStorage.getItem(PROJECT_STORAGE_KEY);
    if (!raw) return;
    const list: ProjectAngleSummary[] = JSON.parse(raw);
    const targetProject = (projectName || "").trim().toLowerCase();
    const filtered = list.filter((item) => item.projectName.trim().toLowerCase() !== targetProject);
    localStorage.setItem(PROJECT_STORAGE_KEY, JSON.stringify(filtered));
  } catch (e) {
    console.error(e);
  }
}

/**
 * Tự động tạo đoạn chỉ thị Anti-Duplication động cho AI Prompt dựa trên Dự án hiện tại
 */
export function buildDynamicAntiDuplicationInstruction(projectName: string, currentTopic: string): string {
  const targetProject = (projectName || "").trim();
  if (!targetProject) return "";

  const previousAngles = getProjectAngles(targetProject);
  if (previousAngles.length === 0) {
    return `
[CƠ CHẾ KIỂM SOÁT ĐA DẠNG HÓA GÓC KỊCH BẢN THEO DỰ ÁN: "${targetProject.toUpperCase()}"]
- Đây là kịch bản đầu tiên của dự án "${targetProject}". Hãy khai thác một góc tiếp cận sắc bén, đánh thẳng vào nỗi đau then chốt và cơ chế khoa học thuyết phục.
`;
  }

  // Lấy tối đa 8 góc đã làm gần nhất để tránh tràn token nhưng đủ để AI đổi mới
  const recentAngles = previousAngles.slice(0, 8);
  const angleListFormatted = recentAngles
    .map((a, idx) => `  ${idx + 1}. Chủ đề đã làm: "${a.topic}" (Cơ chế đã dùng: ${a.solutionMechanism || "Giải pháp thói quen & thảo mộc"})`)
    .join("\n");

  return `
[CƠ CHẾ KIỂM SOÁT CHỐNG TRÙNG LẶP & ĐA DẠNG HÓA GÓC TIẾP CẬN DỰ ÁN: "${targetProject.toUpperCase()}"]
⚠️ BỘ NHỚ CÁC GÓC TIẾP CẬN / GIẢI PHÁP ĐÃ TRIỂN KHAI TRONG DỰ ÁN NÀY:
${angleListFormatted}

👉 YÊU CẦU BẮT BUỘC ĐỔI MỚI TOÀN DIỆN CHO KỊCH BẢN HIỆN TẠI ("${currentTopic || ""}"):
1. TUYỆT ĐỐI KHÔNG lặp lại cùng một lối mòn phân tích hay cùng một câu chuyện/tình huống của các kịch bản trên.
2. ĐỔI MỚI GÓC HOOK & BỐI CẢNH MỞ ĐẦU: Sử dụng lát cắt cuộc sống, đối thoại, hoặc thói quen đời thường KHÁC BIỆT 100% (ví dụ: góc công việc, góc gia đình, góc tiệc tùng, góc ngộ nhận sai lầm, hoặc góc tâm lý lo âu).
3. ĐỔI MỚI CƠ CHẾ GIẢI THÍCH & ẨN DỤ THỊ GIÁC: Tìm một góc cơ chế khoa học hoặc mẹo thực hành độc đáo mới chưa từng khai thác ở các kịch bản trước.
`;
}

/**
 * Tính điểm tương đồng ngữ nghĩa / từ vựng cơ bản giữa 2 chuỗi (Jaccard + Bigram Similarity)
 * Trả về giá trị 0.0 -> 1.0 (1.0 = 100% trùng)
 */
export function calculateTopicSimilarity(str1: string, str2: string): number {
  if (!str1 || !str2) return 0;
  
  const clean1 = str1.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, " ").trim();
  const clean2 = str2.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, " ").trim();

  if (clean1 === clean2) return 1;

  const words1 = clean1.split(/\s+/).filter((w) => w.length > 1);
  const words2 = clean2.split(/\s+/).filter((w) => w.length > 1);

  if (words1.length === 0 || words2.length === 0) return 0;

  // Word-level Jaccard
  const set1 = new Set(words1);
  const set2 = new Set(words2);

  let intersection = 0;
  set1.forEach((w) => {
    if (set2.has(w)) intersection++;
  });

  const union = new Set([...words1, ...words2]).size;
  const wordScore = union === 0 ? 0 : intersection / union;

  // Bigram check for phrase overlap
  const getBigrams = (words: string[]) => {
    const bigrams = new Set<string>();
    for (let i = 0; i < words.length - 1; i++) {
      bigrams.add(`${words[i]}_${words[i + 1]}`);
    }
    return bigrams;
  };

  const bi1 = getBigrams(words1);
  const bi2 = getBigrams(words2);
  let biIntersection = 0;
  bi1.forEach((b) => {
    if (bi2.has(b)) biIntersection++;
  });
  const biUnion = new Set([...Array.from(bi1), ...Array.from(bi2)]).size;
  const biScore = biUnion === 0 ? 0 : biIntersection / biUnion;

  return wordScore * 0.6 + biScore * 0.4;
}

/**
 * Kiểm tra xem 1 chủ đề mới có nguy cơ trùng với chủ đề nào trong danh sách kịch bản cũ của dự án không
 */
export function checkTopicDuplicateWithProject(
  topic: string,
  projectName: string,
  threshold: number = 0.55
): { isDuplicate: boolean; score: number; matchedTopic?: string } {
  const previous = getProjectAngles(projectName);
  let highestScore = 0;
  let matchedTopic = "";

  for (const prev of previous) {
    const score = calculateTopicSimilarity(topic, prev.topic);
    if (score > highestScore) {
      highestScore = score;
      matchedTopic = prev.topic;
    }
  }

  return {
    isDuplicate: highestScore >= threshold,
    score: Math.round(highestScore * 100),
    matchedTopic: highestScore >= threshold ? matchedTopic : undefined,
  };
}
