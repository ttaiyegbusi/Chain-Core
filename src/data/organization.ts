export type NodeStatus = "Active" | "Inactive";

export interface OrgLevel {
  id: string;
  order: number;
  title: string;
  description: string;
}

export interface OrgNode {
  id: string;
  parentId?: string;
  levelId: string;
  name: string;
  title: string;
  description: string;
  street: string;
  postalCode: string;
  stateOfOrigin: string;
  country: string;
  phone: string;
  tenantId: string;
  manager: string;
  status: NodeStatus;
  stats: {
    clients: number;
    staff: number;
    centers: number;
    activeLoans: number;
    portfolio: string;
  };
}

export const ORG_LEVELS: OrgLevel[] = [
  {
    id: "level-1",
    order: 1,
    title: "Head Office",
    description: "The top-level operating entity for the tenant.",
  },
  {
    id: "level-2",
    order: 2,
    title: "Region",
    description: "Regional business layer used for reporting and supervision.",
  },
  {
    id: "level-3",
    order: 3,
    title: "Branch",
    description: "Customer-facing banking office within a region.",
  },
  {
    id: "level-4",
    order: 4,
    title: "Center",
    description: "Field or customer management center under a branch.",
  },
];

export const ORG_NODES: OrgNode[] = [
  {
    id: "node-1",
    levelId: "level-1",
    name: "ChainCore HQ",
    title: "Head Office",
    description: "Broadway Street, Lagos Island.",
    street: "Broadway Street, Lagos Island",
    postalCode: "100221",
    stateOfOrigin: "Lagos",
    country: "Nigeria",
    phone: "+234 902 893 9012",
    tenantId: "TEN-001",
    manager: "Temitope Aiyegbusi",
    status: "Active",
    stats: {
      clients: 12840,
      staff: 234,
      centers: 42,
      activeLoans: 3980,
      portfolio: "₦2.4bn",
    },
  },
  {
    id: "node-2",
    parentId: "node-1",
    levelId: "level-2",
    name: "South - West",
    title: "Region",
    description: "Broadway Street, Lagos Island.",
    street: "Broadway Street, Lagos Island",
    postalCode: "100221",
    stateOfOrigin: "Lagos",
    country: "Nigeria",
    phone: "+234 902 893 9012",
    tenantId: "TEN-SW-001",
    manager: "Helen Paul",
    status: "Active",
    stats: {
      clients: 5430,
      staff: 74,
      centers: 16,
      activeLoans: 1394,
      portfolio: "₦840m",
    },
  },
  {
    id: "node-3",
    parentId: "node-2",
    levelId: "level-3",
    name: "Lagos Main Branch",
    title: "Branch",
    description: "45 Aliyetoro, Surulere.",
    street: "45 Aliyetoro, Surulere",
    postalCode: "100021",
    stateOfOrigin: "Lagos",
    country: "Nigeria",
    phone: "+234 902 893 9012",
    tenantId: "TEN-LAG-001",
    manager: "Aiyegbusi Temitope",
    status: "Active",
    stats: {
      clients: 1820,
      staff: 28,
      centers: 5,
      activeLoans: 621,
      portfolio: "₦320m",
    },
  },
];
