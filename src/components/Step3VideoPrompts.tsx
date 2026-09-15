import React, { useState, useMemo } from "react";
import {
  CheckCircle,
  Copy,
  Check,
  RefreshCw,
  ArrowRight,
  Video,
  FileText,
  Sparkles,
  FileEdit,
  ShieldCheck,
  Download,
  Layers,
  Code,
  Image as ImageIcon,
  MessageSquareOff,
} from "lucide-react";
import { cleanStep3VideoPromptsJson, sanitizeImagePrompt } from "../utils/jsonCleaner";

interface Step3VideoPromptsProps {
  content: string;
  isGenerating: boolean;
  onApproveAndNext: () => void;
  onRegenerate: () => void;
  onContentChange: (newContent: string) => void;
}

export const Step3VideoPrompts: React.FC<Step3VideoPromptsProps> = ({
  content,
  isGenerating,
  onApproveAndNext,
  onRegenerate,
  onContentChange,
}) => {
  const [copiedJson, setCopiedJson] = useState(false);
  const [copiedPromptsList, setCopiedPromptsList] = useState(false);
  const [copiedSingleIndex, setCopiedSingleIndex] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [viewMode, setViewMode] = useState<"cards" | "raw">("cards");

  // Parse JSON to display clean Image 1..N+1 cards
  const parsedImages = useMemo(() => {
    if (!content) return [];
    const cleaned = cleanStep3VideoPromptsJson(content);
    try {
      const arr = JSON.parse(cleaned);
      if (Array.isArray(arr) && arr.length > 0) {
        return arr.map((item: any, idx: number) => {
          const imgNum = item.image || item.scene || (idx + 1);
          const rawPrompt = item.prompt || "";
          const cleanPrompt = sanitizeImagePrompt(rawPrompt);
          const dialogue = item.dialogue || "";
          return {
            id: imgNum,
            title: `Image ${imgNum}`,
            prompt: cleanPrompt,
            dialogue: dialogue.trim(),
            rawPrompt,
          };
        });
      }
    } catch {
      // Fallback parse if JSON is not standard
    }
    return [];
  }, [content]);

  const handleCopyJson = () => {
    const jsonToCopy = cleanStep3VideoPromptsJson(content) || content;
    navigator.clipboard.writeText(jsonToCopy);
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const handleCopyAllCleanPrompts = () => {
    if (parsedImages.length > 0) {
      const text = parsedImages
        .map((img) => `${img.title}: ${img.prompt}`)
        .join("\n\n");
      navigator.clipboard.writeText(text);
    } else {
      const jsonToCopy = cleanStep3VideoPromptsJson(content) || content;
      navigator.clipboard.writeText(jsonToCopy);
    }
    setCopiedPromptsList(true);
    setTimeout(() => setCopiedPromptsList(false), 2000);
  };

  const handleCopySinglePrompt = (prompt: string, idx: number) => {
    navigator.clipboard.writeText(prompt);
    setCopiedSingleIndex(idx);
    setTimeout(() => setCopiedSingleIndex(null), 2000);
  };

  const handleDownloadJson = () => {
    const jsonStr = cleanStep3VideoPromptsJson(content) || content;
    const blob = new Blob([jsonStr], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `image_of_sences_prompts_${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center">
              3
            </span>
            <h3 className="text-base font-bold text-slate-100">
              BƯỚC 3: PROMPT BỘ ẢNH ĐƠN (IMAGE OF SENCES: N+1 ẢNH)
            </h3>
            <span className="px-2 py-0.5 text-[11px] font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30 rounded-full">
              Chờ duyệt
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Bộ prompt tạo đúng N+1 ảnh đơn lẻ 8K (<span className="text-amber-300 font-semibold">Image 1</span> đến <span className="text-amber-300 font-semibold">Image N+1</span>), tuyệt đối không dính lời thoại, làm ảnh mốc nối video Bước 5
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* View toggle */}
          {parsedImages.length > 0 && !isEditing && (
            <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-xs">
              <button
                onClick={() => setViewMode("cards")}
                className={`px-2.5 py-1 rounded-md transition-colors flex items-center space-x-1 ${
                  viewMode === "cards"
                    ? "bg-amber-500/20 text-amber-300 font-semibold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Layers className="w-3 h-3" />
                <span>Thẻ Ảnh ({parsedImages.length})</span>
              </button>
              <button
                onClick={() => setViewMode("raw")}
                className={`px-2.5 py-1 rounded-md transition-colors flex items-center space-x-1 ${
                  viewMode === "raw"
                    ? "bg-amber-500/20 text-amber-300 font-semibold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Code className="w-3 h-3" />
                <span>JSON / Raw</span>
              </button>
            </div>
          )}

          <button
            id="btn-edit-step3"
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition-colors"
          >
            <FileEdit className="w-3.5 h-3.5 text-slate-400" />
            <span>{isEditing ? "Xem trước" : "Chỉnh sửa"}</span>
          </button>

          <button
            id="btn-copy-clean-prompts-step3"
            onClick={handleCopyAllCleanPrompts}
            disabled={!content}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 rounded-lg transition-colors disabled:opacity-40"
            title="Sao chép toàn bộ danh sách prompt Image 1, Image 2... sạch sẽ (không chứa lời thoại)"
          >
            {copiedPromptsList ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <ImageIcon className="w-3.5 h-3.5 text-amber-400" />}
            <span>{copiedPromptsList ? "Đã chép Prompts!" : "Chép Prompt Image 1..N+1"}</span>
          </button>

          <button
            id="btn-copy-step3"
            onClick={handleCopyJson}
            disabled={!content}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition-colors disabled:opacity-40"
          >
            {copiedJson ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
            <span>{copiedJson ? "Đã sao chép" : "Sao chép JSON"}</span>
          </button>

          <button
            id="btn-download-step3"
            onClick={handleDownloadJson}
            disabled={!content}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold bg-indigo-950/80 hover:bg-indigo-900/90 text-indigo-300 border border-indigo-500/40 rounded-lg transition-colors disabled:opacity-40"
            title="Tải về file Image of Sences JSON (N+1 ảnh)"
          >
            <Download className="w-3.5 h-3.5 text-indigo-400" />
            <span>Tải JSON</span>
          </button>

          <button
            id="btn-regenerate-step3"
            onClick={onRegenerate}
            disabled={isGenerating}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-400 ${isGenerating ? "animate-spin" : ""}`} />
            <span>Tạo lại</span>
          </button>
        </div>
      </div>

      {/* Rules Standards Banner */}
      <div className="p-4 bg-slate-950 rounded-xl border border-slate-800/80 space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-amber-400 font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>3 Quy tắc Cốt lõi cho Bộ Ảnh Đơn (Image of Sences: N+1 Ảnh):</span>
          </div>
          <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 flex items-center space-x-1">
            <MessageSquareOff className="w-3 h-3" />
            <span>Zero Dialogue Enforced</span>
          </span>
        </div>
        <div className="text-slate-300 leading-relaxed grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
          <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
            <p className="text-amber-300 font-semibold mb-0.5">1. Định danh "Image 1, Image 2..."</p>
            <p className="text-[11px] text-slate-400">
              Đúng N+1 ảnh mốc (Image 1 → N+1) để tránh nhầm với Phân cảnh Video (Video Scenes ở Bước 5).
            </p>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
            <p className="text-emerald-300 font-semibold mb-0.5">2. Tuyệt đối cấm Lời thoại</p>
            <p className="text-[11px] text-slate-400">
              Không chèn lời thoại, phụ đề hay bong bóng thoại vào chuỗi prompt ảnh. Lời thoại được tách riêng!
            </p>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
            <p className="text-cyan-300 font-semibold mb-0.5">3. Đồng nhất Storyboard & Bối cảnh</p>
            <p className="text-[11px] text-slate-400">
              Duy trì 100% diện mạo nhân vật, trang phục, bối cảnh phòng ngủ/bàn làm việc và Mascot trên khiên vàng.
            </p>
          </div>
        </div>
      </div>

      {/* Content View / Cards */}
      <div className="space-y-4">
        {isEditing ? (
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              Chỉnh sửa Prompt Video N+1 (JSON hoặc Markdown):
            </label>
            <textarea
              id="textarea-step3-edit"
              rows={16}
              value={content}
              onChange={(e) => onContentChange(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-xs sm:text-sm text-slate-200 font-mono focus:outline-none focus:border-amber-500 transition-colors leading-relaxed"
            />
          </div>
        ) : viewMode === "cards" && parsedImages.length > 0 ? (
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
            {parsedImages.map((img, idx) => (
              <div
                key={idx}
                className="bg-slate-950/90 border border-slate-800 rounded-xl p-4 transition-all hover:border-amber-500/40 space-y-2.5"
              >
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-bold text-xs border border-amber-500/30">
                      {img.title}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {idx === 0
                        ? "Hook / Mở đầu"
                        : idx === parsedImages.length - 1
                        ? "Ảnh chốt kết CTA / Thương hiệu"
                        : `Cảnh giải pháp ${idx}`}
                    </span>
                  </div>
                  <button
                    onClick={() => handleCopySinglePrompt(img.prompt, idx)}
                    className="flex items-center space-x-1 px-2.5 py-1 text-[11px] font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-md transition-colors"
                  >
                    {copiedSingleIndex === idx ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Đã chép!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-slate-400" />
                        <span>Sao chép Prompt</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Clean Prompt text */}
                <div className="bg-slate-900/90 rounded-lg p-3 border border-slate-800/60">
                  <div className="text-[11px] font-semibold text-slate-400 mb-1 flex items-center justify-between">
                    <span className="text-amber-400">📸 Prompt Midjourney / Flux (Thuần thị giác):</span>
                    <span className="text-[10px] text-slate-500">8K • Pixar Style • Clean</span>
                  </div>
                  <p className="text-xs text-slate-200 font-mono leading-relaxed select-all">
                    {img.prompt}
                  </p>
                </div>

                {/* Dialogue reference */}
                {img.dialogue && (
                  <div className="flex items-start space-x-2 text-[11px] text-slate-400 bg-slate-900/40 px-3 py-1.5 rounded-md border border-slate-800/40">
                    <span className="font-semibold text-slate-400 shrink-0">🎙️ Lời thoại khớp cảnh:</span>
                    <span className="text-slate-300 italic">{img.dialogue}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div
            id="preview-step3"
            className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-5 text-xs sm:text-sm text-slate-200 font-mono leading-relaxed whitespace-pre-wrap selection:bg-amber-500/30 selection:text-amber-200 shadow-inner max-h-[550px] overflow-y-auto"
          >
            {content || (
              <div className="text-slate-500 italic py-8 text-center">
                Đang chờ tạo dữ liệu Prompts Video N+1 từ hệ thống AI...
              </div>
            )}
          </div>
        )}
      </div>

      {/* Approval Question & Next Step Action */}
      <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold text-amber-300">
            ❓ "Bạn có duyệt Bộ Prompts Ảnh Đơn (Image 1..N+1) này không để tôi qua Bước 4 làm Thumbnail?"
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Nhấn Duyệt bên dưới để chuyển tiếp sang Bước 4: Thiết kế Thumbnail "Stop The Scroll" 9:16
          </p>
        </div>

        <button
          id="btn-approve-step3"
          onClick={onApproveAndNext}
          disabled={!content || isGenerating}
          className="flex items-center justify-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all shrink-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>Đồng ý / Duyệt & Đi tiếp Bước 4</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
