<script setup lang="ts">
import { computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import BrandLogo from "@/components/BrandLogo.vue";
import HeroArtwork from "@/components/HeroArtwork.vue";
import PhoneField from "@/components/auth/PhoneField.vue";
import SmsCodeField from "@/components/auth/SmsCodeField.vue";
import PasswordField from "@/components/auth/PasswordField.vue";
import AgreementCheckbox from "@/components/auth/AgreementCheckbox.vue";
import ClearableInput from "@/components/auth/ClearableInput.vue";
import { http } from "@/api/http";
import { PASSWORD_RULES, PHONE_RE } from "@/stores/app";
import { CONTEST, ORGANIZER_GROUPS } from "@/lib/contest";
import type { User } from "@/lib/types";
import { cn } from "@/utils/cn";
import { OPS_URL } from "@/config/env";

const props = defineProps<{ mode: "login" | "register" }>();
const route = useRoute();
const router = useRouter();
const tab = ref("sms");
const loginPanel = ref<"login" | "verify" | "reset">("login");
const phone = ref("");
const code = ref("");
const account = ref("");
const password = ref("");
const username = ref("");
const agreed = ref(false);
const shake = ref(false);
const phoneInvalid = ref(false);
const resetPhone = ref("");
const resetCode = ref("");
const resetPhoneInvalid = ref(false);
const newPassword = ref("");
const confirmPassword = ref("");

const authOrganizers = ORGANIZER_GROUPS.filter((g) => g.role === "指导单位" || g.role === "主办单位");

function afterLogin(user: User) {
  ElMessage.success(`欢迎回来，${user.username}`);
  if (user.role === "admin" || user.role === "judge") {
    window.location.assign(`${OPS_URL}/login`);
    return;
  }
  const next = typeof route.query.next === "string" && route.query.next.startsWith("/") ? route.query.next : "/";
  router.replace(next);
}

function requireAgreement() {
  if (agreed.value) return true;
  shake.value = true;
  window.setTimeout(() => {
    shake.value = false;
  }, 600);
  ElMessage.warning("请先阅读并勾选用户协议与隐私政策");
  return false;
}

async function onSms() {
  if (!PHONE_RE.test(phone.value)) {
    phoneInvalid.value = true;
    ElMessage.error("请输入正确的手机号");
    return;
  }
  phoneInvalid.value = false;
  if (!code.value) return ElMessage.error("请输入验证码");
  if (!requireAgreement()) return;
  const { data } = await http.post<User>("/auth/sms", { phone: phone.value, code: code.value });
  afterLogin(data);
}

async function onPwd() {
  if (!account.value) return ElMessage.error("请输入手机号或用户名");
  if (!password.value) return ElMessage.error("请输入密码");
  if (!requireAgreement()) return;
  const { data } = await http.post<User>("/auth/password", { account: account.value, password: password.value });
  afterLogin(data);
}

async function onRegister() {
  if (!PHONE_RE.test(phone.value)) {
    phoneInvalid.value = true;
    ElMessage.error("请输入正确的手机号");
    return;
  }
  phoneInvalid.value = false;
  if (!code.value) return ElMessage.error("请输入验证码");
  if (!username.value.trim()) return ElMessage.error("请输入用户名");
  if (!PASSWORD_RULES.valid(password.value)) {
    return ElMessage.error("密码不符合安全要求，请按提示修改");
  }
  if (!requireAgreement()) return;
  await http.post<User>("/auth/register", {
    phone: phone.value,
    code: code.value,
    username: username.value,
    password: password.value,
  });
  ElMessage.success("注册成功，欢迎加入大赛！");
  router.replace("/");
}

function showForgotPassword() {
  resetPhone.value = PHONE_RE.test(account.value) ? account.value : PHONE_RE.test(phone.value) ? phone.value : "";
  resetCode.value = "";
  resetPhoneInvalid.value = false;
  newPassword.value = "";
  confirmPassword.value = "";
  loginPanel.value = "verify";
}

function backToLogin() {
  loginPanel.value = "login";
  tab.value = "password";
}

async function onVerifyReset() {
  if (!PHONE_RE.test(resetPhone.value)) {
    resetPhoneInvalid.value = true;
    ElMessage.error("请输入正确的手机号");
    return;
  }
  resetPhoneInvalid.value = false;
  if (!resetCode.value) return ElMessage.error("请输入验证码");
  await http.post("/auth/verify-reset", { phone: resetPhone.value, code: resetCode.value });
  ElMessage.success("身份验证通过，请设置新密码");
  loginPanel.value = "reset";
}

async function onResetPassword() {
  if (!PASSWORD_RULES.valid(newPassword.value)) {
    return ElMessage.error("密码不符合安全要求，请按提示修改");
  }
  if (newPassword.value !== confirmPassword.value) {
    return ElMessage.error("两次输入的密码不一致");
  }
  await http.post<User>("/auth/reset-password", {
    phone: resetPhone.value,
    code: resetCode.value,
    password: newPassword.value,
  });
  ElMessage.success("密码重置成功，请使用新密码登录");
  account.value = resetPhone.value;
  password.value = "";
  window.setTimeout(() => {
    backToLogin();
  }, 900);
}

const corner = computed(() =>
  props.mode === "login" ? { href: "/register", label: "注册账号" } : { href: "/login", label: "去登录" },
);
</script>

<template>
  <div class="auth-page">
    <div class="auth-bg" aria-hidden>
      <div class="auth-glow auth-glow-a" />
      <div class="auth-glow auth-glow-b" />
      <div class="auth-grid" />
      <svg class="auth-circuit" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="auth-line" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stop-color="#3b82f6" stop-opacity="0" />
            <stop offset="0.4" stop-color="#38bdf8" stop-opacity="0.55" />
            <stop offset="1" stop-color="#22d3ee" stop-opacity="0" />
          </linearGradient>
        </defs>
        <path
          fill="none"
          stroke="url(#auth-line)"
          stroke-width="1.2"
          d="M-40 220 C180 140 280 360 520 240 S860 80 1100 210 S1380 360 1500 280"
        />
        <path
          fill="none"
          stroke="url(#auth-line)"
          stroke-width="1"
          d="M-20 640 C220 520 420 760 680 600 S1080 420 1500 560"
        />
        <path
          fill="none"
          stroke="url(#auth-line)"
          stroke-width="0.8"
          d="M40 820 C300 700 560 860 820 740 S1240 620 1480 760"
        />
      </svg>
    </div>

    <div class="auth-shell">
      <RouterLink to="/" class="auth-home">返回首页</RouterLink>
      <section class="auth-hero">
        <div class="pr-16">
          <BrandLogo cyan-tone />
        </div>
        <div class="auth-hero-heading">
          <h1 class="auth-title">{{ CONTEST.name }}</h1>
          <p class="auth-subtitle">面向全国征集可落地的工业 AI 方案，探索无限可能</p>
        </div>
        <div class="auth-art">
          <HeroArtwork class="auth-artwork" />
        </div>
      </section>

      <section class="auth-side">
        <div class="auth-panel">
          <button
            v-if="mode === 'login' && loginPanel !== 'login'"
            type="button"
            class="auth-text-link"
            @click="backToLogin"
          >
            返回登录
          </button>
          <RouterLink v-else :to="corner.href" class="auth-text-link">
            {{ corner.label }}
          </RouterLink>

          <template v-if="mode === 'login'">
            <template v-if="loginPanel === 'login'">
              <div class="flex gap-7">
                <button type="button" :class="cn('auth-tab', tab === 'sms' && 'is-active')" @click="tab = 'sms'">
                  短信登录
                </button>
                <button
                  type="button"
                  :class="cn('auth-tab', tab === 'password' && 'is-active')"
                  @click="tab = 'password'"
                >
                  账号登录
                </button>
              </div>

              <form v-if="tab === 'sms'" class="mt-6 space-y-4" novalidate @submit.prevent="onSms">
                <PhoneField v-model="phone" :invalid="phoneInvalid" />
                <SmsCodeField v-model="code" :phone="phone" />
                <AgreementCheckbox v-model="agreed" :shake="shake" />
                <button type="submit" class="auth-submit">登录</button>
                <p class="text-center text-xs text-slate-500">未注册的手机号验证后将自动创建账号</p>
              </form>

              <form v-else class="mt-6 space-y-4" novalidate @submit.prevent="onPwd">
                <div>
                  <label class="apply-field-label mb-1.5">手机号</label>
                  <ClearableInput v-model="account" placeholder="请输入手机号" autocomplete="username" />
                </div>
                <PasswordField
                  v-model="password"
                  autocomplete="current-password"
                  show-forgot
                  @forgot="showForgotPassword"
                />
                <AgreementCheckbox v-model="agreed" :shake="shake" />
                <button type="submit" class="auth-submit">登录</button>
              </form>
            </template>

            <form v-else-if="loginPanel === 'verify'" class="auth-reset-form" novalidate @submit.prevent="onVerifyReset">
              <div>
                <h2 class="auth-panel-title">身份验证</h2>
                <p class="auth-panel-desc">为确保账号安全，请先进行身份验证</p>
              </div>
              <div>
                <PhoneField v-model="resetPhone" :invalid="resetPhoneInvalid" />
              </div>
              <SmsCodeField v-model="resetCode" :phone="resetPhone" />
              <button type="submit" class="auth-submit">验 证</button>
            </form>

            <form v-else class="auth-reset-form" novalidate @submit.prevent="onResetPassword">
              <div>
                <h2 class="auth-panel-title">新密码</h2>
                <p class="auth-panel-desc">请重新设置账号密码</p>
              </div>
              <PasswordField
                v-model="newPassword"
                label="设置密码"
                show-rules
                placeholder="请输入账号密码"
                autocomplete="new-password"
              />
              <PasswordField
                v-model="confirmPassword"
                label="再次输入密码"
                placeholder="请输入账号密码"
                autocomplete="new-password"
              />
              <button type="submit" class="auth-submit">完 成</button>
            </form>
          </template>

          <form v-else class="space-y-4" novalidate @submit.prevent="onRegister">
            <h2 class="auth-panel-title">账号注册</h2>
            <PhoneField v-model="phone" :invalid="phoneInvalid" />
            <SmsCodeField v-model="code" :phone="phone" />
            <div>
              <label class="apply-field-label mb-1.5">用户名</label>
              <ClearableInput v-model="username" placeholder="请输入用户名" :maxlength="20" autocomplete="nickname" />
            </div>
            <PasswordField
              v-model="password"
              label="设置密码"
              show-rules
              placeholder="请设置登录密码"
              autocomplete="new-password"
            />
            <AgreementCheckbox v-model="agreed" :shake="shake" />
            <button type="submit" class="auth-submit">完成注册</button>
          </form>
        </div>
      </section>

      <footer class="auth-hero-foot">
        <div class="auth-orgs">
          <div v-for="group in authOrganizers" :key="group.role" class="auth-org-group">
            <span class="auth-org-role">{{ group.role }}</span>
            <div class="auth-org-names">
              <span v-for="name in group.names" :key="name">{{ name }}</span>
            </div>
          </div>
        </div>
        <p class="auth-copy">© {{ CONTEST.year }} 上海电气 {{ CONTEST.name }}</p>
      </footer>
    </div>
  </div>
</template>

<style scoped>
.auth-page {
  position: relative;
  min-height: 100svh;
  overflow-x: clip;
  background: #061433;
  color: #e8f1ff;
}

.auth-bg {
  pointer-events: none;
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.auth-glow {
  position: absolute;
  border-radius: 999px;
  filter: blur(40px);
}

.auth-glow-a {
  top: -12%;
  left: 8%;
  width: 42rem;
  height: 42rem;
  background: radial-gradient(closest-side, rgba(37, 99, 235, 0.38), transparent 72%);
}

.auth-glow-b {
  right: -8%;
  bottom: -18%;
  width: 36rem;
  height: 36rem;
  background: radial-gradient(closest-side, rgba(14, 165, 233, 0.28), transparent 72%);
}

.auth-grid {
  position: absolute;
  inset: 0;
  opacity: 0.22;
  background-image:
    linear-gradient(rgba(96, 165, 250, 0.12) 1px, transparent 1px),
    linear-gradient(90deg, rgba(96, 165, 250, 0.12) 1px, transparent 1px);
  background-size: 56px 56px;
  mask-image: radial-gradient(ellipse at 32% 48%, black 28%, transparent 78%);
}

.auth-circuit {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0.7;
}

.auth-shell {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  min-height: 100svh;
  width: min(520px, calc(100% - 2rem));
  margin: 0 auto;
  padding: 24px 0 32px;
  gap: 24px;
}

.auth-home {
  position: absolute;
  top: 28px;
  right: 0;
  z-index: 3;
  font-size: 12px;
  color: #67e8f9;
  transition: color 0.2s;
}

.auth-home:hover {
  color: #fff;
}

.auth-hero {
  display: flex;
  min-width: 0;
  flex-direction: column;
}

.auth-hero-heading {
  margin-top: 24px;
}

.auth-title {
  font-size: clamp(1.5rem, 5vw, 2rem);
  font-weight: 700;
  letter-spacing: 0.04em;
  line-height: 1.2;
  color: #f4f8ff;
  text-shadow: 0 0 40px rgba(59, 130, 246, 0.35);
}

.auth-subtitle {
  margin-top: 8px;
  max-width: 28rem;
  font-size: 15px;
  line-height: 1.7;
  color: #93b0d6;
}

.auth-art {
  display: none;
  flex: 1;
  align-items: center;
  justify-content: center;
  min-height: 0;
  padding: 4px 0;
}

.auth-artwork {
  width: min(100%, 38svh, 380px);
}

.auth-hero-foot {
  min-width: 0;
  border-top: 1px solid rgba(34, 211, 238, 0.2);
  padding-top: 12px;
}

.auth-orgs {
  display: grid;
  gap: 8px;
}

.auth-org-group {
  display: grid;
  grid-template-columns: 68px minmax(0, 1fr);
  align-items: start;
  gap: 10px;
}

.auth-org-role {
  border-radius: 4px;
  background: rgba(34, 211, 238, 0.1);
  padding: 2px 4px;
  text-align: center;
  font-size: 11px;
  white-space: nowrap;
  color: #67e8f9;
}

.auth-org-names {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 16px;
  padding-top: 2px;
  font-size: 12px;
  line-height: 1.5;
  color: #d7e4f8;
}

.auth-copy {
  margin-top: 10px;
  font-size: 11px;
  color: #6d86b0;
}

.auth-side {
  position: relative;
  display: flex;
  align-items: flex-start;
  justify-content: center;
}

.auth-panel {
  position: relative;
  width: min(100%, 440px);
  padding: 30px 28px 26px;
  border-radius: 16px;
  border: 1px solid rgba(34, 211, 238, 0.25);
  background: linear-gradient(180deg, rgba(16, 47, 85, 0.78) 0%, rgba(9, 30, 63, 0.86) 100%);
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.04) inset,
    0 28px 80px -28px rgba(8, 24, 80, 0.85);
  backdrop-filter: blur(18px);
}

.auth-text-link {
  position: absolute;
  top: 16px;
  right: 20px;
  font-size: 13px;
  color: #67e8f9;
  transition: color 0.2s;
}

.auth-text-link:hover {
  color: #fff;
}

.auth-panel-title {
  padding-top: 4px;
  font-size: 20px;
  font-weight: 600;
  color: #fff;
}

.auth-panel-desc {
  margin-top: 14px;
  font-size: 15px;
  line-height: 1.6;
  color: #8ea9cf;
}

.auth-reset-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.auth-submit {
  height: 44px;
  width: 100%;
  border-radius: 8px;
  background: linear-gradient(180deg, #0ea5e9 0%, #0284c7 100%);
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 0.12em;
  color: #fff;
  box-shadow: 0 12px 28px -10px rgba(14, 165, 233, 0.65);
  transition:
    transform 0.2s,
    filter 0.2s;
}

.auth-submit:hover {
  transform: translateY(-1px);
  filter: brightness(1.06);
}

@media (min-width: 1024px) {
  .auth-shell {
    display: grid;
    height: 100svh;
    min-height: 740px;
    grid-template-columns: minmax(0, 1.15fr) minmax(380px, 460px);
    align-items: stretch;
    width: min(1200px, calc(100% - 64px));
    padding: 24px 0;
    gap: 40px;
  }

  .auth-hero {
    grid-column: 1;
    grid-row: 1;
    padding-bottom: 112px;
  }

  .auth-hero-heading {
    margin-top: 32px;
  }

  .auth-title {
    font-size: clamp(2rem, 3.6vw, 3rem);
  }

  .auth-subtitle {
    margin-top: 10px;
  }

  .auth-art {
    display: flex;
  }

  .auth-side {
    grid-column: 2;
    grid-row: 1;
    align-items: center;
    justify-content: flex-end;
  }

  .auth-hero-foot {
    position: absolute;
    right: 500px;
    bottom: 24px;
    left: 0;
  }
}
</style>
