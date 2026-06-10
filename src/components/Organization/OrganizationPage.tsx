"use client";

import { useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronsUpDown,
  Edit,
  Maximize2,
  MinusCircle,
  Plus,
  PlusCircle,
  Search,
  SlidersHorizontal,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import OrganizationSidebar from "./OrganizationSidebar";
import GlobalHeader from "@/components/GlobalHeader";
import { CanvasPageSkeleton, PageTransition } from "@/components/LoadingStates";
import { ORG_LEVELS, OrgLevel, OrgNode } from "@/data/organization";

const countryOptions = ["Nigeria", "Ghana", "Kenya", "South Africa"];
const stateOptions = ["Lagos", "Ogun", "Oyo", "Rivers", "Abuja"];
const managerOptions = ["Temitope Aiyegbusi", "Helen Paul", "Aiyegbusi Temitope", "Operations Admin"];
const NODE_WIDTH = 270;
const NODE_HEIGHT = 70;
const GRID_SIZE = 24;
const snapToGrid = (value: number) => Math.round(value / GRID_SIZE) * GRID_SIZE;

type ActiveTab = "schema" | "diagram" | "levels";
type Placement = "root" | "child" | "left" | "right";
type NodePosition = { x: number; y: number };

type NodeDraft = {
  name: string;
  levelId: string;
  description: string;
  street: string;
  postalCode: string;
  stateOfOrigin: string;
  country: string;
  phone: string;
  tenantId: string;
  manager: string;
};

const emptyDraft: NodeDraft = {
  name: "",
  levelId: "level-1",
  description: "",
  street: "",
  postalCode: "",
  stateOfOrigin: "",
  country: "Nigeria",
  phone: "",
  tenantId: "",
  manager: "",
};

export default function OrganizationPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("schema");
  const [levels, setLevels] = useState<OrgLevel[]>(ORG_LEVELS);
  const [nodes, setNodes] = useState<OrgNode[]>([]);
  const [positions, setPositions] = useState<Record<string, NodePosition>>({});
  const [selectedNodeId, setSelectedNodeId] = useState<string>("");
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [addNodeOpen, setAddNodeOpen] = useState(false);
  const [editNodeOpen, setEditNodeOpen] = useState(false);
  const [nodeParentId, setNodeParentId] = useState<string | undefined>(undefined);
  const [nodePlacement, setNodePlacement] = useState<Placement>("root");
  const [nodeDraft, setNodeDraft] = useState<NodeDraft>(emptyDraft);
  const [newLevelTitle, setNewLevelTitle] = useState("");
  const [search, setSearch] = useState("");
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState<{ pointerX: number; pointerY: number; startX: number; startY: number } | null>(null);

  const selectedNode = nodes.find((node) => node.id === selectedNodeId);

  const filteredNodes = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return nodes;
    return nodes.filter((node) =>
      [node.name, node.title, node.description, node.manager, node.tenantId]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(q))
    );
  }, [nodes, search]);

  const openCreateNode = (parentId?: string, placement: Placement = parentId ? "child" : "root") => {
    const parent = parentId ? nodes.find((n) => n.id === parentId) : undefined;
    const parentLevel = parent ? levels.find((level) => level.id === parent.levelId) : undefined;
    const suggestedLevel =
      placement === "left" || placement === "right"
        ? parentLevel
        : parentLevel
          ? levels.find((level) => level.order === parentLevel.order + 1) || parentLevel
          : levels[0];

    setNodeParentId(parentId);
    setNodePlacement(placement);
    setNodeDraft({ ...emptyDraft, levelId: suggestedLevel?.id || levels[0]?.id || "level-1" });
    setAddNodeOpen(true);
  };

  const openEditNode = () => {
    if (!selectedNode) return;
    setNodeDraft({
      name: selectedNode.name,
      levelId: selectedNode.levelId,
      description: selectedNode.description,
      street: selectedNode.street,
      postalCode: selectedNode.postalCode,
      stateOfOrigin: selectedNode.stateOfOrigin,
      country: selectedNode.country,
      phone: selectedNode.phone,
      tenantId: selectedNode.tenantId,
      manager: selectedNode.manager,
    });
    setEditNodeOpen(true);
  };

  const getDefaultPosition = (parentId?: string, placement: Placement = "root") => {
    if (!parentId) return { x: 560, y: 120 };
    const parent = nodes.find((node) => node.id === parentId);
    const parentPosition = positions[parentId] || { x: 560, y: 120 };

    if (placement === "left") return { x: Math.max(40, parentPosition.x - 340), y: parentPosition.y };
    if (placement === "right") return { x: parentPosition.x + 340, y: parentPosition.y };

    const existingChildren = nodes.filter((node) => node.parentId === parentId).length;
    const childSpacing = 340;
    const levelY = parentPosition.y + 180;
    const startX = parentPosition.x - (existingChildren * childSpacing) / 2;
    return { x: Math.max(40, startX + existingChildren * childSpacing), y: levelY };
  };

  const createNode = () => {
    const id = `node-${Date.now()}`;
    const level = levels.find((l) => l.id === nodeDraft.levelId);
    const siblingParentId = nodePlacement === "left" || nodePlacement === "right" ? nodes.find((n) => n.id === nodeParentId)?.parentId : nodeParentId;
    const created: OrgNode = {
      id,
      parentId: siblingParentId,
      levelId: nodeDraft.levelId,
      name: nodeDraft.name || "Untitled Node",
      title: level?.title || "Node",
      description: nodeDraft.description || nodeDraft.street || "Enter description",
      street: nodeDraft.street,
      postalCode: nodeDraft.postalCode,
      stateOfOrigin: nodeDraft.stateOfOrigin,
      country: nodeDraft.country,
      phone: nodeDraft.phone,
      tenantId: nodeDraft.tenantId,
      manager: nodeDraft.manager,
      status: "Active",
      stats: { clients: 0, staff: 0, centers: 0, activeLoans: 0, portfolio: "₦0" },
    };
    setNodes((prev) => [...prev, created]);
    setPositions((prev) => ({ ...prev, [id]: getDefaultPosition(nodeParentId, nodePlacement) }));
    setSelectedNodeId(id);
    setDetailsOpen(activeTab === "diagram");
    setAddNodeOpen(false);
  };

  const updateNode = () => {
    setNodes((prev) =>
      prev.map((node) => {
        if (node.id !== selectedNodeId) return node;
        const level = levels.find((l) => l.id === nodeDraft.levelId);
        return {
          ...node,
          ...nodeDraft,
          title: level?.title || node.title,
          description: nodeDraft.description || node.description,
        };
      })
    );
    setEditNodeOpen(false);
  };

  const deleteNode = () => {
    if (!selectedNodeId) return;
    const hasChildren = nodes.some((node) => node.parentId === selectedNodeId);
    if (hasChildren) return;
    setNodes((prev) => prev.filter((node) => node.id !== selectedNodeId));
    setPositions((prev) => {
      const next = { ...prev };
      delete next[selectedNodeId];
      return next;
    });
    setSelectedNodeId("");
    setDetailsOpen(false);
  };

  const addLevel = () => {
    if (!newLevelTitle.trim()) return;
    setLevels((prev) => [
      ...prev,
      {
        id: `level-${Date.now()}`,
        order: prev.length + 1,
        title: newLevelTitle.trim(),
        description: `Level ${prev.length + 1} operating layer.`,
      },
    ]);
    setNewLevelTitle("");
  };

  const updateLevelTitle = (id: string, title: string) => {
    setLevels((prev) => prev.map((level) => (level.id === id ? { ...level, title } : level)));
  };

  const removeLevel = (id: string) => {
    if (nodes.some((node) => node.levelId === id)) return;
    setLevels((prev) => prev.filter((level) => level.id !== id).map((level, i) => ({ ...level, order: i + 1 })));
  };

  const onNodePointerDown = (nodeId: string, event: React.PointerEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    if (target.closest("[data-node-action]")) return;
    const pos = positions[nodeId] || { x: 420, y: 120 };
    setDraggingId(nodeId);
    setDragStart({ pointerX: event.clientX, pointerY: event.clientY, startX: pos.x, startY: pos.y });
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onCanvasPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingId || !dragStart) return;
    const dx = event.clientX - dragStart.pointerX;
    const dy = event.clientY - dragStart.pointerY;
    const nextX = Math.max(40, dragStart.startX + dx);
    const nextY = Math.max(40, dragStart.startY + dy);
    setPositions((prev) => ({
      ...prev,
      [draggingId]: { x: nextX, y: nextY },
    }));
  };

  const onCanvasPointerUp = () => {
    if (draggingId) {
      setPositions((prev) => {
        const current = prev[draggingId];
        if (!current) return prev;
        return {
          ...prev,
          [draggingId]: {
            x: Math.max(40, snapToGrid(current.x)),
            y: Math.max(40, snapToGrid(current.y)),
          },
        };
      });
    }
    setDraggingId(null);
    setDragStart(null);
  };

  return (
    <div className="min-h-screen bg-white">
      <OrganizationSidebar />
      <main className="ml-[calc(var(--rail-width)+250px)]">
        <GlobalHeader
          title="Organization"
          crumbs={[{ label: "Organization" }, { label: "Organization Structure" }]}
        />
        <div className="border-b border-border pl-10">
          <nav className="flex gap-8">
            <TabButton active={activeTab === "schema"} onClick={() => setActiveTab("schema")}>Organization Schema</TabButton>
            <TabButton active={activeTab === "diagram"} onClick={() => setActiveTab("diagram")}>Organization Diagram</TabButton>
            <TabButton active={activeTab === "levels"} onClick={() => setActiveTab("levels")}>Node Levels</TabButton>
          </nav>
        </div>

        <section className="px-10 pb-10 pt-8">
          <PageTransition skeleton={<CanvasPageSkeleton />}>
          <div className="flex gap-5">
            <div className="min-w-0 flex-1">
              <div className="rounded-none border border-border bg-white">
                <Toolbar search={search} setSearch={setSearch} onAdd={() => openCreateNode()} nodesExist={nodes.length > 0} />
                {activeTab === "levels" ? (
                  <LevelsCanvas levels={levels} updateLevelTitle={updateLevelTitle} newLevelTitle={newLevelTitle} setNewLevelTitle={setNewLevelTitle} addLevel={addLevel} removeLevel={removeLevel} />
                ) : (
                  <OrgCanvas
                    nodes={filteredNodes}
                    levels={levels}
                    positions={positions}
                    selectedNodeId={selectedNodeId}
                    setSelectedNodeId={setSelectedNodeId}
                    openDetails={(id) => {
                      setSelectedNodeId(id);
                      setDetailsOpen(true);
                    }}
                    openCreateNode={openCreateNode}
                    onNodePointerDown={onNodePointerDown}
                    onCanvasPointerMove={onCanvasPointerMove}
                    onCanvasPointerUp={onCanvasPointerUp}
                    draggingId={draggingId}
                  />
                )}
              </div>
            </div>
            {activeTab !== "levels" && detailsOpen && selectedNode && (
              <NodeDetailsPanel node={selectedNode} level={levels.find((l) => l.id === selectedNode.levelId)} onClose={() => setDetailsOpen(false)} onEdit={openEditNode} onDelete={deleteNode} hasChildren={nodes.some((node) => node.parentId === selectedNodeId)} />
            )}
          </div>
          </PageTransition>
        </section>
      </main>

      {addNodeOpen && (
        <NodeSheet title={nodePlacement === "root" ? "Create First Node" : "Create New Node"} action="Create Node" draft={nodeDraft} setDraft={setNodeDraft} levels={levels} onClose={() => setAddNodeOpen(false)} onSubmit={createNode} placement={nodePlacement} />
      )}
      {editNodeOpen && (
        <NodeSheet title="Edit Node" action="Save Changes" draft={nodeDraft} setDraft={setNodeDraft} levels={levels} onClose={() => setEditNodeOpen(false)} onSubmit={updateNode} />
      )}
    </div>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} className={["h-11 border-b-2 text-sm transition-colors", active ? "border-primary text-text-primary" : "border-transparent text-text-secondary hover:text-text-primary"].join(" ")}>
      {children}
    </button>
  );
}

