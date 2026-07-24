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

/** Newest first — 20 events (two pagination pages), ending at account
 *  creation. Includes failed attempts from unfamiliar locations. */
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
    label: "Signed in",
    device: "iPhone 15 · FD app",
    location: "Tallinn, EE",
    time: "Yesterday, 08:15",
    status: "success",
  },
  {
    id: "e4",
    label: "Failed sign-in attempt",
    device: "Unknown · Firefox",
    location: "Lagos, NG",
    time: "Jul 19, 03:11",
    status: "failed",
  },
  {
    id: "e5",
    label: "Password changed",
    device: "MacBook Pro · Chrome",
    location: "Tallinn, EE",
    time: "Jul 15, 11:47",
    status: "success",
  },
  {
    id: "e6",
    label: "Signed in",
    device: "iPad Air · Safari",
    location: "Helsinki, FI",
    time: "Jul 12, 08:30",
    status: "success",
  },
  {
    id: "e7",
    label: "Signed in",
    device: "MacBook Pro · Chrome",
    location: "Tallinn, EE",
    time: "Jul 08, 14:15",
    status: "success",
  },
  {
    id: "e8",
    label: "Email change requested",
    device: "MacBook Pro · Chrome",
    location: "Tallinn, EE",
    time: "Jul 05, 10:02",
    status: "success",
  },
  {
    id: "e9",
    label: "Failed sign-in attempt",
    device: "Unknown · Chrome",
    location: "São Paulo, BR",
    time: "Jul 02, 23:40",
    status: "failed",
  },
  {
    id: "e10",
    label: "Signed in",
    device: "MacBook Pro · Chrome",
    location: "Tallinn, EE",
    time: "Jun 30, 09:12",
    status: "success",
  },
  {
    id: "e11",
    label: "Session ended",
    device: "iPad Air · Safari",
    location: "Helsinki, FI",
    time: "Jun 27, 17:55",
    status: "success",
  },
  {
    id: "e12",
    label: "Signed in",
    device: "iPhone 15 · FD app",
    location: "Riga, LV",
    time: "Jun 24, 12:08",
    status: "success",
  },
  {
    id: "e13",
    label: "Two-factor code verified",
    device: "iPhone 15 · FD app",
    location: "Tallinn, EE",
    time: "Jun 20, 08:47",
    status: "success",
  },
  {
    id: "e14",
    label: "Signed in",
    device: "MacBook Pro · Chrome",
    location: "Tallinn, EE",
    time: "Jun 18, 09:03",
    status: "success",
  },
  {
    id: "e15",
    label: "Failed sign-in attempt",
    device: "Unknown · Safari",
    location: "Singapore, SG",
    time: "Jun 14, 04:26",
    status: "failed",
  },
  {
    id: "e16",
    label: "Recovery email verified",
    device: "MacBook Pro · Chrome",
    location: "Tallinn, EE",
    time: "Jun 10, 15:31",
    status: "success",
  },
  {
    id: "e17",
    label: "Signed in",
    device: "Windows PC · Edge",
    location: "Tartu, EE",
    time: "Jun 07, 19:44",
    status: "success",
  },
  {
    id: "e18",
    label: "New device authorized",
    device: "Windows PC · Edge",
    location: "Tartu, EE",
    time: "Jun 07, 19:42",
    status: "success",
  },
  {
    id: "e19",
    label: "Signed in",
    device: "MacBook Pro · Chrome",
    location: "Tallinn, EE",
    time: "Jun 03, 08:58",
    status: "success",
  },
  {
    id: "e20",
    label: "Account created",
    device: "MacBook Pro · Chrome",
    location: "Tallinn, EE",
    time: "May 30, 16:20",
    status: "success",
  },
];

/** Shared so the profile card and the Security > Email row stay in sync. */
export const ACCOUNT_EMAIL = "janno.jaerv@example.com";

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
