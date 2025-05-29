import React, { useState } from "react";
import { useNavigate } from "@remix-run/react";
import { Search, Cpu } from "lucide-react";
import { Card, CardContent } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { PageLayout } from "../components/common/PageLayout";
import { DeviceNotConnectedState } from "../components/common/DeviceNotConnectedState";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import { Breadcrumb } from "../components/ui/Breadcrumb";
import { useTemplateRegistry } from "../hooks/useTemplateRegistry";
import { useTranslation } from "react-i18next";

const DeviceMethodsIndexPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");

  const { isLoading, error, getChainsByCategory } = useTemplateRegistry();

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

  // 获取并按优先级排序方法（基本操作优先）
  const deviceChains = getChainsByCategory("device");
  const basicChains = getChainsByCategory("basic");

  const basicMethods = basicChains.flatMap((chain) => chain.methods);
  const deviceMethods = deviceChains.flatMap((chain) => chain.methods);
  const allDeviceMethods = [...basicMethods, ...deviceMethods];

  // 过滤方法
  const filteredMethods = allDeviceMethods.filter(
    (method) =>
      method.method.toLowerCase().includes(searchTerm.toLowerCase()) ||
      method.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 按类别分组
  const basicFilteredMethods = filteredMethods.filter(
    (method) => method.category === "basic" || method.category === "info"
  );
  const deviceFilteredMethods = filteredMethods.filter(
    (method) => method.category === "device" || method.category === "management"
  );

  // 处理方法选择
  const handleMethodSelect = (methodName: string) => {
    navigate(`/device-methods/${methodName}`);
  };

  // 处理键盘事件
  const handleKeyDown = (event: React.KeyboardEvent, callback: () => void) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      callback();
    }
  };

  const breadcrumbItems = [{ label: "Device Methods", icon: Cpu }];

  return (
    <PageLayout>
      <div className="min-h-screen bg-background">
        <div className="mx-auto px-6 py-4 space-y-4">
          {/* 面包屑导航 + 搜索框 */}
          <div className="flex items-center justify-between gap-4">
            <Breadcrumb items={breadcrumbItems} />
            <div className="relative w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search methods..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* 页面信息 */}
          <div>
            <p className="text-sm text-muted-foreground">
              {filteredMethods.length} methods available
            </p>
          </div>

          {/* 设备连接状态 */}
          <DeviceNotConnectedState />

          {/* 方法列表 */}
          <div className="space-y-6">
            {/* 基本操作 */}
            {basicFilteredMethods.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-lg font-semibold text-foreground">
                  Basic Operations ({basicFilteredMethods.length})
                </h2>
                <div className="grid gap-2">
                  {basicFilteredMethods.map((method, index) => (
                    <div
                      key={`basic-${method.method}-${index}`}
                      className="group flex items-center justify-between p-3 bg-card border border-border rounded cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all duration-200"
                      onClick={() => handleMethodSelect(method.method)}
                      onKeyDown={(e) =>
                        handleKeyDown(e, () =>
                          handleMethodSelect(method.method)
                        )
                      }
                      tabIndex={0}
                      role="button"
                      aria-label={`Execute ${method.method}`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                          <code className="font-mono font-semibold text-foreground">
                            {method.method}
                          </code>
                          <div className="flex gap-1">
                            {method.dangerous && (
                              <div
                                className="w-2 h-2 bg-red-500 rounded-full"
                                title="Dangerous"
                              />
                            )}
                            {method.requiresConfirmation && (
                              <div
                                className="w-2 h-2 bg-orange-500 rounded-full"
                                title="Requires confirmation"
                              />
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                          {method.description}
                        </p>
                      </div>
                      <div className="text-xs text-muted-foreground ml-4">
                        {method.category}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 设备管理 */}
            {deviceFilteredMethods.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-lg font-semibold text-foreground">
                  Device Management ({deviceFilteredMethods.length})
                </h2>
                <div className="grid gap-2">
                  {deviceFilteredMethods.map((method, index) => (
                    <div
                      key={`device-${method.method}-${index}`}
                      className="group flex items-center justify-between p-3 bg-card border border-border rounded cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all duration-200"
                      onClick={() => handleMethodSelect(method.method)}
                      onKeyDown={(e) =>
                        handleKeyDown(e, () =>
                          handleMethodSelect(method.method)
                        )
                      }
                      tabIndex={0}
                      role="button"
                      aria-label={`Execute ${method.method}`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                          <code className="font-mono font-semibold text-foreground">
                            {method.method}
                          </code>
                          <div className="flex gap-1">
                            {method.dangerous && (
                              <div
                                className="w-2 h-2 bg-red-500 rounded-full"
                                title="Dangerous"
                              />
                            )}
                            {method.requiresConfirmation && (
                              <div
                                className="w-2 h-2 bg-orange-500 rounded-full"
                                title="Requires confirmation"
                              />
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                          {method.description}
                        </p>
                      </div>
                      <div className="text-xs text-muted-foreground ml-4">
                        {method.category}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 空状态 */}
          {filteredMethods.length === 0 && searchTerm && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No methods found for &quot;{searchTerm}&quot;
              </p>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default DeviceMethodsIndexPage;
