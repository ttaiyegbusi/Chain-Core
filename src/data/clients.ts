// Clients data model.
//
// Four client types share the same underlying shape because the table view is
// near-identical across them. Differences are at the detail-page level only
// (e.g. a Corporate client has Directors; a Center has Members).

export type ClientStatus = "Active" | "Inactive" | "Suspended";
export type ClientGender = "Male" | "Female";
export type ClientType = "Individual" | "Corporate" | "Center" | "Persons";

export interface Client {
  id: string; // route id, e.g. "ind-001"
  type: ClientType;
  name: string; // primary display name (person, company, or center name)
  email: string;
  avatarSrc?: string; // optional uploaded avatar
  gender: ClientGender;
  dateOfBirth: string; // e.g. "Apr 12, 2023"
  phone: string; // e.g. "+234 902 892 3920"
  clientId: string; // bank-side identifier, e.g. "APX1242352"
  status: ClientStatus;
  // Detail-page fields (used on Individual detail; populated on others for
  // consistency).
  detail: ClientDetail;
}

export interface ClientDetail {
  centerName: string; // for Individuals this is the Center they belong to
  shortName: string;
  contact: {
    firstAddress: {
      country: string;
      street: string;
      state: string;
      city: string;
      postalCode: string;
    };
    emailAddress: string;
    additionalEmailAddress: string;
    phoneNumber: string;
    additionalPhoneNumber: string;
  };
  meeting: {
    day: string;
    time: string;
  };
  additional: {
    branch: string;
    creditOfficer: string;
    notes: string;
  };
}

const SAMPLE_NOTES =
  "Downtime is inevitable during the transition between Core Banking Applications (CBAs), primarily because older CBAs are often built on outdated technologies. Modern technology stacks used by banks today significantly differ from the legacy systems on which their CBAs were originally developed, which is a key contributing factor to these challenges.";

function detail(
  centerName: string,
  shortName: string,
  branch: string
): ClientDetail {
  return {
    centerName,
    shortName,
    contact: {
      firstAddress: {
        country: "Nigeria",
        street: "45 Aiyetoro",
        state: "Lagos",
        city: "Surulere",
        postalCode: "10021",
      },
      emailAddress: "aiyebusitope@gmail.com",
      additionalEmailAddress: "aiyebusitope@gmail.com",
      phoneNumber: "+234 902 893 9012",
      additionalPhoneNumber: "+234 902 893 9012",
    },
    meeting: { day: "Monday", time: "12:45pm" },
    additional: {
      branch,
      creditOfficer: "Temitope Aiyegbusi",
      notes: SAMPLE_NOTES,
    },
  };
}

// -------------------------------------------------------- helpers

function ind(
  id: string,
  name: string,
  gender: ClientGender,
  status: ClientStatus = "Active"
): Client {
  return {
    id,
    type: "Individual",
    name,
    email: "ttaiyegbusi@gmail.com",
    gender,
    dateOfBirth: "Apr 12, 2023",
    phone: "+234 902 892 3920",
    clientId: "APX1242352",
    status,
    detail: detail("Chain Consults", "CHC", "Lagos"),
  };
}

function corp(
  id: string,
  name: string,
  status: ClientStatus = "Active"
): Client {
  return {
    id,
    type: "Corporate",
    name,
    email: "ttaiyegbusi@gmail.com",
    gender: "Male", // unused for Corporate display but kept for shape consistency
    dateOfBirth: "Apr 12, 2023",
    phone: "+234 902 892 3920",
    clientId: "APX1242352",
    status,
    detail: detail("Chain Consults", "CHC", "Lagos"),
  };
}

function center(
  id: string,
  name: string,
  status: ClientStatus = "Active"
): Client {
  return {
    id,
    type: "Center",
    name,
    email: "centeradmin@chaincore.ng",
    gender: "Male",
    dateOfBirth: "Apr 12, 2023",
    phone: "+234 902 892 3920",
    clientId: "APX1242352",
    status,
    detail: detail(name, name.slice(0, 3).toUpperCase(), "Lagos"),
  };
}

// -------------------------------------------------- INDIVIDUAL clients

export const INDIVIDUAL_CLIENTS: Client[] = [
  ind("ind-001", "Aiyegbusi Temitope", "Male", "Active"),
  ind("ind-002", "Adekunle Adebayo", "Female", "Active"),
  ind("ind-003", "Okafor Olamide", "Male", "Active"),
  ind("ind-004", "Eze Chinwe", "Female", "Active"),
  ind("ind-005", "Bello Ibrahim", "Male", "Inactive"),
  ind("ind-006", "Nwosu Adaeze", "Female", "Suspended"),
  ind("ind-007", "Abubakar Yusuf", "Male", "Inactive"),
  ind("ind-008", "Williams Funke", "Female", "Suspended"),
];

// -------------------------------------------------- CORPORATE clients

export const CORPORATE_CLIENTS: Client[] = [
  corp("corp-001", "Acme Manufacturing Ltd", "Active"),
  corp("corp-002", "Lagos Logistics Plc", "Active"),
  corp("corp-003", "Vanguard Energy Nigeria", "Active"),
  corp("corp-004", "Greenfield Agro Co", "Inactive"),
  corp("corp-005", "Coastal Trading Limited", "Active"),
  corp("corp-006", "Bluewater Imports", "Suspended"),
  corp("corp-007", "Skyline Properties Ltd", "Active"),
  corp("corp-008", "Northern Foods Plc", "Inactive"),
];

