<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import { useRouter } from "vue-router";
import { ChevronDown, LogOut, UserRound } from "lucide-vue-next";
import { useAppStore } from "@/stores/app";

const store = useAppStore();
const router = useRouter();
const open = ref(false);
const root = ref<HTMLElement | null>(null);

function toggle() {
  open.value = !open.value;
}

function close() {
  open.value = false;
}

function go(path: string) {
  close();
  router.push(path);
}

function onLogout() {
  close();
  store.logout();
  router.push("/");
}

function onDoc(e: MouseEvent) {
  if (!root.value?.contains(e.target as Node)) close();
}

onMounted(() => document.addEventListener("click", onDoc));
onUnmounted(() => document.removeEventListener("click", onDoc));
</script>

<template>
  <div v-if="store.currentUser" ref="root" class="relative">
    <button
      type="button"
      class="flex items-center gap-2 rounded-full border border-white/20 bg-white py-1 pr-2.5 pl-1 text-sm font-medium text-slate-800 shadow-[0_8px_24px_-12px_rgba(2,12,20,.55)] transition hover:bg-slate-50"
      aria-haspopup="menu"
      :aria-expanded="open"
      @click.stop="toggle"
    >
      <span
        class="flex size-7 items-center justify-center rounded-full bg-linear-to-br from-sky-500 to-cyan-400 text-xs font-semibold text-white"
      >
        {{ store.currentUser.username.slice(0, 1) }}
      </span>
      <span class="hidden max-w-28 truncate sm:inline">{{ store.currentUser.username }}</span>
      <ChevronDown class="size-4 text-slate-500 transition" :class="open && 'rotate-180'" />
    </button>

    <div
      v-if="open"
      class="absolute top-[calc(100%+8px)] right-0 z-50 min-w-48 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-[0_16px_40px_-16px_rgba(2,12,20,.45)]"
      role="menu"
    >
      <button
        type="button"
        class="flex w-full items-center gap-2 px-3.5 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50"
        role="menuitem"
        @click="go('/dashboard')"
      >
        <UserRound class="size-4 text-slate-500" />
        个人中心
      </button>
      <div class="my-1 h-px bg-slate-100" />
      <button
        type="button"
        class="flex w-full items-center gap-2 px-3.5 py-2.5 text-left text-sm text-rose-600 hover:bg-rose-50"
        role="menuitem"
        @click="onLogout"
      >
        <LogOut class="size-4" />
        退出登录
      </button>
    </div>
  </div>
</template>
