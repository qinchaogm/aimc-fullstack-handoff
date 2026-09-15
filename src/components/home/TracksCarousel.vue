<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import {
  ArrowRight,
  Bot,
  Brain,
  ChevronLeft,
  ChevronRight,
  Factory,
  Gauge,
  Network,
} from "lucide-vue-next";
import { TRACKS } from "@/lib/contest";
import { cn } from "@/utils/cn";

const ICONS = {
  factory: Factory,
  scan: Gauge,
  gauge: Gauge,
  brain: Brain,
  network: Network,
  bot: Bot,
} as const;

const TRACK_ART: Record<string, { src: string; wash: string; glow: string }> = {
  "rd-design": {
    src: "/track-rd.webp",
    wash: "from-[#3b1d8f]/18 via-transparent to-transparent",
    glow: "shadow-[0_16px_40px_-16px_rgba(139,92,246,.55)] border-violet-300/30",
  },
  manufacturing: {
    src: "/track-mfg.webp",
    wash: "from-[#0b4c8a]/16 via-transparent to-transparent",
    glow: "shadow-[0_16px_40px_-16px_rgba(56,189,248,.5)] border-sky-300/30",
  },
  om: {
    src: "/track-om.webp",
    wash: "from-[#0d6b74]/16 via-transparent to-transparent",
    glow: "shadow-[0_16px_40px_-16px_rgba(45,212,191,.48)] border-teal-300/30",
  },
  management: {
    src: "/track-mgmt.webp",
    wash: "from-[#6d1b8a]/16 via-transparent to-transparent",
    glow: "shadow-[0_16px_40px_-16px_rgba(232,121,249,.48)] border-fuchsia-300/30",
  },
  "native-factory": {
    src: "/track-factory.webp",
    wash: "from-[#155e9c]/16 via-transparent to-transparent",
    glow: "shadow-[0_16px_40px_-16px_rgba(34,211,238,.5)] border-cyan-300/35",
  },
};

function relOffset(index: number, current: number, total: number) {
  let d = index - current;
  if (d > total / 2) d -= total;
  if (d < -total / 2) d += total;
  return d;
}

const active = ref(2);
const paused = ref(false);
const startX = ref(0);
const n = TRACKS.length;
let timer: number | undefined;

function go(dir: number) {
  setActive(active.value + dir);
}

function setActive(i: number) {
  active.value = ((i % n) + n) % n;
  if (!paused.value) startLoop();
}

function cardStyle(i: number) {
  const d = relOffset(i, active.value, n);
  const abs = Math.abs(d);
  const scale = abs === 0 ? 1 : abs === 1 ? 0.9 : 0.78;
  // Keep the same visual gap as the center pair: |d|=1 uses 90% of card width;
  // |d|=2 steps from there by the scaled neighbor size instead of another 90%.
  const xPct = abs === 0 ? 0 : abs === 1 ? 90 : 164;
  return {
    transform: `translate(-50%, -52%) translateX(${Math.sign(d) * xPct}%) scale(${scale})`,
    zIndex: 20 - abs,
    opacity: abs > 2 ? 0 : abs === 2 ? 0.55 : 1,
    pointerEvents: (abs > 2 ? "none" : "auto") as "none" | "auto",
  };
}

function absOf(i: number) {
  return Math.abs(relOffset(i, active.value, n));
}

function artOf(key: string) {
  return TRACK_ART[key] ?? TRACK_ART["rd-design"];
}

function iconOf(icon: string) {
  return ICONS[icon as keyof typeof ICONS] ?? Brain;
}

function startLoop() {
  stopLoop();
  if (paused.value) return;
  timer = window.setInterval(() => go(1), 4200);
}

function stopLoop() {
  if (timer) window.clearInterval(timer);
  timer = undefined;
}

onMounted(startLoop);
onUnmounted(stopLoop);

function onPause() {
  paused.value = true;
  stopLoop();
}
function onResume() {
  paused.value = false;
  startLoop();
}
</script>

