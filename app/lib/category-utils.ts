import type { MethodCategory } from "~/data/types";
import {
  InformationCircleIcon,
  ShieldCheckIcon,
  WrenchScrewdriverIcon,
  KeyIcon,
  DocumentTextIcon,
  CursorArrowRippleIcon,
} from "@heroicons/react/24/outline";

// 分类显示名称映射
export const CATEGORY_DISPLAY_NAMES: Record<MethodCategory, string> = {
  address: "地址",
  publicKey: "公钥",
  signing: "签名",
  transaction: "交易",
  message: "消息",
  device: "设备",
  info: "信息",
  security: "安全",
  management: "管理",
  basic: "基础",
  advanced: "高级",
};

// 分类图标映射
export const CATEGORY_ICONS = {
  address: InformationCircleIcon,
  publicKey: KeyIcon,
  transaction: DocumentTextIcon,
  signing: CursorArrowRippleIcon,
  device: InformationCircleIcon,
  info: InformationCircleIcon,
  security: ShieldCheckIcon,
  management: WrenchScrewdriverIcon,
  basic: InformationCircleIcon,
} as const;

// 分类颜色映射
export const CATEGORY_COLORS = {
  address: "text-blue-600 bg-blue-50 border-blue-200",
  publicKey: "text-green-600 bg-green-50 border-green-200",
  transaction: "text-orange-600 bg-orange-50 border-orange-200",
  signing: "text-red-600 bg-red-50 border-red-200",
  device: "text-gray-600 bg-gray-50 border-gray-200",
  info: "text-blue-600 bg-blue-50 border-blue-200",
  security: "text-green-600 bg-green-50 border-green-200",
  management: "text-orange-600 bg-orange-50 border-orange-200",
  basic: "text-gray-600 bg-gray-50 border-gray-200",
} as const;

/**
 * 获取分类的显示名称
 */
export function getCategoryDisplayName(category: MethodCategory): string {
  return CATEGORY_DISPLAY_NAMES[category] || category;
}

/**
 * 获取分类的图标组件
 */
export function getCategoryIcon(category: MethodCategory) {
  return CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS] || CATEGORY_ICONS.info;
}

/**
 * 获取分类的颜色样式
 */
export function getCategoryColor(category: MethodCategory): string {
  return CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS] || CATEGORY_COLORS.info;
} 