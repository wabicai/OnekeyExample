import type { HardwareApiMethod } from "~/services/hardwareService";

// 核心参数字段类型
export interface ParameterField {
  name: string;
  type: "string" | "number" | "boolean" | "select" | "textarea";
  required?: boolean;
  default?: unknown;
  placeholder?: string;
  options?: string[];
  description: string;
  label?: string;
  visible?: boolean;
  editable?: boolean;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

export interface MethodPreset {
  title: string;
  description?: string;
  values: Record<string, unknown>;
  visibleFields?: string[];
}

export interface MethodConfig {
  method: HardwareApiMethod;
  name: string;
  description: string;
  category: MethodCategory;
  parameters: ParameterField[];
  presets?: MethodPreset[];
  dangerous?: boolean;
  requiresConfirmation?: boolean;
}

export interface ChainConfig {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  category: ChainCategory;
  methods: MethodConfig[];
}

// 分类类型
export type MethodCategory =
  | "address"
  | "publicKey"
  | "signing"
  | "transaction"
  | "device"
  | "info"
  | "basic"
  | "management"
  | "security"
  | "message"
  | "advanced";

export type ChainCategory =
  // | "device"
  // | "basic"
  | "bitcoin"
  | "ethereum"
  | "solana"
  | "cardano"
  | "polkadot"
  | "sui"
  | "aptos"
  | "near"
  | "ton"
  | "cosmos"
  | "tron"
  | "xrp"
  | "stellar"
  | "neo"
  | "nem"
  | "kaspa"
  | "algorand"
  | "filecoin"
  | "nervos"
  | "starcoin"
  | "scdo"
  | "dynex"
  | "nexa"
  | "alephium"
  | "conflux"
  | "nostr"
  | "lightning"
  | "benfen"
  | "all-network";

// 执行相关类型
export type ExecutionStatus =
  | "idle"
  | "loading"
  | "device-interaction"
  | "success"
  | "error";

export interface ExecutionResult {
  success: boolean;
  data?: unknown;
  error?: string;
  duration?: number;
}

export interface LogEntry {
  id: string;
  timestamp: number;
  type: "request" | "response" | "error" | "info";
  method?: string;
  content: string;
  data?: unknown;
  duration?: number;
}

// 注册表统计类型
export interface RegistryStats {
  totalChains: number;
  totalMethods: number;
  methodsByCategory: Record<MethodCategory, number>;
  chainsByCategory: Record<ChainCategory, number>;
}
