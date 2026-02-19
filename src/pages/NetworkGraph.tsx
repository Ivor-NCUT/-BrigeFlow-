/**
 * [INPUT]: 依赖 useContactStore 获取 contacts 和 relationships，依赖 framer-motion 进行动画
 * [OUTPUT]: 对外提供 NetworkGraph 页面，支持节点拖拽、连线模式、关系编辑
 * [POS]: pages/NetworkGraph，关系资产可视化核心界面
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ZoomIn, ZoomOut, Maximize2, Link as LinkIcon, Edit2 } from 'lucide-react';
import { useContactStore } from '../store/contactStore';
import type { Contact } from '../types/contact';

/* ================================================================
 *  Types
 * ================================================================ */
interface Node {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  contact: Contact;
  color: string;
}

interface Edge {
  id?: string;
  source: string;
  target: string;
  label: string;
}

/* ================================================================
 *  Component
 * ================================================================ */
export default function NetworkGraph() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number>(0);
  const { contacts, relationships, getAvatarColor, addRelationship, updateRelationship, filter } = useContactStore();

  /* ---- React state: ONLY for things that trigger DOM re-renders ---- */
  const [selectedNode, setSelectedNode] = useState<Contact | null>(null);
  const [editingEdge, setEditingEdge] = useState<{ source: string; target: string; label: string; id?: string } | null>(null);
  const [edgeLabel, setEdgeLabel] = useState('');
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [, forceRender] = useState(0);

  /* ---- Refs: ALL mutable state read by the 60fps draw loop ---- */
  const nodesRef = useRef<Node[]>([]);
  const edgesRef = useRef<Edge[]>([]);
  const hoveredNodeRef = useRef<string | null>(null);
  const hoveredEdgeRef = useRef<{ source: string; target: string } | null>(null);
  const zoomRef = useRef(1);
  const offsetRef = useRef({ x: 0, y: 0 });
  const draggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const draggingNodeRef = useRef<string | null>(null);
  const isLinkModeRef = useRef(false);
  const connectingNodeRef = useRef<string | null>(null);
  const mousePosRef = useRef({ x: 0, y: 0 });

  /* ================================================================
   *  Filter contacts
   * ================================================================ */
  const filteredContacts = React.useMemo(() => contacts.filter(c => {
    if (filter.search) {
      const q = filter.search.toLowerCase();
      if (!c.name.toLowerCase().includes(q) &&
          !c.tags.some(t => t.label.toLowerCase().includes(q)) &&
          !c.company?.toLowerCase().includes(q)) return false;
    }
    if (filter.industry && !c.tags.some(t => t.category === 'industry' && t.label === filter.industry)) return false;
    if (filter.skill && !c.tags.some(t => t.category === 'skill' && t.label === filter.skill)) return false;
    if (filter.relationship && !c.tags.some(t => t.category === 'relationship' && t.label === filter.relationship)) return false;
    if (filter.location && !c.tags.some(t => t.category === 'location' && t.label === filter.location)) return false;
    if (filter.role && !c.tags.some(t => t.category === 'role' && t.label === filter.role)) return false;
    return true;
  }), [contacts, filter]);

  /* ================================================================
   *  Build nodes & edges from data (runs when data changes)
   * ================================================================ */
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    const cx = container ? container.clientWidth / 2 : 400;
    const cy = container ? container.clientHeight / 2 : 300;

    const nodes: Node[] = filteredContacts.map((c, i) => {
      const existing = nodesRef.current.find(n => n.id === c.id);
      if (existing) {
        return { ...existing, contact: c, color: getAvatarColor(c.name), radius: 24 + Math.min(c.interactionCount * 2, 16) };
      }
      const angle = (i / Math.max(filteredContacts.length, 1)) * Math.PI * 2;
      const r = 150 + Math.random() * 100;
      return { id: c.id, x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r, vx: 0, vy: 0, radius: 24 + Math.min(c.interactionCount * 2, 16), contact: c, color: getAvatarColor(c.name) };
    });

    /* -- Build edge list from relationships -- */
    const edges: Edge[] = [];
    const contactIds = new Set(filteredContacts.map(c => c.id));
    relationships.forEach(rel => {
      const s = rel.sourceContactId;
      const t = rel.targetContactId;
      if (contactIds.has(s) && contactIds.has(t)) {
        if (!edges.find(e => (e.source === s && e.target === t) || (e.source === t && e.target === s))) {
          edges.push({ id: rel.id, source: s, target: t, label: rel.type || '' });
        }
      }
    });

    nodesRef.current = nodes;
    edgesRef.current = edges;
  }, [filteredContacts, relationships, getAvatarColor]);

  /* ================================================================
   *  Physics simulation (reads refs directly, no closures)
   * ================================================================ */
  /* ================================================================
   *  Single stable animation loop — NO useCallback, NO stale closures
   *  Reads ALL state from refs, guaranteed fresh every frame.
   * ================================================================ */
  useEffect(() => {
    const loop = () => {
      const nodes = nodesRef.current;
      const edges = edgesRef.current;
      if (!nodes.length) { animRef.current = requestAnimationFrame(loop); return; }

      /* ---------- PHYSICS ---------- */
      // Build adjacency for O(1) edge lookup
      const adj = new Map<string, Set<string>>();
      edges.forEach(e => {
        if (!adj.has(e.source)) adj.set(e.source, new Set());
        if (!adj.has(e.target)) adj.set(e.target, new Set());
        adj.get(e.source)!.add(e.target);
        adj.get(e.target)!.add(e.source);
      });

      // Repulsion (节点互斥)
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[j].x - nodes[i].x;
          const dy = nodes[j].y - nodes[i].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > 0) {
            const force = 2000 / (dist * dist);
            const fx = (dx / dist) * force;
            const fy = (dy / dist) * force;
            nodes[i].vx -= fx; nodes[i].vy -= fy;
            nodes[j].vx += fx; nodes[j].vy += fy;
          }
        }
      }

      // Attraction (连线牵引)
      edges.forEach(e => {
        const s = nodes.find(n => n.id === e.source);
        const t = nodes.find(n => n.id === e.target);
        if (s && t) {
          const dx = t.x - s.x;
          const dy = t.y - s.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const force = (dist - 120) * 0.02;
          const fx = (dx / Math.max(dist, 1)) * force;
          const fy = (dy / Math.max(dist, 1)) * force;
          s.vx += fx; s.vy += fy;
          t.vx -= fx; t.vy -= fy;
        }
      });

      // Center Gravity (weak pull to center to prevent flying off)
      const canvas = canvasRef.current;
      const container = containerRef.current;
      const gcx = container ? container.clientWidth / 2 : 400;
      const gcy = container ? container.clientHeight / 2 : 300;
      nodes.forEach(n => {
        n.vx += (gcx - n.x) * 0.0005;
        n.vy += (gcy - n.y) * 0.0005;
      });

      // Apply velocity
      nodes.forEach(n => {
        n.vx *= 0.9;
        n.vy *= 0.9;
        n.x += n.vx;
        n.y += n.vy;
      });

      /* ---------- DRAW ---------- */
      if (!canvas) { animRef.current = requestAnimationFrame(loop); return; }
      const ctx = canvas.getContext('2d');
      if (!ctx) { animRef.current = requestAnimationFrame(loop); return; }

      if (container) {
        canvas.width = container.clientWidth * 2;
        canvas.height = container.clientHeight * 2;
        ctx.scale(2, 2);
      }

      const w = canvas.width / 2;
      const h = canvas.height / 2;
      const zoom = zoomRef.current;
      const offset = offsetRef.current;
      const hovNode = hoveredNodeRef.current;
      const hovEdge = hoveredEdgeRef.current;

      ctx.clearRect(0, 0, w, h);
      ctx.save();
      ctx.translate(offset.x + w / 2, offset.y + h / 2);
      ctx.scale(zoom, zoom);
      ctx.translate(-w / 2, -h / 2);

      /* -- Edges -- */
      edges.forEach(e => {
        const s = nodes.find(n => n.id === e.source);
        const t = nodes.find(n => n.id === e.target);
        if (!s || !t) return;

        const isThisEdgeHovered = hovEdge && hovEdge.source === e.source && hovEdge.target === e.target;
        const isHighlight = hovNode === s.id || hovNode === t.id || isThisEdgeHovered;

        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(t.x, t.y);
        ctx.strokeStyle = isHighlight ? '#007AFF' : '#64748B';
        ctx.lineWidth = isHighlight ? 4 : 2.5;
        ctx.stroke();

        // Label on hover
        if ((e.label && isHighlight) || isThisEdgeHovered) {
          const mx = (s.x + t.x) / 2;
          const my = (s.y + t.y) / 2;
          const text = isThisEdgeHovered && !e.label ? '点击编辑' : (e.label || '点击编辑');
          ctx.font = '12px "Plus Jakarta Sans", system-ui, sans-serif';
          const metrics = ctx.measureText(text);
          const pad = 6;
          ctx.fillStyle = 'rgba(255,255,255,0.95)';
          ctx.beginPath();
          const bx = mx - metrics.width / 2 - pad;
          const by = my - 11;
          const bw = metrics.width + pad * 2;
          const bh = 22;
          const br = 6;
          ctx.moveTo(bx + br, by);
          ctx.lineTo(bx + bw - br, by);
          ctx.quadraticCurveTo(bx + bw, by, bx + bw, by + br);
          ctx.lineTo(bx + bw, by + bh - br);
          ctx.quadraticCurveTo(bx + bw, by + bh, bx + bw - br, by + bh);
          ctx.lineTo(bx + br, by + bh);
          ctx.quadraticCurveTo(bx, by + bh, bx, by + bh - br);
          ctx.lineTo(bx, by + br);
          ctx.quadraticCurveTo(bx, by, bx + br, by);
          ctx.fill();
          ctx.strokeStyle = '#E5E7EB';
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.fillStyle = '#007AFF';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(text, mx, my);
        }
      });

      /* -- Temporary connection line (link mode) -- */
      if (isLinkModeRef.current && connectingNodeRef.current) {
        const src = nodes.find(n => n.id === connectingNodeRef.current);
        if (src) {
          const mp = mousePosRef.current;
          ctx.beginPath();
          ctx.moveTo(src.x, src.y);
          ctx.lineTo(mp.x, mp.y);
          ctx.strokeStyle = '#007AFF';
          ctx.lineWidth = 2;
          ctx.setLineDash([6, 4]);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.beginPath();
          ctx.arc(mp.x, mp.y, 4, 0, Math.PI * 2);
          ctx.fillStyle = '#007AFF';
          ctx.fill();
        }
      }

      /* -- Nodes -- */
      nodes.forEach(n => {
        const isHovered = hovNode === n.id;
        const isConnected = hovNode && adj.get(hovNode)?.has(n.id);

        if (isHovered) {
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.radius + 8, 0, Math.PI * 2);
          ctx.fillStyle = n.color + '20';
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
        ctx.fillStyle = isHovered || isConnected ? n.color : n.color + 'CC';
        ctx.fill();

        if (isHovered) {
          ctx.strokeStyle = '#fff';
          ctx.lineWidth = 3;
          ctx.stroke();
        }

        // Connection count badge for super-connectors (3+ connections)
        const connCount = adj.get(n.id)?.size || 0;
        if (connCount >= 3) {
          const bx = n.x + n.radius * 0.6;
          const by = n.y - n.radius * 0.6;
          ctx.beginPath();
          ctx.arc(bx, by, 8, 0, Math.PI * 2);
          ctx.fillStyle = '#007AFF';
          ctx.fill();
          ctx.font = 'bold 9px system-ui, sans-serif';
          ctx.fillStyle = '#fff';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(String(connCount), bx, by);
        }

        ctx.font = `${isHovered ? 'bold ' : ''}12px "Plus Jakarta Sans", system-ui, sans-serif`;
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(n.contact.name.length > 3 ? n.contact.name.slice(0, 3) : n.contact.name, n.x, n.y);

        if (isHovered && n.contact.company) {
          ctx.font = '10px "Plus Jakarta Sans", system-ui, sans-serif';
          ctx.fillStyle = '#6B7280';
          ctx.fillText(n.contact.company, n.x, n.y + n.radius + 14);
        }
      });

      /* -- Debug: edge count indicator (bottom-right) -- */
      ctx.restore();
      ctx.font = '11px system-ui, sans-serif';
      ctx.fillStyle = '#9CA3AF';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'bottom';
      ctx.fillText(`${nodes.length} 资产 · ${edges.length} 关系`, w - 12, h - 12);

      animRef.current = requestAnimationFrame(loop);
    };

    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current);
  }, []); // Empty deps — reads EVERYTHING from refs, never stale

  /* ================================================================
   *  Mouse coordinate transform
   * ================================================================ */
  const getMousePos = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const zoom = zoomRef.current;
    const offset = offsetRef.current;
    return {
      x: (e.clientX - rect.left - offset.x - rect.width / 2) / zoom + rect.width / 2,
      y: (e.clientY - rect.top - offset.y - rect.height / 2) / zoom + rect.height / 2,
    };
  };

  /* ================================================================
   *  Mouse event handlers (mutate refs, NOT state)
   * ================================================================ */
  const handleMouseMove = (e: React.MouseEvent) => {
    const pos = getMousePos(e);
    mousePosRef.current = pos;

    /* -- Canvas panning -- */
    if (draggingRef.current) {
      const ds = dragStartRef.current;
      offsetRef.current = { x: offsetRef.current.x + (e.clientX - ds.x), y: offsetRef.current.y + (e.clientY - ds.y) };
      dragStartRef.current = { x: e.clientX, y: e.clientY };
      return;
    }

    /* -- Node dragging -- */
    if (draggingNodeRef.current) {
      const node = nodesRef.current.find(n => n.id === draggingNodeRef.current);
      if (node) { node.x = pos.x; node.y = pos.y; node.vx = 0; node.vy = 0; }
      return;
    }

    /* -- Hit test: node -- */
    const hitNode = nodesRef.current.find(n => {
      const dx = pos.x - n.x, dy = pos.y - n.y;
      return Math.sqrt(dx * dx + dy * dy) < n.radius;
    });
    hoveredNodeRef.current = hitNode?.id || null;

    /* -- Hit test: edge -- */
    const canvas = canvasRef.current;
    if (!hitNode && !isLinkModeRef.current && !draggingRef.current) {
      let foundEdge: { source: string; target: string } | null = null;
      for (const edge of edgesRef.current) {
        const s = nodesRef.current.find(n => n.id === edge.source);
        const t = nodesRef.current.find(n => n.id === edge.target);
        if (!s || !t) continue;
        const l2 = (t.x - s.x) ** 2 + (t.y - s.y) ** 2;
        if (l2 === 0) continue;
        let tp = ((pos.x - s.x) * (t.x - s.x) + (pos.y - s.y) * (t.y - s.y)) / l2;
        tp = Math.max(0, Math.min(1, tp));
        const px = s.x + tp * (t.x - s.x), py = s.y + tp * (t.y - s.y);
        if (Math.sqrt((pos.x - px) ** 2 + (pos.y - py) ** 2) < 10) {
          foundEdge = { source: edge.source, target: edge.target };
          break;
        }
      }
      hoveredEdgeRef.current = foundEdge;
      if (canvas) canvas.style.cursor = foundEdge ? 'pointer' : 'default';
    } else {
      hoveredEdgeRef.current = null;
      if (canvas) canvas.style.cursor = hitNode ? (isLinkModeRef.current ? 'crosshair' : 'grab') : (isLinkModeRef.current ? 'crosshair' : 'default');
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isLinkModeRef.current) return;
    const pos = getMousePos(e);
    const hitNode = nodesRef.current.find(n => {
      const dx = pos.x - n.x, dy = pos.y - n.y;
      return Math.sqrt(dx * dx + dy * dy) < n.radius;
    });
    if (hitNode) {
      draggingNodeRef.current = hitNode.id;
      if (canvasRef.current) canvasRef.current.style.cursor = 'grabbing';
    } else {
      draggingRef.current = true;
      dragStartRef.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handleMouseUp = () => {
    draggingRef.current = false;
    draggingNodeRef.current = null;
    if (canvasRef.current) canvasRef.current.style.cursor = 'default';
  };

  const handleClick = (e: React.MouseEvent) => {
    const pos = getMousePos(e);
    const hitNode = nodesRef.current.find(n => {
      const dx = pos.x - n.x, dy = pos.y - n.y;
      return Math.sqrt(dx * dx + dy * dy) < n.radius;
    });

    /* -- Link mode -- */
    if (isLinkModeRef.current) {
      if (hitNode) {
        if (!connectingNodeRef.current) {
          connectingNodeRef.current = hitNode.id;
        } else if (connectingNodeRef.current !== hitNode.id) {
          const sId = connectingNodeRef.current;
          const tId = hitNode.id;
          const existing = edgesRef.current.find(e => (e.source === sId && e.target === tId) || (e.source === tId && e.target === sId));
          if (existing) {
            setEditingEdge({ source: sId, target: tId, label: existing.label, id: existing.id });
          } else {
            setEditingEdge({ source: sId, target: tId, label: '' });
          }
          setEdgeLabel(existing?.label || '');
          connectingNodeRef.current = null;
        } else {
          connectingNodeRef.current = null;
        }
      } else {
        connectingNodeRef.current = null;
      }
      return;
    }

    /* -- Normal mode -- */
    if (hitNode) {
      setSelectedNode(hitNode.contact);
    } else if (hoveredEdgeRef.current) {
      const he = hoveredEdgeRef.current;
      const edge = edgesRef.current.find(e => e.source === he.source && e.target === he.target);
      if (edge) {
        setEditingEdge({ source: edge.source, target: edge.target, label: edge.label, id: edge.id });
        setEdgeLabel(edge.label || '');
      }
    }
  };

  /* ================================================================
   *  Zoom helpers (update ref + trigger re-render for button state)
   * ================================================================ */
  const setZoom = (fn: (z: number) => number) => {
    zoomRef.current = fn(zoomRef.current);
    forceRender(n => n + 1);
  };
  const resetView = () => {
    zoomRef.current = 1;
    offsetRef.current = { x: 0, y: 0 };
    forceRender(n => n + 1);
  };
  const toggleLinkMode = () => {
    isLinkModeRef.current = !isLinkModeRef.current;
    connectingNodeRef.current = null;
    forceRender(n => n + 1);
  };

  /* ================================================================
   *  Save relationship handler (shared by Enter key + button click)
   * ================================================================ */
  const saveRelationship = () => {
    if (!editingEdge) return;
    if (editingEdge.id) {
      updateRelationship(editingEdge.id, { type: edgeLabel });
    } else {
      addRelationship({ sourceContactId: editingEdge.source, targetContactId: editingEdge.target, type: edgeLabel, strength: 1 });
      // Snap nodes together immediately
      const sNode = nodesRef.current.find(n => n.id === editingEdge.source);
      const tNode = nodesRef.current.find(n => n.id === editingEdge.target);
      if (sNode && tNode) {
        const angle = Math.atan2(tNode.y - sNode.y, tNode.x - sNode.x);
        tNode.x = sNode.x + Math.cos(angle) * 120;
        tNode.y = sNode.y + Math.sin(angle) * 120;
        tNode.vx = 0; tNode.vy = 0; sNode.vx = 0; sNode.vy = 0;
        edgesRef.current.push({ id: 'temp-' + Date.now(), source: editingEdge.source, target: editingEdge.target, label: edgeLabel });
      }
    }
    setEditingEdge(null);
  };

  /* ================================================================
   *  JSX
   * ================================================================ */
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">关系资产图谱</h1>
          <p className="text-sm text-gray-500 mt-1">可视化你的关系网络，点击节点查看详情</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={toggleLinkMode} className={`p-2 rounded-lg border transition-colors ${isLinkModeRef.current ? 'bg-primary text-white border-primary' : 'bg-white border-gray-200 hover:bg-gray-50'}`} title={isLinkModeRef.current ? '退出连线模式' : '进入连线模式'}>
            <LinkIcon size={16} className={isLinkModeRef.current ? 'text-white' : 'text-gray-600'} />
          </button>
          <button onClick={() => setZoom(z => Math.min(z + 0.2, 3))} className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition-colors">
            <ZoomIn size={16} className="text-gray-600" />
          </button>
          <button onClick={() => setZoom(z => Math.max(z - 0.2, 0.3))} className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition-colors">
            <ZoomOut size={16} className="text-gray-600" />
          </button>
          <button onClick={resetView} className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition-colors" title="重置视角">
            <span className="text-gray-600 font-bold text-xs">1:1</span>
          </button>
          <button onClick={() => setIsFullScreen(!isFullScreen)} className={`p-2 rounded-lg border transition-colors ${isFullScreen ? 'bg-primary text-white border-primary' : 'bg-white border-gray-200 hover:bg-gray-50'}`} title={isFullScreen ? '退出全屏' : '全屏模式'}>
            <Maximize2 size={16} className={isFullScreen ? 'text-white' : 'text-gray-600'} />
          </button>
        </div>
      </div>

      <div ref={containerRef} className={`relative bg-white border border-gray-100 overflow-hidden transition-all duration-300 ${isFullScreen ? 'fixed inset-0 z-50 rounded-none h-screen w-screen' : 'rounded-2xl h-[600px]'}`}>
        <canvas ref={canvasRef} className="w-full h-full network-canvas" onMouseMove={handleMouseMove} onMouseDown={handleMouseDown} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp} onClick={handleClick} />
        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-xl border border-gray-100 p-3">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-2">图例</p>
          <div className="space-y-1 text-xs text-gray-500">
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-primary" /> 节点大小 = 互动频率</div>
            <div className="flex items-center gap-2"><div className="w-6 h-0.5 bg-gray-500 rounded" /> 连线 = 资产关系</div>
          </div>
        </div>
      </div>

      {isFullScreen && (
        <button onClick={() => setIsFullScreen(false)} className="fixed top-6 right-6 z-[60] p-3 bg-white rounded-full shadow-lg border border-gray-100 hover:bg-gray-50 transition-all active:scale-95" title="退出全屏">
          <X size={20} className="text-gray-600" />
        </button>
      )}

      {/* Detail panel */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="fixed right-0 top-16 bottom-0 w-[380px] bg-white border-l border-gray-100 shadow-xl z-40 overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-lg text-gray-900">详细背景</h3>
                <button onClick={() => setSelectedNode(null)} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400"><X size={18} /></button>
              </div>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-2xl" style={{ backgroundColor: getAvatarColor(selectedNode.name) }}>{selectedNode.name[0]}</div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{selectedNode.name}</h3>
                  <p className="text-sm text-gray-500">{selectedNode.company}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">标签</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedNode.tags.map(t => (<span key={t.id} className="px-2.5 py-1 rounded-full text-xs font-medium text-white" style={{ backgroundColor: t.color }}>{t.label}</span>))}
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">备注</h4>
                  <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">{selectedNode.notes || '暂无备注'}</p>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">关联资产</h4>
                  <div className="space-y-2">
                    {selectedNode.connections.map(cId => {
                      const c = contacts.find(cc => cc.id === cId);
                      if (!c) return null;
                      return (
                        <div key={cId} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: getAvatarColor(c.name) }}>{c.name[0]}</div>
                            <span className="text-sm font-medium text-gray-900">{c.name}</span>
                          </div>
                          <span className="text-xs text-primary bg-primary-light px-2 py-0.5 rounded-full">{selectedNode.connectionType[cId]}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">最近沟通</h4>
                  <div className="space-y-2">
                    {selectedNode.communicationRecords.slice(0, 5).map(r => (
                      <div key={r.id} className="text-sm bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-900">{r.summary}</span>
                          <span className="text-xs text-gray-400">{r.date}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{r.details}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edge editing modal */}
      <AnimatePresence>
        {editingEdge && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl shadow-xl p-6 w-[400px] border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">编辑关系</h3>
                <button onClick={() => setEditingEdge(null)} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400"><X size={18} /></button>
              </div>
              <div className="flex items-center justify-between gap-4 mb-8">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold shadow-sm" style={{ backgroundColor: getAvatarColor(contacts.find(c => c.id === editingEdge.source)?.name || '') }}>{contacts.find(c => c.id === editingEdge.source)?.name?.[0]}</div>
                  <span className="text-xs font-medium text-gray-600">{contacts.find(c => c.id === editingEdge.source)?.name}</span>
                </div>
                <div className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider">连接</span>
                  <div className="w-full h-px bg-gray-200 relative">
                    <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-2 py-0.5 rounded text-xs font-medium ${edgeLabel ? 'text-primary bg-primary/10' : 'text-gray-400 bg-gray-100'}`}>{edgeLabel || '无描述'}</div>
                  </div>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold shadow-sm" style={{ backgroundColor: getAvatarColor(contacts.find(c => c.id === editingEdge.target)?.name || '') }}>{contacts.find(c => c.id === editingEdge.target)?.name?.[0]}</div>
                  <span className="text-xs font-medium text-gray-600">{contacts.find(c => c.id === editingEdge.target)?.name}</span>
                </div>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">关系描述</label>
                <div className="relative">
                  <Edit2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" value={edgeLabel} onChange={(e) => setEdgeLabel(e.target.value)} placeholder="例如：同事、校友、合作伙伴..." className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" autoFocus onKeyDown={(e) => { if (e.key === 'Enter') saveRelationship(); }} />
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button onClick={() => setEditingEdge(null)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">取消</button>
                <button onClick={saveRelationship} className="px-6 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-lg shadow-lg shadow-primary/30 transition-all active:scale-95">确认</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
