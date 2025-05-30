import { useState, useEffect, useCallback } from "react";
import type {
  ChainConfig,
  MethodConfig,
  MethodCategory,
  ChainCategory,
  ParameterField,
  MethodPreset,
} from "~/data/types";
import type { HardwareApiMethod } from "~/services/hardwareService";

// 简化的注册表状态
interface RegistryStats {
  totalChains: number;
  totalMethods: number;
  methodsByCategory: Record<MethodCategory, number>;
  chainsByCategory: Record<ChainCategory, number>;
}

interface PlaygroundProps {
  method: string;
  description: string;
  presupposes?: Array<{
    title: string;
    value: Record<string, unknown>;
  }>;
}

interface ChainMeta {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  category: ChainCategory;
}

// 数据转换适配器
function convertPlaygroundPropsToMethodConfig(
  props: PlaygroundProps
): MethodConfig {
  // 推断方法分类
  let category: MethodCategory = "basic";
  const method = props.method.toLowerCase();

  if (method.includes("address")) category = "address";
  else if (method.includes("publickey")) category = "publicKey";
  else if (method.includes("sign")) category = "signing";
  else if (method.includes("transaction")) category = "transaction";
  else if (method.includes("device")) category = "device";
  else if (method.includes("info") || method.includes("get")) category = "info";

  // 提取参数
  const parameters: ParameterField[] = [];
  const presets: MethodPreset[] = [];

  // 从预设中提取参数和预设配置
  if (props.presupposes) {
    const allKeys = new Set<string>();
    props.presupposes.forEach((preset) => {
      Object.keys(preset.value).forEach((key) => allKeys.add(key));
    });

    // 生成方法参数
    allKeys.forEach((key) => {
      const sampleValue = props.presupposes![0].value[key];
      let type: ParameterField["type"] = "string";

      if (typeof sampleValue === "boolean") type = "boolean";
      else if (typeof sampleValue === "number") type = "number";
      else if (Array.isArray(sampleValue)) type = "textarea";

      parameters.push({
        name: key,
        type,
        required: false,
        description: `Parameter: ${key}`,
        default: sampleValue,
        label: key,
        visible: true,
        editable: true,
      });
    });

    // 生成预设配置
    props.presupposes.forEach((preset) => {
      presets.push({
        title: preset.title,
        values: preset.value,
      });
    });
  }

  return {
    method: props.method as HardwareApiMethod,
    name: props.method.replace(/([A-Z])/g, " $1").trim(),
    description: props.description,
    category,
    parameters,
    presets,
  };
}

// 模板注册表类
class TemplateRegistry {
  private chains: ChainConfig[] = [];
  private ready = false;

  async initialize(): Promise<void> {
    try {
      // 动态导入所有链配置
      const chainImports = [
        // 主要区块链
        { module: import("~/data/methods/bitcoin"), id: "bitcoin" },
        { module: import("~/data/methods/ethereum"), id: "ethereum" },
        { module: import("~/data/methods/solana"), id: "solana" },
        { module: import("~/data/methods/cardano"), id: "cardano" },
        { module: import("~/data/methods/polkadot"), id: "polkadot" },

        { module: import("~/data/methods/sui"), id: "sui" },
        { module: import("~/data/methods/aptos"), id: "aptos" },
        { module: import("~/data/methods/near"), id: "near" },
        { module: import("~/data/methods/ton"), id: "ton" },
        { module: import("~/data/methods/cosmos"), id: "cosmos" },

        { module: import("~/data/methods/tron"), id: "tron" },
        { module: import("~/data/methods/xrp"), id: "ripple" },
        { module: import("~/data/methods/stellar"), id: "stellar" },
        { module: import("~/data/methods/neo"), id: "neo" },
        { module: import("~/data/methods/nem"), id: "nem" },

        { module: import("~/data/methods/kaspa"), id: "kaspa" },
        { module: import("~/data/methods/algorand"), id: "algorand" },
        { module: import("~/data/methods/filecoin"), id: "filecoin" },
        { module: import("~/data/methods/nervos"), id: "nervos" },
        { module: import("~/data/methods/starcoin"), id: "starcoin" },
        { module: import("~/data/methods/scdo"), id: "scdo" },
        { module: import("~/data/methods/dynex"), id: "dynex" },
        { module: import("~/data/methods/nexa"), id: "nexa" },
        { module: import("~/data/methods/alephium"), id: "alephium" },
        { module: import("~/data/methods/conflux"), id: "conflux" },
        { module: import("~/data/methods/nostr"), id: "nostr" },

        { module: import("~/data/methods/lightning"), id: "lightning" },
        { module: import("~/data/methods/allnetwork"), id: "allnetwork" },

        { module: import("~/data/methods/benfen"), id: "benfen" },

        { module: import("~/data/methods/device"), id: "device" },
        { module: import("~/data/methods/basic"), id: "basic" },
      ];

      const chainModules = await Promise.all(
        chainImports.map(async ({ module, id }) => {
          try {
            const moduleData = await module;
            const api = moduleData.default as PlaygroundProps[];
            const chainMeta = moduleData.chainMeta as ChainMeta;

            if (!api || !chainMeta) return null;

            const methods = api.map(convertPlaygroundPropsToMethodConfig);

            return {
              id: chainMeta.id,
              name: chainMeta.name,
              description: chainMeta.description,
              icon: chainMeta.icon,
              color: chainMeta.color,
              category: chainMeta.category,
              methods,
            } as ChainConfig;
          } catch (error) {
            console.warn(`Failed to load chain ${id}:`, error);
            return null;
          }
        })
      );

      // 过滤掉加载失败的链
      this.chains = chainModules.filter(Boolean) as ChainConfig[];
      this.ready = true;
    } catch (error) {
      console.error("Failed to initialize template registry:", error);
      throw error;
    }
  }

