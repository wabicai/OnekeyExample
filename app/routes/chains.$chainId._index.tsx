import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "@remix-run/react";
import { Search, Layers } from "lucide-react";
import { Card, CardContent } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { PageLayout } from "../components/common/PageLayout";
import { DeviceNotConnectedState } from "../components/common/DeviceNotConnectedState";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import { Breadcrumb } from "../components/ui/Breadcrumb";
import { useTemplateRegistry } from "../hooks/useTemplateRegistry";
import { ChainIcon } from "../components/icons/ChainIcon";
import { useTranslation } from "react-i18next";
import type { ChainConfig } from "../data/types";

const ChainMethodsIndexPage: React.FC = () => {
  const { chainId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedChain, setSelectedChain] = useState<ChainConfig | null>(null);

  const { isLoading, error, getChain, getChainMethods } = useTemplateRegistry();

  // 初始化链选择
  useEffect(() => {
    if (!chainId) return;

    const chain = getChain(chainId);
    if (chain) {
      setSelectedChain(chain);
    }
  }, [chainId, getChain]);

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

  if (!selectedChain || !chainId) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-96">
          <Card className="bg-card border border-destructive/50">
            <CardContent className="p-8 text-center">
              <h3 className="text-lg font-semibold text-destructive mb-2">
                Chain Not Found
              </h3>
              <p className="text-muted-foreground">
                The requested blockchain could not be found.
              </p>
            </CardContent>
          </Card>
        </div>
      </PageLayout>
    );
  }

  const methods = getChainMethods(selectedChain.id);
  const filteredMethods = methods.filter(
    (method) =>
      method.method.toLowerCase().includes(searchTerm.toLowerCase()) ||
      method.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 处理方法选择
  const handleMethodSelect = (methodName: string) => {
    navigate(`/chains/${chainId}/${methodName}`);
  };

  // 处理键盘事件
  const handleKeyDown = (event: React.KeyboardEvent, callback: () => void) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      callback();
    }
  };

  const breadcrumbItems = [
    { label: "Blockchain Methods", href: "/chains", icon: Layers },
    {
      label: selectedChain.name,
      icon: () => <ChainIcon chainId={selectedChain.id} size={16} />,
    },
  ];

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

          {/* 链信息头部 */}
          <div className="flex items-center gap-4">
            <ChainIcon chainId={selectedChain.id} size={24} />
            <div>
              <h1 className="text-xl font-bold text-foreground">
                {selectedChain.name} Methods
              </h1>
              <p className="text-sm text-muted-foreground">
                {filteredMethods.length} of {methods.length} methods
              </p>
            </div>
          </div>

          {/* 设备连接状态 */}
          <DeviceNotConnectedState />

          {/* 方法列表 */}
          <div className="space-y-2">
            {filteredMethods.map((method, methodIndex) => (
              <div
                key={`${selectedChain.id}-${method.method}-${methodIndex}`}
                className="flex items-center justify-between p-3 bg-card border border-border rounded cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all duration-200"
                onClick={() => handleMethodSelect(method.method)}
                onKeyDown={(e) =>
                  handleKeyDown(e, () => handleMethodSelect(method.method))
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

export default ChainMethodsIndexPage;
