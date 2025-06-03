import React, { useEffect, useRef } from "react";
import SDK from "@onekeyfe/hd-web-sdk";
import { ConnectSettings, CoreApi } from "@onekeyfe/hd-core";
import { useDeviceStore } from "../../store/deviceStore";
import { useHardwareStore } from "../../store/hardwareStore";
import { SDKContext } from "../../hooks/useSDK";
import {
  setSDKInstanceGetter,
  submitPin,
  submitPassphrase,
} from "../../services/hardwareService";
import {
  UI_EVENT_TO_ACTION_MAP,
  type DeviceActionType,
  type SDKUIEvent,
} from "../../types/events";
import { EDeviceType } from "@onekeyfe/hd-shared";
import GlobalDialogManager from "../global/GlobalDialogManager";

// 声明全局弹窗管理器类型
declare global {
  interface Window {
    globalDialogManager?: {
      showPinDialog: () => void;
      showPassphraseDialog: () => void;
      closeAllDialogs: () => void;
    };
  }
}

const { HardwareWebSdk } = SDK;

interface SDKProviderProps {
  children: React.ReactNode;
}

// SDK单例管理
let sdkInstance: CoreApi | null = null;
let sdkInitPromise: Promise<CoreApi> | null = null;

export const SDKProvider: React.FC<SDKProviderProps> = ({ children }) => {
  const { setDeviceAction, clearDeviceAction, updateSdkInitState } =
    useDeviceStore();

  const initializationRef = useRef<boolean>(false);

  // 获取SDK实例 - 单例模式
  const getSDKInstance = async (): Promise<CoreApi> => {
    if (sdkInstance) {
      return sdkInstance;
    }

    if (sdkInitPromise) {
      return sdkInitPromise;
    }

    sdkInitPromise = initializeSDKCore();

    try {
      const instance = await sdkInitPromise;
      return instance;
    } catch (error) {
      sdkInitPromise = null;
      throw error;
    }
  };

  // 注入SDK实例获取函数到hardwareService
  useEffect(() => {
    setSDKInstanceGetter(getSDKInstance);
  }, []);

  // 设置SDK事件监听器
  const setupSDKEventListeners = (sdk: CoreApi) => {
    console.log("[SDKProvider] 🔧 开始设置SDK事件监听器");

    // 监听SDK UI事件
    sdk.on("UI_EVENT", (message: SDKUIEvent) => {
      console.log("[SDKProvider] 🎯 收到UI事件:", message);

      const latestCurrentDevice = useDeviceStore.getState().currentDevice;
      console.log("[SDKProvider] 📱 当前设备信息:", latestCurrentDevice);

      // 处理设备动作状态
      const actionType = UI_EVENT_TO_ACTION_MAP[message.type];
      if (actionType === "close") {
        clearDeviceAction();
      } else if (actionType) {
        setDeviceAction({
          isActive: true,
          actionType: actionType as DeviceActionType,
          deviceInfo: message.payload as Record<string, unknown>,
          startTime: Date.now(),
        });
      }

      // 直接处理UI事件，显示相应的弹窗
      switch (message.type) {
        case "ui-request_pin":
          console.log("[SDKProvider] 📱 处理PIN输入请求");
          // Pro和Touch设备只能在硬件上输入PIN
          if (
            latestCurrentDevice &&
            (latestCurrentDevice.deviceType === EDeviceType.Pro ||
              latestCurrentDevice.deviceType === EDeviceType.Touch)
          ) {
            console.log(
              "[SDKProvider] 🔐 Pro/Touch设备检测到，自动使用硬件输入PIN"
            );
            // 直接返回硬件输入标识
            submitPin("@@ONEKEY_INPUT_PIN_IN_DEVICE").catch((error) => {
              console.error(
                "[SDKProvider] Pro/Touch设备PIN自动响应失败:",
                error
              );
            });
          } else {
            console.log(
              "[SDKProvider] ✨ Classic/Mini设备检测到，显示PIN输入选择弹窗"
            );
            // 其他设备显示PIN弹窗，用户可选择web输入或设备输入
            if (window.globalDialogManager) {
              window.globalDialogManager.showPinDialog();
            }
          }
          break;

        case "ui-request_passphrase": {
          console.log("[SDKProvider] 📱 处理passPhrase输入请求");

          // 直接检查硬件状态中的useEmptyPassphrase参数
          const hardwareState = useHardwareStore.getState();
          const shouldAutoSubmit =
            hardwareState.commonParameters.useEmptyPassphrase;

          console.log(
            "[SDKProvider] 🔐 检查useEmptyPassphrase:",
            shouldAutoSubmit
          );

          if (shouldAutoSubmit) {
            console.log("[SDKProvider] 🔐 自动发送空passphrase");
            submitPassphrase("", false, false).catch((error) => {
              console.error("[SDKProvider] 发送空passphrase失败:", error);
            });
          } else {
            console.log("[SDKProvider] ✨ 显示Passphrase输入弹窗");
            if (window.globalDialogManager) {
              window.globalDialogManager.showPassphraseDialog();
            }
          }
          break;
        }

        case "ui-button":
          console.log("[SDKProvider] 📱 设备需要用户确认");
          // 用户确认事件，不需要弹窗
          break;

        case "ui-close_window": {
          console.log("[SDKProvider] 🚪 关闭所有弹窗");
          // 检查当前是否有活跃的设备动作，如果有可能是因为错误导致的关闭
          const currentDeviceAction = useDeviceStore.getState().deviceAction;
          if (currentDeviceAction.isActive) {
            console.log(
              "[SDKProvider] ⚠️ 设备动作被意外中断，可能由于错误",
              currentDeviceAction
            );
          }

          // 关闭所有弹窗
          if (window.globalDialogManager) {
            window.globalDialogManager.closeAllDialogs();
          }
          break;
        }

        default:
          console.log(`[SDKProvider] ❓ 未知事件类型: ${message.type}`);
          break;
      }
    });

    // 监听设备连接/断开事件
    sdk.on("device-connect", (device) => {
      console.log("[SDKProvider] 🔗 设备连接事件:", device);
      // 设备连接事件通常包含基础设备信息，但详细信息需要通过其他方式获取
      // 这里可以记录连接事件，但通常设备详细信息由DeviceConnector管理
    });

    sdk.on("device-disconnect", (device) => {
      console.log("[SDKProvider] 🔌 设备断开事件:", device);
      // 可以在这里处理设备断开的逻辑
    });

    console.log("[SDKProvider] ✅ SDK事件监听器设置完成");
  };

  // 核心SDK初始化逻辑
  const initializeSDKCore = async (): Promise<CoreApi> => {
    if (typeof window === "undefined") {
      throw new Error("Browser environment required");
    }

    try {
      // 更新初始化状态
      updateSdkInitState({
        isInitialized: false,
        isInitializing: true,
        error: null,
        lastInitTime: Date.now(),
      });

      // 配置初始化参数 - 默认webusb
      const initConfig: Partial<ConnectSettings> = {
        debug: true,
        fetchConfig: true,
        env: "webusb",
      };

      // 执行SDK初始化
      await HardwareWebSdk.init(initConfig);
      sdkInstance = HardwareWebSdk;

      // 设置事件监听器
      setupSDKEventListeners(sdkInstance);

      // 更新成功状态
      updateSdkInitState({
        isInitialized: true,
        isInitializing: false,
        error: null,
        lastInitTime: Date.now(),
      });

      return sdkInstance;
    } catch (error) {
      // iframe 已存在错误处理
      if (error && typeof error === "object" && "message" in error) {
        const errorMessage = (error as Error).message || "";
        if (
          errorMessage.includes("IFrame alerady initialized") ||
          errorMessage.includes("IFrame already initialized")
        ) {
          sdkInstance = HardwareWebSdk;
          setupSDKEventListeners(sdkInstance);

          updateSdkInitState({
            isInitialized: true,
            isInitializing: false,
            error: null,
            lastInitTime: Date.now(),
          });

          return sdkInstance;
        }
      }

      // 更新错误状态
      updateSdkInitState({
        isInitialized: false,
        isInitializing: false,
        error: `初始化失败: ${error}`,
        lastInitTime: Date.now(),
      });

      throw error;
    }
  };

  // 初始化SDK
  const handleInitializeSDK = async () => {
    if (initializationRef.current) {
      return;
    }

    initializationRef.current = true;

    try {
      await getSDKInstance();
    } catch (error) {
      initializationRef.current = false;
    }
  };

  // 页面加载时自动初始化SDK
  useEffect(() => {
    handleInitializeSDK();
  }, []);

  const contextValue = {
    initializeSDK: handleInitializeSDK,
    getSDKInstance,
  };

  return (
    <SDKContext.Provider value={contextValue}>
      {children}
      <GlobalDialogManager />
    </SDKContext.Provider>
  );
};
