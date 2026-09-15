import React, { useState } from "react";
import { Copy, Check, Download, Table, Sparkles, HelpCircle } from "lucide-react";
import {
  Sheets5ColumnsRow,
  buildSheets5ColumnsRow,
  rowToTsvString,
  rowsToTsvTable,
  downloadSheetsCsv,
} from "../utils/sheetsFormatter";
import { StepsContent, PromptInputs } from "../types";

interface SheetsTableViewerProps {
  stepsContent: StepsContent;
  inputs?: PromptInputs;
  title?: string;
  showCardWrapper?: boolean;
}

export const SheetsTableViewer: React.FC<SheetsTableViewerProps> = ({
  stepsContent,
  inputs,
  title,
  showCardWrapper = true,
}) => {
  const [copiedRow, setCopiedRow] = useState(false);
  const [copiedWithHeader, setCopiedWithHeader] = useState(false);
  const [copiedCell, setCopiedCell] = useState<string | null>(null);

  const rowData: Sheets5ColumnsRow = buildSheets5ColumnsRow(stepsContent);

  const handleCopyOneRow = () => {
    const tsv = rowToTsvString(rowData);
    navigator.clipboard.writeText(tsv);
    setCopiedRow(true);
    setTimeout(() => setCopiedRow(false), 2000);
  };

  const handleCopyWithHeader = () => {
    const tsv = rowsToTsvTable([rowData], true);
    navigator.clipboard.writeText(tsv);
    setCopiedWithHeader(true);
    setTimeout(() => setCopiedWithHeader(false), 2000);
  };

  const handleCopySingleCell = (val: string, cellKey: string) => {
    navigator.clipboard.writeText(val);
    setCopiedCell(cellKey);
    setTimeout(() => setCopiedCell(null), 1800);
  };

  const handleDownloadCsv = () => {
    const filename = `${(title || inputs?.title || "kich_ban_3d_5_cot").replace(/[^a-zA-Z0-9_-]/g, "_")}.csv`;
    downloadSheetsCsv([rowData], filename);
  };

  const content = (
    <div className="space-y-4">
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 bg-slate-950 p-3 rounded-xl border border-slate-800">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Table className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-200">
              Định Dạng Bảng Google Sheet Chuẩn (5 Cột)
            </h4>
            <p className="text-[11px] text-slate-400">
              Tối ưu copy 1-click dán trực tiếp vào Google Sheets / Excel
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 flex-wrap gap-y-1.5">
          <button
            type="button"
            id="btn-copy-sheet-1-row"
            onClick={handleCopyOneRow}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg transition-all shadow-md shadow-amber-500/20 cursor-pointer"
            title="Sao chép 1 dòng (5 cột) - Mở Google Sheet và bấm Ctrl+V vào ô đầu tiên"
          >
            {copiedRow ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedRow ? "Đã chép 1 dòng!" : "📋 Copy 1 Dòng (Dán vào Sheet)"}</span>
          </button>

          <button
            type="button"
            id="btn-copy-sheet-with-header"
            onClick={handleCopyWithHeader}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition-colors cursor-pointer"
            title="Sao chép cả tiêu đề 5 cột + dữ liệu"
          >
            {copiedWithHeader ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
            <span>{copiedWithHeader ? "Đã chép cả bảng!" : "Copy kèm tiêu đề"}</span>
          </button>

          <button
            type="button"
            id="btn-download-sheet-csv"
            onClick={handleDownloadCsv}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 text-xs font-semibold bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 rounded-lg transition-colors cursor-pointer"
            title="Tải về file CSV tương thích Google Sheets / Excel"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Tải CSV 5 Cột</span>
          </button>
        </div>
      </div>

      {/* The 5 Columns Table matching the exact user screenshot */}
      <div className="overflow-x-auto rounded-xl border border-slate-700 shadow-xl bg-white text-slate-900">
        <table className="w-full text-left border-collapse min-w-[900px]">
          {/* Header row with exact colors from the screenshot */}
          <thead>
            <tr className="border-b-2 border-slate-400 text-xs select-none">
              {/* Col 1 (R): Lời thoại - White / Light Gray */}
              <th className="bg-[#F2F4F7] text-slate-950 font-bold px-3 py-2.5 border-r border-slate-300 w-[20%]">
                <div className="flex items-center justify-between">
                  <span>Lời thoại</span>
                  <span className="text-[10px] text-slate-600 font-mono">▼</span>
                </div>
              </th>

              {/* Col 2 (S): Copy Tạo storyboard - Yellow */}
              <th className="bg-[#FFFF00] text-slate-950 font-bold px-3 py-2.5 border-r border-slate-300 w-[20%]">
                <div className="flex items-center justify-between">
                  <span>Copy Tạo storyboard</span>
                  <span className="text-[10px] text-slate-600 font-mono">▼</span>
                </div>
              </th>

              {/* Col 3 (T): Image of Sences - Light Blue / Mint */}
              <th className="bg-[#C6E0B4] text-slate-950 font-bold px-3 py-2.5 border-r border-slate-300 w-[22%]">
                <div className="flex items-center justify-between">
                  <span>Image of Sences</span>
                  <span className="text-[10px] text-slate-600 font-mono">▼</span>
                </div>
              </th>

              {/* Col 4 (U): Copy Tạo Thumbnail - Yellow */}
              <th className="bg-[#FFFF00] text-slate-950 font-bold px-3 py-2.5 border-r border-slate-300 w-[18%]">
                <div className="flex items-center justify-between">
                  <span>Copy Tạo Thumbnail</span>
                  <span className="text-[10px] text-slate-600 font-mono">▼</span>
                </div>
              </th>

              {/* Col 5 (V): Video Scripts - White / Light Gray */}
              <th className="bg-[#F2F4F7] text-slate-950 font-bold px-3 py-2.5 w-[20%]">
                <div className="flex items-center justify-between">
                  <span>Video Scripts</span>
                  <span className="text-[10px] text-slate-600 font-mono">▼</span>
                </div>
              </th>
            </tr>
          </thead>

          {/* Body Row */}
          <tbody>
            <tr className="align-top text-xs hover:bg-slate-50 transition-colors">
              {/* Col 1 Value (Lời thoại) */}
              <td className="p-3 border-r border-slate-200 bg-[#F9FAFB] font-sans text-slate-800 relative group">
                <div className="flex items-center justify-between mb-1.5 pb-1 border-b border-slate-200">
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-200">
                    Cột 1 (R): Lời thoại
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopySingleCell(rowData.dialogues, "col1")}
                    className="px-2 py-0.5 text-[10px] font-semibold bg-white hover:bg-emerald-100 text-slate-700 hover:text-emerald-900 rounded border border-slate-300 flex items-center space-x-1 cursor-pointer transition-colors"
                  >
                    {copiedCell === "col1" ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedCell === "col1" ? "Đã chép" : "Chép ô"}</span>
                  </button>
                </div>
                <div className="max-h-[220px] overflow-y-auto pr-1 whitespace-pre-wrap leading-relaxed text-[11px]">
                  {rowData.dialogues || <span className="text-slate-400 italic">Chưa có dữ liệu Bước 1</span>}
                </div>
              </td>

              {/* Col 2 Value (Copy Tạo storyboard) */}
              <td className="p-3 border-r border-slate-200 bg-white font-sans text-slate-800 relative group">
                <div className="flex items-center justify-between mb-1.5 pb-1 border-b border-slate-100">
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                    Cột 2 (S): Storyboard
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopySingleCell(rowData.storyboard, "col2")}
                    className="px-2 py-0.5 text-[10px] font-semibold bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-900 rounded border border-slate-300 flex items-center space-x-1 cursor-pointer transition-colors"
                  >
                    {copiedCell === "col2" ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedCell === "col2" ? "Đã chép" : "Chép ô"}</span>
                  </button>
                </div>
                <div className="max-h-[220px] overflow-y-auto pr-1 whitespace-pre-wrap leading-relaxed text-[11px]">
                  {rowData.storyboard || <span className="text-slate-400 italic">Chưa có dữ liệu Bước 2</span>}
                </div>
              </td>

              {/* Col 3 Value (Sences) */}
              <td className="p-3 border-r border-slate-200 bg-[#F2F8EE] font-sans text-slate-800 relative group">
                <div className="flex items-center justify-between mb-1.5 pb-1 border-b border-slate-200">
                  <span className="text-[10px] font-bold text-indigo-800 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200">
                    Cột 3 (T): Sences N+1
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopySingleCell(rowData.scenes, "col3")}
                    className="px-2 py-0.5 text-[10px] font-semibold bg-white hover:bg-indigo-100 text-slate-700 hover:text-indigo-900 rounded border border-slate-300 flex items-center space-x-1 cursor-pointer transition-colors"
                  >
                    {copiedCell === "col3" ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedCell === "col3" ? "Đã chép" : "Chép ô"}</span>
                  </button>
                </div>
                <div className="max-h-[220px] overflow-y-auto pr-1 whitespace-pre-wrap leading-relaxed text-[11px] font-mono">
                  {rowData.scenes || <span className="text-slate-400 italic font-sans">Chưa có dữ liệu Bước 3</span>}
                </div>
              </td>

              {/* Col 4 Value (Copy Tạo Thumbnail) */}
              <td className="p-3 border-r border-slate-200 bg-white font-sans text-slate-800 relative group">
                <div className="flex items-center justify-between mb-1.5 pb-1 border-b border-slate-100">
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded border border-amber-200">
                    Cột 4 (U): Thumbnail
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopySingleCell(rowData.thumbnail, "col4")}
                    className="px-2 py-0.5 text-[10px] font-semibold bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-900 rounded border border-slate-300 flex items-center space-x-1 cursor-pointer transition-colors"
                  >
                    {copiedCell === "col4" ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedCell === "col4" ? "Đã chép" : "Chép ô"}</span>
                  </button>
                </div>
                <div className="max-h-[220px] overflow-y-auto pr-1 whitespace-pre-wrap leading-relaxed text-[11px]">
                  {rowData.thumbnail || <span className="text-slate-400 italic">Chưa có dữ liệu Bước 4</span>}
                </div>
              </td>

              {/* Col 5 Value (Video Scripts) */}
              <td className="p-3 bg-[#F9FAFB] font-sans text-slate-800 relative group">
                <div className="flex items-center justify-between mb-1.5 pb-1 border-b border-slate-200">
                  <span className="text-[10px] font-bold text-cyan-800 bg-cyan-50 px-1.5 py-0.5 rounded border border-cyan-200">
                    Cột 5 (V): Video Scripts
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopySingleCell(rowData.videoScripts, "col5")}
                    className="px-2 py-0.5 text-[10px] font-semibold bg-white hover:bg-cyan-100 text-slate-700 hover:text-cyan-900 rounded border border-slate-300 flex items-center space-x-1 cursor-pointer transition-colors"
                  >
                    {copiedCell === "col5" ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedCell === "col5" ? "Đã chép" : "Chép ô"}</span>
                  </button>
                </div>
                <div className="max-h-[220px] overflow-y-auto pr-1 whitespace-pre-wrap leading-relaxed text-[11px] font-mono">
                  {rowData.videoScripts || <span className="text-slate-400 italic font-sans">Chưa có dữ liệu Bước 5</span>}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Guide notice */}
      <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex items-start space-x-2.5 text-xs text-slate-400">
        <HelpCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-slate-200">Cách dán siêu tốc vào Google Sheet / Excel:</span>
          <p className="mt-0.5 text-[11px] leading-relaxed">
            1. Bấm nút màu vàng <strong className="text-amber-300 font-mono">"📋 Copy 1 Dòng (Dán vào Sheet)"</strong> ở trên.
            <br />
            2. Mở file Google Sheet của bạn, click vào ô dưới cột <strong className="text-white">Lời thoại</strong> (Cột R) và nhấn <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-amber-300 font-mono text-[10px]">Ctrl + V</kbd> (hoặc Cmd+V).
            <br />
            3. Dữ liệu sẽ tự động điền trọn vẹn vào 5 cột ngang [Lời thoại] [Copy Tạo storyboard] [Sences] [Copy Tạo Thumbnail] [Video Scripts] mà không làm nhảy dòng!
          </p>
        </div>
      </div>
    </div>
  );

  if (!showCardWrapper) {
    return content;
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
      {content}
    </div>
  );
};
