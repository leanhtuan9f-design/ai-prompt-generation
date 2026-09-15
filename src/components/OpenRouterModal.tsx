import React from "react";
import { SettingsModal, OPENROUTER_MODELS } from "./SettingsModal";
import { SystemSettings } from "../types/settings";

interface OpenRouterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export { OPENROUTER_MODELS };

export const OpenRouterModal: React.FC<OpenRouterModalProps> = ({ isOpen, onClose, onSaved }) => {
  return (
    <SettingsModal
      isOpen={isOpen}
      onClose={onClose}
      onSaved={() => onSaved()}
      initialTab="ai"
    />
  );
};
