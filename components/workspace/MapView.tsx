import React, { useCallback, useState, MouseEvent, useEffect } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  BackgroundVariant,
  NodeTypes,
  Panel,
  useReactFlow,
  EdgeTypes,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import type { Workspace, Note, Task } from '../../App';
import { CustomNode } from './CustomNode';
import { NodePreviewModal } from './NodePreviewModal';
import { NodeCustomizationModal } from './NodeCustomizationModal';

interface MapViewProps {
  workspace: Workspace;
  onUpdateWorkspace: (workspace: Workspace) => void;
  notes: Note[];
  tasks: Task[];
  onUpdateNote?: (note: Note) => void;
  onUpdateTask?: (task: Task) => void;
}

interface ContextMenu {
  x: number;
  y: number;
  type?: 'canvas' | 'node' | 'edge';
  nodeId?: string;
  edgeId?: string;
}

const nodeTypes: NodeTypes = {
  custom: CustomNode,
};

// Custom edge types for different connection styles
const edgeTypes: EdgeTypes = {};

export const MapView: React.FC<MapViewProps> = ({
  workspace,
  onUpdateWorkspace,
  notes,
  tasks,
  onUpdateNote,
  onUpdateTask,
}) => {
  const [contextMenu, setContextMenu] = useState<ContextMenu | null>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const [edgeType, setEdgeType] = useState<'default' | 'step' | 'smoothstep' | 'straight'>('default');
  const [snapToGrid, setSnapToGrid] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [showCanvasTools, setShowCanvasTools] = useState(false); // Collapsed by default
  const [previewModal, setPreviewModal] = useState<{
    isOpen: boolean;
    entityType: 'note' | 'task' | 'project' | 'goal';
    entityId: string;
  } | null>(null);
  const [customizeModal, setCustomizeModal] = useState<{
    isOpen: boolean;
    nodeId: string;
    currentColor: string;
    currentEmoji: string;
    nodeType: 'note' | 'task' | 'project' | 'goal';
  } | null>(null);

  // Convert workspace entities to React Flow nodes
  const initialNodes: Node[] = workspace.entities.map(entity => {
    let label = '';
    let fullContent = '';
    let bgColor = '#3b82f6';
    let emoji = '📄';

    if (entity.type === 'note') {
      const note = notes.find(n => n.id === entity.entityId);
      label = note?.title || 'Unknown Note';
      fullContent = note?.content?.replace(/<[^>]*>/g, '').substring(0, 200) || '';
      bgColor = '#8b5cf6';
      emoji = '📝';
    } else if (entity.type === 'task') {
      const task = tasks.find(t => t.id === entity.entityId);
      label = task?.title || 'Unknown Task';
      fullContent = task?.dueDate ? `Due: ${task.dueDate}` : 'No due date';
      bgColor = task?.completed ? '#10b981' : '#f59e0b';
      emoji = task?.completed ? '✅' : '☐';
    } else if (entity.type === 'project') {
      label = 'Project';
      bgColor = '#ec4899';
      emoji = '📁';
    } else if (entity.type === 'goal') {
      label = 'Goal';
      bgColor = '#06b6d4';
      emoji = '🎯';
    }

    return {
      id: entity.id,
      type: 'custom',
      position: entity.position,
      data: {
        label,
        emoji,
        type: entity.type,
        bgColor,
        fullContent,
        onEdit: (newLabel: string) => handleNodeEdit(entity.id, newLabel),
        onCustomize: () => {
          setCustomizeModal({
            isOpen: true,
            nodeId: entity.id,
            currentColor: bgColor,
            currentEmoji: emoji,
            nodeType: entity.type,
          });
        },
        onDelete: () => handleNodeDelete(entity.id),
        onPreview: () => {
          setPreviewModal({
            isOpen: true,
            entityType: entity.type,
            entityId: entity.entityId,
          });
        },
      },
    };
  });

  // Convert links to edges
  const initialEdges: Edge[] = [];
  workspace.entities.forEach(entity => {
    entity.links.forEach(targetId => {
      initialEdges.push({
        id: `${entity.id}-${targetId}`,
        source: entity.id,
        target: targetId,
        type: edgeType,
        animated: false,
        style: { stroke: '#8b5cf6', strokeWidth: 2 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: '#8b5cf6',
        },
      });
    });
  });

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Re-sync nodes and edges when workspace ID changes (switching workspaces) or entity count changes
  useEffect(() => {
    const updatedNodes: Node[] = workspace.entities.map(entity => {
      let label = '';
      let fullContent = '';
      let bgColor = '#3b82f6';
      let emoji = '📄';

      if (entity.type === 'note') {
        const note = notes.find(n => n.id === entity.entityId);
        label = note?.title || 'Unknown Note';
        fullContent = note?.content?.replace(/<[^>]*>/g, '').substring(0, 200) || '';
        bgColor = '#8b5cf6';
        emoji = '📝';
      } else if (entity.type === 'task') {
        const task = tasks.find(t => t.id === entity.entityId);
        label = task?.title || 'Unknown Task';
        fullContent = task?.dueDate ? `Due: ${task.dueDate}` : 'No due date';
        bgColor = task?.completed ? '#10b981' : '#f59e0b';
        emoji = task?.completed ? '✅' : '☐';
      } else if (entity.type === 'project') {
        label = 'Project';
        bgColor = '#ec4899';
        emoji = '📁';
      } else if (entity.type === 'goal') {
        label = 'Goal';
        bgColor = '#06b6d4';
        emoji = '🎯';
      }

      // Override with custom colors/emojis if they exist in the entity
      if (entity.customColor) {
        bgColor = entity.customColor;
      }
      if (entity.customEmoji) {
        emoji = entity.customEmoji;
      }

      return {
        id: entity.id,
        type: 'custom',
        position: entity.position,
        style: entity.size ? {
          width: entity.size.width,
          height: entity.size.height,
        } : undefined,
        data: {
          label,
          emoji,
          type: entity.type,
          bgColor,
          fullContent,
          onEdit: (newLabel: string) => handleNodeEdit(entity.id, newLabel),
          onCustomize: () => {
            setCustomizeModal({
              isOpen: true,
              nodeId: entity.id,
              currentColor: bgColor,
              currentEmoji: emoji,
              nodeType: entity.type,
            });
          },
          onDelete: () => handleNodeDelete(entity.id),
          onPreview: () => {
            setPreviewModal({
              isOpen: true,
              entityType: entity.type,
              entityId: entity.entityId,
            });
          },
        },
      };
    });

    const updatedEdges: Edge[] = [];
    workspace.entities.forEach(entity => {
      entity.links.forEach(targetId => {
        const edgeId = `${entity.id}-${targetId}`;
        const savedEdgeType = workspace.edgeStyles?.[edgeId] || edgeType;
        const savedHandles = workspace.edgeHandles?.[edgeId];

        updatedEdges.push({
          id: edgeId,
          source: entity.id,
          target: targetId,
          sourceHandle: savedHandles?.sourceHandle || null,
          targetHandle: savedHandles?.targetHandle || null,
          type: savedEdgeType,
          animated: false,
          style: { stroke: '#8b5cf6', strokeWidth: 3 },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: '#8b5cf6',
          },
          interactionWidth: 30, // Makes the edge easier to click
        });
      });
    });

    setNodes(updatedNodes);
    setEdges(updatedEdges);
  }, [workspace.id, workspace.entities, notes, tasks, edgeType]);

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) => addEdge(connection, eds));

      // Update workspace with new link
      const updatedEntities = workspace.entities.map(entity => {
        if (entity.id === connection.source && connection.target) {
          return {
            ...entity,
            links: [...entity.links, connection.target],
          };
        }
        return entity;
      });

      // Save the handle information
      const edgeId = `${connection.source}-${connection.target}`;
      const updatedEdgeHandles = {
        ...(workspace.edgeHandles || {}),
        [edgeId]: {
          sourceHandle: connection.sourceHandle || undefined,
          targetHandle: connection.targetHandle || undefined,
        },
      };

      onUpdateWorkspace({
        ...workspace,
        entities: updatedEntities,
        edgeHandles: updatedEdgeHandles,
      });
    },
    [workspace, onUpdateWorkspace, setEdges]
  );

  const onEdgesDelete = useCallback(
    (edgesToDelete: Edge[]) => {
      edgesToDelete.forEach((edge) => {
        // Remove the link from the workspace
        const updatedEntities = workspace.entities.map(entity => {
          if (entity.id === edge.source) {
            return {
              ...entity,
              links: entity.links.filter(linkId => linkId !== edge.target),
            };
          }
          return entity;
        });

        // Also remove the edge style and handles if they exist
        const updatedEdgeStyles = { ...(workspace.edgeStyles || {}) };
        const updatedEdgeHandles = { ...(workspace.edgeHandles || {}) };
        delete updatedEdgeStyles[edge.id];
        delete updatedEdgeHandles[edge.id];

        onUpdateWorkspace({
          ...workspace,
          entities: updatedEntities,
          edgeStyles: updatedEdgeStyles,
          edgeHandles: updatedEdgeHandles,
        });
      });
    },
    [workspace, onUpdateWorkspace]
  );

  const onNodeDragStop = useCallback(
    (_event: any, node: Node) => {
      // Update workspace with new position
      const updatedEntities = workspace.entities.map(entity => {
        if (entity.id === node.id) {
          return {
            ...entity,
            position: node.position,
          };
        }
        return entity;
      });

      onUpdateWorkspace({
        ...workspace,
        entities: updatedEntities,
      });
    },
    [workspace, onUpdateWorkspace]
  );

  const onNodeResizeStop = useCallback(
    (_event: any, node: Node) => {
      // Update workspace with new size
      const updatedEntities = workspace.entities.map(entity => {
        if (entity.id === node.id) {
          return {
            ...entity,
            size: node.style?.width && node.style?.height ? {
              width: typeof node.style.width === 'number' ? node.style.width : parseInt(node.style.width as string),
              height: typeof node.style.height === 'number' ? node.style.height : parseInt(node.style.height as string),
            } : entity.size,
          };
        }
        return entity;
      });

      onUpdateWorkspace({
        ...workspace,
        entities: updatedEntities,
      });
    },
    [workspace, onUpdateWorkspace]
  );

  const handleNodeEdit = (nodeId: string, newLabel: string) => {
    // Update the node label in React Flow
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              label: newLabel,
            },
          };
        }
        return node;
      })
    );

    // Note: This doesn't update the actual note/task - that would require
    // a connection back to the parent component. For now, it's just visual.
  };

  const handleNodeDelete = (nodeId: string) => {
    // Remove node from React Flow
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));

    // Remove from workspace
    const updatedEntities = workspace.entities.filter(e => e.id !== nodeId);
    onUpdateWorkspace({
      ...workspace,
      entities: updatedEntities,
    });
  };

  const handleNodeCustomize = (nodeId: string, color: string, emoji: string) => {
    // Update the node visually in React Flow
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              bgColor: color,
              emoji: emoji,
            },
          };
        }
        return node;
      })
    );

    // Save custom colors/emojis to the workspace entity for persistence
    const updatedEntities = workspace.entities.map(entity => {
      if (entity.id === nodeId) {
        return {
          ...entity,
          customColor: color,
          customEmoji: emoji,
        };
      }
      return entity;
    });

    onUpdateWorkspace({
      ...workspace,
      entities: updatedEntities,
    });
  };

  const handlePaneContextMenu = useCallback((event: MouseEvent) => {
    event.preventDefault();

    if (!reactFlowInstance) return;

    const bounds = (event.target as HTMLElement).getBoundingClientRect();
    const position = reactFlowInstance.project({
      x: event.clientX - bounds.left,
      y: event.clientY - bounds.top,
    });

    setContextMenu({
      x: event.clientX,
      y: event.clientY,
      type: 'canvas',
    });
  }, [reactFlowInstance]);

  const handleCreateNote = () => {
    if (!reactFlowInstance || !contextMenu) return;

    const bounds = document.querySelector('.react-flow')?.getBoundingClientRect();
    if (!bounds) return;

    const position = reactFlowInstance.project({
      x: contextMenu.x - bounds.left,
      y: contextMenu.y - bounds.top,
    });

    const newEntity = {
      id: crypto.randomUUID(),
      type: 'note' as const,
      entityId: 'new-note', // Placeholder - in real app, create actual note
      position: { x: position.x, y: position.y },
      links: [],
    };

    const newNode: Node = {
      id: newEntity.id,
      type: 'custom',
      position: newEntity.position,
      style: { width: 220, height: 140 },
      data: {
        label: 'New Note',
        emoji: '📝',
        type: 'note',
        bgColor: '#8b5cf6',
        onEdit: (newLabel: string) => handleNodeEdit(newEntity.id, newLabel),
        onDelete: () => handleNodeDelete(newEntity.id),
      },
    };

    setNodes((nds) => [...nds, newNode]);

    onUpdateWorkspace({
      ...workspace,
      entities: [...workspace.entities, newEntity],
    });

    setContextMenu(null);

    // Zoom out 4 clicks instead of fitting view
    setTimeout(() => {
      if (reactFlowInstance) {
        reactFlowInstance.zoomOut({ duration: 300 });
        setTimeout(() => reactFlowInstance.zoomOut({ duration: 300 }), 350);
        setTimeout(() => reactFlowInstance.zoomOut({ duration: 300 }), 700);
        setTimeout(() => reactFlowInstance.zoomOut({ duration: 300 }), 1050);
      }
    }, 50);
  };

  const handleCreateTask = () => {
    if (!reactFlowInstance || !contextMenu) return;

    const bounds = document.querySelector('.react-flow')?.getBoundingClientRect();
    if (!bounds) return;

    const position = reactFlowInstance.project({
      x: contextMenu.x - bounds.left,
      y: contextMenu.y - bounds.top,
    });

    const newEntity = {
      id: crypto.randomUUID(),
      type: 'task' as const,
      entityId: 'new-task',
      position: { x: position.x, y: position.y },
      links: [],
    };

    const newNode: Node = {
      id: newEntity.id,
      type: 'custom',
      position: newEntity.position,
      style: { width: 220, height: 140 },
      data: {
        label: 'New Task',
        emoji: '☐',
        type: 'task',
        bgColor: '#f59e0b',
        onEdit: (newLabel: string) => handleNodeEdit(newEntity.id, newLabel),
        onDelete: () => handleNodeDelete(newEntity.id),
      },
    };

    setNodes((nds) => [...nds, newNode]);

    onUpdateWorkspace({
      ...workspace,
      entities: [...workspace.entities, newEntity],
    });

    setContextMenu(null);

    // Zoom out 4 clicks instead of fitting view
    setTimeout(() => {
      if (reactFlowInstance) {
        reactFlowInstance.zoomOut({ duration: 300 });
        setTimeout(() => reactFlowInstance.zoomOut({ duration: 300 }), 350);
        setTimeout(() => reactFlowInstance.zoomOut({ duration: 300 }), 700);
        setTimeout(() => reactFlowInstance.zoomOut({ duration: 300 }), 1050);
      }
    }, 50);
  };

  const handleCloseContextMenu = () => {
    setContextMenu(null);
  };

  const handleExportImage = () => {
    if (reactFlowInstance) {
      // This would require html-to-image library
      alert('Export feature - install html-to-image library to enable');
    }
  };

  const handleFitView = () => {
    if (reactFlowInstance) {
      reactFlowInstance.fitView({ padding: 0.2, duration: 800 });
    }
  };

  const handleZoomIn = () => {
    if (reactFlowInstance) {
      reactFlowInstance.zoomIn({ duration: 300 });
    }
  };

  const handleZoomOut = () => {
    if (reactFlowInstance) {
      reactFlowInstance.zoomOut({ duration: 300 });
    }
  };

  const handleEdgeClick = useCallback((_event: React.MouseEvent, edge: Edge) => {
    _event.preventDefault();
    // Center the menu on screen instead of at click position
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    setContextMenu({
      x: screenWidth / 2 - 100, // Center horizontally (100px is half of menu width ~200px)
      y: screenHeight / 2 - 150, // Center vertically
      type: 'edge',
      edgeId: edge.id,
    });
  }, []);

  const handleDeleteEdge = () => {
    if (!contextMenu?.edgeId) return;

    const edgeToDelete = edges.find(e => e.id === contextMenu.edgeId);
    if (edgeToDelete) {
      onEdgesDelete([edgeToDelete]);
    }
    setContextMenu(null);
  };

  const handleChangeEdgeStyle = (newType: 'default' | 'step' | 'smoothstep' | 'straight') => {
    if (!contextMenu?.edgeId) return;

    // Update the edge visually in React Flow
    setEdges((eds) =>
      eds.map((edge) => {
        if (edge.id === contextMenu.edgeId) {
          return {
            ...edge,
            type: newType,
          };
        }
        return edge;
      })
    );

    // Save the edge style to the workspace's edgeStyles map
    const updatedEdgeStyles = {
      ...(workspace.edgeStyles || {}),
      [contextMenu.edgeId]: newType,
    };

    onUpdateWorkspace({
      ...workspace,
      edgeStyles: updatedEdgeStyles,
    });

    setContextMenu(null);
  };

  return (
    <div className="w-full bg-black/5 dark:bg-white/5 rounded-lg overflow-hidden relative h-[480px] md:h-[560px] lg:h-[720px]">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onEdgesDelete={onEdgesDelete}
        onConnect={onConnect}
        onNodeDragStop={onNodeDragStop}
        onNodeResizeStop={onNodeResizeStop}
        onEdgeClick={handleEdgeClick}
        onInit={setReactFlowInstance}
        onPaneContextMenu={handlePaneContextMenu}
        onPaneClick={handleCloseContextMenu}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        deleteKeyCode={['Backspace', 'Delete']}
        snapToGrid={snapToGrid}
        snapGrid={[15, 15]}
        fitView
        attributionPosition="bottom-left"
        defaultEdgeOptions={{
          type: edgeType,
          animated: false,
          style: { strokeWidth: 2 },
        }}
        selectNodesOnDrag={false}
        selectionOnDrag={false}
        panOnDrag={[0, 1]}
        selectionMode="partial"
        panOnScroll={true}
        zoomOnScroll={true}
        zoomOnDoubleClick={false}
        multiSelectionKeyCode="Shift"
        nodesDraggable={true}
        nodesConnectable={true}
        nodesFocusable={true}
        elementsSelectable={true}
        edgesReconnectable={false}
        minZoom={0.1}
        maxZoom={2}
        defaultViewport={{ x: 0, y: 0, zoom: 0.5 }}
      >
        {showGrid && <Background variant={BackgroundVariant.Dots} gap={20} size={1} />}
        <MiniMap
          nodeColor={(node) => {
            return (node.data.bgColor as string) || '#3b82f6';
          }}
          maskColor="rgba(0, 0, 0, 0.1)"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.05)' }}
        />

        {/* Control Panel - Vertical Sidebar */}
        <Panel position="top-right">
          <div className="flex flex-col gap-2">
            <button
              onClick={handleFitView}
              className="bg-white/90 dark:bg-gray-800/90 border border-card-border rounded-lg shadow-lg p-2.5 hover:bg-accent hover:text-white transition-all backdrop-blur-xl text-text-primary"
              title="Fit View"
            >
              <span className="text-lg">🎯</span>
            </button>
            <button
              onClick={handleZoomIn}
              className="bg-white/90 dark:bg-gray-800/90 border border-card-border rounded-lg shadow-lg p-2.5 hover:bg-accent hover:text-white transition-all backdrop-blur-xl text-text-primary"
              title="Zoom In"
            >
              <span className="text-lg">➕</span>
            </button>
            <button
              onClick={handleZoomOut}
              className="bg-white/90 dark:bg-gray-800/90 border border-card-border rounded-lg shadow-lg p-2.5 hover:bg-accent hover:text-white transition-all backdrop-blur-xl text-text-primary"
              title="Zoom Out"
            >
              <span className="text-lg">➖</span>
            </button>
            <button
              onClick={() => setShowGrid(!showGrid)}
              className={`border border-card-border rounded-lg shadow-lg p-2.5 hover:bg-accent hover:text-white transition-all backdrop-blur-xl ${showGrid ? 'bg-accent text-white' : 'bg-white/90 dark:bg-gray-800/90 text-text-primary'}`}
              title={showGrid ? "Grid: ON" : "Grid: OFF"}
            >
              <span className="text-lg">⊞</span>
            </button>
          </div>
        </Panel>
      </ReactFlow>

      {/* Context Menu */}
      {contextMenu && contextMenu.type === 'canvas' && (
        <div
          className="absolute bg-card-bg/80 backdrop-blur-xl border border-card-border rounded-lg shadow-2xl py-2 z-50 min-w-[200px]"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          <div className="px-3 py-2 text-xs font-bold text-text-secondary uppercase border-b border-card-border mb-2">
            Create New
          </div>
          <button
            onClick={handleCreateNote}
            className="w-full text-left px-4 py-2 hover:bg-black/10 dark:hover:bg-white/10 text-text-primary flex items-center gap-3 transition-colors"
          >
            <span className="text-xl">📝</span>
            <span className="font-medium">Note</span>
          </button>
          <button
            onClick={handleCreateTask}
            className="w-full text-left px-4 py-2 hover:bg-black/10 dark:hover:bg-white/10 text-text-primary flex items-center gap-3 transition-colors"
          >
            <span className="text-xl">☐</span>
            <span className="font-medium">Task</span>
          </button>
          <div className="border-t border-card-border my-2"></div>
          <button
            onClick={handleCloseContextMenu}
            className="w-full text-left px-4 py-2 hover:bg-black/10 dark:hover:bg-white/10 text-text-secondary flex items-center gap-3 text-sm transition-colors"
          >
            Close
          </button>
        </div>
      )}

      {/* Edge Context Menu */}
      {contextMenu && contextMenu.type === 'edge' && (
        <div
          className="absolute bg-card-bg border border-card-border rounded-lg shadow-2xl py-2 z-50 min-w-[200px]"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          <div className="px-3 py-2 text-xs font-bold text-text-secondary uppercase border-b border-card-border mb-2">
            Connection Style
          </div>
          <button
            onClick={() => handleChangeEdgeStyle('default')}
            className="w-full text-left px-4 py-2 hover:bg-black/10 dark:hover:bg-white/10 text-text-primary transition-colors"
          >
            Bezier Curve
          </button>
          <button
            onClick={() => handleChangeEdgeStyle('smoothstep')}
            className="w-full text-left px-4 py-2 hover:bg-black/10 dark:hover:bg-white/10 text-text-primary transition-colors"
          >
            Smooth Step
          </button>
          <button
            onClick={() => handleChangeEdgeStyle('step')}
            className="w-full text-left px-4 py-2 hover:bg-black/10 dark:hover:bg-white/10 text-text-primary transition-colors"
          >
            Step
          </button>
          <button
            onClick={() => handleChangeEdgeStyle('straight')}
            className="w-full text-left px-4 py-2 hover:bg-black/10 dark:hover:bg-white/10 text-text-primary transition-colors"
          >
            Straight Line
          </button>
          <div className="border-t border-card-border my-2"></div>
          <button
            onClick={handleDeleteEdge}
            className="w-full text-left px-4 py-2 hover:bg-red-500/10 text-red-600 font-medium transition-colors"
          >
            🗑️ Delete Connection
          </button>
          <button
            onClick={handleCloseContextMenu}
            className="w-full text-left px-4 py-2 hover:bg-black/10 dark:hover:bg-white/10 text-text-secondary text-sm transition-colors"
          >
            Close
          </button>
        </div>
      )}

      {workspace.entities.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center text-text-secondary bg-card-bg/80 backdrop-blur-sm p-8 rounded-xl">
            <p className="text-lg font-semibold mb-2">Empty Canvas</p>
            <p className="text-sm mb-4">Right-click canvas to create a new item</p>
            <div className="text-xs space-y-1 text-left">
              <p>💡 <strong>Click node</strong> - Open preview & edit</p>
              <p>💡 <strong>Left-click drag</strong> - Pan the canvas</p>
              <p>💡 <strong>Right-click canvas</strong> - Create new items</p>
              <p>💡 <strong>Double-click node</strong> - Quick edit node text</p>
              <p>💡 <strong>Drag node</strong> - Move nodes around</p>
              <p>💡 <strong>Connect handles</strong> - Link items together</p>
              <p>💡 <strong>Click line + Delete/Backspace</strong> - Remove connection</p>
            </div>
          </div>
        </div>
      )}

      {/* Node Preview Modal */}
      {previewModal && (
        <NodePreviewModal
          isOpen={previewModal.isOpen}
          onClose={() => setPreviewModal(null)}
          entityType={previewModal.entityType}
          entityId={previewModal.entityId}
          notes={notes}
          tasks={tasks}
          onUpdateNote={onUpdateNote}
          onUpdateTask={onUpdateTask}
        />
      )}

      {/* Node Customization Modal */}
      {customizeModal && (
        <NodeCustomizationModal
          isOpen={customizeModal.isOpen}
          onClose={() => setCustomizeModal(null)}
          currentColor={customizeModal.currentColor}
          currentEmoji={customizeModal.currentEmoji}
          nodeType={customizeModal.nodeType}
          onSave={(color, emoji) => {
            handleNodeCustomize(customizeModal.nodeId, color, emoji);
            setCustomizeModal(null);
          }}
        />
      )}
    </div>
  );
};
