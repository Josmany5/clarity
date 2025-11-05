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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div
        className="bg-card-bg border border-card-border rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-card-border flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-text-primary">Customize Node</h2>
            <p className="text-sm text-text-secondary mt-1">Change appearance and style</p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20 flex items-center justify-center text-text-primary text-xl transition-colors"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Preview */}
          <div>
            <label className="block text-sm font-semibold text-text-secondary mb-3">
              Preview
            </label>
            <div className="flex justify-center">
              <div
                className="rounded-xl border-2 border-white/30 shadow-lg p-4 min-w-[220px]"
                style={{ backgroundColor: selectedColor }}
              >
                <div className="flex items-center gap-3 text-white">
                  <span className="text-3xl">{selectedEmoji}</span>
                  <div>
                    <h3 className="font-bold text-base">Sample Node</h3>
                    <p className="text-sm text-white/80 capitalize">{nodeType}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Color Picker */}
          <div>
            <label className="block text-sm font-semibold text-text-secondary mb-3">
              Node Color
            </label>
            <div className="grid grid-cols-6 gap-3">
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
            <div className="mt-4 flex items-center gap-3">
              <label className="text-sm text-text-secondary">Custom Color:</label>
              <input
                type="color"
                value={customColor}
                onChange={(e) => {
                  setCustomColor(e.target.value);
                  setSelectedColor(e.target.value);
                }}
                className="w-16 h-10 rounded border border-card-border cursor-pointer"
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
                className="flex-1 px-3 py-2 bg-black/5 dark:bg-white/5 text-text-primary rounded-lg border border-card-border focus:outline-none focus:ring-2 focus:ring-accent text-sm"
                placeholder="#8b5cf6"
              />
            </div>
          </div>

          {/* Emoji Picker */}
          <div>
            <label className="block text-sm font-semibold text-text-secondary mb-3">
              Node Icon
            </label>
            <div className="grid grid-cols-8 gap-2">
              {EMOJI_PRESETS[nodeType].map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => setSelectedEmoji(emoji)}
                  className={`w-full aspect-square rounded-lg border-2 transition-all hover:scale-110 flex items-center justify-center text-2xl ${
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

          {/* React Flow Options */}
          <div>
            <label className="block text-sm font-semibold text-text-secondary mb-3">
              Node Options
            </label>
            <div className="space-y-3 bg-black/5 dark:bg-white/5 p-4 rounded-lg border border-card-border">
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-primary">Draggable</span>
                <span className="text-xs text-green-600 font-semibold">✓ Enabled</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-primary">Connectable</span>
                <span className="text-xs text-green-600 font-semibold">✓ Enabled</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-primary">Selectable</span>
                <span className="text-xs text-green-600 font-semibold">✓ Enabled</span>
              </div>
              <p className="text-xs text-text-secondary italic mt-3">
                Advanced React Flow options coming soon...
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-card-border flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-black/10 dark:bg-white/10 text-text-primary rounded-lg font-semibold hover:bg-black/20 dark:hover:bg-white/20 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-accent text-white rounded-lg font-semibold hover:bg-accent-secondary transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};