<template>
  <div
    class="relative"
    @mouseenter="onPause"
    @mouseleave="onResume"
    @touchstart.passive="startX = $event.touches[0].clientX"
    @touchend="
      (e) => {
        const dx = e.changedTouches[0].clientX - startX;
        if (dx > 40) go(-1);
        if (dx < -40) go(1);
      }
    "
  >
    <div class="relative mx-auto h-[460px] overflow-hidden sm:h-[520px]">
      <article
        v-for="(t, i) in TRACKS"
        :key="t.key"
        role="button"
        tabindex="0"
        :class="
          cn(
            'absolute top-1/2 left-1/2 h-[390px] w-[min(78vw,268px)] cursor-pointer overflow-hidden rounded-[1.6rem] border transition-[transform,opacity] duration-700 ease-out sm:h-[430px] sm:w-[300px]',
            artOf(t.key).glow,
            absOf(i) === 0 && 'ring-1 ring-white/20',
          )
        "
        :style="cardStyle(i)"
        @click="setActive(i)"
        @keydown.enter.prevent="setActive(i)"
        @keydown.space.prevent="setActive(i)"
      >
        <img :src="artOf(t.key).src" :alt="t.title" class="absolute inset-0 h-full w-full object-cover object-center" />
        <div :class="cn('absolute inset-0 bg-linear-to-t', artOf(t.key).wash)" />
        <div class="absolute inset-x-0 bottom-0 h-[34%] bg-linear-to-t from-[#12063a]/68 via-[#12063a]/18 to-transparent" />

        <div class="relative flex h-full flex-col p-5 pb-8 sm:p-5 sm:pb-10">
          <div class="flex items-center justify-between">
            <div class="flex size-9 items-center justify-center rounded-full border border-white/25 bg-white/15 text-white backdrop-blur-md">
              <component :is="iconOf(t.icon)" class="size-4" />
            </div>
            <span class="font-mono text-3xl font-light tracking-tighter text-white/35">0{{ i + 1 }}</span>
          </div>

          <div class="mt-auto mb-1 flex flex-col items-center text-center">
            <h3 class="text-xl font-black leading-snug tracking-wide text-white drop-shadow-[0_6px_18px_rgba(0,0,0,.45)] sm:text-[1.35rem]">
              {{ t.title }}
            </h3>
            <p class="mt-2 max-w-[18rem] text-[13px] leading-5 text-white/88">{{ t.desc }}</p>
            <div class="mt-3 flex flex-wrap justify-center gap-1.5">
              <span
                v-for="tag in t.tags"
                :key="tag"
                class="rounded-full border border-white/20 bg-white/10 px-2.5 py-0.5 text-[11px] text-white/80 backdrop-blur-sm"
              >
                {{ tag }}
              </span>
            </div>
            <RouterLink
              :to="`/tracks/${t.key}`"
              class="mt-4 inline-flex items-center gap-1.5 rounded-full bg-linear-to-r from-violet-500 to-fuchsia-500 px-3.5 py-1.5 text-xs font-medium text-white shadow-[0_8px_20px_-8px_rgba(168,85,247,.9)] transition hover:brightness-110"
              @click.stop
            >
              了解赛事方向
              <ArrowRight class="size-3.5" />
            </RouterLink>
          </div>
        </div>
      </article>
    </div>

    <div class="mt-6 flex items-center justify-center gap-4">
      <button
        type="button"
        aria-label="上一项"
        class="flex size-10 items-center justify-center rounded-full border border-cyan-300/30 bg-white/5 text-cyan-100 transition hover:border-cyan-200/60 hover:bg-cyan-400/10"
        @click="go(-1)"
      >
        <ChevronLeft class="size-5" />
      </button>
      <div class="flex gap-2">
        <button
          v-for="(t, i) in TRACKS"
          :key="t.key"
          type="button"
          :aria-label="t.title"
          :class="cn('h-1.5 rounded-full transition-all', i === active ? 'w-8 bg-cyan-300' : 'w-2 bg-white/25 hover:bg-white/50')"
          @click="setActive(i)"
        />
      </div>
      <button
        type="button"
        aria-label="下一项"
        class="flex size-10 items-center justify-center rounded-full border border-cyan-300/30 bg-white/5 text-cyan-100 transition hover:border-cyan-200/60 hover:bg-cyan-400/10"
        @click="go(1)"
      >
        <ChevronRight class="size-5" />
      </button>
    </div>
  </div>
</template>
