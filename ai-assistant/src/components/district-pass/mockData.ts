import aiAssistantIcon from "../../assets/app-ai-assistant.svg";
import agentWalletIcon from "../../assets/app-agent-wallet.svg";
import prismIcon from "../../assets/app-prism.svg";

export interface ConnectedApp {
  id: string;
  name: string;
  /** Imported SVG asset URL. */
  icon: string;
  /** What the app can access via this District Pass. */
  scope: string;
  /** Human-readable "connected on" label. */
  connected: string;
}

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

/** Third-party entry has no bundled icon asset; ConnectedApps renders a fallback. */
export const CONNECTED_APPS: ConnectedApp[] = [
  {
    id: "ai-assistant",
    name: "AI Assistant",
    icon: aiAssistantIcon,
    scope: "Trade, swap & transfer execution",
    connected: "Connected Mar 2024",
  },
  {
    id: "agent-wallet",
    name: "Agent Wallet",
    icon: agentWalletIcon,
    scope: "Read balances & spending controls",
    connected: "Connected Apr 2024",
  },
  {
    id: "prism",
    name: "Prism Payment Gateway",
    icon: prismIcon,
    scope: "Initiate stablecoin payments",
    connected: "Connected Jun 2024",
  },
  {
    id: "ledgerlink",
    name: "LedgerLink (third-party)",
    icon: "",
    scope: "Read profile & email",
    connected: "Connected Jul 2024",
  },
];

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

export const PASS_ID = "FD · 4C7A · 9E21";
export const MEMBER_SINCE = "Member since 2024";
