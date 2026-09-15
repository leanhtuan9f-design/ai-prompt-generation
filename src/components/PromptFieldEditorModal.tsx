import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Check,
  RotateCcw,
  Copy,
  CheckCheck,
  Tag,
  Info,
  Sparkles,
  Maximize2,
  FileText,
  Search,
  Code2,
  Eye,
  Sliders,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Braces,
} from "lucide-react";
import {
  AVAILABLE_SHORTCODES,
  SHORTCODE_CATEGORIES,
  ShortcodeDefinition,
  replaceShortcodes,
} from "../utils/shortcodes";

export interface VariableToken {
  token: string;
  label: string;
  description?: string;
}

export interface PromptFieldEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  badge?: string;
  colorTheme?:
    | "amber"
    | "emerald"
    | "indigo"
    | "purple"
    | "violet"
    | "sky"
    | "blue"
    | "teal"
    | "cyan"
    | "pink"
    | "rose"
    | "slate";
  icon?: React.ReactNode;
  initialValue: string;
  defaultValue?: string;
  placeholder?: string;
  variableTokens?: VariableToken[];
  isMonospace?: boolean;
  helperText?: string;
  onSave: (val: string) => void;
  // Optional secondary field (for Slang & Padding)
  secondaryTitle?: string;
  secondaryInitialValue?: string;
  secondaryDefaultValue?: string;
  secondaryPlaceholder?: string;
  onSaveSecondary?: (val: string) => void;
  // Optional live preview inputs
  sampleInputs?: any;
}

