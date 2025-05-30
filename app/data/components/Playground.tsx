// 这个文件提供 Playground 组件的类型定义，兼容 hardware-js-sdk 的数据结构

import { HardwareApiMethod } from "~/services/hardwareService";

// 统一为与 types.ts 中的 MethodPreset 一致
export interface PresupposeProps {
  title: string;
  value: Record<string, unknown>;
}

export interface MethodPayload {
  method: HardwareApiMethod;
  noConnIdReq?: boolean;
  noDeviceIdReq?: boolean;
}

// 重命名为 presupposes 与 MethodConfig 保持一致
export type PlaygroundProps = {
  description: string;
  presupposes?: PresupposeProps[];
  deprecated?: boolean;
} & MethodPayload;
