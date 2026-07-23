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
