import React, { useState, useEffect } from 'react';
import { MoodItem, MoodboardNode } from '../types';
import {
  X,
  Trash2,
  RotateCw,
  StickyNote,
  Save,
  Sparkles
} from 'lucide-react';
import { saveMoodboardState, getMoodboardState } from '../services/storage';
import { TranslationDict } from '../services/i18n';

interface MoodboardCanvasProps {
  onClose: () => void;
  pinnedItems: MoodItem[];
  allItems: MoodItem[];
  t: TranslationDict;
}

export const MoodboardCanvas: React.FC<MoodboardCanvasProps> = ({
  onClose,
  pinnedItems,
  allItems,
  t
}) => {
  const [nodes, setNodes] = useState<MoodboardNode[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isSavedNotice, setIsSavedNotice] = useState(false);

  useEffect(() => {
    getMoodboardState().then((savedNodes) => {
      if (savedNodes && savedNodes.length > 0) {
        setNodes(savedNodes);
      } else if (pinnedItems.length > 0) {
        const initialNodes: MoodboardNode[] = pinnedItems.map((item, idx) => ({
          id: `node-${item.id}-${Date.now()}-${idx}`,
          type: 'image',
          moodItemId: item.id,
          imageUrl: item.url,
          title: item.title,
          colors: item.palette,
          x: 40 + (idx % 3) * 280,
          y: 40 + Math.floor(idx / 3) * 260,
          width: 240,
          height: 220,
          rotation: (idx % 2 === 0 ? 1 : -1) * (2 + (idx % 5)),
          zIndex: idx + 1
        }));
        setNodes(initialNodes);
      }
    });
  }, []);

  const handleMouseDown = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSelectedNodeId(id);
    setDraggingId(id);
    const node = nodes.find((n) => n.id === id);
    if (node) {
      setDragOffset({
        x: e.clientX - node.x,
        y: e.clientY - node.y
      });
      const maxZ = Math.max(0, ...nodes.map((n) => n.zIndex));
      setNodes((prev) =>
        prev.map((n) => (n.id === id ? { ...n, zIndex: maxZ + 1 } : n))
      );
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingId) return;
    setNodes((prev) =>
      prev.map((n) =>
        n.id === draggingId
          ? {
              ...n,
              x: Math.max(0, e.clientX - dragOffset.x),
              y: Math.max(0, e.clientY - dragOffset.y)
            }
          : n
      )
    );
  };

  const handleMouseUp = () => {
    setDraggingId(null);
  };

  const handleAddImageNode = (item: MoodItem) => {
    const maxZ = Math.max(0, ...nodes.map((n) => n.zIndex));
    const newNode: MoodboardNode = {
      id: `node-${Date.now()}`,
      type: 'image',
      moodItemId: item.id,
      imageUrl: item.url,
      title: item.title,
      colors: item.palette,
      x: 100 + Math.random() * 100,
      y: 100 + Math.random() * 100,
      width: 240,
      height: 220,
      rotation: (Math.random() - 0.5) * 8,
      zIndex: maxZ + 1
    };
    setNodes((prev) => [...prev, newNode]);
  };

  const handleAddTextNode = () => {
    const maxZ = Math.max(0, ...nodes.map((n) => n.zIndex));
    const newNode: MoodboardNode = {
      id: `node-text-${Date.now()}`,
      type: 'text',
      content: 'Atmospheric visual note: Lighting, textures & grain...',
      bgColor: '#1c1917',
      x: 120 + Math.random() * 100,
      y: 120 + Math.random() * 100,
      width: 200,
      height: 140,
      rotation: (Math.random() - 0.5) * 6,
      zIndex: maxZ + 1
    };
    setNodes((prev) => [...prev, newNode]);
  };

  const handleRotateNode = (id: string) => {
    setNodes((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, rotation: (n.rotation + 15) % 360 } : n
      )
    );
  };

  const handleDeleteNode = (id: string) => {
    setNodes((prev) => prev.filter((n) => n.id !== id));
    if (selectedNodeId === id) setSelectedNodeId(null);
  };

  const handleSaveBoard = () => {
    saveMoodboardState(nodes).then(() => {
      setIsSavedNotice(true);
      setTimeout(() => setIsSavedNotice(false), 2000);
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950 flex flex-col overflow-hidden animate-fade-in">
      <div className="h-16 bg-stone-900/90 backdrop-blur-md border-b border-stone-800 px-6 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Sparkles size={18} />
          </div>
          <div>
            <h2 className="font-serif text-base font-medium text-stone-100 flex items-center gap-2">
              {t.freeformStudio}
            </h2>
            <p className="text-[11px] text-stone-400">
              Drag, arrange, rotate and craft reference compositions ({nodes.length})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleAddTextNode}
            className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-xl text-xs flex items-center gap-1.5 border border-stone-700/60"
          >
            <StickyNote size={14} className="text-amber-400" />
            Add Note
          </button>

          <button
            onClick={handleSaveBoard}
            className="px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-stone-950 font-medium rounded-xl text-xs flex items-center gap-1.5 shadow-md"
          >
            <Save size={14} />
            {isSavedNotice ? 'Saved!' : t.saveComposition}
          </button>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-stone-800 text-stone-400 hover:text-stone-100 border border-stone-700"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      <div
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onClick={() => setSelectedNodeId(null)}
        className="flex-1 relative bg-stone-950 overflow-hidden cursor-crosshair select-none bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:24px_24px]"
      >
        {nodes.map((node) => {
          const isSelected = selectedNodeId === node.id;
          return (
            <div
              key={node.id}
              onMouseDown={(e) => handleMouseDown(e, node.id)}
              style={{
                position: 'absolute',
                left: `${node.x}px`,
                top: `${node.y}px`,
                width: `${node.width}px`,
                transform: `rotate(${node.rotation}deg)`,
                zIndex: node.zIndex
              }}
              className={`group/node rounded-2xl bg-stone-900 border transition-all shadow-2xl cursor-grab active:cursor-grabbing ${
                isSelected
                  ? 'border-cyan-400 ring-2 ring-cyan-500/30 ring-offset-2 ring-offset-stone-950'
                  : 'border-stone-800/80 hover:border-stone-700'
              }`}
            >
              {node.type === 'image' && (
                <div className="p-2 space-y-2">
                  <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-stone-950">
                    <img
                      src={node.imageUrl}
                      alt={node.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex items-center justify-between px-1">
                    <span className="text-[11px] font-serif text-stone-200 truncate max-w-[140px]">
                      {node.title}
                    </span>
                    <div className="flex gap-1">
                      {node.colors?.slice(0, 3).map((hex) => (
                        <span
                          key={hex}
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: hex }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {node.type === 'text' && (
                <div
                  className="p-4 rounded-2xl h-full flex flex-col justify-between"
                  style={{ backgroundColor: node.bgColor || '#1c1917' }}
                >
                  <textarea
                    value={node.content}
                    onChange={(e) => {
                      const val = e.target.value;
                      setNodes((prev) =>
                        prev.map((n) => (n.id === node.id ? { ...n, content: val } : n))
                      );
                    }}
                    className="w-full bg-transparent text-xs text-stone-200 italic font-serif border-none outline-none resize-none"
                    rows={4}
                  />
                  <span className="text-[9px] text-stone-500 uppercase tracking-widest text-right block">
                    Note
                  </span>
                </div>
              )}

              {isSelected && (
                <div className="absolute -top-10 right-0 flex items-center gap-1 bg-stone-900 border border-stone-800 p-1 rounded-xl shadow-xl z-30">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRotateNode(node.id);
                    }}
                    className="p-1 text-stone-400 hover:text-amber-300"
                    title="Rotate 15deg"
                  >
                    <RotateCw size={13} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteNode(node.id);
                    }}
                    className="p-1 text-stone-400 hover:text-rose-400"
                    title="Remove Node"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="h-24 bg-stone-900/90 border-t border-stone-800 px-6 flex items-center gap-4 overflow-x-auto">
        <span className="text-xs text-stone-400 font-medium uppercase tracking-wider flex-shrink-0">
          {t.pinImagesToBoard}
        </span>
        <div className="flex gap-2">
          {allItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleAddImageNode(item)}
              className="flex-shrink-0 w-16 h-16 rounded-xl border border-stone-800 overflow-hidden hover:border-cyan-400 transition-all relative group"
            >
              <img
                src={item.thumbnailUrl || item.url}
                alt={item.title}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
