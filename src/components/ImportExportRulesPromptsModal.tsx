import React, { useState, useEffect, useMemo } from "react";
import {
  X,
  Upload,
  Download,
  FileJson,
  CheckCircle2,
  AlertCircle,
  Shield,
  ShieldAlert,
  FileText,
  Sparkles,
  Film,
  Camera,
  LayoutGrid,
  Tag,
  Volume2,
  Video,
  UserCheck,
  FileCheck,
  CheckSquare,
  Square,
  RotateCcw,
  Copy,
  Check,
  Layers,
  Plus,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Sliders,
  Package,
  MessageSquare,
} from "lucide-react";
import { PromptInputs, PromptTemplate, ImportableFieldKey } from "../types/template";
import {
  parseImportedJson,
  applyImportedFields,
  downloadBuiltinStandardFile,
  exportStandardRules,
  exportStandardPrompts,
  exportStandardBundle,
  ParsedImportResult,
} from "../utils/importExportUtils";
import {
  STANDARD_RULES_DATA,
  STANDARD_PROMPTS_DATA,
  STANDARD_BUNDLE_DATA,
} from "../data/standardFiles";

interface ImportExportRulesPromptsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTemplate?: PromptTemplate | null;
  allTemplates: PromptTemplate[];
  onApplyToCurrent: (updatedInputs: PromptInputs) => void;
  onSaveAsNewTemplate: (newTemplate: PromptTemplate) => void;
}

