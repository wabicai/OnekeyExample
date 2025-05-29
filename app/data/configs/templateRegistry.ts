import type { ChainConfig, MethodConfig, MethodCategory, ChainCategory, RegistryStats, ParameterField, MethodPreset } from "../types";
import type { HardwareApiMethod } from "../../services/hardwareService";
import { CHAIN_METADATA } from "../methods/_chainMetadata";

// ===========================================
// 简化的配置注册表
// ===========================================

// 方法分类映射
const METHOD_CATEGORIES: Record<string, MethodCategory> = {
  "getaddress": "address",
  "address": "address",
  "getpublickey": "publicKey", 
  "publickey": "publicKey",
  "signmessage": "message",
  "signtypeddata": "message",
  "message": "message",
  "signtransaction": "transaction",
  "transaction": "transaction",
  "settings": "management",
  "reset": "management", 
  "wipe": "management",
  "update": "management",
  "changepin": "security",
  "verify": "security",
  "lock": "security",
  "cancel": "basic",
  "getinfo": "info",
  "supportfeatures": "info",
  "checkfirmware": "info",
  "checkbridge": "info",
  "checkbootloader": "info",
};

interface RawMethodData {
  method: string;
  description?: string;
  presupposes?: Array<{
    title: string;
    description?: string;
    value: Record<string, unknown>;
  }>;
}

class SimplifiedTemplateRegistry {
  private chains = new Map<string, ChainConfig>();
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;

    console.time("Registry Initialization");
    
    // 加载所有链配置
    await this.loadAllChains();

