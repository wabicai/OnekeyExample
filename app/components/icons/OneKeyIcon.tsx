import React from "react";

interface OneKeyIconProps {
  className?: string;
}

export const OneKeyIcon: React.FC<OneKeyIconProps> = ({ className }) => {
  return (
    <div
      className={`w-8 h-8  from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg ${className}`}
    >
      <span className="text-white font-bold text-sm">1</span>
    </div>
  );
};
