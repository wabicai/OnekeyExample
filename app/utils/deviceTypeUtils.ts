import type { IDeviceType } from "@onekeyfe/hd-core";
import { EDeviceType } from '@onekeyfe/hd-shared';

/**
 * 检查是否为Classic系列设备 (包括 Classic、Classic1s、ClassicPure)
 * 使用SDK提供的EDeviceType枚举进行精确匹配
 */
export function isClassicModelDevice(deviceType: IDeviceType | undefined): boolean {
  if (!deviceType) return false;
  return deviceType === EDeviceType.Classic || 
         deviceType === EDeviceType.Classic1s ||
         deviceType === EDeviceType.ClassicPure ||
         deviceType === EDeviceType.Mini
}

/**
 * 检查是否为Pro设备
 */
export function isTouchModelDevice(deviceType: IDeviceType | undefined): boolean {
  if (!deviceType) return false;
  return deviceType === EDeviceType.Touch ||
         deviceType === EDeviceType.Pro;
}
/**
 * 获取设备图片路径
 * 基于设备类型返回对应的图片路径
 */
export function getDeviceImagePath(deviceType: IDeviceType | undefined): string {
  if (!deviceType) return "/assets/deviceMockup/pro-black.png";
  
  switch (deviceType) {
    case EDeviceType.Classic:
    case EDeviceType.Classic1s:
    case EDeviceType.ClassicPure:
      return "/assets/deviceMockup/classic1s.png";
    case EDeviceType.Mini:
      return "/assets/deviceMockup/mini.png";
    case EDeviceType.Pro:
      return "/assets/deviceMockup/pro-black.png";
    case EDeviceType.Touch:
      return "/assets/deviceMockup/touch.png";
    case EDeviceType.Unknown:
    default:
      return "/assets/deviceMockup/pro-black.png";
  }
}