function Toolbar({ search, setSearch, onAdd, nodesExist }: { search: string; setSearch: (v: string) => void; onAdd: () => void; nodesExist: boolean }) {
  return (
    <div className="flex h-[62px] items-center justify-between border-b border-border px-4">
      <div className="relative">
        <Search size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search" className="focus-ring h-10 w-[320px] rounded-md border border-border-strong pl-10 pr-3 text-sm text-text-primary placeholder:text-text-muted" />
      </div>
      <div className="flex items-center gap-2">
        <button className="focus-ring inline-flex h-10 items-center gap-2 rounded-md border border-border-strong bg-white px-4 text-sm text-text-primary hover:bg-surface-muted" type="button"><SlidersHorizontal size={16} />Filter</button>
        <button className="focus-ring inline-flex h-10 items-center gap-2 rounded-md border border-border-strong bg-white px-4 text-sm text-text-primary hover:bg-surface-muted" type="button">Export <Upload size={16} /></button>
        <button onClick={onAdd} className="focus-ring inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-white hover:bg-primary-hover" type="button">Add Node Levels <Plus size={16} /></button>
      </div>
    </div>
  );
}

function LevelsCanvas({ levels, updateLevelTitle, newLevelTitle, setNewLevelTitle, addLevel, removeLevel }: { levels: OrgLevel[]; updateLevelTitle: (id: string, title: string) => void; newLevelTitle: string; setNewLevelTitle: (v: string) => void; addLevel: () => void; removeLevel: (id: string) => void }) {
  return (
    <div className="organization-grid min-h-[760px] px-10 py-10">
      <div className="mx-auto max-w-[600px] space-y-4">
        <div className="rounded-xl border border-border bg-white p-5 ">
          <p className="text-sm font-semibold text-text-primary">Define node levels</p>
          <p className="mt-1 text-xs leading-5 text-text-muted">Create every operating layer before building the organization. Example: Head Office, Region, Branch, Center. You can add more levels any time.</p>
          <div className="mt-4 flex gap-2">
            <input value={newLevelTitle} onChange={(e) => setNewLevelTitle(e.target.value)} placeholder="Enter Title" className="focus-ring h-10 flex-1 rounded-md border border-border-strong px-3 text-sm" />
            <button onClick={addLevel} type="button" className="focus-ring rounded-md bg-primary px-4 text-sm font-medium text-white">Add Level</button>
          </div>
        </div>
        {levels.map((level, index) => (
          <div key={level.id} className="relative flex items-center justify-between rounded-lg border border-border bg-white p-4 ">
            <div className="flex flex-1 items-center gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white">{level.order}</span>
              <div className="flex-1">
                <input value={level.title} onChange={(e) => updateLevelTitle(level.id, e.target.value)} className="focus-ring h-9 w-full rounded-md border border-transparent px-2 text-sm font-semibold text-text-primary hover:border-border-strong focus:border-primary" />
                <p className="px-2 text-xs text-text-muted">Level {level.order}</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button type="button" className="rounded-md p-2 text-text-muted hover:bg-surface-muted"><ChevronsUpDown size={15} /></button>
              <button type="button" onClick={() => removeLevel(level.id)} className="rounded-md p-2 text-red-500 hover:bg-red-50"><Trash2 size={15} /></button>
            </div>
            {index < levels.length - 1 && <div className="absolute left-[31px] top-full h-4 w-px bg-border-strong" />}
          </div>
        ))}
      </div>
    </div>
  );
}

