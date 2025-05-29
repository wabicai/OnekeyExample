import { useDeviceStore } from "../store/deviceStore";

// Log types
export type LogType = "info" | "error" | "request" | "response";

// Create a log entry
export function createLogEntry(type: LogType, message: string, data?: unknown) {
  return {
    id: Date.now().toString(),
    timestamp: new Date().toISOString(),
    type,
    message,
    data,
  };
}

// Log information
export function logInfo(message: string, data?: unknown) {
  console.info(`[INFO] ${message}`, data || "");
  // Only add to store if in browser environment
  try {
    const store = useDeviceStore.getState();
    store.addLog(createLogEntry("info", message, data));
  } catch (e) {
    console.error("Failed to add log to store:", e);
  }
}

// Log errors
export function logError(message: string, data?: unknown) {
  console.error(`[ERROR] ${message}`, data || "");
  try {
    const store = useDeviceStore.getState();
    store.addLog(createLogEntry("error", message, data));
  } catch (e) {
    console.error("Failed to add log to store:", e);
  }
}

// Log requests
export function logRequest(message: string, data?: unknown) {
  console.info(`[REQUEST] ${message}`, data || "");
  try {
    const store = useDeviceStore.getState();
    store.addLog(createLogEntry("request", message, data));
  } catch (e) {
    console.error("Failed to add log to store:", e);
  }
}

// Log responses
export function logResponse(message: string, data?: unknown) {
  console.info(`[RESPONSE] ${message}`, data || "");
  try {
    const store = useDeviceStore.getState();
    store.addLog(createLogEntry("response", message, data));
  } catch (e) {
    console.error("Failed to add log to store:", e);
  }
}
