import React, { useCallback } from "react";
import { useParams } from "@remix-run/react";
import { Cpu, Settings } from "lucide-react";
import MethodExecutor from "../components/common/MethodExecutor";
import { PageLayout } from "../components/common/PageLayout";
import { DeviceNotConnectedState } from "../components/common/DeviceNotConnectedState";
import { MethodExecuteBoundary } from "../components/common/MethodExecuteBoundary";
import { Breadcrumb } from "../components/ui/Breadcrumb";
import { useMethodResolver } from "../hooks/useMethodResolver";
import { useMethodExecution } from "../hooks/useMethodExecution";
import { useDeviceStore } from "../store/deviceStore";

const DeviceMethodExecutePage: React.FC = () => {
  const { methodName } = useParams();
  const { currentDevice } = useDeviceStore();

  const { selectedMethod, isMethodNotFound } = useMethodResolver({
    methodName,
  });
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

  return (
    <MethodExecuteBoundary
      methodName={methodName}
      basePath="/device-methods"
      baseLabel="Device Methods"
      baseIcon={Cpu}
      checkNotFound={isMethodNotFound}
    >
      {selectedMethod && (
        <PageLayout>
          <div className="min-h-screen bg-background">
            <div className="mx-auto px-6 py-4 space-y-4">
              {/* 面包屑导航 */}
              <Breadcrumb
                items={[
                  {
                    label: "Device Methods",
                    href: "/device-methods",
                    icon: Cpu,
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

export default DeviceMethodExecutePage;
