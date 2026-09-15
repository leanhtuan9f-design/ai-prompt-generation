import React, { useState, useEffect } from "react";
import {
  Settings,
  Key,
  Cpu,
  Sliders,
  CheckCircle,
  AlertCircle,
  Sparkles,
  X,
  ExternalLink,
  RefreshCw,
  Layers,
  Clock,
  RotateCcw,
  Zap,
  ShieldAlert,
  Save,
  Check,
  Plus,
  Edit2,
  Trash2,
  Copy,
  Star,
  Tag,
  FileText,
  Volume2,
  Palette,
  Users,
  Shield,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  Info,
  Image as ImageIcon,
  Mic,
  Video,
  Film,
  Grid3X3,
  LayoutGrid,
  Search,
  Filter,
  CheckSquare,
  Square,
  Wand2,
  DollarSign,
  BadgePercent,
  Maximize2,
  MessageSquare,
  Globe,
  Server,
  Eye,
  EyeOff,
  Link2,
  Terminal,
  CheckCircle2,
  CloudLightning,
  HelpCircle,
} from "lucide-react";
import { OPENROUTER_API_URL, testCustomApiConnection, normalizeOpenAiEndpoint } from "../services/api";
import { SystemSettings, DEFAULT_SYSTEM_SETTINGS } from "../types/settings";
import { PromptTemplate } from "../types/template";
import { PromptFieldEditorModal, PromptFieldEditorModalProps } from "./PromptFieldEditorModal";
import { ImportExportRulesPromptsModal } from "./ImportExportRulesPromptsModal";
import {
  PRESET_OPENROUTER_MODELS,
  fetchLiveOpenRouterModels,
  formatModelPrice,
  OpenRouterModelItem,
} from "../data/openRouterModels";
import {
  getStoredTemplates,
  saveOrUpdateTemplate,
  deleteStoredTemplate,
  resetToBuiltInTemplates,
  getDefaultTemplateId,
  setDefaultTemplateId,
  BUILTIN_PROMPT_TEMPLATES,
} from "../utils/templateStorage";
import {
  DEFAULT_INPUTS,
  DEFAULT_MASCOT_PROMPT,
  DEFAULT_GLOBAL_SAFETY_RULES,
  DEFAULT_GLOBAL_CHARACTER_RULES,
  DEFAULT_SLANG_WORDS,
  DEFAULT_SAFE_WORDS,
  DEFAULT_PADDING_WORDS,
  DEFAULT_MANDATORY_IMAGE_RULES,
  DEFAULT_MANDATORY_AUDIO_RULES,
  DEFAULT_MANDATORY_VIDEO_RULES,
  DEFAULT_DIALOGUE_PROMPT_TEMPLATE,
  DEFAULT_IMAGE_PROMPT_TEMPLATE,
  DEFAULT_SCENE_PROMPT_TEMPLATE,
  DEFAULT_VIDEO_PROMPT_TEMPLATE,
  DEFAULT_VEO_PROMPT_TEMPLATE,
  DEFAULT_VIDEO_STYLE_PROMPT,
  DEFAULT_STORYBOARD_PROMPT_TEMPLATE,
  DEFAULT_THUMBNAIL_PROMPT_TEMPLATE,
} from "../data/constants";

