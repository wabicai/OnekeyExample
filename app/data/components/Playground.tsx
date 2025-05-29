// 这个文件提供 Playground 组件的类型定义，兼容 hardware-js-sdk 的数据结构

export interface PresupposeProps {
  title: string;
  value: unknown; // JSON object
}

export interface MethodPayload {
  method: string;
  noConnIdReq?: boolean;
  noDeviceIdReq?: boolean;
}

export type PlaygroundProps = {
  description: string;
  presupposes?: PresupposeProps[];
  deprecated?: boolean;
} & MethodPayload;
