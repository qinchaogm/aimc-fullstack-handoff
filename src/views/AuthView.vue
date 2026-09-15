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
const phone = ref("");
const code = ref("");
const account = ref("");
const password = ref("");
const username = ref("");
const agreed = ref(false);
const shake = ref(false);
const phoneInvalid = ref(false);

const footChips = ORGANIZER_GROUPS.filter((g) => g.role === "指导单位" || g.role === "主办单位").flatMap((g) =>
  g.names.map((name) => ({ role: g.role, name })),
);

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
  if (!PASSWORD_RULES.composition(password.value) || !PASSWORD_RULES.length(password.value)) {
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
          <BrandLogo />
        </div>
        <div class="mt-10 lg:mt-14">
          <h1 class="auth-title">{{ CONTEST.name }}</h1>
          <p class="auth-subtitle">面向全国征集可落地的工业 AI 方案，探索无限可能</p>
        </div>
        <div class="auth-art">
          <HeroArtwork class="w-[min(100%,460px)]" />
        </div>
        <div class="auth-hero-foot">
          <div class="auth-orgs">
            <span v-for="item in footChips" :key="item.name" class="auth-org">
              <em>{{ item.role }}</em>
              {{ item.name }}
            </span>
          </div>
          <p class="auth-copy">© {{ CONTEST.year }} 上海电气 {{ CONTEST.name }}</p>
        </div>
      </section>

      <section class="auth-side">
        <div class="auth-panel">
          <RouterLink :to="corner.href" class="auth-text-link">{{ corner.label }}</RouterLink>

          <template v-if="mode === 'login'">
            <div class="flex gap-7">
              <button type="button" :class="cn('auth-tab', tab === 'sms' && 'is-active')" @click="tab = 'sms'">
                短信登录
              </button>
              <button type="button" :class="cn('auth-tab', tab === 'password' && 'is-active')" @click="tab = 'password'">
                账号登录
              </button>
            </div>

            <form v-if="tab === 'sms'" class="mt-7 space-y-5" novalidate @submit.prevent="onSms">
              <PhoneField v-model="phone" :invalid="phoneInvalid" />
              <SmsCodeField v-model="code" :phone="phone" />
              <AgreementCheckbox v-model="agreed" :shake="shake" />
              <button type="submit" class="auth-submit">登录</button>
              <p class="text-center text-xs text-slate-500">未注册的手机号验证后将自动创建账号</p>
            </form>

            <form v-else class="mt-7 space-y-5" novalidate @submit.prevent="onPwd">
              <div>
                <label class="apply-field-label mb-1.5">手机号 / 用户名</label>
                <ClearableInput v-model="account" placeholder="请输入手机号或用户名" autocomplete="username" />
              </div>
              <PasswordField v-model="password" autocomplete="current-password" />
              <AgreementCheckbox v-model="agreed" :shake="shake" />
              <button type="submit" class="auth-submit">登录</button>
            </form>
          </template>

          <form v-else class="space-y-5" novalidate @submit.prevent="onRegister">
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
    </div>
  </div>
</template>

<style scoped>
.auth-page {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  background: #061433;
  color: #e8f1ff;
}

.auth-bg {
  pointer-events: none;
  position: absolute;
  inset: 0;
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
  display: grid;
  min-height: 100vh;
  width: min(1280px, calc(100% - 2rem));
  margin: 0 auto;
  padding: 28px 0 36px;
  gap: 32px;
}

.auth-home {
  position: absolute;
  top: 32px;
  right: 0;
  z-index: 3;
  font-size: 12px;
  color: #8aa0c4;
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

.auth-title {
  font-size: clamp(2rem, 4.2vw, 3.15rem);
  font-weight: 700;
  letter-spacing: 0.04em;
  line-height: 1.2;
  color: #f4f8ff;
  text-shadow: 0 0 40px rgba(59, 130, 246, 0.35);
}

.auth-subtitle {
  margin-top: 12px;
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
  padding: 8px 0 12px;
}

.auth-hero-foot {
  margin-top: auto;
  padding-top: 20px;
}

.auth-orgs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 18px;
}

.auth-org {
  font-size: 12px;
  color: #d7e4f8;
}

.auth-org em {
  margin-right: 6px;
  font-style: normal;
  font-size: 11px;
  letter-spacing: 0.08em;
  color: #7f98bf;
}

.auth-copy {
  margin-top: 14px;
  font-size: 12px;
  color: #6d86b0;
}

.auth-side {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.auth-panel {
  position: relative;
  width: min(100%, 420px);
  padding: 36px 32px 28px;
  border-radius: 16px;
  border: 1px solid rgba(130, 170, 255, 0.22);
  background: linear-gradient(180deg, rgba(24, 52, 112, 0.52) 0%, rgba(12, 28, 72, 0.62) 100%);
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.04) inset,
    0 28px 80px -28px rgba(8, 24, 80, 0.85);
  backdrop-filter: blur(18px);
}

.auth-text-link {
  position: absolute;
  top: 18px;
  right: 24px;
  font-size: 13px;
  color: #8eb0e8;
  transition: color 0.2s;
}

.auth-text-link:hover {
  color: #fff;
}

.auth-panel-title {
  padding-top: 8px;
  font-size: 20px;
  font-weight: 600;
  color: #fff;
}

.auth-submit {
  height: 44px;
  width: 100%;
  border-radius: 8px;
  background: linear-gradient(180deg, #3d8bff 0%, #1d6ef5 100%);
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 0.28em;
  color: #fff;
  box-shadow: 0 12px 28px -10px rgba(29, 110, 245, 0.85);
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
    grid-template-columns: minmax(0, 1.15fr) minmax(380px, 460px);
    align-items: stretch;
    width: min(1200px, calc(100% - 64px));
    padding: 36px 0 28px;
    gap: 48px;
  }

  .auth-art {
    display: flex;
  }

  .auth-side {
    padding-top: 40px;
  }
}
</style>
