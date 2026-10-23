import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  Handle,
  Position,
  useNodesState,
  useEdgesState,
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { getGraph } from '../api';
import { LINK_TYPE_LABELS, DISCLAIMER_PRELIMINARY } from '../constants';

// Node Type Icons
function InstitutionIcon({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
      />
    </svg>
  );
}

function CertificateIcon({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  );
}

function FacultyIcon({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      />
    </svg>
  );
}

function AppointmentIcon({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
      />
    </svg>
  );
}

function TrustIcon({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
      />
    </svg>
  );
}

const TYPE_CONFIGS = {
  institution: {
    label: 'Technical Institution',
    badgeClass: 'bg-navy-50 text-[#0F2A4A] border-[#0F2A4A]',
    shapeClass: 'rounded-xl border-2 border-[#0F2A4A] bg-white shadow-md',
    headerBg: 'bg-[#0F2A4A] text-white',
    icon: InstitutionIcon,
  },
  certificate: {
    label: 'Statutory Certificate',
    badgeClass: 'bg-amber-50 text-amber-900 border-amber-300',
    shapeClass: 'rounded-md border-2 border-amber-500 bg-amber-50/40 shadow-sm border-dashed',
    headerBg: 'bg-amber-600 text-white',
    icon: CertificateIcon,
  },
  faculty: {
    label: 'Academic Faculty',
    badgeClass: 'bg-indigo-50 text-indigo-900 border-indigo-300',
    shapeClass: 'rounded-2xl border-2 border-indigo-500 bg-white shadow-md',
    headerBg: 'bg-indigo-600 text-white',
    icon: FacultyIcon,
  },
  appointment: {
    label: 'Tenure / Appointment',
    badgeClass: 'bg-teal-50 text-teal-900 border-teal-300',
    shapeClass: 'rounded-lg border-2 border-teal-600 bg-teal-50/30 shadow-sm',
    headerBg: 'bg-teal-700 text-white',
    icon: AppointmentIcon,
  },
  trust: {
    label: 'Sponsoring Trust',
    badgeClass: 'bg-emerald-50 text-emerald-900 border-emerald-300',
    shapeClass: 'rounded-2xl border-2 border-emerald-600 bg-emerald-50/30 shadow-sm',
    headerBg: 'bg-emerald-700 text-white',
    icon: TrustIcon,
  },
};

/**
 * Custom graph node component supporting shape distinction, iconography,
 * keyboard accessibility, and dimmed vs highlighted states.
 */
function CustomGraphNode({ data, selected }) {
  const typeConfig = TYPE_CONFIGS[data.type] || TYPE_CONFIGS.institution;
  const Icon = typeConfig.icon;
  const isHighlighted = data.isHighlighted;
  const isDimmed = data.isDimmed;

  return (
    <div
      tabIndex={0}
      role="button"
      aria-label={`${typeConfig.label}: ${data.label}. Press Enter to view full details.`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          data.onSelect?.(data);
        }
      }}
      onClick={() => data.onSelect?.(data)}
      className={`relative min-w-[210px] max-w-[250px] transition-all duration-200 cursor-pointer select-none outline-none ${
        typeConfig.shapeClass
      } ${
        isHighlighted
          ? 'ring-2 ring-blue-600 shadow-lg scale-102'
          : isDimmed
          ? 'opacity-40 grayscale-[25%]'
          : 'hover:shadow-md'
      } ${selected ? 'ring-3 ring-offset-2 ring-[#1F6FEB]' : ''}`}
    >
      {/* Handles for edges */}
      <Handle type="target" position={Position.Left} className="!w-2 !h-2 !bg-slate-400" />
      <Handle type="source" position={Position.Right} className="!w-2 !h-2 !bg-slate-400" />
      <Handle type="target" position={Position.Top} id="top" className="!w-2 !h-2 !bg-slate-400" />
      <Handle type="source" position={Position.Bottom} id="bottom" className="!w-2 !h-2 !bg-slate-400" />

      {/* Node Header Banner */}
      <div className={`px-3 py-1.5 flex items-center justify-between text-xs font-bold rounded-t-[10px] ${typeConfig.headerBg}`}>
        <div className="flex items-center space-x-1.5 truncate">
          <Icon className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate uppercase tracking-wider text-[10px]">{typeConfig.label}</span>
        </div>
        {isHighlighted && (
          <span className="bg-white/20 text-white text-[9px] px-1.5 py-0.2 rounded font-mono font-semibold shrink-0">
            Path
          </span>
        )}
      </div>

      {/* Node Body */}
      <div className="p-3 bg-white space-y-1 rounded-b-[10px]">
        <div className="font-bold text-xs sm:text-sm text-slate-900 leading-snug line-clamp-2">
          {data.label}
        </div>
        {data.subtitle && (
          <div className="text-[11px] font-medium text-slate-500 truncate">
            {data.subtitle}
          </div>
        )}
      </div>
    </div>
  );
}

