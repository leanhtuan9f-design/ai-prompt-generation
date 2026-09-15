import React from "react";
import { CheckCircle2, Clock, PlayCircle, AlertCircle, ChevronRight, Lock } from "lucide-react";
import { StepNumber, StepStatusMap } from "../types";

interface StepProgressTrackerProps {
  currentStep: StepNumber;
  statusMap: StepStatusMap;
  onSelectStep: (step: StepNumber) => void;
  onResetWorkflow: () => void;
}

export const StepProgressTracker: React.FC<StepProgressTrackerProps> = ({
  currentStep,
  statusMap,
  onSelectStep,
  onResetWorkflow,
}) => {
  const steps: { number: StepNumber; title: string; subtitle: string }[] = [
    { number: 1, title: "Bước 1: Prompt tạo hội thoại", subtitle: "Problem-Pain-Solution & Từ lóng" },
    { number: 2, title: "Bước 2: Prompt tạo storyboard", subtitle: "Ảnh lưới 9:16 & Khóa nhân vật" },
    { number: 3, title: "Bước 3: Prompt tạo cảnh", subtitle: "Midjourney/DALL-E Cảnh N+1" },
    { number: 4, title: "Bước 4: Prompt tạo thumbnail", subtitle: "Stop the scroll 9:16 & Safe zone" },
    { number: 5, title: "Bước 5: Prompt tạo veo", subtitle: "Prompt VEO 3 & Kịch bản JSON" },
  ];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl backdrop-blur-md">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-3 mb-3 border-b border-slate-800 gap-2">
        <div>
          <div className="flex items-center space-x-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Quy trình 5 bước xét duyệt nghiêm ngặt
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Mỗi bước yêu cầu người dùng duyệt ("Đồng ý" / "Duyệt") trước khi chuyển bước kế tiếp
          </p>
        </div>
        <button
          id="btn-reset-workflow"
          onClick={onResetWorkflow}
          className="text-xs text-slate-400 hover:text-rose-400 transition-colors self-start md:self-auto underline decoration-dotted"
        >
          Làm mới toàn bộ quy trình
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
        {steps.map((step) => {
          const status = statusMap[step.number];
          const isActive = currentStep === step.number;
          const isApproved = status === "approved";
          const isCompleted = status === "completed";
          const isGenerating = status === "generating";
          const isLocked = step.number > 1 && statusMap[(step.number - 1) as StepNumber] !== "approved" && status === "idle";

          return (
            <button
              key={step.number}
              id={`step-tab-${step.number}`}
              onClick={() => !isLocked && onSelectStep(step.number)}
              disabled={isLocked}
              className={`text-left p-3 rounded-xl border transition-all relative overflow-hidden flex flex-col justify-between ${
                isActive
                  ? "bg-amber-500/10 border-amber-500/50 shadow-md shadow-amber-500/10"
                  : isApproved
                  ? "bg-emerald-950/20 border-emerald-800/40 hover:bg-emerald-950/40"
                  : isCompleted
                  ? "bg-blue-950/20 border-blue-800/40 hover:bg-blue-950/40"
                  : isLocked
                  ? "bg-slate-900/40 border-slate-800/40 opacity-50 cursor-not-allowed"
                  : "bg-slate-800/40 border-slate-800 hover:bg-slate-800/80"
              }`}
            >
              {isActive && (
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-400 to-emerald-400"></div>
              )}

              <div className="flex items-center justify-between mb-1.5">
                <span
                  className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center ${
                    isApproved
                      ? "bg-emerald-500 text-slate-950"
                      : isActive
                      ? "bg-amber-400 text-slate-950 font-black"
                      : isCompleted
                      ? "bg-blue-500 text-slate-950"
                      : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {isApproved ? "✓" : step.number}
                </span>

                <div>
                  {isApproved ? (
                    <span className="flex items-center space-x-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Đã duyệt</span>
                    </span>
                  ) : isGenerating ? (
                    <span className="flex items-center space-x-1 text-[11px] font-semibold text-amber-400 animate-pulse bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                      <Clock className="w-3 h-3 animate-spin" />
                      <span>Đang tạo...</span>
                    </span>
                  ) : isCompleted ? (
                    <span className="flex items-center space-x-1 text-[11px] font-semibold text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20">
                      <Clock className="w-3 h-3" />
                      <span>Chờ duyệt</span>
                    </span>
                  ) : isLocked ? (
                    <span className="flex items-center space-x-1 text-[11px] text-slate-500">
                      <Lock className="w-3 h-3" />
                      <span>Khóa</span>
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-500">Chưa tạo</span>
                  )}
                </div>
              </div>

              <div>
                <p
                  className={`text-xs font-bold line-clamp-1 ${
                    isActive
                      ? "text-amber-300"
                      : isApproved
                      ? "text-emerald-300"
                      : "text-slate-200"
                  }`}
                >
                  {step.title}
                </p>
                <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                  {step.subtitle}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
