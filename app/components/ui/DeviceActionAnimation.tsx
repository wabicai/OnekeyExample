import React from "react";
import Lottie from "lottie-react";

// 动效类型
export type AnimationType = "confirm" | "passphrase" | "inputPin";

// 设备型号
export type DeviceModel = "classic" | "mini" | "pro" | "touch";

// 主题类型（适用于Pro系列）
export type ThemeType = "light" | "dark";

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
  const [animationData, setAnimationData] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // 动态导入lottie动效文件
  const getAnimationData = React.useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      let animationFile = "";

      switch (action) {
        case "confirm":
          switch (deviceModel) {
            case "classic":
              animationFile = "/assets/animation/confirm-on-classic.json";
              break;
            case "mini":
              animationFile = "/assets/animation/confirm-on-mini.json";
              break;
            case "pro":
              animationFile = `/assets/animation/confirm-on-pro-${theme}.json`;
              break;
            case "touch":
              animationFile = "/assets/animation/confirm-on-touch.json";
              break;
          }
          break;

        case "passphrase":
          switch (deviceModel) {
            case "classic":
              animationFile =
                "/assets/animation/enter-passphrase-on-classic.json";
              break;
            case "mini":
              animationFile = "/assets/animation/enter-passphrase-on-mini.json";
              break;
            case "pro":
              animationFile = `/assets/animation/enter-passphrase-on-pro-${theme}.json`;
              break;
            case "touch":
              animationFile =
                "/assets/animation/enter-passphrase-on-touch.json";
              break;
          }
          break;

        case "inputPin":
          switch (deviceModel) {
            case "classic":
              animationFile = "/assets/animation/enter-pin-on-classic.json";
              break;
            case "mini":
              animationFile = "/assets/animation/enter-pin-on-mini.json";
              break;
            case "pro":
              animationFile = `/assets/animation/enter-pin-on-pro-${theme}.json`;
              break;
            case "touch":
              animationFile = "/assets/animation/enter-pin-on-touch.json";
              break;
          }
          break;
      }

      if (!animationFile) {
        throw new Error(
          `No animation file found for ${action} on ${deviceModel}`
        );
      }

      const response = await fetch(animationFile);
      if (!response.ok) {
        throw new Error(`Failed to load animation: ${response.statusText}`);
      }

      const data = await response.json();
      setAnimationData(data);
    } catch (error) {
      console.error("Failed to load animation:", error);
      setError(error instanceof Error ? error.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, [action, deviceModel, theme]);

  React.useEffect(() => {
    getAnimationData();
  }, [getAnimationData]);

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

  if (isLoading) {
    return (
      <div className={`flex flex-col items-center justify-center ${className}`}>
        <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin mb-2"></div>
        <p className="text-sm text-gray-600">加载动效中...</p>
      </div>
    );
  }

  if (error || !animationData) {
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
          {error && <p className="text-xs text-red-500 mt-2">动效加载失败</p>}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="w-full max-w-sm aspect-video overflow-hidden rounded-lg">
        <Lottie
          animationData={animationData}
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