function OrgCanvas({ nodes, levels, positions, selectedNodeId, setSelectedNodeId, openDetails, openCreateNode, onNodePointerDown, onCanvasPointerMove, onCanvasPointerUp, draggingId }: { nodes: OrgNode[]; levels: OrgLevel[]; positions: Record<string, NodePosition>; selectedNodeId: string; setSelectedNodeId: (id: string) => void; openDetails: (id: string) => void; openCreateNode: (id?: string, placement?: Placement) => void; onNodePointerDown: (id: string, event: React.PointerEvent<HTMLDivElement>) => void; onCanvasPointerMove: (event: React.PointerEvent<HTMLDivElement>) => void; onCanvasPointerUp: () => void; draggingId: string | null }) {
  const nodeById = useMemo(() => new Map(nodes.map((node) => [node.id, node])), [nodes]);
  return (
    <div className="organization-grid relative min-h-[760px] overflow-auto p-8" onPointerMove={onCanvasPointerMove} onPointerUp={onCanvasPointerUp} onPointerCancel={onCanvasPointerUp}>
      {nodes.length === 0 ? (
        <EmptyOrganizationState onCreate={() => openCreateNode(undefined, "root")} />
      ) : (
        <div className="relative h-[1120px] min-w-[1400px]">
          <svg className="pointer-events-none absolute inset-0 h-full w-full overflow-visible">
            {nodes
              .filter((node) => node.parentId)
              .map((child) => {
                const parent = child.parentId ? nodeById.get(child.parentId) : undefined;
                if (!parent || !child.parentId) return null;

                const parentPosition = positions[child.parentId] || { x: 560, y: 120 };
                const childPosition = positions[child.id] || { x: parentPosition.x, y: parentPosition.y + 180 };

                const parentCenterX = parentPosition.x + NODE_WIDTH / 2;
                const parentBottomY = parentPosition.y + NODE_HEIGHT;
                const childCenterX = childPosition.x + NODE_WIDTH / 2;
                const childTopY = childPosition.y;
                const gap = Math.max(56, childTopY - parentBottomY);
                const elbowY = parentBottomY + gap / 2;
                const radius = 18;
                const direction = childCenterX >= parentCenterX ? 1 : -1;
                const horizontalStartX = parentCenterX;
                const horizontalEndX = childCenterX;
                const firstCornerX = horizontalStartX;
                const secondCornerX = horizontalEndX;
                const path =
                  Math.abs(childCenterX - parentCenterX) < 2
                    ? `M ${parentCenterX} ${parentBottomY} V ${childTopY}`
                    : `M ${parentCenterX} ${parentBottomY} V ${elbowY - radius} Q ${firstCornerX} ${elbowY} ${firstCornerX + direction * radius} ${elbowY} H ${secondCornerX - direction * radius} Q ${secondCornerX} ${elbowY} ${secondCornerX} ${elbowY + radius} V ${childTopY}`;

                return (
                  <path
                    key={`edge-${child.parentId}-${child.id}`}
                    d={path}
                    fill="none"
                    stroke="#D5DAE1"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                  />
                );
              })}
          </svg>
          {nodes.map((node) => {
            const pos = positions[node.id] || { x: 560, y: 120 };
            const level = levels.find((l) => l.id === node.levelId);
            return (
              <div key={node.id} className="absolute" style={{ left: pos.x, top: pos.y }} onPointerDown={(event) => onNodePointerDown(node.id, event)}>
                <DraggableNodeCard node={node} level={level} selected={selectedNodeId === node.id} dragging={draggingId === node.id} onSelect={() => setSelectedNodeId(node.id)} onOpenDetails={() => openDetails(node.id)} onAddChild={() => openCreateNode(node.id, "child")} onAddLeft={() => openCreateNode(node.id, "left")} onAddRight={() => openCreateNode(node.id, "right")} />
              </div>
            );
          })}
        </div>
      )}
      <div className="absolute bottom-4 right-4 flex items-center gap-2">
        <button type="button" className="flex h-10 w-10 items-center justify-center rounded-md border border-border-strong bg-white text-text-secondary "><Maximize2 size={17} /></button>
        <div className="flex h-10 items-center gap-2 rounded-md border border-border-strong bg-white px-3 text-sm text-text-primary "><PlusCircle size={16} />100%<MinusCircle size={16} /></div>
      </div>
    </div>
  );
}

