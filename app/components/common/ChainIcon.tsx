import { NetworkIcon } from "@web3icons/react";
import { CreditCardIcon, SettingsIcon, ShieldIcon } from "lucide-react";

interface ChainIconProps {
  iconName: string;
  size?: number | string;
  className?: string;
  variant?: "mono" | "branded";
}

export function ChainIcon({
  iconName,
  size = 24,
  className = "",
  variant = "branded",
}: ChainIconProps) {
  // 设备相关图标使用 lucide-react
  if (iconName === "device") {
    return <CreditCardIcon size={size} className={className} />;
  }

  if (iconName === "settings") {
    return <SettingsIcon size={size} className={className} />;
  }

  if (iconName === "security") {
    return <ShieldIcon size={size} className={className} />;
  }

  // 区块链网络图标使用 web3icons
  try {
    return (
      <NetworkIcon
        name={iconName}
        size={size}
        variant={variant}
        className={className}
        fallback={<CreditCardIcon size={size} className={className} />}
      />
    );
  } catch (error) {
    console.warn(`Failed to load icon for ${iconName}:`, error);
    return <CreditCardIcon size={size} className={className} />;
  }
}
