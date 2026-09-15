import React, { useState, useEffect } from "react";
import { FolderKanban, Plus, Edit2, Trash2, Check, X, ShieldAlert } from "lucide-react";
import { HelpTooltip } from "./HelpTooltip";
import {
  getSavedProjectNames,
  getActiveProjectName,
  setActiveProjectName,
  getProjectAngles,
  createNewProject,
  renameProject,
  deleteProject,
  checkTopicDuplicateWithProject,
} from "../utils/projectMemory";

interface ProjectManagerBarProps {
  currentTopic?: string;
  selectedProject?: string;
  onProjectChange: (newProjectName: string) => void;
  compact?: boolean;
}

export const ProjectManagerBar: React.FC<ProjectManagerBarProps> = ({
  currentTopic = "",
  selectedProject,
  onProjectChange,
  compact = false,
}) => {
  const [activeProject, setActiveProject] = useState<string>(
    selectedProject || getActiveProjectName() || "Trà Dây Bstar"
  );
  const [projectList, setProjectList] = useState<string[]>([]);
  const [mode, setMode] = useState<"view" | "create" | "rename">("view");
  const [inputValue, setInputValue] = useState<string>("");
  const [showAnglesModal, setShowAnglesModal] = useState<boolean>(false);

  // Sync list of projects
  const refreshProjects = () => {
    const list = getSavedProjectNames();
    setProjectList(list);
    const active = selectedProject || getActiveProjectName() || (list.length > 0 ? list[0] : "Trà Dây Bstar");
    setActiveProject(active);
  };

  useEffect(() => {
    refreshProjects();
  }, [selectedProject]);

  const handleSelectProject = (name: string) => {
    setActiveProjectName(name);
    setActiveProject(name);
    onProjectChange(name);
  };

  const handleStartCreate = () => {
    setInputValue("");
    setMode("create");
  };

  const handleConfirmCreate = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) {
      setMode("view");
      return;
    }
    const updated = createNewProject(trimmed);
    setProjectList(updated);
    setActiveProject(trimmed);
    onProjectChange(trimmed);
    setMode("view");
  };

  const handleStartRename = () => {
    setInputValue(activeProject);
    setMode("rename");
  };

  const handleConfirmRename = () => {
    const trimmed = inputValue.trim();
    if (!trimmed || trimmed === activeProject) {
      setMode("view");
      return;
    }
    const res = renameProject(activeProject, trimmed);
    if (res.success) {
      setProjectList(res.projects);
      setActiveProject(trimmed);
      onProjectChange(trimmed);
    }
    setMode("view");
  };

  const handleDelete = () => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa dự án "${activeProject}" và toàn bộ bộ nhớ góc kịch bản của dự án này?`)) {
      const updated = deleteProject(activeProject);
      setProjectList(updated);
      const nextProj = updated[0] || "Trà Dây Bstar";
      setActiveProject(nextProj);
      onProjectChange(nextProj);
    }
  };

  const projectAngles = getProjectAngles(activeProject);
  const dupCheck = currentTopic ? checkTopicDuplicateWithProject(currentTopic, activeProject) : { isDuplicate: false, score: 0 };

  return (
    <div className="p-2 sm:p-2.5 rounded-xl bg-slate-950/90 border border-indigo-500/30 space-y-1.5 shadow-sm">
      <div className="flex items-center justify-between gap-2 flex-nowrap min-w-0">
        {/* Left header */}
        <div className="flex items-center space-x-1.5 min-w-0 flex-nowrap shrink">
          <div className="w-6 h-6 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
            <FolderKanban className="w-3.5 h-3.5" />
          </div>
          <div className="flex items-center space-x-1.5 min-w-0 flex-nowrap whitespace-nowrap">
            <span className="text-xs font-bold text-slate-200 shrink-0">Dự Án:</span>
            <span className="text-xs px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30 truncate max-w-[130px] sm:max-w-[180px] shrink">
              {activeProject}
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-mono shrink-0 whitespace-nowrap">
              {projectAngles.length} góc
            </span>
            <HelpTooltip
              variant="info"
              className="shrink-0"
              title="Bộ nhớ dự án chống trùng lặp"
              text="Bộ nhớ tự động ép AI đổi mới góc Hook, bối cảnh đời sống và cơ chế giải thích 100% không trùng lặp các kịch bản trước của dự án này."
            />
          </div>
        </div>

        {/* Right action bar */}
        <div className="flex items-center space-x-1 shrink-0 flex-nowrap">
          {mode === "view" ? (
            <>
              {/* Dropdown selector */}
              <select
                value={activeProject}
                onChange={(e) => handleSelectProject(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:border-indigo-400 font-medium cursor-pointer max-w-[130px] sm:max-w-[170px] truncate shrink-0"
              >
                {projectList.map((p) => (
                  <option key={p} value={p}>
                    📁 {p}
                  </option>
                ))}
              </select>

              {/* Action buttons */}
              <button
                type="button"
                onClick={handleStartCreate}
                className="px-2 py-1 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/40 text-xs font-medium flex items-center space-x-1 transition-colors cursor-pointer shrink-0 whitespace-nowrap"
                title="Tạo dự án mới"
              >
                <Plus className="w-3 h-3" />
                <span>Thêm</span>
              </button>

              <button
                type="button"
                onClick={handleStartRename}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs transition-colors cursor-pointer shrink-0"
                title="Đổi tên dự án này"
              >
                <Edit2 className="w-3 h-3" />
              </button>

              {projectList.length > 1 && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs transition-colors cursor-pointer shrink-0"
                  title="Xóa dự án này"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </>
          ) : (
            /* Inline create/rename mode */
            <div className="flex items-center space-x-1 bg-slate-900 p-0.5 rounded-lg border border-indigo-500/50 animate-in fade-in shrink-0">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    mode === "create" ? handleConfirmCreate() : handleConfirmRename();
                  } else if (e.key === "Escape") {
                    setMode("view");
                  }
                }}
                autoFocus
                placeholder={mode === "create" ? "Nhập tên mới..." : "Tên mới..."}
                className="bg-transparent px-2 py-0.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none w-28 sm:w-40 font-medium"
              />
              <button
                type="button"
                onClick={mode === "create" ? handleConfirmCreate : handleConfirmRename}
                className="px-2 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center space-x-1 cursor-pointer shrink-0 whitespace-nowrap"
              >
                <Check className="w-3 h-3" />
                <span>Lưu</span>
              </button>
              <button
                type="button"
                onClick={() => setMode("view")}
                className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 cursor-pointer shrink-0"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Compact Duplicate warning indicator */}
      {dupCheck.isDuplicate && (
        <div className="flex items-center justify-between p-1.5 px-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] animate-in fade-in flex-nowrap min-w-0">
          <div className="flex items-center space-x-1.5 truncate min-w-0">
            <ShieldAlert className="w-3.5 h-3.5 shrink-0 text-amber-400" />
            <span className="font-semibold text-[11px] shrink-0 whitespace-nowrap">Trùng góc {dupCheck.score}%:</span>
            <span className="font-mono text-[10px] text-amber-200 truncate bg-slate-900/80 px-1.5 py-0.5 rounded border border-amber-500/20 max-w-[200px] sm:max-w-[280px]">
              "{dupCheck.matchedTopic}"
            </span>
          </div>
          <HelpTooltip
            variant="warning"
            className="shrink-0 ml-1"
            title="Cảnh báo tương đồng & Tự đổi góc"
            text={`Chủ đề có góc tiếp cận gần giống kịch bản cũ "${dupCheck.matchedTopic}" (${dupCheck.score}%). AI sẽ tự động kích hoạt bộ lọc ép đổi mới góc Hook, bối cảnh đời sống và cơ chế giải thích 100%.`}
            align="right"
          />
        </div>
      )}
    </div>
  );
};
