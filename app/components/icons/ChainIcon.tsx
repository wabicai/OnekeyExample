import React from "react";
import { NetworkIcon } from "@web3icons/react"; // https://tokenicons.io/?type=network
import { useTemplateRegistry } from "~/hooks/useTemplateRegistry";

interface ChainIconProps {
  chainId: string;
  size?: number | string;
  variant?: "mono" | "branded";
  className?: string;
}

// 链ID到web3icons网络名称的映射
const CHAIN_ID_TO_WEB3ICONS: Record<string, string> = {
  bitcoin: "bitcoin",
  ethereum: "ethereum",
  solana: "solana",
  cardano: "cardano",
  polkadot: "polkadot",
  sui: "sui",
  near: "near-protocol",
  ton: "ton",
  aptos: "aptos",
  cosmos: "cosmos",
  tron: "tron",
  xrp: "xrp",
  ripple: "xrp",
  stellar: "stellar",
  kaspa: "kaspa",
  algo: "algorand",
  filecoin: "filecoin",
  neo: "neon-evm",
  conflux: "conflux",
  benfen: "benfen",
};

export const ChainIcon: React.FC<ChainIconProps> = ({
  chainId,
  size = 24,
  variant = "branded",
  className = "",
}) => {
  const { getChain } = useTemplateRegistry();
  const chainData = getChain(chainId);
  const web3IconsName = CHAIN_ID_TO_WEB3ICONS[chainId];
  console.log("icon", web3IconsName);
  console.log("icon", chainId);

  const FallbackIcon = () => {
    // 如果有默认图标名称，显示文字
    if (chainData?.icon) {
      return (
        <div
          className={`inline-flex items-center justify-center rounded ${className}`}
          style={{
            width: size,
            height: size,
            backgroundColor: chainData.color || "#6B7280",
          }}
        >
          <span className="text-white text-xs font-bold">
            {chainData.name.charAt(0).toUpperCase()}
          </span>
        </div>
      );
    }

    // 默认图标
    return (
      <div
        className={`inline-flex items-center justify-center rounded bg-gray-500 ${className}`}
        style={{ width: size, height: size }}
      >
        <span className="text-white text-xs font-bold">?</span>
      </div>
    );
  };

  // 优先尝试使用 web3icons
  if (web3IconsName) {
    return (
      <NetworkIcon
        name={web3IconsName}
        size={size}
        variant={variant}
        className={className}
        fallback={<FallbackIcon />}
      />
    );
  }

  // 如果没有对应的 web3icons 映射，直接使用回退图标
  return <FallbackIcon />;
};
