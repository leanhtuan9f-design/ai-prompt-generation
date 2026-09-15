import React from "react";
import { Film, Layers, History, Settings } from "lucide-react";

interface HeaderProps {
  currentMode: "single" | "batch";
  onToggleMode: (mode: "single" | "batch") => void;
  onOpenHistoryModal: () => void;
  onOpenSettingsModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentMode,
  onToggleMode,
  onOpenHistoryModal,
  onOpenSettingsModal,
}) => {
  const hasKey = typeof window !== "undefined" && !!localStorage.getItem("custom_openrouter_api_key");
  const concurrency = typeof window !== "undefined" ? localStorage.getItem("batch_concurrency") || "3" : "3";

  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40 px-4 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Logo & Brand */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-amber-500/20 text-slate-950 font-black">
            <Film className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-bold text-slate-100 tracking-tight">
                3D AI Health Video Prompt Studio
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full">
                Pixar & VEO3
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Quy trình 5 bước chuẩn hóa • Tạo kịch bản hàng loạt tự động đa luồng
            </p>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Settings & Multi-threading Modal Button */}
          <button
            id="btn-open-settings"
            onClick={onOpenSettingsModal}
            className={`flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all border shadow-sm cursor-pointer ${
              hasKey
                ? "bg-gradient-to-r from-amber-500/10 to-indigo-500/10 hover:from-amber-500/20 hover:to-indigo-500/20 text-amber-300 border-amber-500/40"
                : "bg-slate-800 hover:bg-slate-750 text-slate-200 border-slate-700"
            }`}
            title="Cài đặt Templates, OpenRouter & Số luồng xử lý"
          >
            <Settings className="w-3.5 h-3.5 text-amber-400" />
            <span>Cài đặt & Template</span>
            <span className="px-1.5 py-0.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded text-[10px] font-mono">
              {concurrency} Luồng
            </span>
            {hasKey && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 ml-0.5"></span>
            )}
          </button>

          <button
            id="btn-open-history"
            onClick={onOpenHistoryModal}
            className="flex items-center space-x-1.5 px-3 py-2 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            <History className="w-3.5 h-3.5 text-slate-400" />
            <span>Lịch sử ({typeof window !== "undefined" ? JSON.parse(localStorage.getItem("prompt_studio_saved_scripts") || "[]").length : 0})</span>
          </button>
        </div>
      </div>
    </header>
  );
};


