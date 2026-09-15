import React, { useState, useMemo } from "react";
import {
  X,
  Table,
  Check,
  Copy,
  Download,
  CheckSquare,
  Square,
  Search,
  FileSpreadsheet,
  Layers,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Info,
} from "lucide-react";
import { BatchItem } from "../types/batch";
import { StepsContent, PromptInputs } from "../types";
import {
  Sheets5ColumnsRow,
  buildSheets5ColumnsRow,
  rowToTsvString,
  rowsToTsvTable,
  rowsToSingleColumnTsv,
  downloadSheetsCsv,
  SHEETS_COLUMN_NAMES,
} from "../utils/sheetsFormatter";

interface BatchSheetsExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: BatchItem[];
}

export const BatchSheetsExportModal: React.FC<BatchSheetsExportModalProps> = ({
  isOpen,
  onClose,
  items,
}) => {
  const completedItems = useMemo(
    () => items.filter((i) => i.status === "completed" && i.result),
    [items]
  );

  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => {
    return new Set(completedItems.map((i) => i.id));
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [includeHeader, setIncludeHeader] = useState(false);
  const [copiedStatus, setCopiedStatus] = useState<string | null>(null);
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "single_column">("all");

  // Keep selection synced when completedItems change
  React.useEffect(() => {
    if (isOpen) {
      setSelectedIds(new Set(completedItems.map((i) => i.id)));
    }
  }, [isOpen, completedItems.length]);

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return completedItems;
    const q = searchQuery.toLowerCase();
    return completedItems.filter((i) => i.topic.toLowerCase().includes(q));
  }, [completedItems, searchQuery]);

  const selectedCompletedItems = useMemo(() => {
    return completedItems.filter((i) => selectedIds.has(i.id));
  }, [completedItems, selectedIds]);

  const selectedRows: Sheets5ColumnsRow[] = useMemo(() => {
    return selectedCompletedItems.map((i) =>
      buildSheets5ColumnsRow(i.result!.stepsContent)
    );
  }, [selectedCompletedItems]);

  if (!isOpen) return null;

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    setSelectedIds(new Set(completedItems.map((i) => i.id)));
  };

  const handleDeselectAll = () => {
    setSelectedIds(new Set());
  };

  const flashToast = (msg: string) => {
    setCopiedStatus(msg);
    setTimeout(() => setCopiedStatus(null), 3000);
  };

  const handleCopyAllSelected = () => {
    if (selectedRows.length === 0) return;
    const tsv = rowsToTsvTable(selectedRows, includeHeader);
    navigator.clipboard.writeText(tsv);
    flashToast(`Đã sao chép ${selectedRows.length} kịch bản (5 cột)! Dán ngay vào Google Sheet bằng Ctrl+V.`);
  };

  const handleCopySingleColumn = (columnKey: keyof Sheets5ColumnsRow) => {
    if (selectedRows.length === 0) return;
    const colName = SHEETS_COLUMN_NAMES[columnKey];
    const tsv = rowsToSingleColumnTsv(selectedRows, columnKey, includeHeader);
    navigator.clipboard.writeText(tsv);
    flashToast(`Đã sao chép cột "${colName}" của ${selectedRows.length} kịch bản!`);
  };

  const handleCopySingleItem = (item: BatchItem) => {
    if (!item.result) return;
    const row = buildSheets5ColumnsRow(item.result.stepsContent);
    const tsv = rowToTsvString(row);
    navigator.clipboard.writeText(tsv);
    flashToast(`Đã chép 1 dòng 5 cột cho kịch bản "${item.topic.slice(0, 25)}..."!`);
  };

  const handleDownloadCsv = () => {
    if (selectedRows.length === 0) return;
    const filename = `kich_ban_batch_${selectedRows.length}_items_${Date.now()}.csv`;
    downloadSheetsCsv(selectedRows, filename);
    flashToast(`Đã tải xuống file CSV chứa ${selectedRows.length} kịch bản!`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-md">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-slate-100">
                  Trung Tâm Sao Chép Google Sheets Hàng Loạt
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/40">
                  {completedItems.length} Kịch Bản Sẵn Sàng
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Sao chép trực tiếp 5 cột chuẩn để dán hàng loạt vào Google Sheets & Excel mà không bị lệch cột
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action Bar & Quick Options */}
        <div className="p-4 bg-slate-900/90 border-b border-slate-800 space-y-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 flex-wrap">
            {/* Tabs: Copy 5 Columns vs Single Column */}
            <div className="flex items-center space-x-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setActiveTab("all")}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center space-x-1.5 cursor-pointer ${
                  activeTab === "all"
                    ? "bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Table className="w-3.5 h-3.5" />
                <span>Sao Chép Trọn Bảng (5 Cột)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("single_column")}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center space-x-1.5 cursor-pointer ${
                  activeTab === "single_column"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Sao Chép Từng Cột Dọc</span>
              </button>
            </div>

            {/* Header Toggle & Main Copy Button */}
            <div className="flex items-center space-x-3 flex-wrap">
              <label className="flex items-center space-x-1.5 text-xs text-slate-300 select-none cursor-pointer bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-800 hover:border-slate-700">
                <input
                  type="checkbox"
                  checked={includeHeader}
                  onChange={(e) => setIncludeHeader(e.target.checked)}
                  className="rounded border-slate-700 text-amber-500 focus:ring-amber-400/30 bg-slate-800"
                />
                <span>Kèm dòng Tiêu đề (Headers)</span>
              </label>

              {activeTab === "all" && (
                <>
                  <button
                    type="button"
                    onClick={handleCopyAllSelected}
                    disabled={selectedRows.length === 0}
                    className="flex items-center space-x-2 px-4 py-2 text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl transition-all shadow-lg shadow-amber-400/25 disabled:opacity-40 cursor-pointer"
                  >
                    <Copy className="w-4 h-4 text-slate-950" />
                    <span>
                      📋 COPY {selectedRows.length} KỊCH BẢN (5 CỘT)
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadCsv}
                    disabled={selectedRows.length === 0}
                    className="flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 rounded-xl transition-colors disabled:opacity-40 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Tải CSV</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* If Single Column Tab: Render 5 Quick Buttons for each column */}
          {activeTab === "single_column" && (
            <div className="p-3 bg-slate-950 rounded-xl border border-indigo-500/30 space-y-2">
              <div className="flex items-center space-x-2 text-xs text-indigo-300 font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>Chọn cột bạn muốn sao chép toàn bộ {selectedRows.length} kịch bản theo chiều dọc:</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                <button
                  type="button"
                  onClick={() => handleCopySingleColumn("dialogues")}
                  disabled={selectedRows.length === 0}
                  className="p-2 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-bold flex flex-col items-start transition-all cursor-pointer disabled:opacity-40"
                >
                  <span className="text-[10px] text-emerald-400/80">Cột 1 (R)</span>
                  <span className="truncate w-full font-bold">📋 Lời Thoại</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleCopySingleColumn("storyboard")}
                  disabled={selectedRows.length === 0}
                  className="p-2 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-bold flex flex-col items-start transition-all cursor-pointer disabled:opacity-40"
                >
                  <span className="text-[10px] text-amber-400/80">Cột 2 (S)</span>
                  <span className="truncate w-full font-bold">📋 Storyboard JSON</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleCopySingleColumn("scenes")}
                  disabled={selectedRows.length === 0}
                  className="p-2 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 rounded-lg text-xs font-bold flex flex-col items-start transition-all cursor-pointer disabled:opacity-40"
                >
                  <span className="text-[10px] text-indigo-400/80">Cột 3 (T)</span>
                  <span className="truncate w-full font-bold">📋 Image of Sences (N+1)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleCopySingleColumn("thumbnail")}
                  disabled={selectedRows.length === 0}
                  className="p-2 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-bold flex flex-col items-start transition-all cursor-pointer disabled:opacity-40"
                >
                  <span className="text-[10px] text-amber-400/80">Cột 4 (U)</span>
                  <span className="truncate w-full font-bold">📋 Thumbnail JSON</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleCopySingleColumn("videoScripts")}
                  disabled={selectedRows.length === 0}
                  className="p-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 rounded-lg text-xs font-bold flex flex-col items-start transition-all cursor-pointer disabled:opacity-40"
                >
                  <span className="text-[10px] text-cyan-400/80">Cột 5 (V)</span>
                  <span className="truncate w-full font-bold">📋 Video Scripts</span>
                </button>
              </div>
            </div>
          )}

          {/* Selection controls & Filter */}
          <div className="flex items-center justify-between gap-3 text-xs flex-wrap">
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handleSelectAll}
                className="flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              >
                <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
                <span>Chọn tất cả ({completedItems.length})</span>
              </button>

              <button
                type="button"
                onClick={handleDeselectAll}
                className="flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 transition-colors"
              >
                <Square className="w-3.5 h-3.5" />
                <span>Bỏ chọn</span>
              </button>

              <span className="text-slate-400 ml-2">
                Đang chọn: <strong className="text-amber-400">{selectedRows.length}</strong> / {completedItems.length}
              </span>
            </div>

            {/* Search Box */}
            <div className="relative min-w-[220px]">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm kịch bản..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Toast alert banner if copied */}
        {copiedStatus && (
          <div className="bg-emerald-600 text-white px-4 py-2 text-xs font-bold flex items-center justify-between shadow-inner animate-in slide-in-from-top-1">
            <div className="flex items-center space-x-2">
              <Check className="w-4 h-4" />
              <span>{copiedStatus}</span>
            </div>
            <span className="text-[11px] font-mono bg-emerald-700 px-2 py-0.5 rounded">Ctrl + V để dán</span>
          </div>
        )}

        {/* Items Table List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-slate-500 space-y-2">
              <Table className="w-10 h-10 mx-auto opacity-30" />
              <p className="text-xs">
                {completedItems.length === 0
                  ? "Chưa có kịch bản nào hoàn thành để xuất dữ liệu."
                  : "Không tìm thấy kịch bản khớp với từ khóa tìm kiếm."}
              </p>
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const isChecked = selectedIds.has(item.id);
              const isExpanded = expandedRowId === item.id;
              const rowData = item.result ? buildSheets5ColumnsRow(item.result.stepsContent) : null;

              return (
                <div
                  key={item.id}
                  className={`rounded-xl border transition-all ${
                    isChecked
                      ? "bg-slate-950/80 border-slate-700 shadow-sm"
                      : "bg-slate-950/40 border-slate-800/80 opacity-60"
                  }`}
                >
                  {/* Row Header */}
                  <div className="p-3 flex items-center justify-between gap-3">
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleSelect(item.id)}
                        className="rounded border-slate-700 text-amber-500 focus:ring-amber-400/30 bg-slate-800 w-4 h-4 cursor-pointer"
                      />

                      <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>

                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-bold text-slate-200 truncate" title={item.topic}>
                          {item.topic}
                        </h4>
                        <div className="flex items-center space-x-2 text-[10px] text-slate-400 mt-0.5">
                          <span className="text-emerald-400 font-medium">✓ Hoàn tất 5 bước</span>
                          <span>•</span>
                          <span>{rowData?.scenes || "Đầy đủ cảnh"}</span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Row Actions */}
                    <div className="flex items-center space-x-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleCopySingleItem(item)}
                        className="flex items-center space-x-1 px-2.5 py-1 text-xs font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg transition-colors cursor-pointer"
                        title="Sao chép 1 dòng này (5 cột) để dán vào Google Sheet"
                      >
                        <Copy className="w-3 h-3 text-amber-400" />
                        <span>Chép dòng này</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setExpandedRowId(isExpanded ? null : item.id)}
                        className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                        title={isExpanded ? "Thu gọn chi tiết" : "Xem chi tiết 5 cột"}
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded 5-Columns Preview */}
                  {isExpanded && rowData && (
                    <div className="p-3 border-t border-slate-800 bg-slate-900/90 rounded-b-xl space-y-2 animate-in fade-in">
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-2 text-[11px]">
                        {/* Col 1: Lời thoại */}
                        <div className="bg-slate-950 p-2.5 rounded-lg border border-emerald-500/30 space-y-1">
                          <div className="font-bold text-emerald-300 text-[10px] flex items-center justify-between">
                            <span>1. Lời thoại</span>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(rowData.dialogues);
                                flashToast("Đã chép Lời thoại của dòng này!");
                              }}
                              className="text-slate-400 hover:text-emerald-300 cursor-pointer"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                          <p className="text-slate-300 text-[10px] line-clamp-3">
                            {rowData.dialogues}
                          </p>
                        </div>

                        {/* Col 2: Storyboard */}
                        <div className="bg-slate-950 p-2.5 rounded-lg border border-amber-500/30 space-y-1">
                          <div className="font-bold text-amber-300 text-[10px] flex items-center justify-between">
                            <span>2. Copy Storyboard</span>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(rowData.storyboard);
                                flashToast("Đã chép Storyboard của dòng này!");
                              }}
                              className="text-slate-400 hover:text-amber-300 cursor-pointer"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                          <p className="text-slate-400 font-mono text-[10px] line-clamp-3">
                            {rowData.storyboard}
                          </p>
                        </div>

                        {/* Col 3: Sences */}
                        <div className="bg-slate-950 p-2.5 rounded-lg border border-indigo-500/30 space-y-1">
                          <div className="font-bold text-indigo-300 text-[10px] flex items-center justify-between">
                            <span>3. Sences (N+1)</span>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(rowData.scenes);
                                flashToast("Đã chép Sences của dòng này!");
                              }}
                              className="text-slate-400 hover:text-indigo-300 cursor-pointer"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                          <p className="text-slate-400 font-mono text-[10px] line-clamp-3">
                            {rowData.scenes}
                          </p>
                        </div>

                        {/* Col 4: Thumbnail */}
                        <div className="bg-slate-950 p-2.5 rounded-lg border border-amber-500/30 space-y-1">
                          <div className="font-bold text-amber-300 text-[10px] flex items-center justify-between">
                            <span>4. Thumbnail</span>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(rowData.thumbnail);
                                flashToast("Đã chép Thumbnail của dòng này!");
                              }}
                              className="text-slate-400 hover:text-amber-300 cursor-pointer"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                          <p className="text-slate-400 font-mono text-[10px] line-clamp-3">
                            {rowData.thumbnail}
                          </p>
                        </div>

                        {/* Col 5: Video Scripts */}
                        <div className="bg-slate-950 p-2.5 rounded-lg border border-cyan-500/40 space-y-1">
                          <div className="font-bold text-cyan-300 text-[10px] flex items-center justify-between">
                            <span>5. Video Scripts</span>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(rowData.videoScripts);
                                flashToast("Đã chép Video Scripts của dòng này!");
                              }}
                              className="text-slate-400 hover:text-cyan-300 cursor-pointer"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                          <p className="text-slate-400 font-mono text-[10px] line-clamp-3">
                            {rowData.videoScripts}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer info guide */}
        <div className="p-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 flex-wrap gap-2">
          <div className="flex items-center space-x-2">
            <Info className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Mẹo dán Google Sheet:</strong> Bấm nút màu vàng <strong className="text-amber-400">COPY KỊCH BẢN</strong>, sau đó mở Google Sheet chọn ô bắt đầu và ấn <kbd className="bg-slate-800 px-1.5 py-0.5 rounded text-slate-200 font-mono">Ctrl+V</kbd>.
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
