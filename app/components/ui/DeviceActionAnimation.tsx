import React from "react";
import Lottie from "lottie-react";
import confirmOnClassic from "../../assets/animation/confirm-on-classic.json";
import confirmOnMini from "../../assets/animation/confirm-on-mini.json";
import confirmOnProLight from "../../assets/animation/confirm-on-pro-light.json";
import confirmOnProDark from "../../assets/animation/confirm-on-pro-dark.json";
import confirmOnTouch from "../../assets/animation/confirm-on-touch.json";
import enterPassphraseOnClassic from "../../assets/animation/enter-passphrase-on-classic.json";
import enterPassphraseOnMini from "../../assets/animation/enter-passphrase-on-mini.json";
import enterPassphraseOnProLight from "../../assets/animation/enter-passphrase-on-pro-light.json";
import enterPassphraseOnProDark from "../../assets/animation/enter-passphrase-on-pro-dark.json";
import enterPassphraseOnTouch from "../../assets/animation/enter-passphrase-on-touch.json";
import enterPinOnClassic from "../../assets/animation/enter-pin-on-classic.json";
import enterPinOnMini from "../../assets/animation/enter-pin-on-mini.json";
import enterPinOnProLight from "../../assets/animation/enter-pin-on-pro-light.json";
import enterPinOnProDark from "../../assets/animation/enter-pin-on-pro-dark.json";
import enterPinOnTouch from "../../assets/animation/enter-pin-on-touch.json";

// 动效类型
export type AnimationType = "confirm" | "passphrase" | "inputPin";

// 设备型号
export type DeviceModel = "classic" | "mini" | "pro" | "touch";

// 主题类型（适用于Pro系列）
export type ThemeType = "light" | "dark";

// Lottie动画数据类型
type LottieAnimationData = Record<string, any>;

interface DeviceActionAnimationProps {
  action: AnimationType;
  deviceModel: DeviceModel;
  theme?: ThemeType; // 仅Pro系列需要
  loop?: boolean;
  autoplay?: boolean;
  className?: string;
  onComplete?: () => void;
}

const DeviceActionAnimation: React.FC<DeviceActionAnimationProps> = ({
  action,
  deviceModel,
  theme = "light",
  loop = true,
  autoplay = true,
  className = "",
  onComplete,
}) => {
  // 获取对应的动画数据
  const getAnimationData = (): LottieAnimationData | null => {
    switch (action) {
      case "confirm":
        switch (deviceModel) {
          case "classic":
            return confirmOnClassic;
          case "mini":
            return confirmOnMini;
          case "pro":
            return theme === "light" ? confirmOnProLight : confirmOnProDark;
          case "touch":
            return confirmOnTouch;
        }
        break;

      case "passphrase":
        switch (deviceModel) {
          case "classic":
            return enterPassphraseOnClassic;
          case "mini":
            return enterPassphraseOnMini;
          case "pro":
            return theme === "light"
              ? enterPassphraseOnProLight
              : enterPassphraseOnProDark;
          case "touch":
            return enterPassphraseOnTouch;
        }
        break;

      case "inputPin":
        switch (deviceModel) {
          case "classic":
            return enterPinOnClassic;
          case "mini":
            return enterPinOnMini;
          case "pro":
            return theme === "light" ? enterPinOnProLight : enterPinOnProDark;
          case "touch":
            return enterPinOnTouch;
        }
        break;
    }
    return null;
  };

  // 获取动效描述文本
  const getActionDescription = () => {
    switch (action) {
      case "confirm":
        return "请在设备上确认操作";
      case "passphrase":
        return "请在设备上输入密语";
      case "inputPin":
        return "请在设备上输入PIN码";
      default:
        return "请在设备上操作";
    }
  };

  // 获取设备名称
  const getDeviceName = () => {
    switch (deviceModel) {
      case "classic":
        return "OneKey Classic";
      case "mini":
        return "OneKey Mini";
      case "pro":
        return "OneKey Pro";
      case "touch":
        return "OneKey Touch";
      default:
        return "OneKey Device";
    }
  };

  if (!getAnimationData()) {
    return (
      <div className={`flex flex-col items-center justify-center ${className}`}>
        <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
          <div className="text-gray-400 text-2xl">📱</div>
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-gray-900 mb-1">
            {getDeviceName()}
          </p>
          <p className="text-xs text-gray-600">{getActionDescription()}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="w-full max-w-sm aspect-video overflow-hidden rounded-lg">
        <Lottie
          animationData={getAnimationData()}
          loop={loop}
          autoplay={autoplay}
          onComplete={onComplete}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
          }}
        />
      </div>
      <div className="text-center mt-4">
        <p className="text-sm font-medium text-gray-900 mb-1">
          {getDeviceName()}
        </p>
        <p className="text-xs text-gray-600">{getActionDescription()}</p>
      </div>
    </div>
  );
};

export default DeviceActionAnimation;
