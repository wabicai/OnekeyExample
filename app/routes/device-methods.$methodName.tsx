import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "@remix-run/react";
import { Cpu, Settings } from "lucide-react";
import { Card, CardContent } from "../components/ui/Card";
import MethodExecutor from "../components/common/MethodExecutor";
import { PageLayout } from "../components/common/PageLayout";
import { DeviceNotConnectedState } from "../components/common/DeviceNotConnectedState";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import { Breadcrumb } from "../components/ui/Breadcrumb";
import { useTemplateRegistry } from "../hooks/useTemplateRegistry";
import { useMethodExecution } from "../hooks/useMethodExecution";
import { useDeviceStore } from "../store/deviceStore";
import { useTranslation } from "react-i18next";
import type { MethodConfig } from "../data/types";

const DeviceMethodExecutePage: React.FC = () => {
  const { methodName } = useParams();
  const { t } = useTranslation();
  const { currentDevice } = useDeviceStore();
  const [selectedMethod, setSelectedMethod] = useState<MethodConfig | null>(
    null
  );

  const { isLoading, error, getFunctionalChains } = useTemplateRegistry();
  const { executeMethod } = useMethodExecution({
    basePath: "/device-methods",
  });

  // 创建包装函数，在执行时传递方法配置
  const handleMethodExecution = useCallback(
    async (params: Record<string, unknown>) => {
      if (!selectedMethod) {
        throw new Error("方法配置未找到");
      }
      return executeMethod(params, selectedMethod);
    },
    [executeMethod, selectedMethod]
  );

  // 初始化方法选择
  useEffect(() => {
    if (!methodName) return;

    // 获取功能模块方法
    const functionalChains = getFunctionalChains();
    const allDeviceMethods = functionalChains.flatMap((chain) => chain.methods);

    const method = allDeviceMethods.find((m) => m.method === methodName);
    if (method) {
      setSelectedMethod(method);
    }
  }, [methodName, getFunctionalChains]);

  // 加载状态
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner message={t("common.loading")} />
      </div>
    );
  }

  // 错误状态
  if (error) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-96">
          <Card className="bg-card border border-destructive/50">
            <CardContent className="p-8 text-center">
              <h3 className="text-lg font-semibold text-destructive mb-2">
                {t("common.loadError")}
              </h3>
              <p className="text-muted-foreground">{error}</p>
            </CardContent>
          </Card>
        </div>
      </PageLayout>
    );
  }

  // 未找到方法
  if (!selectedMethod || !methodName) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-96">
          <Card className="bg-card border border-destructive/50">
            <CardContent className="p-8 text-center">
              <h3 className="text-lg font-semibold text-destructive mb-2">
                Method Not Found
              </h3>
              <p className="text-muted-foreground">
                The requested device method could not be found.
              </p>
            </CardContent>
          </Card>
        </div>
      </PageLayout>
    );
  }

  const breadcrumbItems = [
    { label: "Device Methods", href: "/device-methods", icon: Cpu },
    { label: selectedMethod.method, icon: Settings },
  ];

  return (
    <PageLayout>
      <div className="min-h-screen bg-background">
        <div className="mx-auto px-6 py-4 space-y-4">
          {/* 面包屑导航 */}
          <Breadcrumb items={breadcrumbItems} />

          {/* 执行器 */}
          {!currentDevice ? (
            <DeviceNotConnectedState showFullPage={true} />
          ) : (
            <MethodExecutor
              methodConfig={selectedMethod}
              executionHandler={handleMethodExecution}
            />
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default DeviceMethodExecutePage;