// -------------------------------------------------- CENTER clients

export const CENTER_CLIENTS: Client[] = [
  center("ctr-001", "Chain Consults", "Active"),
  center("ctr-002", "Surulere Traders Cooperative", "Active"),
  center("ctr-003", "Mushin Market Association", "Active"),
  center("ctr-004", "Ikeja Women's Cooperative", "Active"),
  center("ctr-005", "Apapa Drivers Union", "Inactive"),
  center("ctr-006", "Yaba Tech Hub Center", "Active"),
  center("ctr-007", "Festac Cooperative Society", "Suspended"),
  center("ctr-008", "Ojuelegba Traders Group", "Active"),
];

// -------------------------------------------------- PERSONS clients
// "Persons" is a synonym for Individual — same shape, separate listing so
// you can group/filter differently downstream if you choose.

export const PERSONS_CLIENTS: Client[] = [
  ind("per-001", "Aiyegbusi Temitope", "Male", "Active"),
  ind("per-002", "Adekunle Adebayo", "Female", "Active"),
  ind("per-003", "Okafor Olamide", "Male", "Inactive"),
  ind("per-004", "Eze Chinwe", "Female", "Active"),
  ind("per-005", "Bello Ibrahim", "Male", "Active"),
  ind("per-006", "Nwosu Adaeze", "Female", "Suspended"),
].map((c) => ({ ...c, type: "Persons" as ClientType }));

// ------------------------------------------------------- lookup helpers

export function findClient(
  type: ClientType,
  id: string
): Client | undefined {
  const list =
    type === "Individual"
      ? INDIVIDUAL_CLIENTS
      : type === "Corporate"
      ? CORPORATE_CLIENTS
      : type === "Center"
      ? CENTER_CLIENTS
      : PERSONS_CLIENTS;
  return list.find((c) => c.id === id);
}

// --------------------------------------------------- overview stats

export interface OverviewStat {
  direction: "increase" | "decrease";
  percent: number;
  period: string;
  label: string;
  value: string;
  icon: "user" | "building" | "center" | "persons" | "check" | "clock" | "ban" | "users";
}

function countByStatus(list: Client[], status: ClientStatus): number {
  return list.filter((client) => client.status === status).length;
}

function formatCount(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

export function getClientOverviewStats(type: ClientType): OverviewStat[] {
  const list =
    type === "Individual"
      ? INDIVIDUAL_CLIENTS
      : type === "Corporate"
      ? CORPORATE_CLIENTS
      : type === "Center"
      ? CENTER_CLIENTS
      : PERSONS_CLIENTS;

  const total = list.length;
  const active = countByStatus(list, "Active");
  const inactive = countByStatus(list, "Inactive");
  const suspended = countByStatus(list, "Suspended");

  if (type === "Corporate") {
    return [
      { direction: "increase", percent: 18, period: "Last month", label: "Total Corporate Clients", value: formatCount(total), icon: "building" },
      { direction: "increase", percent: 12, period: "Last month", label: "Active Corporate Accounts", value: formatCount(active), icon: "check" },
      { direction: "decrease", percent: 6, period: "Last month", label: "Pending Verification", value: formatCount(inactive), icon: "clock" },
      { direction: "decrease", percent: 4, period: "Last month", label: "Suspended Accounts", value: formatCount(suspended), icon: "ban" },
    ];
  }

  if (type === "Center") {
    const members = total * 32;
    const averageSize = Math.round(members / Math.max(total, 1));
    return [
      { direction: "increase", percent: 15, period: "Last month", label: "Total Centers", value: formatCount(total), icon: "center" },
      { direction: "increase", percent: 10, period: "Last month", label: "Active Centers", value: formatCount(active), icon: "check" },
      { direction: "increase", percent: 22, period: "Last month", label: "Total Members", value: formatCount(members), icon: "users" },
      { direction: "increase", percent: 8, period: "Last month", label: "Average Center Size", value: formatCount(averageSize), icon: "persons" },
    ];
  }

  if (type === "Persons") {
    const linked = Math.max(total - 1, 0);
    const unassigned = total - linked;
    return [
      { direction: "increase", percent: 16, period: "Last month", label: "Total Persons", value: formatCount(total), icon: "persons" },
      { direction: "increase", percent: 11, period: "Last month", label: "Active Persons", value: formatCount(active), icon: "check" },
      { direction: "increase", percent: 9, period: "Last month", label: "Linked Clients", value: formatCount(linked), icon: "users" },
      { direction: "decrease", percent: 5, period: "Last month", label: "Unassigned Persons", value: formatCount(unassigned), icon: "clock" },
    ];
  }

  return [
    { direction: "increase", percent: 20, period: "Last month", label: "Total Individual Clients", value: formatCount(total), icon: "user" },
    { direction: "increase", percent: 14, period: "Last month", label: "Active Clients", value: formatCount(active), icon: "check" },
    { direction: "decrease", percent: 7, period: "Last month", label: "Inactive Clients", value: formatCount(inactive), icon: "clock" },
    { direction: "decrease", percent: 3, period: "Last month", label: "Suspended Clients", value: formatCount(suspended), icon: "ban" },
  ];
}