function EmptyOrganizationState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex min-h-[700px] items-center justify-center">
      <div className="flex w-[360px] flex-col items-center text-center">
        <img src="/Illustration.svg" alt="No node level" className="mb-6 h-[118px] w-[150px] object-contain" />
        <h2 className="text-lg font-semibold text-text-primary">No Node Level</h2>
        <p className="mt-2 max-w-[260px] text-sm leading-5 text-text-secondary">You have not added any node level to your organization structure yet.</p>
        <button onClick={onCreate} type="button" className="focus-ring mt-6 inline-flex h-11 items-center justify-center rounded-md bg-primary px-5 text-sm font-medium text-white hover:bg-primary-hover">Add Node Level</button>
      </div>
    </div>
  );
}

function DraggableNodeCard({ node, level, selected, dragging, onSelect, onOpenDetails, onAddChild, onAddLeft, onAddRight }: { node: OrgNode; level?: OrgLevel; selected: boolean; dragging: boolean; onSelect: () => void; onOpenDetails: () => void; onAddChild: () => void; onAddLeft: () => void; onAddRight: () => void }) {
  return (
    <div className="group relative select-none">
      <div role="button" tabIndex={0} onClick={onSelect} onDoubleClick={onOpenDetails} className={[
        "relative flex h-[70px] w-[270px] items-center justify-center rounded-lg border bg-white px-6 text-center transition-[border-color,background-color,box-,transform] outline-none focus-visible:ring-2 focus-visible:ring-primary/25",
        selected ? "border-primary bg-[#EEF3FF] " : "border-border hover:border-primary/50",
        dragging ? "scale-[1.015] cursor-grabbing " : "cursor-grab",
      ].join(" ")}>
        <span className="absolute right-3 top-3 rounded-full bg-[#EEF3FF] px-2 py-0.5 text-[10px] font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">{level?.title || "Node"}</span>
        <span className="flex flex-col items-center justify-center">
          <span className="text-sm font-semibold text-text-primary">{node.name}</span>
          <span className="mt-1 max-w-[210px] truncate text-xs text-text-secondary">{node.description}</span>
        </span>
      </div>
      <button data-node-action onClick={onAddLeft} type="button" aria-label="Add node to left" className="absolute -left-8 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full border border-primary bg-white text-primary opacity-0 transition-opacity group-hover:opacity-100"><Plus size={14} /></button>
      <button data-node-action onClick={onAddRight} type="button" aria-label="Add node to right" className="absolute -right-8 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full border border-primary bg-white text-primary opacity-0 transition-opacity group-hover:opacity-100"><Plus size={14} /></button>
      <button data-node-action onClick={onAddChild} type="button" aria-label="Add child node" className="absolute -bottom-9 left-1/2 flex h-6 w-6 -translate-x-1/2 items-center justify-center rounded-full border border-primary bg-white text-primary opacity-0 transition-opacity group-hover:opacity-100"><Plus size={14} /></button>
    </div>
  );
}

