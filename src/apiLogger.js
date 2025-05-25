// src/apiLogger.js
// This module patches the global fetch API to log API calls and their details.
const apiLogs = [];
const MAX_LOGS = 100;
let subscribers = [];

const notifySubscribers = () => {
  subscribers.forEach(fn => fn([...apiLogs]));
};

export const subscribeToApiLogs = (callback) => {
  subscribers.push(callback);
  callback([...apiLogs]);
  return () => {
    subscribers = subscribers.filter(fn => fn !== callback);
  };
};

const logApiCall = ({ url, method, duration, status, stack }) => {
  if (apiLogs.length > MAX_LOGS) apiLogs.shift();

  apiLogs.push({ url, method, duration, status, time: new Date(), stack });
  notifySubscribers();
};

export const patchGlobalFetch = () => {
  if (typeof window === "undefined") return;

  const originalFetch = window.fetch;

  window.fetch = async (...args) => {
    const url = args[0];
    const method = (args[1]?.method || "GET").toUpperCase();
    const start = performance.now();
    const stack = new Error().stack.split("\n").slice(2, 6).join("\n");

    try {
      const response = await originalFetch(...args);
      const duration = (performance.now() - start).toFixed(2);
      logApiCall({
        url,
        method,
        duration,
        status: response.status,
        stack,
      });
      return response;
    } catch (error) {
      const duration = (performance.now() - start).toFixed(2);
      logApiCall({
        url,
        method,
        duration,
        status: "ERROR",
        stack,
      });
      throw error;
    }
  };
};

// export const patchAxiosInstance = (axiosInstance) => {
//   if (!axiosInstance || typeof axiosInstance !== "object") {
//     console.warn("Invalid Axios instance provided for patching.");
//     return;
//   }

//   const originalRequest = axiosInstance.request;

//   axiosInstance.request = async (config) => {
//     const url = config.url;
//     const method = config.method ? config.method.toUpperCase() : "GET";
//     const start = performance.now();
//     const stack = new Error().stack.split("\n").slice(2, 6).join("\n");

//     try {
//       const response = await originalRequest(config);
//       const duration = (performance.now() - start).toFixed(2);
//       logApiCall({
//         url,
//         method,
//         duration,
//         status: response.status,
//         stack,
//       });
//       return response;
//     } catch (error) {
//       const duration = (performance.now() - start).toFixed(2);
//       logApiCall({
//         url,
//         method,
//         duration,
//         status: error.response ? error.response.status : "ERROR",
//         stack,
//       });
//       throw error;
//     }
//   };
// }
export function patchAxiosInstance(axiosInstance) {
  axiosInstance.interceptors.request.use((config) => {
    config.metadata = { startTime: new Date() };
    return config;
  });

  axiosInstance.interceptors.response.use(
    (response) => {
      const duration = new Date() - response.config.metadata.startTime;
      logApiCall({
        method: response.config.method.toUpperCase(),
        url: response.config.url,
        duration,
        status: response.status,
        time: new Date(),
      });
      return response;
    },
    (error) => {
      const config = error.config || {};
      const duration = config.metadata
        ? new Date() - config.metadata.startTime
        : 0;

      logApiCall({
        method: config.method ? config.method.toUpperCase() : "UNKNOWN",
        url: config.url || "unknown",
        duration,
        status: error.response ? error.response.status : "ERR",
        time: new Date(),
      });

      return Promise.reject(error);
    }
  );
}