const nodeTypes = {
  custom: CustomGraphNode,
  institution: CustomGraphNode,
  certificate: CustomGraphNode,
  faculty: CustomGraphNode,
  appointment: CustomGraphNode,
  trust: CustomGraphNode,
};

/**
 * Helper component inside ReactFlowProvider that triggers fitView
 * after nodes have been measured and laid out.
 */
function FlowAutoFitter({ nodesCount, findingId }) {
  const { fitView } = useReactFlow();

  useEffect(() => {
    if (nodesCount > 0) {
      const timer = setTimeout(() => {
        fitView({ padding: 0.2, duration: 250 });
      }, 60);
      return () => clearTimeout(timer);
    }
  }, [nodesCount, findingId, fitView]);

  return null;
}

/**
 * LinkGraph component for Cross-Institution Link Analysis.
 * Rendered in the Evidence Viewer when finding has linkType.
 */
export default function LinkGraph({ finding, appId }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rawGraph, setRawGraph] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const evidencePath = useMemo(() => finding?.evidencePath || [], [finding]);

  // Load graph data through src/api strictly
  useEffect(() => {
    let isMounted = true;
    async function fetchGraphData() {
      try {
        setLoading(true);
        setError(null);
        const data = await getGraph(appId);
        if (!isMounted) return;
        setRawGraph(data);
      } catch (err) {
        console.error('Failed to load graph data:', err);
        if (isMounted) setError('Unable to load relationship graph.');
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchGraphData();
    return () => {
      isMounted = false;
    };
  }, [appId]);

  const handleSelectNode = useCallback((nodeData) => {
    setSelectedNode(nodeData);
  }, []);

  // Compute graph nodes & edges with evidencePath highlighting and other edges dimmed
  useEffect(() => {
    if (!rawGraph || !rawGraph.nodes) return;

    const pathSet = new Set(evidencePath);

    const initialNodes = rawGraph.nodes.map((n) => {
      const isHighlighted = pathSet.has(n.id);
      const isDimmed = pathSet.size > 0 && !isHighlighted;

      return {
        id: n.id,
        type: 'custom',
        position: { x: n.x, y: n.y },
        data: {
          ...n,
          isHighlighted,
          isDimmed,
          onSelect: handleSelectNode,
        },
      };
    });

    const initialEdges = (rawGraph.edges || []).map((e) => {
      const isPathEdge = pathSet.has(e.from) && pathSet.has(e.to);

      return {
        id: e.id,
        source: e.from,
        target: e.to,
        label: e.label || e.relation?.replace(/_/g, ' '),
        animated: isPathEdge,
        style: {
          stroke: isPathEdge ? '#1F6FEB' : '#94A3B8',
          strokeWidth: isPathEdge ? 2.8 : 1.5,
          opacity: isPathEdge ? 1 : 0.35,
          strokeDasharray: isPathEdge ? undefined : '4 4',
        },
        labelStyle: {
          fontSize: 10,
          fontWeight: isPathEdge ? 700 : 500,
          fill: isPathEdge ? '#0F2A4A' : '#64748B',
        },
        labelBgStyle: {
          fill: '#FFFFFF',
          fillOpacity: 0.9,
          rx: 4,
          ry: 4,
        },
      };
    });

    setNodes(initialNodes);
    setEdges(initialEdges);

    // Auto-select first node in evidence path
    if (evidencePath.length > 0) {
      const firstPathNode = rawGraph.nodes.find((n) => n.id === evidencePath[0]);
      if (firstPathNode) setSelectedNode(firstPathNode);
    }
  }, [rawGraph, evidencePath, handleSelectNode, setNodes, setEdges]);

  // Keyboard shortcut to close detail card (Escape)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setSelectedNode(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 flex flex-col items-center justify-center min-h-[540px] space-y-3">
        <div className="w-8 h-8 border-3 border-[#0F2A4A] border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-semibold text-slate-600">
          Constructing Inter-Institutional Link Graph...
        </span>
      </div>
    );
  }

  if (error || !rawGraph) {
    return (
      <div className="bg-white rounded-xl border border-rose-200 p-8 text-center min-h-[400px] flex flex-col justify-center items-center">
        <p className="text-sm font-bold text-rose-800">{error || 'Graph data unavailable.'}</p>
      </div>
    );
  }

  const linkLabel = LINK_TYPE_LABELS[finding?.linkType] || finding?.linkType || 'Link Analysis';

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col">
      {/* Top Banner Toolbar */}
      <div className="bg-[#0F2A4A] text-white px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-400 ring-4 ring-blue-950/60" />
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-sm sm:text-base font-extrabold tracking-tight">
                Cross-Institution Link Analysis View
              </h2>
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-500/20 text-blue-200 border border-blue-400/40">
                {linkLabel}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Corroborated multi-institutional graph ({rawGraph.nodes?.length || 0} nodes indexed)
            </p>
          </div>
        </div>

        {/* Evidence Path Chips */}
        {evidencePath.length > 0 && (
          <div className="flex items-center space-x-1.5 text-xs bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-700/60 overflow-x-auto">
            <span className="text-slate-400 font-semibold text-[11px] uppercase tracking-wider shrink-0">
              Corroborated Path:
            </span>
            <div className="flex items-center space-x-1 font-mono text-[11px] text-blue-200">
              {evidencePath.map((nodeId, idx) => {
                const nodeItem = rawGraph.nodes?.find((n) => n.id === nodeId);
                return (
                  <React.Fragment key={nodeId}>
                    <button
                      type="button"
                      onClick={() => setSelectedNode(nodeItem || { id: nodeId, label: nodeId })}
                      className="hover:underline font-bold text-amber-300 cursor-pointer"
                    >
                      {nodeItem?.label?.split(' ')[0] || nodeId}
                    </button>
                    {idx < evidencePath.length - 1 && <span className="text-slate-400">&rarr;</span>}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Main Graph Area + Node Detail Overlay with explicit height container */}
      <div
        className="relative w-full bg-slate-50 border-b border-slate-200"
        style={{ height: '540px', minHeight: '540px' }}
      >
        <ReactFlowProvider>
          <ReactFlow
            key={`rf-${finding?.id || 'graph'}`}
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={(_event, node) => setSelectedNode(node.data)}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.2 }}
            minZoom={0.3}
            maxZoom={1.8}
            nodesConnectable={false}
            elementsSelectable={true}
            style={{ width: '100%', height: '100%' }}
          >
            <Background color="#94A3B8" gap={20} size={1} />
            <Controls
              showInteractive={false}
              className="!bg-white !border !border-slate-300 !shadow-md !rounded-lg"
            />
            <FlowAutoFitter nodesCount={nodes.length} findingId={finding?.id} />
          </ReactFlow>

          {/* Node Detail Card Panel */}
          {selectedNode && (
            <div
              role="region"
              aria-label="Node Details"
              className="absolute top-4 right-4 w-80 sm:w-88 bg-white/95 backdrop-blur-sm rounded-xl border border-slate-300 shadow-xl p-4 z-20 space-y-3"
            >
              <div className="flex items-start justify-between border-b border-slate-100 pb-2.5">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-blue-600" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    {TYPE_CONFIGS[selectedNode.type]?.label || 'Entity Detail'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedNode(null)}
                  aria-label="Close detail panel"
                  className="text-slate-400 hover:text-slate-700 text-lg leading-none px-1 rounded hover:bg-slate-100 cursor-pointer"
                >
                  &times;
                </button>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900 leading-snug">
                  {selectedNode.label}
                </h3>
                {selectedNode.subtitle && (
                  <p className="text-xs text-slate-500 font-mono mt-0.5">
                    {selectedNode.subtitle}
                  </p>
                )}
              </div>

              {/* Dynamic Attributes Table */}
              {selectedNode.details && (
                <div className="space-y-1.5 text-xs border-t border-slate-100 pt-2.5">
                  {Object.entries(selectedNode.details).map(([key, value]) => (
                    <div key={key} className="flex justify-between py-0.5 border-b border-slate-50">
                      <span className="text-slate-500 font-medium">{key}:</span>
                      <span className="text-slate-900 font-semibold text-right max-w-[55%] break-words">
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div className="text-[11px] text-slate-400 flex justify-between items-center pt-1">
                <span>Node ID: <code className="font-mono text-slate-600">{selectedNode.id}</code></span>
                <span className="text-slate-400">Esc to dismiss</span>
              </div>
            </div>
          )}

          {/* Legend Overlay at bottom-left */}
          <div className="absolute bottom-3 left-14 sm:left-16 bg-white/95 backdrop-blur-xs rounded-lg border border-slate-200 px-3 py-2 text-[11px] text-slate-600 shadow-sm flex flex-wrap items-center gap-3 z-10">
            <span className="font-bold text-slate-700">Legend:</span>
            <div className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#0F2A4A]" />
              <span>Institution</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-amber-500" />
              <span>Certificate</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
              <span>Faculty</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-teal-600" />
              <span>Appointment</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-600" />
              <span>Trust</span>
            </div>
          </div>
        </ReactFlowProvider>
      </div>

      {/* Mandatory Statutory Advisory Banner */}
      <div className="bg-amber-50 border-t border-amber-200 px-5 py-2.5 flex items-center justify-between text-xs text-amber-950 font-medium">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
          <span>{DISCLAIMER_PRELIMINARY}</span>
        </div>
        <span className="text-[11px] text-amber-800 font-mono hidden sm:inline">
          Rule: CROSS_INSTITUTION_LINK
        </span>
      </div>
    </div>
  );
}
