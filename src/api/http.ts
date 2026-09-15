import axios, { type AxiosResponse, type InternalAxiosRequestConfig } from "axios";
import { ElMessage } from "element-plus";

export const http = axios.create({
  baseURL: "/api",
  timeout: 8000,
});

type Handler = (config: InternalAxiosRequestConfig) => Promise<unknown> | unknown;

let handler: Handler | null = null;

export function installApiMock(fn: Handler) {
  handler = fn;
}

http.interceptors.request.use(async (config) => {
  if (!handler) return config;
  config.adapter = async () => {
    const payload = await handler!(config);
    const response: AxiosResponse = {
      data: payload,
      status: 200,
      statusText: "OK",
      headers: {},
      config,
    };
    return response;
  };
  return config;
});

http.interceptors.response.use(
  (res) => res,
  (err) => {
    const msg = err?.response?.data?.error || err?.message || "请求失败";
    if (typeof msg === "string") ElMessage.error(msg);
    return Promise.reject(err);
  },
);
