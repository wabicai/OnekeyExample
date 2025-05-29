import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { resolve } from "path";
import react from "@vitejs/plugin-react";

// 创建一个插件来处理OneKey SDK在SSR环境中的问题
function onekeySDKSafePlugin() {
  return {
    name: "onekey-sdk-safe-plugin",

    // 处理SDK模块加载
    load(id: string) {
      // 只在SSR构建时和SDK模块匹配时应用
      if (id.includes("@onekeyfe/hd-web-sdk") && process.env.SSR) {
        console.log("Providing mock for OneKey SDK in SSR mode");
        // 返回一个安全的模拟模块
        return `
          export default {
            HardwareWebSdk: {
              init: () => Promise.resolve({}),
              searchDevices: () => Promise.resolve({ success: false }),
              on: () => {},
              uiResponse: () => {},
            }
          };
        `;
      }
      return null;
    },
  };
}

// 创建一个插件来处理Node.js内置模块的polyfill
function nodePolyfillPlugin() {
  const builtins: Record<string, string> = {
    stream: "stream-browserify",
    buffer: "buffer",
    process: "process/browser",
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
    config(config: Record<string, any>) {
      // 确保buffer全局变量可用
      config.define = config.define || {};
      config.define.global = "globalThis";

      // 确保在入口点中提供 process
      config.build = config.build || {};
      config.build.rollupOptions = config.build.rollupOptions || {};
      config.build.rollupOptions.plugins =
        config.build.rollupOptions.plugins || [];

      return config;
    },
  };
}

export default defineConfig({
  plugins: [
    onekeySDKSafePlugin(),
    nodePolyfillPlugin(),
    react(), // 确保React正确处理
    remix({
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
        v3_singleFetch: true,
        v3_lazyRouteDiscovery: true,
      },
    }),
    tsconfigPaths(),
  ],
  // 添加解析别名
  resolve: {
    alias: {
      // 可以添加别名以便更轻松地导入组件
      "~": resolve(__dirname, "app"),
      // 添加别名以直接解析
      buffer: "buffer",
      process: "process/browser",
      stream: "stream-browserify",
    },
  },
  // 优化构建
  build: {
    // 改进代码分割
    rollupOptions: {
      // 设置入口点
      input: {
        main: resolve(__dirname, "index.html"),
      },
      // 优化大型依赖项
      output: {
        // 对第三方库进行拆分
        manualChunks: (id) => {
          // OneKey SDK单独打包
          if (id.includes("@onekeyfe/hd-web-sdk")) {
            return "onekey-sdk";
          }
          // React相关库
          if (
            id.includes("react/") ||
            id.includes("react-dom") ||
            id.includes("react-router")
          ) {
            return "vendor-react";
          }
          // Remix相关库
          if (id.includes("@remix-run")) {
            return "vendor-remix";
          }
          // UI组件库
          if (
            id.includes("@radix-ui") ||
            id.includes("lucide-react") ||
            id.includes("shadcn")
          ) {
            return "vendor-ui";
          }
          // 国际化
          if (id.includes("i18next")) {
            return "vendor-i18n";
          }
        },
      },
    },
    // 确保使用ESM格式
    target: "esnext",
  },
  // 开发服务器配置
  server: {
    port: 3000,
    hmr: {
      timeout: 5000, // 增加HMR超时时间
    },
  },
  // 使用ESM格式而不是CJS格式
  optimizeDeps: {
    esbuildOptions: {
      target: "esnext",
      define: {
        global: "globalThis",
      },
    },
    include: ["buffer", "process/browser", "stream-browserify"],
  },
  define: {
    "process.env": {},
    global: "globalThis",
    "global.Buffer": ["Buffer"],
  },
});
