import React, { useState } from 'react';

interface NodeCustomizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentColor: string;
  currentEmoji: string;
  nodeType: 'note' | 'task' | 'project' | 'goal';
  onSave: (color: string, emoji: string) => void;
}

const COLOR_PRESETS = [
  { name: 'Purple', value: '#8b5cf6' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Green', value: '#10b981' },
  { name: 'Orange', value: '#f59e0b' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Cyan', value: '#06b6d4' },
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Teal', value: '#14b8a6' },
  { name: 'Lime', value: '#84cc16' },
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Rose', value: '#f43f5e' },
];

const EMOJI_PRESETS = {
  note: ['📝', '📄', '📋', '📓', '📔', '📕', '📗', '📘', '📙', '📚', '📖', '🗒️'],
  task: ['☐', '✅', '✓', '☑️', '📌', '📍', '🎯', '⭐', '🔔', '⏰', '⚡', '🔥'],
  project: ['📁', '🗂️', '📦', '🎨', '🔧', '⚙️', '🛠️', '🚀', '💼', '🎭', '🏗️', '🌟'],
  goal: ['🎯', '🏆', '🥇', '🎖️', '👑', '💎', '⭐', '🌟', '✨', '🔮', '🎪', '🎁'],
};

export const NodeCustomizationModal: React.FC<NodeCustomizationModalProps> = ({
  isOpen,
  onClose,
  currentColor,
  currentEmoji,
  nodeType,
  onSave,
}) => {
  const [selectedColor, setSelectedColor] = useState(currentColor);
  const [selectedEmoji, setSelectedEmoji] = useState(currentEmoji);
  const [customColor, setCustomColor] = useState(currentColor);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(selectedColor, selectedEmoji);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
      <div
        className="bg-card-bg border border-card-border rounded-2xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-card-border flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-text-primary">Customize Node</h2>
            <p className="text-xs text-text-secondary mt-1">Change appearance</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20 flex items-center justify-center text-text-primary text-lg transition-colors"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[60vh]">
          {/* Preview */}
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-2">
              Preview
            </label>
            <div className="flex justify-center">
              <div
                className="rounded-lg border-2 border-white/30 shadow-lg p-3 min-w-[180px]"
                style={{ backgroundColor: selectedColor }}
              >
                <div className="flex items-center gap-2 text-white">
                  <span className="text-2xl">{selectedEmoji}</span>
                  <div>
                    <h3 className="font-bold text-sm">Sample</h3>
                    <p className="text-xs text-white/80 capitalize">{nodeType}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Color Picker */}
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-2">
              Color
            </label>
            <div className="grid grid-cols-6 gap-2">
              {COLOR_PRESETS.map((color) => (
                <button
                  key={color.value}
                  onClick={() => setSelectedColor(color.value)}
                  className={`w-full aspect-square rounded-lg border-2 transition-all hover:scale-110 ${
                    selectedColor === color.value
                      ? 'border-white shadow-lg scale-110'
                      : 'border-card-border'
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                >
                  {selectedColor === color.value && (
                    <span className="text-white text-xl">✓</span>
                  )}
                </button>
              ))}
            </div>

            {/* Custom Color */}
            <div className="mt-3 flex items-center gap-2">
              <label className="text-xs text-text-secondary">Custom:</label>
              <input
                type="color"
                value={customColor}
                onChange={(e) => {
                  setCustomColor(e.target.value);
                  setSelectedColor(e.target.value);
                }}
                className="w-12 h-8 rounded border border-card-border cursor-pointer"
              />
              <input
                type="text"
                value={customColor}
                onChange={(e) => {
                  setCustomColor(e.target.value);
                  if (/^#[0-9A-F]{6}$/i.test(e.target.value)) {
                    setSelectedColor(e.target.value);
                  }
                }}
                className="flex-1 px-2 py-1 bg-black/5 dark:bg-white/5 text-text-primary rounded border border-card-border focus:outline-none focus:ring-2 focus:ring-accent text-xs"
                placeholder="#8b5cf6"
              />
            </div>
          </div>

          {/* Emoji Picker */}
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-2">
              Icon
            </label>
            <div className="grid grid-cols-8 gap-1.5">
              {EMOJI_PRESETS[nodeType].map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => setSelectedEmoji(emoji)}
                  className={`w-full aspect-square rounded border transition-all hover:scale-110 flex items-center justify-center text-xl ${
                    selectedEmoji === emoji
                      ? 'border-accent bg-accent/10 shadow-lg scale-110'
                      : 'border-card-border bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-card-border flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 py-1.5 bg-black/10 dark:bg-white/10 text-text-primary rounded text-sm font-semibold hover:bg-black/20 dark:hover:bg-white/20 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-3 py-1.5 bg-accent text-white rounded text-sm font-semibold hover:bg-accent-secondary transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};
