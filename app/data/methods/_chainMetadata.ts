import type { ChainCategory } from "../types";

// 链元数据映射
export const CHAIN_METADATA: Record<
  string,
  {
    id: string;
    name: string;
    description: string;
    color: string;
    category: ChainCategory;
  }
> = {
  bitcoin: {
    id: "bitcoin",
    name: "Bitcoin",
    description: "Bitcoin blockchain operations",
    color: "#F7931A",
    category: "bitcoin",
  },
  ethereum: {
    id: "ethereum",
    name: "Ethereum",
    description: "Ethereum and EVM-compatible chains",
    color: "#627EEA",
    category: "ethereum",
  },
  solana: {
    id: "solana",
    name: "Solana",
    description: "Solana blockchain operations",
    color: "#9945FF",
    category: "solana",
  },
  cardano: {
    id: "cardano",
    name: "Cardano",
    description: "Cardano blockchain operations",
    color: "#0033AD",
    category: "cardano",
  },
  polkadot: {
    id: "polkadot",
    name: "Polkadot",
    description: "Polkadot ecosystem operations",
    color: "#E6007A",
    category: "polkadot",
  },
  device: {
    id: "device",
    name: "Device",
    description: "Device management operations",
    color: "#10B981",
    category: "device",
  },
  basic: {
    id: "basic",
    name: "Basic",
    description: "Basic operations",
    color: "#6B7280",
    category: "basic",
  },
  // 以太坊生态系
  conflux: {
    id: "conflux",
    name: "Conflux",
    description: "Conflux Network operations",
    color: "#00D4FF",
    category: "ethereum",
  },
  // Layer 1 区块链
  cosmos: {
    id: "cosmos",
    name: "Cosmos",
    description: "Cosmos ecosystem operations",
    color: "#6F7390",
    category: "cosmos",
  },
  near: {
    id: "near",
    name: "NEAR",
    description: "NEAR Protocol operations",
    color: "#00C08B",
    category: "near",
  },
  aptos: {
    id: "aptos",
    name: "Aptos",
    description: "Aptos blockchain operations",
    color: "#00C2FF",
    category: "aptos",
  },
  sui: {
    id: "sui",
    name: "Sui",
    description: "Sui blockchain operations",
    color: "#6FBCF0",
    category: "sui",
  },
  // 其他区块链
  ton: {
    id: "ton",
    name: "TON",
    description: "The Open Network operations",
    color: "#0088CC",
    category: "ton",
  },
  tron: {
    id: "tron",
    name: "Tron",
    description: "Tron blockchain operations",
    color: "#FF060A",
    category: "tron",
  },
  ripple: {
    id: "ripple",
    name: "XRP",
    description: "XRP Ledger operations",
    color: "#00D4FF",
    category: "ripple",
  },
  stellar: {
    id: "stellar",
    name: "Stellar",
    description: "Stellar network operations",
    color: "#7D00FF",
    category: "stellar",
  },
  // 比特币生态
  lightning: {
    id: "lightning",
    name: "Lightning",
    description: "Bitcoin Lightning Network operations",
    color: "#F7931A",
    category: "bitcoin",
  },
  kaspa: {
    id: "kaspa",
    name: "Kaspa",
    description: "Kaspa blockchain operations",
    color: "#70C7C7",
    category: "kaspa",
  },
  // 其他小众链
  algo: {
    id: "algo",
    name: "Algorand",
    description: "Algorand blockchain operations",
    color: "#000000",
    category: "algorand",
  },
  filecoin: {
    id: "filecoin",
    name: "Filecoin",
    description: "Filecoin network operations",
    color: "#0090FF",
    category: "filecoin",
  },
  neo: {
    id: "neo",
    name: "NEO",
    description: "NEO blockchain operations",
    color: "#00E599",
    category: "neo",
  },
  nem: {
    id: "nem",
    name: "NEM",
    description: "NEM blockchain operations",
    color: "#67B2E8",
    category: "nem",
  },
  // 其他特殊链
  nervos: {
    id: "nervos",
    name: "Nervos",
    description: "Nervos Network operations",
    color: "#3CC68A",
    category: "nervos",
  },
  starcoin: {
    id: "starcoin",
    name: "Starcoin",
    description: "Starcoin blockchain operations",
    color: "#4285F4",
    category: "starcoin",
  },
  scdo: {
    id: "scdo",
    name: "SCDO",
    description: "SCDO blockchain operations",
    color: "#FF6B6B",
    category: "scdo",
  },
  dynex: {
    id: "dynex",
    name: "Dynex",
    description: "Dynex blockchain operations",
    color: "#00CED1",
    category: "dynex",
  },
  nexa: {
    id: "nexa",
    name: "Nexa",
    description: "Nexa blockchain operations",
    color: "#00D2FF",
    category: "nexa",
  },
  nostr: {
    id: "nostr",
    name: "Nostr",
    description: "Nostr protocol operations",
    color: "#8B5CF6",
    category: "nostr",
  },
  alephium: {
    id: "alephium",
    name: "Alephium",
    description: "Alephium blockchain operations",
    color: "#FF6B35",
    category: "alephium",
  },
  // 多链和其他
  allnetwork: {
    id: "allnetwork",
    name: "All Networks",
    description: "Multi-chain operations",
    color: "#6366F1",
    category: "ethereum",
  },
  benfen: {
    id: "benfen",
    name: "Benfen",
    description: "Benfen blockchain operations",
    color: "#FF9500",
    category: "benfen",
  },
};
