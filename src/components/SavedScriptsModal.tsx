import React, { useState } from "react";
import {
  X,
  History,
  Trash2,
  Download,
  Play,
  Calendar,
  Package,
  Table,
  Check,
  Copy,
  FileSpreadsheet,
} from "lucide-react";
import { SavedScript } from "../types";
import { buildUnifiedScriptJsonPackage } from "../utils/jsonCleaner";
import {
  buildSheets5ColumnsRow,
  rowToTsvString,
  rowsToTsvTable,
  downloadSheetsCsv,
} from "../utils/sheetsFormatter";

interface SavedScriptsModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedScripts: SavedScript[];
  onLoadScript: (script: SavedScript) => void;
  onDeleteScript: (id: string) => void;
}

export const SavedScriptsModal: React.FC<SavedScriptsModalProps> = ({
  isOpen,
  onClose,
  savedScripts,
  onLoadScript,
  onDeleteScript,
}) => {
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedRowId, setCopiedRowId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDownloadMasterJson = (script: SavedScript) => {
    const jsonStr = buildUnifiedScriptJsonPackage(script.inputs, script.stepsContent);
    const filename = `${(script.inputs.title || "script").slice(0, 30).replace(/[^a-zA-Z0-9]/g, "_")}_master_package.json`;
    const blob = new Blob([jsonStr], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopyAllToSheets = () => {
    if (savedScripts.length === 0) return;
    const rows = savedScripts.map((s) => buildSheets5ColumnsRow(s.stepsContent));
    const tsv = rowsToTsvTable(rows, true);
    navigator.clipboard.writeText(tsv);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2500);
  };

  const handleCopySingleRowSheets = (script: SavedScript) => {
    const row = buildSheets5ColumnsRow(script.stepsContent);
    const tsv = rowToTsvString(row);
    navigator.clipboard.writeText(tsv);
    setCopiedRowId(script.id);
    setTimeout(() => setCopiedRowId(null), 2000);
  };

  const handleDownloadAllCsv = () => {
    if (savedScripts.length === 0) return;
    const rows = savedScripts.map((s) => buildSheets5ColumnsRow(s.stepsContent));
    downloadSheetsCsv(rows, `thu_vien_kich_ban_5_cot_${Date.now()}.csv`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50 flex-wrap gap-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">
                Thư Viện Kịch Bản Đã Lưu ({savedScripts.length})
              </h3>
              <p className="text-[11px] text-slate-400">
                Xem lại, nạp lại hoặc sao chép 5 cột vào Google Sheet
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {savedScripts.length > 0 && (
              <>
                <button
                  type="button"
                  onClick={handleCopyAllToSheets}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition-all shadow-sm cursor-pointer"
                  title="Sao chép toàn bộ kịch bản đã lưu (5 cột) để dán vào Google Sheet"
                >
                  {copiedAll ? <Check className="w-3.5 h-3.5" /> : <Table className="w-3.5 h-3.5" />}
                  <span>{copiedAll ? "Đã chép toàn bộ!" : "📋 Copy Bảng Sheet (5 Cột)"}</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadAllCsv}
                  className="flex items-center space-x-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs rounded-lg transition-colors cursor-pointer"
                  title="Tải CSV 5 cột"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                  <span>CSV</span>
                </button>
              </>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="p-4 overflow-y-auto space-y-2.5 flex-1">
          {savedScripts.length === 0 ? (
            <div className="py-12 text-center text-slate-500 space-y-2">
              <History className="w-8 h-8 mx-auto opacity-40" />
              <p className="text-xs">Chưa có kịch bản nào được lưu trong phiên làm việc này.</p>
            </div>
          ) : (
            savedScripts.map((script) => (
              <div
                key={script.id}
                className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl hover:border-slate-700 transition-colors flex items-center justify-between gap-3 flex-wrap"
              >
                <div className="space-y-1 flex-1 min-w-[200px]">
                  <h4 className="text-xs font-bold text-slate-100 truncate">
                    {script.inputs.title || "Kịch bản chưa đặt tên"}
                  </h4>
                  <div className="flex items-center space-x-3 text-[11px] text-slate-400">
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      <span>{new Date(script.createdAt).toLocaleString("vi-VN")}</span>
                    </span>
                    <span className="text-amber-400 font-medium">
                      [{script.inputs.mascotName || "Trà Dây Bstar"}]
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleCopySingleRowSheets(script)}
                    className="flex items-center space-x-1 px-2.5 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold text-xs rounded-lg transition-colors cursor-pointer"
                    title="Sao chép 1 dòng (5 cột chuẩn) kịch bản này vào Google Sheet"
                  >
                    {copiedRowId === script.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Table className="w-3.5 h-3.5 text-amber-400" />
                    )}
                    <span>{copiedRowId === script.id ? "Đã chép" : "Sheet (5 Cột)"}</span>
                  </button>

                  <button
                    onClick={() => handleDownloadMasterJson(script)}
                    className="flex items-center space-x-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium text-xs rounded-lg transition-colors cursor-pointer"
                    title="Tải trọn gói JSON gồm Storyboard, Video N+1, Thumbnail và Cảnh Automation"
                  >
                    <Download className="w-3.5 h-3.5 text-indigo-400" />
                    <span>JSON</span>
                  </button>

                  <button
                    onClick={() => {
                      onLoadScript(script);
                      onClose();
                    }}
                    className="flex items-center space-x-1 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition-colors cursor-pointer"
                  >
                    <Play className="w-3 h-3" />
                    <span>Nạp kịch bản</span>
                  </button>

                  <button
                    onClick={() => onDeleteScript(script.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                    title="Xóa"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
