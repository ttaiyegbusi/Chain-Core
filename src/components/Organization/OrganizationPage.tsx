"use client";

import { useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronsUpDown,
  Edit,
  Maximize2,
  MinusCircle,
  Move,
  Plus,
  PlusCircle,
  Search,
  SlidersHorizontal,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import PrimaryRail from "@/components/PrimaryRail";
import OrganizationSidebar from "./OrganizationSidebar";
import GlobalHeader from "@/components/GlobalHeader";
import { ORG_LEVELS, OrgLevel, OrgNode } from "@/data/organization";

const countryOptions = ["Nigeria", "Ghana", "Kenya", "South Africa"];
const stateOptions = ["Lagos", "Ogun", "Oyo", "Rivers", "Abuja"];
const managerOptions = ["Temitope Aiyegbusi", "Helen Paul", "Aiyegbusi Temitope", "Operations Admin"];

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
    if (!parentId) return { x: 420, y: 120 };
    const parentPosition = positions[parentId] || { x: 420, y: 120 };
    if (placement === "left") return { x: parentPosition.x - 340, y: parentPosition.y };
    if (placement === "right") return { x: parentPosition.x + 340, y: parentPosition.y };
    return { x: parentPosition.x, y: parentPosition.y + 170 };
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
    if (target.closest("button")) return;
    const pos = positions[nodeId] || { x: 420, y: 120 };
    setDraggingId(nodeId);
    setDragStart({ pointerX: event.clientX, pointerY: event.clientY, startX: pos.x, startY: pos.y });
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onCanvasPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingId || !dragStart) return;
    const dx = event.clientX - dragStart.pointerX;
    const dy = event.clientY - dragStart.pointerY;
    setPositions((prev) => ({
      ...prev,
      [draggingId]: { x: Math.max(40, dragStart.startX + dx), y: Math.max(40, dragStart.startY + dy) },
    }));
  };

  const onCanvasPointerUp = () => {
    setDraggingId(null);
    setDragStart(null);
  };

  return (
    <div className="min-h-screen bg-white">
      <PrimaryRail />
      <OrganizationSidebar />
      <main className="ml-[316px]">
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
                    setSelectedNodeId={(id) => {
                      setSelectedNodeId(id);
                      if (activeTab === "diagram") setDetailsOpen(true);
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
            {activeTab === "diagram" && detailsOpen && selectedNode && (
              <NodeDetailsPanel node={selectedNode} level={levels.find((l) => l.id === selectedNode.levelId)} onClose={() => setDetailsOpen(false)} onEdit={openEditNode} onDelete={deleteNode} hasChildren={nodes.some((node) => node.parentId === selectedNodeId)} />
            )}
          </div>
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
        <button onClick={onAdd} className="focus-ring inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-white hover:bg-primary-hover" type="button">{nodesExist ? "Create Node" : "Create First Node"} <Plus size={16} /></button>
      </div>
    </div>
  );
}

function LevelsCanvas({ levels, updateLevelTitle, newLevelTitle, setNewLevelTitle, addLevel, removeLevel }: { levels: OrgLevel[]; updateLevelTitle: (id: string, title: string) => void; newLevelTitle: string; setNewLevelTitle: (v: string) => void; addLevel: () => void; removeLevel: (id: string) => void }) {
  return (
    <div className="organization-grid min-h-[760px] px-10 py-10">
      <div className="mx-auto max-w-[600px] space-y-4">
        <div className="rounded-xl border border-border bg-white p-5 shadow-[0_8px_24px_rgba(17,24,39,0.04)]">
          <p className="text-sm font-semibold text-text-primary">Define node levels</p>
          <p className="mt-1 text-xs leading-5 text-text-muted">Create every operating layer before building the organization. Example: Head Office, Region, Branch, Center. You can add more levels any time.</p>
          <div className="mt-4 flex gap-2">
            <input value={newLevelTitle} onChange={(e) => setNewLevelTitle(e.target.value)} placeholder="Enter Title" className="focus-ring h-10 flex-1 rounded-md border border-border-strong px-3 text-sm" />
            <button onClick={addLevel} type="button" className="focus-ring rounded-md bg-primary px-4 text-sm font-medium text-white">Add Level</button>
          </div>
        </div>
        {levels.map((level, index) => (
          <div key={level.id} className="relative flex items-center justify-between rounded-lg border border-border bg-white p-4 shadow-[0_8px_24px_rgba(17,24,39,0.04)]">
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

function OrgCanvas({ nodes, levels, positions, selectedNodeId, setSelectedNodeId, openCreateNode, onNodePointerDown, onCanvasPointerMove, onCanvasPointerUp, draggingId }: { nodes: OrgNode[]; levels: OrgLevel[]; positions: Record<string, NodePosition>; selectedNodeId: string; setSelectedNodeId: (id: string) => void; openCreateNode: (id?: string, placement?: Placement) => void; onNodePointerDown: (id: string, event: React.PointerEvent<HTMLDivElement>) => void; onCanvasPointerMove: (event: React.PointerEvent<HTMLDivElement>) => void; onCanvasPointerUp: () => void; draggingId: string | null }) {
  const nodeById = useMemo(() => new Map(nodes.map((node) => [node.id, node])), [nodes]);
  return (
    <div className="organization-grid relative min-h-[760px] overflow-auto p-8" onPointerMove={onCanvasPointerMove} onPointerUp={onCanvasPointerUp} onPointerCancel={onCanvasPointerUp}>
      {nodes.length === 0 ? (
        <EmptyOrganizationState onCreate={() => openCreateNode(undefined, "root")} />
      ) : (
        <div className="relative h-[1120px] min-w-[1280px]">
          <svg className="pointer-events-none absolute inset-0 h-full w-full overflow-visible">
            {nodes.map((node) => {
              if (!node.parentId) return null;
              const parent = nodeById.get(node.parentId);
              if (!parent) return null;
              const from = positions[parent.id] || { x: 420, y: 120 };
              const to = positions[node.id] || { x: 420, y: 290 };
              const startX = from.x + 135;
              const startY = from.y + 84;
              const endX = to.x + 135;
              const endY = to.y;
              const midY = startY + (endY - startY) / 2;
              return <path key={`${parent.id}-${node.id}`} d={`M ${startX} ${startY} C ${startX} ${midY}, ${endX} ${midY}, ${endX} ${endY}`} fill="none" stroke="#DDE3EA" strokeWidth="1.5" />;
            })}
          </svg>
          {nodes.map((node) => {
            const pos = positions[node.id] || { x: 420, y: 120 };
            const level = levels.find((l) => l.id === node.levelId);
            return (
              <div key={node.id} className="absolute" style={{ left: pos.x, top: pos.y }} onPointerDown={(event) => onNodePointerDown(node.id, event)}>
                <DraggableNodeCard node={node} level={level} selected={selectedNodeId === node.id} dragging={draggingId === node.id} onSelect={() => setSelectedNodeId(node.id)} onAddChild={() => openCreateNode(node.id, "child")} onAddLeft={() => openCreateNode(node.id, "left")} onAddRight={() => openCreateNode(node.id, "right")} />
              </div>
            );
          })}
        </div>
      )}
      <div className="absolute bottom-4 right-4 flex items-center gap-2">
        <button type="button" className="flex h-10 w-10 items-center justify-center rounded-md border border-border-strong bg-white text-text-secondary shadow-sm"><Maximize2 size={17} /></button>
        <div className="flex h-10 items-center gap-2 rounded-md border border-border-strong bg-white px-3 text-sm text-text-primary shadow-sm"><PlusCircle size={16} />100%<MinusCircle size={16} /></div>
      </div>
    </div>
  );
}

function EmptyOrganizationState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex min-h-[700px] items-center justify-center">
      <div className="w-[420px] rounded-2xl border border-dashed border-border-strong bg-white p-8 text-center shadow-[0_18px_50px_rgba(17,24,39,0.05)]">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EEF3FF] text-primary"><Plus size={24} /></div>
        <h2 className="mt-5 text-base font-semibold text-text-primary">Create your first organization node</h2>
        <p className="mt-2 text-sm leading-6 text-text-secondary">Start with your root node, such as Head Office. After that, use the plus controls to add child nodes or place sibling nodes to the left and right.</p>
        <button onClick={onCreate} type="button" className="focus-ring mt-6 inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-white hover:bg-primary-hover">Create First Node <Plus size={16} /></button>
      </div>
    </div>
  );
}

function DraggableNodeCard({ node, level, selected, dragging, onSelect, onAddChild, onAddLeft, onAddRight }: { node: OrgNode; level?: OrgLevel; selected: boolean; dragging: boolean; onSelect: () => void; onAddChild: () => void; onAddLeft: () => void; onAddRight: () => void }) {
  return (
    <div className="group relative select-none">
      <button type="button" onClick={onSelect} className={["w-[270px] rounded-lg border bg-white px-6 py-4 text-center shadow-[0_8px_24px_rgba(17,24,39,0.04)] transition-all", selected ? "border-primary bg-[#EEF3FF]" : "border-border hover:border-primary/50", dragging ? "scale-[1.015] cursor-grabbing shadow-[0_18px_46px_rgba(17,24,39,0.12)]" : "cursor-grab"].join(" ")}>
        <span className="absolute left-3 top-3 text-text-muted"><Move size={14} /></span>
        <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-primary">{level?.title}</p>
        <p className="text-sm font-semibold text-text-primary">{node.name}</p>
        <p className="mt-1 truncate text-xs text-text-secondary">{node.description}</p>
      </button>
      <button onClick={onAddLeft} type="button" className="absolute -left-8 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full border border-primary bg-white text-primary opacity-0 shadow-sm transition-opacity group-hover:opacity-100"><Plus size={14} /></button>
      <button onClick={onAddRight} type="button" className="absolute -right-8 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full border border-primary bg-white text-primary opacity-0 shadow-sm transition-opacity group-hover:opacity-100"><Plus size={14} /></button>
      <button onClick={onAddChild} type="button" className="absolute -bottom-9 left-1/2 flex h-6 w-6 -translate-x-1/2 items-center justify-center rounded-full border border-primary bg-white text-primary opacity-0 shadow-sm transition-opacity group-hover:opacity-100"><Plus size={14} /></button>
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
        <div className="grid grid-cols-3 gap-2 border-b border-border p-4">
          <Stat label="Clients" value={node.stats.clients.toLocaleString()} />
          <Stat label="Staff" value={String(node.stats.staff)} />
          <Stat label="Portfolio" value={node.stats.portfolio} />
        </div>
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

function Stat({ label, value }: { label: string; value: string }) {
  return <div className="rounded-lg bg-surface-muted px-3 py-2"><p className="text-[11px] text-text-muted">{label}</p><p className="mt-1 text-sm font-semibold text-text-primary">{value}</p></div>;
}

function NodeSheet({ title, action, draft, setDraft, levels, onClose, onSubmit, placement }: { title: string; action: string; draft: NodeDraft; setDraft: React.Dispatch<React.SetStateAction<NodeDraft>>; levels: OrgLevel[]; onClose: () => void; onSubmit: () => void; placement?: Placement }) {
  const update = (key: keyof NodeDraft, value: string) => setDraft((prev) => ({ ...prev, [key]: value }));
  return (
    <div className="fixed inset-0 z-50 bg-black/35">
      <div className="ml-auto flex h-full w-[620px] flex-col bg-white shadow-[0_20px_80px_rgba(17,24,39,0.18)]">
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
