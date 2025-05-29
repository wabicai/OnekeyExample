// 统一的设备动作类型定义
export type DeviceActionType = "confirm" | "passphrase" | "inputPin";

// SDK UI事件到设备动作的映射
export const UI_EVENT_TO_ACTION_MAP: Record<string, DeviceActionType | 'close'> = {
  'ui-request_pin': 'inputPin',
  'ui-request_passphrase': 'passphrase', 
  'ui-request_button': 'confirm',
  'ui-close_window': 'close'
};

// SDK事件类型
export interface SDKUIEvent {
  type: string;
  payload?: unknown;
}

// 设备动作状态
export interface DeviceActionState {
  isActive: boolean;
  actionType: DeviceActionType | null;
  deviceInfo?: Record<string, unknown>;
  startTime?: number;
} 