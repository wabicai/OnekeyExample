import React from "react";

interface DeviceIconProps {
  deviceType?: string;
  size?: number;
  className?: string;
}

// 设备类型映射到图片路径
const deviceImageMap: Record<string, string> = {
  touch: "/assets/deviceMockup/touch.png",
  pro: "/assets/deviceMockup/pro-black.png",
  "pro-white": "/assets/deviceMockup/pro-white.png",
  mini: "/assets/deviceMockup/mini.png",
  pure: "/assets/deviceMockup/pure.png",
  classic1s: "/assets/deviceMockup/classic1s.png",
  default: "/assets/deviceMockup/pro-black.png",
};

export const DeviceIcon: React.FC<DeviceIconProps> = ({
  deviceType = "default",
  size = 64,
  className = "",
}) => {
  const imagePath = deviceImageMap[deviceType] || deviceImageMap.default;

  return (
    <img
      src={imagePath}
      alt={`OneKey ${deviceType}`}
      width={size}
      height={size}
      className={`object-contain ${className}`}
      style={{ width: size, height: size }}
    />
  );
};

export default DeviceIcon;
