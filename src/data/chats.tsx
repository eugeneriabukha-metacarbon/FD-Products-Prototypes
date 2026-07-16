import type * as React from "react";

/**
 * Simulated chat data. The first seed chat mirrors the scripted conversation
 * from Figma (node 488:227528); the rest reuse the recent-chats titles from
 * the same design with short canned exchanges.
 */

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  /** Plain-text content (user messages, simple replies). */
  text?: string;
  /** Rich formatted content (scripted assistant replies). */
  rich?: React.ReactNode;
}

export interface Chat {
  id: string;
  title: string;
  messages: ChatMessage[];
  /** Pinned chats surface in the separate "pinned chats" sidebar section. */
  pinned?: boolean;
}

let nextId = 0;
export function uid(prefix: string): string {
  nextId += 1;
  return `${prefix}-${nextId}`;
}

/** The scripted assistant reply from the Figma design, formatted. */
const capabilitiesReply = (
  <div className="flex flex-col gap-6">
    <p className="body-03">
      I can help in two main ways:{" "}
      <strong className="font-bold">
        explain Finance District’s products and help you actually use a wallet
        to do on-chain actions
      </strong>{" "}
      (check balances, move funds, swap, earn yield, etc.).
    </p>
    <div className="flex flex-col gap-4">
      <p className="body-01-medium">Primary things I can do for you</p>
      <div className="body-03 flex flex-col gap-4">
        <div>
          <ul className="list-disc pl-5">
            <li>
              <strong className="font-bold">
                Understand the Finance District ecosystem
              </strong>
              <ul className="list-disc pl-5">
                <li>
                  What Finance District is and how the pieces fit together:
                  Agent Wallet, PRISM payments, District Pass identity, and
                  Agent Key (permissions for agents).
                </li>
              </ul>
            </li>
          </ul>
        </div>
        <div>
          <ul className="list-disc pl-5">
            <li>
              <strong className="font-bold">Wallet operations (multi-chain)</strong>
              <ul className="list-disc pl-5">
                <li>View your wallet overview (accounts, balances, tokens across chains)</li>
                <li>Send payments / transfer tokens to any address (including ENS/SNS name resolution)</li>
                <li>Swap tokens with a pre-trade quote (price/route/slippage) and then execute only after you confirm</li>
                <li>Discover yield opportunities, deposit into a strategy, track positions, and withdraw</li>
                <li>Review transaction history for an account on a specific chain</li>
                <li>Sign messages (e.g., for login/auth flows)</li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
);

/** Titles from the Figma recent-chats list. */
const SEED_TITLES = [
  "Exploring Decentralized Finance: How Web3 is Revolutionizing Banking",
  "NFTs and Digital Ownership: The Future of Collectibles in Web3",
  "Building Trust: The Role of Smart Contracts in Web3 Transactions",
  "Decentralized Autonomous Organizations: The New Age of Business Governance",
  "Web3 and Privacy: How Blockchain Protects User Data",
  "Tokenomics: Understanding the Economics of Web3 Projects",
  "The Impact of Web3 on Supply Chain Transparency and Efficiency",
  "Gaming in Web3: How Blockchain is Changing the Gaming Landscape",
];

export function createSeedChats(): Chat[] {
  return [
    {
      id: uid("chat"),
      title: "Assistant Capabilities and Primary Features",
      messages: [
        {
          id: uid("msg"),
          role: "user",
          text: "How can you help me? What are your primary features?",
        },
        { id: uid("msg"), role: "assistant", rich: capabilitiesReply },
      ],
    },
    ...SEED_TITLES.map((title) => ({
      id: uid("chat"),
      title,
      messages: [
        { id: uid("msg"), role: "user" as const, text: `Tell me about: ${title}` },
        {
          id: uid("msg"),
          role: "assistant" as const,
          text: `Great topic! "${title}" touches the core of what Finance District is built around. Ask me anything specific — balances, swaps, yield strategies, or how the ecosystem pieces fit together — and I'll walk you through it step by step.`,
        },
      ],
    })),
  ];
}

/** Rotating canned replies for simulated conversations. */
export const CANNED_REPLIES = [
  "Here's what I found. Your portfolio is spread across 3 chains with the largest position in ETH (42%). Overall it's up 3.8% this week. Want me to break that down by asset, or look for rebalancing opportunities?",
  "Good question! In the Finance District ecosystem this runs through your Agent Wallet — I can prepare the transaction, show you a pre-trade quote with price, route and slippage, and execute only after you confirm. Nothing moves without your sign-off.",
  "I've analyzed the current market conditions. There are 4 staking opportunities matching your risk profile right now, with APYs from 4.2% to 11.6%. The most balanced option is a stablecoin strategy on mainnet. Want the full comparison?",
  "Done — I've prepared a summary. Two things stand out: your idle USDC balance could be earning yield, and one of your recurring payments could be automated with PRISM. Should I set either of those up for review?",
  "That's within my wheelhouse. I can resolve ENS/SNS names, check the destination address history, and estimate gas before you send anything. Give me the details and I'll prepare it for your confirmation.",
];

/** Derive a sidebar title from the first user message of a new chat. */
export function titleFromMessage(text: string): string {
  const firstLine = text.trim().split("\n")[0];
  return firstLine.length > 60 ? `${firstLine.slice(0, 57)}…` : firstLine;
}