  isReady(): boolean {
    return this.ready;
  }

  getAllChains(): ChainConfig[] {
    return [...this.chains];
  }

  getAllMethods(): MethodConfig[] {
    return this.chains.flatMap((chain) => chain.methods);
  }

  getChain(chainId: string): ChainConfig | undefined {
    return this.chains.find((chain) => chain.id === chainId);
  }

  getChainMethods(chainId: string): MethodConfig[] {
    const chain = this.getChain(chainId);
    return chain ? chain.methods : [];
  }

  getMethodsByCategory(category: MethodCategory): MethodConfig[] {
    return this.getAllMethods().filter(
      (method) => method.category === category
    );
  }

  getChainsByCategory(category: ChainCategory): ChainConfig[] {
    return this.chains.filter((chain) => chain.category === category);
  }

  searchMethods(query: string): MethodConfig[] {
    const searchTerm = query.toLowerCase();
    return this.getAllMethods().filter(
      (method) =>
        method.name.toLowerCase().includes(searchTerm) ||
        method.description.toLowerCase().includes(searchTerm) ||
        method.method.toLowerCase().includes(searchTerm)
    );
  }

  getStats(): RegistryStats {
    const allMethods = this.getAllMethods();

    const methodsByCategory = {} as Record<MethodCategory, number>;
    const chainsByCategory = {} as Record<ChainCategory, number>;

    // 统计方法分类
    allMethods.forEach((method) => {
      methodsByCategory[method.category] =
        (methodsByCategory[method.category] || 0) + 1;
    });

    // 统计链分类
    this.chains.forEach((chain) => {
      chainsByCategory[chain.category] =
        (chainsByCategory[chain.category] || 0) + 1;
    });

    return {
      totalChains: this.chains.length,
      totalMethods: allMethods.length,
      methodsByCategory,
      chainsByCategory,
    };
  }
}

// 全局注册表实例
const templateRegistry = new TemplateRegistry();

// Hook
export function useTemplateRegistry() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  const initializeRegistry = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      await templateRegistry.initialize();
      setIsReady(true);
    } catch (err) {
      console.error("Failed to initialize template registry:", err);
      setError(err instanceof Error ? err.message : "初始化失败");
      setIsReady(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    initializeRegistry();
  }, [initializeRegistry]);

  const refreshTemplates = useCallback(async () => {
    await initializeRegistry();
  }, [initializeRegistry]);

  return {
    // 数据
    chains: isReady ? templateRegistry.getAllChains() : [],
    allMethods: isReady ? templateRegistry.getAllMethods() : [],

    // 查询方法
    getChain: useCallback(
      (chainId: string) => templateRegistry.getChain(chainId),
      [isReady]
    ),
    getChainMethods: useCallback(
      (chainId: string) => templateRegistry.getChainMethods(chainId),
      [isReady]
    ),
    getMethodsByCategory: useCallback(
      (category: MethodCategory) =>
        templateRegistry.getMethodsByCategory(category),
      [isReady]
    ),
    getChainsByCategory: useCallback(
      (category: ChainCategory) =>
        templateRegistry.getChainsByCategory(category),
      [isReady]
    ),
    searchMethods: useCallback(
      (query: string) => templateRegistry.searchMethods(query),
      [isReady]
    ),
    getStats: useCallback(() => templateRegistry.getStats(), [isReady]),

    // 状态
    isLoading,
    error,
    isReady: isReady && templateRegistry.isReady(),

    // 工具
    refreshTemplates,
  };
}
