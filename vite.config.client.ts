import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import react from "@vitejs/plugin-react";
import { Buffer } from "buffer";

// 确保全局 Buffer 在浏览器环境可用
if (typeof window !== "undefined") {
  window.Buffer = window.Buffer || Buffer;
}

// 创建一个插件来处理Node.js内置模块的polyfill
function nodePolyfillPlugin() {
  const builtins: Record<string, string> = {
    stream: "stream-browserify",
    buffer: "buffer",
    process: "process/browser",
    util: "util",
    events: "events",
  };

  return {
    name: "node-polyfill-plugin",

    // 在解析阶段重写导入
    resolveId(source: string) {
      if (source in builtins) {
        return { id: builtins[source], external: false };
      }
      return null;
    },

    // 配置开始前
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    configResolved(config: any) {
      const aliases = config.resolve.alias || {};
      for (const [key, value] of Object.entries(builtins)) {
        if (!aliases[key]) {
          aliases[key] = value;
        }
      }
    },
  };
}

export default defineConfig({
  root: process.cwd(),
  // 根据环境设置base path
  base: process.env.NODE_ENV === "production" ? "/OnekeyExample/" : "/",

  plugins: [react(), tsconfigPaths(), nodePolyfillPlugin()],

  define: {
    global: "globalThis",
    "process.env": process.env,
  },

  resolve: {
    alias: {
      stream: "stream-browserify",
      buffer: "buffer",
      process: "process/browser",
      util: "util",
      events: "events",
    },
  },

  build: {
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: false, // 禁用sourcemap减少文件数量
    rollupOptions: {
      output: {
        // 减少代码拆分，将更多代码打包到主要chunk中
        manualChunks: {
          // 将所有vendor代码打包到一个文件
          vendor: ["react", "react-dom", "react-router-dom"],
          // 将SDK相关代码打包到一个文件
          sdk: [
            "@onekeyfe/hd-web-sdk",
            "@onekeyfe/hd-core",
            "@onekeyfe/hd-shared",
          ],
          // 将UI组件打包到一个文件
          ui: [
            "@radix-ui/react-dialog",
            "@radix-ui/react-checkbox",
            "@radix-ui/react-select",
          ],
        },
        // 设置更大的chunk大小限制，减少文件拆分
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId
            ? chunkInfo.facadeModuleId.split("/").pop()?.replace(".js", "")
            : "chunk";
          return `assets/${facadeModuleId}-[hash].js`;
        },
        assetFileNames: "assets/[name]-[hash].[ext]",
        entryFileNames: "assets/[name]-[hash].js",
      },
    },
    // 增加chunk大小警告阈值
    chunkSizeWarningLimit: 1000,
  },

  server: {
    port: 5173,
    host: true,
  },

  // 优化依赖处理
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "@onekeyfe/hd-web-sdk",
      "buffer",
      "process",
      "stream-browserify",
      "util",
      "events",
    ],
    exclude: ["@onekeyfe/hd-core"],
  },
});
