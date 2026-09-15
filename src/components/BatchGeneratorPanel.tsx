import React, { useState, useRef, useEffect } from "react";
import {
  Layers,
  Play,
  Pause,
  Trash2,
  Download,
  Plus,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FileText,
  Sparkles,
  ChevronRight,
  RefreshCw,
  ExternalLink,
  Settings,
  Sliders,
  Copy,
  Check,
  Zap,
  Cpu,
  RotateCcw,
  Clock,
  Target,
  User,
  Table,
  ShieldCheck,
  ShieldAlert,
  Mic,
  FileSpreadsheet,
  SlidersHorizontal,
} from "lucide-react";
import { BatchItem, BatchConfig } from "../types/batch";
import { PromptInputs, StepsContent, SavedScript, PromptTemplate } from "../types";
import { runBatchConcurrent, exportBatchToJson } from "../services/batchService";
import { getStoredTemplates, getDefaultTemplateId } from "../utils/templateStorage";
import { HelpTooltip } from "./HelpTooltip";
import {
  REGIONAL_ACCENT_OPTIONS,
  REGIONAL_VOICE_OPTIONS,
  matchRegionalVoice,
  VIDEO_STYLE_OPTIONS,
  ASPECT_RATIO_OPTIONS,
  CHARACTER_GENDER_OPTIONS,
} from "../data/constants";
import {
  cleanStep5JsonOutput,
  cleanStep2StoryboardJson,
  cleanStep3VideoPromptsJson,
  cleanStep4ThumbnailJson,
  buildUnifiedScriptJsonPackage,
} from "../utils/jsonCleaner";
import {
  Sheets5ColumnsRow,
  buildSheets5ColumnsRow,
  rowToTsvString,
  rowsToTsvTable,
  rowsToSingleColumnTsv,
  SHEETS_COLUMN_NAMES,
  downloadSheetsCsv,
} from "../utils/sheetsFormatter";
import {
  getSavedProjectNames,
  getActiveProjectName,
  setActiveProjectName,
  getProjectAngles,
  checkTopicDuplicateWithProject,
  clearProjectMemory,
} from "../utils/projectMemory";
import { ProjectManagerBar } from "./ProjectManagerBar";
import { SheetsTableViewer } from "./SheetsTableViewer";
import { BatchSheetsExportModal } from "./BatchSheetsExportModal";

interface BatchGeneratorPanelProps {
  onLoadSingleScript: (inputs: PromptInputs, stepsContent: StepsContent) => void;
  showToast: (text: string, type?: "success" | "error") => void;
  onOpenSettingsModal?: (tab?: "ai" | "threading" | "presets") => void;
  onAutoSaveScript?: (inputs: PromptInputs, stepsContent: StepsContent) => void;
}

const SAMPLE_BATCH_TOPICS = [
  "Trào ngược dạ dày ban đêm: Nguyên nhân vì sao cứ nằm xuống là đắng miệng, ợ chua và cách xử lý tại giường",
  "Đau rát thượng vị sau bữa ăn: 3 thói quen ăn uống sai lầm của dân văn phòng khiến niêm mạc dạ dày bị bào mòn",
  "Khuẩn HP dạ dày có tự hết được không? Cơ chế thảo mộc Trà Dây ức chế vi khuẩn và làm lành ổ loét",
  "Uống nước chè đặc hay cà phê sáng lúc đói bụng: Tác hại tàn phá dạ dày âm thầm ít ai ngờ tới",
  "Người hay bị đầy hơi, chướng bụng khó tiêu: Hướng dẫn mẹo xoa bụng và dùng nước ấm thảo mộc phục hồi tiêu hóa",
];

