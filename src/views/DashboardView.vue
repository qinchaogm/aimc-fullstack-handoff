<script setup lang="ts">
import { computed, reactive, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import {
  Bell,
  CheckCheck,
  ClipboardList,
  Home,
  LogOut,
  ShieldCheck,
  Trophy,
  UserRound,
} from "lucide-vue-next";
import DashboardContest from "@/views/DashboardContest.vue";
import { ROLE_LABEL, useAppStore } from "@/stores/app";
import { cn } from "@/utils/cn";

const TABS = [
  { key: "profile", label: "我的资料", icon: UserRound },
  { key: "contest", label: "我的比赛", icon: Trophy, roles: ["user"] as const },
  { key: "notifications", label: "消息通知", icon: Bell },
] as const;
type TabKey = (typeof TABS)[number]["key"];

const store = useAppStore();
const route = useRoute();
const router = useRouter();

const me = computed(() => store.currentUser);

const visibleTabs = computed(() =>
  TABS.filter((t) => {
    if (!("roles" in t) || !t.roles) return true;
    return !!me.value && (t.roles as readonly string[]).includes(me.value.role);
  }),
);

const tab = computed<TabKey>(() => {
  const raw = String(route.query.tab ?? "profile");
  const keys = visibleTabs.value.map((t) => t.key);
  return keys.includes(raw as TabKey) ? (raw as TabKey) : "profile";
});

function setTab(key: TabKey) {
  router.replace({ query: { ...route.query, tab: key } });
}

const hasProject = computed(() => !!me.value && store.registrations.some((r) => r.userId === me.value!.id));
const unread = computed(() =>
  store.notifications.filter((n) => !n.read && (n.userId === "all" || n.userId === me.value?.id)).length,
);

const form = reactive({
  username: "",
  email: "",
  organization: "",
  title: "",
});

watch(
  me,
  (user) => {
    if (!user) return;
    form.username = user.username;
    form.email = user.email ?? "";
    form.organization = user.organization ?? "";
    form.title = user.title ?? "";
  },
  { immediate: true },
);

function saveProfile() {
  if (!form.username.trim()) return ElMessage.error("用户名不能为空");
  store.updateProfile({
    username: form.username.trim(),
    email: form.email,
    organization: form.organization,
    title: form.title,
  });
  ElMessage.success("资料已保存");
}

function onLogout() {
  store.logout();
  router.push("/login");
}

const inbox = computed(() =>
  store.notifications
    .filter((n) => n.userId === "all" || n.userId === me.value?.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
);

const tabTitle = computed(() => visibleTabs.value.find((t) => t.key === tab.value)?.label ?? "个人中心");
</script>

<template>
  <div v-if="me" class="dashboard-shell">
    <aside class="dashboard-side">
      <div class="dashboard-brand">
        <el-avatar :size="40" class="!bg-linear-to-br from-tech-blue to-tech-cyan text-base font-bold text-white">
          {{ me.username.slice(0, 1) }}
        </el-avatar>
        <div class="min-w-0 flex-1">
          <p class="truncate text-sm font-semibold text-white">{{ me.username }}</p>
          <p class="truncate text-[11px] text-slate-400">
            {{ ROLE_LABEL[me.role] }}
            <template v-if="me.organization"> · {{ me.organization }}</template>
          </p>
        </div>
      </div>

      <nav class="dashboard-nav">
        <button
          v-for="item in visibleTabs"
          :key="item.key"
          type="button"
          :class="cn('dashboard-nav-item', tab === item.key && 'is-active')"
          @click="setTab(item.key)"
        >
          <component :is="item.icon" class="size-4 shrink-0" />
          <span class="flex-1 text-left">{{ item.label }}</span>
          <span
            v-if="item.key === 'notifications' && unread > 0"
            class="min-w-5 rounded-full bg-rose-500 px-1.5 text-center text-[10px] font-semibold text-white"
          >
            {{ unread }}
          </span>
        </button>
      </nav>

      <div class="dashboard-side-foot">
        <RouterLink
          v-if="me.role === 'user' && store.contestStage === 'registration'"
          to="/apply"
          class="dashboard-nav-item"
        >
          <ClipboardList class="size-4" />
          {{ hasProject ? "修改报名信息" : "我要报名" }}
        </RouterLink>
        <RouterLink v-if="me.role === 'admin'" to="/admin/registrations" class="dashboard-nav-item">
          <ShieldCheck class="size-4" /> 管理后台
        </RouterLink>
        <RouterLink to="/" class="dashboard-nav-item">
          <Home class="size-4" /> 返回首页
        </RouterLink>
        <button type="button" class="dashboard-nav-item text-rose-300 hover:!bg-rose-500/10" @click="onLogout">
          <LogOut class="size-4" /> 退出登录
        </button>
      </div>
    </aside>

    <div class="dashboard-main">
      <header class="dashboard-top">
        <h1 class="text-base font-semibold text-white">{{ tabTitle }}</h1>
        <p class="hidden text-xs text-slate-500 sm:block">
        {{ me.phone.replace(/(\d{3})\d{4}(\d{4})/, "$1****$2") }}
        </p>
      </header>

      <div class="dashboard-content">
        <section class="dashboard-panel">
          <form v-if="tab === 'profile'" class="space-y-6" @submit.prevent="saveProfile">
            <div>
              <h2 class="text-lg font-semibold text-white">我的资料</h2>
              <p class="mt-1 text-sm text-slate-400">完善资料有助于组委会与您取得联系。</p>
            </div>
            <div class="grid gap-5 sm:grid-cols-2">
              <div>
                <p class="mb-1.5 text-sm text-slate-200">手机号</p>
                <el-input :model-value="`${me.phone}`" disabled />
              </div>
              <div>
                <p class="mb-1.5 text-sm text-slate-200">账号身份</p>
                <el-input :model-value="ROLE_LABEL[me.role]" disabled />
              </div>
              <div>
                <p class="mb-1.5 text-sm text-slate-200">用户名</p>
                <el-input v-model="form.username" maxlength="20" />
              </div>
              <div>
                <p class="mb-1.5 text-sm text-slate-200">电子邮箱</p>
                <el-input v-model="form.email" placeholder="用于接收赛事通知" />
              </div>
              <div>
                <p class="mb-1.5 text-sm text-slate-200">所属单位</p>
                <el-input v-model="form.organization" placeholder="企业 / 高校 / 个人" />
              </div>
              <div>
                <p class="mb-1.5 text-sm text-slate-200">职务 / 头衔</p>
                <el-input v-model="form.title" />
              </div>
            </div>
            <div class="flex justify-end border-t border-white/8 pt-5">
              <button class="btn-nova h-10 rounded-xl px-6" type="submit">保存资料</button>
            </div>
          </form>

          <DashboardContest v-else-if="tab === 'contest'" />

          <div v-else>
            <div class="flex items-center justify-between gap-3">
              <div>
                <h2 class="text-lg font-semibold text-white">消息通知</h2>
                <p class="mt-1 text-sm text-slate-400">赛事公告、审核结果与系统消息，点击未读消息即可标为已读。</p>
              </div>
              <button
                v-if="unread > 0"
                class="inline-flex shrink-0 items-center gap-1 text-sm text-slate-300 hover:text-white"
                @click="store.markAllNotificationsRead()"
              >
                <CheckCheck class="size-4" /> 全部已读
              </button>
            </div>
            <div v-if="!inbox.length" class="flex min-h-[300px] flex-col items-center justify-center text-slate-500">
              <Bell class="size-8" />
              <p class="mt-3 text-sm">暂无消息</p>
            </div>
            <ul v-else class="mt-6 divide-y divide-white/8">
              <li
                v-for="n in inbox"
                :key="n.id"
                :class="cn('flex items-start gap-3 py-5 first:pt-2', !n.read && 'cursor-pointer')"
                @click="store.markNotificationRead(n.id)"
              >
                <span class="mt-2 flex h-2.5 w-2.5 shrink-0 items-center justify-center">
                  <span v-if="!n.read" class="size-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,.85)]" />
                </span>
                <div class="min-w-0 flex-1">
                  <div
                    :class="
                      n.read
                        ? 'notice-html notice-html--title text-base font-medium text-slate-300'
                        : 'notice-html notice-html--title text-base font-medium text-white'
                    "
                    v-html="n.title"
                  />
                  <div class="notice-html mt-2 text-[15px] leading-7 text-slate-300" v-html="n.body" />
                  <p class="mt-3 text-xs text-slate-500">
                    {{ new Date(n.createdAt).toLocaleString("zh-CN", { hour12: false }) }}
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard-shell {
  display: flex;
  min-height: 100vh;
  background: #020617;
  color: #e2e8f0;
}

.dashboard-side {
  display: flex;
  width: 240px;
  flex-shrink: 0;
  flex-direction: column;
  border-right: 1px solid rgba(255, 255, 255, 0.08);
  background: #0b1220;
}

.dashboard-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 18px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.dashboard-nav {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 4px;
  padding: 12px 10px;
}

.dashboard-side-foot {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px 10px 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.dashboard-nav-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  border-radius: 10px;
  padding: 10px 12px;
  font-size: 14px;
  color: #94a3b8;
  transition: background 0.15s, color 0.15s;
}

.dashboard-nav-item:hover {
  background: rgba(255, 255, 255, 0.05);
  color: #f8fafc;
}

.dashboard-nav-item.is-active {
  background: rgba(37, 99, 235, 0.22);
  color: #fff;
  box-shadow: inset 0 0 0 1px rgba(96, 165, 250, 0.35);
}

.dashboard-main {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
}

.dashboard-top {
  display: flex;
  height: 56px;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(2, 6, 23, 0.85);
  padding: 0 24px;
  backdrop-filter: blur(10px);
}

.dashboard-content {
  flex: 1;
  overflow: auto;
  padding: 20px 24px 32px;
}

.dashboard-panel {
  min-height: calc(100vh - 120px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.03);
  padding: 24px;
}

@media (max-width: 768px) {
  .dashboard-shell {
    flex-direction: column;
  }

  .dashboard-side {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }

  .dashboard-nav {
    flex-direction: row;
    flex-wrap: wrap;
    flex: none;
  }

  .dashboard-nav-item {
    flex: 1 1 auto;
    min-width: 30%;
  }

  .dashboard-side-foot {
    flex-direction: row;
    flex-wrap: wrap;
  }

  .dashboard-content {
    padding: 16px;
  }

  .dashboard-panel {
    min-height: auto;
    padding: 16px;
  }
}
</style>
