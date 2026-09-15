import React, { useState } from "react";
import { X, Sparkles, Shield, User, Copy, Check } from "lucide-react";

interface MascotModalProps {
  isOpen: boolean;
  onClose: () => void;
  mascotName: string;
  onMascotNameChange: (name: string) => void;
}

export const MascotModal: React.FC<MascotModalProps> = ({
  isOpen,
  onClose,
  mascotName,
  onMascotNameChange,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const mascotPromptTemplate = `3D Pixar style, a heroic character made of a glowing plump golden liquid drop, confident expression, rosy cheeks. Wearing a green leaf cape with water droplets tied at the neck. Holding a small glowing twig with green leaves in the right hand. Holding a round golden shield in the left hand with clear typography text '[${mascotName}]' explicitly engraved on the shield. Surrounded by floating magical glowing particles, soft peach background, magical aura, highly detailed.`;

  const femaleLeadPromptTemplate = `Vietnamese female: 25-34 years old, fair skin, round face, tied dark brown hair in a neat low ponytail, wearing EXACTLY a casual light green short-sleeved crew-neck t-shirt, normal flat stomach, NOT pregnant. Character identity consistency is mandatory. Maintain EXACT same face, hairstyle, facial proportions, eye shape, nose shape, body shape, skin tone, outfit, and overall appearance from previous scenes and reference images.`;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">
                Thiết Kế Nhân Vật 3D Pixar & Mascot Khiên Vàng
              </h3>
              <p className="text-[11px] text-slate-400">
                Đặc tả chi tiết để bảo đảm tính nhất quán (Consistency) 100% qua tất cả các cảnh
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

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Mascot Customizer */}
          <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-300 flex items-center space-x-1.5">
                <Shield className="w-4 h-4 text-amber-400" />
                <span>Mascot Giọt Vàng Dũng Sĩ (Herbal Drop Hero)</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                Neo Hình Ảnh (Visual Anchoring)
              </span>
            </div>

            <div>
              <label className="text-xs text-slate-300 block mb-1">
                Tên thương hiệu / sản phẩm khắc trên Khiên Vàng:
              </label>
              <input
                type="text"
                value={mascotName}
                onChange={(e) => onMascotNameChange(e.target.value)}
                placeholder="Trà Dây Bstar"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-amber-300 font-bold focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800 font-mono text-xs text-slate-300 leading-relaxed break-words">
              {mascotPromptTemplate}
            </div>

            <button
              onClick={() => handleCopy(mascotPromptTemplate)}
              className="flex items-center justify-center space-x-1.5 w-full py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-amber-300 rounded-lg transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Sao chép Prompt Mascot 3D</span>
            </button>
          </div>

          {/* Lead Character Specs */}
          <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-300 flex items-center space-x-1.5">
                <User className="w-4 h-4 text-emerald-400" />
                <span>Nhân Vật Nữ Chính (Locked Character)</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                100% Identity Continuity
              </span>
            </div>

            <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800 font-mono text-xs text-slate-300 leading-relaxed break-words">
              {femaleLeadPromptTemplate}
            </div>

            <button
              onClick={() => handleCopy(femaleLeadPromptTemplate)}
              className="flex items-center justify-center space-x-1.5 w-full py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-emerald-300 rounded-lg transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Sao chép Prompt Nhân Vật Nữ</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
