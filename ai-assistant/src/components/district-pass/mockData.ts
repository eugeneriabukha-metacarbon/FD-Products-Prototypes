export type ActivityStatus = "success" | "failed";

export interface ActivityEvent {
  id: string;
  label: string;
  device: string;
  location: string;
  /** Human-readable relative/absolute time. */
  time: string;
  status: ActivityStatus;
}

/** Newest first. Includes a failed attempt from an unfamiliar location. */
export const ACTIVITY_EVENTS: ActivityEvent[] = [
  {
    id: "e1",
    label: "Signed in",
    device: "MacBook Pro · Chrome",
    location: "Tallinn, EE",
    time: "Today, 09:24",
    status: "success",
  },
  {
    id: "e2",
    label: "New device authorized",
    device: "iPhone 15 · FD app",
    location: "Tallinn, EE",
    time: "Yesterday, 18:02",
    status: "success",
  },
  {
    id: "e3",
    label: "Failed sign-in attempt",
    device: "Unknown · Firefox",
    location: "Lagos, NG",
    time: "Jul 19, 03:11",
    status: "failed",
  },
  {
    id: "e4",
    label: "Password changed",
    device: "MacBook Pro · Chrome",
    location: "Tallinn, EE",
    time: "Jul 15, 11:47",
    status: "success",
  },
  {
    id: "e5",
    label: "Signed in",
    device: "iPad Air · Safari",
    location: "Helsinki, FI",
    time: "Jul 12, 08:30",
    status: "success",
  },
  {
    id: "e6",
    label: "Signed in",
    device: "MacBook Pro · Chrome",
    location: "Tallinn, EE",
    time: "Jul 08, 14:15",
    status: "success",
  },
];

/** Shared so the profile card and the Security > Email row stay in sync. */
export const ACCOUNT_EMAIL = "janno.jaerv@example.com";

export interface Memory {
  id: string;
  /** The remembered fact, phrased like ChatGPT memories. */
  text: string;
  /** The chat it was learned from. */
  source: string;
  /** Human-readable save date. */
  savedOn: string;
}

/** Assistant memories, newest first — sources reference the mock chat titles. */
export const MEMORIES: Memory[] = [
  {
    id: "m1",
    text: "Prefers low-risk staking strategies over high-yield farming.",
    source: "Find staking opportunities",
    savedOn: "Jul 21, 2026",
  },
  {
    id: "m2",
    text: "Portfolio is focused on ETH and stablecoins.",
    source: "Analyze my portfolio",
    savedOn: "Jul 19, 2026",
  },
  {
    id: "m3",
    text: "Wants market data summarized in tables where possible.",
    source: "Assistant Capabilities and Primary Features",
    savedOn: "Jul 16, 2026",
  },
  {
    id: "m4",
    text: "Based in Tallinn, Estonia (EET timezone).",
    source: "Building Trust: The Role of Smart Contracts",
    savedOn: "Jul 14, 2026",
  },
  {
    id: "m5",
    text: "Interested in the tokenomics of early-stage Web3 projects.",
    source: "Tokenomics: Understanding the Economics of Web3 Projects",
    savedOn: "Jul 12, 2026",
  },
];

export type DeviceKind = "phone" | "laptop" | "desktop";

export interface DeviceSession {
  id: string;
  name: string;
  browser: string;
  location: string;
  /** Human-readable last-active time. */
  lastActive: string;
  kind: DeviceKind;
  /** The session this app is running in; "end all" keeps it. */
  current?: boolean;
}

/** Active signed-in sessions, most recent first. */
export const DEVICES: DeviceSession[] = [
  {
    id: "d1",
    name: "iPhone 17",
    browser: "Chrome",
    location: "Tallinn, EE",
    lastActive: "Today, 09:24",
    kind: "phone",
  },
  {
    id: "d2",
    name: "MacBook Pro (current session)",
    browser: "Chrome",
    location: "Tallinn, EE",
    lastActive: "Jul 19, 03:11",
    kind: "laptop",
    current: true,
  },
  {
    id: "d3",
    name: "iMac",
    browser: "Safari",
    location: "Tallinn, EE",
    lastActive: "Jul 15, 11:47",
    kind: "desktop",
  },
];
