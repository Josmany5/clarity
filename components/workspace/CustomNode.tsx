import React, { useState, memo } from 'react';
import { Handle, Position, NodeProps, NodeResizer } from 'reactflow';

interface CustomNodeData {
  label: string;
  emoji: string;
  type: 'note' | 'task' | 'project' | 'goal';
  bgColor: string;
  fullContent?: string;
  onEdit?: (newLabel: string) => void;
  onCustomize?: () => void;
  onExpand?: () => void;
  onDelete?: () => void;
  onPreview?: () => void;
}

export const CustomNode = memo(({ data, isConnectable }: NodeProps<CustomNodeData>) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(data.label);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    if (data.onEdit && editValue.trim()) {
      data.onEdit(editValue);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      setEditValue(data.label);
      setIsEditing(false);
    }
  };

  const handleNodeClick = (e: React.MouseEvent | React.TouchEvent) => {
    // Only trigger preview if not clicking on buttons or handles
    const target = e.target as HTMLElement;
    if (
      !target.closest('button') &&
      !target.closest('.react-flow__handle') &&
      !isEditing &&
      data.onPreview
    ) {
      data.onPreview();
    }
  };

  const handleNodeTouch = (e: React.TouchEvent) => {
    // Prevent default to avoid triggering onClick as well
    e.preventDefault();
    handleNodeClick(e);
  };

  return (
    <div
      className="rounded-xl border-2 border-white/30 shadow-lg cursor-pointer hover:border-white/50 transition-all"
      style={{ backgroundColor: data.bgColor, minWidth: '220px', width: '100%', height: '100%' }}
      onDoubleClick={handleDoubleClick}
      onClick={handleNodeClick}
      onTouchEnd={handleNodeTouch}
    >
      {/* Node Resizer */}
      <NodeResizer
        color="#8b5cf6"
        isVisible={true}
        minWidth={220}
        minHeight={140}
      />

      {/* Top Handle */}
      <Handle
        type="target"
        position={Position.Top}
        id="top"
        isConnectable={isConnectable}
        className="w-3 h-3 !bg-white/90 !border-2 !border-gray-400"
      />

      {/* Left Handle */}
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        isConnectable={isConnectable}
        className="w-3 h-3 !bg-white/90 !border-2 !border-gray-400"
      />

      {/* Right Handle */}
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        isConnectable={isConnectable}
        className="w-3 h-3 !bg-white/90 !border-2 !border-gray-400"
      />

      <div className="p-4 text-white">
        <div className="flex items-start gap-2 mb-2">
          <span className="text-3xl flex-shrink-0">{data.emoji}</span>
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <input
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={handleSave}
                onKeyDown={handleKeyDown}
                autoFocus
                className="w-full px-2 py-1 text-base bg-white/20 text-white border border-white/40 rounded focus:outline-none focus:ring-2 focus:ring-white/60"
              />
            ) : (
              <h3 className="font-bold text-base leading-tight break-words">
                {data.label}
              </h3>
            )}
          </div>
        </div>

        {/* Expandable content preview */}
        {data.fullContent && (
          <div className="mt-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              onTouchEnd={(e) => {
                e.stopPropagation();
                e.preventDefault();
                setIsExpanded(!isExpanded);
              }}
              className="text-sm text-white/80 hover:text-white underline"
            >
              {isExpanded ? 'Show less' : 'Show more'}
            </button>
            {isExpanded && (
              <div className="mt-2 p-2 bg-black/20 rounded text-sm text-white/90 max-h-40 overflow-y-auto">
                {data.fullContent}
              </div>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center gap-2 mt-3 pt-2 border-t border-white/20">
          {data.onCustomize && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                data.onCustomize?.();
              }}
              onTouchEnd={(e) => {
                e.stopPropagation();
                e.preventDefault();
                data.onCustomize?.();
              }}
              className="px-2 py-1 text-sm bg-white/20 hover:bg-white/30 rounded transition-colors"
              title="Customize Node"
            >
              🎨
            </button>
          )}
          {data.onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                data.onDelete?.();
              }}
              onTouchEnd={(e) => {
                e.stopPropagation();
                e.preventDefault();
                data.onDelete?.();
              }}
              className="px-2 py-1 text-sm bg-red-500/30 hover:bg-red-500/50 rounded transition-colors"
              title="Delete"
            >
              🗑️
            </button>
          )}
          <span className="ml-auto text-sm text-white/60 capitalize">{data.type}</span>
        </div>
      </div>

      {/* Bottom Handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        isConnectable={isConnectable}
        className="w-3 h-3 !bg-white/90 !border-2 !border-gray-400"
      />
    </div>
  );
});

CustomNode.displayName = 'CustomNode';