export const BatchGeneratorPanel: React.FC<BatchGeneratorPanelProps> = ({
  onLoadSingleScript,
  showToast,
  onOpenSettingsModal,
  onAutoSaveScript,
}) => {
  const [bulkInputText, setBulkInputText] = useState("");
  const [items, setItems] = useState<BatchItem[]>(() => {
    const local = localStorage.getItem("batch_generator_items");
    if (local) {
      try {
        const parsed: BatchItem[] = JSON.parse(local);
        // Tự động khôi phục các mục bị kẹt ở trạng thái 'processing' từ phiên trước về 'pending'
        return parsed.map((item) =>
          item.status === "processing"
            ? {
                ...item,
                status: "pending" as const,
                currentStep: 0,
                progressPercent: 0,
                activeThreadIndex: undefined,
              }
            : item
        );
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  const [isRunning, setIsRunning] = useState(false);
  const stopRequestedRef = useRef(false);

  // Load config from settings storage
  const [config, setConfig] = useState<BatchConfig>(() => {
    const localConcurrency = parseInt(localStorage.getItem("batch_concurrency") || "3", 10);
    const localRetry = parseInt(localStorage.getItem("batch_retry_attempts") || "2", 10);
    const localDelay = parseInt(localStorage.getItem("batch_delay_ms") || "350", 10);
    const localAutoSave = localStorage.getItem("batch_auto_save_history") !== "false";
    const localRunScript12 = localStorage.getItem("batch_run_script_step12") !== "false";
    const localRunVisual345 = localStorage.getItem("batch_run_visual_step345") !== "false";

    return {
      mascotName: "",
      style: "3D Pixar Animation, Soft Peach, Cinematic Warm Lighting",
      voice: "Southern Vietnamese Saigon female voice 25-34 years old, gentle warm and soothing tone, 105-110 wpm",
      regionAccent: "south",
      pacingWpm: 105,
      aspectRatio: "9:16",
      characterAge: "",
      characterGender: "Vietnamese female",
      femaleAge: "",
      targetAudience: "",
      concurrency: isNaN(localConcurrency) ? 3 : Math.max(1, Math.min(10, localConcurrency)),
      retryAttempts: isNaN(localRetry) ? 2 : localRetry,
      delayBetweenStepsMs: isNaN(localDelay) ? 350 : localDelay,
      autoSaveToHistory: localAutoSave,
      runScriptStep12: localRunScript12,
      runVisualStep345: localRunVisual345,
    };
  });

  const [selectedItemDetail, setSelectedItemDetail] = useState<BatchItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeThreadsMap, setActiveThreadsMap] = useState<Record<number, string>>({});
  const [inspectorTab, setInspectorTab] = useState<
    "sheets" | "package" | "video" | "storyboard" | "thumbnail" | "automation" | "dialogue"
  >("sheets");
  const [tabCopied, setTabCopied] = useState(false);
  const [copiedAllSheets, setCopiedAllSheets] = useState(false);
  const [copiedRowId, setCopiedRowId] = useState<string | null>(null);
  const [isBatchSheetsModalOpen, setIsBatchSheetsModalOpen] = useState(false);

  // Dynamic Prompt Templates state
  const [availableTemplates, setAvailableTemplates] = useState<PromptTemplate[]>(() => getStoredTemplates());
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(() => {
    const defId = getDefaultTemplateId();
    const stored = getStoredTemplates();
    if (defId && stored.some((t) => t.id === defId)) return defId;
    return stored[0]?.id || "tpl_bstar_standard";
  });

  // Listen for template updates
  useEffect(() => {
    const handleTemplateUpdate = () => {
      const refreshed = getStoredTemplates();
      setAvailableTemplates(refreshed);
      const defId = getDefaultTemplateId();
      if (defId && refreshed.some((t) => t.id === defId)) {
        // Keep current if still valid, otherwise default
        setSelectedTemplateId((prev) => (refreshed.some((t) => t.id === prev) ? prev : defId));
      }
    };

    window.addEventListener("prompt_templates_updated", handleTemplateUpdate);
    window.addEventListener("storage", handleTemplateUpdate);
    return () => {
      window.removeEventListener("prompt_templates_updated", handleTemplateUpdate);
      window.removeEventListener("storage", handleTemplateUpdate);
    };
  }, []);

  // Update batch config when template changes
  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplateId(templateId);
    const tpl = availableTemplates.find((t) => t.id === templateId);
    if (tpl) {
      setConfig((prev) => ({
        ...prev,
        style: tpl.data.style || prev.style,
        voice: tpl.data.voice || prev.voice,
        regionAccent: (tpl.data.regionAccent as any) || prev.regionAccent,
        pacingWpm: tpl.data.pacingWpm || prev.pacingWpm,
        aspectRatio: tpl.data.aspectRatio || prev.aspectRatio,
        characterGender: tpl.data.characterGender || prev.characterGender || "Vietnamese female",
      }));
      showToast(`Đã áp dụng Template: ${tpl.name}`, "success");
    }
  };

  // Sync items to localStorage
  useEffect(() => {
    localStorage.setItem("batch_generator_items", JSON.stringify(items));
  }, [items]);

  // Keep concurrency synced if changed in settings modal
  useEffect(() => {
    const handleStorageChange = () => {
      const c = parseInt(localStorage.getItem("batch_concurrency") || "3", 10);
      const r = parseInt(localStorage.getItem("batch_retry_attempts") || "2", 10);
      const d = parseInt(localStorage.getItem("batch_delay_ms") || "350", 10);
      const a = localStorage.getItem("batch_auto_save_history") !== "false";
      setConfig((prev) => ({
        ...prev,
        concurrency: isNaN(c) ? prev.concurrency : c,
        retryAttempts: isNaN(r) ? prev.retryAttempts : r,
        delayBetweenStepsMs: isNaN(d) ? prev.delayBetweenStepsMs : d,
        autoSaveToHistory: a,
      }));
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleUpdateConcurrency = (newCount: number) => {
    const count = Math.max(1, Math.min(10, newCount));
    setConfig((prev) => ({ ...prev, concurrency: count }));
    localStorage.setItem("batch_concurrency", count.toString());
  };

  const handleAddBulk = () => {
    const lines = bulkInputText
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length === 0) {
      showToast("Vui lòng nhập ít nhất 1 chủ đề kịch bản!", "error");
      return;
    }

    const tpl = availableTemplates.find((t) => t.id === selectedTemplateId) || availableTemplates[0];
    const resolvedTargetAudience = (config.targetAudience || tpl?.data.targetAudience || "").trim();

    if (!resolvedTargetAudience) {
      showToast("Vui lòng điền thông tin 'Đối tượng người xem (Target Audience)' bắt buộc trước khi thêm chủ đề!", "error");
      const el = document.getElementById("input-batch-target-audience");
      if (el) {
        el.focus();
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    const activeProject = (config.projectName || getActiveProjectName() || "Trà Dây Bstar").trim();

    const newItems: BatchItem[] = lines.map((topic, idx) => {
      const activeMascot = (config.mascotName || tpl?.data.mascotName || "Trà Dây Bstar").trim();
      const activeAge = (config.characterAge || config.femaleAge || tpl?.data.characterAge || tpl?.data.femaleAge || "25-34").trim();
      const activeGender = config.characterGender || tpl?.data.characterGender || "Vietnamese female";
      const dupCheck = checkTopicDuplicateWithProject(topic, activeProject);

      return {
        id: `batch_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 6)}`,
        projectName: activeProject,
        topic,
        coreContent: tpl?.data.coreContent 
          ? `Chủ đề: ${topic}. ${tpl.data.coreContent}`
          : `Chủ đề: ${topic}. Giải pháp sức khỏe an toàn với ${activeMascot}.`,
        targetAudience: resolvedTargetAudience,
        style: tpl?.data.style || config.style,
        voice: tpl?.data.voice || config.voice,
        mascotName: activeMascot,
        regionAccent: (tpl?.data.regionAccent as any) || config.regionAccent,
        pacingWpm: tpl?.data.pacingWpm || config.pacingWpm,
        characterAge: activeAge,
        characterGender: activeGender,
        femaleAge: activeAge,
        status: "pending",
        currentStep: 0,
        progressPercent: 0,
        duplicateWarning: dupCheck.isDuplicate ? dupCheck : undefined,
      };
    });

    setItems((prev) => [...prev, ...newItems]);
    setBulkInputText("");
    showToast(`Đã thêm ${newItems.length} chủ đề vào hàng đợi theo Template "${tpl?.name || 'Mặc định'}"!`, "success");
  };

  const handleAddSampleTopics = () => {
    const tpl = availableTemplates.find((t) => t.id === selectedTemplateId);
    if (tpl && tpl.data.title && tpl.data.title !== "Mẫu kịch bản") {
      // Create relevant variations
      const customSamples = [
        tpl.data.title,
        `Cách phân biệt triệu chứng và giải pháp an toàn cùng ${tpl.data.mascotName}`,
        `3 sai lầm phổ biến khi điều trị và phục hồi tự nhiên`,
        `Thực đơn ăn uống và thói quen sinh hoạt khoa học mỗi ngày`,
        `Giải đáp câu hỏi thường gặp: Cơ chế tác động và hiệu quả từ thảo dược`,
      ];
      setBulkInputText(customSamples.join("\n"));
    } else {
      const sampleText = SAMPLE_BATCH_TOPICS.join("\n");
      setBulkInputText(sampleText);
    }
  };

  const handleClearAll = () => {
    if (isRunning) {
      showToast("Vui lòng dừng quá trình tạo trước khi xóa danh sách!", "error");
      return;
    }
    setItems([]);
    setSelectedItemDetail(null);
    setActiveThreadsMap({});
    showToast("Đã dọn sạch danh sách hàng đợi!", "success");
  };

  const handleDeleteItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    if (selectedItemDetail?.id === id) {
      setSelectedItemDetail(null);
    }
  };

  /**
   * Helper thực thi batch concurrency
   */
  const executeBatch = async (batchItems: BatchItem[]) => {
    if (batchItems.length === 0) return;

    setIsRunning(true);
    stopRequestedRef.current = false;
    setActiveThreadsMap({});

    const activeTpl = availableTemplates.find((t) => t.id === selectedTemplateId) || availableTemplates[0];

    try {
      await runBatchConcurrent(batchItems, config, {
        isStopRequested: () => stopRequestedRef.current,

        onItemStart: (id, threadIndex) => {
          setActiveThreadsMap((prev) => ({ ...prev, [threadIndex]: id }));
          setItems((prev) =>
            prev.map((item) =>
              item.id === id
                ? {
                    ...item,
                    status: "processing",
                    currentStep: 1,
                    progressPercent: 10,
                    activeThreadIndex: threadIndex,
                    error: undefined,
                  }
                : item
            )
          );
        },

        onItemProgress: (id, stepNum, stepName, threadIndex) => {
          const stepPercentMap: Record<number, number> = {
            1: 15,
            2: 35,
            3: 55,
            4: 75,
            5: 90,
          };
          const percent = stepPercentMap[stepNum] || Math.min(90, Math.round(((stepNum - 0.5) / 5) * 100));

          setItems((prev) =>
            prev.map((item) =>
              item.id === id
                ? {
                    ...item,
                    status: "processing" as const,
                    currentStep: stepNum,
                    progressPercent: percent,
                    activeThreadIndex: threadIndex,
                  }
                : item
            )
          );
        },

        onItemComplete: (id, result, threadIndex) => {
          setActiveThreadsMap((prev) => {
            const next = { ...prev };
            delete next[threadIndex];
            return next;
          });

          setItems((prev) =>
            prev.map((item) => {
              if (item.id === id) {
                const updated = {
                  ...item,
                  status: "completed" as const,
                  currentStep: 5,
                  progressPercent: 100,
                  activeThreadIndex: undefined,
                  result,
                };
                if (selectedItemDetail?.id === id) {
                  setSelectedItemDetail(updated);
                }
                return updated;
              }
              return item;
            })
          );

          // Auto save to history if enabled
          if (config.autoSaveToHistory && onAutoSaveScript) {
            onAutoSaveScript(result.inputs, result.stepsContent);
          }
        },

        onItemError: (id, errorMessage, threadIndex) => {
          setActiveThreadsMap((prev) => {
            const next = { ...prev };
            delete next[threadIndex];
            return next;
          });

          setItems((prev) =>
            prev.map((item) =>
              item.id === id
                ? {
                    ...item,
                    status: "error" as const,
                    activeThreadIndex: undefined,
                    error: errorMessage,
                  }
                : item
            )
          );
        },
      }, activeTpl?.data);
    } catch (err: any) {
      console.error("Lỗi tổng quát batch:", err);
    } finally {
      setIsRunning(false);
      setActiveThreadsMap({});
      if (stopRequestedRef.current) {
        showToast("Đã dừng tiến trình tạo kịch bản.", "error");
      } else {
        showToast("Hoàn tất quy trình xử lý đa luồng kịch bản hàng loạt!", "success");
        // Tự động xóa nội dung các ô input sau khi hoàn thành task, chỉ để lại placeholder
        setBulkInputText("");
        setConfig((prev) => ({
          ...prev,
          characterAge: "",
          femaleAge: "",
          mascotName: "",
          targetAudience: "",
        }));
      }
    }
  };

  const handleStartBatch = async () => {
    const pendingItems = items.filter((i) => i.status === "pending" || i.status === "error");
    if (pendingItems.length === 0) {
      showToast("Không có kịch bản nào đang ở trạng thái Chờ tạo (Pending)!", "error");
      return;
    }

    const hasEmptyAudience = pendingItems.some((it) => !it.targetAudience?.trim());
    if (hasEmptyAudience && !config.targetAudience?.trim()) {
      showToast("Vui lòng điền 'Đối tượng người xem (Target Audience)' bắt buộc trước khi tạo kịch bản!", "error");
      const el = document.getElementById("input-batch-target-audience");
      if (el) {
        el.focus();
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    // Auto fill targetAudience if missing on items
    if (config.targetAudience?.trim()) {
      pendingItems.forEach((it) => {
        if (!it.targetAudience?.trim()) {
          it.targetAudience = config.targetAudience.trim();
        }
      });
    }

    showToast(`Bắt đầu chạy song song ${config.concurrency} luồng tạo kịch bản...`, "success");
    await executeBatch(pendingItems);
  };

  /**
   * Tạo / Tạo lại 1 kịch bản cụ thể (Single item generate/regenerate)
   */
  const handleGenerateSingleItem = async (id: string) => {
    const target = items.find((i) => i.id === id);
    if (!target) return;

    const resolvedAudience = (target.targetAudience || config.targetAudience || "").trim();
    if (!resolvedAudience) {
      showToast("Vui lòng điền 'Đối tượng người xem (Target Audience)' bắt buộc!", "error");
      const el = document.getElementById("input-batch-target-audience");
      if (el) {
        el.focus();
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    const resetItem: BatchItem = {
      ...target,
      targetAudience: resolvedAudience,
      status: "pending",
      currentStep: 0,
      progressPercent: 0,
      error: undefined,
      result: undefined,
    };

    setItems((prev) => prev.map((item) => (item.id === id ? resetItem : item)));
    if (selectedItemDetail?.id === id) {
      setSelectedItemDetail(resetItem);
    }

    showToast(`Bắt đầu tạo kịch bản: "${target.topic.slice(0, 35)}..."`, "success");
    await executeBatch([resetItem]);
  };

  /**
   * Tạo lại toàn bộ các mục bị lỗi
   */
  const handleRegenerateFailed = async () => {
    if (isRunning) {
      showToast("Đang có tiến trình chạy. Vui lòng dừng trước khi tạo lại!", "error");
      return;
    }

    const failedItems = items.filter((i) => i.status === "error");
    if (failedItems.length === 0) {
      showToast("Không có kịch bản nào bị lỗi để tạo lại!", "error");
      return;
    }

    const hasEmptyAudience = failedItems.some((it) => !it.targetAudience?.trim());
    if (hasEmptyAudience && !config.targetAudience?.trim()) {
      showToast("Vui lòng điền 'Đối tượng người xem (Target Audience)' bắt buộc!", "error");
      const el = document.getElementById("input-batch-target-audience");
      if (el) {
        el.focus();
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    const resetFailed = failedItems.map((item) => ({
      ...item,
      targetAudience: (item.targetAudience || config.targetAudience || "").trim(),
      status: "pending" as const,
      currentStep: 0,
      progressPercent: 0,
      error: undefined,
      result: undefined,
    }));

    setItems((prev) =>
      prev.map((it) => {
        const found = resetFailed.find((f) => f.id === it.id);
        return found || it;
      })
    );

    showToast(`Bắt đầu tạo lại ${resetFailed.length} kịch bản bị lỗi...`, "success");
    await executeBatch(resetFailed);
  };

  /**
   * Tạo lại tất cả các kịch bản trong hàng đợi từ đầu
   */
  const handleRegenerateAll = async () => {
    if (isRunning) {
      showToast("Đang có tiến trình chạy. Vui lòng dừng trước khi tạo lại!", "error");
      return;
    }

    if (items.length === 0) {
      showToast("Hàng đợi chưa có kịch bản nào!", "error");
      return;
    }

    const hasEmptyAudience = items.some((it) => !it.targetAudience?.trim());
    if (hasEmptyAudience && !config.targetAudience?.trim()) {
      showToast("Vui lòng điền 'Đối tượng người xem (Target Audience)' bắt buộc!", "error");
      const el = document.getElementById("input-batch-target-audience");
      if (el) {
        el.focus();
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    const resetAll = items.map((item) => ({
      ...item,
      targetAudience: (item.targetAudience || config.targetAudience || "").trim(),
      status: "pending" as const,
      currentStep: 0,
      progressPercent: 0,
      error: undefined,
      result: undefined,
    }));

    setItems(resetAll);
    setSelectedItemDetail(null);

    showToast(`Bắt đầu tạo lại toàn bộ ${resetAll.length} kịch bản từ đầu...`, "success");
    await executeBatch(resetAll);
  };

  const handleStopBatch = () => {
    stopRequestedRef.current = true;
    setIsRunning(false);
    showToast("Đang dừng tất cả các luồng sau khi hoàn tất bước hiện tại...", "error");
  };

  const handleExportAll = () => {
    const completedCount = items.filter((i) => i.status === "completed").length;
    if (completedCount === 0) {
      showToast("Chưa có kịch bản nào hoàn thành để xuất!", "error");
      return;
    }
    exportBatchToJson(items);
    showToast(`Đã xuất ${completedCount} kịch bản hoàn chỉnh ra file JSON!`, "success");
  };

  const handleCopyAllToSheets = (includeHeader = false) => {
    const completedItems = items.filter((i) => i.status === "completed" && i.result);
    if (completedItems.length === 0) {
      showToast("Chưa có kịch bản nào hoàn thành để sao chép!", "error");
      return;
    }
    const rows = completedItems.map((item) => buildSheets5ColumnsRow(item.result!.stepsContent));
    const tsv = rowsToTsvTable(rows, includeHeader);
    navigator.clipboard.writeText(tsv);
    setCopiedAllSheets(true);
    showToast(`Đã sao chép ${completedItems.length} kịch bản (5 cột chuẩn TSV)! Mở Google Sheet và bấm Ctrl+V để dán hàng loạt.`, "success");
    setTimeout(() => setCopiedAllSheets(false), 2500);
  };

  const [copiedColumnKey, setCopiedColumnKey] = useState<string | null>(null);

  const handleCopyColumnAll = (columnKey: keyof Sheets5ColumnsRow) => {
    const completedItems = items.filter((i) => i.status === "completed" && i.result);
    if (completedItems.length === 0) {
      showToast("Chưa có kịch bản nào hoàn thành!", "error");
      return;
    }
    const rows = completedItems.map((item) => buildSheets5ColumnsRow(item.result!.stepsContent));
    const tsv = rowsToSingleColumnTsv(rows, columnKey, false);
    navigator.clipboard.writeText(tsv);
    setCopiedColumnKey(columnKey);
    const colName = SHEETS_COLUMN_NAMES[columnKey];
    showToast(`Đã sao chép toàn bộ cột "${colName}" (${completedItems.length} kịch bản)!`, "success");
    setTimeout(() => setCopiedColumnKey(null), 2000);
  };

  const handleCopyItemSheetsRow = (item: BatchItem) => {
    if (!item.result) return;
    const row = buildSheets5ColumnsRow(item.result.stepsContent);
    const tsv = rowToTsvString(row);
    navigator.clipboard.writeText(tsv);
    setCopiedRowId(item.id);
    showToast(`Đã sao chép 1 dòng (5 cột) cho "${item.topic.slice(0, 30)}..."!`, "success");
    setTimeout(() => setCopiedRowId(null), 2000);
  };

  const handleDownloadAllCsv = () => {
    const completedItems = items.filter((i) => i.status === "completed" && i.result);
    if (completedItems.length === 0) {
      showToast("Chưa có kịch bản nào hoàn thành để tải CSV!", "error");
      return;
    }
    const rows = completedItems.map((item) => buildSheets5ColumnsRow(item.result!.stepsContent));
    downloadSheetsCsv(rows, `kich_ban_3d_5_cot_batch_${Date.now()}.csv`);
    showToast(`Đã tải xuống file CSV chứa ${completedItems.length} kịch bản!`, "success");
  };

  const handleCopyJson = (item: BatchItem) => {
    if (!item.result) return;
    const jsonStr = buildUnifiedScriptJsonPackage(item.result.inputs, item.result.stepsContent);
    navigator.clipboard.writeText(jsonStr);
    setCopiedId(item.id);
    showToast("Đã sao chép trọn gói JSON (3 Prompts + Kịch bản)!", "success");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getActiveTabContent = (item: BatchItem, tab: typeof inspectorTab) => {
    if (!item.result) return "";
    const { inputs, stepsContent } = item.result;
    switch (tab) {
      case "package":
        return buildUnifiedScriptJsonPackage(inputs, stepsContent);
      case "video":
        return cleanStep3VideoPromptsJson(stepsContent.step3 || "");
      case "storyboard":
        return cleanStep2StoryboardJson(stepsContent.step2 || "");
      case "thumbnail":
        return cleanStep4ThumbnailJson(stepsContent.step4 || "");
      case "automation":
        return cleanStep5JsonOutput(stepsContent.step5 || "", "compact-no-brackets");
      case "dialogue":
        return stepsContent.step1 || "";
      default:
        return "";
    }
  };

  const handleCopyTabContent = (text: string, label: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setTabCopied(true);
    showToast(`Đã sao chép ${label} vào clipboard!`, "success");
    setTimeout(() => setTabCopied(false), 2000);
  };

  const handleDownloadTabJson = (text: string, filename: string) => {
    if (!text) return;
    const blob = new Blob([text], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`Đã tải xuống ${filename}!`, "success");
  };

  const completedCount = items.filter((i) => i.status === "completed").length;
  const processingCount = items.filter((i) => i.status === "processing").length;
  const pendingCount = items.filter((i) => i.status === "pending").length;
  const errorCount = items.filter((i) => i.status === "error").length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-950/70 via-slate-900 to-slate-900 border border-indigo-500/30 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2.5">
              <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shadow-md">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-xl font-bold text-slate-100">
                    Tạo Kịch Bản 3D Hàng Loạt Tự Động (Batch Processing)
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center space-x-1">
                    <Cpu className="w-3 h-3 text-amber-400" />
                    <span>{config.concurrency} Luồng Xử Lý</span>
                  </span>
                </div>
                <p className="text-xs text-slate-400 max-w-3xl leading-relaxed mt-1">
                  Nhập danh sách hàng chục chủ đề sức khỏe. Hệ thống phân bổ đa luồng tự động chạy toàn bộ 5 bước
                  (Lời thoại → Storyboard → Prompt Video N+1 → Thumbnail 9:16 → JSON Automation) siêu tốc.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Stats & Settings trigger */}
          <div className="flex items-center space-x-3 bg-slate-950/80 p-3 rounded-xl border border-slate-800 shrink-0">
            <div className="text-center px-2.5 border-r border-slate-800">
              <span className="text-xs text-slate-400 block">Tổng số</span>
              <span className="text-base font-bold text-slate-200">{items.length}</span>
            </div>
            <div className="text-center px-2.5 border-r border-slate-800">
              <span className="text-xs text-emerald-400 block">Đã xong</span>
              <span className="text-base font-bold text-emerald-400">{completedCount}</span>
            </div>
            <div className="text-center px-2.5 border-r border-slate-800">
              <span className="text-xs text-indigo-400 block">Đang chạy</span>
              <span className="text-base font-bold text-indigo-400">{processingCount}</span>
            </div>
            {errorCount > 0 && (
              <div className="text-center px-2.5 border-r border-slate-800">
                <span className="text-xs text-rose-400 block">Lỗi</span>
                <span className="text-base font-bold text-rose-400">{errorCount}</span>
              </div>
            )}
            <div className="text-center px-2.5">
              <span className="text-xs text-amber-400 block">Chờ tạo</span>
              <span className="text-base font-bold text-amber-400">{pendingCount}</span>
            </div>
          </div>
        </div>

        {/* Live Active Worker Threads Visualizer (When Running) */}
        {isRunning && (
          <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-wrap items-center gap-2 animate-in fade-in">
            <span className="text-xs text-slate-300 font-semibold flex items-center space-x-1.5 mr-2">
              <Zap className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>Trạng thái {config.concurrency} Luồng xử lý:</span>
            </span>
            {Array.from({ length: config.concurrency }, (_, i) => i + 1).map((threadNum) => {
              const activeItemId = activeThreadsMap[threadNum];
              const activeItem = items.find((it) => it.id === activeItemId);

              return (
                <div
                  key={threadNum}
                  className={`px-3 py-1.5 rounded-lg border text-xs flex items-center space-x-2 ${
                    activeItem
                      ? "bg-indigo-950/60 border-indigo-500/50 text-indigo-200 animate-pulse"
                      : "bg-slate-950/40 border-slate-800 text-slate-500"
                  }`}
                >
                  <span className="font-bold text-indigo-400">Luồng #{threadNum}:</span>
                  {activeItem ? (
                    <span className="truncate max-w-[150px] font-medium text-slate-200">
                      B.{activeItem.currentStep}/5 - {activeItem.topic}
                    </span>
                  ) : (
                    <span className="italic text-slate-500">Đang nghỉ</span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Input & Controls (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Bulk Topics Input Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            {/* Template Selector for Batch */}
            <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="flex items-center space-x-1.5 text-xs font-semibold text-amber-300">
                  <Sliders className="w-3.5 h-3.5 text-amber-400" />
                  <span>Template áp dụng</span>
                </span>
                {onOpenSettingsModal && (
                  <button
                    type="button"
                    onClick={() => onOpenSettingsModal("presets")}
                    className="text-[11px] text-amber-400/90 hover:text-amber-300 hover:underline flex items-center space-x-1 cursor-pointer font-medium"
                    title="Mở Cài đặt để thêm mới hoặc sửa đổi các Template mẫu"
                  >
                    <Settings className="w-3 h-3" />
                    <span>Tùy biến</span>
                  </button>
                )}
              </div>

              <select
                id="select-batch-template"
                value={selectedTemplateId}
                onChange={(e) => handleSelectTemplate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700/80 hover:border-amber-500/60 focus:border-amber-500 rounded-lg px-3 py-2 text-xs text-slate-200 font-medium outline-none cursor-pointer"
              >
                {availableTemplates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} [{t.tag || "Chuẩn"}] — {t.data.mascotName || "Mascot"}
                  </option>
                ))}
              </select>
            </div>

            {/* Dynamic Project Context & Anti-Duplication Selector for Batch */}
            <ProjectManagerBar
              selectedProject={config.projectName}
              onProjectChange={(newProj) => {
                setConfig((prev) => ({ ...prev, projectName: newProj }));
              }}
              compact={true}
            />

            {/* BỘ THÔNG SỐ CẤU HÌNH GỌN GÀNG (2 HÀNG X 3 CỘT + ĐỐI TƯỢNG) */}
            <div className="p-3.5 bg-slate-950/70 rounded-xl border border-slate-800/80 space-y-3">
              {/* Nhóm 1: Nhân vật & Thương hiệu */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* 1. Giới tính Nhân vật */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-1 flex-nowrap min-w-0">
                    <label className="text-[11px] font-semibold text-slate-300 flex items-center space-x-1 whitespace-nowrap shrink-0">
                      <span>👤 Giới tính</span>
                    </label>
                    <span className="text-[9px] text-slate-500 font-mono shrink-0 whitespace-nowrap">[gender]</span>
                  </div>
                  <select
                    id="select-batch-character-gender"
                    value={config.characterGender || "Vietnamese female"}
                    onChange={(e) => {
                      const updatedGender = e.target.value;
                      const matched = matchRegionalVoice(
                        config.regionAccent || "south",
                        updatedGender,
                        config.characterAge || config.femaleAge || "25-34"
                      );
                      setConfig((prev) => ({
                        ...prev,
                        characterGender: updatedGender,
                        voice: matched.voice,
                        pacingWpm: matched.pacingWpm,
                      }));
                    }}
                    className="w-full bg-slate-900 border border-slate-700/80 hover:border-slate-600 focus:border-amber-500 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 font-medium outline-none cursor-pointer truncate"
                  >
                    {CHARACTER_GENDER_OPTIONS.map((g) => (
                      <option key={g.id} value={g.value}>
                        {g.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. Độ tuổi Nhân vật */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-1 flex-nowrap min-w-0">
                    <label className="text-[11px] font-semibold text-slate-300 flex items-center space-x-1 whitespace-nowrap shrink-0">
                      <span>🎂 Độ tuổi</span>
                    </label>
                    <span className="text-[9px] text-slate-500 font-mono shrink-0 whitespace-nowrap">[age]</span>
                  </div>
                  <input
                    id="input-batch-character-age"
                    type="text"
                    value={config.characterAge || config.femaleAge || ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      const matched = matchRegionalVoice(
                        config.regionAccent || "south",
                        config.characterGender || "Vietnamese female",
                        val
                      );
                      setConfig((prev) => ({
                        ...prev,
                        characterAge: val,
                        femaleAge: val,
                        voice: matched.voice,
                        pacingWpm: matched.pacingWpm,
                      }));
                    }}
                    placeholder="Ví dụ: 25-34 hoặc 45"
                    className="w-full bg-slate-900 border border-slate-700/80 hover:border-slate-600 focus:border-amber-500 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 font-medium outline-none transition-all"
                  />
                </div>

                {/* 3. Tên Mascot / Thương hiệu */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-1 flex-nowrap min-w-0">
                    <label className="text-[11px] font-semibold text-slate-300 flex items-center space-x-1 whitespace-nowrap shrink-0">
                      <span>🛡️ Khiên Mascot</span>
                    </label>
                    <span className="text-[9px] text-slate-500 font-mono shrink-0 whitespace-nowrap">[mascot]</span>
                  </div>
                  <input
                    id="input-batch-mascot-name"
                    type="text"
                    value={config.mascotName || ""}
                    onChange={(e) => setConfig((prev) => ({ ...prev, mascotName: e.target.value }))}
                    placeholder="Ví dụ: Trà Dây Bstar"
                    className="w-full bg-slate-900 border border-slate-700/80 hover:border-slate-600 focus:border-amber-500 rounded-lg px-2.5 py-1.5 text-xs text-amber-300 placeholder:text-slate-500 font-semibold outline-none transition-all"
                  />
                </div>
              </div>

              {/* Nhóm 2: Giọng đọc, Video Style, Tỷ lệ khung hình */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2.5 border-t border-slate-800/60">
                {/* 4. Giọng vùng miền */}
                <div className="space-y-1">
                  {(() => {
                    const matched = matchRegionalVoice(
                      config.regionAccent || "south",
                      config.characterGender || "Vietnamese female",
                      config.characterAge || config.femaleAge || "25-34"
                    );
                    return (
                      <>
                        <div className="flex items-center justify-between gap-1 flex-nowrap min-w-0">
                          <label className="text-[11px] font-semibold text-slate-300 flex items-center space-x-1 whitespace-nowrap shrink-0">
                            <span>🎙️ Giọng đọc</span>
                            <HelpTooltip
                              variant="info"
                              className="shrink-0"
                              title="Tự động khớp giọng đọc"
                              text={`Tự động khớp theo Nhân vật (${matched.shortLabel}): ${matched.toneDescription}. Tốc độ: ${config.pacingWpm || 105} WPM.`}
                            />
                          </label>
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-300 font-mono border border-emerald-500/20 shrink-0 whitespace-nowrap">
                            {config.pacingWpm || 105} WPM
                          </span>
                        </div>
                        <select
                          id="select-batch-voice-accent"
                          value={config.regionAccent || "south"}
                          onChange={(e) => {
                            const selectedRegion = e.target.value as "south" | "north" | "central" | "west";
                            const newMatched = matchRegionalVoice(
                              selectedRegion,
                              config.characterGender || "Vietnamese female",
                              config.characterAge || config.femaleAge || "25-34"
                            );
                            setConfig((prev) => ({
                              ...prev,
                              regionAccent: selectedRegion,
                              voice: newMatched.voice,
                              pacingWpm: newMatched.pacingWpm,
                            }));
                          }}
                          className="w-full bg-slate-900 border border-slate-700/80 hover:border-slate-600 focus:border-amber-500 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 font-medium outline-none cursor-pointer truncate"
                        >
                          {REGIONAL_ACCENT_OPTIONS.map((opt) => (
                            <option key={opt.id} value={opt.id}>
                              {opt.icon ? `${opt.icon} ` : ""}{opt.shortLabel || opt.label}
                            </option>
                          ))}
                        </select>
                      </>
                    );
                  })()}
                </div>

                {/* 5. Phong cách Video */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-1 flex-nowrap min-w-0">
                    <label className="text-[11px] font-semibold text-slate-300 flex items-center space-x-1 whitespace-nowrap shrink-0">
                      <span>🎨 Phong cách</span>
                    </label>
                    <span className="text-[9px] text-indigo-400/90 font-mono shrink-0 whitespace-nowrap">Visual</span>
                  </div>
                  <select
                    id="select-batch-video-style"
                    value={
                      VIDEO_STYLE_OPTIONS.find((s) => s.prompt === config.style)?.id ||
                      (config.style.toLowerCase().includes("clay")
                        ? "claymation_3d"
                        : config.style.toLowerCase().includes("ghibli")
                        ? "ghibli_anime"
                        : config.style.toLowerCase().includes("vector")
                        ? "motion_flat_2d"
                        : config.style.toLowerCase().includes("realistic")
                        ? "cinematic_realistic"
                        : config.style.toLowerCase().includes("hologram")
                        ? "medical_3d_hologram"
                        : "pixar_soft_peach")
                    }
                    onChange={(e) => {
                      const selected = VIDEO_STYLE_OPTIONS.find((s) => s.id === e.target.value);
                      if (selected) {
                        setConfig((prev) => ({
                          ...prev,
                          style: selected.prompt,
                        }));
                      }
                    }}
                    className="w-full bg-slate-900 border border-slate-700/80 hover:border-slate-600 focus:border-amber-500 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 font-medium outline-none cursor-pointer truncate"
                  >
                    {VIDEO_STYLE_OPTIONS.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.shortLabel || s.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 6. Tỷ lệ Video */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-1 flex-nowrap min-w-0">
                    <label className="text-[11px] font-semibold text-slate-300 flex items-center space-x-1 whitespace-nowrap shrink-0">
                      <span>📐 Tỷ lệ khung</span>
                    </label>
                    <span className="text-[9px] text-cyan-400 font-mono font-bold shrink-0 whitespace-nowrap">
                      {config.aspectRatio === "16:9" ? "16:9" : "9:16"}
                    </span>
                  </div>
                  <select
                    id="select-batch-aspect-ratio"
                    value={config.aspectRatio || "9:16"}
                    onChange={(e) => {
                      const ar = e.target.value as "9:16" | "16:9";
                      setConfig((prev) => ({ ...prev, aspectRatio: ar }));
                    }}
                    className="w-full bg-slate-900 border border-slate-700/80 hover:border-slate-600 focus:border-amber-500 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 font-medium outline-none cursor-pointer truncate"
                  >
                    {ASPECT_RATIO_OPTIONS.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.shortLabel || opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Nhóm 3: Đối tượng người xem */}
              <div className="space-y-1 pt-2.5 border-t border-slate-800/60">
                <div className="flex items-center justify-between gap-1.5 flex-nowrap min-w-0">
                  <label className="text-[11px] font-semibold text-slate-300 flex items-center space-x-1.5 whitespace-nowrap min-w-0">
                    <span className="truncate">👥 Đối tượng người xem (Target Audience)</span>
                    <span className="text-rose-400 font-bold shrink-0">*</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-950/70 text-rose-300 border border-rose-500/30 font-medium shrink-0 whitespace-nowrap">
                      Bắt buộc
                    </span>
                    <HelpTooltip
                      variant="warning"
                      className="shrink-0"
                      title="Lưu ý về Đối tượng người xem"
                      text="Trường bắt buộc: Vui lòng nhập đối tượng người xem (không cần ghi tuổi vì đã thiết lập ở ô Độ tuổi bên cạnh)."
                    />
                  </label>
                  <span className="text-[9px] text-slate-500 font-mono shrink-0 whitespace-nowrap">[targetAudience]</span>
                </div>
                <input
                  id="input-batch-target-audience"
                  type="text"
                  required
                  value={config.targetAudience}
                  onChange={(e) => setConfig((prev) => ({ ...prev, targetAudience: e.target.value }))}
                  placeholder="Ví dụ: Người bị trào ngược, ợ chua, viêm loét dạ dày, dân văn phòng hay thức khuya, stress..."
                  className={`w-full bg-slate-900 border rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 outline-none transition-all ${
                    !config.targetAudience?.trim()
                      ? "border-rose-500/60 focus:border-rose-400"
                      : "border-slate-700/80 hover:border-slate-600 focus:border-amber-500"
                  }`}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Plus className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-bold text-slate-200">Nhập Danh Sách Chủ Đề (Mỗi dòng 1 chủ đề)</h3>
              </div>
              <button
                type="button"
                id="btn-add-sample-topics"
                onClick={handleAddSampleTopics}
                className="text-[11px] font-medium text-amber-400 hover:text-amber-300 hover:underline flex items-center space-x-1 cursor-pointer"
              >
                <Sparkles className="w-3 h-3" />
                <span>Nạp mẫu 5 chủ đề</span>
              </button>
            </div>

            <textarea
              id="textarea-bulk-topics"
              rows={5}
              value={bulkInputText}
              onChange={(e) => setBulkInputText(e.target.value)}
              placeholder={`Dòng 1: Trào ngược dạ dày ban đêm nguyên nhân do đâu\nDòng 2: Cách giảm đau dạ dày cấp tốc tại nhà bằng nước ấm và gừng\nDòng 3: Tại sao uống kháng sinh lại bị đau cồn cào ruột`}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 leading-relaxed font-sans placeholder:text-slate-600"
            />

            {/* TÙY CHỌN BẬT/TẮT BƯỚC THỰC THI (BƯỚC 1 & 2 VS BƯỚC 3, 4, 5) */}
            <div className="p-3 bg-slate-950/90 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-300">
                <span className="flex items-center space-x-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
                  <span>Chọn các bước AI thực thi khi tạo hàng loạt:</span>
                </span>
                <span className="text-[10px] text-slate-400 font-normal">
                  {config.runScriptStep12 !== false && config.runVisualStep345 !== false
                    ? "Đầy đủ 5 bước"
                    : config.runScriptStep12 !== false
                    ? "Chỉ Bước 1 & 2"
                    : config.runVisualStep345 !== false
                    ? "Chỉ Bước 3, 4, 5"
                    : "Chưa chọn bước"}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {/* Checkbox Bước 1 & 2 */}
                <label className={`p-2.5 rounded-lg border flex items-center justify-between cursor-pointer transition-all ${
                  config.runScriptStep12 !== false
                    ? "bg-amber-950/20 border-amber-500/40 text-amber-200"
                    : "bg-slate-900/60 border-slate-800 text-slate-500"
                }`}>
                  <div className="flex items-center space-x-2">
                    <span className="text-base leading-none">✍️</span>
                    <div>
                      <span className="text-xs font-bold block">Bước 1 & 2</span>
                      <span className="text-[10px] text-slate-400 block">Viết Thoại & Storyboard</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={config.runScriptStep12 !== false}
                    onChange={(e) => {
                      const val = e.target.checked;
                      setConfig((prev) => ({ ...prev, runScriptStep12: val }));
                      localStorage.setItem("batch_run_script_step12", val ? "true" : "false");
                    }}
                    className="w-4 h-4 rounded bg-slate-800 border-slate-700 text-amber-500 focus:ring-0 cursor-pointer"
                  />
                </label>

                {/* Checkbox Bước 3, 4, 5 */}
                <label className={`p-2.5 rounded-lg border flex items-center justify-between cursor-pointer transition-all ${
                  config.runVisualStep345 !== false
                    ? "bg-indigo-950/20 border-indigo-500/40 text-indigo-200"
                    : "bg-slate-900/60 border-slate-800 text-slate-500"
                }`}>
                  <div className="flex items-center space-x-2">
                    <span className="text-base leading-none">🎨</span>
                    <div>
                      <span className="text-xs font-bold block">Bước 3, 4, 5</span>
                      <span className="text-[10px] text-slate-400 block">Prompt Visual, Veo & Thumb</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={config.runVisualStep345 !== false}
                    onChange={(e) => {
                      const val = e.target.checked;
                      setConfig((prev) => ({ ...prev, runVisualStep345: val }));
                      localStorage.setItem("batch_run_visual_step345", val ? "true" : "false");
                    }}
                    className="w-4 h-4 rounded bg-slate-800 border-slate-700 text-indigo-500 focus:ring-0 cursor-pointer"
                  />
                </label>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-1">
              <button
                id="btn-add-to-queue"
                type="button"
                onClick={handleAddBulk}
                className="flex items-center space-x-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm vào Hàng Đợi</span>
              </button>

              <div className="flex items-center space-x-2">
                {isRunning ? (
                  <button
                    id="btn-stop-batch"
                    type="button"
                    onClick={handleStopBatch}
                    className="flex items-center space-x-1.5 px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
                  >
                    <Pause className="w-3.5 h-3.5" />
                    <span>Dừng Lại ({config.concurrency}L)</span>
                  </button>
                ) : (
                  <button
                    id="btn-start-batch"
                    type="button"
                    onClick={handleStartBatch}
                    disabled={items.length === 0}
                    className="flex items-center space-x-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/30 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>Chạy Đa Luồng ({config.concurrency} Luồng)</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Action Toolbar for the Queue */}
          <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5">
            <span className="text-xs text-slate-400 font-medium">
              Hàng đợi: <strong className="text-slate-200">{items.length} kịch bản</strong>
            </span>

            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
              {/* Button Tạo lại lỗi nếu có item error */}
              {errorCount > 0 && !isRunning && (
                <button
                  id="btn-regenerate-failed"
                  type="button"
                  onClick={handleRegenerateFailed}
                  className="flex items-center space-x-1.5 px-2.5 py-1 text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-lg transition-colors cursor-pointer"
                  title="Thử tạo lại các kịch bản gặp lỗi"
                >
                  <RotateCcw className="w-3 h-3 text-rose-400" />
                  <span>Tạo lại {errorCount} lỗi</span>
                </button>
              )}

              {/* Button Tạo lại tất cả */}
              {items.length > 0 && !isRunning && (
                <button
                  id="btn-regenerate-all"
                  type="button"
                  onClick={handleRegenerateAll}
                  className="flex items-center space-x-1.5 px-2.5 py-1 text-xs font-semibold bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-lg transition-colors cursor-pointer"
                  title="Đặt lại và tạo lại tất cả kịch bản từ đầu"
                >
                  <RotateCcw className="w-3 h-3 text-indigo-400" />
                  <span>Tạo lại tất cả</span>
                </button>
              )}

              <button
                id="btn-copy-batch-sheets"
                type="button"
                onClick={handleCopyAllToSheets}
                disabled={completedCount === 0}
                className="flex items-center space-x-1.5 px-3 py-1 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg transition-all shadow-md shadow-amber-500/20 disabled:opacity-40 cursor-pointer"
                title="Sao chép toàn bộ kịch bản đã xong (5 cột chuẩn) để dán thẳng vào Google Sheet"
              >
                {copiedAllSheets ? <Check className="w-3.5 h-3.5" /> : <Table className="w-3.5 h-3.5" />}
                <span>{copiedAllSheets ? "Đã chép toàn bộ Sheet!" : "📋 Copy Bảng Sheet (5 Cột)"}</span>
              </button>

              <button
                id="btn-open-batch-sheets-modal"
                type="button"
                onClick={() => setIsBatchSheetsModalOpen(true)}
                disabled={completedCount === 0}
                className="flex items-center space-x-1.5 px-2.5 py-1 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-all shadow-md shadow-indigo-600/20 disabled:opacity-40 cursor-pointer"
                title="Mở Trung tâm xuất Google Sheets: Chọn kịch bản, sao chép từng cột dọc, bộ lọc"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Xuất Hàng Loạt & Bộ Lọc</span>
              </button>

              <button
                id="btn-export-batch-csv"
                type="button"
                onClick={handleDownloadAllCsv}
                disabled={completedCount === 0}
                className="flex items-center space-x-1.5 px-2.5 py-1 text-xs font-semibold bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 rounded-lg transition-colors disabled:opacity-40 cursor-pointer"
                title="Tải về file CSV (5 Cột chuẩn) mở bằng Excel / Google Sheets"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>Tải CSV (5 Cột)</span>
              </button>

              <button
                id="btn-export-batch-json"
                type="button"
                onClick={handleExportAll}
                disabled={completedCount === 0}
                className="flex items-center space-x-1.5 px-2.5 py-1 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg transition-colors disabled:opacity-40 cursor-pointer"
                title="Xuất file JSON trọn gói"
              >
                <Download className="w-3.5 h-3.5 text-slate-400" />
                <span>Xuất JSON</span>
              </button>

              <button
                id="btn-clear-batch-queue"
                type="button"
                onClick={handleClearAll}
                disabled={items.length === 0 || isRunning}
                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors disabled:opacity-40 cursor-pointer"
                title="Xóa toàn bộ hàng đợi"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Queue List & Detail Inspector (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Queue List */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <h3 className="text-sm font-bold text-slate-200 border-b border-slate-800 pb-3 flex items-center justify-between flex-wrap gap-2">
              <span className="flex items-center space-x-2">
                <span>Tiến Trình Xử Lý Đa Luồng</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-800 text-slate-400 font-mono">
                  {completedCount}/{items.length} xong
                </span>
              </span>

              <div className="flex items-center space-x-2">
                {isRunning ? (
                  <span className="flex items-center space-x-1.5 text-xs text-indigo-400 font-semibold animate-pulse">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Đang chạy {config.concurrency} luồng...</span>
                  </span>
                ) : (
                  pendingCount > 0 && (
                    <button
                      type="button"
                      onClick={handleStartBatch}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg flex items-center space-x-1.5 shadow-md shadow-emerald-600/30 transition-all cursor-pointer"
                    >
                      <Play className="w-3 h-3 fill-white" />
                      <span>Chạy {pendingCount} kịch bản chờ</span>
                    </button>
                  )
                )}
              </div>
            </h3>

            {/* QUICK BATCH COPY HUB WHEN TASKS ARE COMPLETED */}
            {completedCount > 0 && (
              <div className="p-3.5 bg-gradient-to-r from-amber-500/15 via-slate-900 to-indigo-950/40 border-2 border-amber-500/40 rounded-xl space-y-3 shadow-lg shadow-amber-500/5 animate-in fade-in duration-300">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-md">
                      <Table className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-amber-300 flex items-center space-x-1.5">
                        <span>Đã Hoàn Thành {completedCount} / {items.length} Kịch Bản</span>
                        <span className="px-1.5 py-0.2 text-[9px] font-bold bg-amber-400 text-slate-950 rounded-full">
                          Sẵn Sàng Dán Sheet
                        </span>
                      </h4>
                      <p className="text-[11px] text-slate-300">
                        Sao chép toàn bộ {completedCount} kịch bản để dán trực tiếp vào Google Sheets / Excel
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                    {/* Main Big Copy Button */}
                    <button
                      id="btn-quick-hero-copy-all-sheets"
                      type="button"
                      onClick={() => handleCopyAllToSheets(false)}
                      className="flex items-center space-x-2 px-4 py-2 text-xs font-black bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-950 rounded-xl shadow-lg shadow-amber-400/25 transition-all cursor-pointer"
                      title="Sao chép toàn bộ kịch bản đã tạo xong (5 cột chuẩn TSV) để dán bằng Ctrl+V"
                    >
                      {copiedAllSheets ? (
                        <Check className="w-4 h-4 text-slate-950 stroke-[3]" />
                      ) : (
                        <Copy className="w-4 h-4 text-slate-950 stroke-[2.5]" />
                      )}
                      <span>
                        {copiedAllSheets
                          ? `ĐÃ CHÉP ${completedCount} TASK!`
                          : `📋 SAO CHÉP TOÀN BỘ ${completedCount} TASK (5 CỘT)`}
                      </span>
                    </button>

                    <button
                      id="btn-quick-open-batch-modal"
                      type="button"
                      onClick={() => setIsBatchSheetsModalOpen(true)}
                      className="flex items-center space-x-1.5 px-3 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
                      title="Mở bảng lọc để chọn từng kịch bản hoặc xuất theo cột"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                      <span>Bộ Lọc & Chọn Lọc</span>
                    </button>
                  </div>
                </div>

                {/* Sub row: Quick Column Copy Horizontal Pills */}
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2 flex-wrap text-[11px]">
                  <span className="text-slate-400 font-semibold flex items-center space-x-1">
                    <span>Chép toàn bộ 1 cột dọc:</span>
                  </span>

                  <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                    <button
                      type="button"
                      onClick={() => handleCopyColumnAll("dialogues")}
                      className={`px-2 py-1 rounded-md text-[10px] font-bold border transition-colors cursor-pointer ${
                        copiedColumnKey === "dialogues"
                          ? "bg-emerald-500 text-slate-950 border-emerald-400"
                          : "bg-slate-900 hover:bg-slate-800 text-emerald-300 border-emerald-500/30"
                      }`}
                      title="Chép toàn bộ cột Lời thoại (Cột 1/R) của các task đã xong"
                    >
                      {copiedColumnKey === "dialogues" ? "✓ Đã chép" : "1. Lời thoại"}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleCopyColumnAll("storyboard")}
                      className={`px-2 py-1 rounded-md text-[10px] font-bold border transition-colors cursor-pointer ${
                        copiedColumnKey === "storyboard"
                          ? "bg-emerald-500 text-slate-950 border-emerald-400"
                          : "bg-slate-900 hover:bg-slate-800 text-amber-300 border-amber-500/30"
                      }`}
                      title="Chép toàn bộ cột Storyboard (Cột 2/S) của các task đã xong"
                    >
                      {copiedColumnKey === "storyboard" ? "✓ Đã chép" : "2. Storyboard"}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleCopyColumnAll("scenes")}
                      className={`px-2 py-1 rounded-md text-[10px] font-bold border transition-colors cursor-pointer ${
                        copiedColumnKey === "scenes"
                          ? "bg-emerald-500 text-slate-950 border-emerald-400"
                          : "bg-slate-900 hover:bg-slate-800 text-indigo-300 border-indigo-500/30"
                      }`}
                      title="Chép toàn bộ cột Image of Sences (Cột 3/T - N+1 Images) của các task đã xong"
                    >
                      {copiedColumnKey === "scenes" ? "✓ Đã chép" : "3. Images (N+1)"}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleCopyColumnAll("thumbnail")}
                      className={`px-2 py-1 rounded-md text-[10px] font-bold border transition-colors cursor-pointer ${
                        copiedColumnKey === "thumbnail"
                          ? "bg-emerald-500 text-slate-950 border-emerald-400"
                          : "bg-slate-900 hover:bg-slate-800 text-amber-300 border-amber-500/30"
                      }`}
                      title="Chép toàn bộ cột Thumbnail (Cột 4/U) của các task đã xong"
                    >
                      {copiedColumnKey === "thumbnail" ? "✓ Đã chép" : "4. Thumbnail"}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleCopyColumnAll("videoScripts")}
                      className={`px-2 py-1 rounded-md text-[10px] font-black border transition-colors cursor-pointer ${
                        copiedColumnKey === "videoScripts"
                          ? "bg-emerald-500 text-slate-950 border-emerald-400"
                          : "bg-cyan-950/60 hover:bg-cyan-900 text-cyan-300 border-cyan-500/40"
                      }`}
                      title="Chép toàn bộ cột Video Scripts (Cột 5/V chuẩn bỏ ngoặc []) của các task đã xong"
                    >
                      {copiedColumnKey === "videoScripts" ? "✓ Đã chép" : "5. Video Scripts"}
                    </button>

                    <button
                      type="button"
                      onClick={handleDownloadAllCsv}
                      className="px-2 py-1 rounded-md text-[10px] font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 transition-colors flex items-center space-x-1 cursor-pointer"
                      title="Tải toàn bộ kịch bản về file CSV"
                    >
                      <Download className="w-2.5 h-2.5" />
                      <span>Tải CSV</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {items.length === 0 ? (
              <div className="text-center py-12 text-slate-500 space-y-2">
                <Layers className="w-10 h-10 mx-auto text-slate-600 opacity-50" />
                <p className="text-xs font-medium">Chưa có kịch bản nào trong hàng đợi.</p>
                <p className="text-[11px] text-slate-600">
                  Hãy nhập danh sách chủ đề ở khung bên trái hoặc nhấn "Nạp mẫu 5 chủ đề" để bắt đầu.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[520px] overflow-y-auto pr-1">
                {items.map((item, idx) => {
                  const isSelected = selectedItemDetail?.id === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedItemDetail(item)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isSelected
                          ? "bg-indigo-950/40 border-indigo-500/50 shadow-md"
                          : "bg-slate-950/70 hover:bg-slate-950 border-slate-800"
                      }`}
                    >
                      <div className="flex items-start space-x-3 min-w-0 flex-1">
                        <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center space-x-2">
                            <h4 className="text-xs font-semibold text-slate-200 truncate" title={item.topic}>
                              {item.topic}
                            </h4>
                            {item.activeThreadIndex && (
                              <span className="px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[9px] font-mono shrink-0">
                                Luồng #{item.activeThreadIndex}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center space-x-2 mt-1">
                            {item.status === "pending" && (
                              <div className="flex items-center space-x-1.5 flex-wrap">
                                <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px] flex items-center space-x-1">
                                  <Clock className="w-2.5 h-2.5 text-amber-400" />
                                  <span>Chờ tạo</span>
                                </span>
                                {item.duplicateWarning && item.duplicateWarning.isDuplicate && (
                                  <span
                                    className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] flex items-center space-x-1 font-medium"
                                    title={`Tương đồng ${item.duplicateWarning.score}% với kịch bản cũ: "${item.duplicateWarning.matchedTopic}". AI sẽ tự đổi góc.`}
                                  >
                                    <ShieldAlert className="w-2.5 h-2.5 text-amber-400 shrink-0" />
                                    <span>Trùng góc {item.duplicateWarning.score}% (Tự đổi góc)</span>
                                  </span>
                                )}
                              </div>
                            )}
                            {item.status === "processing" && (
                              <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] flex items-center space-x-1 font-semibold">
                                <Loader2 className="w-2.5 h-2.5 animate-spin" />
                                <span>
                                  {item.currentStep === 5
                                    ? `Đang đóng gói Bước 5/5 (${item.progressPercent}%)`
                                    : `Đang tạo Bước ${item.currentStep}/5 (${item.progressPercent}%)`}
                                </span>
                              </span>
                            )}
                            {item.status === "completed" && (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] flex items-center space-x-1 font-semibold">
                                <CheckCircle2 className="w-2.5 h-2.5" />
                                <span>Đã xong 5 bước</span>
                              </span>
                            )}
                            {item.status === "error" && (
                              <div className="flex items-center space-x-1.5 flex-wrap">
                                <span
                                  className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] flex items-center space-x-1 font-medium max-w-md truncate"
                                  title={item.error}
                                >
                                  <AlertCircle className="w-2.5 h-2.5 shrink-0 text-rose-400" />
                                  <span className="truncate">{item.error || "Lỗi xử lý"}</span>
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right actions */}
                      <div className="flex items-center space-x-2 shrink-0">
                        {/* Nút Tạo ngay cho kịch bản đang Pending */}
                        {item.status === "pending" && (
                          <button
                            type="button"
                            id={`btn-generate-${item.id}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleGenerateSingleItem(item.id);
                            }}
                            className="px-2.5 py-1 text-[11px] font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg flex items-center space-x-1 shadow-sm transition-all cursor-pointer"
                            title="Bắt đầu tạo kịch bản này ngay"
                          >
                            <Play className="w-3 h-3 fill-white" />
                            <span>Tạo ngay</span>
                          </button>
                        )}

                        {/* Nút Tạo lại cho từng kịch bản (Cho completed hoặc error) */}
                        {(item.status === "completed" || item.status === "error") && (
                          <button
                            type="button"
                            id={`btn-regenerate-${item.id}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleGenerateSingleItem(item.id);
                            }}
                            className="px-2.5 py-1 text-[11px] font-semibold bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 hover:text-indigo-200 border border-indigo-500/30 rounded-lg flex items-center space-x-1 transition-colors cursor-pointer"
                            title="Tạo lại kịch bản này từ đầu"
                          >
                            <RotateCcw className="w-3 h-3 text-indigo-400" />
                            <span>Tạo lại</span>
                          </button>
                        )}

                        {item.status === "completed" && (
                          <>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopyItemSheetsRow(item);
                              }}
                              className="px-2 py-1 text-[10px] font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded flex items-center space-x-1 transition-colors cursor-pointer"
                              title="Sao chép 1 dòng (5 cột chuẩn) của kịch bản này để dán vào Google Sheet"
                            >
                              {copiedRowId === item.id ? (
                                <Check className="w-3 h-3 text-emerald-400" />
                              ) : (
                                <Table className="w-3 h-3 text-amber-400" />
                              )}
                              <span>{copiedRowId === item.id ? "Đã chép" : "Sheet (5 Cột)"}</span>
                            </button>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopyJson(item);
                              }}
                              className="px-2 py-1 text-[10px] font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 flex items-center space-x-1"
                              title="Sao chép JSON kịch bản"
                            >
                              {copiedId === item.id ? (
                                <Check className="w-3 h-3 text-emerald-400" />
                              ) : (
                                <Copy className="w-3 h-3 text-slate-400" />
                              )}
                              <span>{copiedId === item.id ? "Đã chép" : "JSON"}</span>
                            </button>
                          </>
                        )}

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteItem(item.id);
                          }}
                          className="p-1 text-slate-500 hover:text-rose-400 rounded transition-colors cursor-pointer"
                          title="Xóa kịch bản này"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Selected Item Quick Inspector */}
          {selectedItemDetail && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-wrap gap-2">
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-emerald-400" />
                  <h4 className="text-xs font-bold text-slate-200 truncate max-w-xs sm:max-w-md">
                    Chi tiết kịch bản: {selectedItemDetail.topic}
                  </h4>
                </div>

                <div className="flex items-center space-x-2">
                  {/* Nút Tạo / Tạo lại trong Header của Inspector */}
                  {selectedItemDetail.status === "pending" ? (
                    <button
                      type="button"
                      onClick={() => handleGenerateSingleItem(selectedItemDetail.id)}
                      className="px-3 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg flex items-center space-x-1.5 shadow-md shadow-emerald-600/30 transition-all cursor-pointer"
                      title="Bắt đầu tạo kịch bản này ngay"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>Tạo kịch bản này</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleGenerateSingleItem(selectedItemDetail.id)}
                      className="px-2.5 py-1.5 text-xs font-semibold bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 rounded-lg flex items-center space-x-1.5 shadow-sm transition-all cursor-pointer"
                      title="Chạy tạo lại từ Bước 1 đến Bước 5 cho kịch bản này"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Tạo lại kịch bản</span>
                    </button>
                  )}

                  {selectedItemDetail.result && (
                    <button
                      type="button"
                      onClick={() => {
                        if (selectedItemDetail.result) {
                          onLoadSingleScript(
                            selectedItemDetail.result.inputs,
                            selectedItemDetail.result.stepsContent
                          );
                        }
                      }}
                      className="px-3 py-1.5 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg flex items-center space-x-1 shadow-md cursor-pointer"
                    >
                      <span>Mở kịch bản trong 5 Bước</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Quick Tab preview for Prompts & Automation JSON */}
              {selectedItemDetail.result ? (
                <div className="space-y-3">
                  {/* Input vs Output Comparison Banner */}
                  {(() => {
                    const resInputs = selectedItemDetail.result.inputs || {};
                    const audience = resInputs.targetAudience || selectedItemDetail.targetAudience || config.targetAudience || "";
                    const charAge = resInputs.characterAge || selectedItemDetail.characterAge || config.characterAge || "25-34";
                    const charGender = resInputs.characterGender || selectedItemDetail.characterGender || config.characterGender || "Vietnamese female";
                    const region = resInputs.regionAccent || selectedItemDetail.regionAccent || config.regionAccent || "south";
                    const pacing = resInputs.pacingWpm || selectedItemDetail.pacingWpm || config.pacingWpm || 105;
                    const mascot = resInputs.mascotName || selectedItemDetail.mascotName || config.mascotName || "";
                    const regionLabel = region === "south" ? "Nam (Sài Gòn)" : region === "north" ? "Bắc (Hà Nội)" : region === "central" ? "Trung" : "Miền Tây";

                    return (
                      <div className="bg-slate-950/90 border border-indigo-500/30 rounded-xl p-3 space-y-2">
                        <div className="flex items-center justify-between flex-wrap gap-1.5">
                          <div className="flex items-center space-x-1.5">
                            <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                            <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider">
                              Đối Chiếu Input Đầu Vào & Tính Đồng Nhất (Input vs Strategy Check)
                            </span>
                          </div>
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center space-x-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            <span>Đã khóa trực tiếp vào Prompt & Mục 3</span>
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-[11px]">
                          <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800 space-y-0.5">
                            <div className="text-[10px] text-slate-400 font-semibold flex items-center space-x-1">
                              <Target className="w-3 h-3 text-rose-400" />
                              <span>Đối tượng (Audience)</span>
                            </div>
                            <p className="font-semibold text-slate-200 line-clamp-1" title={audience}>
                              {audience || "Chưa thiết lập"}
                            </p>
                          </div>

                          <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800 space-y-0.5">
                            <div className="text-[10px] text-slate-400 font-semibold flex items-center space-x-1">
                              <User className="w-3 h-3 text-sky-400" />
                              <span>Nhân vật & Tuổi</span>
                            </div>
                            <p className="font-semibold text-slate-200">
                              {charGender} • {charAge} tuổi
                            </p>
                          </div>

                          <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800 space-y-0.5">
                            <div className="text-[10px] text-slate-400 font-semibold flex items-center space-x-1">
                              <Mic className="w-3 h-3 text-amber-400" />
                              <span>Giọng & Vùng miền</span>
                            </div>
                            <p className="font-semibold text-slate-200">
                              {regionLabel} • {pacing} wpm
                            </p>
                          </div>

                          <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800 space-y-0.5">
                            <div className="text-[10px] text-slate-400 font-semibold flex items-center space-x-1">
                              <ShieldCheck className="w-3 h-3 text-emerald-400" />
                              <span>Mascot / Khiên</span>
                            </div>
                            <p className="font-semibold text-slate-200">
                              {mascot || "Tự nhiên / Không ép tên"}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Tab Selector */}
                  <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 border-b border-slate-800">
                    <button
                      type="button"
                      onClick={() => setInspectorTab("sheets")}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center space-x-1.5 whitespace-nowrap cursor-pointer ${
                        inspectorTab === "sheets"
                          ? "bg-amber-400 text-slate-950 shadow-md shadow-amber-400/30 ring-2 ring-amber-400/50"
                          : "bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 border border-amber-500/30"
                      }`}
                    >
                      <Table className="w-3.5 h-3.5" />
                      <span>📊 Bảng Google Sheet (5 Cột)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setInspectorTab("package")}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center space-x-1.5 whitespace-nowrap cursor-pointer ${
                        inspectorTab === "package"
                          ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                          : "bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white"
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>📦 Trọn Gói JSON (3 Prompts + Script)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setInspectorTab("video")}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center space-x-1.5 whitespace-nowrap cursor-pointer ${
                        inspectorTab === "video"
                          ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                          : "bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white"
                      }`}
                    >
                      <span>🎬 Prompt Video N+1 (JSON)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setInspectorTab("storyboard")}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center space-x-1.5 whitespace-nowrap cursor-pointer ${
                        inspectorTab === "storyboard"
                          ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                          : "bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white"
                      }`}
                    >
                      <span>🎨 Prompt Storyboard (JSON)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setInspectorTab("thumbnail")}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center space-x-1.5 whitespace-nowrap cursor-pointer ${
                        inspectorTab === "thumbnail"
                          ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                          : "bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white"
                      }`}
                    >
                      <span>🖼️ Prompt Thumbnail (JSON)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setInspectorTab("automation")}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center space-x-1.5 whitespace-nowrap cursor-pointer ${
                        inspectorTab === "automation"
                          ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                          : "bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white"
                      }`}
                    >
                      <span>⚙️ Kịch Bản Automation (JSON)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setInspectorTab("dialogue")}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center space-x-1.5 whitespace-nowrap cursor-pointer ${
                        inspectorTab === "dialogue"
                          ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                          : "bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white"
                      }`}
                    >
                      <span>📝 Lời Thoại (Bước 1)</span>
                    </button>
                  </div>

                  {/* If Sheets tab, render the 5-column table viewer */}
                  {inspectorTab === "sheets" ? (
                    <SheetsTableViewer
                      stepsContent={selectedItemDetail.result.stepsContent}
                      inputs={selectedItemDetail.result.inputs}
                      title={selectedItemDetail.topic}
                      showCardWrapper={false}
                    />
                  ) : (
                    (() => {
                      const content = getActiveTabContent(selectedItemDetail, inspectorTab);
                      const tabNames: Record<Exclude<typeof inspectorTab, "sheets">, string> = {
                        package: "Trọn gói Master JSON",
                        video: "Prompt Video N+1 JSON",
                        storyboard: "Prompt Storyboard JSON",
                        thumbnail: "Prompt Thumbnail JSON",
                        automation: "Kịch bản Automation JSON",
                        dialogue: "Lời thoại kịch bản",
                      };
                      const label = tabNames[inspectorTab as keyof typeof tabNames] || "Dữ liệu";
                      const isJson = inspectorTab !== "dialogue";
                      const filename = `${selectedItemDetail.topic.slice(0, 30).replace(/[^a-zA-Z0-9]/g, "_")}_${inspectorTab}.json`;

                      return (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between px-1">
                            <span className="text-[11px] font-medium text-slate-400">
                              Đang xem: <strong className="text-slate-200">{label}</strong>
                              {isJson && (
                                <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                                  Valid JSON
                                </span>
                              )}
                            </span>

                            <div className="flex items-center space-x-2">
                              <button
                                type="button"
                                onClick={() => handleCopyTabContent(content, label)}
                                className="px-2.5 py-1 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 flex items-center space-x-1.5 transition-colors cursor-pointer"
                                title={`Sao chép ${label}`}
                              >
                                {tabCopied ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                                )}
                                <span>{tabCopied ? "Đã sao chép" : "Sao chép JSON"}</span>
                              </button>

                              {isJson && (
                                <button
                                  type="button"
                                  onClick={() => handleDownloadTabJson(content, filename)}
                                  className="px-2.5 py-1 text-xs font-semibold bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 rounded-lg flex items-center space-x-1.5 transition-colors cursor-pointer"
                                  title={`Tải về file ${filename}`}
                                >
                                  <Download className="w-3.5 h-3.5 text-indigo-400" />
                                  <span>Tải JSON này</span>
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Code Display Area */}
                          <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 text-xs font-mono text-slate-300 max-h-[360px] overflow-y-auto leading-relaxed whitespace-pre-wrap select-all selection:bg-indigo-500/30 selection:text-white">
                            {content || "// Chưa có dữ liệu cho bước này."}
                          </div>
                        </div>
                      );
                    })()
                  )}
                </div>
              ) : selectedItemDetail.error ? (
                <div className="p-4 bg-rose-950/30 border border-rose-500/30 rounded-xl text-xs text-rose-300 space-y-2">
                  <div className="font-bold flex items-center space-x-1.5">
                    <AlertCircle className="w-4 h-4 text-rose-400" />
                    <span>Kịch bản gặp lỗi trong quá trình tạo:</span>
                  </div>
                  <p className="text-slate-300 font-mono text-xs">{selectedItemDetail.error}</p>
                  <button
                    type="button"
                    onClick={() => handleGenerateSingleItem(selectedItemDetail.id)}
                    className="mt-2 px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-lg flex items-center space-x-1.5 shadow-sm transition-all cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Thử tạo lại kịch bản này</span>
                  </button>
                </div>
              ) : (
                <div className="p-5 bg-slate-950 rounded-xl border border-slate-800/80 space-y-3.5">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center space-x-1">
                        <Clock className="w-2.5 h-2.5" />
                        <span>Trạng thái: Chờ tạo (Pending)</span>
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Mascot: <strong className="text-slate-200">{selectedItemDetail.mascotName || config.mascotName}</strong> • Giọng đọc: <strong className="text-slate-200">{selectedItemDetail.regionAccent || config.regionAccent}</strong>
                    </p>
                  </div>

                  <div className="flex items-center space-x-3 pt-2 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => handleGenerateSingleItem(selectedItemDetail.id)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/30 flex items-center space-x-2 cursor-pointer transition-all"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>Bắt Đầu Tạo Kịch Bản Này Ngay</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        onLoadSingleScript(
                          {
                            topic: selectedItemDetail.topic,
                            coreContent: selectedItemDetail.coreContent,
                            targetAudience: selectedItemDetail.targetAudience,
                            mascotName: selectedItemDetail.mascotName,
                            regionAccent: selectedItemDetail.regionAccent,
                            pacingWpm: selectedItemDetail.pacingWpm,
                            visualStyle: selectedItemDetail.style,
                            voiceStyle: selectedItemDetail.voice,
                          },
                          { step1: "", step2: "", step3: "", step4: "", step5: "" }
                        );
                      }}
                      className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl flex items-center space-x-1.5 border border-slate-700 cursor-pointer transition-all"
                    >
                      <span>Mở sang chế độ 5 Bước</span>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Batch Sheets Export Modal */}
      <BatchSheetsExportModal
        isOpen={isBatchSheetsModalOpen}
        onClose={() => setIsBatchSheetsModalOpen(false)}
        items={items}
      />
    </div>
  );
};
