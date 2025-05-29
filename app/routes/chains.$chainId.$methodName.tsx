import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "@remix-run/react";
import { Layers, Settings } from "lucide-react";
import { Card, CardContent } from "../components/ui/Card";
import MethodExecutor from "../components/common/MethodExecutor";
import { PageLayout } from "../components/common/PageLayout";
import { DeviceNotConnectedState } from "../components/common/DeviceNotConnectedState";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import { Breadcrumb } from "../components/ui/Breadcrumb";
import { useTemplateRegistry } from "../hooks/useTemplateRegistry";
import { useMethodExecution } from "../hooks/useMethodExecution";
import { useDeviceStore } from "../store/deviceStore";
import { ChainIcon } from "../components/icons/ChainIcon";
import { useTranslation } from "react-i18next";
import type { ChainConfig, MethodConfig } from "../data/types";

const ChainMethodExecutePage: React.FC = () => {
  const { chainId, methodName } = useParams();
  const { t } = useTranslation();
  const { currentDevice } = useDeviceStore();
  const [selectedChain, setSelectedChain] = useState<ChainConfig | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<MethodConfig | null>(
    null
  );

  const { isLoading, error, getChain, getChainMethods } = useTemplateRegistry();
  const { executeMethod } = useMethodExecution({
    basePath: "/chains",
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

  // 初始化链和方法选择
  useEffect(() => {
    if (!chainId || !methodName) return;

    const chain = getChain(chainId);
    if (chain) {
      setSelectedChain(chain);

      const methods = getChainMethods(chainId);
      const method = methods.find((m) => m.method === methodName);
      if (method) {
        setSelectedMethod(method);
      }
    }
  }, [chainId, methodName, getChain, getChainMethods]);

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

  // 未找到链或方法
  if (!selectedChain || !selectedMethod || !chainId || !methodName) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-96">
          <Card className="bg-card border border-destructive/50">
            <CardContent className="p-8 text-center">
              <h3 className="text-lg font-semibold text-destructive mb-2">
                Method Not Found
              </h3>
              <p className="text-muted-foreground">
                The requested method could not be found.
              </p>
            </CardContent>
          </Card>
        </div>
      </PageLayout>
    );
  }

  const breadcrumbItems = [
    { label: "Blockchain Methods", href: "/chains", icon: Layers },
    {
      label: selectedChain.name,
      href: `/chains/${chainId}`,
      icon: () => <ChainIcon chainId={selectedChain.id} size={16} />,
    },
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

export default ChainMethodExecutePage;
