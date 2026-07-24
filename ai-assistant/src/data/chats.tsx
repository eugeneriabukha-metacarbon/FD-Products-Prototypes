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

/**
 * A long scripted DeFi exchange (17 turns, varied message lengths) seeded into
 * the "Exploring Decentralized Finance" chat so transcript scrolling can be
 * exercised with realistic content.
 */
const LONG_DEFI_EXCHANGE: { role: "user" | "assistant"; text: string }[] = [
  {
    role: "user",
    text: "What actually is DeFi, in one sentence?",
  },
  {
    role: "assistant",
    text: "Decentralized finance is a set of financial services — lending, trading, payments, savings — rebuilt as open software on public blockchains, so anyone can use them directly from a wallet without a bank or broker in the middle.",
  },
  {
    role: "user",
    text: "How is that different from my bank, practically?",
  },
  {
    role: "assistant",
    text: "Three practical differences. Custody: in DeFi you hold your own assets in your wallet, while a bank holds them on your behalf. Access: DeFi protocols run 24/7 with no account approval, minimum balance, or country restrictions. Transparency: every rate, fee, and reserve is on-chain and auditable in real time, whereas a bank publishes statements quarterly. The trade-off is responsibility — there's no fraud department to call if you sign a bad transaction.",
  },
  {
    role: "user",
    text: "Okay, walk me through what happens when I swap ETH for USDC.",
  },
  {
    role: "assistant",
    text: "When you ask me to swap, I first fetch a quote: the route (which pools the trade hops through), the expected output, the price impact, and the slippage tolerance. You review that quote — nothing is signed yet. On confirm, your Agent Wallet submits the transaction to an automated market maker, which is just a smart contract holding both tokens in a pool. The contract takes your ETH, returns USDC at the pool's current ratio, and the whole thing settles in one atomic transaction — either every step succeeds or the entire swap reverts. You'll see the executed price, gas cost, and the transaction hash in your history immediately after.",
  },
  {
    role: "user",
    text: "What's price impact vs slippage? I always mix them up.",
  },
  {
    role: "assistant",
    text: "Price impact is what YOUR trade does to the pool — a large order moves the ratio, so you get a slightly worse price the bigger you trade. Slippage is what happens BETWEEN quote and execution — other trades landing before yours shift the price. Impact is known upfront; slippage is a bound you set. If execution would exceed your tolerance, the transaction reverts instead of filling badly.",
  },
  {
    role: "user",
    text: "Where does yield actually come from in DeFi? It always sounded too good to be true.",
  },
  {
    role: "assistant",
    text: "Healthy skepticism — the sources matter. Sustainable yield comes from three places: trading fees (liquidity providers earn a cut of every swap in their pool), lending interest (borrowers pay to borrow your assets, usually over-collateralized), and staking rewards (you help secure a network and earn its issuance). Unsustainable yield comes from token emissions — protocols printing their own token to attract deposits. When an APY is dramatically above market, it's usually emissions, and it decays. I always label which source a strategy's yield comes from when I show you opportunities.",
  },
  {
    role: "user",
    text: "Show me what a conservative allocation would look like for $10k.",
  },
  {
    role: "assistant",
    text: "For a conservative profile I'd sketch: 60% in stablecoin lending markets (~4-5% APY, lowest volatility), 25% in ETH staking (~3.5% plus ETH exposure), 10% in a blue-chip liquidity pool like ETH/USDC (fee income, some impermanent loss risk), and 5% kept liquid for gas and opportunities. Expected blended yield lands around 4-6% with the bulk of the principal in the least volatile instruments. Want me to turn this into an actual set of positions you can review?",
  },
  {
    role: "user",
    text: "Not yet. What's impermanent loss?",
  },
  {
    role: "assistant",
    text: "It's the cost of providing liquidity to a pool when the two assets drift apart in price. The pool constantly rebalances you toward the underperformer — so if ETH doubles while you're in an ETH/USDC pool, you end up with less ETH and more USDC than if you had just held both. The \"loss\" is relative to holding; fees can offset it, and it's only locked in when you withdraw. Rule of thumb: volatile pairs earn higher fees precisely because this risk is bigger.",
  },
  {
    role: "user",
    text: "How do I not get rekt? Give me your honest risk checklist.",
  },
  {
    role: "assistant",
    text: "The honest list, in order of how often each one actually hurts people: 1) Signing transactions you don't understand — the #1 loss vector; read what I show you before confirming, and never sign blind approvals elsewhere. 2) Smart-contract risk — prefer audited, battle-tested protocols with years of history; I flag deployment age and audit status. 3) Stablecoin de-pegs — diversify across issuers, avoid exotic algorithmic designs. 4) Leverage — liquidation cascades turn corrections into wipeouts; conservative profiles shouldn't touch it. 5) Custody hygiene — hardware-backed keys, revoke stale approvals quarterly. 6) Emissions-chasing — if the APY needs a token you've never heard of to be real, it isn't. None of this is exotic; it's mostly discipline.",
  },
  {
    role: "user",
    text: "What are gas fees and why do they change so much?",
  },
  {
    role: "assistant",
    text: "Gas is the fee for block space — you're bidding for computation on a shared network. When lots of people transact at once (an NFT mint, a market crash), demand for space spikes and fees follow. Two practical notes: fees depend on transaction complexity (a swap costs more than a transfer), and layer-2 networks batch thousands of transactions to bring costs down to cents. I always show the gas estimate before you confirm anything.",
  },
  {
    role: "user",
    text: "Is any of this regulated? What happens if a protocol just disappears?",
  },
  {
    role: "assistant",
    text: "Regulation is jurisdiction-dependent and evolving — stablecoin issuers and fiat on-ramps are the most regulated pieces, while the protocols themselves are mostly just open software. A protocol can't really \"disappear\" — the contracts keep running as long as the chain does — but its team can abandon it, its token can collapse, and its front-end can go offline. That's why deployment age, treasury health, and whether funds are self-custodied matter more than marketing. Your assets in a lending market remain withdrawable even if the project's website vanishes, because withdrawal is a contract function, not a customer-service request.",
  },
  {
    role: "user",
    text: "What role does Finance District play in all of this?",
  },
  {
    role: "assistant",
    text: "Finance District is the layer that makes this usable: Agent Wallet holds your keys and executes on-chain actions across chains, PRISM handles payments and payment automation, District Pass is your identity and access layer, and Agent Key scopes what agents like me are allowed to do on your behalf. I can explain any product, or use them for you — quotes before trades, confirmation before execution, history after settlement.",
  },
  {
    role: "user",
    text: "Give me a 30-second recap of everything we covered.",
  },
  {
    role: "assistant",
    text: "Recap: DeFi is finance as open software — you custody your own assets and interact with transparent contracts instead of institutions. Swaps route through liquidity pools with quoted price impact and bounded slippage. Real yield comes from fees, lending interest, and staking; emissions-driven APYs decay. A conservative $10k splits roughly 60/25/10/5 across stablecoin lending, ETH staking, a blue-chip pool, and cash. Impermanent loss is the cost of pool rebalancing versus holding. The risk checklist is mostly discipline: understand what you sign, prefer battle-tested protocols, respect leverage, and keep your approvals clean. And Finance District is the tooling that lets you do all of it from one wallet, with me preparing everything for your confirmation.",
  },
  {
    role: "user",
    text: "Perfect. Next time let's actually set up that conservative allocation.",
  },
  {
    role: "assistant",
    text: "Deal — when you're ready, I'll pull live rates, prepare the positions to match your risk profile, and you'll confirm each step before anything moves. See you then.",
  },
];

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
    ...SEED_TITLES.map((title, index) => ({
      id: uid("chat"),
      title,
      messages:
        index === 0
          ? // The DeFi chat carries the long scripted exchange (scroll testing).
            LONG_DEFI_EXCHANGE.map((message) => ({
              id: uid("msg"),
              ...message,
            }))
          : [
              {
                id: uid("msg"),
                role: "user" as const,
                text: `Tell me about: ${title}`,
              },
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