export const ImportExportRulesPromptsModal: React.FC<ImportExportRulesPromptsModalProps> = ({
  isOpen,
  onClose,
  currentTemplate,
  allTemplates,
  onApplyToCurrent,
  onSaveAsNewTemplate,
}) => {
  const [activeTab, setActiveTab] = useState<"import" | "export">("import");
  const [rawJsonInput, setRawJsonInput] = useState<string>("");
  const [parsedResult, setParsedResult] = useState<ParsedImportResult | null>(null);
  const [selectedFieldKeys, setSelectedFieldKeys] = useState<Set<ImportableFieldKey>>(new Set());
  const [expandedPreviewKey, setExpandedPreviewKey] = useState<string | null>(null);
  const [importTarget, setImportTarget] = useState<"current" | "new" | "default">("current");
  const [newTemplateName, setNewTemplateName] = useState<string>("");
  const [newTemplateTag, setNewTemplateTag] = useState<string>("Nhập Khẩu Chuẩn");
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [copiedPresetKey, setCopiedPresetKey] = useState<string | null>(null);

  // Export template selection
  const [selectedExportTemplateId, setSelectedExportTemplateId] = useState<string>(
    currentTemplate?.id || allTemplates[0]?.id || ""
  );

  useEffect(() => {
    if (currentTemplate?.id) {
      setSelectedExportTemplateId(currentTemplate.id);
    }
  }, [currentTemplate]);

  // Derive the active template being exported
  const activeExportTemplate: PromptTemplate = useMemo(() => {
    if (currentTemplate && (currentTemplate.id === selectedExportTemplateId || !selectedExportTemplateId)) {
      return currentTemplate;
    }
    const found = allTemplates.find((t) => t.id === selectedExportTemplateId);
    return found || currentTemplate || allTemplates[0];
  }, [selectedExportTemplateId, currentTemplate, allTemplates]);

  // Auto-parse on raw input change
  useEffect(() => {
    if (rawJsonInput.trim()) {
      const res = parseImportedJson(rawJsonInput);
      setParsedResult(res);
      if (res.success) {
        // Auto select all available fields that have content
        const validKeys = res.availableFields.filter((f) => f.hasContent).map((f) => f.key);
        setSelectedFieldKeys(new Set(validKeys));
        if (res.title && !newTemplateName) {
          setNewTemplateName(res.title);
        }
      }
    } else {
      setParsedResult(null);
      setSelectedFieldKeys(new Set());
    }
  }, [rawJsonInput]);

  useEffect(() => {
    if (isOpen) {
      setFeedbackMessage(null);
      if (currentTemplate && !newTemplateName) {
        setNewTemplateName(`${currentTemplate.name} (Bản Nhập)`);
      }
    }
  }, [isOpen, currentTemplate]);

  if (!isOpen) return null;

  const showToast = (type: "success" | "error", text: string) => {
    setFeedbackMessage({ type, text });
    setTimeout(() => {
      setFeedbackMessage(null);
    }, 4000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setRawJsonInput(content);
        showToast("success", `Đã tải tập tin "${file.name}" thành công!`);
      }
    };
    reader.onerror = () => {
      showToast("error", "Không thể đọc nội dung file tải lên!");
    };
    reader.readAsText(file);
  };

  const handleLoadPreset = (type: "rules" | "prompts" | "bundle") => {
    let sampleData: any;
    if (type === "rules") sampleData = STANDARD_RULES_DATA;
    else if (type === "prompts") sampleData = STANDARD_PROMPTS_DATA;
    else sampleData = STANDARD_BUNDLE_DATA;

    const jsonStr = JSON.stringify(sampleData, null, 2);
    setRawJsonInput(jsonStr);
    showToast("success", `Đã nạp dữ liệu mẫu "${sampleData.title}" vào bộ phân tích!`);
  };

  const toggleFieldSelection = (key: ImportableFieldKey) => {
    setSelectedFieldKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    if (!parsedResult) return;
    const all = parsedResult.availableFields.filter((f) => f.hasContent).map((f) => f.key);
    setSelectedFieldKeys(new Set(all));
  };

  const handleSelectOnlyRules = () => {
    if (!parsedResult) return;
    const rules = parsedResult.availableFields
      .filter((f) => f.category === "rules" && f.hasContent)
      .map((f) => f.key);
    setSelectedFieldKeys(new Set(rules));
  };

  const handleSelectOnlyPrompts = () => {
    if (!parsedResult) return;
    const prompts = parsedResult.availableFields
      .filter((f) => f.category === "prompts" && f.hasContent)
      .map((f) => f.key);
    setSelectedFieldKeys(new Set(prompts));
  };

  const handleDeselectAll = () => {
    setSelectedFieldKeys(new Set());
  };

  const handleExecuteImport = () => {
    if (!parsedResult || !parsedResult.success) {
      showToast("error", "Vui lòng cung cấp dữ liệu JSON hợp lệ trước khi thực hiện import!");
      return;
    }

    if (selectedFieldKeys.size === 0) {
      showToast("error", "Vui lòng chọn ít nhất 1 mục (Quy tắc hoặc Prompt) để import!");
      return;
    }

    const selectedKeysArray = Array.from(selectedFieldKeys) as ImportableFieldKey[];

    if (importTarget === "new") {
      const baseInputs: PromptInputs = currentTemplate?.data || (allTemplates[0]?.data as any);
      const updatedInputs = applyImportedFields(baseInputs, selectedKeysArray, parsedResult.fullValues);
      
      const newTpl: PromptTemplate = {
        id: `tpl_imported_${Date.now()}`,
        name: newTemplateName.trim() || parsedResult.title || "Template Kịch Bản Nhập Khẩu",
        tag: newTemplateTag.trim() || "Nhập Khẩu",
        description: parsedResult.description || "Template được nhập từ file cấu hình chuẩn",
        isBuiltIn: false,
        createdAt: new Date().toISOString(),
        data: updatedInputs,
      };

      onSaveAsNewTemplate(newTpl);
      showToast("success", `Đã tạo thành công Template mới "${newTpl.name}" với ${selectedKeysArray.length} trường cấu hình!`);
      setTimeout(() => onClose(), 1200);
    } else {
      // Apply to currently editing template
      const baseInputs: PromptInputs = currentTemplate?.data || (allTemplates[0]?.data as any);
      const updatedInputs = applyImportedFields(baseInputs, selectedKeysArray, parsedResult.fullValues);

      onApplyToCurrent(updatedInputs);
      showToast("success", `Đã cập nhật ${selectedKeysArray.length} mục vào Template "${currentTemplate?.name || 'Mặc định'}"!`);
      setTimeout(() => onClose(), 1200);
    }
  };

  const rulesFields = parsedResult?.availableFields.filter((f) => f.category === "rules") || [];
  const promptsFields = parsedResult?.availableFields.filter((f) => f.category === "prompts") || [];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-4xl w-full p-5 sm:p-6 shadow-2xl space-y-4 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3.5 shrink-0">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500 to-indigo-600 text-slate-950 shadow-md">
              <Sliders className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-slate-100 text-base truncate">
                  Quản Lý File Chuẩn & Import / Export
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
                  Rules & Prompts v2
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate">
                Tải file mẫu chuẩn hoặc nạp toàn bộ / từng phần Quy tắc An toàn & Cấu trúc Prompt 5 bước
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors shrink-0"
            title="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Toast Message */}
        {feedbackMessage && (
          <div
            className={`p-3 rounded-xl text-xs flex items-center space-x-2 animate-in fade-in shrink-0 ${
              feedbackMessage.type === "success"
                ? "bg-emerald-950/90 border border-emerald-500/50 text-emerald-300"
                : "bg-rose-950/90 border border-rose-500/50 text-rose-300"
            }`}
          >
            {feedbackMessage.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span className="font-medium">{feedbackMessage.text}</span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex items-center space-x-2 bg-slate-950 p-1 rounded-xl border border-slate-800 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("import")}
            className={`flex-1 py-2 px-4 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-2 ${
              activeTab === "import"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>1. Nạp File / Import Từng Phần</span>
            {parsedResult?.success && (
              <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-emerald-500 text-slate-950 font-black">
                {selectedFieldKeys.size}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("export")}
            className={`flex-1 py-2 px-4 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-2 ${
              activeTab === "export"
                ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Download className="w-4 h-4" />
            <span>2. Tải File Chuẩn & Xuất File (Export)</span>
          </button>
        </div>

        {/* TAB 1: IMPORT & SELECTIVE FIELD PICKER */}
        {activeTab === "import" && (
          <div className="flex-1 overflow-y-auto pr-1 space-y-4 text-xs">
            {/* Step 1: Input source */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center space-x-2">
                  <FileJson className="w-4 h-4 text-indigo-400" />
                  <span className="font-bold text-slate-200 text-xs">
                    Bước 1: Chọn File JSON hoặc Dán nội dung JSON
                  </span>
                </div>

                {/* Quick Presets Buttons */}
                <div className="flex items-center space-x-1.5 flex-wrap">
                  <span className="text-[11px] text-slate-400">Nạp nhanh mẫu chuẩn:</span>
                  <button
                    type="button"
                    onClick={() => handleLoadPreset("rules")}
                    className="px-2 py-0.8 rounded text-[11px] font-medium bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/60 transition-colors"
                  >
                    🛡️ Rules File
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLoadPreset("prompts")}
                    className="px-2 py-0.8 rounded text-[11px] font-medium bg-sky-950/80 border border-sky-500/40 text-sky-300 hover:bg-sky-900/60 transition-colors"
                  >
                    📝 Prompts File
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLoadPreset("bundle")}
                    className="px-2 py-0.8 rounded text-[11px] font-medium bg-amber-950/80 border border-amber-500/40 text-amber-300 hover:bg-amber-900/60 transition-colors"
                  >
                    📦 Gói Trọn Bộ
                  </button>
                </div>
              </div>

              {/* Upload Input & Text Area */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-1 flex flex-col justify-center items-center border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-xl p-4 text-center cursor-pointer transition-colors bg-slate-900/50 group relative">
                  <input
                    type="file"
                    accept=".json,application/json"
                    onChange={handleFileUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <Upload className="w-7 h-7 text-indigo-400 group-hover:scale-110 transition-transform mb-1.5" />
                  <span className="font-bold text-slate-200 text-xs">Tải File JSON Lên</span>
                  <span className="text-[10px] text-slate-400 mt-1">Hỗ trợ .json từ máy tính</span>
                </div>

                <div className="md:col-span-2 flex flex-col space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Hoặc dán chuỗi JSON trực tiếp vào đây:</span>
                    {rawJsonInput && (
                      <button
                        type="button"
                        onClick={() => setRawJsonInput("")}
                        className="text-rose-400 hover:text-rose-300"
                      >
                        Xóa nội dung
                      </button>
                    )}
                  </div>
                  <textarea
                    rows={4}
                    value={rawJsonInput}
                    onChange={(e) => setRawJsonInput(e.target.value)}
                    placeholder='Dán chuỗi JSON tại đây (Ví dụ: {"type": "rules_standard", "rules": {...}} hoặc {"type": "prompts_standard", "prompts": {...}})'
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-[11px] text-slate-200 font-mono focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Error state */}
            {parsedResult && !parsedResult.success && (
              <div className="p-3 bg-rose-950/80 border border-rose-500/50 rounded-xl text-rose-300 flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold text-xs">{parsedResult.formatTitle}</span>
                  <p className="text-[11px] text-rose-200">{parsedResult.error}</p>
                </div>
              </div>
            )}

            {/* Step 2: Parsed Inspection & Modular Field Checkbox Selection */}
            {parsedResult && parsedResult.success && (
              <div className="space-y-4 animate-in fade-in">
                {/* Detected Banner */}
                <div className="p-3.5 bg-indigo-950/60 border border-indigo-500/40 rounded-xl flex items-center justify-between flex-wrap gap-2">
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span className="font-bold text-slate-100 text-xs">
                        Đã nhận diện: {parsedResult.formatTitle}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-indigo-500/30 text-indigo-200 border border-indigo-500/40">
                        {parsedResult.formatBadge}
                      </span>
                    </div>
                    {parsedResult.description && (
                      <p className="text-[11px] text-slate-300 line-clamp-1">
                        {parsedResult.description}
                      </p>
                    )}
                  </div>

                  {/* Filter / Quick selection buttons */}
                  <div className="flex items-center space-x-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={handleSelectAll}
                      className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[11px] font-bold transition-all flex items-center space-x-1"
                    >
                      <CheckSquare className="w-3 h-3" />
                      <span>Chọn Tất Cả</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleSelectOnlyRules}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-500/30 rounded-lg text-[11px] font-semibold transition-all"
                    >
                      Chỉ Rules ({rulesFields.filter((f) => f.hasContent).length})
                    </button>
                    <button
                      type="button"
                      onClick={handleSelectOnlyPrompts}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-sky-300 border border-sky-500/30 rounded-lg text-[11px] font-semibold transition-all"
                    >
                      Chỉ Prompts ({promptsFields.filter((f) => f.hasContent).length})
                    </button>
                    <button
                      type="button"
                      onClick={handleDeselectAll}
                      className="px-2 py-1 text-slate-400 hover:text-slate-200 text-[11px]"
                    >
                      Bỏ chọn hết
                    </button>
                  </div>
                </div>

                {/* Granular Field Selection by Category */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Category 1: RULES */}
                  <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 space-y-2.5">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <div className="flex items-center space-x-1.5 text-emerald-400 font-bold text-xs">
                        <Shield className="w-4 h-4" />
                        <span>1. Nhóm Quy Tắc An Toàn & Khóa Chuẩn (Rules)</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {rulesFields.filter((f) => selectedFieldKeys.has(f.key)).length} / {rulesFields.length} đã chọn
                      </span>
                    </div>

                    <div className="space-y-2">
                      {rulesFields.map((field) => {
                        const isSelected = selectedFieldKeys.has(field.key);
                        const isExpanded = expandedPreviewKey === field.key;
                        return (
                          <div
                            key={field.key}
                            className={`p-2.5 rounded-lg border transition-all ${
                              !field.hasContent
                                ? "bg-slate-950/30 border-slate-800/40 opacity-50"
                                : isSelected
                                ? "bg-emerald-950/30 border-emerald-500/40 shadow-sm"
                                : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <label className="flex items-start space-x-2.5 cursor-pointer flex-1 min-w-0">
                                <input
                                  type="checkbox"
                                  disabled={!field.hasContent}
                                  checked={isSelected}
                                  onChange={() => toggleFieldSelection(field.key)}
                                  className="mt-0.5 rounded text-emerald-500 focus:ring-emerald-500 w-3.5 h-3.5 bg-slate-900 border-slate-700 shrink-0"
                                />
                                <div className="space-y-0.5 min-w-0 flex-1">
                                  <div className="flex items-center space-x-1.5 flex-wrap">
                                    <span className="font-bold text-slate-100 text-xs truncate">
                                      {field.label}
                                    </span>
                                    <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-slate-800 text-emerald-300">
                                      {field.badge}
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-slate-400 line-clamp-1">
                                    {field.description}
                                  </p>
                                </div>
                              </label>

                              {field.hasContent && (
                                <button
                                  type="button"
                                  onClick={() => setExpandedPreviewKey(isExpanded ? null : field.key)}
                                  className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors shrink-0"
                                  title={isExpanded ? "Thu gọn xem trước" : "Xem trước nội dung"}
                                >
                                  {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                </button>
                              )}
                            </div>

                            {/* Collapsible preview */}
                            {isExpanded && field.hasContent && (
                              <div className="mt-2 p-2 bg-slate-950 rounded border border-slate-800 font-mono text-[10px] text-slate-300 whitespace-pre-wrap max-h-36 overflow-y-auto leading-relaxed">
                                {String(field.value)}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Category 2: PROMPTS */}
                  <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 space-y-2.5">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <div className="flex items-center space-x-1.5 text-sky-400 font-bold text-xs">
                        <MessageSquare className="w-4 h-4" />
                        <span>2. Nhóm Cấu Trúc Prompt Chuẩn (Prompts)</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {promptsFields.filter((f) => selectedFieldKeys.has(f.key)).length} / {promptsFields.length} đã chọn
                      </span>
                    </div>

                    <div className="space-y-2">
                      {promptsFields.map((field) => {
                        const isSelected = selectedFieldKeys.has(field.key);
                        const isExpanded = expandedPreviewKey === field.key;
                        return (
                          <div
                            key={field.key}
                            className={`p-2.5 rounded-lg border transition-all ${
                              !field.hasContent
                                ? "bg-slate-950/30 border-slate-800/40 opacity-50"
                                : isSelected
                                ? "bg-sky-950/30 border-sky-500/40 shadow-sm"
                                : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <label className="flex items-start space-x-2.5 cursor-pointer flex-1 min-w-0">
                                <input
                                  type="checkbox"
                                  disabled={!field.hasContent}
                                  checked={isSelected}
                                  onChange={() => toggleFieldSelection(field.key)}
                                  className="mt-0.5 rounded text-sky-500 focus:ring-sky-500 w-3.5 h-3.5 bg-slate-900 border-slate-700 shrink-0"
                                />
                                <div className="space-y-0.5 min-w-0 flex-1">
                                  <div className="flex items-center space-x-1.5 flex-wrap">
                                    <span className="font-bold text-slate-100 text-xs truncate">
                                      {field.label}
                                    </span>
                                    <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-slate-800 text-sky-300">
                                      {field.badge}
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-slate-400 line-clamp-1">
                                    {field.description}
                                  </p>
                                </div>
                              </label>

                              {field.hasContent && (
                                <button
                                  type="button"
                                  onClick={() => setExpandedPreviewKey(isExpanded ? null : field.key)}
                                  className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors shrink-0"
                                  title={isExpanded ? "Thu gọn xem trước" : "Xem trước nội dung"}
                                >
                                  {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                </button>
                              )}
                            </div>

                            {/* Collapsible preview */}
                            {isExpanded && field.hasContent && (
                              <div className="mt-2 p-2 bg-slate-950 rounded border border-slate-800 font-mono text-[10px] text-slate-300 whitespace-pre-wrap max-h-36 overflow-y-auto leading-relaxed">
                                {String(field.value)}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Step 3: Destination selection & Execution */}
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                  <span className="font-bold text-slate-200 text-xs block">
                    Bước 3: Chọn nơi áp dụng các mục đã chọn
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start space-x-3 ${
                        importTarget === "current"
                          ? "bg-indigo-950/40 border-indigo-500/60 ring-1 ring-indigo-500/30"
                          : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      <input
                        type="radio"
                        name="importTarget"
                        value="current"
                        checked={importTarget === "current"}
                        onChange={() => setImportTarget("current")}
                        className="mt-1 text-indigo-600 focus:ring-indigo-500 bg-slate-900 border-slate-700"
                      />
                      <div className="space-y-0.5">
                        <span className="font-bold text-slate-100 text-xs block">
                          Áp dụng vào Template Hiện Tại
                        </span>
                        <span className="text-[11px] text-slate-400 block">
                          Cập nhật các mục đã chọn vào "{currentTemplate?.name || 'Template mặc định'}"
                        </span>
                      </div>
                    </label>

                    <label
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start space-x-3 ${
                        importTarget === "new"
                          ? "bg-amber-950/40 border-amber-500/60 ring-1 ring-amber-500/30"
                          : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      <input
                        type="radio"
                        name="importTarget"
                        value="new"
                        checked={importTarget === "new"}
                        onChange={() => setImportTarget("new")}
                        className="mt-1 text-amber-500 focus:ring-amber-500 bg-slate-900 border-slate-700"
                      />
                      <div className="space-y-0.5 flex-1">
                        <span className="font-bold text-slate-100 text-xs block">
                          Lưu thành một Template Mới
                        </span>
                        <span className="text-[11px] text-slate-400 block">
                          Tạo mới một mẫu template kịch bản độc lập trong danh sách
                        </span>
                      </div>
                    </label>
                  </div>

                  {/* Template name input if creating new */}
                  {importTarget === "new" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 animate-in fade-in">
                      <div className="space-y-1">
                        <label className="text-[11px] text-slate-300 font-semibold">Tên Template Mới:</label>
                        <input
                          type="text"
                          value={newTemplateName}
                          onChange={(e) => setNewTemplateName(e.target.value)}
                          placeholder="Ví dụ: Trà Dây Bstar - Tiêu Hóa v2"
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:border-amber-500 outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] text-slate-300 font-semibold">Thẻ Phân Loại (Tag):</label>
                        <input
                          type="text"
                          value={newTemplateTag}
                          onChange={(e) => setNewTemplateTag(e.target.value)}
                          placeholder="Ví dụ: Tiêu hóa, Thần kinh, Gan mật..."
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:border-amber-500 outline-none"
                        />
                      </div>
                    </div>
                  )}

                  {/* Primary Action Button */}
                  <div className="pt-2 flex items-center justify-end space-x-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 rounded-xl text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-semibold transition-colors"
                    >
                      Hủy bỏ
                    </button>

                    <button
                      type="button"
                      onClick={handleExecuteImport}
                      disabled={selectedFieldKeys.size === 0}
                      className={`px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-lg flex items-center space-x-2 ${
                        selectedFieldKeys.size > 0
                          ? "bg-gradient-to-r from-indigo-600 to-amber-500 hover:from-indigo-500 hover:to-amber-400 text-slate-950 shadow-indigo-500/20 cursor-pointer"
                          : "bg-slate-800 text-slate-500 cursor-not-allowed"
                      }`}
                    >
                      <Check className="w-4 h-4" />
                      <span>
                        Xác Nhận Nạp {selectedFieldKeys.size} Mục Đã Chọn Vào Hệ Thống
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: DOWNLOAD STANDARD FILES & EXPORT */}
        {activeTab === "export" && (
          <div className="flex-1 overflow-y-auto pr-1 space-y-4 text-xs">
            <div className="space-y-1">
              <h4 className="font-bold text-slate-200 text-sm flex items-center space-x-2">
                <span>Tải File Mẫu Chuẩn & Xuất Dữ Liệu Hệ Thống</span>
                <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                  Chuẩn JSON v2.0
                </span>
              </h4>
              <p className="text-[11px] text-slate-400">
                Tải xuống các tập tin quy tắc, prompt và cấu hình đã cập nhật từ Template của bạn hoặc tải bản mẫu gốc mặc định của hệ thống.
              </p>
            </div>

            {/* Template Source Selector */}
            <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between flex-wrap gap-3">
              <div className="space-y-0.5">
                <div className="flex items-center space-x-2 flex-wrap">
                  <span className="text-xs font-bold text-slate-200">
                    📦 Nguồn Dữ Liệu Đang Xuất:
                  </span>
                  <span className="text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-md border border-amber-500/20">
                    {activeExportTemplate?.name || "Template Mặc Định"}
                  </span>
                  {activeExportTemplate?.tag && (
                    <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                      #{activeExportTemplate.tag}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400">
                  Mọi tùy chỉnh mới nhất về Rules, Prompts, Từ lóng, Mascot... trong template này sẽ được đóng gói chính xác vào file JSON tải về.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <label className="text-[11px] text-slate-400 font-medium whitespace-nowrap">Chọn Template:</label>
                <select
                  value={selectedExportTemplateId}
                  onChange={(e) => setSelectedExportTemplateId(e.target.value)}
                  className="bg-slate-900 border border-slate-700 hover:border-slate-600 text-slate-100 text-xs rounded-lg px-2.5 py-1.5 focus:border-amber-500 outline-none cursor-pointer font-medium max-w-[220px] truncate"
                >
                  {allTemplates.map((tpl) => (
                    <option key={tpl.id} value={tpl.id}>
                      {tpl.id === currentTemplate?.id ? `⭐ [Đang dùng] ${tpl.name}` : tpl.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 3 Standard File Preset Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {/* Card 1: Standard Rules File */}
              <div className="bg-slate-950/80 border border-emerald-500/30 rounded-xl p-4 flex flex-col justify-between space-y-3 hover:border-emerald-500/60 transition-all">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      <Shield className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-slate-100 text-xs block">
                        Tập Tin Quy Tắc (Rules)
                      </span>
                      <span className="text-[10px] text-emerald-300">Standard Rules File</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Xuất toàn bộ quy tắc an toàn y tế, khóa 100% nhân vật & mascot, quy chuẩn ảnh/audio/video, từ lóng 4 vùng miền và từ an toàn.
                  </p>

                  <div className="p-2 bg-slate-900 rounded-lg border border-slate-800 text-[10px] text-slate-400 space-y-0.5 font-mono">
                    <div>• Version: 2.0.0 (JSON)</div>
                    <div>• Format: rules_standard</div>
                    <div>• Template: {activeExportTemplate?.name || "Mặc định"}</div>
                  </div>
                </div>

                <div className="space-y-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      exportStandardRules(activeExportTemplate.data, activeExportTemplate.name);
                      showToast("success", `Đã tải về tập tin Rules đã cập nhật của "${activeExportTemplate.name}"!`);
                    }}
                    className="w-full py-2 px-3 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center space-x-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Tải Rules Đã Cập Nhật (.json)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      downloadBuiltinStandardFile("rules");
                      showToast("success", "Đã tải về file Rules mẫu gốc mặc định!");
                    }}
                    className="w-full py-1.5 px-2.5 rounded-lg text-[11px] font-medium text-slate-400 hover:text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors flex items-center justify-center space-x-1"
                  >
                    <RotateCcw className="w-3 h-3 text-slate-500" />
                    <span>Tải Mẫu Gốc Mặc Định</span>
                  </button>
                </div>
              </div>

              {/* Card 2: Standard Prompts File */}
              <div className="bg-slate-950/80 border border-sky-500/30 rounded-xl p-4 flex flex-col justify-between space-y-3 hover:border-sky-500/60 transition-all">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/30">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-slate-100 text-xs block">
                        Tập Tin Prompt (5 Bước)
                      </span>
                      <span className="text-[10px] text-sky-300">Standard Prompts File</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Xuất đầy đủ khung prompt Bước 1 (Hội thoại), Bước 2 (Storyboard 9:16), Bước 3 (Video VEO3), Bước 4 (Thumbnail), Mascot 3D và Style.
                  </p>

                  <div className="p-2 bg-slate-900 rounded-lg border border-slate-800 text-[10px] text-slate-400 space-y-0.5 font-mono">
                    <div>• Version: 2.0.0 (JSON)</div>
                    <div>• Format: prompts_standard</div>
                    <div>• Template: {activeExportTemplate?.name || "Mặc định"}</div>
                  </div>
                </div>

                <div className="space-y-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      exportStandardPrompts(activeExportTemplate.data, activeExportTemplate.name);
                      showToast("success", `Đã tải về tập tin Prompts đã cập nhật của "${activeExportTemplate.name}"!`);
                    }}
                    className="w-full py-2 px-3 rounded-lg text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white transition-all shadow-md shadow-sky-600/20 flex items-center justify-center space-x-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Tải Prompts Đã Cập Nhật (.json)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      downloadBuiltinStandardFile("prompts");
                      showToast("success", "Đã tải về file Prompts mẫu gốc mặc định!");
                    }}
                    className="w-full py-1.5 px-2.5 rounded-lg text-[11px] font-medium text-slate-400 hover:text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors flex items-center justify-center space-x-1"
                  >
                    <RotateCcw className="w-3 h-3 text-slate-500" />
                    <span>Tải Mẫu Gốc Mặc Định</span>
                  </button>
                </div>
              </div>

              {/* Card 3: Full Standard Bundle */}
              <div className="bg-slate-950/80 border-2 border-amber-500/60 rounded-xl p-4 flex flex-col justify-between space-y-3 hover:border-amber-500/90 transition-all shadow-lg shadow-amber-500/10">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/40">
                      <Package className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-amber-300 text-xs block">
                        Gói Trọn Bộ Toàn Diện
                      </span>
                      <span className="text-[10px] text-amber-200/80">Standard Full Bundle</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-200 leading-relaxed">
                    Trọn gói 100% gồm tất cả 8 Rules + 7 Prompts + Cấu hình kịch bản (giọng đọc, tỷ lệ 9:16, đối tượng, bối cảnh) đã cập nhật.
                  </p>

                  <div className="p-2 bg-slate-900 rounded-lg border border-amber-500/30 text-[10px] text-slate-300 space-y-0.5 font-mono">
                    <div>• Version: 2.0.0 (JSON)</div>
                    <div>• Format: bundle_standard</div>
                    <div className="text-amber-300 font-bold">• Đầy đủ 100% Rules + Prompts + Config</div>
                  </div>
                </div>

                <div className="space-y-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      exportStandardBundle(activeExportTemplate);
                      showToast("success", `Đã tải về Gói Trọn Bộ Toàn Diện của "${activeExportTemplate.name}" thành công!`);
                    }}
                    className="w-full py-2.5 px-3 rounded-lg text-xs font-bold bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 transition-all shadow-md shadow-amber-500/30 flex items-center justify-center space-x-1.5 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Tải Gói Trọn Bộ Của Bạn (.json)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      downloadBuiltinStandardFile("bundle");
                      showToast("success", "Đã tải về Gói Trọn Bộ mẫu gốc mặc định!");
                    }}
                    className="w-full py-1.5 px-2.5 rounded-lg text-[11px] font-medium text-slate-400 hover:text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors flex items-center justify-center space-x-1"
                  >
                    <RotateCcw className="w-3 h-3 text-slate-500" />
                    <span>Tải Bản Mẫu Gốc Mặc Định</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