    this.initialized = true;
    console.timeEnd("Registry Initialization");
    console.log(`✅ Loaded ${this.chains.size} chains with configurations`);
  }

  private async loadAllChains(): Promise<void> {
    // 获取所有可用的链ID
    const chainIds = this.getAllChainIds();
    
    const loadPromises = chainIds.map(async (chainId) => {
      try {
        // 动态导入链配置文件
        const module = await import(/* @vite-ignore */ `../methods/${chainId}.ts`);
        const config = this.parseChainModule(chainId, module);
        
        if (config) {
          this.chains.set(chainId, config);
        }
      } catch (error) {
        console.warn(`Failed to load chain: ${chainId}`, error);
      }
    });

    await Promise.all(loadPromises);
  }

  private getAllChainIds(): string[] {
    // 使用元数据文件中的所有链ID
    return Object.keys(CHAIN_METADATA);
  }

  private parseChainModule(chainId: string, module: Record<string, unknown>): ChainConfig | null {
    // 尝试获取配置数据
    const moduleData = module as { chainConfig?: { api?: unknown[] }; api?: unknown[]; default?: unknown[] };
    const methodsData = moduleData.chainConfig?.api || moduleData.api || moduleData.default || [];
    
    if (!Array.isArray(methodsData) || methodsData.length === 0) {
      return null;
    }

    // 从元数据获取链信息
    const chainMeta = CHAIN_METADATA[chainId];
    if (!chainMeta) {
      console.warn(`No metadata found for chain: ${chainId}`);
      return null;
    }

    // 转换方法配置
    const methods = this.convertMethods(methodsData);
    
    return {
      id: chainMeta.id,
      name: chainMeta.name,
      description: chainMeta.description,
      icon: chainId, // 使用chainId作为图标标识符
      color: chainMeta.color,
      category: chainMeta.category,
      methods,
    };
  }

  private convertMethods(methodsData: unknown[]): MethodConfig[] {
    return methodsData
      .filter((item): item is RawMethodData => 
        item !== null && typeof item === "object" && !Array.isArray(item) && 
        typeof (item as Record<string, unknown>).method === "string"
      )
      .map(item => this.convertMethod(item));
  }

  private convertMethod(item: RawMethodData): MethodConfig {
    const parameters = this.extractParameters(item);
    const presets = this.extractPresets(item);

    return {
      method: item.method as HardwareApiMethod,
      name: this.formatMethodName(item.method),
      description: item.description || `Execute ${item.method} operation`,
      category: this.inferMethodCategory(item.method),
      dangerous: this.isDangerous(item.method),
      requiresConfirmation: this.requiresConfirmation(item.method),
      parameters,
      presets,
    };
  }

  private extractParameters(item: RawMethodData): ParameterField[] {
    // 基础通用参数
    const baseParameters: ParameterField[] = [
      {
        name: "useEmptyPassphrase",
        label: "useEmptyPassphrase",
        description: "允许创建空passPhrase钱包",
        type: "boolean",
        required: false,
        editable: true,
        visible: true,
        default: false,
      }
    ];

    // 如果没有预设，只返回基础参数
    if (!item.presupposes || item.presupposes.length === 0) {
      return baseParameters;
    }

    // 从所有预设中收集唯一的参数
    const paramMap = new Map<string, ParameterField>();
    
    // 添加基础参数
    baseParameters.forEach(param => {
      paramMap.set(param.name, param);
    });

    // 分析所有预设，提取方法参数
    item.presupposes.forEach(preset => {
      if (preset.value && typeof preset.value === "object") {
        Object.entries(preset.value).forEach(([key, value]) => {
          if (!paramMap.has(key)) {
            paramMap.set(key, this.createParameterField(key, value));
          }
        });
      }
    });

    return Array.from(paramMap.values());
  }

  private createParameterField(name: string, value: unknown): ParameterField {
    return {
      name,
      label: this.getParameterLabel(name),
      description: this.getParameterDescription(name),
      type: this.inferParameterType(value),
      required: this.isParameterRequired(name),
      editable: this.isParameterEditable(name),
      visible: this.isParameterVisible(name),
      default: value,
      placeholder: this.getParameterPlaceholder(name),
      options: this.getParameterOptions(name, value),
    };
  }

  private extractPresets(item: RawMethodData): MethodPreset[] | undefined {
    if (!item.presupposes || item.presupposes.length === 0) {
      return undefined;
    }

    return item.presupposes.map(preset => ({
      title: preset.title,
      description: preset.description,
      visibleFields: preset.value ? Object.keys(preset.value) : [],
      values: preset.value || {},
    }));
  }

  private formatMethodName(method: string): string {
    return method
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, str => str.toUpperCase())
      .trim();
  }

  private inferMethodCategory(method: string): MethodCategory {
    const methodLower = method.toLowerCase();
    for (const [keyword, category] of Object.entries(METHOD_CATEGORIES)) {
      if (methodLower.includes(keyword)) {
        return category;
      }
    }
    return "basic";
  }

  private isDangerous(method: string): boolean {
    const dangerousKeywords = ["wipe", "reset", "update", "bootloader"];
    const methodLower = method.toLowerCase();
    return dangerousKeywords.some(keyword => methodLower.includes(keyword));
  }

  private requiresConfirmation(method: string): boolean {
    const confirmationKeywords = ["settings", "changepin", "verify", "update"];
    const methodLower = method.toLowerCase();
    return confirmationKeywords.some(keyword => methodLower.includes(keyword));
  }

  private inferParameterType(value: unknown): "string" | "number" | "boolean" | "select" | "textarea" {
    if (typeof value === "boolean") return "boolean";
    if (typeof value === "number") return "number";
    if (Array.isArray(value)) return "select"; // 数组作为选项
    if (typeof value === "object" && value !== null) return "textarea"; // 对象用文本区域
    return "string";
  }

  private getParameterLabel(name: string): string {
    const labels: Record<string, string> = {
      path: "衍生路径",
      showOnOneKey: "设备显示",
      bundle: "批量操作",
      coin: "币种",
      network: "网络",
      prefix: "地址前缀",
      useEmptyPassphrase: "空passPhrase",
    };
    return labels[name] || name;
  }

  private getParameterDescription(name: string): string {
    const descriptions: Record<string, string> = {
      path: "HD钱包衍生路径",
      showOnOneKey: "在OneKey设备屏幕上显示",
      bundle: "批量操作参数",
      coin: "币种标识符",
      network: "网络类型",
      prefix: "地址前缀",
      useEmptyPassphrase: "允许创建空passPhrase钱包",
    };
    return descriptions[name] || `${name} 参数`;
  }

  private getParameterPlaceholder(name: string): string {
    const placeholders: Record<string, string> = {
      path: "m/44'/0'/0'/0/0",
      coin: "btc",
      network: "mainnet",
    };
    return placeholders[name] || `输入 ${this.getParameterLabel(name)}`;
  }

  private isParameterRequired(name: string): boolean {
    const requiredParams = ["path"];
    return requiredParams.includes(name);
  }

  private isParameterEditable(name: string): boolean {
    const nonEditableParams = ["bundle", "coin", "network", "prefix"];
    return !nonEditableParams.includes(name);
  }

  private isParameterVisible(name: string): boolean {
    const hiddenParams = ["bundle", "coin", "network", "prefix", "chainName", "scheme", "includePublicKey", "group", "hrp"];
    return !hiddenParams.includes(name);
  }

  private getParameterOptions(name: string, value: unknown): string[] | undefined {
    if (Array.isArray(value)) {
      return value.map(String);
    }
    return undefined;
  }

  // ===========================================
  // 公共API
  // ===========================================

  getAllChains(): ChainConfig[] {
    return Array.from(this.chains.values());
  }

  getChain(chainId: string): ChainConfig | undefined {
    return this.chains.get(chainId);
  }

  getChainMethods(chainId: string): MethodConfig[] {
    return this.chains.get(chainId)?.methods || [];
  }

  getAllMethods(): MethodConfig[] {
    return this.getAllChains().flatMap(chain => chain.methods);
  }

  getMethodsByCategory(category: MethodCategory): MethodConfig[] {
    return this.getAllMethods().filter(method => method.category === category);
  }

  getChainsByCategory(category: ChainCategory): ChainConfig[] {
    return this.getAllChains().filter(chain => chain.category === category);
  }

  searchMethods(query: string): MethodConfig[] {
    const queryLower = query.toLowerCase();
    return this.getAllMethods().filter(method => 
      method.name.toLowerCase().includes(queryLower) ||
      method.description.toLowerCase().includes(queryLower) ||
      method.method.toLowerCase().includes(queryLower)
    );
  }

  isReady(): boolean {
    return this.initialized;
  }

  getStats(): RegistryStats {
    const allMethods = this.getAllMethods();
    const allChains = this.getAllChains();

    const methodsByCategory: Record<MethodCategory, number> = {
      address: 0, publicKey: 0, signing: 0, transaction: 0, message: 0,
      device: 0, info: 0, security: 0, management: 0, basic: 0, advanced: 0
    };

    const chainsByCategory: Record<ChainCategory, number> = {
      bitcoin: 0, ethereum: 0, solana: 0, cosmos: 0, device: 0, basic: 0, experimental: 0, testnet: 0,
      cardano: 0, polkadot: 0, near: 0, aptos: 0, sui: 0, ton: 0, tron: 0, ripple: 0, stellar: 0,
      kaspa: 0, algorand: 0, filecoin: 0, neo: 0, nem: 0, nervos: 0, starcoin: 0, scdo: 0,
      dynex: 0, nexa: 0, nostr: 0, alephium: 0, benfen: 0, other: 0
    };

    allMethods.forEach(method => {
      methodsByCategory[method.category]++;
    });

    allChains.forEach(chain => {
      chainsByCategory[chain.category]++;
    });

    return {
      totalChains: allChains.length,
      totalMethods: allMethods.length,
      methodsByCategory,
      chainsByCategory,
    };
  }
}

export const templateRegistry = new SimplifiedTemplateRegistry(); 