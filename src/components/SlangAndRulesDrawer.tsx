import React, { useState } from "react";
import { X, BookOpen, ShieldCheck, Copy, Check, Search, Sparkles, Filter, Download } from "lucide-react";
import { REGIONAL_SLANG_BANK, SAFE_WORDS_DICTIONARY, PADDING_WORDS_EXAMPLES } from "../data/constants";
import { downloadBuiltinStandardFile } from "../utils/importExportUtils";

interface SlangAndRulesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: "slang" | "safewords" | "padding";
}

export const SlangAndRulesDrawer: React.FC<SlangAndRulesDrawerProps> = ({
  isOpen,
  onClose,
  defaultTab = "slang",
}) => {
  const [activeTab, setActiveTab] = useState<"slang" | "safewords" | "padding">(defaultTab);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRegion, setSelectedRegion] = useState<string>("all");
  const [selectedGroup, setSelectedGroup] = useState<string>("all");
  const [copiedWord, setCopiedWord] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedWord(text);
    setTimeout(() => setCopiedWord(null), 1500);
  };

  const filteredSlangs = REGIONAL_SLANG_BANK.filter((item) => {
    const matchSearch =
      item.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.meaning.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.example.toLowerCase().includes(searchQuery.toLowerCase());
    const matchRegion = selectedRegion === "all" || item.region === selectedRegion;
    const matchGroup = selectedGroup === "all" || item.group === selectedGroup;
    return matchSearch && matchRegion && matchGroup;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">
                Sổ Tay Quy Tắc & Từ Điển Từ Lóng AI Cinematic
              </h3>
              <p className="text-[11px] text-slate-400">
                Tra cứu từ lóng vùng miền, từ cấm chính sách & quy tắc vùng đệm y khoa
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => downloadBuiltinStandardFile("rules")}
              className="px-2.5 py-1 text-xs font-semibold bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/40 rounded-lg transition-colors flex items-center space-x-1"
              title="Tải về file quy tắc chuẩn .json"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Tải File Rules Chuẩn (.json)</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/30 px-4">
          <button
            onClick={() => setActiveTab("slang")}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors flex items-center space-x-2 ${
              activeTab === "slang"
                ? "border-amber-400 text-amber-300"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Từ Lóng Vùng Miền (5 Nhóm)</span>
          </button>

          <button
            onClick={() => setActiveTab("safewords")}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors flex items-center space-x-2 ${
              activeTab === "safewords"
                ? "border-emerald-400 text-emerald-300"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Từ Cấm Safe Words</span>
          </button>

          <button
            onClick={() => setActiveTab("padding")}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors flex items-center space-x-2 ${
              activeTab === "padding"
                ? "border-blue-400 text-blue-300"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Quy Tắc Vùng Đệm (Padding)</span>
          </button>
        </div>

        {/* Modal Content Body */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {/* TAB 1: Từ lóng */}
          {activeTab === "slang" && (
            <div className="space-y-4">
              {/* Search & Filters */}
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm từ lóng, ý nghĩa hoặc ví dụ..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <select
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  className="bg-slate-950 border border-slate-700 text-xs text-slate-200 rounded-xl px-3 py-1.5 focus:outline-none focus:border-amber-400"
                >
                  <option value="all">Tất cả vùng miền</option>
                  <option value="Miền Nam">Miền Nam</option>
                  <option value="Miền Bắc">Miền Bắc</option>
                  <option value="Miền Trung">Miền Trung</option>
                  <option value="Miền Tây">Miền Tây</option>
                </select>

                <select
                  value={selectedGroup}
                  onChange={(e) => setSelectedGroup(e.target.value)}
                  className="bg-slate-950 border border-slate-700 text-xs text-slate-200 rounded-xl px-3 py-1.5 focus:outline-none focus:border-amber-400"
                >
                  <option value="all">Tất cả 5 nhóm</option>
                  <option value="Cảm thán">Cảm thán</option>
                  <option value="Nhấn mạnh">Nhấn mạnh</option>
                  <option value="Chuyển ý">Chuyển ý</option>
                  <option value="Gọi người xem">Gọi người xem</option>
                  <option value="Câu đệm">Câu đệm</option>
                </select>
              </div>

              {/* Slang Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {filteredSlangs.map((item, index) => (
                  <div
                    key={index}
                    className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl hover:border-amber-500/40 transition-colors flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-amber-300">
                            {item.word}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                            {item.region}
                          </span>
                        </div>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          {item.group}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mb-1">
                        {item.meaning}
                      </p>
                      <p className="text-[11px] text-slate-300 italic bg-slate-900/60 p-2 rounded-lg border border-slate-800/80">
                        "{item.example}"
                      </p>
                    </div>

                    <button
                      onClick={() => handleCopy(item.word)}
                      className="mt-2.5 flex items-center justify-center space-x-1.5 py-1 px-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] rounded-lg transition-colors"
                    >
                      {copiedWord === item.word ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Đã chép</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 text-slate-400" />
                          <span>Chép từ lóng</span>
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: Từ cấm Safe words */}
          {activeTab === "safewords" && (
            <div className="space-y-3">
              <div className="p-3 bg-rose-950/20 border border-rose-800/40 rounded-xl text-xs text-slate-300">
                <span className="font-bold text-rose-400">Chính sách quảng cáo & An toàn cộng đồng: </span>
                Tuyệt đối không sử dụng các từ mang tính cam kết y tế điều trị hay tạo hình ảnh gây sợ hãi (fear-mongering).
              </div>

              <div className="space-y-2">
                {SAFE_WORDS_DICTIONARY.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs items-center"
                  >
                    <div>
                      <span className="text-[10px] text-rose-400 font-bold uppercase block">
                        Từ cấm kỵ:
                      </span>
                      <span className="text-xs font-bold text-rose-300 line-through">
                        {item.banned}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-emerald-400 font-bold uppercase block">
                        Từ thay thế chuẩn:
                      </span>
                      <span className="text-xs font-bold text-emerald-300">
                        {item.replacement}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-500 font-bold uppercase block">
                        Lý do nền tảng:
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {item.reason}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: Quy tắc vùng đệm */}
          {activeTab === "padding" && (
            <div className="space-y-3 text-xs text-slate-300">
              <div className="p-3 bg-blue-950/20 border border-blue-800/40 rounded-xl text-xs leading-relaxed">
                <span className="font-bold text-blue-300">Quy tắc Vùng Đệm (Padding Rule): </span>
                KHÔNG để thuật ngữ y khoa (axit, vi khuẩn, tanin, niêm mạc...) đứng trơ trọi. Phải kẹp chúng vào giữa các "hư từ", "đại từ" (ví dụ: <span className="text-amber-300 font-semibold">"mấy cái chất"</span>, <span className="text-amber-300 font-semibold">"nó"</span>, <span className="text-amber-300 font-semibold">"cái chất này nè"</span>) để làm mềm câu văn, ép AI đọc đúng giọng đời thường tự nhiên.
              </div>

              <div className="space-y-2">
                {PADDING_WORDS_EXAMPLES.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-300">{item.term}</span>
                      <span className="text-[10px] text-slate-500">{item.explanation}</span>
                    </div>
                    <div className="p-2 bg-slate-900 rounded-lg text-emerald-300 font-medium">
                      👉 Cách đọc đệm: "{item.padded}"
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
