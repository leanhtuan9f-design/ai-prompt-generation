import React, { useState, useEffect } from "react";
import { Sparkles, Layers, Sliders, Volume2, User, Eye, Wand2, Info, Settings, Grid3X3, Image as ImageIcon, ChevronDown, ChevronUp, Tag, ShieldAlert, FolderKanban, ShieldCheck, RefreshCw } from "lucide-react";
import { PromptInputs, PromptTemplate } from "../types";
import { getStoredTemplates, getDefaultTemplateId } from "../utils/templateStorage";
import { getDynamicCharacterProfile } from "../utils/shortcodes";
import {
  getSavedProjectNames,
  getActiveProjectName,
  setActiveProjectName,
  getProjectAngles,
  checkTopicDuplicateWithProject,
} from "../utils/projectMemory";
import { ProjectManagerBar } from "./ProjectManagerBar";
import { HelpTooltip } from "./HelpTooltip";
import {
  DEFAULT_STORYBOARD_PROMPT_TEMPLATE,
  DEFAULT_THUMBNAIL_PROMPT_TEMPLATE,
  REGIONAL_ACCENT_OPTIONS,
  REGIONAL_VOICE_OPTIONS,
  matchRegionalVoice,
  VIDEO_STYLE_OPTIONS,
  ASPECT_RATIO_OPTIONS,
  CHARACTER_GENDER_OPTIONS,
} from "../data/constants";

interface InputPanelProps {
  inputs: PromptInputs;
  onChange: (newInputs: PromptInputs) => void;
  onStartStep1: () => void;
  isGenerating: boolean;
  onOpenSettingsModal?: (tab?: "ai" | "threading" | "presets") => void;
}