export const OPENROUTER_MODELS = PRESET_OPENROUTER_MODELS;

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: (settings: SystemSettings) => void;
  initialTab?: "ai" | "threading" | "presets";
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onSaved,
  initialTab = "ai",
}) => {
  const [activeTab, setActiveTab] = useState<"ai" | "threading" | "presets">(initialTab);
  const [settings, setSettings] = useState<SystemSettings>(() => {
    const localKey = localStorage.getItem("custom_openrouter_api_key") || "";
    const localModel = localStorage.getItem("custom_openrouter_model") || "anthropic/claude-3.5-sonnet";
    const localWritingModel = localStorage.getItem("custom_openrouter_writing_model") || "anthropic/claude-3.5-sonnet";
    const localImageModel = localStorage.getItem("custom_openrouter_image_model") || "openai/gpt-4o";
    const localUseSeparate = localStorage.getItem("use_separate_models") !== "false";
    const localProvider = (localStorage.getItem("selected_ai_provider") as any) || (localKey ? "openrouter" : "gemini");
    const localConcurrency = parseInt(localStorage.getItem("batch_concurrency") || "3", 10);
    const localRetry = parseInt(localStorage.getItem("batch_retry_attempts") || "2", 10);
    const localDelay = parseInt(localStorage.getItem("batch_delay_ms") || "350", 10);
    const localAutoSave = localStorage.getItem("batch_auto_save_history") !== "false";
    const localDefaultTplId = getDefaultTemplateId();

    const localCustomKey = localStorage.getItem("custom_api_key") || "";
    const localCustomBaseUrl = localStorage.getItem("custom_base_url") || "https://api.openai.com/v1";
    const localCustomModel = localStorage.getItem("custom_model_id") || "gpt-4o";
    const localCustomWritingModel = localStorage.getItem("custom_writing_model_id") || "gpt-4o";
    const localCustomImageModel = localStorage.getItem("custom_image_model_id") || "gpt-4o";
    const localCustomUseSeparate = localStorage.getItem("custom_use_separate_models") === "true";

    return {
      ...DEFAULT_SYSTEM_SETTINGS,
      openRouterApiKey: localKey,
      openRouterModel: localModel,
      openRouterWritingModel: localWritingModel,
      openRouterImageModel: localImageModel,
      useSeparateModels: localUseSeparate,
      customApiKey: localCustomKey,
      customBaseUrl: localCustomBaseUrl,
      customModelId: localCustomModel,
      customWritingModelId: localCustomWritingModel,
      customImageModelId: localCustomImageModel,
      customUseSeparateModels: localCustomUseSeparate,
      aiProvider: localProvider,
      concurrency: isNaN(localConcurrency) ? 3 : Math.max(1, Math.min(10, localConcurrency)),
      retryAttempts: isNaN(localRetry) ? 2 : Math.max(0, Math.min(5, localRetry)),
      delayBetweenStepsMs: isNaN(localDelay) ? 350 : localDelay,
      autoSaveToHistory: localAutoSave,
      defaultTemplateId: localDefaultTplId,
    };
  });

  // OpenRouter Models State
  const [modelList, setModelList] = useState<OpenRouterModelItem[]>(PRESET_OPENROUTER_MODELS);
  const [isFetchingLiveModels, setIsFetchingLiveModels] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [modelFilterProvider, setModelFilterProvider] = useState<string>("all");
  const [modelSearchText, setModelSearchText] = useState("");

  // Direct Manual Model ID Input State
  const [manualModelInput, setManualModelInput] = useState("");
  const [isTestingManual, setIsTestingManual] = useState(false);
  const [manualTestResult, setManualTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Custom Model text inputs if custom ID selected in dropdowns
  const [customModelInput, setCustomModelInput] = useState("");
  const [customWritingModelInput, setCustomWritingModelInput] = useState("");
  const [customImageModelInput, setCustomImageModelInput] = useState("");

  // Template Management State
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [editingTemplate, setEditingTemplate] = useState<PromptTemplate | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [templateNotification, setTemplateNotification] = useState<string | null>(null);
  const [expandedPromptsMap, setExpandedPromptsMap] = useState<Record<string, boolean>>({});
  const [copiedPromptKey, setCopiedPromptKey] = useState<string | null>(null);

  // Active popup editor configuration
  const [activePopupConfig, setActivePopupConfig] = useState<PromptFieldEditorModalProps | null>(null);
  const [isImportExportModalOpen, setIsImportExportModalOpen] = useState(false);

  const openMascotPromptPopup = () => {
    if (!editingTemplate) return;
    setActivePopupConfig({
      isOpen: true,
      onClose: () => setActivePopupConfig(null),
      title: "Đặc tả Prompt Mascot 3D (Tiếng Anh)",
      subtitle: "Tạo hình nhân vật Mascot 3D phong cách Pixar, tự động thay thế [mascotName]",
      badge: "Mascot 3D",
      colorTheme: "amber",
      icon: <Sparkles className="w-5 h-5" />,
      initialValue: editingTemplate.data.mascotPrompt || DEFAULT_MASCOT_PROMPT,
      defaultValue: DEFAULT_MASCOT_PROMPT,
      placeholder: "3D Pixar style, a heroic character made of a glowing plump golden liquid drop...",
      variableTokens: [
        { token: "[mascotName]", label: "Tên Mascot", description: "Tên hoặc chữ khắc trên khiên" },
        { token: "[femaleAge]", label: "Tuổi nhân vật", description: "Độ tuổi của nhân vật chính" },
      ],
      helperText: "Giữ biến [mascotName] để AI tự động điền tên thương hiệu/khiên vàng vào prompt tạo hình Mascot.",
      isMonospace: true,
      onSave: (val) => {
        setEditingTemplate((prev) => (prev ? { ...prev, data: { ...prev.data, mascotPrompt: val } } : null));
      },
    });
  };

  const openCoreContentPopup = () => {
    if (!editingTemplate) return;
    const defaultCore = BUILTIN_PROMPT_TEMPLATES.find((t) => t.id === editingTemplate.id)?.data.coreContent || "";
    setActivePopupConfig({
      isOpen: true,
      onClose: () => setActivePopupConfig(null),
      title: "1. Cấu trúc Nội Dung Cốt Lõi (3 Nỗi Đau & 3 Giải Pháp Mẫu)",
      subtitle: "Định hình cấu trúc nỗi đau chính và giải pháp tuần tự (2 tự nhiên + 1 thảo mộc)",
      badge: "Cấu trúc Kịch bản",
      colorTheme: "emerald",
      icon: <FileText className="w-5 h-5" />,
      initialValue: editingTemplate.data.coreContent || "",
      defaultValue: defaultCore,
      placeholder: "Vấn đề và nguyên nhân khoa học... 3 Giải pháp (2 giải pháp tự nhiên + 1 giải pháp thảo mộc)...",
      helperText: "Khung sườn cốt lõi giúp AI bám sát các triệu chứng y khoa và logic tư vấn tuần tự.",
      isMonospace: false,
      onSave: (val) => {
        setEditingTemplate((prev) => (prev ? { ...prev, data: { ...prev.data, coreContent: val } } : null));
      },
    });
  };

  const openSlangAndPaddingPopup = () => {
    if (!editingTemplate) return;
    setActivePopupConfig({
      isOpen: true,
      onClose: () => setActivePopupConfig(null),
      title: "Quy tắc từ Lóng Vùng Miền & Vùng Đệm Chuyên Môn",
      subtitle: "Tăng tính gần gũi bản địa và đệm từ chuyên môn tránh vi phạm chính sách y tế",
      badge: "Quy Tắc Từ Lóng & Vùng Đệm",
      colorTheme: "indigo",
      icon: <Tag className="w-5 h-5" />,
      initialValue: editingTemplate.data.customSlangWords || DEFAULT_SLANG_WORDS,
      defaultValue: DEFAULT_SLANG_WORDS,
      placeholder: "Miền Nam: xao xuyến, ê hề, rần rần...",
      secondaryTitle: "Quy tắc đệm từ chuyên môn (Medical Buffer / Padding Rule):",
      secondaryInitialValue: editingTemplate.data.customPaddingWords || DEFAULT_PADDING_WORDS,
      secondaryDefaultValue: DEFAULT_PADDING_WORDS,
      secondaryPlaceholder: "Ví dụ: hợp chất tự nhiên Flavonoid, cơ chế xoa dịu...",
      variableTokens: [
        { token: "[regionAccent]", label: "Vùng miền", description: "Miền Nam (Sài Gòn), Miền Bắc, Miền Trung, Miền Tây" },
        { token: "[brand]", label: "Tên thương hiệu", description: "Tên sản phẩm thương hiệu (Trà Dây Bstar...)" },
        { token: "[safeWords]", label: "Từ an toàn", description: "Bảng từ an toàn thay thế từ cấm y tế" },
        { token: "[slangWords]", label: "Từ lóng", description: "Danh mục từ lóng bản địa theo vùng miền" },
        { token: "[paddingWords]", label: "Vùng đệm từ", description: "Quy tắc đệm từ chuyên môn y học tự nhiên" },
      ],
      helperText: "Từ lóng giúp lời thoại tự nhiên theo vùng miền; từ đệm giúp nội dung chuẩn khoa học y tế. Có thể dùng shortcode [regionAccent], [brand] để cá nhân hóa.",
      isMonospace: true,
      onSave: (val) => {
        setEditingTemplate((prev) => (prev ? { ...prev, data: { ...prev.data, customSlangWords: val } } : null));
      },
      onSaveSecondary: (val) => {
        setEditingTemplate((prev) => (prev ? { ...prev, data: { ...prev.data, customPaddingWords: val } } : null));
      },
    });
  };

  const openGlobalSafetyRulesPopup = () => {
    if (!editingTemplate) return;
    setActivePopupConfig({
      isOpen: true,
      onClose: () => setActivePopupConfig(null),
      title: "1. [GLOBAL SAFETY & BRAND RULES] (Quy Tắc An Toàn & Thương Hiệu)",
      subtitle: "Tuân thủ chính sách quảng cáo FB/TikTok/YouTube/Google Ads, CẤM gore/máu me/nội tạng, minh họa y khoa 3D Pixar",
      badge: "Global Safety & Brand",
      colorTheme: "emerald",
      icon: <Shield className="w-5 h-5" />,
      initialValue: editingTemplate.data.globalSafetyRules || DEFAULT_GLOBAL_SAFETY_RULES,
      defaultValue: DEFAULT_GLOBAL_SAFETY_RULES,
      placeholder: "All generated content must remain fully compliant with advertising policies...",
      variableTokens: [
        { token: "[brand]", label: "Tên thương hiệu", description: "Tên thương hiệu / sản phẩm (Trà Dây Bstar)" },
        { token: "[mascotName]", label: "Tên Mascot", description: "Tên thương hiệu khắc trên khiên vàng" },
        { token: "[aspectRatio]", label: "Tỷ lệ khung hình", description: "Tỷ lệ video (9:16 hoặc 16:9)" },
        { token: "[videoStyle]", label: "Style Visual", description: "Phong cách 3D Pixar, ánh sáng volumetric" },
        { token: "[safeWords]", label: "Từ an toàn", description: "Bảng từ an toàn thay thế từ cấm y tế" },
        { token: "[targetAudience]", label: "Khán giả mục tiêu", description: "Đối tượng người xem mục tiêu" },
      ],
      helperText: "Bắt buộc áp dụng cho toàn bộ nội dung kịch bản, lời thoại, hình ảnh và video. Bạn có thể chèn các shortcode [brand], [mascotName], [aspectRatio], [safeWords] để tự động hóa.",
      isMonospace: true,
      onSave: (val) => {
        setEditingTemplate((prev) => (prev ? { ...prev, data: { ...prev.data, globalSafetyRules: val } } : null));
      },
    });
  };

  const openGlobalCharacterRulesPopup = () => {
    if (!editingTemplate) return;
    setActivePopupConfig({
      isOpen: true,
      onClose: () => setActivePopupConfig(null),
      title: "2. [GLOBAL CHARACTER CONSISTENCY RULES] (Quy Tắc Đồng Nhất Nhân Vật)",
      subtitle: "Khóa 100% diện mạo, tóc, trang phục, tỷ lệ cơ thể và tuổi tác qua từng cảnh quay",
      badge: "Character Consistency",
      colorTheme: "amber",
      icon: <Users className="w-5 h-5" />,
      initialValue: editingTemplate.data.globalCharacterRules || DEFAULT_GLOBAL_CHARACTER_RULES,
      defaultValue: DEFAULT_GLOBAL_CHARACTER_RULES,
      placeholder: "All recurring characters must remain visually IDENTICAL across every scene...",
      variableTokens: [
        { token: "[characterRules]", label: "Quy tắc nhân vật", description: "Toàn bộ quy tắc khóa đồng nhất nhân vật" },
        { token: "[characterAge]", label: "Tuổi nhân vật", description: "Độ tuổi của nhân vật chính (ví dụ 25-34, 28 tuổi)" },
        { token: "[characterGender]", label: "Giới tính nhân vật", description: "Giới tính nhân vật chính (ví dụ: Vietnamese female, Nữ, Nam)" },
        { token: "[characterOutfit]", label: "Trang phục Nữ chính", description: "Áo thun xanh lá nhạt trơn, quần thoải mái" },
        { token: "[characterHair]", label: "Kiểu tóc", description: "Tóc đen dài buộc nhẹ tự nhiên" },
        { token: "[characterFace]", label: "Gương mặt & biểu cảm", description: "3D Pixar mắt to biểu cảm, da mịn sáng, bụng phẳng" },
        { token: "[mascot]", label: "Mascot 3D / Linh vật", description: "Toàn bộ đoạn prompt đặc tả Mascot 3D kèm tên thương hiệu trên khiên vàng" },
        { token: "[mascotName]", label: "Tên Mascot", description: "Tên thương hiệu trên khiên vàng" },
        { token: "[mascotDescription]", label: "Mô tả Mascot", description: "Toàn bộ đoạn prompt tạo hình Mascot 3D" },
        { token: "[aspectRatio]", label: "Tỷ lệ khung hình", description: "Tỷ lệ 9:16 hoặc 16:9" },
        { token: "[videoStyle]", label: "Style Visual", description: "Phong cách 3D Pixar, màu sắc, ánh sáng" },
      ],
      helperText: "Đảm bảo nhân vật chính và Mascot giữ nguyên vẹn 100% qua tất cả các phân cảnh, không bị trôi phong cách. Sử dụng [characterAge], [characterGender], [mascot], [mascotName] để liên kết.",
      isMonospace: true,
      onSave: (val) => {
        setEditingTemplate((prev) => (prev ? { ...prev, data: { ...prev.data, globalCharacterRules: val } } : null));
      },
    });
  };

  const openSafeWordsPopup = () => {
    if (!editingTemplate) return;
    setActivePopupConfig({
      isOpen: true,
      onClose: () => setActivePopupConfig(null),
      title: "3. QUY TẮC TỪ NGỮ AN TOÀN (SAFE WORDS RULES)",
      subtitle: "Bảng từ cấm y tế (thuốc, điều trị, chữa khỏi...) và các cụm từ thay thế an toàn",
      badge: "Safe Words Rules",
      colorTheme: "emerald",
      icon: <ShieldAlert className="w-5 h-5" />,
      initialValue: editingTemplate.data.customSafeWords || DEFAULT_SAFE_WORDS,
      defaultValue: DEFAULT_SAFE_WORDS,
      placeholder: "CẤM: Thuốc -> Thay bằng: Thảo mộc, Giải pháp tự nhiên...",
      variableTokens: [
        { token: "[brand]", label: "Tên thương hiệu", description: "Tên sản phẩm thương hiệu (Trà Dây Bstar...)" },
        { token: "[mascotName]", label: "Tên Mascot", description: "Tên thương hiệu trên khiên vàng" },
        { token: "[safeWords]", label: "Từ an toàn", description: "Bảng từ an toàn thay thế từ cấm y tế" },
        { token: "[paddingWords]", label: "Vùng đệm từ", description: "Quy tắc đệm từ chuyên môn" },
      ],
      helperText: "AI sẽ tuân thủ tuyệt đối quy tắc thay thế từ ngữ để video không bị quét bản quyền hoặc vi phạm chính sách. Chèn các shortcode để linh hoạt tùy biến.",
      isMonospace: true,
      onSave: (val) => {
        setEditingTemplate((prev) => (prev ? { ...prev, data: { ...prev.data, customSafeWords: val } } : null));
      },
    });
  };

  const openMandatoryImagePopup = () => {
    if (!editingTemplate) return;
    setActivePopupConfig({
      isOpen: true,
      onClose: () => setActivePopupConfig(null),
      title: "4. QUY TẮC HÌNH ẢNH AN TOÀN (SAFE IMAGES & MANDATORY IMAGE RULES)",
      subtitle: "Khóa tỷ lệ [aspectRatio], Khóa đồng nhất nhân vật, Style 3D Pixar, Cấm hình ảnh ghê rợn",
      badge: "Safe Images Rules",
      colorTheme: "purple",
      icon: <ImageIcon className="w-5 h-5" />,
      initialValue: editingTemplate.data.mandatoryImageRules || DEFAULT_MANDATORY_IMAGE_RULES,
      defaultValue: DEFAULT_MANDATORY_IMAGE_RULES,
      placeholder: "Nhập các quy tắc bắt buộc về hình ảnh...",
      variableTokens: [
        { token: "[aspectRatio]", label: "Tỷ lệ khung hình", description: "Tỷ lệ video (9:16 hoặc 16:9)" },
        { token: "[arOrientation]", label: "Định dạng khung hình", description: "portrait 9:16 format hoặc landscape 16:9 format" },
        { token: "[videoStyle]", label: "Style Visual", description: "Phong cách 3D Pixar, màu sắc, ánh sáng" },
        { token: "[characterAge]", label: "Tuổi nhân vật", description: "Độ tuổi nhân vật chính (25-34)" },
        { token: "[characterGender]", label: "Giới tính nhân vật", description: "Giới tính nhân vật (Vietnamese female/male)" },
        { token: "[mascot]", label: "Mascot 3D / Linh vật", description: "Toàn bộ đoạn prompt đặc tả Mascot 3D kèm tên thương hiệu trên khiên vàng" },
        { token: "[mascotName]", label: "Tên Mascot", description: "Tên thương hiệu trên khiên vàng" },
        { token: "[mascotDescription]", label: "Mô tả Mascot", description: "Toàn bộ đoạn prompt đặc tả Mascot 3D" },
      ],
      helperText: "Áp dụng cho Bước 2 (Prompt Tạo Ảnh Storyboard) và Bước 4 (Prompt Thumbnail). Sử dụng [aspectRatio], [videoStyle], [characterAge], [characterGender], [mascot] để tự động đồng bộ.",
      isMonospace: true,
      onSave: (val) => {
        setEditingTemplate((prev) => (prev ? { ...prev, data: { ...prev.data, mandatoryImageRules: val } } : null));
      },
    });
  };

  const openMandatoryAudioPopup = () => {
    if (!editingTemplate) return;
    setActivePopupConfig({
      isOpen: true,
      onClose: () => setActivePopupConfig(null),
      title: "5. Quy Tắc BẮT BUỘC Âm Thanh & Giọng Đọc (Mandatory Audio Rules)",
      subtitle: "Khóa danh tính giọng đọc, Tốc độ 85-110 WPM, Ngắt nghỉ 0.2-0.5s, <30 từ/cảnh",
      badge: "Âm Thanh 85-110 WPM",
      colorTheme: "sky",
      icon: <Mic className="w-5 h-5" />,
      initialValue: editingTemplate.data.mandatoryAudioRules || DEFAULT_MANDATORY_AUDIO_RULES,
      defaultValue: DEFAULT_MANDATORY_AUDIO_RULES,
      placeholder: "Nhập các quy tắc bắt buộc về âm thanh và giọng đọc...",
      variableTokens: [
        { token: "[voice]", label: "Đặc tả Giọng đọc", description: "Chi tiết giọng đọc VEO3, độ tuổi, tone, wpm" },
        { token: "[regionAccent]", label: "Vùng miền", description: "Miền Nam (Sài Gòn), Miền Bắc, Miền Trung, Miền Tây" },
        { token: "[pacingWpm]", label: "Tốc độ WPM", description: "Tốc độ đọc (85-110 wpm)" },
        { token: "[safeWords]", label: "Từ an toàn", description: "Bảng từ an toàn thay thế từ cấm y tế" },
        { token: "[slangWords]", label: "Từ lóng", description: "Danh mục từ lóng bản địa" },
        { token: "[paddingWords]", label: "Vùng đệm từ", description: "Quy tắc đệm từ chuyên môn" },
      ],
      helperText: "Đảm bảo tính chân thực, ấm áp và tốc độ nói phù hợp. Sử dụng [voice], [regionAccent], [pacingWpm], [safeWords] để tự động ràng buộc.",
      isMonospace: true,
      onSave: (val) => {
        setEditingTemplate((prev) => (prev ? { ...prev, data: { ...prev.data, mandatoryAudioRules: val } } : null));
      },
    });
  };

  const openMandatoryVideoPopup = () => {
    if (!editingTemplate) return;
    setActivePopupConfig({
      isOpen: true,
      onClose: () => setActivePopupConfig(null),
      title: "6. Quy Tắc BẮT BUỘC Video & Chuyển Động (Mandatory Video Rules)",
      subtitle: "Chuẩn [aspectRatio] VEO3/Kling, Thời lượng 4-8s mỗi cảnh, Cinematic Camera, Không biến dạng",
      badge: "Chuẩn VEO3 / Kling",
      colorTheme: "amber",
      icon: <Video className="w-5 h-5" />,
      initialValue: editingTemplate.data.mandatoryVideoRules || DEFAULT_MANDATORY_VIDEO_RULES,
      defaultValue: DEFAULT_MANDATORY_VIDEO_RULES,
      placeholder: "Nhập các quy tắc bắt buộc về video và chuyển động...",
      variableTokens: [
        { token: "[aspectRatio]", label: "Tỷ lệ khung hình", description: "Tỷ lệ video (9:16 hoặc 16:9)" },
        { token: "[arOrientation]", label: "Định dạng khung hình", description: "portrait 9:16 format hoặc landscape 16:9 format" },
        { token: "[videoStyle]", label: "Style Visual", description: "Phong cách 3D Pixar, màu sắc, ánh sáng" },
        { token: "[characterAge]", label: "Tuổi nhân vật", description: "Độ tuổi của nhân vật chính" },
        { token: "[characterGender]", label: "Giới tính nhân vật", description: "Giới tính của nhân vật chính" },
        { token: "[mascot]", label: "Mascot 3D / Linh vật", description: "Toàn bộ đoạn prompt đặc tả Mascot 3D kèm tên thương hiệu trên khiên vàng" },
        { token: "[mascotName]", label: "Tên Mascot", description: "Tên thương hiệu trên khiên vàng" },
        { token: "[voice]", label: "Giọng đọc", description: "Đặc tả giọng đọc và diễn xuất âm thanh" },
      ],
      helperText: "Áp dụng vào Bước 3 (Chuyển động & Diễn xuất VEO3/Kling) cho từng phân cảnh. Sử dụng [aspectRatio], [videoStyle], [characterAge], [characterGender], [mascot], [mascotName] để đồng bộ.",
      isMonospace: true,
      onSave: (val) => {
        setEditingTemplate((prev) => (prev ? { ...prev, data: { ...prev.data, mandatoryVideoRules: val } } : null));
      },
    });
  };

  const openDialoguePromptPopup = () => {
    if (!editingTemplate) return;
    setActivePopupConfig({
      isOpen: true,
      onClose: () => setActivePopupConfig(null),
      title: "B1: Prompt tạo hội thoại",
      subtitle: "Quy tắc sinh kịch bản hội thoại 5 phân cảnh: Hook 3s, Nỗi đau, 3 Giải pháp, Từ lóng bản địa & Safe Words",
      badge: "B1: Prompt Hội Thoại",
      colorTheme: "sky",
      icon: <MessageSquare className="w-5 h-5" />,
      initialValue: editingTemplate.data.dialoguePromptTemplate || DEFAULT_DIALOGUE_PROMPT_TEMPLATE,
      defaultValue: DEFAULT_DIALOGUE_PROMPT_TEMPLATE,
      placeholder: "Nhập cấu trúc prompt tạo hội thoại 5 cảnh...",
      variableTokens: [
        { token: "[characterRules]", label: "Quy tắc nhân vật", description: "Toàn bộ quy tắc khóa đồng nhất nhân vật" },
        { token: "[characterAge]", label: "Tuổi nhân vật", description: "Độ tuổi của nhân vật chính" },
        { token: "[characterGender]", label: "Giới tính nhân vật", description: "Giới tính nhân vật chính" },
        { token: "[characterOutfit]", label: "Trang phục Nữ chính", description: "Áo thun xanh lá nhạt trơn" },
        { token: "[mascot]", label: "Mascot 3D / Linh vật", description: "Toàn bộ đoạn prompt đặc tả Mascot 3D kèm tên thương hiệu trên khiên vàng" },
        { token: "[mascotName]", label: "Tên Mascot", description: "Tên thương hiệu trên khiên vàng" },
        { token: "[voice]", label: "Đặc tả Giọng đọc", description: "Chất giọng, vùng miền, tốc độ WPM" },
        { token: "[safeWords]", label: "Từ an toàn", description: "Bảng từ an toàn thay thế từ cấm y tế" },
        { token: "[slangWords]", label: "Từ lóng", description: "Danh mục từ lóng bản địa" },
      ],
      helperText: "Sử dụng các biến số [characterRules], [characterAge], [characterGender], [mascot], [mascotName], [voice] để hệ thống tự động điền thông tin tương ứng khi sinh kịch bản.",
      isMonospace: true,
      onSave: (val) => {
        setEditingTemplate((prev) => (prev ? { ...prev, data: { ...prev.data, dialoguePromptTemplate: val } } : null));
      },
    });
  };

  const openStoryboardPromptPopup = () => {
    if (!editingTemplate) return;
    setActivePopupConfig({
      isOpen: true,
      onClose: () => setActivePopupConfig(null),
      title: "B2: Prompt tạo storyboard",
      subtitle: "Prompt tạo ảnh Storyboard Sheet / Master shot 9:16 chia 5 khung dọc tỷ lệ 9:16 khóa đồng nhất nhân vật 3D Pixar",
      badge: "B2: Prompt Storyboard",
      colorTheme: "purple",
      icon: <LayoutGrid className="w-5 h-5" />,
      initialValue:
        editingTemplate.data.storyboardPromptTemplate ||
        editingTemplate.data.imagePromptTemplate ||
        DEFAULT_STORYBOARD_PROMPT_TEMPLATE,
      defaultValue: DEFAULT_STORYBOARD_PROMPT_TEMPLATE,
      placeholder: "Nhập cấu trúc prompt tạo ảnh Storyboard sheet 9:16 mẫu...",
      variableTokens: [
        { token: "[characterRules]", label: "Quy tắc nhân vật", description: "Quy tắc khóa 100% diện mạo nhân vật" },
        { token: "[characterFace]", label: "Gương mặt & biểu cảm", description: "3D Pixar mắt to biểu cảm, da mịn sáng" },
        { token: "[characterHair]", label: "Kiểu tóc", description: "Tóc đen dài buộc nhẹ tự nhiên" },
        { token: "[characterOutfit]", label: "Trang phục Nữ chính", description: "Áo thun xanh lá nhạt trơn" },
        { token: "[characterAge]", label: "Tuổi nhân vật", description: "Độ tuổi của nhân vật chính" },
        { token: "[characterGender]", label: "Giới tính nhân vật", description: "Giới tính của nhân vật chính" },
        { token: "[mascot]", label: "Mascot 3D / Linh vật", description: "Toàn bộ đoạn prompt đặc tả Mascot 3D kèm tên thương hiệu trên khiên vàng" },
        { token: "[mascotName]", label: "Tên Mascot", description: "Tên thương hiệu trên khiên vàng" },
        { token: "[mascotDescription]", label: "Mô tả Mascot", description: "Toàn bộ đoạn prompt đặc tả Mascot 3D" },
        { token: "[aspectRatio]", label: "Tỷ lệ khung hình", description: "Tỷ lệ 9:16 hoặc 16:9" },
        { token: "[videoStyle]", label: "Style Visual", description: "Phong cách 3D Pixar, màu sắc, ánh sáng" },
      ],
      helperText: "Sử dụng các biến số [characterRules], [characterAge], [characterGender], [characterOutfit], [mascot], [mascotName] để hệ thống tự động điền thông tin tương ứng khi sinh prompt storyboard.",
      isMonospace: true,
      onSave: (val) => {
        setEditingTemplate((prev) =>
          prev
            ? {
                ...prev,
                data: {
                  ...prev.data,
                  storyboardPromptTemplate: val,
                  imagePromptTemplate: val,
                },
              }
            : null
        );
      },
    });
  };

  const openScenePromptPopup = () => {
    if (!editingTemplate) return;
    setActivePopupConfig({
      isOpen: true,
      onClose: () => setActivePopupConfig(null),
      title: "B3: Prompt tạo cảnh",
      subtitle: "Bộ Prompt chi tiết cho từng phân cảnh tĩnh độc lập & chuyển cảnh 9:16 (Scene 1..5/N+1) cho Midjourney / DALL-E / Flux",
      badge: "B3: Prompt Tạo Cảnh",
      colorTheme: "indigo",
      icon: <ImageIcon className="w-5 h-5" />,
      initialValue:
        editingTemplate.data.scenePromptTemplate ||
        editingTemplate.data.imagePromptTemplate ||
        DEFAULT_SCENE_PROMPT_TEMPLATE,
      defaultValue: DEFAULT_SCENE_PROMPT_TEMPLATE,
      placeholder: "Nhập cấu trúc prompt tạo cảnh N+1 chi tiết...",
      variableTokens: [
        { token: "[characterRules]", label: "Quy tắc nhân vật", description: "Quy tắc khóa 100% diện mạo nhân vật" },
        { token: "[characterFace]", label: "Gương mặt & biểu cảm", description: "3D Pixar mắt to biểu cảm, da mịn sáng" },
        { token: "[characterHair]", label: "Kiểu tóc", description: "Tóc đen dài buộc nhẹ tự nhiên" },
        { token: "[characterOutfit]", label: "Trang phục Nữ chính", description: "Áo thun xanh lá nhạt trơn" },
        { token: "[characterAge]", label: "Tuổi nhân vật", description: "Độ tuổi của nhân vật chính" },
        { token: "[characterGender]", label: "Giới tính nhân vật", description: "Giới tính của nhân vật chính" },
        { token: "[mascot]", label: "Mascot 3D / Linh vật", description: "Toàn bộ đoạn prompt đặc tả Mascot 3D kèm tên thương hiệu trên khiên vàng" },
        { token: "[mascotName]", label: "Tên Mascot", description: "Tên thương hiệu trên khiên vàng" },
        { token: "[mascotDescription]", label: "Mô tả Mascot", description: "Toàn bộ đoạn prompt đặc tả Mascot 3D" },
        { token: "[aspectRatio]", label: "Tỷ lệ khung hình", description: "Tỷ lệ 9:16 hoặc 16:9" },
        { token: "[videoStyle]", label: "Style Visual", description: "Phong cách 3D Pixar, màu sắc, ánh sáng" },
      ],
      helperText: "Quy chuẩn prompt tạo cảnh độc lập từng phân đoạn, ánh sáng, góc máy và khóa diện mạo nhân vật.",
      isMonospace: true,
      onSave: (val) => {
        setEditingTemplate((prev) =>
          prev
            ? {
                ...prev,
                data: {
                  ...prev.data,
                  scenePromptTemplate: val,
                  imagePromptTemplate: val,
                },
              }
            : null
        );
      },
    });
  };

  const openThumbnailPromptPopup = () => {
    if (!editingTemplate) return;
    setActivePopupConfig({
      isOpen: true,
      onClose: () => setActivePopupConfig(null),
      title: "B4: Prompt tạo thumbnail",
      subtitle: "Tối ưu CTR Shorts/TikTok, Safe Zone 20% trên dưới, tương phản màu sắc cao, chữ nổi bật 3-5 từ",
      badge: "B4: Prompt Thumbnail",
      colorTheme: "pink",
      icon: <ImageIcon className="w-5 h-5" />,
      initialValue: editingTemplate.data.thumbnailPromptTemplate || DEFAULT_THUMBNAIL_PROMPT_TEMPLATE,
      defaultValue: DEFAULT_THUMBNAIL_PROMPT_TEMPLATE,
      placeholder: "Nhập cấu trúc prompt tạo Thumbnail mẫu...",
      variableTokens: [
        { token: "[characterRules]", label: "Quy tắc nhân vật", description: "Khóa 100% diện mạo nhân vật" },
        { token: "[characterAge]", label: "Tuổi nhân vật", description: "Độ tuổi của nhân vật chính" },
        { token: "[characterGender]", label: "Giới tính nhân vật", description: "Giới tính của nhân vật chính" },
        { token: "[characterOutfit]", label: "Trang phục Nữ chính", description: "Áo thun xanh lá nhạt trơn" },
        { token: "[characterFace]", label: "Gương mặt & biểu cảm", description: "Mắt to biểu cảm, thần thái ngạc nhiên/vui vẻ" },
        { token: "[mascot]", label: "Mascot 3D / Linh vật", description: "Toàn bộ đoạn prompt đặc tả Mascot 3D kèm tên thương hiệu trên khiên vàng" },
        { token: "[mascotName]", label: "Tên Mascot", description: "Tên thương hiệu trên khiên vàng" },
        { token: "[mascotDescription]", label: "Mô tả Mascot", description: "Toàn bộ đoạn prompt đặc tả Mascot 3D" },
        { token: "[aspectRatio]", label: "Tỷ lệ khung hình", description: "Tỷ lệ 9:16 hoặc 16:9" },
      ],
      helperText: "Tối ưu CTR Shorts/TikTok, chữ lớn 3-5 từ, bố cục an toàn không bị che bởi UI của nền tảng.",
      isMonospace: true,
      onSave: (val) => {
        setEditingTemplate((prev) => (prev ? { ...prev, data: { ...prev.data, thumbnailPromptTemplate: val } } : null));
      },
    });
  };

  const openVeoPromptPopup = () => {
    if (!editingTemplate) return;
    setActivePopupConfig({
      isOpen: true,
      onClose: () => setActivePopupConfig(null),
      title: "B5: Prompt tạo veo",
      subtitle: "Bộ Prompt tạo video chuyển động VEO 3 / Kling AI 9:16 theo nguyên tắc N+1 kèm Voice Prompt & Kịch bản JSON 12 yếu tố",
      badge: "B5: Prompt Tạo VEO",
      colorTheme: "amber",
      icon: <Video className="w-5 h-5" />,
      initialValue:
        editingTemplate.data.veoPromptTemplate ||
        editingTemplate.data.videoPromptTemplate ||
        DEFAULT_VEO_PROMPT_TEMPLATE,
      defaultValue: DEFAULT_VEO_PROMPT_TEMPLATE,
      placeholder: "Nhập cấu trúc prompt tạo video VEO3/Kling mẫu...",
      variableTokens: [
        { token: "[characterRules]", label: "Quy tắc nhân vật", description: "Khóa 100% diện mạo và trang phục nhân vật" },
        { token: "[characterAge]", label: "Tuổi nhân vật", description: "Độ tuổi của nhân vật chính" },
        { token: "[characterGender]", label: "Giới tính nhân vật", description: "Giới tính của nhân vật chính" },
        { token: "[characterOutfit]", label: "Trang phục Nữ chính", description: "Áo thun xanh lá nhạt trơn" },
        { token: "[mascot]", label: "Mascot 3D / Linh vật", description: "Toàn bộ đoạn prompt đặc tả Mascot 3D kèm tên thương hiệu trên khiên vàng" },
        { token: "[mascotName]", label: "Tên Mascot", description: "Tên thương hiệu trên khiên vàng" },
        { token: "[voice]", label: "Giọng đọc", description: "Đặc tả giọng đọc và diễn xuất âm thanh" },
        { token: "[aspectRatio]", label: "Tỷ lệ khung hình", description: "Tỷ lệ 9:16 hoặc 16:9" },
        { token: "[videoStyle]", label: "Style Visual", description: "Phong cách 3D Pixar, màu sắc, ánh sáng" },
      ],
      helperText: "Quy chuẩn prompt điều khiển camera chuyển động, diễn xuất và thời lượng 4-8s cho từng phân cảnh VEO 3.",
      isMonospace: true,
      onSave: (val) => {
        setEditingTemplate((prev) =>
          prev
            ? {
                ...prev,
                data: {
                  ...prev.data,
                  veoPromptTemplate: val,
                  videoPromptTemplate: val,
                },
              }
            : null
        );
      },
    });
  };

  const openVideoStylePromptPopup = () => {
    if (!editingTemplate) return;
    setActivePopupConfig({
      isOpen: true,
      onClose: () => setActivePopupConfig(null),
      title: "Nâng cao: Prompt video style",
      subtitle: "Quy chuẩn đồ họa 3D Pixar, màu sắc đào mềm mại, ánh sáng điện ảnh volumetric, phân giải 8K và hiệu ứng hạt",
      badge: "Nâng Cao: Video Style",
      colorTheme: "violet",
      icon: <Palette className="w-5 h-5" />,
      initialValue: editingTemplate.data.videoStylePrompt || editingTemplate.data.style || DEFAULT_VIDEO_STYLE_PROMPT,
      defaultValue: DEFAULT_VIDEO_STYLE_PROMPT,
      placeholder: "3D Pixar animation style, soft peach background, warm cinematic volumetric lighting, smooth 8K render...",
      variableTokens: [
        { token: "[mascotName]", label: "Tên Mascot", description: "Tên thương hiệu trên khiên vàng" },
        { token: "[femaleAge]", label: "Tuổi Nữ chính", description: "Độ tuổi của nhân vật nữ chính" },
      ],
      helperText: "Đặc tả chi tiết phong cách hình ảnh & video, camera lighting, tông màu và chuyển động mượt mà cho toàn bộ video.",
      isMonospace: true,
      onSave: (val) => {
        setEditingTemplate((prev) =>
          prev
            ? {
                ...prev,
                data: {
                  ...prev.data,
                  videoStylePrompt: val,
                  style: val,
                },
              }
            : null
        );
      },
    });
  };

  // Aliases for compatibility
  const openImagePromptPopup = openStoryboardPromptPopup;
  const openVideoPromptPopup = openVeoPromptPopup;

  const openCustomNotesPopup = () => {
    if (!editingTemplate) return;
    setActivePopupConfig({
      isOpen: true,
      onClose: () => setActivePopupConfig(null),
      title: "9. Ghi chú bổ sung riêng cho Template",
      subtitle: "Ghi chú quy trình, lưu ý nội bộ hoặc hướng dẫn đặc thù cho template này",
      badge: "Ghi chú riêng",
      colorTheme: "slate",
      icon: <FileText className="w-5 h-5" />,
      initialValue: editingTemplate.data.customNotes || "",
      placeholder: "Nhấn mạnh cơ chế thảo mộc tự nhiên lành tính, tone giọng ân cần...",
      helperText: "Ghi chú này sẽ được lưu kèm theo template để nhắc nhở quy trình sản xuất nội dung.",
      isMonospace: false,
      onSave: (val) => {
        setEditingTemplate((prev) => (prev ? { ...prev, data: { ...prev.data, customNotes: val } } : null));
      },
    });
  };

  const copyPromptText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPromptKey(key);
    setTimeout(() => setCopiedPromptKey(null), 2000);
  };

  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [showKeyPassword, setShowKeyPassword] = useState(false);

  // Custom API state
  const [isTestingCustom, setIsTestingCustom] = useState(false);
  const [customTestResult, setCustomTestResult] = useState<{ success: boolean; message: string; latencyMs?: number } | null>(null);
  const [showCustomKeyPassword, setShowCustomKeyPassword] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      const localKey = localStorage.getItem("custom_openrouter_api_key") || "";
      const localModel = localStorage.getItem("custom_openrouter_model") || "anthropic/claude-3.5-sonnet";
      const localWritingModel = localStorage.getItem("custom_openrouter_writing_model") || "anthropic/claude-3.5-sonnet";
      const localImageModel = localStorage.getItem("custom_openrouter_image_model") || "openai/gpt-4o";
      const localUseSeparate = localStorage.getItem("use_separate_models") !== "false";
      const localUseSeparateWriting = localStorage.getItem("use_separate_writing_model") === "true" || (localUseSeparate && !!localWritingModel);
      const localUseSeparateImage = localStorage.getItem("use_separate_image_model") === "true" || (localUseSeparate && !!localImageModel);

      const localProvider = (localStorage.getItem("selected_ai_provider") as any) || (localKey ? "openrouter" : "gemini");
      const localConcurrency = parseInt(localStorage.getItem("batch_concurrency") || "3", 10);
      const localRetry = parseInt(localStorage.getItem("batch_retry_attempts") || "2", 10);
      const localDelay = parseInt(localStorage.getItem("batch_delay_ms") || "350", 10);
      const localAutoSave = localStorage.getItem("batch_auto_save_history") !== "false";
      const localRunScript12 = localStorage.getItem("batch_run_script_step12") !== "false";
      const localRunVisual345 = localStorage.getItem("batch_run_visual_step345") !== "false";
      const localMaxTokens = parseInt(localStorage.getItem("ai_max_tokens") || "4096", 10);
      const currentTemplates = getStoredTemplates();
      const defaultId = getDefaultTemplateId();

      const localCustomKey = localStorage.getItem("custom_api_key") || "";
      const localCustomBaseUrl = localStorage.getItem("custom_base_url") || "https://api.openai.com/v1";
      const localCustomModel = localStorage.getItem("custom_model_id") || "gpt-4o";
      const localCustomWritingModel = localStorage.getItem("custom_writing_model_id") || "ag/gemini-3.7-flash-medium";
      const localCustomImageModel = localStorage.getItem("custom_image_model_id") || "gpt-4o";
      const localCustomUseSeparate = localStorage.getItem("custom_use_separate_models") === "true";
      const localCustomUseSeparateWriting = localStorage.getItem("custom_use_separate_writing_model") === "true" || (localCustomUseSeparate && !!localCustomWritingModel);
      const localCustomUseSeparateImage = localStorage.getItem("custom_use_separate_image_model") === "true" || (localCustomUseSeparate && !!localCustomImageModel);

      setTemplates(currentTemplates);
      setEditingTemplate(null);
      setIsCreatingNew(false);

      const isCustomMain = !PRESET_OPENROUTER_MODELS.some((m) => m.id === localModel);
      if (isCustomMain) setCustomModelInput(localModel);

      const isCustomWriting = !PRESET_OPENROUTER_MODELS.some((m) => m.id === localWritingModel);
      if (isCustomWriting) setCustomWritingModelInput(localWritingModel);

      const isCustomImage = !PRESET_OPENROUTER_MODELS.some((m) => m.id === localImageModel);
      if (isCustomImage) setCustomImageModelInput(localImageModel);

      setSettings((prev) => ({
        ...prev,
        openRouterApiKey: localKey,
        openRouterModel: isCustomMain ? "custom" : localModel,
        openRouterWritingModel: isCustomWriting ? "custom" : localWritingModel,
        openRouterImageModel: isCustomImage ? "custom" : localImageModel,
        useSeparateModels: localUseSeparate,
        useSeparateWritingModel: localUseSeparateWriting,
        useSeparateImageModel: localUseSeparateImage,
        customApiKey: localCustomKey,
        customBaseUrl: localCustomBaseUrl,
        customModelId: localCustomModel,
        customWritingModelId: localCustomWritingModel,
        customImageModelId: localCustomImageModel,
        customUseSeparateModels: localCustomUseSeparate,
        customUseSeparateWritingModel: localCustomUseSeparateWriting,
        customUseSeparateImageModel: localCustomUseSeparateImage,
        batchRunScriptStep12: localRunScript12,
        batchRunVisualStep345: localRunVisual345,
        aiProvider: localProvider,
        concurrency: isNaN(localConcurrency) ? 3 : Math.max(1, Math.min(10, localConcurrency)),
        retryAttempts: isNaN(localRetry) ? 2 : Math.max(0, Math.min(5, localRetry)),
        delayBetweenStepsMs: isNaN(localDelay) ? 350 : localDelay,
        autoSaveToHistory: localAutoSave,
        defaultTemplateId: defaultId,
        maxTokens: isNaN(localMaxTokens) ? 4096 : localMaxTokens,
      }));
      setTestResult(null);
      setCustomTestResult(null);
    }
  }, [isOpen, initialTab]);

  const showNotification = (msg: string) => {
    setTemplateNotification(msg);
    setTimeout(() => setTemplateNotification(null), 3000);
  };

  const handleFetchLiveModels = async () => {
    setIsFetchingLiveModels(true);
    setFetchError(null);
    try {
      const fetched = await fetchLiveOpenRouterModels(settings.openRouterApiKey.trim() || undefined);
      if (fetched && fetched.length > 0) {
        // Merge with preset list to preserve description & recommendations
        const presetMap = new Map(PRESET_OPENROUTER_MODELS.map((m) => [m.id, m]));
        const merged: OpenRouterModelItem[] = [];
        
        // Add presets first
        PRESET_OPENROUTER_MODELS.forEach((pm) => merged.push(pm));
        
        // Add remaining live models
        fetched.forEach((fm) => {
          if (!presetMap.has(fm.id)) {
            merged.push(fm);
          }
        });

        setModelList(merged);
        showNotification(`Đã tải thành công ${merged.length} models từ OpenRouter API!`);
      }
    } catch (err: any) {
      setFetchError(err.message || "Không thể kết nối lấy models từ OpenRouter");
    } finally {
      setIsFetchingLiveModels(false);
    }
  };

  const handleApplyManualModel = (target: "writing" | "image" | "main") => {
    const modelId = manualModelInput.trim();
    if (!modelId) {
      showNotification("Vui lòng nhập ID Model OpenRouter trước!");
      return;
    }

    // Ensure model is in modelList so dropdowns can display it
    const exists = modelList.some((m) => m.id.toLowerCase() === modelId.toLowerCase());
    if (!exists) {
      const customItem: OpenRouterModelItem = {
        id: modelId,
        name: modelId,
        provider: "other",
        providerName: "Tùy chỉnh",
        recommendedFor: target === "writing" ? "writing" : target === "image" ? "image" : "both",
        isNew: true,
        pricing: {
          prompt: 0,
          completion: 0,
          inputCostPer1M: "Theo OpenRouter",
          outputCostPer1M: "Theo OpenRouter",
        },
      };
      setModelList((prev) => [customItem, ...prev]);
    }

    if (target === "writing") {
      setSettings((prev) => ({ ...prev, openRouterWritingModel: modelId }));
      setCustomWritingModelInput(modelId);
      showNotification(`Đã gán "${modelId}" cho Model Viết Kịch Bản (Bước 1 & 5)!`);
    } else if (target === "image") {
      setSettings((prev) => ({ ...prev, openRouterImageModel: modelId }));
      setCustomImageModelInput(modelId);
      showNotification(`Đã gán "${modelId}" cho Model Tạo Prompt Ảnh/Video (Bước 2, 3, 4)!`);
    } else {
      setSettings((prev) => ({ ...prev, openRouterModel: modelId }));
      setCustomModelInput(modelId);
      showNotification(`Đã gán "${modelId}" làm Model Chính!`);
    }
  };

  const handleTestManualModel = async () => {
    const modelId = manualModelInput.trim();
    if (!modelId) {
      setManualTestResult({ success: false, message: "Vui lòng nhập ID Model cần kiểm tra!" });
      return;
    }
    if (!settings.openRouterApiKey.trim()) {
      setManualTestResult({ success: false, message: "Vui lòng nhập OpenRouter API Key trước khi test!" });
      return;
    }

    setIsTestingManual(true);
    setManualTestResult(null);

    try {
      const res = await fetch(OPENROUTER_API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${settings.openRouterApiKey.trim()}`,
          "HTTP-Referer": window.location.origin || "https://ai.studio/build",
          "X-Title": "3D Health Video Prompt Studio",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: modelId,
          messages: [{ role: "user", content: "Ping test: trả lời OK" }],
          max_tokens: 10,
        }),
      });

      if (!res.ok) {
        const errTxt = await res.text();
        setManualTestResult({
          success: false,
          message: `Lỗi kết nối Model "${modelId}" (${res.status}): ${errTxt.slice(0, 160)}`,
        });
        return;
      }

      setManualTestResult({
        success: true,
        message: `Model "${modelId}" hoạt động hoàn hảo và sẵn sàng sử dụng!`,
      });
    } catch (err: any) {
      setManualTestResult({
        success: false,
        message: `Lỗi kết nối: ${err.message || "Không thể gọi API"}`,
      });
    } finally {
      setIsTestingManual(false);
    }
  };

  const handleSave = () => {
    const finalModel =
      settings.openRouterModel === "custom"
        ? customModelInput.trim() || "anthropic/claude-3.5-sonnet"
        : settings.openRouterModel;

    const finalWritingModel =
      settings.openRouterWritingModel === "custom"
        ? customWritingModelInput.trim() || "anthropic/claude-3.5-sonnet"
        : (settings.openRouterWritingModel || "anthropic/claude-3.5-sonnet");

    const finalImageModel =
      settings.openRouterImageModel === "custom"
        ? customImageModelInput.trim() || "openai/gpt-4o"
        : (settings.openRouterImageModel || "openai/gpt-4o");

    const finalUseSeparate = settings.useSeparateModels !== false;

    localStorage.setItem("custom_openrouter_api_key", settings.openRouterApiKey.trim());
    localStorage.setItem("custom_openrouter_model", finalModel);
    localStorage.setItem("custom_openrouter_writing_model", finalWritingModel);
    localStorage.setItem("custom_openrouter_image_model", finalImageModel);
    localStorage.setItem("use_separate_models", finalUseSeparate ? "true" : "false");
    localStorage.setItem("use_separate_writing_model", settings.useSeparateWritingModel ? "true" : "false");
    localStorage.setItem("use_separate_image_model", settings.useSeparateImageModel ? "true" : "false");

    localStorage.setItem("custom_api_key", (settings.customApiKey || "").trim());
    localStorage.setItem("custom_base_url", (settings.customBaseUrl || "https://api.openai.com/v1").trim());
    localStorage.setItem("custom_model_id", (settings.customModelId || "gpt-4o").trim());
    localStorage.setItem("custom_writing_model_id", (settings.customWritingModelId || settings.customModelId || "ag/gemini-3.7-flash-medium").trim());
    localStorage.setItem("custom_image_model_id", (settings.customImageModelId || settings.customModelId || "gpt-4o").trim());
    localStorage.setItem("custom_use_separate_models", (settings.customUseSeparateWritingModel || settings.customUseSeparateImageModel || settings.customUseSeparateModels) ? "true" : "false");
    localStorage.setItem("custom_use_separate_writing_model", settings.customUseSeparateWritingModel ? "true" : "false");
    localStorage.setItem("custom_use_separate_image_model", settings.customUseSeparateImageModel ? "true" : "false");

    localStorage.setItem("selected_ai_provider", settings.aiProvider);
    localStorage.setItem("batch_concurrency", settings.concurrency.toString());
    localStorage.setItem("batch_retry_attempts", settings.retryAttempts.toString());
    localStorage.setItem("batch_delay_ms", settings.delayBetweenStepsMs.toString());
    localStorage.setItem("batch_auto_save_history", settings.autoSaveToHistory ? "true" : "false");
    localStorage.setItem("batch_run_script_step12", settings.batchRunScriptStep12 !== false ? "true" : "false");
    localStorage.setItem("batch_run_visual_step345", settings.batchRunVisualStep345 !== false ? "true" : "false");
    localStorage.setItem("ai_max_tokens", (settings.maxTokens || 4096).toString());

    if (settings.defaultTemplateId) {
      setDefaultTemplateId(settings.defaultTemplateId);
    }

    const finalSettings: SystemSettings = {
      ...settings,
      openRouterModel: finalModel,
      openRouterWritingModel: finalWritingModel,
      openRouterImageModel: finalImageModel,
      useSeparateModels: finalUseSeparate,
    };

    // Trigger storage event for other components
    window.dispatchEvent(new Event("storage"));
    window.dispatchEvent(new Event("prompt_settings_updated"));

    onSaved(finalSettings);
    onClose();
  };

  const handleResetDefaults = () => {
    setSettings({
      ...DEFAULT_SYSTEM_SETTINGS,
      openRouterApiKey: settings.openRouterApiKey,
      customApiKey: settings.customApiKey,
    });
    setTestResult(null);
    setCustomTestResult(null);
  };

  const handleTestCustomConnection = async () => {
    setIsTestingCustom(true);
    setCustomTestResult(null);
    try {
      const res = await testCustomApiConnection(
        settings.customApiKey || "",
        settings.customBaseUrl || "https://api.openai.com/v1",
        settings.customModelId || "gpt-4o"
      );
      setCustomTestResult(res);
    } catch (err: any) {
      setCustomTestResult({
        success: false,
        message: `Lỗi kết nối Custom API: ${err.message || "Không thể gửi request"}`,
      });
    } finally {
      setIsTestingCustom(false);
    }
  };

  const handleTestConnection = async () => {
    if (!settings.openRouterApiKey.trim()) {
      setTestResult({
        success: false,
        message: "Vui lòng nhập OpenRouter API Key trước khi kiểm tra kết nối!",
      });
      return;
    }

    const testModel = settings.useSeparateModels
      ? (settings.openRouterWritingModel === "custom"
          ? customWritingModelInput.trim() || "anthropic/claude-3.5-sonnet"
          : settings.openRouterWritingModel || "anthropic/claude-3.5-sonnet")
      : (settings.openRouterModel === "custom"
          ? customModelInput.trim() || "anthropic/claude-3.5-sonnet"
          : settings.openRouterModel);

    const testImgModel = settings.useSeparateModels
      ? (settings.openRouterImageModel === "custom"
          ? customImageModelInput.trim() || "openai/gpt-4o"
          : settings.openRouterImageModel || "openai/gpt-4o")
      : null;

    setIsTesting(true);
    setTestResult(null);

    try {
      // Test Writing Model
      const res = await fetch(OPENROUTER_API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${settings.openRouterApiKey.trim()}`,
          "HTTP-Referer": window.location.origin || "https://ai.studio/build",
          "X-Title": "3D Health Video Prompt Studio",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: testModel,
          messages: [{ role: "user", content: "Phản hồi đúng 1 từ: OK" }],
          max_tokens: 10,
        }),
      });

      if (!res.ok) {
        const errTxt = await res.text();
        setTestResult({
          success: false,
          message: `Lỗi kết nối Model Kịch bản "${testModel}" (${res.status}): ${errTxt.slice(0, 150)}`,
        });
        return;
      }

      // If separate models, also test image model
      if (testImgModel && testImgModel !== testModel) {
        const resImg = await fetch(OPENROUTER_API_URL, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${settings.openRouterApiKey.trim()}`,
            "HTTP-Referer": window.location.origin || "https://ai.studio/build",
            "X-Title": "3D Health Video Prompt Studio",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: testImgModel,
            messages: [{ role: "user", content: "Phản hồi đúng 1 từ: OK" }],
            max_tokens: 10,
          }),
        });

        if (!resImg.ok) {
          const errTxt = await resImg.text();
          setTestResult({
            success: false,
            message: `Model Viết "${testModel}" OK, nhưng Model Ảnh "${testImgModel}" bị lỗi (${resImg.status}): ${errTxt.slice(0, 150)}`,
          });
          return;
        }

        setTestResult({
          success: true,
          message: `Kết nối thành công rực rỡ cả 2 mô hình: Kịch bản ("${testModel}") & Tạo Prompt Ảnh ("${testImgModel}")!`,
        });
      } else {
        setTestResult({
          success: true,
          message: `Kết nối OpenRouter API thành công mỹ mãn với mô hình "${testModel}"!`,
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: `Lỗi kết nối mạng: ${err.message}`,
      });
    } finally {
      setIsTesting(false);
    }
  };

  // --- TEMPLATE ACTIONS ---
  const handleSetDefaultTemplate = (templateId: string) => {
    setDefaultTemplateId(templateId);
    setSettings((prev) => ({ ...prev, defaultTemplateId: templateId }));
    const updated = getStoredTemplates();
    setTemplates(updated);
    const target = updated.find((t) => t.id === templateId);
    showNotification(`Đã đặt "${target?.name || templateId}" làm Template chuẩn mặc định!`);
  };

  const handleStartEditTemplate = (template: PromptTemplate) => {
    const cloned = JSON.parse(JSON.stringify(template));
    if (cloned.data) {
      if (cloned.data.useMascot === undefined) cloned.data.useMascot = true;
      if (!cloned.data.mascotPrompt) cloned.data.mascotPrompt = DEFAULT_MASCOT_PROMPT;
      if (!cloned.data.globalSafetyRules) cloned.data.globalSafetyRules = DEFAULT_GLOBAL_SAFETY_RULES;
      if (!cloned.data.globalCharacterRules) cloned.data.globalCharacterRules = DEFAULT_GLOBAL_CHARACTER_RULES;
      if (!cloned.data.customSlangWords) cloned.data.customSlangWords = DEFAULT_SLANG_WORDS;
      if (!cloned.data.customSafeWords) cloned.data.customSafeWords = DEFAULT_SAFE_WORDS;
      if (!cloned.data.customPaddingWords) cloned.data.customPaddingWords = DEFAULT_PADDING_WORDS;
      
      // Ensure audio, image, video and prompt templates have latest complete rules
      if (!cloned.data.mandatoryImageRules || !cloned.data.mandatoryImageRules.includes("KHÔNG BAO GIỜ HIỂN THỊ LỜI THOẠI")) {
        cloned.data.mandatoryImageRules = DEFAULT_MANDATORY_IMAGE_RULES;
      }
      if (!cloned.data.mandatoryAudioRules || !cloned.data.mandatoryAudioRules.includes("ĐỒNG NHẤT 100% GIỚI TÍNH")) {
        cloned.data.mandatoryAudioRules = DEFAULT_MANDATORY_AUDIO_RULES;
      }
      if (!cloned.data.mandatoryVideoRules || !cloned.data.mandatoryVideoRules.includes("CINEMATIC CAMERA WORK")) {
        cloned.data.mandatoryVideoRules = DEFAULT_MANDATORY_VIDEO_RULES;
      }
      if (!cloned.data.dialoguePromptTemplate || !cloned.data.dialoguePromptTemplate.includes("ĐỒNG NHẤT 100% GIỌNG ĐỌC")) {
        cloned.data.dialoguePromptTemplate = DEFAULT_DIALOGUE_PROMPT_TEMPLATE;
      }
      if (!cloned.data.storyboardPromptTemplate || !cloned.data.storyboardPromptTemplate.includes("Vertical Panels")) {
        cloned.data.storyboardPromptTemplate = DEFAULT_STORYBOARD_PROMPT_TEMPLATE;
      }
      if (!cloned.data.scenePromptTemplate || !cloned.data.scenePromptTemplate.includes("No Dialogue on Image")) {
        cloned.data.scenePromptTemplate = DEFAULT_SCENE_PROMPT_TEMPLATE;
      }
      if (!cloned.data.imagePromptTemplate) {
        cloned.data.imagePromptTemplate = cloned.data.scenePromptTemplate;
      }
      if (!cloned.data.veoPromptTemplate || !cloned.data.veoPromptTemplate.includes("Đồng nhất 100% Giọng đọc")) {
        cloned.data.veoPromptTemplate = DEFAULT_VEO_PROMPT_TEMPLATE;
      }
      if (!cloned.data.videoPromptTemplate) {
        cloned.data.videoPromptTemplate = cloned.data.veoPromptTemplate;
      }
      if (!cloned.data.videoStylePrompt) {
        cloned.data.videoStylePrompt = cloned.data.style || DEFAULT_VIDEO_STYLE_PROMPT;
      }
      if (!cloned.data.thumbnailPromptTemplate) {
        cloned.data.thumbnailPromptTemplate = DEFAULT_THUMBNAIL_PROMPT_TEMPLATE;
      }
    }
    setEditingTemplate(cloned);
    setIsCreatingNew(false);
  };

  const handleStartCreateNewTemplate = () => {
    const newTpl: PromptTemplate = {
      id: `tpl_custom_${Date.now()}`,
      name: "Template Sức Khỏe Mới",
      tag: "Chăm sóc sức khỏe",
      description: "Mô tả kịch bản mẫu cho chủ đề...",
      isBuiltIn: false,
      data: {
        ...DEFAULT_INPUTS,
        title: "Chủ đề video sức khỏe mẫu",
        coreContent: "Vấn đề & 3 Nỗi đau chính... 3 Giải pháp (2 thói quen tự nhiên + 1 giải pháp thảo mộc)...",
        useMascot: true,
        mascotName: "Trà Dây Bstar",
        mascotPrompt: DEFAULT_MASCOT_PROMPT,
        globalSafetyRules: DEFAULT_GLOBAL_SAFETY_RULES,
        globalCharacterRules: DEFAULT_GLOBAL_CHARACTER_RULES,
        customSlangWords: DEFAULT_SLANG_WORDS,
        customSafeWords: DEFAULT_SAFE_WORDS,
        customPaddingWords: DEFAULT_PADDING_WORDS,
        mandatoryImageRules: DEFAULT_MANDATORY_IMAGE_RULES,
        mandatoryAudioRules: DEFAULT_MANDATORY_AUDIO_RULES,
        mandatoryVideoRules: DEFAULT_MANDATORY_VIDEO_RULES,
        dialoguePromptTemplate: DEFAULT_DIALOGUE_PROMPT_TEMPLATE,
        imagePromptTemplate: DEFAULT_IMAGE_PROMPT_TEMPLATE,
        videoPromptTemplate: DEFAULT_VIDEO_PROMPT_TEMPLATE,
        videoStylePrompt: DEFAULT_VIDEO_STYLE_PROMPT,
        storyboardPromptTemplate: DEFAULT_STORYBOARD_PROMPT_TEMPLATE,
        thumbnailPromptTemplate: DEFAULT_THUMBNAIL_PROMPT_TEMPLATE,
        style: "3D Pixar style, soft peach background, warm cinematic volumetric lighting, 8k",
        voice: "Southern Vietnamese Saigon male voice 55-70 years old, deep warm soothing, 85-90 wpm",
      },
    };
    setEditingTemplate(newTpl);
    setIsCreatingNew(true);
  };

  const handleDuplicateTemplate = (template: PromptTemplate) => {
    const dup: PromptTemplate = {
      ...JSON.parse(JSON.stringify(template)),
      id: `tpl_copy_${Date.now()}`,
      name: `${template.name} (Bản sao)`,
      isBuiltIn: false,
      isDefault: false,
      createdAt: new Date().toISOString(),
    };
    const updated = saveOrUpdateTemplate(dup);
    setTemplates(updated);
    showNotification(`Đã nhân bản template thành "${dup.name}"!`);
  };

  const handleDeleteTemplate = (templateId: string) => {
    const target = templates.find((t) => t.id === templateId);
    if (!target) return;
    if (templates.length <= 1) {
      alert("Hệ thống cần giữ lại ít nhất 1 template!");
      return;
    }
    const confirm = window.confirm(`Bạn có chắc chắn muốn xóa template "${target.name}"?`);
    if (!confirm) return;

    const updated = deleteStoredTemplate(templateId);
    setTemplates(updated);
    if (editingTemplate?.id === templateId) {
      setEditingTemplate(null);
    }
    showNotification(`Đã xóa template "${target.name}" thành công.`);
  };

  const handleSaveTemplateEditor = () => {
    if (!editingTemplate) return;
    if (!editingTemplate.name.trim()) {
      alert("Vui lòng nhập Tên Template!");
      return;
    }

    const updated = saveOrUpdateTemplate(editingTemplate);
    setTemplates(updated);
    showNotification(`Đã lưu thành công template "${editingTemplate.name}"!`);
    setEditingTemplate(null);
    setIsCreatingNew(false);
  };

  const handleResetToBuiltinTemplates = () => {
    const confirm = window.confirm(
      "Bạn có chắc muốn khôi phục lại danh sách Template chuẩn ban đầu? Các tùy biến sẽ được đưa về mặc định."
    );
    if (!confirm) return;
    const resetList = resetToBuiltInTemplates();
    setTemplates(resetList);
    setEditingTemplate(null);
    setIsCreatingNew(false);
    showNotification("Đã khôi phục toàn bộ Template chuẩn ban đầu!");
  };

  const hasApiKey = Boolean(settings.openRouterApiKey.trim());

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-3xl w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-amber-500 text-slate-950 shadow-md">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-slate-100 text-base">Cài Đặt & Cấu Hình Hệ Thống</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Templates & Đa Luồng
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Tùy biến Template chuẩn khi thêm chủ đề, API Model & Cấu hình Đa luồng
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center space-x-2 bg-slate-950 p-1 rounded-xl border border-slate-800 shrink-0">
          <button
            type="button"
            onClick={() => {
              setActiveTab("presets");
              setEditingTemplate(null);
            }}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-2 ${
              activeTab === "presets"
                ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Templates Chuẩn ({templates.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("threading")}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-2 ${
              activeTab === "threading"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Đa Luồng ({settings.concurrency} luồng)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("ai")}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-2 ${
              activeTab === "ai"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>OpenRouter & AI Model</span>
            {hasApiKey && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>}
          </button>
        </div>

        {/* Global Floating Notification inside Modal */}
        {templateNotification && (
          <div className="p-2.5 bg-emerald-950/80 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs flex items-center space-x-2 animate-in fade-in">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{templateNotification}</span>
          </div>
        )}

        {/* Tab Contents - Scrollable */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4 text-xs">
          {/* TAB 1: TEMPLATES CHUẨN & CUSTOMIZE */}
          {activeTab === "presets" && (
            <div className="space-y-4">
              {!editingTemplate ? (
                /* VIEW 1: TEMPLATE LIST */
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <h4 className="font-bold text-slate-200 text-sm flex items-center space-x-2">
                        <span>Danh Sách Template Kịch Bản Chuẩn</span>
                        <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                          {templates.length} mẫu
                        </span>
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        Chọn và tùy biến template để tự động áp dụng Mascot, Giọng đọc, Style khi thêm chủ đề hàng loạt.
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => setIsImportExportModalOpen(true)}
                        className="px-3 py-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-all shadow-md shadow-indigo-600/20 flex items-center space-x-1.5 cursor-pointer"
                        title="Nạp hoặc xuất file chuẩn JSON cho Rules & Prompts"
                      >
                        <Layers className="w-3.5 h-3.5" />
                        <span>📥 Nạp / Xuất File Chuẩn</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleResetToBuiltinTemplates}
                        className="px-2.5 py-1.5 text-xs text-slate-400 hover:text-slate-200 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-lg transition-colors flex items-center space-x-1"
                        title="Khôi phục lại danh sách Template mẫu ban đầu"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Khôi phục gốc</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleStartCreateNewTemplate}
                        className="px-3 py-1.5 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg transition-all shadow-md shadow-amber-500/20 flex items-center space-x-1.5 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>+ Thêm Template Mới</span>
                      </button>
                    </div>
                  </div>

                  {/* Template Cards Grid */}
                  <div className="space-y-2.5">
                    {templates.map((tpl) => {
                      const isDefault = tpl.id === (settings.defaultTemplateId || getDefaultTemplateId());
                      return (
                        <div
                          key={tpl.id}
                          className={`p-4 rounded-xl border transition-all ${
                            isDefault
                              ? "bg-slate-950 border-amber-500/50 shadow-md shadow-amber-500/5 ring-1 ring-amber-500/20"
                              : "bg-slate-950/70 border-slate-800 hover:border-slate-700"
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                            <div className="space-y-1.5 flex-1 min-w-0">
                              <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                                <span className="font-bold text-slate-100 text-sm">{tpl.name}</span>
                                {tpl.tag && (
                                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                    {tpl.tag}
                                  </span>
                                )}
                                {isDefault && (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-slate-950 flex items-center space-x-1">
                                    <Star className="w-2.5 h-2.5 fill-slate-950" />
                                    <span>Mặc Định Toàn Hệ Thống</span>
                                  </span>
                                )}
                              </div>

                              <p className="text-xs text-slate-300 line-clamp-2">{tpl.description}</p>

                              {/* Mini Spec Badges */}
                              <div className="flex items-center flex-wrap gap-2 pt-1 text-[11px] text-slate-400">
                                {tpl.data.useMascot !== false ? (
                                  <span className="flex items-center space-x-1 bg-slate-900 px-2 py-0.5 rounded border border-amber-500/30 text-amber-300">
                                    <Shield className="w-3 h-3 text-amber-400" />
                                    <strong>Mascot:</strong>
                                    <span>{tpl.data.mascotName || "Trà Dây Bstar"}</span>
                                  </span>
                                ) : (
                                  <span className="flex items-center space-x-1 bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-slate-400">
                                    <Shield className="w-3 h-3 text-slate-500" />
                                    <span>Không Mascot</span>
                                  </span>
                                )}

                                <span className="flex items-center space-x-1 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                                  <Volume2 className="w-3 h-3 text-emerald-400" />
                                  <strong className="text-emerald-300">Vùng miền:</strong>
                                  <span>
                                    {tpl.data.regionAccent === "south"
                                      ? "Miền Nam"
                                      : tpl.data.regionAccent === "north"
                                      ? "Miền Bắc"
                                      : tpl.data.regionAccent === "central"
                                      ? "Miền Trung"
                                      : "Miền Tây"}
                                  </span>
                                  <span>({tpl.data.pacingWpm || 105} wpm)</span>
                                </span>

                                <span className="flex items-center space-x-1 bg-slate-900 px-2 py-0.5 rounded border border-slate-800 truncate max-w-[200px]">
                                  <Palette className="w-3 h-3 text-indigo-400" />
                                  <span className="truncate">{tpl.data.style || "3D Pixar"}</span>
                                </span>

                                <span className="flex items-center space-x-1 bg-sky-950/40 px-2 py-0.5 rounded border border-sky-500/30 text-sky-300">
                                  <MessageSquare className="w-3 h-3 text-sky-400" />
                                  <strong>Hội Thoại:</strong>
                                  <span>5 Cảnh 9:16</span>
                                </span>

                                <span className="flex items-center space-x-1 bg-purple-950/40 px-2 py-0.5 rounded border border-purple-500/30 text-purple-300">
                                  <ImageIcon className="w-3 h-3 text-purple-400" />
                                  <strong>Ảnh Storyboard:</strong>
                                  <span>Lưới Dọc 9:16</span>
                                </span>

                                <span className="flex items-center space-x-1 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-500/30 text-amber-300">
                                  <Video className="w-3 h-3 text-amber-400" />
                                  <strong>Video:</strong>
                                  <span>VEO3/Kling</span>
                                </span>

                                <span className="flex items-center space-x-1 bg-violet-950/40 px-2 py-0.5 rounded border border-violet-500/30 text-violet-300">
                                  <Palette className="w-3 h-3 text-violet-400" />
                                  <strong>Video Style:</strong>
                                  <span className="truncate max-w-[130px]">
                                    {tpl.data.videoStylePrompt || tpl.data.style || "3D Pixar"}
                                  </span>
                                </span>

                                <span className="flex items-center space-x-1 bg-pink-950/40 px-2 py-0.5 rounded border border-pink-500/30 text-pink-300">
                                  <ImageIcon className="w-3 h-3 text-pink-400" />
                                  <strong>Thumbnail:</strong>
                                  <span>Stop-The-Scroll</span>
                                </span>

                                <span className="flex items-center space-x-1 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/30 text-emerald-300">
                                  <Shield className="w-3 h-3 text-emerald-400" />
                                  <strong>4 Rules:</strong>
                                  <span>Đạt Chuẩn</span>
                                </span>
                              </div>

                              {/* Toggle View Prompt Storyboard & Thumbnail */}
                              <div className="pt-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setExpandedPromptsMap((prev) => ({
                                      ...prev,
                                      [tpl.id]: !prev[tpl.id],
                                    }))
                                  }
                                  className="inline-flex items-center space-x-1.5 text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
                                >
                                  {expandedPromptsMap[tpl.id] ? (
                                    <>
                                      <ChevronUp className="w-3 h-3" />
                                      <span>Thu gọn cấu hình chi tiết (4 Rules, Prompt Hội Thoại, Ảnh, Video & Thumbnail)</span>
                                    </>
                                  ) : (
                                    <>
                                      <ChevronDown className="w-3 h-3" />
                                      <span>Xem chi tiết 4 Rules, Prompt Hội Thoại, Tạo Ảnh, Tạo Video & Thumbnail</span>
                                    </>
                                  )}
                                </button>
                              </div>

                              {/* Expanded Prompt Details */}
                              {expandedPromptsMap[tpl.id] && (
                                <div className="mt-3 p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-3">
                                  {/* 4 Rules Summary Preview */}
                                  <div className="space-y-1.5">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center space-x-1.5 text-[11px] font-bold text-emerald-300">
                                        <Shield className="w-3.5 h-3.5 text-emerald-400" />
                                        <span>1. [GLOBAL SAFETY & BRAND RULES]:</span>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          copyPromptText(
                                            tpl.data.globalSafetyRules || DEFAULT_GLOBAL_SAFETY_RULES,
                                            `gs_${tpl.id}`
                                          )
                                        }
                                        className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 flex items-center space-x-1 transition-colors"
                                      >
                                        {copiedPromptKey === `gs_${tpl.id}` ? (
                                          <>
                                            <Check className="w-2.5 h-2.5 text-emerald-400" />
                                            <span>Đã sao chép</span>
                                          </>
                                        ) : (
                                          <>
                                            <Copy className="w-2.5 h-2.5" />
                                            <span>Sao chép</span>
                                          </>
                                        )}
                                      </button>
                                    </div>
                                    <pre className="text-[10.5px] font-mono text-slate-300 bg-slate-900/90 p-2.5 rounded-lg border border-emerald-500/20 whitespace-pre-wrap leading-relaxed max-h-28 overflow-y-auto">
                                      {tpl.data.globalSafetyRules || DEFAULT_GLOBAL_SAFETY_RULES}
                                    </pre>
                                  </div>

                                  <div className="space-y-1.5">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center space-x-1.5 text-[11px] font-bold text-amber-300">
                                        <Users className="w-3.5 h-3.5 text-amber-400" />
                                        <span>2. [GLOBAL CHARACTER CONSISTENCY RULES]:</span>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          copyPromptText(
                                            tpl.data.globalCharacterRules || DEFAULT_GLOBAL_CHARACTER_RULES,
                                            `gc_${tpl.id}`
                                          )
                                        }
                                        className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 flex items-center space-x-1 transition-colors"
                                      >
                                        {copiedPromptKey === `gc_${tpl.id}` ? (
                                          <>
                                            <Check className="w-2.5 h-2.5 text-emerald-400" />
                                            <span>Đã sao chép</span>
                                          </>
                                        ) : (
                                          <>
                                            <Copy className="w-2.5 h-2.5" />
                                            <span>Sao chép</span>
                                          </>
                                        )}
                                      </button>
                                    </div>
                                    <pre className="text-[10.5px] font-mono text-slate-300 bg-slate-900/90 p-2.5 rounded-lg border border-amber-500/20 whitespace-pre-wrap leading-relaxed max-h-28 overflow-y-auto">
                                      {tpl.data.globalCharacterRules || DEFAULT_GLOBAL_CHARACTER_RULES}
                                    </pre>
                                  </div>

                                  {/* Prompt Tạo Hội Thoại */}
                                  <div className="space-y-1.5">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center space-x-1.5 text-[11px] font-bold text-sky-300">
                                        <MessageSquare className="w-3.5 h-3.5 text-sky-400" />
                                        <span>Prompt Tạo Hội Thoại (Bước 1):</span>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          copyPromptText(
                                            tpl.data.dialoguePromptTemplate || DEFAULT_DIALOGUE_PROMPT_TEMPLATE,
                                            `dl_${tpl.id}`
                                          )
                                        }
                                        className="text-[10px] px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 hover:bg-sky-500/30 flex items-center space-x-1 transition-colors"
                                      >
                                        {copiedPromptKey === `dl_${tpl.id}` ? (
                                          <>
                                            <Check className="w-2.5 h-2.5 text-emerald-400" />
                                            <span>Đã sao chép</span>
                                          </>
                                        ) : (
                                          <>
                                            <Copy className="w-2.5 h-2.5" />
                                            <span>Sao chép Prompt</span>
                                          </>
                                        )}
                                      </button>
                                    </div>
                                    <pre className="text-[10.5px] font-mono text-slate-300 bg-slate-900/90 p-2.5 rounded-lg border border-sky-500/20 whitespace-pre-wrap leading-relaxed max-h-32 overflow-y-auto">
                                      {tpl.data.dialoguePromptTemplate || DEFAULT_DIALOGUE_PROMPT_TEMPLATE}
                                    </pre>
                                  </div>

                                  {/* Prompt Tạo Ảnh Storyboard */}
                                  <div className="space-y-1.5">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center space-x-1.5 text-[11px] font-bold text-purple-300">
                                        <ImageIcon className="w-3.5 h-3.5 text-purple-400" />
                                        <span>Prompt Tạo Tạo Ảnh (Bước 2 - Grid 5 Khung Dọc 9:16):</span>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          copyPromptText(
                                            tpl.data.imagePromptTemplate ||
                                              tpl.data.storyboardPromptTemplate ||
                                              DEFAULT_IMAGE_PROMPT_TEMPLATE,
                                            `sb_${tpl.id}`
                                          )
                                        }
                                        className="text-[10px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 flex items-center space-x-1 transition-colors"
                                      >
                                        {copiedPromptKey === `sb_${tpl.id}` ? (
                                          <>
                                            <Check className="w-2.5 h-2.5 text-emerald-400" />
                                            <span>Đã sao chép</span>
                                          </>
                                        ) : (
                                          <>
                                            <Copy className="w-2.5 h-2.5" />
                                            <span>Sao chép Prompt</span>
                                          </>
                                        )}
                                      </button>
                                    </div>
                                    <pre className="text-[10.5px] font-mono text-slate-300 bg-slate-900/90 p-2.5 rounded-lg border border-purple-500/20 whitespace-pre-wrap leading-relaxed max-h-32 overflow-y-auto">
                                      {tpl.data.imagePromptTemplate ||
                                        tpl.data.storyboardPromptTemplate ||
                                        DEFAULT_IMAGE_PROMPT_TEMPLATE}
                                    </pre>
                                  </div>

                                  {/* Prompt Tạo Video */}
                                  <div className="space-y-1.5">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center space-x-1.5 text-[11px] font-bold text-amber-300">
                                        <Video className="w-3.5 h-3.5 text-amber-400" />
                                        <span>Prompt Tạo Video (Bước 3 - Chuẩn VEO3/Kling 9:16):</span>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          copyPromptText(
                                            tpl.data.videoPromptTemplate || DEFAULT_VIDEO_PROMPT_TEMPLATE,
                                            `vd_${tpl.id}`
                                          )
                                        }
                                        className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 flex items-center space-x-1 transition-colors"
                                      >
                                        {copiedPromptKey === `vd_${tpl.id}` ? (
                                          <>
                                            <Check className="w-2.5 h-2.5 text-emerald-400" />
                                            <span>Đã sao chép</span>
                                          </>
                                        ) : (
                                          <>
                                            <Copy className="w-2.5 h-2.5" />
                                            <span>Sao chép Prompt</span>
                                          </>
                                        )}
                                      </button>
                                    </div>
                                    <pre className="text-[10.5px] font-mono text-slate-300 bg-slate-900/90 p-2.5 rounded-lg border border-amber-500/20 whitespace-pre-wrap leading-relaxed max-h-32 overflow-y-auto">
                                      {tpl.data.videoPromptTemplate || DEFAULT_VIDEO_PROMPT_TEMPLATE}
                                    </pre>
                                  </div>

                                  {/* Prompt Video Style */}
                                  <div className="space-y-1.5">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center space-x-1.5 text-[11px] font-bold text-violet-300">
                                        <Palette className="w-3.5 h-3.5 text-violet-400" />
                                        <span>Prompt Video Style (Phong Cách Visual & Video 3D Pixar):</span>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          copyPromptText(
                                            tpl.data.videoStylePrompt || tpl.data.style || DEFAULT_VIDEO_STYLE_PROMPT,
                                            `vs_${tpl.id}`
                                          )
                                        }
                                        className="text-[10px] px-2 py-0.5 rounded bg-violet-500/20 text-violet-300 hover:bg-violet-500/30 flex items-center space-x-1 transition-colors"
                                      >
                                        {copiedPromptKey === `vs_${tpl.id}` ? (
                                          <>
                                            <Check className="w-2.5 h-2.5 text-emerald-400" />
                                            <span>Đã sao chép</span>
                                          </>
                                        ) : (
                                          <>
                                            <Copy className="w-2.5 h-2.5" />
                                            <span>Sao chép Prompt</span>
                                          </>
                                        )}
                                      </button>
                                    </div>
                                    <pre className="text-[10.5px] font-mono text-slate-300 bg-slate-900/90 p-2.5 rounded-lg border border-violet-500/20 whitespace-pre-wrap leading-relaxed max-h-32 overflow-y-auto">
                                      {tpl.data.videoStylePrompt || tpl.data.style || DEFAULT_VIDEO_STYLE_PROMPT}
                                    </pre>
                                  </div>

                                  {/* Thumbnail Prompt */}
                                  <div className="space-y-1.5">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center space-x-1.5 text-[11px] font-bold text-pink-300">
                                        <ImageIcon className="w-3.5 h-3.5 text-pink-400" />
                                        <span>Prompt Tạo Thumbnail (Bước 4 - Stop The Scroll 9:16):</span>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          copyPromptText(
                                            tpl.data.thumbnailPromptTemplate || DEFAULT_THUMBNAIL_PROMPT_TEMPLATE,
                                            `tn_${tpl.id}`
                                          )
                                        }
                                        className="text-[10px] px-2 py-0.5 rounded bg-pink-500/20 text-pink-300 hover:bg-pink-500/30 flex items-center space-x-1 transition-colors"
                                      >
                                        {copiedPromptKey === `tn_${tpl.id}` ? (
                                          <>
                                            <Check className="w-2.5 h-2.5 text-emerald-400" />
                                            <span>Đã sao chép</span>
                                          </>
                                        ) : (
                                          <>
                                            <Copy className="w-2.5 h-2.5" />
                                            <span>Sao chép Prompt</span>
                                          </>
                                        )}
                                      </button>
                                    </div>
                                    <pre className="text-[10.5px] font-mono text-slate-300 bg-slate-900/90 p-2.5 rounded-lg border border-pink-500/20 whitespace-pre-wrap leading-relaxed max-h-36 overflow-y-auto">
                                      {tpl.data.thumbnailPromptTemplate || DEFAULT_THUMBNAIL_PROMPT_TEMPLATE}
                                    </pre>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center space-x-1.5 shrink-0 self-end sm:self-start">
                              {!isDefault && (
                                <button
                                  type="button"
                                  onClick={() => handleSetDefaultTemplate(tpl.id)}
                                  className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 hover:border-amber-500/50 transition-colors flex items-center space-x-1"
                                  title="Đặt template này làm mặc định khi thêm chủ đề mới"
                                >
                                  <Star className="w-3 h-3 text-amber-400" />
                                  <span>Đặt Mặc Định</span>
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => handleStartEditTemplate(tpl)}
                                className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/40 transition-colors flex items-center space-x-1"
                                title="Chỉnh sửa cấu hình template này"
                              >
                                <Edit2 className="w-3 h-3" />
                                <span>Tùy Biến</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDuplicateTemplate(tpl)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                                title="Nhân bản template"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>

                              {templates.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteTemplate(tpl.id)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                                  title="Xóa template này"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                /* VIEW 2: TEMPLATE CUSTOMIZER / EDITOR */
                <div className="space-y-4 animate-in fade-in">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingTemplate(null);
                          setIsCreatingNew(false);
                        }}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                        title="Quay lại danh sách template"
                      >
                        <ArrowLeft className="w-4 h-4" />
                      </button>
                      <div>
                        <h4 className="font-bold text-slate-100 text-sm flex items-center space-x-2">
                          <span>{isCreatingNew ? "➕ Tạo Template Chuẩn Mới" : `✏️ Tùy Biến Template: ${editingTemplate.name}`}</span>
                        </h4>
                        <p className="text-[11px] text-slate-400">
                          Chỉnh sửa các yếu tố cố định cho template này để tự động nạp khi thêm chủ đề
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => setIsImportExportModalOpen(true)}
                        className="px-3 py-1.5 text-xs font-bold bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/40 rounded-lg transition-all flex items-center space-x-1.5 cursor-pointer"
                        title="Nạp thêm hoặc xuất quy tắc/prompts cho template này"
                      >
                        <Layers className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Nạp / Xuất Rules & Prompts</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setEditingTemplate(null);
                          setIsCreatingNew(false);
                        }}
                        className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200"
                      >
                        Hủy
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveTemplateEditor}
                        className="px-4 py-1.5 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg shadow-md transition-all flex items-center space-x-1.5 cursor-pointer"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Lưu Template</span>
                      </button>
                    </div>
                  </div>

                  {/* Form fields */}
                  <div className="space-y-3.5 bg-slate-950 p-4 rounded-xl border border-slate-800">
                    {/* Name & Tag */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2 space-y-1">
                        <label className="text-slate-300 font-semibold block">Tên Template</label>
                        <input
                          type="text"
                          value={editingTemplate.name}
                          onChange={(e) => setEditingTemplate({ ...editingTemplate, name: e.target.value })}
                          placeholder="Ví dụ: Trà Dây Bstar - Trào Ngược Dạ Dày"
                          className="w-full bg-slate-900 border border-slate-700 focus:border-amber-500 rounded-lg px-3 py-2 text-slate-200 outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-slate-300 font-semibold block">Chuyên mục / Tag</label>
                        <input
                          type="text"
                          value={editingTemplate.tag}
                          onChange={(e) => setEditingTemplate({ ...editingTemplate, tag: e.target.value })}
                          placeholder="Ví dụ: Tiêu hóa, Thần kinh..."
                          className="w-full bg-slate-900 border border-slate-700 focus:border-amber-500 rounded-lg px-3 py-2 text-slate-200 outline-none"
                        />
                      </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-1">
                      <label className="text-slate-300 font-semibold block">Mô tả ngắn gọn về template</label>
                      <input
                        type="text"
                        value={editingTemplate.description}
                        onChange={(e) => setEditingTemplate({ ...editingTemplate, description: e.target.value })}
                        placeholder="Mô tả mục tiêu kịch bản và cơ chế chính..."
                        className="w-full bg-slate-900 border border-slate-700 focus:border-amber-500 rounded-lg px-3 py-2 text-slate-200 outline-none text-xs"
                      />
                    </div>

                    {/* Mascot 3D Configuration Section */}
                    <div className="p-3.5 bg-slate-900/90 rounded-xl border border-amber-500/30 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-amber-300 font-bold flex items-center space-x-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={editingTemplate.data.useMascot !== false}
                            onChange={(e) =>
                              setEditingTemplate({
                                ...editingTemplate,
                                data: { ...editingTemplate.data, useMascot: e.target.checked },
                              })
                            }
                            className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-amber-500 focus:ring-0 cursor-pointer"
                          />
                          <Sparkles className="w-4 h-4 text-amber-400" />
                          <span>Sử dụng Mascot 3D trong Prompt</span>
                        </label>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                            editingTemplate.data.useMascot !== false
                              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                              : "bg-slate-800 text-slate-400 border-slate-700"
                          }`}
                        >
                          {editingTemplate.data.useMascot !== false ? "Đang BẬT Mascot" : "Đã TẮT Mascot"}
                        </span>
                      </div>

                      {editingTemplate.data.useMascot !== false ? (
                        <div className="space-y-3 pt-1">
                          <div className="space-y-1">
                            <label className="text-slate-300 font-semibold flex items-center space-x-1 text-xs">
                              <Shield className="w-3.5 h-3.5 text-amber-400" />
                              <span>Chữ Khắc Trên Khiên / Tên Mascot:</span>
                            </label>
                            <input
                              type="text"
                              value={editingTemplate.data.mascotName || ""}
                              onChange={(e) =>
                                setEditingTemplate({
                                  ...editingTemplate,
                                  data: { ...editingTemplate.data, mascotName: e.target.value },
                                })
                              }
                              placeholder="Trà Dây Bstar"
                              className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-lg px-3 py-2 text-amber-300 font-bold outline-none text-xs"
                            />
                          </div>

                          {/* Popup Mascot Prompt Trigger Card */}
                          <div
                            onClick={openMascotPromptPopup}
                            className="bg-slate-950/90 rounded-xl border border-amber-500/30 hover:border-amber-400/60 p-3 flex items-center justify-between cursor-pointer transition-all group"
                          >
                            <div className="flex items-center space-x-2.5 min-w-0 pr-3">
                              <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 group-hover:scale-105 transition-transform">
                                <Sparkles className="w-3.5 h-3.5" />
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center space-x-2">
                                  <span className="text-xs font-bold text-amber-300">
                                    Đặc tả Prompt Mascot 3D (Tiếng Anh - Tự động thay [mascotName])
                                  </span>
                                  <span className="text-[10px] px-1.5 py-0.2 bg-amber-950/60 text-amber-400 border border-amber-500/30 rounded">
                                    {(editingTemplate.data.mascotPrompt || DEFAULT_MASCOT_PROMPT).length} ký tự
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-400 truncate mt-0.5 max-w-xl">
                                  {editingTemplate.data.mascotPrompt || DEFAULT_MASCOT_PROMPT}
                                </p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                openMascotPromptPopup();
                              }}
                              className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold flex items-center space-x-1.5 shrink-0 transition-colors shadow-sm"
                            >
                              <Maximize2 className="w-3.5 h-3.5" />
                              <span>Mở Popup</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-[11px] text-slate-400 bg-slate-950 p-2.5 rounded-lg border border-slate-850">
                          ℹ️ Khi tắt mascot, AI sẽ tập trung 100% vào diễn xuất nhân vật chính và các góc quay 3D y khoa/đời thường, hoàn toàn không thêm giọt nước mascot hay khiên vàng vào kịch bản.
                        </p>
                      )}
                    </div>



                    {/* POPUP EDITOR CONTROL BAR & TOOLBAR */}
                    <div className="flex items-center justify-between pt-3 pb-1 border-t border-slate-800">
                      <div className="flex items-center space-x-2">
                        <Sliders className="w-4 h-4 text-amber-400" />
                        <div>
                          <span className="text-xs font-bold text-slate-200 block">
                            Các Khối Cấu Hình Chi Tiết Kịch Bản & 4 RULES BẮT BUỘC (Chỉnh sửa qua Popup)
                          </span>
                          <span className="text-[10px] text-slate-400">
                            Bấm vào từng khối bên dưới để mở cửa sổ Popup chuyên dụng với đầy đủ công cụ chèn biến số & sao chép
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* GROUP 1: BỘ 4 RULES BẮT BUỘC CỦA TEMPLATE */}
                    <div className="space-y-2.5 p-3 rounded-xl bg-slate-950/60 border border-indigo-500/30">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1.5 text-xs font-bold text-indigo-300">
                          <ShieldAlert className="w-4 h-4 text-amber-400" />
                          <span>BỘ 4 RULES BẮT BUỘC TRONG TEMPLATE (GLOBAL POLICY & CONSTRAINTS)</span>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30">
                          Ưu Tiên Tuyệt Đối 100%
                        </span>
                      </div>

                      {/* RULE 1: GLOBAL SAFETY & BRAND RULES */}
                      <div
                        onClick={openGlobalSafetyRulesPopup}
                        className="bg-slate-900/90 rounded-xl border border-emerald-500/40 hover:border-emerald-400/80 p-3 flex items-center justify-between cursor-pointer transition-all group shadow-sm hover:shadow-emerald-950/20"
                      >
                        <div className="flex items-center space-x-3 min-w-0 pr-3">
                          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0 group-hover:scale-105 transition-transform">
                            <Shield className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center space-x-2">
                              <span className="text-xs font-bold text-emerald-300">
                                1. [GLOBAL SAFETY & BRAND RULES]
                              </span>
                              <span className="text-[10px] px-1.5 py-0.2 bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 rounded font-semibold">
                                Cấm Gore & Y Tế Rợn
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 truncate mt-0.5 max-w-xl">
                              {editingTemplate.data.globalSafetyRules || DEFAULT_GLOBAL_SAFETY_RULES}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openGlobalSafetyRulesPopup();
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-semibold flex items-center space-x-1.5 shrink-0 transition-colors shadow-sm"
                        >
                          <Maximize2 className="w-3.5 h-3.5" />
                          <span>Mở Popup</span>
                        </button>
                      </div>

                      {/* RULE 2: GLOBAL CHARACTER CONSISTENCY RULES */}
                      <div
                        onClick={openGlobalCharacterRulesPopup}
                        className="bg-slate-900/90 rounded-xl border border-amber-500/40 hover:border-amber-400/80 p-3 flex items-center justify-between cursor-pointer transition-all group shadow-sm hover:shadow-amber-950/20"
                      >
                        <div className="flex items-center space-x-3 min-w-0 pr-3">
                          <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 group-hover:scale-105 transition-transform">
                            <Users className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center space-x-2">
                              <span className="text-xs font-bold text-amber-300">
                                2. [GLOBAL CHARACTER CONSISTENCY RULES]
                              </span>
                              <span className="text-[10px] px-1.5 py-0.2 bg-amber-950/80 text-amber-300 border border-amber-500/30 rounded font-semibold">
                                Khóa 100% Nhân Vật
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 truncate mt-0.5 max-w-xl">
                              {editingTemplate.data.globalCharacterRules || DEFAULT_GLOBAL_CHARACTER_RULES}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openGlobalCharacterRulesPopup();
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold flex items-center space-x-1.5 shrink-0 transition-colors shadow-sm"
                        >
                          <Maximize2 className="w-3.5 h-3.5" />
                          <span>Mở Popup</span>
                        </button>
                      </div>

                      {/* RULE 3: QUY TẮC TỪ NGỮ AN TOÀN (SAFE WORDS RULES) */}
                      <div
                        onClick={openSafeWordsPopup}
                        className="bg-slate-900/90 rounded-xl border border-emerald-500/30 hover:border-emerald-400/60 p-3 flex items-center justify-between cursor-pointer transition-all group shadow-sm hover:shadow-emerald-950/20"
                      >
                        <div className="flex items-center space-x-3 min-w-0 pr-3">
                          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 group-hover:scale-105 transition-transform">
                            <ShieldAlert className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center space-x-2">
                              <span className="text-xs font-bold text-emerald-300">
                                3. QUY TẮC TỪ NGỮ AN TOÀN (SAFE WORDS RULES)
                              </span>
                              <span className="text-[10px] px-1.5 py-0.2 bg-emerald-950/60 text-emerald-400 border border-emerald-500/30 rounded">
                                {(editingTemplate.data.customSafeWords || DEFAULT_SAFE_WORDS).length} ký tự
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 truncate mt-0.5 max-w-xl">
                              {editingTemplate.data.customSafeWords || DEFAULT_SAFE_WORDS}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openSafeWordsPopup();
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-semibold flex items-center space-x-1.5 shrink-0 transition-colors shadow-sm"
                        >
                          <Maximize2 className="w-3.5 h-3.5" />
                          <span>Mở Popup</span>
                        </button>
                      </div>

                      {/* RULE 4: QUY TẮC HÌNH ẢNH AN TOÀN (SAFE IMAGES RULES) */}
                      <div
                        onClick={openMandatoryImagePopup}
                        className="bg-slate-900/90 rounded-xl border border-purple-500/40 hover:border-purple-400/70 p-3 flex items-center justify-between cursor-pointer transition-all group shadow-sm hover:shadow-purple-950/20"
                      >
                        <div className="flex items-center space-x-3 min-w-0 pr-3">
                          <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400 shrink-0 group-hover:scale-105 transition-transform">
                            <ImageIcon className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center space-x-2">
                              <span className="text-xs font-bold text-purple-300">
                                4. QUY TẮC HÌNH ẢNH AN TOÀN (SAFE IMAGES & MANDATORY IMAGE RULES)
                              </span>
                              <span className="text-[10px] px-1.5 py-0.2 bg-purple-950/60 text-purple-300 border border-purple-500/30 rounded">
                                Khóa 9:16 & 3D Pixar
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 truncate mt-0.5 max-w-xl">
                              {editingTemplate.data.mandatoryImageRules || DEFAULT_MANDATORY_IMAGE_RULES}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openMandatoryImagePopup();
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 text-xs font-semibold flex items-center space-x-1.5 shrink-0 transition-colors shadow-sm"
                        >
                          <Maximize2 className="w-3.5 h-3.5" />
                          <span>Mở Popup</span>
                        </button>
                      </div>
                    </div>

                    {/* GROUP 2: QUY TẮC TỪ LÓNG & ÂM THANH / VIDEO */}
                    <div className="space-y-2.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-200">
                          <Tag className="w-4 h-4 text-indigo-400" />
                          <span>QUY TẮC TỪ LÓNG VÙNG MIỀN, ĐỆM Y KHOA & ĐẶC TẢ ÂM THANH / VIDEO</span>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-semibold border border-slate-700">
                          Quy Chuẩn Giọng & Đệm
                        </span>
                      </div>

                      {/* QUY TẮC TỪ LÓNG VÙNG MIỀN & VÙNG ĐỆM CHUYÊN MÔN */}
                      <div
                        onClick={openSlangAndPaddingPopup}
                        className="bg-slate-900/90 rounded-xl border border-indigo-500/30 hover:border-indigo-400/60 p-3 flex items-center justify-between cursor-pointer transition-all group shadow-sm hover:shadow-indigo-950/20"
                      >
                        <div className="flex items-center space-x-3 min-w-0 pr-3">
                          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0 group-hover:scale-105 transition-transform">
                            <Tag className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center space-x-2">
                              <span className="text-xs font-bold text-indigo-300">
                                Quy tắc từ Lóng Vùng Miền & Vùng Đệm Chuyên Môn
                              </span>
                              <span className="text-[10px] px-1.5 py-0.2 bg-indigo-950/60 text-indigo-400 border border-indigo-500/30 rounded">
                                {(editingTemplate.data.customSlangWords || DEFAULT_SLANG_WORDS).length} ký tự
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 truncate mt-0.5 max-w-xl">
                              {editingTemplate.data.customSlangWords || DEFAULT_SLANG_WORDS}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openSlangAndPaddingPopup();
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 text-xs font-semibold flex items-center space-x-1.5 shrink-0 transition-colors shadow-sm"
                        >
                          <Maximize2 className="w-3.5 h-3.5" />
                          <span>Mở Popup</span>
                        </button>
                      </div>

                      {/* QUY TẮC BẮT BUỘC ÂM THANH & GIỌNG ĐỌC */}
                      <div
                        onClick={openMandatoryAudioPopup}
                        className="bg-slate-900/90 rounded-xl border border-sky-500/40 hover:border-sky-400/70 p-3 flex items-center justify-between cursor-pointer transition-all group shadow-sm hover:shadow-sky-950/20"
                      >
                        <div className="flex items-center space-x-3 min-w-0 pr-3">
                          <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400 shrink-0 group-hover:scale-105 transition-transform">
                            <Mic className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center space-x-2">
                              <span className="text-xs font-bold text-sky-300">
                                Quy Tắc BẮT BUỘC Âm Thanh & Giọng Đọc (Mandatory Audio Rules)
                              </span>
                              <span className="text-[10px] px-1.5 py-0.2 bg-sky-950/60 text-sky-300 border border-sky-500/30 rounded">
                                85-110 WPM
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 truncate mt-0.5 max-w-xl">
                              {editingTemplate.data.mandatoryAudioRules || DEFAULT_MANDATORY_AUDIO_RULES}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openMandatoryAudioPopup();
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 text-xs font-semibold flex items-center space-x-1.5 shrink-0 transition-colors shadow-sm"
                        >
                          <Maximize2 className="w-3.5 h-3.5" />
                          <span>Mở Popup</span>
                        </button>
                      </div>

                      {/* QUY TẮC BẮT BUỘC VIDEO & CHUYỂN ĐỘNG */}
                      <div
                        onClick={openMandatoryVideoPopup}
                        className="bg-slate-900/90 rounded-xl border border-amber-500/40 hover:border-amber-400/70 p-3 flex items-center justify-between cursor-pointer transition-all group shadow-sm hover:shadow-amber-950/20"
                      >
                        <div className="flex items-center space-x-3 min-w-0 pr-3">
                          <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 group-hover:scale-105 transition-transform">
                            <Video className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center space-x-2">
                              <span className="text-xs font-bold text-amber-300">
                                Quy Tắc BẮT BUỘC Video & Chuyển Động (Mandatory Video Rules)
                              </span>
                              <span className="text-[10px] px-1.5 py-0.2 bg-amber-950/60 text-amber-300 border border-amber-500/30 rounded">
                                Chuẩn VEO3/Kling
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 truncate mt-0.5 max-w-xl">
                              {editingTemplate.data.mandatoryVideoRules || DEFAULT_MANDATORY_VIDEO_RULES}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openMandatoryVideoPopup();
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold flex items-center space-x-1.5 shrink-0 transition-colors shadow-sm"
                        >
                          <Maximize2 className="w-3.5 h-3.5" />
                          <span>Mở Popup</span>
                        </button>
                      </div>
                    </div>

                    {/* GROUP 3: HỆ THỐNG PROMPT 5 BƯỚC & NÂNG CAO */}
                    <div className="space-y-2.5 p-3 rounded-xl bg-slate-950/60 border border-purple-500/30">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1.5 text-xs font-bold text-purple-300">
                          <Wand2 className="w-4 h-4 text-purple-400" />
                          <span>HỆ THỐNG PROMPT 5 BƯỚC & NÂNG CAO (B1 - B5 & VIDEO STYLE)</span>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-semibold border border-purple-500/30">
                          5-Step Workflow
                        </span>
                      </div>

                      {/* B1: PROMPT TẠO HỘI THOẠI */}
                      <div
                        onClick={openDialoguePromptPopup}
                        className="bg-slate-900/90 rounded-xl border border-sky-500/50 hover:border-sky-400 p-3 flex items-center justify-between cursor-pointer transition-all group shadow-sm hover:shadow-sky-950/20"
                      >
                        <div className="flex items-center space-x-3 min-w-0 pr-3">
                          <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400 shrink-0 group-hover:scale-105 transition-transform">
                            <MessageSquare className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center space-x-2">
                              <span className="text-xs font-bold text-sky-300">
                                B1: Prompt tạo hội thoại
                              </span>
                              <span className="text-[10px] px-1.5 py-0.2 bg-sky-950/80 text-sky-300 border border-sky-500/40 rounded font-semibold">
                                Hội Thoại 5 Cảnh 9:16
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 truncate mt-0.5 max-w-xl">
                              {editingTemplate.data.dialoguePromptTemplate || DEFAULT_DIALOGUE_PROMPT_TEMPLATE}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openDialoguePromptPopup();
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 text-xs font-semibold flex items-center space-x-1.5 shrink-0 transition-colors shadow-sm"
                        >
                          <Maximize2 className="w-3.5 h-3.5" />
                          <span>Mở Popup</span>
                        </button>
                      </div>

                      {/* B2: PROMPT TẠO STORYBOARD */}
                      <div
                        onClick={openStoryboardPromptPopup}
                        className="bg-slate-900/90 rounded-xl border border-purple-500/50 hover:border-purple-400 p-3 flex items-center justify-between cursor-pointer transition-all group shadow-md shadow-purple-950/20 hover:shadow-purple-950/40"
                      >
                        <div className="flex items-center space-x-3 min-w-0 pr-3">
                          <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400 shrink-0 group-hover:scale-105 transition-transform">
                            <LayoutGrid className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center space-x-2">
                              <span className="text-xs font-bold text-purple-300">
                                B2: Prompt tạo storyboard
                              </span>
                              <span className="text-[10px] px-1.5 py-0.2 bg-purple-950/80 text-purple-300 border border-purple-500/40 rounded font-semibold">
                                Storyboard Grid 9:16
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 truncate mt-0.5 max-w-xl">
                              {editingTemplate.data.storyboardPromptTemplate ||
                                editingTemplate.data.imagePromptTemplate ||
                                DEFAULT_STORYBOARD_PROMPT_TEMPLATE}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openStoryboardPromptPopup();
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 text-xs font-semibold flex items-center space-x-1.5 shrink-0 transition-colors shadow-sm"
                        >
                          <Maximize2 className="w-3.5 h-3.5" />
                          <span>Mở Popup</span>
                        </button>
                      </div>

                      {/* B3: PROMPT TẠO CẢNH */}
                      <div
                        onClick={openScenePromptPopup}
                        className="bg-slate-900/90 rounded-xl border border-indigo-500/50 hover:border-indigo-400 p-3 flex items-center justify-between cursor-pointer transition-all group shadow-sm hover:shadow-indigo-950/20"
                      >
                        <div className="flex items-center space-x-3 min-w-0 pr-3">
                          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shrink-0 group-hover:scale-105 transition-transform">
                            <ImageIcon className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center space-x-2">
                              <span className="text-xs font-bold text-indigo-300">
                                B3: Prompt tạo cảnh
                              </span>
                              <span className="text-[10px] px-1.5 py-0.2 bg-indigo-950/80 text-indigo-300 border border-indigo-500/40 rounded font-semibold">
                                Cảnh Tĩnh & Chuyển Cảnh N+1
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 truncate mt-0.5 max-w-xl">
                              {editingTemplate.data.scenePromptTemplate ||
                                editingTemplate.data.imagePromptTemplate ||
                                DEFAULT_SCENE_PROMPT_TEMPLATE}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openScenePromptPopup();
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 text-xs font-semibold flex items-center space-x-1.5 shrink-0 transition-colors shadow-sm"
                        >
                          <Maximize2 className="w-3.5 h-3.5" />
                          <span>Mở Popup</span>
                        </button>
                      </div>

                      {/* B4: PROMPT TẠO THUMBNAIL */}
                      <div
                        onClick={openThumbnailPromptPopup}
                        className="bg-slate-900/90 rounded-xl border border-pink-500/50 hover:border-pink-400 p-3 flex items-center justify-between cursor-pointer transition-all group shadow-md shadow-pink-950/20 hover:shadow-pink-950/40"
                      >
                        <div className="flex items-center space-x-3 min-w-0 pr-3">
                          <div className="w-8 h-8 rounded-lg bg-pink-500/20 border border-pink-500/40 flex items-center justify-center text-pink-400 shrink-0 group-hover:scale-105 transition-transform">
                            <ImageIcon className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center space-x-2">
                              <span className="text-xs font-bold text-pink-300">
                                B4: Prompt tạo thumbnail
                              </span>
                              <span className="text-[10px] px-1.5 py-0.2 bg-pink-950/80 text-pink-300 border border-pink-500/40 rounded font-semibold">
                                Stop The Scroll 9:16
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 truncate mt-0.5 max-w-xl">
                              {editingTemplate.data.thumbnailPromptTemplate || DEFAULT_THUMBNAIL_PROMPT_TEMPLATE}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openThumbnailPromptPopup();
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 border border-pink-500/40 text-xs font-semibold flex items-center space-x-1.5 shrink-0 transition-colors shadow-sm"
                        >
                          <Maximize2 className="w-3.5 h-3.5" />
                          <span>Mở Popup</span>
                        </button>
                      </div>

                      {/* B5: PROMPT TẠO VEO */}
                      <div
                        onClick={openVeoPromptPopup}
                        className="bg-slate-900/90 rounded-xl border border-amber-500/50 hover:border-amber-400 p-3 flex items-center justify-between cursor-pointer transition-all group shadow-sm hover:shadow-amber-950/20"
                      >
                        <div className="flex items-center space-x-3 min-w-0 pr-3">
                          <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 group-hover:scale-105 transition-transform">
                            <Video className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center space-x-2">
                              <span className="text-xs font-bold text-amber-300">
                                B5: Prompt tạo veo
                              </span>
                              <span className="text-[10px] px-1.5 py-0.2 bg-amber-950/80 text-amber-300 border border-amber-500/40 rounded font-semibold">
                                Chuỗi VEO 3 / Kling & JSON
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 truncate mt-0.5 max-w-xl">
                              {editingTemplate.data.veoPromptTemplate ||
                                editingTemplate.data.videoPromptTemplate ||
                                DEFAULT_VEO_PROMPT_TEMPLATE}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openVeoPromptPopup();
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold flex items-center space-x-1.5 shrink-0 transition-colors shadow-sm"
                        >
                          <Maximize2 className="w-3.5 h-3.5" />
                          <span>Mở Popup</span>
                        </button>
                      </div>

                      {/* NÂNG CAO: PROMPT VIDEO STYLE */}
                      <div
                        onClick={openVideoStylePromptPopup}
                        className="bg-slate-900/90 rounded-xl border border-violet-500/50 hover:border-violet-400 p-3 flex items-center justify-between cursor-pointer transition-all group shadow-sm hover:shadow-violet-950/20"
                      >
                        <div className="flex items-center space-x-3 min-w-0 pr-3">
                          <div className="w-8 h-8 rounded-lg bg-violet-500/20 border border-violet-500/40 flex items-center justify-center text-violet-400 shrink-0 group-hover:scale-105 transition-transform">
                            <Palette className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center space-x-2">
                              <span className="text-xs font-bold text-violet-300">
                                Nâng cao: Prompt video style
                              </span>
                              <span className="text-[10px] px-1.5 py-0.2 bg-violet-950/80 text-violet-300 border border-violet-500/40 rounded font-semibold">
                                3D Pixar Visual Style
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 truncate mt-0.5 max-w-xl">
                              {editingTemplate.data.videoStylePrompt || editingTemplate.data.style || DEFAULT_VIDEO_STYLE_PROMPT}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openVideoStylePromptPopup();
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-violet-500/20 hover:bg-violet-500/30 text-violet-300 border border-violet-500/40 text-xs font-semibold flex items-center space-x-1.5 shrink-0 transition-colors shadow-sm"
                        >
                          <Maximize2 className="w-3.5 h-3.5" />
                          <span>Mở Popup</span>
                        </button>
                      </div>

                      {/* GHI CHÚ BỔ SUNG */}
                      <div
                        onClick={openCustomNotesPopup}
                        className="bg-slate-900/90 rounded-xl border border-slate-800 hover:border-slate-700 p-3 flex items-center justify-between cursor-pointer transition-all group shadow-sm"
                      >
                        <div className="flex items-center space-x-3 min-w-0 pr-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 shrink-0 group-hover:scale-105 transition-transform">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center space-x-2">
                              <span className="text-xs font-bold text-slate-300">
                                Ghi chú bổ sung riêng cho Template
                              </span>
                              <span className="text-[10px] px-1.5 py-0.2 bg-slate-800 text-slate-400 border border-slate-700 rounded">
                                {(editingTemplate.data.customNotes || "").length} ký tự
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 truncate mt-0.5 max-w-xl">
                              {editingTemplate.data.customNotes || "Chưa có ghi chú riêng... (Bấm để thêm)"}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openCustomNotesPopup();
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold flex items-center space-x-1.5 shrink-0 transition-colors shadow-sm"
                        >
                          <Maximize2 className="w-3.5 h-3.5" />
                          <span>Mở Popup</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: MULTI-THREADING & PERFORMANCE */}
          {activeTab === "threading" && (
            <div className="space-y-4">
              {/* Concurrency Selector */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span className="font-bold text-slate-200">Số luồng chạy đồng thời (Concurrency)</span>
                  </div>
                  <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 rounded-lg font-mono font-bold text-sm">
                    {settings.concurrency} Luồng song song
                  </span>
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Khi chạy hàng loạt (Batch), hệ thống sẽ mở đồng thời {settings.concurrency} luồng xử lý độc lập
                  để hoàn thiện chuỗi 5 bước kịch bản nhanh gấp {settings.concurrency} lần.
                </p>

                {/* Slider */}
                <input
                  type="range"
                  min={1}
                  max={10}
                  step={1}
                  value={settings.concurrency}
                  onChange={(e) => setSettings({ ...settings, concurrency: parseInt(e.target.value, 10) })}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />

                {/* Quick Presets */}
                <div className="grid grid-cols-4 gap-2 pt-1">
                  {[
                    { count: 1, label: "1 Luồng", desc: "Tuần tự an toàn" },
                    { count: 3, label: "3 Luồng", desc: "Cân bằng đề xuất" },
                    { count: 5, label: "5 Luồng", desc: "Tốc độ cao" },
                    { count: 8, label: "8 Luồng", desc: "Siêu tốc độ" },
                  ].map((preset) => (
                    <button
                      key={preset.count}
                      type="button"
                      onClick={() => setSettings({ ...settings, concurrency: preset.count })}
                      className={`p-2 rounded-xl border text-center transition-all ${
                        settings.concurrency === preset.count
                          ? "bg-indigo-600/30 border-indigo-500 text-white font-bold"
                          : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <div className="text-xs">{preset.label}</div>
                      <div className="text-[9px] text-slate-400 mt-0.5">{preset.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Rate Limiting & Retry Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                  <label className="font-semibold text-slate-300 block flex items-center space-x-1.5">
                    <RotateCcw className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Tự động thử lại khi lỗi (Retry)</span>
                  </label>
                  <select
                    value={settings.retryAttempts}
                    onChange={(e) => setSettings({ ...settings, retryAttempts: parseInt(e.target.value, 10) })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200 outline-none"
                  >
                    <option value={0}>Không thử lại (0 lần)</option>
                    <option value={1}>Thử lại tối đa 1 lần</option>
                    <option value={2}>Thử lại tối đa 2 lần (Khuyên dùng)</option>
                    <option value={3}>Thử lại tối đa 3 lần</option>
                  </select>
                  <p className="text-[10px] text-slate-400">
                    Tự động gửi lại request khi OpenRouter hoặc mạng bị timeout đột ngột.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                  <label className="font-semibold text-slate-300 block flex items-center space-x-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Độ trễ đệm giữa các bước</span>
                  </label>
                  <select
                    value={settings.delayBetweenStepsMs}
                    onChange={(e) =>
                      setSettings({ ...settings, delayBetweenStepsMs: parseInt(e.target.value, 10) })
                    }
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200 outline-none"
                  >
                    <option value={0}>0ms (Không trễ)</option>
                    <option value={200}>200ms</option>
                    <option value={350}>350ms (Chuẩn)</option>
                    <option value={600}>600ms (Chống 429 Rate Limit)</option>
                    <option value={1000}>1000ms (An toàn cao)</option>
                  </select>
                  <p className="text-[10px] text-slate-400">
                    Khoảng nghỉ ngắn giữa các bước để tránh chạm ngưỡng giới hạn Rate Limit của API.
                  </p>
                </div>
              </div>

              {/* Auto save checkbox */}
              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-200 block">Tự động lưu kịch bản hoàn thành vào Lịch sử</span>
                  <span className="text-[11px] text-slate-400">
                    Mỗi khi 1 kịch bản trong hàng loạt xong 5 bước, tự động lưu vào bộ nhớ cục bộ
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.autoSaveToHistory}
                  onChange={(e) => setSettings({ ...settings, autoSaveToHistory: e.target.checked })}
                  className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-0 cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* TAB 3: AI & PROVIDERS */}
          {activeTab === "ai" && (
            <div className="space-y-4">
              {/* Provider Selection (3 Options) */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <label className="text-slate-300 font-bold block">Nhà cung cấp dịch vụ AI (AI Engine)</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                  {/* Option 1: OpenRouter */}
                  <button
                    type="button"
                    onClick={() => setSettings({ ...settings, aiProvider: "openrouter" })}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      settings.aiProvider === "openrouter"
                        ? "bg-amber-500/10 border-amber-500/50 text-amber-200 shadow-md shadow-amber-500/5 ring-1 ring-amber-500/30"
                        : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <div className="font-bold flex items-center space-x-1.5">
                      <Key className="w-3.5 h-3.5 text-amber-400" />
                      <span>OpenRouter API</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Cổng kết nối đa nền tảng hơn 300+ models (Claude 3.7, GPT-4o, Grok, DeepSeek).
                    </p>
                  </button>

                  {/* Option 2: Custom API (OpenAI Compatible) */}
                  <button
                    type="button"
                    onClick={() => setSettings({ ...settings, aiProvider: "custom" })}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      settings.aiProvider === "custom"
                        ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-200 shadow-md shadow-emerald-500/5 ring-1 ring-emerald-500/30"
                        : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <div className="font-bold flex items-center space-x-1.5">
                      <Server className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Custom API (OpenAI)</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Tự điền Base URL, Key & Model ID (OpenAI, DeepSeek, Groq, Ollama, vLLM...).
                    </p>
                  </button>

                  {/* Option 3: Gemini */}
                  <button
                    type="button"
                    onClick={() => setSettings({ ...settings, aiProvider: "gemini" })}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      settings.aiProvider === "gemini"
                        ? "bg-indigo-500/10 border-indigo-500/50 text-indigo-200 shadow-md shadow-indigo-500/5 ring-1 ring-indigo-500/30"
                        : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <div className="font-bold flex items-center space-x-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Google Gemini</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Mô hình Gemini 2.5 Flash tốc độ cao tích hợp sẵn trực tiếp trong Studio.
                    </p>
                  </button>
                </div>
              </div>

              {/* VIEW 1: CUSTOM API CONFIGURATION */}
              {settings.aiProvider === "custom" && (
                <div className="space-y-3 animate-in fade-in duration-200">
                  <div className="p-4 bg-slate-950 rounded-xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/20 via-slate-950 to-slate-950 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                          <Server className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-emerald-300">
                            Cấu Hình Kết Nối Custom API (OpenAI Compatible)
                          </h4>
                          <p className="text-[11px] text-slate-400">
                            Chỉ cần điền Endpoint Base URL, API Key và Model ID để kết nối trực tiếp
                          </p>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full">
                        POST /chat/completions
                      </span>
                    </div>

                    {/* Base URL (Endpoint) */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-slate-200 flex items-center space-x-1.5">
                          <Globe className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Endpoint Base URL</span>
                        </label>
                        <span className="text-[10px] text-slate-500 font-mono">Ví dụ: https://api.openai.com/v1</span>
                      </div>
                      <div className="relative">
                        <input
                          type="text"
                          value={settings.customBaseUrl || ""}
                          onChange={(e) => setSettings({ ...settings, customBaseUrl: e.target.value })}
                          placeholder="https://api.openai.com/v1"
                          className="w-full bg-slate-900 border border-slate-700 focus:border-emerald-500 rounded-xl px-3 py-2.5 text-slate-100 text-xs font-mono outline-none"
                        />
                      </div>

                      {/* Quick Presets for Base URL */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="text-[10px] text-slate-400 mr-1">Mẫu nhanh:</span>
                        {[
                          { label: "OpenAI", url: "https://api.openai.com/v1", model: "gpt-4o" },
                          { label: "DeepSeek", url: "https://api.deepseek.com/v1", model: "deepseek-chat" },
                          { label: "Groq", url: "https://api.groq.com/openai/v1", model: "llama-3.3-70b-versatile" },
                          { label: "Together AI", url: "https://api.together.xyz/v1", model: "meta-llama/Llama-3.3-70B-Instruct-Turbo" },
                          { label: "Ollama Local", url: "http://localhost:11434/v1", model: "llama3" },
                          { label: "LM Studio", url: "http://localhost:1234/v1", model: "local-model" },
                        ].map((preset) => (
                          <button
                            key={preset.label}
                            type="button"
                            onClick={() => {
                              setSettings((prev) => ({
                                ...prev,
                                customBaseUrl: preset.url,
                                customModelId: prev.customModelId || preset.model,
                              }));
                            }}
                            className="px-2 py-0.5 bg-slate-850 hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-300 border border-slate-750 hover:border-emerald-500/40 rounded text-[10px] transition-colors cursor-pointer"
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Custom API Key */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-slate-200 flex items-center space-x-1.5">
                          <Key className="w-3.5 h-3.5 text-emerald-400" />
                          <span>API Key (Bearer Token)</span>
                          {(settings.customApiKey || "").trim() ? (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                              ✓ Đã điền Key
                            </span>
                          ) : (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                              Để trống nếu dùng local (Ollama/LM Studio)
                            </span>
                          )}
                        </label>
                      </div>
                      <div className="relative">
                        <input
                          type={showCustomKeyPassword ? "text" : "password"}
                          value={settings.customApiKey || ""}
                          onChange={(e) => setSettings({ ...settings, customApiKey: e.target.value })}
                          placeholder="sk-..."
                          className="w-full bg-slate-900 border border-slate-700 focus:border-emerald-500 rounded-xl px-3 py-2.5 text-slate-100 text-xs font-mono outline-none pr-20"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCustomKeyPassword(!showCustomKeyPassword)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 px-2 py-1 text-[10px] font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 cursor-pointer"
                        >
                          {showCustomKeyPassword ? "Ẩn" : "Hiện"}
                        </button>
                      </div>
                    </div>

                    {/* Custom Model ID */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-slate-200 flex items-center space-x-1.5">
                          <Cpu className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Mã Model ID (Model Name)</span>
                        </label>
                        <span className="text-[10px] text-slate-500 font-mono">Ví dụ: gpt-4o, deepseek-chat</span>
                      </div>
                      <input
                        type="text"
                        value={settings.customModelId || ""}
                        onChange={(e) => setSettings({ ...settings, customModelId: e.target.value })}
                        placeholder="gpt-4o"
                        className="w-full bg-slate-900 border border-slate-700 focus:border-emerald-500 rounded-xl px-3 py-2.5 text-slate-100 text-xs font-mono outline-none"
                      />

                      {/* Quick Model Tags */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="text-[10px] text-slate-400 mr-1">Model phổ biến:</span>
                        {[
                          "gpt-4o",
                          "gpt-4o-mini",
                          "deepseek-chat",
                          "deepseek-reasoner",
                          "llama-3.3-70b-versatile",
                          "qwen-2.5-72b-instruct",
                          "claude-3-7-sonnet-20250219",
                        ].map((mName) => (
                          <button
                            key={mName}
                            type="button"
                            onClick={() => setSettings((prev) => ({ ...prev, customModelId: mName }))}
                            className="px-2 py-0.5 bg-slate-850 hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-300 border border-slate-750 hover:border-emerald-500/40 rounded text-[10px] font-mono transition-colors cursor-pointer"
                          >
                            {mName}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* TÁCH BẬT/TẮT RIÊNG CHO MODEL VIẾT KỊCH BẢN (BƯỚC 1 & 2) & TẠO ẢNH/VISUAL (BƯỚC 3, 4, 5) */}
                    <div className="space-y-3 pt-1">
                      {/* TOGGLE 1: MODEL VIẾT KỊCH BẢN (BƯỚC 1 & 2) */}
                      <div className={`p-3.5 rounded-xl border transition-all ${
                        settings.customUseSeparateWritingModel
                          ? "bg-amber-950/20 border-amber-500/50 shadow-sm"
                          : "bg-slate-900/60 border-slate-800"
                      }`}>
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-start space-x-2.5">
                            <span className="text-base leading-none mt-0.5">✍️</span>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-slate-100">
                                  Tách riêng Model Viết Kịch Bản
                                </span>
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                  Bước 1 & 2
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-400 mt-0.5">
                                Chỉ định model chuyên văn phong tự nhiên, từ lóng & chống bẻ giọng AI cho Lời thoại và Storyboard.
                              </p>
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer shrink-0">
                            <input
                              type="checkbox"
                              checked={settings.customUseSeparateWritingModel || false}
                              onChange={(e) =>
                                setSettings({ ...settings, customUseSeparateWritingModel: e.target.checked })
                              }
                              className="sr-only peer"
                            />
                            <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
                          </label>
                        </div>

                        {settings.customUseSeparateWritingModel ? (
                          <div className="mt-3 pt-3 border-t border-amber-500/20 space-y-2 animate-in fade-in">
                            <label className="text-[11px] font-semibold text-amber-300 flex items-center justify-between">
                              <span>Tên / ID Model Viết (Bước 1 & 2):</span>
                              <span className="text-[10px] text-slate-400 font-mono">Ví dụ: ag/gemini-3.7-flash-medium</span>
                            </label>
                            <input
                              type="text"
                              value={settings.customWritingModelId || ""}
                              onChange={(e) =>
                                setSettings({ ...settings, customWritingModelId: e.target.value })
                              }
                              placeholder="ag/gemini-3.7-flash-medium"
                              className="w-full bg-slate-950 border border-amber-500/50 focus:border-amber-400 focus:ring-1 focus:ring-amber-500 rounded-lg px-3 py-2 text-xs font-mono text-amber-100 outline-none placeholder-slate-600"
                            />
                            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                              <span className="text-[10px] text-slate-400">Gợi ý:</span>
                              {[
                                "ag/gemini-3.7-flash-medium",
                                "claude-3-7-sonnet-20250219",
                                "deepseek-chat",
                                "gpt-4o",
                              ].map((mName) => (
                                <button
                                  key={mName}
                                  type="button"
                                  onClick={() => setSettings((prev) => ({ ...prev, customWritingModelId: mName }))}
                                  className="px-2 py-0.5 bg-slate-900 hover:bg-amber-500/20 text-slate-300 hover:text-amber-200 border border-slate-700 hover:border-amber-500/40 rounded text-[10px] font-mono transition-colors cursor-pointer"
                                >
                                  {mName}
                                </button>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="mt-2 text-[10px] text-slate-400 flex items-center gap-1.5 bg-slate-950/50 px-2.5 py-1.5 rounded-lg border border-slate-800/80">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
                            <span>Đang dùng chung model mặc định: <strong className="font-mono text-slate-300">{settings.customModelId || "gpt-4o"}</strong></span>
                          </div>
                        )}
                      </div>

                      {/* TOGGLE 2: MODEL TẠO PROMPT ẢNH / VISUAL (BƯỚC 3, 4, 5) */}
                      <div className={`p-3.5 rounded-xl border transition-all ${
                        settings.customUseSeparateImageModel
                          ? "bg-indigo-950/20 border-indigo-500/50 shadow-sm"
                          : "bg-slate-900/60 border-slate-800"
                      }`}>
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-start space-x-2.5">
                            <span className="text-base leading-none mt-0.5">🎨</span>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-slate-100">
                                  Tách riêng Model Tạo Prompt Visual / Ảnh & Video
                                </span>
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                  Bước 3, 4, 5
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-400 mt-0.5">
                                Chỉ định model tạo Prompts 3D Pixar, Midjourney, Veo 3 và Thumbnail Stop-the-Scroll điện ảnh.
                              </p>
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer shrink-0">
                            <input
                              type="checkbox"
                              checked={settings.customUseSeparateImageModel || false}
                              onChange={(e) =>
                                setSettings({ ...settings, customUseSeparateImageModel: e.target.checked })
                              }
                              className="sr-only peer"
                            />
                            <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-500"></div>
                          </label>
                        </div>

                        {settings.customUseSeparateImageModel ? (
                          <div className="mt-3 pt-3 border-t border-indigo-500/20 space-y-2 animate-in fade-in">
                            <label className="text-[11px] font-semibold text-indigo-300 flex items-center justify-between">
                              <span>Tên / ID Model Visual (Bước 3, 4, 5):</span>
                              <span className="text-[10px] text-slate-400 font-mono">Ví dụ: gpt-4o</span>
                            </label>
                            <input
                              type="text"
                              value={settings.customImageModelId || ""}
                              onChange={(e) =>
                                setSettings({ ...settings, customImageModelId: e.target.value })
                              }
                              placeholder="gpt-4o"
                              className="w-full bg-slate-950 border border-indigo-500/50 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-500 rounded-lg px-3 py-2 text-xs font-mono text-indigo-100 outline-none placeholder-slate-600"
                            />
                            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                              <span className="text-[10px] text-slate-400">Gợi ý:</span>
                              {[
                                "gpt-4o",
                                "gpt-4o-mini",
                                "qwen-2.5-72b-instruct",
                                "claude-3-7-sonnet-20250219",
                              ].map((mName) => (
                                <button
                                  key={mName}
                                  type="button"
                                  onClick={() => setSettings((prev) => ({ ...prev, customImageModelId: mName }))}
                                  className="px-2 py-0.5 bg-slate-900 hover:bg-indigo-500/20 text-slate-300 hover:text-indigo-200 border border-slate-700 hover:border-indigo-500/40 rounded text-[10px] font-mono transition-colors cursor-pointer"
                                >
                                  {mName}
                                </button>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="mt-2 text-[10px] text-slate-400 flex items-center gap-1.5 bg-slate-950/50 px-2.5 py-1.5 rounded-lg border border-slate-800/80">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
                            <span>Đang dùng chung model mặc định: <strong className="font-mono text-slate-300">{settings.customModelId || "gpt-4o"}</strong></span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* MAX OUTPUT TOKENS & QUOTA PROTECTOR */}
                    <div className="p-3 bg-slate-950 rounded-xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/20 to-slate-950 space-y-2">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center space-x-2">
                          <Sliders className="w-4 h-4 text-emerald-400" />
                          <div>
                            <span className="font-bold text-slate-100 block text-xs">
                              Giới Hạn Max Output Tokens
                            </span>
                            <span className="text-[10px] text-slate-400">
                              Mặc định 4,096 tokens đủ cho 5 bước kịch bản và tránh hao hụt số dư.
                            </span>
                          </div>
                        </div>
                        <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                          {settings.maxTokens || 4096} tokens
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap pt-1">
                        {[2048, 3072, 4096, 6144, 8192].map((tokens) => (
                          <button
                            key={tokens}
                            type="button"
                            onClick={() => setSettings({ ...settings, maxTokens: tokens })}
                            className={`px-2.5 py-1 text-[11px] font-medium rounded-lg border transition-all cursor-pointer ${
                              (settings.maxTokens || 4096) === tokens
                                ? "bg-emerald-600 text-white border-emerald-500 shadow-sm"
                                : "bg-slate-900 text-slate-400 border-slate-700 hover:text-slate-200 hover:bg-slate-800"
                            }`}
                          >
                            {tokens.toLocaleString()} {tokens === 4096 ? "★ Chuẩn" : ""}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Test Custom API Live Connection */}
                    <div className="pt-1 space-y-2">
                      <button
                        type="button"
                        onClick={handleTestCustomConnection}
                        disabled={isTestingCustom || !settings.customBaseUrl}
                        className="w-full py-2.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-slate-950 font-bold rounded-xl flex items-center justify-center space-x-2 transition-colors shadow-lg shadow-emerald-600/20 cursor-pointer"
                      >
                        {isTestingCustom ? (
                          <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4 text-slate-950" />
                        )}
                        <span>Kiểm tra kết nối Live (Test Custom API Endpoint)</span>
                      </button>

                      {customTestResult && (
                        <div
                          className={`p-3 rounded-xl border flex items-start space-x-2 animate-in fade-in ${
                            customTestResult.success
                              ? "bg-emerald-950/60 border-emerald-500/50 text-emerald-200"
                              : "bg-rose-950/60 border-rose-500/50 text-rose-200"
                          }`}
                        >
                          {customTestResult.success ? (
                            <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
                          )}
                          <div className="leading-relaxed text-xs">
                            <span className="font-semibold">{customTestResult.message}</span>
                            {customTestResult.latencyMs && (
                              <span className="ml-2 px-1.5 py-0.5 bg-emerald-500/20 text-emerald-300 rounded font-mono text-[10px]">
                                {customTestResult.latencyMs}ms
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* VIEW 2: OPENROUTER CONFIGURATION */}
              {settings.aiProvider === "openrouter" && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  {/* API Key Input */}
                  <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-slate-200 font-bold flex items-center space-x-1.5">
                        <Key className="w-3.5 h-3.5 text-amber-400" />
                        <span>OpenRouter API Key (Bearer Token)</span>
                        {settings.openRouterApiKey.trim() ? (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            ✓ Đã có Key
                          </span>
                        ) : (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                            Chưa nhập Key
                          </span>
                        )}
                      </label>
                      <a
                        href="https://openrouter.ai/keys"
                        target="_blank"
                        rel="noreferrer"
                        className="text-amber-400 hover:text-amber-300 flex items-center space-x-1 underline text-[11px]"
                      >
                        <span>Lấy API Key tại openrouter.ai</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>

                    <div className="relative">
                      <input
                        type={showKeyPassword ? "text" : "password"}
                        value={settings.openRouterApiKey}
                        onChange={(e) => setSettings({ ...settings, openRouterApiKey: e.target.value })}
                        placeholder="sk-or-v1-..."
                        className="w-full bg-slate-900 border border-slate-700 focus:border-amber-500 rounded-xl px-3 py-2.5 text-slate-200 text-xs font-mono outline-none pr-20"
                      />
                      <button
                        type="button"
                        onClick={() => setShowKeyPassword(!showKeyPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 px-2 py-1 text-[10px] font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700"
                      >
                        {showKeyPassword ? "Ẩn" : "Hiện"}
                      </button>
                    </div>
                  </div>

              {/* SEPARATE MODELS TOGGLE */}
              <div className="p-3.5 bg-slate-950 rounded-xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/20 to-slate-950 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Sliders className="w-4 h-4 text-indigo-400" />
                    <div>
                      <span className="font-bold text-slate-100 block text-xs">
                        Tách riêng Model Viết Kịch Bản & Model Tạo Prompt Ảnh/Video
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Khuyên dùng: Dùng DeepSeek R1/Claude cho viết thoại; dùng GPT-4o/Grok Vision cho tạo prompt ảnh 3D.
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSettings({ ...settings, useSeparateModels: !settings.useSeparateModels })}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                      settings.useSeparateModels !== false
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                        : "bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700"
                    }`}
                  >
                    {settings.useSeparateModels !== false ? (
                      <>
                        <CheckSquare className="w-3.5 h-3.5" />
                        <span>Đang BẬT Tách</span>
                      </>
                    ) : (
                      <>
                        <Square className="w-3.5 h-3.5" />
                        <span>Đang TẮT (Chung)</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* DIRECT MANUAL MODEL ID INPUT & QUICK ASSIGN */}
              <div className="p-4 bg-slate-950 rounded-xl border border-amber-500/40 bg-gradient-to-br from-amber-950/15 via-slate-950 to-indigo-950/15 space-y-3 shadow-md">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center space-x-2">
                    <Wand2 className="w-4 h-4 text-amber-400" />
                    <div>
                      <span className="font-bold text-amber-200 text-xs block">
                        Nhập Trực Tiếp ID Model OpenRouter Bất Kỳ (Manual Model ID)
                      </span>
                      <p className="text-[10px] text-slate-400">
                        Dán bất kỳ Model ID nào từ OpenRouter (ví dụ: x-ai/grok-3, deepseek/deepseek-r1:free, v.v.)
                      </p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-mono border border-amber-500/30">
                    Tùy Chọn Tự Do
                  </span>
                </div>

                {/* Input & Test Button */}
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={manualModelInput}
                      onChange={(e) => setManualModelInput(e.target.value)}
                      placeholder="Nhập hoặc dán Model ID (VD: x-ai/grok-3, deepseek/deepseek-r1, openai/gpt-4.5-preview)..."
                      className="w-full bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-slate-100 text-xs font-mono outline-none shadow-inner"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleTestManualModel}
                    disabled={isTestingManual || !manualModelInput.trim()}
                    className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 rounded-xl text-xs font-bold border border-slate-700 hover:border-slate-600 flex items-center space-x-1.5 shrink-0 transition-colors cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${isTestingManual ? "animate-spin" : ""}`} />
                    <span>{isTestingManual ? "Đang Test..." : "Test Model"}</span>
                  </button>
                </div>

                {/* Quick Trending Tags */}
                <div className="space-y-1.5">
                  <span className="text-[10px] text-slate-400 font-medium block">
                    ⚡ Gợi ý Model ID mới nhất (Click để điền nhanh):
                  </span>
                  <div className="flex items-center flex-wrap gap-1.5">
                    {[
                      "x-ai/grok-3",
                      "x-ai/grok-3-mini",
                      "openai/gpt-4.5-preview",
                      "openai/o3-mini",
                      "deepseek/deepseek-r1",
                      "deepseek/deepseek-chat",
                      "anthropic/claude-3.7-sonnet",
                      "anthropic/claude-3.7-sonnet:thinking",
                      "google/gemini-2.5-flash",
                      "meta-llama/llama-3.3-70b-instruct",
                      "deepseek/deepseek-r1:free",
                    ].map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => setManualModelInput(tag)}
                        className="px-2 py-0.5 rounded-md bg-slate-900 hover:bg-slate-800 text-[10px] font-mono text-slate-300 hover:text-amber-300 border border-slate-800 hover:border-amber-500/40 transition-colors cursor-pointer"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Action Buttons to Assign Model */}
                <div className="pt-1 flex items-center flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleApplyManualModel("writing")}
                    disabled={!manualModelInput.trim()}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 disabled:opacity-40 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer"
                  >
                    <span>✍️ Gán cho Model Viết (B1 & B5)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleApplyManualModel("image")}
                    disabled={!manualModelInput.trim()}
                    className="px-3 py-1.5 rounded-lg bg-amber-600/30 hover:bg-amber-600/50 disabled:opacity-40 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer"
                  >
                    <span>🎨 Gán cho Model Tạo Ảnh (B2, 3, 4)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleApplyManualModel("main")}
                    disabled={!manualModelInput.trim()}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 disabled:opacity-40 text-indigo-300 border border-indigo-500/40 text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer"
                  >
                    <span>⚡ Gán làm Model Chính (Tất cả)</span>
                  </button>
                </div>

                {/* Test Result for Manual Model */}
                {manualTestResult && (
                  <div
                    className={`p-2.5 rounded-xl border text-xs flex items-center space-x-2 animate-in fade-in ${
                      manualTestResult.success
                        ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300"
                        : "bg-rose-950/40 border-rose-500/40 text-rose-300"
                    }`}
                  >
                    {manualTestResult.success ? (
                      <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    )}
                    <span>{manualTestResult.message}</span>
                  </div>
                )}
              </div>

              {/* MODEL SELECTION SECTIONS */}
              {settings.useSeparateModels !== false ? (
                <div className="space-y-3">
                  {/* MODEL 1: VIẾT KỊCH BẢN & LỜI THOẠI (BƯỚC 1 & 5) */}
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-emerald-500/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-base">✍️</span>
                        <div>
                          <label className="text-emerald-300 font-bold block text-xs">
                            Model Viết Kịch Bản & Lời Thoại (Bước 1 & Bước 5)
                          </label>
                          <p className="text-[10px] text-slate-400">
                            Tối ưu văn phong, từ ngữ an toàn, lời thoại tự nhiên, bẻ giọng AI & logic cốt truyện.
                          </p>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-mono border border-emerald-500/30">
                        Bước 1 & 5
                      </span>
                    </div>

                    <select
                      value={settings.openRouterWritingModel || "anthropic/claude-3.5-sonnet"}
                      onChange={(e) => setSettings({ ...settings, openRouterWritingModel: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 focus:border-emerald-500 rounded-xl px-3 py-2.5 text-slate-100 text-xs outline-none cursor-pointer"
                    >
                      <optgroup label="⭐ MODEL KHUYÊN DÙNG CHO VIẾT KỊCH BẢN & LỜI THOẠI (KÈM GIÁ / 1M TOKENS)">
                        <option value="anthropic/claude-3.7-sonnet">Claude 3.7 Sonnet (Hybrid Reasoning) — [In: $3.00 | Out: $15.00]</option>
                        <option value="anthropic/claude-3.5-sonnet">Claude 3.5 Sonnet (Chuẩn vàng thoại & kịch bản) — [In: $3.00 | Out: $15.00]</option>
                        <option value="deepseek/deepseek-r1">DeepSeek R1 (Lập luận logic Hook/Pain/Solution) — [In: $0.55 | Out: $2.19]</option>
                        <option value="deepseek/deepseek-chat">DeepSeek V3 (Chat thông minh, mượt mà & siêu rẻ) — [In: $0.14 | Out: $0.28]</option>
                        <option value="x-ai/grok-3">xAI Grok 3 (Flagship thế hệ mới) — [In: $3.00 | Out: $15.00]</option>
                        <option value="x-ai/grok-3-mini">xAI Grok 3 Mini (Siêu nhanh & tiết kiệm) — [In: $0.30 | Out: $1.50]</option>
                        <option value="x-ai/grok-2-1212">xAI Grok 2 (1212 - Văn phong tự nhiên) — [In: $2.00 | Out: $10.00]</option>
                        <option value="openai/o3-mini">OpenAI o3-mini (High Reasoning) — [In: $1.10 | Out: $4.40]</option>
                        <option value="openai/gpt-4.5-preview">OpenAI GPT-4.5 Preview (Orion Flagship) — [In: $75.00 | Out: $150.00]</option>
                        <option value="openai/gpt-4o">OpenAI GPT-4o — [In: $2.50 | Out: $10.00]</option>
                        <option value="openai/gpt-4o-mini">OpenAI GPT-4o Mini — [In: $0.15 | Out: $0.60]</option>
                      </optgroup>
                      <optgroup label="🌐 TẤT CẢ MODEL KHÁC (KÈM GIÁ)">
                        {modelList
                          .filter(
                            (m) =>
                              ![
                                "anthropic/claude-3.5-sonnet",
                                "anthropic/claude-3.7-sonnet",
                                "deepseek/deepseek-r1",
                                "deepseek/deepseek-chat",
                                "x-ai/grok-3",
                                "x-ai/grok-3-mini",
                                "x-ai/grok-2-1212",
                                "openai/o3-mini",
                                "openai/gpt-4.5-preview",
                                "openai/gpt-4o",
                                "openai/gpt-4o-mini",
                              ].includes(m.id)
                          )
                          .map((m) => (
                            <option key={m.id} value={m.id}>
                              [{m.providerName}] {m.name} — [{formatModelPrice(m.pricing)}]
                            </option>
                          ))}
                        <option value="custom">➕ Nhập ID Model viết tùy chỉnh...</option>
                      </optgroup>
                    </select>

                    {settings.openRouterWritingModel === "custom" && (
                      <div className="mt-2 animate-in fade-in">
                        <input
                          type="text"
                          value={customWritingModelInput}
                          onChange={(e) => setCustomWritingModelInput(e.target.value)}
                          placeholder="Ví dụ: x-ai/grok-2-1212 hoặc mistralai/mistral-large-2411"
                          className="w-full bg-slate-900 border border-emerald-500/50 rounded-xl px-3 py-2 text-slate-200 text-xs font-mono outline-none"
                        />
                      </div>
                    )}
                  </div>

                  {/* MODEL 2: TẠO PROMPT HÌNH ẢNH & VIDEO (BƯỚC 2, 3 & 4) */}
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-amber-500/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-base">🎨</span>
                        <div>
                          <label className="text-amber-300 font-bold block text-xs">
                            Model Tạo Prompt Hình Ảnh & Video (Bước 2, 3 & 4)
                          </label>
                          <p className="text-[10px] text-slate-400">
                            Tối ưu Storyboard 9:16, 3D Pixar character, ánh sáng điện ảnh, camera direction cho Veo 3 / Kling & Thumbnail.
                          </p>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-mono border border-amber-500/30">
                        Bước 2, 3 & 4
                      </span>
                    </div>

                    <select
                      value={settings.openRouterImageModel || "openai/gpt-4o"}
                      onChange={(e) => setSettings({ ...settings, openRouterImageModel: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 focus:border-amber-500 rounded-xl px-3 py-2.5 text-slate-100 text-xs outline-none cursor-pointer"
                    >
                      <optgroup label="⭐ MODEL KHUYÊN DÙNG CHO TẠO PROMPT 3D & VISUAL (KÈM GIÁ / 1M TOKENS)">
                        <option value="openai/gpt-4o">OpenAI GPT-4o (3D Pixar & Safe Words chuẩn nhất) — [In: $2.50 | Out: $10.00]</option>
                        <option value="openai/gpt-4.5-preview">OpenAI GPT-4.5 Preview (Orion Visual Điện ảnh) — [In: $75.00 | Out: $150.00]</option>
                        <option value="x-ai/grok-2-vision-1212">xAI Grok 2 Vision (Hiểu sâu không gian & ánh sáng) — [In: $2.00 | Out: $10.00]</option>
                        <option value="x-ai/grok-3">xAI Grok 3 (Flagship thế hệ mới) — [In: $3.00 | Out: $15.00]</option>
                        <option value="anthropic/claude-3.7-sonnet">Claude 3.7 Sonnet (Visual layout chi tiết) — [In: $3.00 | Out: $15.00]</option>
                        <option value="anthropic/claude-3.5-sonnet">Claude 3.5 Sonnet (Prompt thẩm mỹ cao & bố cục 9:16) — [In: $3.00 | Out: $15.00]</option>
                        <option value="google/gemini-2.5-flash">Google Gemini 2.5 Flash via OpenRouter (Siêu nhanh) — [In: $0.10 | Out: $0.40]</option>
                        <option value="google/gemini-2.0-flash-001">Google Gemini 2.0 Flash — [In: $0.10 | Out: $0.40]</option>
                        <option value="deepseek/deepseek-chat">DeepSeek V3 (Tối ưu chi phí tạo prompt) — [In: $0.14 | Out: $0.28]</option>
                        <option value="openai/gpt-4o-mini">OpenAI GPT-4o Mini (Tiết kiệm tối đa) — [In: $0.15 | Out: $0.60]</option>
                      </optgroup>
                      <optgroup label="🌐 TẤT CẢ MODEL KHÁC (KÈM GIÁ)">
                        {modelList
                          .filter(
                            (m) =>
                              ![
                                "openai/gpt-4o",
                                "openai/gpt-4.5-preview",
                                "x-ai/grok-2-vision-1212",
                                "x-ai/grok-3",
                                "anthropic/claude-3.7-sonnet",
                                "anthropic/claude-3.5-sonnet",
                                "google/gemini-2.5-flash",
                                "google/gemini-2.0-flash-001",
                                "deepseek/deepseek-chat",
                                "openai/gpt-4o-mini",
                              ].includes(m.id)
                          )
                          .map((m) => (
                            <option key={m.id} value={m.id}>
                              [{m.providerName}] {m.name} — [{formatModelPrice(m.pricing)}]
                            </option>
                          ))}
                        <option value="custom">➕ Nhập ID Model ảnh/video tùy chỉnh...</option>
                      </optgroup>
                    </select>

                    {settings.openRouterImageModel === "custom" && (
                      <div className="mt-2 animate-in fade-in">
                        <input
                          type="text"
                          value={customImageModelInput}
                          onChange={(e) => setCustomImageModelInput(e.target.value)}
                          placeholder="Ví dụ: openai/gpt-4o hoặc x-ai/grok-2-vision-1212"
                          className="w-full bg-slate-900 border border-amber-500/50 rounded-xl px-3 py-2 text-slate-200 text-xs font-mono outline-none"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* SINGLE MODEL FOR ALL 5 STEPS */
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <label className="text-slate-200 font-bold block text-xs">
                    Mô hình AI duy nhất (Dùng cho toàn bộ 5 bước)
                  </label>
                  <select
                    value={settings.openRouterModel}
                    onChange={(e) => setSettings({ ...settings, openRouterModel: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 focus:border-amber-500 rounded-xl px-3 py-2.5 text-slate-100 text-xs outline-none cursor-pointer"
                  >
                    <optgroup label="⭐ MODEL HÀNG ĐẦU (KÈM GIÁ / 1M TOKENS)">
                      <option value="anthropic/claude-3.7-sonnet">Claude 3.7 Sonnet (Hybrid Reasoning mới nhất) — [In: $3.00 | Out: $15.00]</option>
                      <option value="anthropic/claude-3.5-sonnet">Claude 3.5 Sonnet (Chuẩn vàng toàn diện) — [In: $3.00 | Out: $15.00]</option>
                      <option value="deepseek/deepseek-r1">DeepSeek R1 (Lập luận logic sâu sắc) — [In: $0.55 | Out: $2.19]</option>
                      <option value="deepseek/deepseek-chat">DeepSeek V3 (Nhanh & chi phí rẻ nhất) — [In: $0.14 | Out: $0.28]</option>
                      <option value="x-ai/grok-3">xAI Grok 3 (Flagship 2025/2026) — [In: $3.00 | Out: $15.00]</option>
                      <option value="x-ai/grok-2-1212">xAI Grok 2 (1212 - Sáng tạo tự nhiên) — [In: $2.00 | Out: $10.00]</option>
                      <option value="openai/gpt-4o">OpenAI GPT-4o (3D Pixar & Safe Words tốt nhất) — [In: $2.50 | Out: $10.00]</option>
                      <option value="openai/o3-mini">OpenAI o3-mini (High Reasoning) — [In: $1.10 | Out: $4.40]</option>
                      <option value="openai/gpt-4.5-preview">OpenAI GPT-4.5 Preview (Orion Flagship) — [In: $75.00 | Out: $150.00]</option>
                      <option value="google/gemini-2.5-flash">Google Gemini 2.5 Flash via OpenRouter — [In: $0.10 | Out: $0.40]</option>
                    </optgroup>
                    <optgroup label="🌐 TẤT CẢ MODEL KHÁC (KÈM GIÁ)">
                      {modelList.map((m) => (
                        <option key={m.id} value={m.id}>
                          [{m.providerName}] {m.name} — [{formatModelPrice(m.pricing)}]
                        </option>
                      ))}
                      <option value="custom">➕ Nhập ID Model tùy chỉnh...</option>
                    </optgroup>
                  </select>

                  {settings.openRouterModel === "custom" && (
                    <div className="mt-2 animate-in fade-in">
                      <input
                        type="text"
                        value={customModelInput}
                        onChange={(e) => setCustomModelInput(e.target.value)}
                        placeholder="Ví dụ: mistralai/mistral-large-2411 hoặc qwen/qwen-2.5-72b-instruct"
                        className="w-full bg-slate-900 border border-amber-500/50 rounded-xl px-3 py-2 text-slate-200 text-xs font-mono outline-none"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* LIVE OPENROUTER MODEL BROWSER & FETCHER */}
              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center space-x-2">
                    <Layers className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="font-bold text-slate-200 text-xs">
                      Khám Phá & Tải Model OpenRouter (Grok, GPT, DeepSeek...)
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-900 text-slate-400 border border-slate-800">
                      {modelList.length} models
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleFetchLiveModels}
                    disabled={isFetchingLiveModels}
                    className="px-2.5 py-1 text-[11px] font-semibold text-amber-300 hover:text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg flex items-center space-x-1.5 transition-colors cursor-pointer"
                  >
                    <RefreshCw className={`w-3 h-3 ${isFetchingLiveModels ? "animate-spin" : ""}`} />
                    <span>{isFetchingLiveModels ? "Đang tải danh sách..." : "Lấy danh sách mới nhất"}</span>
                  </button>
                </div>

                {fetchError && (
                  <div className="p-2 rounded bg-rose-950/40 border border-rose-500/30 text-rose-300 text-[11px] flex items-center space-x-1.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{fetchError}</span>
                  </div>
                )}

                {/* Filter Pills */}
                <div className="flex items-center flex-wrap gap-1.5 pt-1">
                  {[
                    { id: "all", label: "Tất cả" },
                    { id: "grok", label: "xAI / Grok" },
                    { id: "gpt", label: "OpenAI / GPT" },
                    { id: "deepseek", label: "DeepSeek" },
                    { id: "claude", label: "Claude" },
                    { id: "gemini", label: "Gemini" },
                    { id: "meta", label: "Llama" },
                  ].map((filter) => (
                    <button
                      key={filter.id}
                      type="button"
                      onClick={() => setModelFilterProvider(filter.id)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                        modelFilterProvider === filter.id
                          ? "bg-indigo-600 text-white shadow-sm"
                          : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>

                {/* Search Bar */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={modelSearchText}
                    onChange={(e) => setModelSearchText(e.target.value)}
                    placeholder="Tìm nhanh model (ví dụ: grok-2, gpt-4o, deepseek-r1, sonnet)..."
                    className="w-full bg-slate-900 border border-slate-700 focus:border-indigo-500 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 outline-none"
                  />
                </div>

                {/* Filtered Models Preview Grid */}
                <div className="max-h-56 overflow-y-auto space-y-2 pr-1 text-[11px]">
                  {modelList
                    .filter((m) => {
                      const matchProvider =
                        modelFilterProvider === "all" || m.provider === modelFilterProvider;
                      const matchSearch =
                        !modelSearchText.trim() ||
                        m.id.toLowerCase().includes(modelSearchText.toLowerCase()) ||
                        m.name.toLowerCase().includes(modelSearchText.toLowerCase());
                      return matchProvider && matchSearch;
                    })
                    .slice(0, 20)
                    .map((m) => (
                      <div
                        key={m.id}
                        className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 flex items-center justify-between gap-3 shadow-sm"
                      >
                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                            <span className="font-bold text-slate-100">{m.name}</span>
                            {m.isNew && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                MỚI
                              </span>
                            )}
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-slate-950 text-indigo-300 border border-slate-800">
                              {m.id}
                            </span>
                            {m.recommendedFor && (
                              <span
                                className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                                  m.recommendedFor === "writing"
                                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                    : m.recommendedFor === "image"
                                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                    : "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                                }`}
                              >
                                {m.recommendedFor === "writing"
                                  ? "✍️ Viết thoại"
                                  : m.recommendedFor === "image"
                                  ? "🎨 Tạo ảnh 3D"
                                  : "⚡ Toàn diện"}
                              </span>
                            )}
                          </div>

                          {/* Pricing Badge */}
                          <div className="flex items-center space-x-2 text-[10px] text-slate-300 flex-wrap">
                            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-emerald-400 font-mono font-medium">
                              <DollarSign className="w-3 h-3 text-emerald-400 -mr-0.5" />
                              <span>{formatModelPrice(m.pricing)}</span>
                            </span>
                            {m.contextLength && (
                              <span className="text-[10px] text-slate-500">
                                Context: {(m.contextLength / 1000).toFixed(0)}k tokens
                              </span>
                            )}
                          </div>

                          {m.description && (
                            <p className="text-[10px] text-slate-400 line-clamp-1">{m.description}</p>
                          )}
                        </div>

                        <div className="flex items-center space-x-1.5 shrink-0">
                          {settings.useSeparateModels !== false ? (
                            <>
                              <button
                                type="button"
                                onClick={() => {
                                  setSettings({ ...settings, openRouterWritingModel: m.id });
                                  showNotification(`Đã gán "${m.name}" cho Viết Kịch Bản!`);
                                }}
                                className="px-2.5 py-1.5 text-[10px] font-bold bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/40 rounded-lg transition-colors cursor-pointer"
                                title="Gán làm model viết kịch bản (Bước 1 & 5)"
                              >
                                + Viết
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setSettings({ ...settings, openRouterImageModel: m.id });
                                  showNotification(`Đã gán "${m.name}" cho Tạo Prompt Ảnh/Video!`);
                                }}
                                className="px-2.5 py-1.5 text-[10px] font-bold bg-amber-600/20 hover:bg-amber-600/40 text-amber-300 border border-amber-500/40 rounded-lg transition-colors cursor-pointer"
                                title="Gán làm model tạo prompt ảnh 3D/video (Bước 2, 3, 4)"
                              >
                                + Ảnh
                              </button>
                            </>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setSettings({ ...settings, openRouterModel: m.id });
                                showNotification(`Đã chọn "${m.name}" làm Model chính!`);
                              }}
                              className="px-3 py-1.5 text-[10px] font-bold bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/40 rounded-lg transition-colors cursor-pointer"
                            >
                              Chọn
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* MAX OUTPUT TOKENS & QUOTA PROTECTOR */}
              <div className="p-3.5 bg-slate-950 rounded-xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/20 to-slate-950 space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center space-x-2">
                    <Sliders className="w-4 h-4 text-emerald-400" />
                    <div>
                      <span className="font-bold text-slate-100 block text-xs">
                        Giới Hạn Max Output Tokens (Bảo Vệ Số Dư & Tránh Lỗi 402)
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Đặt 4,096 tokens giúp OpenRouter không trừ tiền cọc trước 65K tokens, tiết kiệm chi phí và tránh lỗi Insufficient Balance.
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                    {settings.maxTokens || 4096} tokens
                  </span>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  {[2048, 3072, 4096, 6144, 8192].map((tokens) => (
                    <button
                      key={tokens}
                      type="button"
                      onClick={() => setSettings({ ...settings, maxTokens: tokens })}
                      className={`px-2.5 py-1 text-[11px] font-medium rounded-lg border transition-all cursor-pointer ${
                        (settings.maxTokens || 4096) === tokens
                          ? "bg-emerald-600 text-white border-emerald-500 shadow-sm"
                          : "bg-slate-900 text-slate-400 border-slate-700 hover:text-slate-200 hover:bg-slate-800"
                      }`}
                    >
                      {tokens.toLocaleString()} {tokens === 4096 ? "★ Chuẩn" : ""}
                    </button>
                  ))}
                </div>
              </div>

              {/* Test Connection Button & Result */}
              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={isTesting || !settings.openRouterApiKey}
                  className="w-full py-2.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 border border-slate-700 rounded-xl flex items-center justify-center space-x-2 transition-colors cursor-pointer"
                >
                  {isTesting ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                  ) : (
                    <Sparkles className="w-4 h-4 text-amber-400" />
                  )}
                  <span>Kiểm tra kết nối Live (Test {settings.useSeparateModels ? "2 Model" : "Model"})</span>
                </button>

                {testResult && (
                  <div
                    className={`p-3 rounded-xl border flex items-start space-x-2 animate-in fade-in ${
                      testResult.success
                        ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300"
                        : "bg-rose-950/40 border-rose-500/40 text-rose-300"
                    }`}
                  >
                    {testResult.success ? (
                      <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
                    )}
                    <div className="leading-relaxed text-xs">{testResult.message}</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800 gap-3 shrink-0">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-3 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 bg-slate-950 border border-slate-800 rounded-xl transition-colors flex items-center space-x-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Khôi phục mặc định</span>
          </button>

          <div className="flex items-center space-x-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
            >
              Hủy
            </button>
            <button
              id="btn-save-system-settings"
              type="button"
              onClick={handleSave}
              className="px-5 py-2 text-xs font-bold bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-slate-950 rounded-xl shadow-lg shadow-indigo-500/20 flex items-center space-x-1.5 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Lưu Cấu Hình</span>
            </button>
          </div>
        </div>
      </div>

      {/* Reusable High-Productivity Prompt Field Editor Modal / Popup */}
      {activePopupConfig && <PromptFieldEditorModal {...activePopupConfig} />}

      {/* Reusable Full & Granular Rules & Prompts Import / Export Modal */}
      {isImportExportModalOpen && (
        <ImportExportRulesPromptsModal
          isOpen={isImportExportModalOpen}
          onClose={() => setIsImportExportModalOpen(false)}
          currentTemplate={
            editingTemplate ||
            templates.find((t) => t.id === (settings.defaultTemplateId || getDefaultTemplateId())) ||
            templates[0]
          }
          allTemplates={templates}
          onApplyToCurrent={(updatedInputs) => {
            if (editingTemplate) {
              setEditingTemplate({
                ...editingTemplate,
                data: updatedInputs,
              });
              showNotification("Đã cập nhật các trường vào Template đang chỉnh sửa!");
            } else {
              const defId = settings.defaultTemplateId || getDefaultTemplateId();
              const target = templates.find((t) => t.id === defId) || templates[0];
              if (target) {
                const updatedTpl = { ...target, data: updatedInputs };
                const updatedList = saveOrUpdateTemplate(updatedTpl);
                setTemplates(updatedList);
                showNotification(`Đã cập nhật các trường vào Template "${target.name}"!`);
              }
            }
          }}
          onSaveAsNewTemplate={(newTpl) => {
            const updatedList = saveOrUpdateTemplate(newTpl);
            setTemplates(updatedList);
            showNotification(`Đã lưu thành công Template mới "${newTpl.name}"!`);
          }}
        />
      )}
    </div>
  );
};
