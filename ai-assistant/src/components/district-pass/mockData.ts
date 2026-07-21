import aiAssistantIcon from "../../assets/app-ai-assistant.svg";
import agentWalletIcon from "../../assets/app-agent-wallet.svg";
import prismIcon from "../../assets/app-prism.svg";

export interface AgentAuthorization {
  id: string;
  name: string;
  /** Imported SVG asset URL. */
  icon: string;
  /** Allowed actions this agent may perform. */
  scope: string;
  /** Monthly spend cap, formatted, e.g. "$10,000". */
  spendCap: string;
  /** Spend used this period, formatted, e.g. "$3,200". */
  spendUsed: string;
  /** e.g. "No expiry" | "Expires 12 Aug 2026". */
  expires: string;
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

export const AGENTS: AgentAuthorization[] = [
  {
    id: "ai-assistant",
    name: "AI Assistant",
    icon: aiAssistantIcon,
    scope: "Trade, swap & transfer execution",
    spendCap: "$10,000",
    spendUsed: "$3,200",
    expires: "No expiry",
  },
  {
    id: "agent-wallet",
    name: "Agent Wallet",
    icon: agentWalletIcon,
    scope: "Autonomous payments & transfers",
    spendCap: "$2,500",
    spendUsed: "$980",
    expires: "Expires 12 Aug 2026",
  },
  {
    id: "prism",
    name: "Prism Payment Gateway",
    icon: prismIcon,
    scope: "Settle stablecoin invoices",
    spendCap: "$50,000",
    spendUsed: "$12,400",
    expires: "No expiry",
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