export const InputPanel: React.FC<InputPanelProps> = ({
  inputs,
  onChange,
  onStartStep1,
  isGenerating,
  onOpenSettingsModal,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showPromptAccordions, setShowPromptAccordions] = useState(false);
  const [templates, setTemplates] = useState<PromptTemplate[]>(() => getStoredTemplates());

  useEffect(() => {
    const handleUpdate = () => {
      setTemplates(getStoredTemplates());
    };
    window.addEventListener("prompt_templates_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("prompt_templates_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const handleTemplateSelect = (template: PromptTemplate) => {
    onChange({
      ...template.data,
      title: inputs.title ? inputs.title : template.data.title,
    });
  };

  const selectedTemplate = templates.find((t) => t.data.title === inputs.title || t.name === inputs.title);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-md space-y-5">
      {/* Header & Template Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wide">
              5 Bước Nhập Liệu Đầu Vào (Input Configuration)
            </h2>
            <p className="text-xs text-slate-400">
              Cung cấp 5 yếu tố cốt lõi để AI thiết kế kịch bản & prompt 3D Pixar chuẩn xác
            </p>
          </div>
        </div>

        {/* Quick Templates with Settings Trigger */}
        <div className="flex items-center space-x-2 flex-wrap gap-y-1.5">
          <span className="text-xs text-slate-400 font-medium flex items-center space-x-1">
            <Sliders className="w-3 h-3 text-amber-400" />
            <span>Template Chuẩn:</span>
          </span>
          <select
            id="select-preset-template"
            onChange={(e) => {
              const selected = templates.find((t) => t.id === e.target.value);
              if (selected) handleTemplateSelect(selected);
            }}
            defaultValue=""
            className="bg-slate-800 border border-slate-700 hover:border-amber-500/50 text-xs text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-amber-400 cursor-pointer font-medium"
          >
            <option value="" disabled>
              Chọn Template kịch bản mẫu ({templates.length} mẫu)...
            </option>
            {templates.map((tpl) => (
              <option key={tpl.id} value={tpl.id}>
                {tpl.name} [{tpl.tag || "Chuẩn"}]
              </option>
            ))}
          </select>

          {onOpenSettingsModal && (
            <button
              type="button"
              onClick={() => onOpenSettingsModal("presets")}
              className="p-1.5 bg-slate-800 hover:bg-slate-750 text-slate-400 hover:text-amber-300 border border-slate-700 rounded-lg transition-colors cursor-pointer"
              title="Quản lý và tùy biến danh sách Template trong Cài đặt"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Dynamic Project Context & Anti-Duplication Memory Bar */}
      <ProjectManagerBar
        currentTopic={inputs.title}
        selectedProject={inputs.projectName}
        onProjectChange={(newProject) => {
          onChange({ ...inputs, projectName: newProject });
        }}
      />

      {/* 5 Primary Inputs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 1. Tiêu đề / Chủ đề */}
        <div className="md:col-span-2 space-y-1.5">
          <label className="flex items-center justify-between text-xs font-bold text-slate-200">
            <span className="flex items-center space-x-1.5">
              <span className="w-4 h-4 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black flex items-center justify-center">
                1
              </span>
              <span>Tiêu đề / Chủ đề Video (Title & Health Topic)</span>
            </span>
            <span className="text-[11px] text-amber-400/90 font-normal">Hook & Problem Focus</span>
          </label>
          <input
            id="input-title"
            type="text"
            value={inputs.title}
            onChange={(e) => onChange({ ...inputs, title: e.target.value })}
            placeholder="Ví dụ: Bí quyết xoa dịu đau dạ dày, trào ngược ợ chua ban đêm..."
            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all"
          />
        </div>

        {/* 2. Nội dung cốt lõi */}
        <div className="md:col-span-2 space-y-1.5">
          <label className="flex items-center justify-between text-xs font-bold text-slate-200">
            <span className="flex items-center space-x-1.5">
              <span className="w-4 h-4 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black flex items-center justify-center">
                2
              </span>
              <span>Nội dung cốt lõi (Core Problem - 3 Nỗi đau & 3 Giải pháp khoa học)</span>
              <HelpTooltip
                variant="tip"
                title="Quy tắc 3 Nỗi đau & 3 Giải pháp"
                text="Mô tả nguyên nhân khoa học và 3 giải pháp rõ ràng: gồm 2 giải pháp tự nhiên (thói quen, dinh dưỡng) + 1 giải pháp sản phẩm khoa học."
              />
            </span>
            <span className="text-[11px] text-emerald-400 font-normal">
              2 Tự nhiên + 1 Sản phẩm
            </span>
          </label>
          <textarea
            id="input-core-content"
            rows={3}
            value={inputs.coreContent}
            onChange={(e) => onChange({ ...inputs, coreContent: e.target.value })}
            placeholder="Mô tả nguyên nhân khoa học (axit, thức khuya, stress) và 3 giải pháp khoa học kèm chứng cứ..."
            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs leading-relaxed text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all"
          />
        </div>

        {/* 3. Style */}
        <div className="space-y-1.5">
          <label className="flex items-center justify-between text-xs font-bold text-slate-200">
            <span className="flex items-center space-x-1.5">
              <span className="w-4 h-4 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black flex items-center justify-center">
                3
              </span>
              <span>Video Style (Phong cách visual 3D & Ánh sáng)</span>
            </span>
            <span className="text-[11px] text-indigo-400 font-normal">Danh sách xổ xuống</span>
          </label>
          <div className="space-y-2">
            <select
              id="select-video-style-preset"
              value={
                VIDEO_STYLE_OPTIONS.find((s) => s.prompt === inputs.style)?.id || "custom"
              }
              onChange={(e) => {
                if (e.target.value === "custom") return;
                const selected = VIDEO_STYLE_OPTIONS.find((s) => s.id === e.target.value);
                if (selected) {
                  onChange({ ...inputs, style: selected.prompt });
                }
              }}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-400 cursor-pointer font-medium"
            >
              {VIDEO_STYLE_OPTIONS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
              <option value="custom">✏️ Tùy chỉnh prompt style riêng...</option>
            </select>
            <input
              id="input-style"
              type="text"
              value={inputs.style}
              onChange={(e) => onChange({ ...inputs, style: e.target.value })}
              placeholder="3D Pixar style, soft peach background, magical glowing particles, 8k..."
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-300 placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-all font-mono"
            />
          </div>
        </div>

        {/* 3b. Tỷ lệ khung hình Video (9:16 hay 16:9) */}
        <div className="space-y-1.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
          <div className="flex items-center justify-between">
            <label className="flex items-center space-x-1.5 text-xs font-bold text-slate-200">
              <span className="w-4 h-4 rounded-full bg-cyan-400 text-slate-950 text-[10px] font-black flex items-center justify-center">
                📐
              </span>
              <span>Tỷ lệ khung hình Video (Aspect Ratio)</span>
            </label>
            <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              {inputs.aspectRatio === "16:9" ? "16:9 (Ngang)" : "9:16 (Dọc)"}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            {ASPECT_RATIO_OPTIONS.map((opt) => {
              const isSelected = (inputs.aspectRatio || "9:16") === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  id={`btn-aspect-ratio-${opt.id.replace(":", "-")}`}
                  onClick={() => onChange({ ...inputs, aspectRatio: opt.id })}
                  className={`px-3 py-2 rounded-xl text-left border transition-all flex items-center space-x-2.5 cursor-pointer ${
                    isSelected
                      ? "bg-cyan-950/60 border-cyan-400 text-cyan-200 shadow-md shadow-cyan-950/40 ring-1 ring-cyan-400/50"
                      : "bg-slate-900/80 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-300"
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 ${
                      isSelected
                        ? "bg-cyan-500/20 border-cyan-400 text-cyan-300"
                        : "bg-slate-800 border-slate-700 text-slate-400"
                    }`}
                  >
                    {opt.id === "9:16" ? (
                      <div className="w-3 h-5 border-2 border-current rounded-sm flex items-center justify-center text-[7px] font-bold">
                        9:16
                      </div>
                    ) : (
                      <div className="w-5 h-3 border-2 border-current rounded-sm flex items-center justify-center text-[6px] font-bold">
                        16:9
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-100 flex items-center space-x-1">
                      <span>{opt.badge}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">
                      {opt.id === "9:16" ? "Shorts / TikTok / Reels" : "YouTube Widescreen / TV"}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Giọng đọc & VEO3 Engine */}
        <div className="space-y-1.5">
          {(() => {
            const matched = matchRegionalVoice(
              inputs.regionAccent || "south",
              inputs.characterGender || "Vietnamese female",
              inputs.characterAge || inputs.femaleAge || "25-34"
            );
            return (
              <>
                <div className="flex items-center justify-between gap-2 flex-nowrap min-w-0">
                  <label className="flex items-center space-x-1.5 text-xs font-bold text-slate-200 whitespace-nowrap min-w-0 shrink-0">
                    <span className="w-4 h-4 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black flex items-center justify-center shrink-0">
                      4
                    </span>
                    <span>Giọng đọc vùng miền & VEO3</span>
                    <HelpTooltip
                      variant="info"
                      className="shrink-0"
                      title="Tự động khớp giọng đọc nhân vật"
                      text={`Tự động khớp theo Nhân vật (${matched.shortLabel}): ${matched.toneDescription}. Tốc độ: ${inputs.pacingWpm || 105} WPM.`}
                    />
                  </label>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 font-mono border border-emerald-500/20 shrink-0 whitespace-nowrap">
                    {inputs.pacingWpm || 105} WPM
                  </span>
                </div>
                <div className="space-y-2">
                  <select
                    id="select-region-voice-preset"
                    value={inputs.regionAccent || "south"}
                    onChange={(e) => {
                      const selectedRegion = e.target.value as "south" | "north" | "central" | "west";
                      const newMatched = matchRegionalVoice(
                        selectedRegion,
                        inputs.characterGender || "Vietnamese female",
                        inputs.characterAge || inputs.femaleAge || "25-34"
                      );
                      onChange({
                        ...inputs,
                        regionAccent: selectedRegion,
                        pacingWpm: newMatched.pacingWpm,
                        voice: newMatched.voice,
                      });
                    }}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-400 cursor-pointer font-medium"
                  >
                    {REGIONAL_ACCENT_OPTIONS.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.icon ? `${r.icon} ` : ""}{r.label}
                      </option>
                    ))}
                  </select>

                  <input
                    id="input-voice"
                    type="text"
                    value={inputs.voice}
                    onChange={(e) => onChange({ ...inputs, voice: e.target.value })}
                    placeholder="Mô tả chất giọng, độ tuổi, wpm, tone..."
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-300 placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-all font-mono"
                  />
                </div>
              </>
            );
          })()}
        </div>

        {/* 5. Đối tượng xem */}
        <div className="space-y-1.5">
          <label className="flex items-center justify-between text-xs font-bold text-slate-200 flex-nowrap gap-1">
            <span className="flex items-center space-x-1.5 whitespace-nowrap">
              <span className="w-4 h-4 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black flex items-center justify-center shrink-0">
                5a
              </span>
              <span>Đối tượng xem (Target Audience)</span>
              <span className="text-rose-400 font-bold shrink-0">*</span>
              <HelpTooltip
                variant="warning"
                className="shrink-0"
                title="Lưu ý về Đối tượng xem"
                text="Trường bắt buộc: Vui lòng nhập đối tượng người xem (không cần ghi tuổi vì đã thiết lập ở mục Độ tuổi bên cạnh)."
              />
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-950/70 text-rose-300 border border-rose-500/30 font-medium shrink-0 whitespace-nowrap">
              Bắt buộc
            </span>
          </label>
          <input
            id="input-target-audience"
            type="text"
            required
            value={inputs.targetAudience}
            onChange={(e) => onChange({ ...inputs, targetAudience: e.target.value })}
            placeholder="Ví dụ: Người bị trào ngược, ợ chua, viêm loét dạ dày, dân văn phòng hay thức khuya, người stress ăn uống thất thường..."
            className={`w-full bg-slate-950 border rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none transition-all ${
              !inputs.targetAudience?.trim()
                ? "border-rose-500/60 focus:border-rose-400 focus:ring-1 focus:ring-rose-400"
                : "border-slate-700/80 focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
            }`}
          />
        </div>

        {/* 6. Bối cảnh */}
        <div className="space-y-1.5">
          <label className="flex items-center justify-between text-xs font-bold text-slate-200">
            <span className="flex items-center space-x-1.5">
              <span className="w-4 h-4 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black flex items-center justify-center">
                5b
              </span>
              <span>Bối cảnh môi trường (Setting & Context)</span>
            </span>
          </label>
          <input
            id="input-context"
            type="text"
            value={inputs.context}
            onChange={(e) => onChange({ ...inputs, context: e.target.value })}
            placeholder="Bàn làm việc ban đêm, phòng ngủ ấm áp, mô phỏng dạ dày phát sáng 3D..."
            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all"
          />
        </div>

        {/* 5c. Nhân vật chính: Độ tuổi & Giới tính (Shortcodes: [characterAge], [characterGender]) */}
        <div className="space-y-2.5 p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
          <div className="flex items-center justify-between">
            <label className="flex items-center space-x-1.5 text-xs font-semibold text-slate-200">
              <span className="w-4 h-4 rounded-full bg-slate-800 text-slate-300 text-[10px] font-bold flex items-center justify-center">
                5c
              </span>
              <span>Nhân vật chính (Độ tuổi & Giới tính)</span>
            </label>
            <span className="text-[10px] text-slate-500 font-mono">[characterAge] • [characterGender]</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Độ tuổi Nhân vật */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-300 flex items-center space-x-1">
                <span>🎂 Độ tuổi</span>
              </label>
              <input
                id="input-character-age-main"
                type="text"
                value={inputs.characterAge || inputs.femaleAge || ""}
                onChange={(e) => {
                  const val = e.target.value;
                  const matched = matchRegionalVoice(
                    inputs.regionAccent || "south",
                    inputs.characterGender || "Vietnamese female",
                    val
                  );
                  onChange({
                    ...inputs,
                    characterAge: val,
                    femaleAge: val,
                    voice: matched.voice,
                    pacingWpm: matched.pacingWpm,
                  });
                }}
                placeholder="Ví dụ: 25-34 hoặc 28"
                className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-all font-medium"
              />
              {/* Quick Age chips */}
              <div className="flex items-center space-x-1.5 pt-0.5">
                {["18-24", "25-34", "35-45", "55-70"].map((ageRange) => (
                  <button
                    key={ageRange}
                    type="button"
                    onClick={() => {
                      const matched = matchRegionalVoice(
                        inputs.regionAccent || "south",
                        inputs.characterGender || "Vietnamese female",
                        ageRange
                      );
                      onChange({
                        ...inputs,
                        characterAge: ageRange,
                        femaleAge: ageRange,
                        voice: matched.voice,
                        pacingWpm: matched.pacingWpm,
                      });
                    }}
                    className={`px-2 py-0.5 text-[9px] rounded font-mono border transition-all cursor-pointer ${
                      (inputs.characterAge || inputs.femaleAge) === ageRange
                        ? "bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold"
                        : "bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200"
                    }`}
                  >
                    {ageRange}
                  </button>
                ))}
              </div>
            </div>

            {/* Giới tính Nhân vật */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-300 flex items-center space-x-1">
                <span>👤 Giới tính & Nhân khẩu học</span>
              </label>
              <select
                id="select-character-gender-main"
                value={inputs.characterGender || "Vietnamese female"}
                onChange={(e) => {
                  const updatedGender = e.target.value;
                  const matched = matchRegionalVoice(
                    inputs.regionAccent || "south",
                    updatedGender,
                    inputs.characterAge || inputs.femaleAge || "25-34"
                  );
                  onChange({
                    ...inputs,
                    characterGender: updatedGender,
                    voice: matched.voice,
                    pacingWpm: matched.pacingWpm,
                  });
                }}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-400 transition-all cursor-pointer font-medium"
              >
                {CHARACTER_GENDER_OPTIONS.map((g) => (
                  <option key={g.id} value={g.value}>
                    {g.label}
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-slate-500 pt-0.5">
                Tự động đồng bộ giọng đọc và hình ảnh nhân vật theo giới tính & tuổi.
              </p>
            </div>
          </div>

          {/* Dynamic Character Appearance Preview & Customization (Face, Hair, Outfit) */}
          {(() => {
            const dynamicChar = getDynamicCharacterProfile(
              inputs.characterGender || "Vietnamese female",
              inputs.characterAge || inputs.femaleAge || "25-34"
            );
            return (
              <div className="mt-2.5 p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 text-[11px] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5 font-bold text-amber-300">
                    <span>✨ Diện mạo chân thực (Giải phẫu người thật)</span>
                    <HelpTooltip
                      variant="tip"
                      title="Mô tả diện mạo nhân vật"
                      text="Khắc phục hoàn toàn lỗi búp bê nhựa. Bạn có thể để trống các ô để AI tự động kích hoạt bộ mô tả giải phẫu người thật tối ưu theo tuổi và giới tính."
                    />
                  </div>
                  {(inputs.characterFace || inputs.characterHair || inputs.characterOutfit) ? (
                    <button
                      type="button"
                      onClick={() => onChange({ ...inputs, characterFace: "", characterHair: "", characterOutfit: "" })}
                      className="text-[10px] text-amber-400 hover:text-amber-300 underline cursor-pointer"
                    >
                      Đặt lại mặc định
                    </button>
                  ) : (
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Tự động kích hoạt
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <span className="text-[10px] font-semibold text-slate-400 block">Khuôn mặt ([characterFace]):</span>
                    <input
                      type="text"
                      value={inputs.characterFace || ""}
                      onChange={(e) => onChange({ ...inputs, characterFace: e.target.value })}
                      placeholder={dynamicChar.face}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-[10px] text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-semibold text-slate-400 block">Kiểu tóc ([characterHair]):</span>
                    <input
                      type="text"
                      value={inputs.characterHair || ""}
                      onChange={(e) => onChange({ ...inputs, characterHair: e.target.value })}
                      placeholder={dynamicChar.hair}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-[10px] text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-semibold text-slate-400 block">Trang phục ([characterOutfit]):</span>
                    <input
                      type="text"
                      value={inputs.characterOutfit || ""}
                      onChange={(e) => onChange({ ...inputs, characterOutfit: e.target.value })}
                      placeholder={dynamicChar.outfit}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-[10px] text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono"
                    />
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* Advanced Mascot & Consistency Parameters Toggle */}
      <div className="pt-2 border-t border-slate-800">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center space-x-2 text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
          >
            <span>{showAdvanced ? "▼ Ẩn tùy chỉnh Mascot & Quy tắc bắt buộc" : "▶ Tùy chỉnh Mascot & 3 Quy tắc bắt buộc (Hình ảnh, Âm thanh, Video)"}</span>
            {inputs.useMascot !== false ? (
              <span className="px-2 py-0.5 text-[10px] bg-amber-500/15 text-amber-300 rounded-full border border-amber-500/30 font-bold">
                Mascot: [{inputs.mascotName || "Trà Dây Bstar"}]
              </span>
            ) : (
              <span className="px-2 py-0.5 text-[10px] bg-slate-800 text-slate-400 rounded-full border border-slate-700">
                Tắt Mascot
              </span>
            )}
          </button>

          {onOpenSettingsModal && (
            <button
              type="button"
              onClick={() => onOpenSettingsModal("presets")}
              className="text-[11px] text-slate-400 hover:text-amber-300 flex items-center space-x-1 cursor-pointer transition-colors"
            >
              <Settings className="w-3 h-3 text-amber-400" />
              <span>Chỉnh sửa toàn diện trong Template</span>
            </button>
          )}
        </div>

        {showAdvanced && (
          <div className="mt-3 p-4 bg-slate-950/90 border border-slate-800 rounded-xl space-y-4">
            {/* Mascot Toggle & Shield Name */}
            <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-3">
              <label className="flex items-center space-x-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={inputs.useMascot !== false}
                  onChange={(e) => onChange({ ...inputs, useMascot: e.target.checked })}
                  className="w-4 h-4 text-amber-500 bg-slate-900 border-slate-700 rounded focus:ring-amber-400 cursor-pointer"
                />
                <span className="text-xs font-bold text-slate-200">
                  Kích hoạt Nhân vật Mascot 3D (Giọt nước vàng dũng cảm & Khiên bảo vệ)
                </span>
              </label>

              {inputs.useMascot !== false && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                      Chữ khắc trên Khiên Vàng Mascot:
                    </label>
                    <input
                      type="text"
                      value={inputs.mascotName}
                      onChange={(e) => onChange({ ...inputs, mascotName: e.target.value })}
                      placeholder="Ví dụ: Trà Dây Bstar"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-amber-300 font-bold focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                      Độ tuổi Nhân vật ([characterAge]):
                    </label>
                    <input
                      type="text"
                      value={inputs.characterAge || inputs.femaleAge || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        onChange({ ...inputs, characterAge: val, femaleAge: val });
                      }}
                      placeholder="25-34"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                      Giới tính Nhân vật ([characterGender]):
                    </label>
                    <select
                      value={inputs.characterGender || "Vietnamese female"}
                      onChange={(e) => onChange({ ...inputs, characterGender: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-400 cursor-pointer"
                    >
                      <option value="Vietnamese female">Nữ (Vietnamese female)</option>
                      <option value="Vietnamese male">Nam (Vietnamese male)</option>
                      <option value="Young adult Vietnamese female (20-28)">Nữ trẻ (20-28)</option>
                      <option value="Young adult Vietnamese male (20-28)">Nam trẻ (20-28)</option>
                      <option value="Middle-aged Vietnamese female (35-50)">Nữ trung niên (35-50)</option>
                      <option value="Middle-aged Vietnamese male (35-50)">Nam trung niên (35-50)</option>
                      <option value="Senior Vietnamese woman (55-70)">Nữ lớn tuổi (55-70)</option>
                      <option value="Senior Vietnamese man (55-70)">Nam lớn tuổi (55-70)</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* 3 Mandatory Rules Badges */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
              <div className="p-2.5 bg-purple-950/30 border border-purple-500/30 rounded-lg">
                <div className="text-[11px] font-bold text-purple-300 mb-1 flex items-center space-x-1">
                  <span>🖼️</span>
                  <span>Bắt Buộc Hình Ảnh:</span>
                </div>
                <p className="text-[10.5px] text-slate-300 line-clamp-3">
                  {inputs.mandatoryImageRules || "Tỷ lệ 9:16, Khóa nhân vật 100%, Style 3D Pixar, Cấm chữ rác."}
                </p>
              </div>

              <div className="p-2.5 bg-sky-950/30 border border-sky-500/30 rounded-lg">
                <div className="text-[11px] font-bold text-sky-300 mb-1 flex items-center space-x-1">
                  <span>🎙️</span>
                  <span>Bắt Buộc Âm Thanh:</span>
                </div>
                <p className="text-[10.5px] text-slate-300 line-clamp-3">
                  {inputs.mandatoryAudioRules || "Khóa danh tính giọng đọc, 85-110 WPM, Ngắt nghỉ 0.2-0.5s, Safe words."}
                </p>
              </div>

              <div className="p-2.5 bg-amber-950/30 border border-amber-500/30 rounded-lg">
                <div className="text-[11px] font-bold text-amber-300 mb-1 flex items-center space-x-1">
                  <span>🎬</span>
                  <span>Bắt Buộc Video & VEO3:</span>
                </div>
                <p className="text-[10.5px] text-slate-300 line-clamp-3">
                  {inputs.mandatoryVideoRules || "Dọc 9:16, 4-8s mỗi cảnh, Cinematic Camera, Không biến dạng."}
                </p>
              </div>
            </div>

            {/* Storyboard & Thumbnail Prompt Template Configuration */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
              <button
                type="button"
                onClick={() => setShowPromptAccordions(!showPromptAccordions)}
                className="w-full px-3.5 py-2.5 flex items-center justify-between text-left hover:bg-slate-900/60 transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <Grid3X3 className="w-3.5 h-3.5 text-purple-400" />
                  <span className="text-xs font-bold text-slate-200">
                    Tùy chỉnh Prompt Storyboard (Bước 2) & Thumbnail (Bước 4)
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 bg-purple-950/60 text-purple-300 border border-purple-500/30 rounded">
                    Lưới dọc 9:16 & Stop Scroll
                  </span>
                </div>
                <div className="flex items-center space-x-1.5 text-slate-400 text-xs">
                  <span>{showPromptAccordions ? "Thu gọn" : "Mở rộng để chỉnh sửa"}</span>
                  {showPromptAccordions ? (
                    <ChevronUp className="w-3.5 h-3.5 text-purple-400" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  )}
                </div>
              </button>

              {showPromptAccordions && (
                <div className="p-3 border-t border-slate-800 space-y-3 bg-slate-900/40">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="p-3 bg-purple-950/20 border border-purple-500/30 rounded-xl space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1.5 text-xs font-bold text-purple-300">
                          <Grid3X3 className="w-3.5 h-3.5 text-purple-400" />
                          <span>Prompt Storyboard (Lưới 5 Khung 9:16):</span>
                        </div>
                        <span className="text-[10px] px-1.5 py-0.2 bg-purple-950/80 text-purple-300 rounded border border-purple-500/30">
                          Bước 2
                        </span>
                      </div>
                      <textarea
                        rows={5}
                        value={inputs.storyboardPromptTemplate || DEFAULT_STORYBOARD_PROMPT_TEMPLATE}
                        onChange={(e) => onChange({ ...inputs, storyboardPromptTemplate: e.target.value })}
                        className="w-full bg-slate-950 border border-purple-500/30 focus:border-purple-400 rounded-lg p-2 text-xs font-mono text-slate-200 outline-none leading-relaxed resize-y"
                        placeholder="Cấu trúc prompt tạo Storyboard..."
                      />
                    </div>

                    <div className="p-3 bg-pink-950/20 border border-pink-500/30 rounded-xl space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1.5 text-xs font-bold text-pink-300">
                          <ImageIcon className="w-3.5 h-3.5 text-pink-400" />
                          <span>Prompt Thumbnail (Stop The Scroll):</span>
                        </div>
                        <span className="text-[10px] px-1.5 py-0.2 bg-pink-950/80 text-pink-300 rounded border border-pink-500/30">
                          Bước 4
                        </span>
                      </div>
                      <textarea
                        rows={5}
                        value={inputs.thumbnailPromptTemplate || DEFAULT_THUMBNAIL_PROMPT_TEMPLATE}
                        onChange={(e) => onChange({ ...inputs, thumbnailPromptTemplate: e.target.value })}
                        className="w-full bg-slate-950 border border-pink-500/30 focus:border-pink-400 rounded-lg p-2 text-xs font-mono text-slate-200 outline-none leading-relaxed resize-y"
                        placeholder="Cấu trúc prompt tạo Thumbnail..."
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* CTA Action */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center space-x-2 text-xs text-slate-400">
          <Info className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Sẵn sàng chạy BƯỚC 1: Lời thoại & Chiến lược kịch bản</span>
        </div>

        <button
          id="btn-generate-step-1"
          onClick={() => {
            if (!inputs.targetAudience?.trim()) {
              const el = document.getElementById("input-target-audience");
              if (el) {
                el.focus();
                el.scrollIntoView({ behavior: "smooth", block: "center" });
              }
              return;
            }
            onStartStep1();
          }}
          disabled={isGenerating}
          className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-emerald-500 hover:from-amber-300 hover:to-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isGenerating ? (
            <>
              <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
              <span>AI Đang Soạn Bước 1...</span>
            </>
          ) : (
            <>
              <Wand2 className="w-4 h-4" />
              <span>Bắt Đầu BƯỚC 1: Lời Thoại & Chiến Lược</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