export const PromptFieldEditorModal: React.FC<PromptFieldEditorModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  badge,
  colorTheme = "amber",
  icon,
  initialValue,
  defaultValue,
  placeholder,
  variableTokens,
  isMonospace = true,
  helperText,
  onSave,
  secondaryTitle,
  secondaryInitialValue,
  secondaryDefaultValue,
  secondaryPlaceholder,
  onSaveSecondary,
  sampleInputs,
}) => {
  const [value, setValue] = useState(initialValue);
  const [secondaryValue, setSecondaryValue] = useState(secondaryInitialValue || "");
  const [copiedPrimary, setCopiedPrimary] = useState(false);
  const [copiedSecondary, setCopiedSecondary] = useState(false);

  // Shortcode UI State
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [bracketFormat, setBracketFormat] = useState<"square" | "curly">("square"); // [token] vs {{token}}
  const [showCheatSheet, setShowCheatSheet] = useState(false);
  const [activeTab, setActiveTab] = useState<"editor" | "preview">("editor");
  const [activeTextareaTarget, setActiveTextareaTarget] = useState<"primary" | "secondary">("primary");

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const secondaryTextareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen) {
      setValue(initialValue);
      setSecondaryValue(secondaryInitialValue || "");
      setCopiedPrimary(false);
      setCopiedSecondary(false);
      setActiveTab("editor");
      setSearchQuery("");
    }
  }, [isOpen, initialValue, secondaryInitialValue]);

  if (!isOpen) return null;

  const handleCopyPrimary = () => {
    navigator.clipboard.writeText(value);
    setCopiedPrimary(true);
    setTimeout(() => setCopiedPrimary(false), 2000);
  };

  const handleCopySecondary = () => {
    if (!secondaryValue) return;
    navigator.clipboard.writeText(secondaryValue);
    setCopiedSecondary(true);
    setTimeout(() => setCopiedSecondary(false), 2000);
  };

  const handleRestoreDefault = () => {
    if (defaultValue !== undefined) {
      setValue(defaultValue);
    }
  };

  const handleRestoreSecondaryDefault = () => {
    if (secondaryDefaultValue !== undefined) {
      setSecondaryValue(secondaryDefaultValue);
    }
  };

  const handleInsertToken = (tokenStr: string) => {
    const finalToken =
      bracketFormat === "curly"
        ? tokenStr.replace(/^\[(.*)\]$/, "{{$1}}")
        : tokenStr.replace(/^\{\{(.*)\}\}$/, "[$1]");

    const targetEl = activeTextareaTarget === "secondary" ? secondaryTextareaRef.current : textareaRef.current;

    if (!targetEl) {
      if (activeTextareaTarget === "secondary") {
        setSecondaryValue((prev) => (prev ? `${prev} ${finalToken}` : finalToken));
      } else {
        setValue((prev) => (prev ? `${prev} ${finalToken}` : finalToken));
      }
      return;
    }

    const start = targetEl.selectionStart;
    const end = targetEl.selectionEnd;
    const currentText = activeTextareaTarget === "secondary" ? secondaryValue : value;
    const before = currentText.substring(0, start);
    const after = currentText.substring(end);
    const newText = before + finalToken + after;

    if (activeTextareaTarget === "secondary") {
      setSecondaryValue(newText);
    } else {
      setValue(newText);
    }

    // Restore focus and cursor position after token
    setTimeout(() => {
      targetEl.focus();
      targetEl.setSelectionRange(start + finalToken.length, start + finalToken.length);
    }, 50);
  };

  const handleSaveAndClose = () => {
    onSave(value);
    if (onSaveSecondary && secondaryTitle) {
      onSaveSecondary(secondaryValue);
    }
    onClose();
  };

  // Build merged shortcode list
  const allShortcodes: ShortcodeDefinition[] = [...AVAILABLE_SHORTCODES];
  if (variableTokens && variableTokens.length > 0) {
    variableTokens.forEach((vt) => {
      const cleanKey = vt.token.replace(/[\[\]\{\}]/g, "");
      if (!allShortcodes.some((s) => s.key.toLowerCase() === cleanKey.toLowerCase())) {
        allShortcodes.unshift({
          token: vt.token.startsWith("[") ? vt.token : `[${vt.token}]`,
          altToken: `{{${cleanKey}}}`,
          key: cleanKey,
          label: vt.label,
          category: "input",
          categoryLabel: "Biến Số Tùy Chỉnh",
          description: vt.description || vt.label,
          exampleValue: `Giá trị cho ${vt.label}`,
        });
      }
    });
  }

  // Filter shortcodes
  const filteredShortcodes = allShortcodes.filter((sc) => {
    const matchCategory = selectedCategory === "all" || sc.category === selectedCategory;
    const query = searchQuery.trim().toLowerCase();
    if (!query) return matchCategory;
    return (
      matchCategory &&
      (sc.token.toLowerCase().includes(query) ||
        sc.altToken.toLowerCase().includes(query) ||
        sc.label.toLowerCase().includes(query) ||
        sc.description.toLowerCase().includes(query) ||
        sc.key.toLowerCase().includes(query))
    );
  });

  // Color theme mappings
  const themeStylesMap: Record<
    string,
    {
      border: string;
      glow: string;
      badge: string;
      iconBg: string;
      focusBorder: string;
      button: string;
      tokenBg: string;
    }
  > = {
    amber: {
      border: "border-amber-500/40",
      glow: "shadow-amber-500/10",
      badge: "bg-amber-950/70 text-amber-300 border-amber-500/40",
      iconBg: "bg-amber-500/20 text-amber-400 border-amber-500/30",
      focusBorder: "focus:border-amber-400 focus:ring-amber-500/20",
      button: "bg-amber-500 hover:bg-amber-400 text-slate-950",
      tokenBg: "bg-amber-950/60 text-amber-300 border-amber-500/40 hover:bg-amber-900/60",
    },
    emerald: {
      border: "border-emerald-500/40",
      glow: "shadow-emerald-500/10",
      badge: "bg-emerald-950/70 text-emerald-300 border-emerald-500/40",
      iconBg: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
      focusBorder: "focus:border-emerald-400 focus:ring-emerald-500/20",
      button: "bg-emerald-500 hover:bg-emerald-400 text-slate-950",
      tokenBg: "bg-emerald-950/60 text-emerald-300 border-emerald-500/40 hover:bg-emerald-900/60",
    },
    indigo: {
      border: "border-indigo-500/40",
      glow: "shadow-indigo-500/10",
      badge: "bg-indigo-950/70 text-indigo-300 border-indigo-500/40",
      iconBg: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
      focusBorder: "focus:border-indigo-400 focus:ring-indigo-500/20",
      button: "bg-indigo-600 hover:bg-indigo-500 text-white",
      tokenBg: "bg-indigo-950/60 text-indigo-300 border-indigo-500/40 hover:bg-indigo-900/60",
    },
    purple: {
      border: "border-purple-500/40",
      glow: "shadow-purple-500/10",
      badge: "bg-purple-950/70 text-purple-300 border-purple-500/40",
      iconBg: "bg-purple-500/20 text-purple-400 border-purple-500/30",
      focusBorder: "focus:border-purple-400 focus:ring-purple-500/20",
      button: "bg-purple-600 hover:bg-purple-500 text-white",
      tokenBg: "bg-purple-950/60 text-purple-300 border-purple-500/40 hover:bg-purple-900/60",
    },
    violet: {
      border: "border-violet-500/40",
      glow: "shadow-violet-500/10",
      badge: "bg-violet-950/70 text-violet-300 border-violet-500/40",
      iconBg: "bg-violet-500/20 text-violet-400 border-violet-500/30",
      focusBorder: "focus:border-violet-400 focus:ring-violet-500/20",
      button: "bg-violet-600 hover:bg-violet-500 text-white",
      tokenBg: "bg-violet-950/60 text-violet-300 border-violet-500/40 hover:bg-violet-900/60",
    },
    sky: {
      border: "border-sky-500/40",
      glow: "shadow-sky-500/10",
      badge: "bg-sky-950/70 text-sky-300 border-sky-500/40",
      iconBg: "bg-sky-500/20 text-sky-400 border-sky-500/30",
      focusBorder: "focus:border-sky-400 focus:ring-sky-500/20",
      button: "bg-sky-500 hover:bg-sky-400 text-slate-950",
      tokenBg: "bg-sky-950/60 text-sky-300 border-sky-500/40 hover:bg-sky-900/60",
    },
    blue: {
      border: "border-blue-500/40",
      glow: "shadow-blue-500/10",
      badge: "bg-blue-950/70 text-blue-300 border-blue-500/40",
      iconBg: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      focusBorder: "focus:border-blue-400 focus:ring-blue-500/20",
      button: "bg-blue-600 hover:bg-blue-500 text-white",
      tokenBg: "bg-blue-950/60 text-blue-300 border-blue-500/40 hover:bg-blue-900/60",
    },
    teal: {
      border: "border-teal-500/40",
      glow: "shadow-teal-500/10",
      badge: "bg-teal-950/70 text-teal-300 border-teal-500/40",
      iconBg: "bg-teal-500/20 text-teal-400 border-teal-500/30",
      focusBorder: "focus:border-teal-400 focus:ring-teal-500/20",
      button: "bg-teal-500 hover:bg-teal-400 text-slate-950",
      tokenBg: "bg-teal-950/60 text-teal-300 border-teal-500/40 hover:bg-teal-900/60",
    },
    cyan: {
      border: "border-cyan-500/40",
      glow: "shadow-cyan-500/10",
      badge: "bg-cyan-950/70 text-cyan-300 border-cyan-500/40",
      iconBg: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
      focusBorder: "focus:border-cyan-400 focus:ring-cyan-500/20",
      button: "bg-cyan-500 hover:bg-cyan-400 text-slate-950",
      tokenBg: "bg-cyan-950/60 text-cyan-300 border-cyan-500/40 hover:bg-cyan-900/60",
    },
    pink: {
      border: "border-pink-500/40",
      glow: "shadow-pink-500/10",
      badge: "bg-pink-950/70 text-pink-300 border-pink-500/40",
      iconBg: "bg-pink-500/20 text-pink-400 border-pink-500/30",
      focusBorder: "focus:border-pink-400 focus:ring-pink-500/20",
      button: "bg-pink-600 hover:bg-pink-500 text-white",
      tokenBg: "bg-pink-950/60 text-pink-300 border-pink-500/40 hover:bg-pink-900/60",
    },
    rose: {
      border: "border-rose-500/40",
      glow: "shadow-rose-500/10",
      badge: "bg-rose-950/70 text-rose-300 border-rose-500/40",
      iconBg: "bg-rose-500/20 text-rose-400 border-rose-500/30",
      focusBorder: "focus:border-rose-400 focus:ring-rose-500/20",
      button: "bg-rose-600 hover:bg-rose-500 text-white",
      tokenBg: "bg-rose-950/60 text-rose-300 border-rose-500/40 hover:bg-rose-900/60",
    },
    slate: {
      border: "border-slate-600",
      glow: "shadow-slate-500/10",
      badge: "bg-slate-800 text-slate-300 border-slate-700",
      iconBg: "bg-slate-800 text-slate-300 border-slate-700",
      focusBorder: "focus:border-slate-400 focus:ring-slate-500/20",
      button: "bg-slate-200 hover:bg-white text-slate-950",
      tokenBg: "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700",
    },
  };

  const themeStyles = themeStylesMap[colorTheme] || themeStylesMap.amber;

  // Render live preview text
  const previewText = replaceShortcodes(value, sampleInputs || {});
  const secondaryPreviewText = secondaryTitle ? replaceShortcodes(secondaryValue, sampleInputs || {}) : "";

  return (
    <div
      id="prompt-field-editor-modal"
      className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`bg-slate-950 border ${themeStyles.border} rounded-2xl w-full max-w-5xl max-h-[94vh] flex flex-col shadow-2xl ${themeStyles.glow} overflow-hidden`}
      >
        {/* MODAL HEADER */}
        <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-900/80 shrink-0">
          <div className="flex items-center space-x-3 min-w-0 pr-3">
            <div
              className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${themeStyles.iconBg}`}
            >
              {icon || <FileText className="w-5 h-5" />}
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-slate-100 truncate">{title}</h3>
                {badge && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold shrink-0 ${themeStyles.badge}`}
                  >
                    {badge}
                  </span>
                )}
              </div>
              {subtitle && <p className="text-xs text-slate-400 truncate mt-0.5">{subtitle}</p>}
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            {/* View Mode Toggle: Editor vs Live Preview */}
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-0.5 flex items-center">
              <button
                type="button"
                onClick={() => setActiveTab("editor")}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center space-x-1 transition-all ${
                  activeTab === "editor"
                    ? "bg-slate-800 text-slate-100 shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>Soạn thảo</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("preview")}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center space-x-1 transition-all ${
                  activeTab === "preview"
                    ? "bg-slate-800 text-emerald-300 shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
                title="Xem trước prompt khi đã tự động điền các Shortcode"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Xem Trước</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 transition-colors"
              title="Đóng cửa sổ"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* INTERACTIVE SHORTCODE TOOLBAR */}
        <div className="px-4 py-2.5 bg-slate-900/60 border-b border-slate-800/90 flex flex-col gap-2 shrink-0">
          {/* Top Bar: Search, Category Pills, Format Toggle & Cheat Sheet */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center flex-wrap gap-1.5">
              <span className="text-[11px] font-bold text-slate-300 flex items-center space-x-1 mr-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Shortcode Input:</span>
              </span>

              {/* Category Pills */}
              <div className="flex items-center space-x-1 overflow-x-auto pb-0.5 max-w-full">
                {SHORTCODE_CATEGORIES.map((cat) => {
                  const count =
                    cat.id === "all"
                      ? allShortcodes.length
                      : allShortcodes.filter((s) => s.category === cat.id).length;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition-all shrink-0 flex items-center space-x-1 ${
                        selectedCategory === cat.id
                          ? "bg-slate-800 text-amber-300 border border-amber-500/40 font-bold shadow-sm"
                          : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
                      }`}
                    >
                      <span>{cat.icon} {cat.label}</span>
                      <span className="text-[9px] px-1 py-0.2 rounded-full bg-slate-800/80 text-slate-400 font-mono">
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right controls: Bracket Format, Search, Cheat Sheet */}
            <div className="flex items-center space-x-2 ml-auto">
              {/* Bracket format toggle [token] vs {{token}} */}
              <button
                type="button"
                onClick={() => setBracketFormat((prev) => (prev === "square" ? "curly" : "square"))}
                className="px-2 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-md text-[11px] font-mono text-slate-300 flex items-center space-x-1"
                title={`Định dạng đang chọn: ${bracketFormat === "square" ? "[shortcode]" : "{{shortcode}}"}. Bấm để đổi.`}
              >
                <Braces className="w-3 h-3 text-indigo-400" />
                <span>{bracketFormat === "square" ? "[code]" : "{{code}}"}</span>
              </button>

              {/* Search Box */}
              <div className="relative">
                <Search className="w-3 h-3 text-slate-400 absolute left-2 top-2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm shortcode..."
                  className="bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-md pl-6 pr-2 py-0.5 text-[11px] text-slate-200 outline-none w-28 sm:w-36"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-1.5 top-1 text-slate-500 hover:text-slate-300 text-xs"
                  >
                    ×
                  </button>
                )}
              </div>

              {/* Cheat Sheet Toggle */}
              <button
                type="button"
                onClick={() => setShowCheatSheet((prev) => !prev)}
                className={`px-2 py-1 rounded-md text-[11px] border font-medium flex items-center space-x-1 transition-colors ${
                  showCheatSheet
                    ? "bg-amber-950/70 text-amber-300 border-amber-500/40"
                    : "bg-slate-900 text-slate-400 hover:text-slate-200 border-slate-800"
                }`}
                title="Mở bảng tra cứu chi tiết và giá trị mẫu"
              >
                <HelpCircle className="w-3 h-3 text-amber-400" />
                <span>Bảng Tra Cứu</span>
                {showCheatSheet ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            </div>
          </div>

          {/* Bottom Bar: Clickable Shortcode Badges for Instant Insertion */}
          <div className="flex items-center flex-wrap gap-1.5 max-h-36 sm:max-h-44 overflow-y-auto pt-1.5 pb-1 border-t border-slate-800/60 custom-scrollbar">
            {filteredShortcodes.length > 0 ? (
              filteredShortcodes.map((sc) => {
                const displayToken = bracketFormat === "curly" ? sc.altToken : sc.token;
                const isBrand = sc.key.toLowerCase() === "brand" || sc.key.toLowerCase() === "mascotname";
                return (
                  <button
                    key={sc.token}
                    type="button"
                    onClick={() => handleInsertToken(displayToken)}
                    className={`group px-2 py-1 rounded-md border text-[11px] font-mono font-medium transition-all flex items-center space-x-1 shadow-sm ${
                      isBrand
                        ? "bg-amber-950/70 hover:bg-amber-900/80 border-amber-500/60 text-amber-200 hover:text-amber-100"
                        : "bg-slate-900 hover:bg-slate-800 border-slate-700/80 hover:border-indigo-500/60 text-slate-200 hover:text-indigo-300"
                    }`}
                    title={`${sc.label}: ${sc.description} (Ví dụ: "${sc.exampleValue}") -> Bấm để chèn vào vị trí con trỏ`}
                  >
                    <span className={isBrand ? "text-amber-400 group-hover:scale-110 transition-transform font-bold" : "text-indigo-400 group-hover:scale-110 transition-transform font-bold"}>+</span>
                    <span className="font-semibold">{displayToken}</span>
                    <span className="text-[10px] text-slate-400 group-hover:text-slate-200 font-sans hidden sm:inline">
                      ({sc.label})
                    </span>
                  </button>
                );
              })
            ) : (
              <span className="text-[11px] text-slate-500 italic">
                Không tìm thấy shortcode phù hợp với từ khóa "{searchQuery}"
              </span>
            )}
          </div>
        </div>

        {/* COLLAPSIBLE CHEAT SHEET DRAWER */}
        {showCheatSheet && (
          <div className="p-3.5 bg-slate-950 border-b border-slate-800/90 max-h-48 overflow-y-auto animate-in slide-in-from-top-2 duration-150">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
              <span className="text-xs font-bold text-amber-300 flex items-center space-x-1.5">
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Bảng Tra Cứu Shortcode & Giá Trị Thực Tế Được Thay Thế</span>
              </span>
              <span className="text-[10px] text-slate-400">
                Bấm vào nút <b className="text-amber-400">+ Chèn</b> để thêm ngay vào nội dung
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {allShortcodes.map((sc) => {
                const tokenFormatted = bracketFormat === "curly" ? sc.altToken : sc.token;
                return (
                  <div
                    key={sc.token}
                    className="p-2 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-slate-700 flex flex-col justify-between space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-xs text-amber-300">{tokenFormatted}</span>
                      <button
                        type="button"
                        onClick={() => handleInsertToken(tokenFormatted)}
                        className="px-1.5 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[10px] font-semibold flex items-center space-x-1"
                      >
                        <span>+ Chèn</span>
                      </button>
                    </div>
                    <div className="text-[11px] text-slate-300 font-semibold">{sc.label}</div>
                    <div className="text-[10px] text-slate-400 line-clamp-1">{sc.description}</div>
                    <div className="text-[10px] text-emerald-400/90 font-mono bg-slate-950/80 p-1 rounded border border-slate-800/80 truncate">
                      Ví dụ: {sc.exampleValue}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* MODAL BODY */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {activeTab === "preview" ? (
            /* LIVE PREVIEW TAB */
            <div className="space-y-4">
              <div className="p-3 bg-emerald-950/30 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center justify-between">
                <span className="flex items-center space-x-1.5">
                  <Eye className="w-4 h-4 text-emerald-400" />
                  <span>
                    Chế độ Xem Trước: Tất cả Shortcode (như [title], [aspectRatio], [videoStyle]...) đã được tự động thay thế bằng dữ liệu thực.
                  </span>
                </span>
                <span className="text-[11px] text-slate-400">Không thể sửa ở chế độ xem trước</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Nội dung Prompt / Quy Tắc đã điền giá trị:</label>
                <div
                  className={`w-full bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 text-xs text-emerald-200/90 leading-relaxed min-h-[300px] whitespace-pre-wrap ${
                    isMonospace ? "font-mono" : "font-sans"
                  }`}
                >
                  {previewText || "(Nội dung trống)"}
                </div>
              </div>

              {secondaryTitle && (
                <div className="space-y-1.5 pt-2 border-t border-slate-800">
                  <label className="text-xs font-bold text-slate-300">{secondaryTitle} (Xem trước):</label>
                  <div className="w-full bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 text-xs text-emerald-200/90 leading-relaxed min-h-[120px] whitespace-pre-wrap font-mono">
                    {secondaryPreviewText || "(Nội dung trống)"}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* EDITOR TAB */
            <div className="space-y-4 flex flex-col">
              {helperText && (
                <div className="p-2.5 bg-slate-900/70 rounded-xl border border-slate-800 text-xs text-slate-400 leading-relaxed flex items-center space-x-2">
                  <Info className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>{helperText}</span>
                </div>
              )}

              {/* Primary Textarea */}
              <div className="space-y-1.5 flex flex-col">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
                    <span>{secondaryTitle ? "1. Nội dung chính & Quy tắc Prompt:" : "Nội dung chi tiết:"}</span>
                    {activeTextareaTarget === "primary" && (
                      <span className="text-[10px] px-1.5 py-0.2 bg-amber-950 text-amber-300 border border-amber-500/40 rounded">
                        Đang trỏ con trỏ
                      </span>
                    )}
                  </label>
                  <div className="flex items-center space-x-3 text-[11px] text-slate-500">
                    {defaultValue !== undefined && (
                      <button
                        type="button"
                        onClick={handleRestoreDefault}
                        className="text-slate-400 hover:text-amber-300 transition-colors flex items-center space-x-1"
                        title="Khôi phục lại nội dung mẫu ban đầu"
                      >
                        <RotateCcw className="w-3 h-3 text-amber-400" />
                        <span>Mẫu gốc</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleCopyPrimary}
                      className="text-slate-400 hover:text-slate-200 transition-colors flex items-center space-x-1"
                    >
                      {copiedPrimary ? (
                        <span className="text-emerald-400">Đã sao chép</span>
                      ) : (
                        <span>Sao chép</span>
                      )}
                    </button>
                    <span>{value.length} ký tự</span>
                  </div>
                </div>

                <textarea
                  ref={textareaRef}
                  value={value}
                  onFocus={() => setActiveTextareaTarget("primary")}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder={placeholder || "Nhập nội dung chi tiết kèm các shortcode như [title], [aspectRatio]..."}
                  className={`w-full bg-slate-900/90 border border-slate-700/90 rounded-xl p-3.5 text-xs text-slate-100 outline-none leading-relaxed resize-y focus:ring-2 ${
                    themeStyles.focusBorder
                  } ${
                    isMonospace ? "font-mono" : "font-sans"
                  } ${secondaryTitle ? "min-h-[170px]" : "min-h-[320px] flex-1"}`}
                />
              </div>

              {/* Optional Secondary Field (for Slang & Padding) */}
              {secondaryTitle && (
                <div className="space-y-1.5 pt-2 border-t border-slate-800 flex flex-col">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
                      <Tag className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{secondaryTitle}</span>
                      {activeTextareaTarget === "secondary" && (
                        <span className="text-[10px] px-1.5 py-0.2 bg-indigo-950 text-indigo-300 border border-indigo-500/40 rounded">
                          Đang trỏ con trỏ
                        </span>
                      )}
                    </label>
                    <div className="flex items-center space-x-2">
                      {secondaryDefaultValue !== undefined && (
                        <button
                          type="button"
                          onClick={handleRestoreSecondaryDefault}
                          className="text-[11px] text-slate-400 hover:text-indigo-300"
                        >
                          Khôi phục vùng đệm gốc
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={handleCopySecondary}
                        className="text-[11px] text-slate-400 hover:text-indigo-300 flex items-center space-x-1"
                      >
                        {copiedSecondary ? (
                          <span className="text-emerald-400">Đã chép</span>
                        ) : (
                          <span>Sao chép</span>
                        )}
                      </button>
                      <span className="text-[11px] text-slate-500">{secondaryValue.length} ký tự</span>
                    </div>
                  </div>
                  <textarea
                    ref={secondaryTextareaRef}
                    value={secondaryValue}
                    onFocus={() => setActiveTextareaTarget("secondary")}
                    onChange={(e) => setSecondaryValue(e.target.value)}
                    placeholder={secondaryPlaceholder || "Nhập quy tắc đệm từ chuyên môn..."}
                    className={`w-full bg-slate-900/90 border border-slate-700/90 rounded-xl p-3.5 text-xs text-slate-100 outline-none leading-relaxed min-h-[140px] resize-y focus:ring-2 ${
                      themeStyles.focusBorder
                    } font-mono`}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="px-5 py-3.5 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-400 flex items-center space-x-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="hidden sm:inline">
              Mẹo: Chèn <b>[aspectRatio]</b>, <b>[videoStyle]</b>, <b>[title]</b> để AI tự điền tham số khi tạo kịch bản.
            </span>
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700 transition-colors"
            >
              Hủy bỏ
            </button>

            <button
              type="button"
              onClick={handleSaveAndClose}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-lg flex items-center space-x-1.5 ${themeStyles.button}`}
            >
              <Check className="w-4 h-4" />
              <span>Lưu & Áp Dụng</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