function NodeDetailsPanel({ node, level, onClose, onEdit, onDelete, hasChildren }: { node: OrgNode; level?: OrgLevel; onClose: () => void; onEdit: () => void; onDelete: () => void; hasChildren: boolean }) {
  const rows = [
    ["Name", node.name],
    ["Title", level?.title || node.title],
    ["Description", node.description],
    ["Street", node.street],
    ["Postal Code", node.postalCode],
    ["State of Origin", node.stateOfOrigin],
    ["Country", node.country],
    ["Phone", node.phone],
    ["Tenant ID", node.tenantId],
    ["Manager", node.manager],
  ];
  return (
    <aside className="flex h-[860px] w-[380px] min-w-[380px] flex-col border border-border bg-white">
      <div className="flex h-[62px] items-center justify-between border-b border-border px-4">
        <h2 className="text-base font-semibold text-text-primary">Node Item Details</h2>
        <button onClick={onClose} className="rounded-md p-2 text-text-secondary hover:bg-surface-muted"><X size={18} /></button>
      </div>
      <div className="flex-1 overflow-auto">
        {rows.map(([label, value]) => (
          <details key={label} className="group border-b border-border" open={label === "Name"}>
            <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-4 text-sm text-text-secondary">
              <span>{label}</span>
              <ChevronDown size={16} className="transition-transform group-open:rotate-180" />
            </summary>
            <div className="px-4 pb-4 text-sm font-medium text-text-primary">{value || "--"}</div>
          </details>
        ))}
      </div>
      <div className="flex gap-2 border-t border-border p-4">
        <button disabled={hasChildren} onClick={onDelete} type="button" className="focus-ring h-10 flex-1 rounded-md border border-border-strong bg-white text-sm font-medium text-red-500 disabled:cursor-not-allowed disabled:opacity-40">Delete</button>
        <button onClick={onEdit} type="button" className="focus-ring h-10 flex-1 rounded-md bg-primary text-sm font-medium text-white">Edit</button>
      </div>
    </aside>
  );
}


