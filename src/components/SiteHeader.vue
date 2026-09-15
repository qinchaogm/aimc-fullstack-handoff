<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { Menu } from "lucide-vue-next";
import BrandLogo from "@/components/BrandLogo.vue";
import UserMenu from "@/components/UserMenu.vue";
import { useAppStore } from "@/stores/app";

const NAV = [
  { href: "/#intro", label: "大赛简介" },
  { href: "/#tracks", label: "赛事方向" },
  { href: "/#schedule", label: "赛事安排" },
  { href: "/#awards", label: "奖项设置" },
  { href: "/demand", label: "需求征集" },
];

const store = useAppStore();
const router = useRouter();
const drawer = ref(false);

function onLogout() {
  store.logout();
  drawer.value = false;
  router.push("/");
}
</script>

<template>
  <header class="sticky top-0 z-40 border-b border-cyan-400/10 bg-[#021018]/72 backdrop-blur-xl">
    <div class="mx-auto flex h-16 w-full items-center justify-between pr-4 pl-3 sm:pr-6 sm:pl-4 lg:pr-10 lg:pl-5">
      <BrandLogo />
      <div class="flex items-center gap-2">
        <nav class="mr-3 hidden items-center gap-1 lg:flex">
          <RouterLink
            v-for="item in NAV"
            :key="item.href"
            :to="item.href"
            class="rounded-lg px-3 py-2 text-sm text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
          >
            {{ item.label }}
          </RouterLink>
          <span class="ml-3 h-5 w-px bg-white/10" />
        </nav>

        <UserMenu v-if="store.currentUser" />
        <template v-else>
          <RouterLink to="/register" class="rounded-lg px-3 py-2 text-sm text-slate-200 hover:bg-white/5 hover:text-white">
            注册账号
          </RouterLink>
          <RouterLink to="/login" class="btn-nova rounded-lg px-5 py-2 text-sm font-medium text-white">登录</RouterLink>
        </template>

        <el-button class="lg:!hidden" text @click="drawer = true" aria-label="打开菜单">
          <Menu class="size-5 text-white" />
        </el-button>
      </div>
    </div>
    <el-drawer v-model="drawer" size="18rem" title="导航">
      <nav class="flex flex-col gap-1">
        <RouterLink
          v-for="item in NAV"
          :key="item.href"
          :to="item.href"
          class="rounded-md px-3 py-2.5 text-sm text-slate-200 hover:bg-white/5"
          @click="drawer = false"
        >
          {{ item.label }}
        </RouterLink>
        <RouterLink
          v-if="store.currentUser"
          to="/dashboard"
          class="rounded-md px-3 py-2.5 text-sm text-slate-200 hover:bg-white/5"
          @click="drawer = false"
        >
          个人中心
        </RouterLink>
        <button
          v-if="store.currentUser"
          type="button"
          class="mt-2 rounded-md px-3 py-2.5 text-left text-sm text-rose-300 hover:bg-white/5"
          @click="onLogout"
        >
          退出登录
        </button>
        <RouterLink
          v-if="!store.currentUser"
          to="/login"
          class="mt-3 rounded-md bg-cyan-400/15 px-3 py-2.5 text-center text-sm font-medium text-cyan-100"
          @click="drawer = false"
        >
          登录
        </RouterLink>
      </nav>
    </el-drawer>
  </header>
</template>
