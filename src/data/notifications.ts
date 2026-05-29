// Notifications mock data.
//
// The Figma spec groups items by recency: Today / Yesterday / Last 7 days.
// Each item has a single-letter avatar (initial), a name, a category
// ("New Comment · Design Team"), a body, and a timestamp.

export type NotificationGroup = "Today" | "Yesterday" | "Last 7 days";

export interface NotificationItem {
  id: string;
  initial: string;
  name: string;
  category: string; // e.g. "New Comment"
  source: string; // e.g. "Design Team"
  body: string;
  timestamp: string; // e.g. "2hr ago", "Oct 10"
  unread?: boolean;
}

export interface NotificationGroupData {
  group: NotificationGroup;
  items: NotificationItem[];
}

const SAMPLE_BODY =
  "Design a visually appealing and user-friendly landing page that effectively communicates key information, drives engagement, and encourages conversions based on the business goals.";

export const NOTIFICATIONS: NotificationGroupData[] = [
  {
    group: "Today",
    items: [
      {
        id: "today-1",
        initial: "N",
        name: "Nickolas Akpas",
        category: "New Comment",
        source: "Design Team",
        body: SAMPLE_BODY,
        timestamp: "2hr ago",
        unread: true,
      },
    ],
  },
  {
    group: "Yesterday",
    items: [
      {
        id: "yest-1",
        initial: "S",
        name: "Stephen Keshi",
        category: "New Comment",
        source: "Design Team",
        body: SAMPLE_BODY,
        timestamp: "Oct 10",
        unread: true,
      },
      {
        id: "yest-2",
        initial: "J",
        name: "Jessica Levi",
        category: "New Comment",
        source: "Design Team",
        body: SAMPLE_BODY,
        timestamp: "2hr ago",
        unread: true,
      },
      {
        id: "yest-3",
        initial: "L",
        name: "Lola Ademosu",
        category: "New Comment",
        source: "Design Team",
        body: SAMPLE_BODY,
        timestamp: "Oct 10",
      },
    ],
  },
  {
    group: "Last 7 days",
    items: [
      {
        id: "wk-1",
        initial: "S",
        name: "Stephen Keshi",
        category: "New Comment",
        source: "Design Team",
        body: SAMPLE_BODY,
        timestamp: "Oct 10",
      },
      {
        id: "wk-2",
        initial: "J",
        name: "Jessica Levi",
        category: "New Comment",
        source: "Design Team",
        body: SAMPLE_BODY,
        timestamp: "2hr ago",
      },
      {
        id: "wk-3",
        initial: "L",
        name: "Lola Ademosu",
        category: "New Comment",
        source: "Design Team",
        body: SAMPLE_BODY,
        timestamp: "Oct 10",
      },
    ],
  },
];

export const UNREAD_COUNT = NOTIFICATIONS.reduce(
  (n, g) => n + g.items.filter((i) => i.unread).length,
  0
);