function NodeSheet({ title, action, draft, setDraft, levels, onClose, onSubmit, placement }: { title: string; action: string; draft: NodeDraft; setDraft: React.Dispatch<React.SetStateAction<NodeDraft>>; levels: OrgLevel[]; onClose: () => void; onSubmit: () => void; placement?: Placement }) {
  const update = (key: keyof NodeDraft, value: string) => setDraft((prev) => ({ ...prev, [key]: value }));
  return (
    <div className="fixed inset-0 z-50 bg-black/35">
      <div className="ml-auto flex h-full w-[620px] flex-col bg-white ">
        <div className="flex h-[70px] items-center justify-between border-b border-border px-6">
          <div>
            <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
            {placement && placement !== "root" && <p className="mt-1 text-xs text-text-muted">Placement: {placement === "child" ? "Child node below selected node" : `Sibling node on the ${placement}`}</p>}
          </div>
          <button onClick={onClose} type="button" className="rounded-md p-2 text-text-secondary hover:bg-surface-muted"><X size={18} /></button>
        </div>
        <div className="flex-1 overflow-auto px-6 py-6">
          <div className="grid grid-cols-2 gap-4">
            <SheetInput label="Node Name" value={draft.name} onChange={(v) => update("name", v)} placeholder="Enter Title" />
            <SheetSelect label="Node Level" value={draft.levelId} onChange={(v) => update("levelId", v)} options={levels.map((l) => ({ label: `${l.title} · Level ${l.order}`, value: l.id }))} />
            <SheetInput label="Description" value={draft.description} onChange={(v) => update("description", v)} placeholder="Broadway Street, Lagos Island." wide />
            <SheetInput label="Street" value={draft.street} onChange={(v) => update("street", v)} />
            <SheetInput label="Postal Code" value={draft.postalCode} onChange={(v) => update("postalCode", v)} />
            <SheetSelect label="State of Origin" value={draft.stateOfOrigin} onChange={(v) => update("stateOfOrigin", v)} options={stateOptions.map((v) => ({ label: v, value: v }))} />
            <SheetSelect label="Country" value={draft.country} onChange={(v) => update("country", v)} options={countryOptions.map((v) => ({ label: v, value: v }))} />
            <SheetInput label="Phone" value={draft.phone} onChange={(v) => update("phone", v)} />
            <SheetInput label="Tenant ID" value={draft.tenantId} onChange={(v) => update("tenantId", v)} />
            <SheetSelect label="Manager" value={draft.manager} onChange={(v) => update("manager", v)} options={managerOptions.map((v) => ({ label: v, value: v }))} />
          </div>
          <div className="mt-6 rounded-lg border border-border bg-surface-muted p-4 text-xs leading-5 text-text-secondary">
            You can drag nodes after creation to fine-tune left/right placement on the canvas. Parent-child connections stay intact while the layout position is manually adjusted.
          </div>
        </div>
        <div className="flex gap-3 border-t border-border px-6 py-4">
          <button onClick={onClose} type="button" className="focus-ring h-10 flex-1 rounded-md border border-border-strong text-sm font-medium text-text-secondary">Cancel</button>
          <button onClick={onSubmit} type="button" className="focus-ring h-10 flex-1 rounded-md bg-primary text-sm font-medium text-white">{action}</button>
        </div>
      </div>
    </div>
  );
}

function SheetInput({ label, value, onChange, placeholder, wide }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; wide?: boolean }) {
  return <label className={wide ? "col-span-2" : ""}><span className="mb-2 block text-sm text-text-secondary">{label}</span><input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="focus-ring h-11 w-full rounded-md border border-border-strong px-3 text-sm text-text-primary placeholder:text-text-muted" /></label>;
}

function SheetSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { label: string; value: string }[] }) {
  return <label><span className="mb-2 block text-sm text-text-secondary">{label}</span><div className="relative"><select value={value} onChange={(e) => onChange(e.target.value)} className="focus-ring h-11 w-full appearance-none rounded-md border border-border-strong bg-white px-3 pr-9 text-sm text-text-primary"><option value="">Select</option>{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select><ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary" /></div></label>;
}
