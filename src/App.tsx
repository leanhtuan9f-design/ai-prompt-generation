import React, { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { SlangAndRulesDrawer } from "./components/SlangAndRulesDrawer";
import { MascotModal } from "./components/MascotModal";
import { SavedScriptsModal } from "./components/SavedScriptsModal";
import { SettingsModal } from "./components/SettingsModal";
import { BatchGeneratorPanel } from "./components/BatchGeneratorPanel";
import { PromptInputs, StepNumber, StepStatusMap, StepsContent, SavedScript } from "./types";
import { DEFAULT_INPUTS } from "./data/constants";

export default function App() {
  // Main application mode: 'batch' (Bulk generation)
  const [appMode, setAppMode] = useState<"single" | "batch">("batch");

  // Single prompt inputs state
  const [inputs, setInputs] = useState<PromptInputs>(() => {
    const local =
      localStorage.getItem("prompt_studio_inputs_v4") ||
      localStorage.getItem("prompt_studio_inputs_v3") ||
      localStorage.getItem("prompt_studio_inputs");
    if (local) {
      try {
        const parsed = JSON.parse(local);
        return {
          ...DEFAULT_INPUTS,
          ...parsed,
          mandatoryAudioRules:
            parsed.mandatoryAudioRules?.includes("ĐỒNG NHẤT 100% GIỚI TÍNH")
              ? parsed.mandatoryAudioRules
              : DEFAULT_INPUTS.mandatoryAudioRules,
          mandatoryImageRules:
            parsed.mandatoryImageRules?.includes("KHÔNG BAO GIỜ HIỂN THỊ LỜI THOẠI")
              ? parsed.mandatoryImageRules
              : DEFAULT_INPUTS.mandatoryImageRules,
          mandatoryVideoRules:
            parsed.mandatoryVideoRules?.includes("CINEMATIC CAMERA WORK")
              ? parsed.mandatoryVideoRules
              : DEFAULT_INPUTS.mandatoryVideoRules,
          dialoguePromptTemplate:
            parsed.dialoguePromptTemplate?.includes("ĐỒNG NHẤT 100% GIỌNG ĐỌC")
              ? parsed.dialoguePromptTemplate
              : DEFAULT_INPUTS.dialoguePromptTemplate,
          storyboardPromptTemplate:
            parsed.storyboardPromptTemplate?.includes("Vertical Panels")
              ? parsed.storyboardPromptTemplate
              : DEFAULT_INPUTS.storyboardPromptTemplate,
          scenePromptTemplate:
            parsed.scenePromptTemplate?.includes("No Dialogue on Image")
              ? parsed.scenePromptTemplate
              : DEFAULT_INPUTS.scenePromptTemplate,
          imagePromptTemplate:
            parsed.imagePromptTemplate?.includes("No Dialogue on Image")
              ? parsed.imagePromptTemplate
              : DEFAULT_INPUTS.scenePromptTemplate,
          veoPromptTemplate:
            parsed.veoPromptTemplate?.includes("Đồng nhất 100% Giọng đọc")
              ? parsed.veoPromptTemplate
              : DEFAULT_INPUTS.veoPromptTemplate,
          videoPromptTemplate:
            parsed.videoPromptTemplate?.includes("Đồng nhất 100% Giọng đọc")
              ? parsed.videoPromptTemplate
              : DEFAULT_INPUTS.veoPromptTemplate,
          thumbnailPromptTemplate:
            parsed.thumbnailPromptTemplate?.includes("strictly NO brand")
              ? parsed.thumbnailPromptTemplate
              : DEFAULT_INPUTS.thumbnailPromptTemplate,
          globalCharacterRules:
            parsed.globalCharacterRules || DEFAULT_INPUTS.globalCharacterRules,
          globalSafetyRules:
            parsed.globalSafetyRules || DEFAULT_INPUTS.globalSafetyRules,
        };
      } catch (e) {
        return DEFAULT_INPUTS;
      }
    }
    return DEFAULT_INPUTS;
  });

  // 5 Steps output content
  const [stepsContent, setStepsContent] = useState<StepsContent>({
    step1: "",
    step2: "",
    step3: "",
    step4: "",
    step5: "",
  });

  // Step tracking
  const [currentStep, setCurrentStep] = useState<StepNumber>(1);
  const [statusMap, setStatusMap] = useState<StepStatusMap>({
    1: "idle",
    2: "idle",
    3: "idle",
    4: "idle",
    5: "idle",
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [savedScripts, setSavedScripts] = useState<SavedScript[]>(() => {
    const local = localStorage.getItem("prompt_studio_saved_scripts");
    if (local) {
      try {
        return JSON.parse(local);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  // Modals state
  const [isSlangDrawerOpen, setIsSlangDrawerOpen] = useState(false);
  const [slangDrawerTab, setSlangDrawerTab] = useState<"slang" | "safewords" | "padding">("slang");
  const [isMascotModalOpen, setIsMascotModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [settingsModalTab, setSettingsModalTab] = useState<"ai" | "threading" | "presets">("ai");

  // Save inputs locally
  useEffect(() => {
    localStorage.setItem("prompt_studio_inputs_v4", JSON.stringify(inputs));
    localStorage.setItem("prompt_studio_inputs_v3", JSON.stringify(inputs));
    localStorage.setItem("prompt_studio_inputs", JSON.stringify(inputs));
  }, [inputs]);

  // Save scripts list locally
  useEffect(() => {
    localStorage.setItem("prompt_studio_saved_scripts", JSON.stringify(savedScripts));
  }, [savedScripts]);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleOpenSettings = (tab: "ai" | "threading" | "presets" = "ai") => {
    setSettingsModalTab(tab);
    setIsSettingsModalOpen(true);
  };

  const handleAutoSaveFromBatch = (batchInputs: PromptInputs, batchSteps: StepsContent) => {
    const autoScript: SavedScript = {
      id: `script_batch_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: batchInputs.title || "Kịch bản Batch 3D Health Video",
      createdAt: new Date().toLocaleString("vi-VN"),
      inputs: { ...batchInputs },
      stepsContent: { ...batchSteps },
      status: { 1: "completed", 2: "completed", 3: "completed", 4: "completed", 5: "completed" },
    };

    setSavedScripts((prev) => [autoScript, ...prev]);
  };

  const handleLoadScript = (script: SavedScript) => {
    setInputs(script.inputs);
    setStepsContent(script.stepsContent);
    setStatusMap({
      1: script.stepsContent.step1 ? "completed" : "idle",
      2: script.stepsContent.step2 ? "completed" : "idle",
      3: script.stepsContent.step3 ? "completed" : "idle",
      4: script.stepsContent.step4 ? "completed" : "idle",
      5: script.stepsContent.step5 ? "completed" : "idle",
    });
    setCurrentStep(1);
    setIsHistoryModalOpen(false);
    showToast(`Đã tải kịch bản: "${script.title}"`, "success");
  };

  const handleDeleteScript = (id: string) => {
    setSavedScripts((prev) => prev.filter((s) => s.id !== id));
    showToast("Đã xóa kịch bản khỏi lịch sử!", "success");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Global Header */}
      <Header
        currentMode={appMode}
        onToggleMode={(mode) => setAppMode(mode)}
        onOpenHistoryModal={() => setIsHistoryModalOpen(true)}
        onOpenSettingsModal={() => handleOpenSettings("presets")}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* BATCH GENERATOR VIEW (Primary & Scalable View) */}
        <BatchGeneratorPanel
          onLoadSingleScript={(newInputs, newSteps) => {
            setInputs(newInputs);
            setStepsContent(newSteps);
            showToast("Đã ghi nhận thông tin kịch bản!", "success");
          }}
          showToast={showToast}
          onOpenSettingsModal={handleOpenSettings}
          onAutoSaveScript={handleAutoSaveFromBatch}
        />
      </main>

      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-2xl text-xs font-semibold flex items-center space-x-2 animate-in fade-in slide-in-from-bottom-5 border ${
            toastMessage.type === "success"
              ? "bg-emerald-950/90 text-emerald-300 border-emerald-500/30"
              : "bg-rose-950/90 text-rose-300 border-rose-500/30"
          }`}
        >
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Modals & Drawers */}
      <SlangAndRulesDrawer
        isOpen={isSlangDrawerOpen}
        onClose={() => setIsSlangDrawerOpen(false)}
        initialTab={slangDrawerTab}
      />

      <MascotModal
        isOpen={isMascotModalOpen}
        onClose={() => setIsMascotModalOpen(false)}
        mascotName={inputs.mascotName}
      />

      <SavedScriptsModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        savedScripts={savedScripts}
        onLoadScript={handleLoadScript}
        onDeleteScript={handleDeleteScript}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        initialTab={settingsModalTab}
        onSaved={(newSettings) => {
          showToast(`Đã lưu cài đặt: ${newSettings.concurrency} luồng & ${newSettings.openRouterModel.split('/')[1] || newSettings.openRouterModel}!`, "success");
        }}
      />
    </div>
  );
}

