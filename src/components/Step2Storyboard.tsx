import React, { useState } from "react";
import { CheckCircle, Copy, Check, RefreshCw, ArrowRight, Grid3X3, Smartphone, ShieldCheck, FileEdit, Download } from "lucide-react";
import { cleanStep2StoryboardJson } from "../utils/jsonCleaner";

interface Step2StoryboardProps {
  content: string;
  isGenerating: boolean;
  onApproveAndNext: () => void;
  onRegenerate: () => void;
  onContentChange: (newContent: string) => void;
  mascotName: string;
}

export const Step2Storyboard: React.FC<Step2StoryboardProps> = ({
  content,
  isGenerating,
  onApproveAndNext,
  onRegenerate,
  onContentChange,
  mascotName,
}) => {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const handleCopy = () => {
    const jsonToCopy = cleanStep2StoryboardJson(content) || content;
    navigator.clipboard.writeText(jsonToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadJson = () => {
    const jsonStr = cleanStep2StoryboardJson(content) || content;
    const blob = new Blob([jsonStr], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `storyboard_prompt_${Date.now()}.json`;
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
              2
            </span>
            <h3 className="text-base font-bold text-slate-100">
              BƯỚC 2: PROMPT TẠO STORYBOARD (LƯỚI DỌC N+1 ẢNH: 5 THOẠI = 6 PANELS)
            </h3>
            <span className="px-2 py-0.5 text-[11px] font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30 rounded-full">
              Chờ duyệt
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Prompt tiếng Anh duy nhất • Lưới dọc 9:16 gồm N+1 panels ảnh (để nối cặp video 1→2, 2→3, ..., N→N+1) • Khóa nhân vật & Mascot 3D
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            id="btn-edit-step2"
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition-colors"
          >
            <FileEdit className="w-3.5 h-3.5 text-slate-400" />
            <span>{isEditing ? "Xem trước" : "Chỉnh sửa"}</span>
          </button>

          <button
            id="btn-copy-step2"
            onClick={handleCopy}
            disabled={!content}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition-colors disabled:opacity-40"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
            <span>{copied ? "Đã sao chép" : "Sao chép JSON"}</span>
          </button>

          <button
            id="btn-download-step2"
            onClick={handleDownloadJson}
            disabled={!content}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold bg-indigo-950/80 hover:bg-indigo-900/90 text-indigo-300 border border-indigo-500/40 rounded-lg transition-colors disabled:opacity-40"
            title="Tải về file Storyboard Prompt JSON"
          >
            <Download className="w-3.5 h-3.5 text-indigo-400" />
            <span>Tải JSON</span>
          </button>

          <button
            id="btn-regenerate-step2"
            onClick={onRegenerate}
            disabled={isGenerating}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-400 ${isGenerating ? "animate-spin" : ""}`} />
            <span>Tạo lại</span>
          </button>
        </div>
      </div>

      {/* Storyboard Grid Specs Notice */}
      <div className="p-4 bg-slate-950 rounded-xl border border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-semibold text-slate-200">Đặc tả Storyboard khung dọc 9:16 (Nguyên tắc N+1: N lời thoại = n ảnh + 1 ảnh chốt CTA)</h4>
            <p className="text-slate-400">
              Chia bố cục lưới dọc N+1 panels (ví dụ 5 cảnh thoại thì tạo đúng lưới 6 panels dọc), phong cách 3D Pixar, mascot "{mascotName}".
            </p>
          </div>
        </div>

        <span className="px-2.5 py-1 bg-slate-900 border border-slate-700 text-slate-300 font-mono text-[11px] rounded-lg">
          --ar 9:16 --v 6.1
        </span>
      </div>

      {/* Content View / Editor */}
      <div className="space-y-4">
        {isEditing ? (
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              Chỉnh sửa Prompt Storyboard:
            </label>
            <textarea
              id="textarea-step2-edit"
              rows={14}
              value={content}
              onChange={(e) => onContentChange(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-xs sm:text-sm text-slate-200 font-mono focus:outline-none focus:border-amber-500 transition-colors leading-relaxed"
            />
          </div>
        ) : (
          <div
            id="preview-step2"
            className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-5 text-xs sm:text-sm text-slate-200 font-mono leading-relaxed whitespace-pre-wrap selection:bg-amber-500/30 selection:text-amber-200 shadow-inner max-h-[500px] overflow-y-auto"
          >
            {content || (
              <div className="text-slate-500 italic py-8 text-center">
                Đang chờ tạo prompt Storyboard từ hệ thống AI...
              </div>
            )}
          </div>
        )}
      </div>

      {/* Rules Validation Highlights */}
      {content && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 flex items-center space-x-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-slate-300">Nhân vật đồng nhất 100% (tuổi, trang phục, tóc)</span>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 flex items-center space-x-2.5">
            <Grid3X3 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-slate-300">Bố cục lưới dọc rõ ràng, mạch lạc từng ô</span>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 flex items-center space-x-2.5">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-slate-300">Ánh sáng ấm áp chuẩn 3D Pixar Animation</span>
          </div>
        </div>
      )}

      {/* Approval Question & Next Step Action */}
      <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold text-amber-300">
            ❓ "Bạn có duyệt Prompt Storyboard này không để tôi xuất file JSON kịch bản tổng hợp (Bước 3)?"
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Nhấn Duyệt bên dưới để chuyển tiếp sang Bước 3: Tạo Prompt Video theo nguyên tắc N+1
          </p>
        </div>

        <button
          id="btn-approve-step2"
          onClick={onApproveAndNext}
          disabled={!content || isGenerating}
          className="flex items-center justify-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all shrink-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>Đồng ý / Duyệt & Đi tiếp Bước 3</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
