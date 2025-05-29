import React, { useState } from "react";
import { Button } from "../ui/Button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/Dialog";
import { Alert, AlertDescription } from "../ui/Alert";
import { Edit, Save, X, Copy, Check } from "lucide-react";

interface JsonEditorProps {
  data: Record<string, unknown> | null;
  onSave: (data: Record<string, unknown>) => void;
  title?: string;
  disabled?: boolean;
}

const JsonEditor: React.FC<JsonEditorProps> = ({
  data,
  onSave,
  title = "",
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [editValue, setEditValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleOpen = () => {
    if (data) {
      setEditValue(JSON.stringify(data, null, 2));
    } else {
      setEditValue("{}");
    }
    setError(null);
    setIsOpen(true);
  };

  const handleCopy = async () => {
    if (data) {
      try {
        await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("复制失败:", err);
      }
    }
  };

  const handleSave = () => {
    try {
      const parsed = JSON.parse(editValue);
      onSave(parsed);
      setIsOpen(false);
      setError(null);
    } catch (err) {
      setError("JSON格式不正确，请检查语法");
    }
  };

  const handleCancel = () => {
    setIsOpen(false);
    setError(null);
  };

  return (
    <>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-medium text-foreground">{title}</h4>
        </div>
        <div className="flex items-center gap-1">
          {data && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              disabled={disabled}
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
          <Button
            variant="outline"
            size="sm"
            onClick={handleOpen}
            disabled={disabled}
            className="h-7 px-2 text-xs hover:bg-primary/10 hover:border-primary/30"
          >
            <Edit className="h-3 w-3 mr-1" />
            编辑
          </Button>
        </div>
      </div>

      {data ? (
        <pre className="bg-muted/30 p-4 rounded-lg text-xs overflow-auto max-h-80 border border-border/30 text-foreground">
          {JSON.stringify(data, null, 2)}
        </pre>
      ) : (
        <div className="bg-muted/20 p-8 rounded-lg text-center">
          <p className="text-muted-foreground text-sm">暂无数据</p>
        </div>
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="bg-card border-border max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-foreground">{title}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="json-textarea"
                className="text-sm font-medium text-foreground"
              >
                JSON内容
              </label>
              <textarea
                id="json-textarea"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="w-full h-64 p-3 text-xs font-mono bg-background border border-border rounded-lg focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/20 resize-none"
                placeholder="请输入JSON格式的数据..."
              />
            </div>

            {error && (
              <Alert
                variant="destructive"
                className="border-destructive/50 bg-destructive/5"
              >
                <X className="h-4 w-4" />
                <AlertDescription className="text-destructive">
                  {error}
                </AlertDescription>
              </Alert>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCancel}
              className="border-border text-foreground hover:bg-muted"
            >
              取消
            </Button>
            <Button
              onClick={handleSave}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Save className="h-4 w-4 mr-1" />
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default JsonEditor;
