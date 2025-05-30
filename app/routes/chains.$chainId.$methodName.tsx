import React, { useCallback } from "react";
import { useParams } from "@remix-run/react";
import { Layers, Settings } from "lucide-react";
import MethodExecutor from "../components/common/MethodExecutor";
import { PageLayout } from "../components/common/PageLayout";
import { DeviceNotConnectedState } from "../components/common/DeviceNotConnectedState";
import { MethodExecuteBoundary } from "../components/common/MethodExecuteBoundary";
import { Breadcrumb } from "../components/ui/Breadcrumb";
import { useMethodResolver } from "../hooks/useMethodResolver";
import { useMethodExecution } from "../hooks/useMethodExecution";
import { useDeviceStore } from "../store/deviceStore";
import { ChainIcon } from "../components/icons/ChainIcon";

const ChainMethodExecutePage: React.FC = () => {
  const { chainId, methodName } = useParams();
  const { currentDevice } = useDeviceStore();

  const { selectedChain, selectedMethod, isMethodNotFound } = useMethodResolver(
    {
      chainId,
      methodName,
    }
  );
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

  return (
    <MethodExecuteBoundary
      methodName={methodName}
      basePath="/chains"
      baseLabel="Blockchain Methods"
      baseIcon={Layers}
      checkNotFound={isMethodNotFound}
    >
      {selectedChain && selectedMethod && (
        <PageLayout>
          <div className="min-h-screen bg-background">
            <div className="mx-auto px-6 py-4 space-y-4">
              {/* 面包屑导航 */}
              <Breadcrumb
                items={[
                  {
                    label: "Blockchain Methods",
                    href: "/chains",
                    icon: Layers,
                  },
                  {
                    label: selectedChain.name,
                    href: `/chains/${chainId}`,
                    icon: () => (
                      <ChainIcon chainId={selectedChain.id} size={16} />
                    ),
                  },
                  { label: selectedMethod.method, icon: Settings },
                ]}
              />

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
      )}
    </MethodExecuteBoundary>
  );
};

export default ChainMethodExecutePage;
