import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { useHardwareStore } from "~/store/hardwareStore";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/Dialog";
import { Alert, AlertDescription } from "../ui/Alert";
import { Copy, Check, AlertTriangle } from "lucide-react";
import type { DeviceModel, ThemeType } from "../ui/DeviceActionAnimation";
import { useDeviceStore } from "../../store/deviceStore";
import { useToast } from "../../hooks/use-toast";
import type { DeviceActionType } from "../../services/hardwareService";
import type { MethodConfig, ExecutionStatus } from "~/data/types";
import { getSDKInstance } from "~/services/hardwareService";

// 导入子组件
import ParameterInput from "./ParameterInput";
import DeviceInteractionArea from "./DeviceInteractionArea";
import JsonEditor from "./JsonEditor";

export interface MethodExecutorProps {
  methodConfig: MethodConfig;
  executionHandler: (params: Record<string, unknown>) => Promise<unknown>;
  onResult?: (result: unknown) => void;
  onError?: (error: string) => void;
  className?: string;
}

const MethodExecutor: React.FC<MethodExecutorProps> = ({
  methodConfig,
  executionHandler,
  onResult,
  onError,
  className = "",
}) => {
  const { toast } = useToast();
  const {
    currentDevice,
    sdkInitState,
    deviceAction: globalDeviceAction,
  } = useDeviceStore();

  // 获取硬件状态管理器
  const {
    methodParameters,
    getExecutionParameters,
    setMethodParameters,
    resetMethodParameters,
  } = useHardwareStore();

  // 执行状态
  const [status, setStatus] = useState<ExecutionStatus>("idle");
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [result, setResult] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [localDeviceAction, setLocalDeviceAction] = useState<{
    actionType: DeviceActionType;
    deviceInfo?: unknown;
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  // 获取方法的所有参数，从预设中推断（因为新的 MethodConfig 没有 parameters 字段）
  const getAllParametersFromPresets = (): Array<{
    name: string;
    type: string;
    required: boolean;
    default?: unknown;
  }> => {
    if (!methodConfig.presets || methodConfig.presets.length === 0) {
      return [];
    }

    const parameterSet = new Set<string>();
    methodConfig.presets.forEach((preset) => {
      Object.keys(preset.value).forEach((key) => {
        parameterSet.add(key);
      });
    });

    return Array.from(parameterSet).map((name) => ({
      name,
      type: "string", // 默认类型
      required: false, // 默认非必需
    }));
  };

  const allParameters = getAllParametersFromPresets();

  // 获取默认参数值
  const getDefaultParams = (): Record<string, unknown> => {
    const defaultParams: Record<string, unknown> = {};
    allParameters.forEach((param) => {
      if (param.default !== undefined) {
        defaultParams[param.name] = param.default;
      }
    });
    return defaultParams;
  };

  // 初始化参数值
  useEffect(() => {
    // 🔥 方法变化时，完全重置所有方法参数
    console.log("[MethodExecutor] 🔄 方法变化，重置参数:", methodConfig.method);
    resetMethodParameters();

    const defaultParams = getDefaultParams();

    // 自动选择第一个预设
    if (methodConfig.presets && methodConfig.presets.length > 0) {
      const firstPreset = methodConfig.presets[0];
      setSelectedPreset(firstPreset.title);

      // 🔥 完全替换参数：只使用预设值，加上必要的默认值
      const presetParams = { ...defaultParams, ...firstPreset.value };

      console.log("[MethodExecutor] 📋 初始化参数:", {
        方法名称: methodConfig.method,
        默认参数: defaultParams,
        预设参数: firstPreset.value,
        最终参数: presetParams,
      });

      setMethodParameters(presetParams);
    } else {
      setSelectedPreset(null);
      setMethodParameters(defaultParams);

      console.log("[MethodExecutor] 📋 无预设，使用默认参数:", {
        方法名称: methodConfig.method,
        默认参数: defaultParams,
      });
    }
  }, [methodConfig, setMethodParameters, resetMethodParameters]);

  // 监听全局设备动作状态
  useEffect(() => {
    if (
      globalDeviceAction.isActive &&
      globalDeviceAction.actionType &&
      status === "loading"
    ) {
      console.log(
        "🎯 [MethodExecutor] 设备交互开始:",
        globalDeviceAction.actionType
      );
      setStatus("device-interaction");
      setLocalDeviceAction({
        actionType: globalDeviceAction.actionType,
        deviceInfo: globalDeviceAction.deviceInfo,
      });
    } else if (!globalDeviceAction.isActive) {
      // 设备动作被清除
      if (status === "device-interaction") {
        // 如果当前正在设备交互中，说明可能是PIN错误或操作被取消
        console.log("⚠️ [MethodExecutor] 设备交互被中断，重置状态到错误");
        setStatus("error");
        setError("操作被中断或PIN输入错误");
      }
      setLocalDeviceAction(null);
    }
  }, [globalDeviceAction, status]);

  // 处理预设选择
  const handlePresetChange = (presetTitle: string) => {
    const preset = methodConfig.presets?.find((p) => p.title === presetTitle);
    if (preset) {
      setSelectedPreset(presetTitle);

      // 🔥 完全替换参数：先获取默认值，再应用预设值
      const defaultParams = getDefaultParams();
      const newParams = { ...defaultParams, ...preset.value };

      console.log("[MethodExecutor] 🔄 切换预设:", {
        预设名称: presetTitle,
        默认参数: defaultParams,
        预设参数: preset.value,
        最终参数: newParams,
      });

      setMethodParameters(newParams);
    }
  };

  // 验证参数
  const validateParams = (): boolean => {
    for (const param of allParameters) {
      if (param.required && !methodParameters[param.name]) {
        toast({
          title: "参数错误",
          description: `参数 "${param.name}" 是必需的`,
          variant: "warning",
        });
        return false;
      }
    }
    return true;
  };

  // 执行方法
  const executeMethod = async () => {
    if (!validateParams()) return;

    // 检查设备连接
    if (!currentDevice) {
      toast({
        title: "设备未连接",
        description: "请先连接硬件设备",
        variant: "warning",
      });
      return;
    }

    // 检查SDK状态
    if (!sdkInitState.isInitialized) {
      toast({
        title: "SDK未就绪",
        description: "请等待SDK初始化完成",
        variant: "warning",
      });
      return;
    }

    // 检查是否需要确认（仅对已弃用的方法显示警告）
    const needsConfirmation = methodConfig.deprecated;

    if (needsConfirmation) {
      setShowConfirmDialog(true);
      return;
    }

    await performExecution();
  };

  const performExecution = async () => {
    setStatus("loading");
    setError(null);
    setResult(null);
    setLocalDeviceAction(null);
    setShowConfirmDialog(false);

    try {
      const startTime = Date.now();

      // 🔥 使用 hardwareStore 计算的最终执行参数
      const executionParams = getExecutionParameters();

      console.log("[MethodExecutor] 🚀 执行参数:", executionParams);

      const execResult = await executionHandler(executionParams);
      const duration = Date.now() - startTime;

      setResult(execResult);
      setStatus("success");
      setLocalDeviceAction(null);

      toast({
        title: "执行成功",
        description: `${methodConfig.method} 执行完成 (${duration}ms)`,
      });

      onResult?.(execResult);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "执行失败";
      setError(errorMessage);
      setStatus("error");
      setLocalDeviceAction(null);

      toast({
        title: "执行失败",
        description: errorMessage,
        variant: "warning",
      });

      onError?.(errorMessage);
    }
  };

  // 重置状态并取消硬件操作
  const handleReset = async () => {
    // 如果正在执行中或设备交互中，调用SDK的cancel方法
    if (status === "loading" || status === "device-interaction") {
      setIsCancelling(true);
      try {
        if (currentDevice) {
          console.log("[MethodExecutor] 🚫 取消硬件操作");

          const sdkInstance = await getSDKInstance();
          const cancelResult = await sdkInstance.deviceCancel(
            currentDevice.connectId,
            {}
          );

          if (cancelResult.success) {
            toast({
              title: "操作已取消",
              description: "硬件操作已成功取消",
            });
          } else {
            toast({
              title: "取消请求已发送",
              description: "正在尝试停止当前操作",
              variant: "default",
            });
          }
        }
      } catch (error) {
        console.warn("[MethodExecutor] ⚠️ 取消操作失败:", error);

        // 即使取消失败，也要继续重置UI状态
        toast({
          title: "取消请求已发送",
          description: "正在尝试停止当前操作",
          variant: "default",
        });
      } finally {
        setIsCancelling(false);
      }
    }

    // 重置UI状态
    setStatus("idle");
    setError(null);
    setResult(null);
    setLocalDeviceAction(null);
  };

  // 处理JSON编辑
  const handleRequestParamsEdit = (data: Record<string, unknown>) => {
    setMethodParameters(data);
  };

  // 复制执行结果
  const handleCopyResult = async () => {
    if (result !== null && result !== undefined) {
      try {
        const resultText =
          typeof result === "string" ? result : JSON.stringify(result, null, 2);
        await navigator.clipboard.writeText(resultText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast({
          title: "复制成功",
          description: "执行结果已复制到剪贴板",
        });
      } catch (err) {
        console.error("复制失败:", err);
        toast({
          title: "复制失败",
          description: "无法复制到剪贴板",
          variant: "warning",
        });
      }
    }
  };

  // 根据设备信息获取设备型号
  const getDeviceModel = (): DeviceModel => {
    if (!currentDevice?.deviceType) {
      return "classic"; // 默认值
    }

    const deviceType = currentDevice.deviceType.toString().toLowerCase();
    if (deviceType.includes("classic")) return "classic";
    if (deviceType.includes("mini")) return "mini";
    if (deviceType.includes("pro")) return "pro";
    if (deviceType.includes("touch")) return "touch";
    return "classic"; // 默认值
  };

  // 获取设备主题
  const getDeviceTheme = (): ThemeType => {
    const deviceModel = getDeviceModel();
    if (deviceModel === "pro") {
      return "light";
    }
    return "light";
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* 采用上下+左右复合布局 */}
      <div className="space-y-3">
        {/* 上半部分：执行参数区域 */}
        <ParameterInput
          methodConfig={methodConfig}
          selectedPreset={selectedPreset}
          onPresetChange={handlePresetChange}
        />

        {/* 下半部分：左右布局 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* 左侧：设备交互 */}
          <div className="lg:col-span-4 flex flex-col">
            <DeviceInteractionArea
              status={status}
              deviceAction={localDeviceAction}
              deviceModel={getDeviceModel()}
              deviceTheme={getDeviceTheme()}
              onExecute={executeMethod}
              onReset={handleReset}
              isCancelling={isCancelling}
            />
          </div>

          {/* 右侧：请求参数和执行结果 */}
          <div className="lg:col-span-8 space-y-4">
            {/* 请求参数 */}
            <Card className="bg-card border border-border/50 shadow-sm min-h-72">
              <CardContent className="pt-6">
                <JsonEditor
                  data={getExecutionParameters()}
                  onSave={handleRequestParamsEdit}
                  title="请求参数"
                  disabled={
                    status === "loading" || status === "device-interaction"
                  }
                />
              </CardContent>
            </Card>

            {/* 执行结果 */}
            <Card className="bg-card border border-border/50 shadow-sm min-h-72">
              <CardHeader className="pb-1">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm text-foreground">
                    执行结果
                  </CardTitle>
                  {result !== null && result !== undefined && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopyResult}
                      className="h-7 px-2 text-xs hover:bg-primary/10 hover:border-primary/30"
                    >
                      {copied ? (
                        <>
                          <Check className="h-3 w-3 mr-1 text-green-600" />
                          已复制
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3 mr-1" />
                          复制
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {result !== null && result !== undefined && (
                  <div className="space-y-3">
                    <Badge
                      variant="secondary"
                      className="bg-primary/10 text-primary border-primary/20"
                    >
                      成功
                    </Badge>
                    <pre className="bg-muted/30 p-4 rounded-lg text-xs overflow-auto max-h-96 border border-border/30 text-foreground font-mono">
                      {(() => {
                        try {
                          return typeof result === "string"
                            ? result
                            : JSON.stringify(result, null, 2);
                        } catch {
                          return String(result);
                        }
                      })()}
                    </pre>
                  </div>
                )}

                {error && (
                  <div className="space-y-3">
                    <Badge
                      variant="secondary"
                      className="bg-orange-100 text-orange-700 border-orange-300"
                    >
                      失败
                    </Badge>
                    <Alert
                      variant="warning"
                      className="border-orange-200 bg-orange-50"
                    >
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription className="text-orange-800">
                        {error}
                      </AlertDescription>
                    </Alert>
                  </div>
                )}

                {!result && !error && (
                  <div className="bg-muted/20 p-10 rounded-lg text-center">
                    <p className="text-muted-foreground text-sm">
                      暂无执行结果
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* 确认对话框 */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 text-foreground">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              <span>确认执行</span>
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {methodConfig.deprecated
                ? "这是一个已弃用的方法，可能会影响设备安全。请确认您了解此操作的风险。"
                : "请确认您要执行此操作。"}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              操作：
              <span className="font-medium text-foreground">
                {methodConfig.method}
              </span>
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {methodConfig.description}
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              className="border-border text-foreground hover:bg-muted"
            >
              取消
            </Button>
            <Button
              onClick={performExecution}
              variant={methodConfig.deprecated ? "warning" : "default"}
              className={
                methodConfig.deprecated
                  ? ""
                  : "bg-primary hover:bg-primary/90 text-primary-foreground"
              }
            >
              确认执行
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MethodExecutor;
