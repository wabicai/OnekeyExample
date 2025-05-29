import { Button } from "./ui/Button";
import { Badge } from "./ui/Badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Moon, Sun, Globe, ExternalLink } from "lucide-react";
import { useTheme } from "../hooks/use-theme";
import { useTranslation } from "react-i18next";

// 导入GitHub图标
import githubIcon from "~/assets/gitHub.svg";

export function SiteHeader() {
  const { toggleTheme } = useTheme();
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const languages = [
    { code: "en", name: "English" },
    { code: "zh", name: "中文" },
    { code: "ja", name: "日本語" },
    { code: "ko", name: "한국어" },
  ];

  const currentLanguage =
    languages.find((lang) => lang.code === i18n.language) || languages[0];

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-end px-6">
          {/* 右侧：工具栏 */}
          <div className="flex items-center gap-2">
            {/* 语言切换 */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <Globe className="h-4 w-4" />
                  <span>{currentLanguage.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {languages.map((lang) => (
                  <DropdownMenuItem
                    key={lang.code}
                    onClick={() => changeLanguage(lang.code)}
                    className="gap-2"
                  >
                    <span>{lang.name}</span>
                    {i18n.language === lang.code && (
                      <Badge variant="secondary" className="ml-auto">
                        {t("common.current")}
                      </Badge>
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* 主题切换 */}
            <Button variant="ghost" size="sm" onClick={toggleTheme}>
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">{t("common.toggleTheme")}</span>
            </Button>

            {/* 外部链接 */}
            <Button variant="ghost" size="sm" asChild>
              <a
                href="https://help.onekey.so/hc"
                target="_blank"
                rel="noopener noreferrer"
                className="gap-2"
              >
                <span className="text-sm">{t("common.docs")}</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </Button>

            <Button variant="ghost" size="sm" asChild>
              <a
                href="https://github.com/OneKeyHQ/hardware-js-sdk/tree/onekey"
                target="_blank"
                rel="noopener noreferrer"
                className="gap-2"
              >
                <span className="text-sm">GitHub</span>
                <img src={githubIcon} alt="GitHub" className="h-5 w-5" />
              </a>
            </Button>
          </div>
        </div>
      </header>
    </>
  );
}
