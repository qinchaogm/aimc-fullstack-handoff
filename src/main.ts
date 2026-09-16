import { createApp } from "vue";
import { createPinia } from "pinia";
import ElementPlus from "element-plus";
import zhCn from "element-plus/es/locale/lang/zh-cn";
import "element-plus/dist/index.css";
import "element-plus/theme-chalk/dark/css-vars.css";
import App from "./App.vue";
import router from "./router";
import { useAppStore } from "./stores/app";
import { http, installApiMock } from "./api/http";
import "./styles/index.css";

const app = createApp(App);
const pinia = createPinia();
app.use(pinia);
app.use(router);
app.use(ElementPlus, { locale: zhCn });

const store = useAppStore();
store.hydrate();

installApiMock(async (config) => {
  const url = config.url ?? "";
  const method = (config.method ?? "get").toLowerCase();
  const body = typeof config.data === "string" ? JSON.parse(config.data || "{}") : (config.data ?? {});
  if (method === "post" && url.includes("/auth/sms")) {
    const res = store.loginWithSms(body.phone, body.code);
    if (!res.ok) throw Object.assign(new Error(res.error), { response: { data: { error: res.error } } });
    return res.data;
  }
  if (method === "post" && url.includes("/auth/password")) {
    const res = store.loginWithPassword(body.account, body.password);
    if (!res.ok) throw Object.assign(new Error(res.error), { response: { data: { error: res.error } } });
    return res.data;
  }
  if (method === "post" && url.includes("/auth/register")) {
    const res = store.register(body);
    if (!res.ok) throw Object.assign(new Error(res.error), { response: { data: { error: res.error } } });
    return res.data;
  }
  if (method === "post" && url.includes("/auth/verify-reset")) {
    const res = store.verifyResetIdentity(body.phone, body.code);
    if (!res.ok) throw Object.assign(new Error(res.error), { response: { data: { error: res.error } } });
    return res.data;
  }
  if (method === "post" && url.includes("/auth/reset-password")) {
    const res = store.resetPassword(body);
    if (!res.ok) throw Object.assign(new Error(res.error), { response: { data: { error: res.error } } });
    return res.data;
  }
  if (method === "post" && url.includes("/messages")) {
    const res = store.submitMessage(body);
    if (!res.ok) throw Object.assign(new Error(res.error), { response: { data: { error: res.error } } });
    return res.data;
  }
  return { ok: true };
});

app.config.globalProperties.$http = http;
app.mount("#app");
