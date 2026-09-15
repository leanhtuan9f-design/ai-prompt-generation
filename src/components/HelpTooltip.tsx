import React, { useState, useRef, useEffect } from "react";
import { Info, HelpCircle } from "lucide-react";

interface HelpTooltipProps {
  text: string;
  title?: string;
  className?: string;
  iconClassName?: string;
  variant?: "info" | "warning" | "help" | "tip";
  align?: "left" | "right" | "center";
}

export const HelpTooltip: React.FC<HelpTooltipProps> = ({
  text,
  title,
  className = "",
  iconClassName = "",
  variant = "info",
  align = "center",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const getVariantStyles = () => {
    switch (variant) {
      case "warning":
        return {
          icon: "text-amber-400 hover:text-amber-300 bg-amber-500/15 border-amber-500/30",
          popover: "border-amber-500/40 bg-slate-900 text-amber-200",
        };
      case "tip":
        return {
          icon: "text-emerald-400 hover:text-emerald-300 bg-emerald-500/15 border-emerald-500/30",
          popover: "border-emerald-500/40 bg-slate-900 text-slate-200",
        };
      case "help":
        return {
          icon: "text-cyan-400 hover:text-cyan-300 bg-cyan-500/15 border-cyan-500/30",
          popover: "border-cyan-500/40 bg-slate-900 text-slate-200",
        };
      case "info":
      default:
        return {
          icon: "text-indigo-300 hover:text-indigo-200 bg-indigo-500/15 border-indigo-500/30",
          popover: "border-indigo-500/40 bg-slate-900 text-slate-200",
        };
    }
  };

  const vStyles = getVariantStyles();

  const getAlignmentClass = () => {
    if (align === "left") return "left-0";
    if (align === "right") return "right-0";
    return "left-1/2 -translate-x-1/2";
  };

  return (
    <div
      ref={containerRef}
      className={`relative inline-flex items-center align-middle shrink-0 ${className}`}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        aria-label="Xem hướng dẫn"
        className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] font-bold cursor-pointer transition-all duration-150 ${vStyles.icon} ${iconClassName}`}
      >
        <span className="leading-none">?</span>
      </button>

      {isOpen && (
        <div
          className={`absolute bottom-full mb-1.5 ${getAlignmentClass()} z-50 w-64 sm:w-72 p-2.5 rounded-lg shadow-xl border text-[11px] leading-relaxed backdrop-blur-md animate-in fade-in zoom-in-95 pointer-events-auto ${vStyles.popover}`}
        >
          {title && (
            <div className="font-bold text-xs mb-1 text-slate-100 flex items-center space-x-1.5 pb-1 border-b border-slate-700/60">
              <span>{title}</span>
            </div>
          )}
          <p className="text-slate-200">{text}</p>
        </div>
      )}
    </div>
  );
};
