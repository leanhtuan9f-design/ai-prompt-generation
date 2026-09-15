import React, { useState, useMemo } from "react";
import {
  CheckCircle,
  Copy,
  Check,
  RefreshCw,
  Download,
  BookmarkPlus,
  CheckCheck,
  Code2,
  Sparkles,
  FileEdit,
  AlignLeft,
  ListOrdered,
  AlertTriangle,
  Wand2,
  Package,
  Table,
} from "lucide-react";
import {
  cleanStep5JsonOutput,
  validateStep5Json,
  buildUnifiedScriptJsonPackage,
  countDialogueScenes,
} from "../utils/jsonCleaner";
import { buildSheets5ColumnsRow, rowToTsvString } from "../utils/sheetsFormatter";
import { SheetsTableViewer } from "./SheetsTableViewer";
import { PromptInputs, StepsContent } from "../types";

interface Step5AutomationJsonProps {
  content: string;
  isGenerating: boolean;
  onRegenerate: () => void;
  onContentChange: (newContent: string) => void;
  onSaveScript: () => void;
  title: string;
  inputs?: PromptInputs;
  allStepsContent?: StepsContent;
}

export const Step5AutomationJson: React.FC<Step5AutomationJsonProps> = ({
  content,
  isGenerating,
  onRegenerate,
  onContentChange,
  onSaveScript,
  title,
  inputs,
  allStepsContent,
}) => {
  const [copied, setCopied] = useState(false);
  const [copiedMaster, setCopiedMaster] = useState(false);
  const [copiedSheetsRow, setCopiedSheetsRow] = useState(false);
  const [viewMode, setViewMode] = useState<"sheets" | "json">("sheets");
  const [isEditing, setIsEditing] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [cleanedSuccess, setCleanedSuccess] = useState(false);
  const [displayFormat, setDisplayFormat] = useState<"compact-no-brackets" | "compact" | "pretty">("compact-no-brackets");

  // Expected dialogues count from step 1
  const expectedDialogueCount = useMemo(() => {
    return countDialogueScenes(allStepsContent?.step1);
  }, [allStepsContent?.step1]);

  // Validate the current JSON
  const validation = useMemo(() => validateStep5Json(content), [content]);

  // Clean formatted content for display (enforces exact N scenes matching N dialogues)
  const formattedContent = useMemo(() => {
    if (!content) return "";
    return cleanStep5JsonOutput(content, displayFormat, expectedDialogueCount);
  }, [content, displayFormat, expectedDialogueCount]);

  const handleCopy = () => {
    const textToCopy = cleanStep5JsonOutput(content, displayFormat, expectedDialogueCount) || content;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopySheetsRow = () => {
    const steps = allStepsContent || { step5: content };
    const row = buildSheets5ColumnsRow(steps);
    const tsv = rowToTsvString(row);
    navigator.clipboard.writeText(tsv);
    setCopiedSheetsRow(true);
    setTimeout(() => setCopiedSheetsRow(false), 2000);
  };

  const handleCopyMasterPackage = () => {
    const masterJson = buildUnifiedScriptJsonPackage(inputs || {}, allStepsContent || { step5: content });
    navigator.clipboard.writeText(masterJson);
    setCopiedMaster(true);
    setTimeout(() => setCopiedMaster(false), 2000);
  };

  const handleCleanJson = () => {
    const cleaned = cleanStep5JsonOutput(content, displayFormat, expectedDialogueCount);
    if (cleaned) {
      onContentChange(cleaned);
      setCleanedSuccess(true);
      setTimeout(() => setCleanedSuccess(false), 2000);
    }
  };

  const handleToggleFormat = (format: "compact-no-brackets" | "compact" | "pretty") => {
    setDisplayFormat(format);
    const reFormatted = cleanStep5JsonOutput(content, format, expectedDialogueCount);
    if (reFormatted) {
      onContentChange(reFormatted);
    }
  };

  const handleDownloadJson = () => {
    const filename = `${(title || "script_3d_health_video").replace(/[^a-zA-Z0-9_-]/g, "_")}_automation.json`;
    const cleanContent = cleanStep5JsonOutput(content, displayFormat, expectedDialogueCount) || content;

    const blob = new Blob([cleanContent], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadMasterPackage = () => {
    const masterJson = buildUnifiedScriptJsonPackage(inputs || {}, allStepsContent || { step5: content });
    const filename = `${(title || "script_3d_health_video").replace(/[^a-zA-Z0-9_-]/g, "_")}_master_package.json`;

    const blob = new Blob([masterJson], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSaveToHistory = () => {
    onSaveScript();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2 flex-wrap gap-y-1">
            <span className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 font-bold text-xs flex items-center justify-center">
              5
            </span>
            <h3 className="text-base font-bold text-slate-100">
              BƯỚC 5: PROMPT TẠO VEO & KỊCH BẢN JSON (ĐÚNG N SCENES = N THOẠI)
            </h3>
            {validation.isValid ? (
              <span className="px-2.5 py-0.5 text-[11px] font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 rounded-full flex items-center space-x-1">
                <CheckCircle className="w-3 h-3 text-emerald-400" />
                <span>JSON Chuẩn ({validation.sceneCount} Cảnh)</span>
              </span>
            ) : content ? (
              <span className="px-2.5 py-0.5 text-[11px] font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30 rounded-full flex items-center space-x-1">
                <AlertTriangle className="w-3 h-3 text-amber-400" />
                <span>Cần làm sạch JSON</span>
              </span>
            ) : (
              <span className="px-2.5 py-0.5 text-[11px] font-semibold bg-slate-800 text-slate-400 rounded-full">
                Chờ dữ liệu
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            JSON Video Scripts gồm đúng N scenes (bằng đúng số câu thoại) • Mỗi cảnh 1 dòng • Sẵn sàng dán vào Google Sheets, N8N, Make.com
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Auto clean button */}
          <button
            id="btn-clean-step5"
            onClick={handleCleanJson}
            disabled={!content}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-950/70 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-500/40 rounded-lg transition-colors disabled:opacity-40"
            title="Loại bỏ các câu dẫn dắt, markdown ```json thừa và chuẩn hóa format"
          >
            {cleanedSuccess ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Wand2 className="w-3.5 h-3.5 text-emerald-400" />
            )}
            <span>{cleanedSuccess ? "Đã làm sạch!" : "Làm sạch JSON"}</span>
          </button>

          <button
            id="btn-edit-step5"
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition-colors"
          >
            <FileEdit className="w-3.5 h-3.5 text-slate-400" />
            <span>{isEditing ? "Xem trước" : "Chỉnh sửa"}</span>
          </button>

          <button
            id="btn-copy-sheets-row"
            onClick={handleCopySheetsRow}
            disabled={!content}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-lg transition-all shadow-md shadow-amber-400/20 disabled:opacity-40"
            title="Sao chép 1 dòng chuẩn 5 cột (Copy Tạo storyboard | Lời thoại | Sences | Copy Tạo Thumbnail | Video Scripts) để dán trực tiếp vào Google Sheet"
          >
            {copiedSheetsRow ? (
              <Check className="w-3.5 h-3.5 text-slate-950" />
            ) : (
              <Table className="w-3.5 h-3.5 text-slate-950" />
            )}
            <span>{copiedSheetsRow ? "Đã chép 5 Cột Sheet!" : "📋 Copy 1 Dòng (Google Sheet)"}</span>
          </button>

          <button
            id="btn-copy-master-package"
            onClick={handleCopyMasterPackage}
            disabled={!content}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold bg-indigo-950/80 hover:bg-indigo-900/90 text-indigo-300 border border-indigo-500/40 rounded-lg transition-colors disabled:opacity-40"
            title="Sao chép Master JSON gồm cả 3 Prompts (Storyboard, Video N+1, Thumbnail) và 12 Trường Automation"
          >
            {copiedMaster ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Package className="w-3.5 h-3.5 text-indigo-400" />
            )}
            <span>{copiedMaster ? "Đã chép Trọn Gói" : "Chép Trọn Gói JSON"}</span>
          </button>

          <button
            id="btn-copy-step5"
            onClick={handleCopy}
            disabled={!content}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition-colors disabled:opacity-40"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
            <span>{copied ? "Đã sao chép" : "Sao chép JSON"}</span>
          </button>

          <button
            id="btn-download-master-package"
            onClick={handleDownloadMasterPackage}
            disabled={!content}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg transition-colors shadow-md shadow-amber-500/20 disabled:opacity-50"
            title="Tải về file JSON Master chứa toàn bộ 3 Prompts + Cảnh Automation"
          >
            <Download className="w-3.5 h-3.5 text-slate-950" />
            <span>Tải Trọn Gói JSON</span>
          </button>

          <button
            id="btn-save-step5"
            onClick={handleSaveToHistory}
            disabled={!content}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg transition-colors disabled:opacity-50"
          >
            {savedSuccess ? (
              <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <BookmarkPlus className="w-3.5 h-3.5 text-amber-400" />
            )}
            <span>{savedSuccess ? "Đã lưu kịch bản!" : "Lưu vào Lịch sử"}</span>
          </button>

          <button
            id="btn-regenerate-step5"
            onClick={onRegenerate}
            disabled={isGenerating}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-400 ${isGenerating ? "animate-spin" : ""}`} />
            <span>Tạo lại</span>
          </button>
        </div>
      </div>

      {/* View Mode & JSON Format Selector Banner */}
      <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
        {/* Main View Mode Selector */}
        <div className="flex items-center space-x-1.5 bg-slate-900 p-1 rounded-lg border border-slate-800">
          <button
            id="btn-viewmode-sheets"
            onClick={() => setViewMode("sheets")}
            className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs rounded-md font-bold transition-all cursor-pointer ${
              viewMode === "sheets"
                ? "bg-amber-400 text-slate-950 shadow-md shadow-amber-400/30"
                : "text-amber-300 hover:text-amber-200"
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            <span>📊 Bảng Google Sheet (5 Cột chuẩn)</span>
          </button>

          <button
            id="btn-viewmode-json"
            onClick={() => setViewMode("json")}
            className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs rounded-md font-bold transition-all cursor-pointer ${
              viewMode === "json"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>📋 JSON Kịch Bản (12 Trường)</span>
          </button>
        </div>

        {/* Format Selector if JSON mode */}
        {viewMode === "json" && (
          <div className="flex items-center bg-slate-900 p-1 rounded-lg border border-slate-800 space-x-1">
            <button
              id="btn-format-no-brackets"
              onClick={() => handleToggleFormat("compact-no-brackets")}
              className={`flex items-center space-x-1 px-2 py-1 text-xs rounded-md transition-colors ${
                displayFormat === "compact-no-brackets"
                  ? "bg-amber-400 text-slate-950 font-bold shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              title="Bỏ dấu bao [ ] - Mỗi cảnh là 1 dòng JSON độc lập"
            >
              <ListOrdered className="w-3 h-3" />
              <span>Bỏ dấu [ ] (Chuẩn)</span>
            </button>

            <button
              id="btn-format-compact"
              onClick={() => handleToggleFormat("compact")}
              className={`flex items-center space-x-1 px-2 py-1 text-xs rounded-md transition-colors ${
                displayFormat === "compact"
                  ? "bg-emerald-500 text-slate-950 font-bold shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              title="Mảng JSON đầy đủ kèm ngoặc vuông [ ... ]"
            >
              <span>Có mảng [ ... ]</span>
            </button>

            <button
              id="btn-format-pretty"
              onClick={() => handleToggleFormat("pretty")}
              className={`flex items-center space-x-1 px-2 py-1 text-xs rounded-md transition-colors ${
                displayFormat === "pretty"
                  ? "bg-indigo-600 text-white font-bold shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              title="Mở rộng xuống dòng chuẩn Pretty JSON"
            >
              <AlignLeft className="w-3 h-3" />
              <span>Pretty</span>
            </button>
          </div>
        )}
      </div>

      {/* Content View / Editor */}
      <div className="space-y-4">
        {viewMode === "sheets" ? (
          <SheetsTableViewer
            stepsContent={allStepsContent || { step5: content }}
            inputs={inputs}
            title={title}
          />
        ) : isEditing ? (
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-400">
                Chỉnh sửa JSON kịch bản (Nhấn 'Làm sạch JSON' nếu muốn tự động sửa lỗi):
              </label>
              <button
                onClick={handleCleanJson}
                className="text-[11px] text-emerald-400 hover:underline flex items-center space-x-1"
              >
                <Sparkles className="w-3 h-3" />
                <span>Tự động chuẩn hóa cú pháp JSON</span>
              </button>
            </div>
            <textarea
              id="textarea-step5-edit"
              rows={20}
              value={content}
              onChange={(e) => onContentChange(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-xs sm:text-sm text-slate-200 font-mono focus:outline-none focus:border-amber-500 transition-colors leading-relaxed"
            />
          </div>
        ) : (
          <div
            id="preview-step5"
            className="bg-slate-950/95 border border-slate-800 rounded-xl p-5 text-xs sm:text-sm text-emerald-300 font-mono leading-relaxed whitespace-pre-wrap selection:bg-emerald-500/30 selection:text-emerald-100 shadow-inner max-h-[600px] overflow-y-auto"
          >
            {formattedContent || (
              <div className="text-slate-500 italic py-8 text-center">
                Đang chờ tổng hợp cấu trúc JSON kịch bản tự động hóa từ hệ thống AI...
              </div>
            )}
          </div>
        )}
      </div>

      {/* Completion & Next Steps Box */}
      <div className="p-5 bg-gradient-to-r from-slate-900 to-slate-950 border border-emerald-500/30 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-100">
              Quy trình 5 Bước Kịch Bản 3D Health Đã Hoàn Thành!
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Bạn có thể sao chép hoặc tải file JSON kịch bản sạch về máy để nhập thẳng vào N8N / Make / CapCut.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            id="btn-download-json-final"
            onClick={handleDownloadJson}
            disabled={!content}
            className="flex items-center space-x-1.5 px-4 py-2 text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg shadow-md transition-all cursor-pointer disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5 text-slate-950" />
            <span>Tải JSON kịch bản</span>
          </button>

          <button
            id="btn-save-final"
            onClick={handleSaveToHistory}
            disabled={!content}
            className="flex items-center space-x-1.5 px-4 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg shadow-md transition-all cursor-pointer disabled:opacity-50"
          >
            <BookmarkPlus className="w-3.5 h-3.5 text-slate-950" />
            <span>Lưu vào lịch sử</span>
          </button>
        </div>
      </div>
    </div>
  );
};
