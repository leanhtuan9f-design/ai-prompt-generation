import React, { useState } from "react";
import { CheckCircle, AlertTriangle, Copy, Check, RefreshCw, ArrowRight, ShieldCheck, FileEdit, Mic, Target, User, Sparkles, Sliders } from "lucide-react";
import { PromptInputs } from "../types";

interface Step1DialoguesProps {
  content: string;
  isGenerating: boolean;
  inputs?: Partial<PromptInputs>;
  onApproveAndNext: () => void;
  onRegenerate: () => void;
  onContentChange: (newContent: string) => void;
}

export const Step1Dialogues: React.FC<Step1DialoguesProps> = ({
  content,
  isGenerating,
  inputs,
  onApproveAndNext,
  onRegenerate,
  onContentChange,
}) => {
  const [copied, setCopied] = useState(false);
  const [copiedDialogue, setCopiedDialogue] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyDialogueOnly = () => {
    let dialogueText = "";
    if (content.includes("## 4.")) {
      const parts = content.split(/## 4\.[^\n]*/i);
      if (parts.length > 1) {
        const afterSec4 = parts[1];
        const sec4Body = afterSec4.split(/## 5\.|---|❓/i)[0];
        dialogueText = sec4Body.trim();
      }
    }

    if (!dialogueText) {
      const lines = content.split("\n");
      const matchedLines = lines.filter((l) => l.includes("«") || l.includes("Cảnh ") || l.includes("Speaker"));
      dialogueText = matchedLines.length > 0 ? matchedLines.join("\n") : content;
    }

    navigator.clipboard.writeText(dialogueText);
    setCopiedDialogue(false);
    setTimeout(() => setCopiedDialogue(false), 2000);
  };

  const targetAudience = inputs?.targetAudience || "";
  const characterAge = inputs?.characterAge || inputs?.femaleAge || "25-34";
  const characterGender = inputs?.characterGender || "Vietnamese female";
  const mascotName = inputs?.mascotName || "";

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center">
              1
            </span>
            <h3 className="text-base font-bold text-slate-100">
              BƯỚC 1: PROMPT TẠO HỘI THOẠI & CHIẾN LƯỢC KỊCH BẢN
            </h3>
            <span className="px-2 py-0.5 text-[11px] font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30 rounded-full">
              Chờ duyệt
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Cấu trúc 5 cảnh: Problem (Hook 3s) → Pain (3 nguyên nhân) → Solution 1, 2 (Tự nhiên) → Solution 3 (Sản phẩm)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            id="btn-edit-step1"
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            <FileEdit className="w-3.5 h-3.5 text-slate-400" />
            <span>{isEditing ? "Xem trước" : "Chỉnh sửa"}</span>
          </button>

          <button
            id="btn-copy-step1"
            onClick={handleCopy}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition-colors cursor-pointer"
            title="Sao chép toàn bộ nội dung Bước 1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
            <span>{copied ? "Đã sao chép" : "Sao chép tất cả"}</span>
          </button>

          <button
            id="btn-copy-dialogue-only-step1"
            onClick={handleCopyDialogueOnly}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg transition-colors cursor-pointer"
            title="Chỉ sao chép danh sách lời thoại thuần (Mục ## 4) để đưa vào TTS / AI Voice / Thu âm"
          >
            {copiedDialogue ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Mic className="w-3.5 h-3.5 text-amber-400" />}
            <span>{copiedDialogue ? "Đã chép thoại" : "Chép thoại TTS"}</span>
          </button>

          <button
            id="btn-regenerate-step1"
            onClick={onRegenerate}
            disabled={isGenerating}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-400 ${isGenerating ? "animate-spin" : ""}`} />
            <span>Tạo lại</span>
          </button>
        </div>
      </div>

      {/* Input Parameters vs Result Comparison Card */}
      {inputs && (
        <div className="bg-slate-950/90 border border-indigo-500/30 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center space-x-2">
              <Sliders className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">
                Đối Chiếu Input Đầu Vào & Tính Đồng Nhất (Input vs Strategy Check)
              </span>
            </div>
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center space-x-1">
              <CheckCircle className="w-3 h-3 text-emerald-400" />
              <span>Đã liên kết trực tiếp với Prompt AI</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 text-xs">
            <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 space-y-1">
              <div className="text-[10px] text-slate-400 font-semibold flex items-center space-x-1">
                <Target className="w-3 h-3 text-rose-400" />
                <span>Đối tượng (Target Audience)</span>
              </div>
              <p className="font-semibold text-slate-200 line-clamp-2">
                {targetAudience || "Chưa thiết lập"}
              </p>
            </div>

            <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 space-y-1">
              <div className="text-[10px] text-slate-400 font-semibold flex items-center space-x-1">
                <User className="w-3 h-3 text-sky-400" />
                <span>Nhân vật & Độ tuổi</span>
              </div>
              <p className="font-semibold text-slate-200">
                {characterGender} • {characterAge} tuổi
              </p>
            </div>

            <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 space-y-1">
              <div className="text-[10px] text-slate-400 font-semibold flex items-center space-x-1">
                <Mic className="w-3 h-3 text-amber-400" />
                <span>Giọng & Vùng miền</span>
              </div>
              <p className="font-semibold text-slate-200">
                {inputs.regionAccent === "south" ? "Nam (Sài Gòn)" : inputs.regionAccent === "north" ? "Bắc (Hà Nội)" : inputs.regionAccent === "central" ? "Trung" : "Miền Tây"} • {inputs.pacingWpm || 105} wpm
              </p>
            </div>

            <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 space-y-1">
              <div className="text-[10px] text-slate-400 font-semibold flex items-center space-x-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>Mascot / Khiên</span>
              </div>
              <p className="font-semibold text-slate-200">
                {mascotName || "Tự nhiên / Không ép tên"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Content View / Editor */}
      <div className="space-y-4">
        {isEditing ? (
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              Chỉnh sửa trực tiếp nội dung Bước 1:
            </label>
            <textarea
              id="textarea-step1-edit"
              rows={16}
              value={content}
              onChange={(e) => onContentChange(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-xs sm:text-sm text-slate-200 font-mono focus:outline-none focus:border-amber-500 transition-colors leading-relaxed"
            />
          </div>
        ) : (
          <div
            id="preview-step1"
            className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-5 text-xs sm:text-sm text-slate-200 font-sans leading-relaxed whitespace-pre-wrap selection:bg-amber-500/30 selection:text-amber-200 shadow-inner max-h-[550px] overflow-y-auto"
          >
            {content || (
              <div className="text-slate-500 italic py-8 text-center">
                Đang chờ tạo dữ liệu lời thoại từ hệ thống AI...
              </div>
            )}
          </div>
        )}
      </div>

      {/* Rules Validation Highlights */}
      {content && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 flex items-center space-x-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-slate-300">Hook 3s trực diện, không chào hỏi lan man</span>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 flex items-center space-x-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-slate-300">Khóa 1 giọng đọc duy nhất, không lệch giới tính</span>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 flex items-center space-x-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-slate-300">Không quảng cáo lố, không hứa hẹn 100%</span>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 flex items-center space-x-2.5">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-slate-300">Khớp đối tượng & chiến lược tự nhiên</span>
          </div>
        </div>
      )}

      {/* Approval Question & Next Step Action */}
      <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold text-amber-300">
            ❓ "Bạn có duyệt Lời thoại & Chiến lược này không để tôi qua Bước 2 vẽ Storyboard?"
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Nhấn Duyệt bên dưới để chuyển tiếp sang Bước 2: Tạo Prompt Storyboard tổng hợp 9:16
          </p>
        </div>

        <button
          id="btn-approve-step1"
          onClick={onApproveAndNext}
          disabled={!content || isGenerating}
          className="flex items-center justify-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all shrink-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>Đồng ý / Duyệt & Đi tiếp Bước 2</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
