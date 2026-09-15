<script setup lang="ts">
import { computed } from "vue";
import { RouterLink } from "vue-router";

const props = withDefaults(
  defineProps<{ compact?: boolean; fullName?: boolean }>(),
  { compact: false, fullName: false },
);

const r = (n: number) => Math.round(n * 1000) / 1000;
const teeth = computed(() =>
  Array.from({ length: 12 }).map((_, i) => {
    const a = (i * Math.PI * 2) / 12;
    return {
      x1: r(32 + Math.cos(a) * 19.5),
      y1: r(32 + Math.sin(a) * 19.5),
      x2: r(32 + Math.cos(a) * 26),
      y2: r(32 + Math.sin(a) * 26),
    };
  }),
);
</script>

<template>
  <RouterLink to="/" class="flex items-center gap-2">
    <svg viewBox="0 0 64 64" class="size-9 drop-shadow-[0_0_10px_rgba(34,211,238,.35)]" aria-hidden fill="none">
      <defs>
        <linearGradient id="bm-g" x1="0" y1="0" x2="64" y2="64">
          <stop offset="0" stop-color="#a5f3fc" />
          <stop offset="0.45" stop-color="#22d3ee" />
          <stop offset="1" stop-color="#2dd4bf" />
        </linearGradient>
        <radialGradient id="bm-core" cx="50%" cy="45%" r="55%">
          <stop offset="0" stop-color="#ecfeff" stop-opacity="0.95" />
          <stop offset="0.45" stop-color="#22d3ee" stop-opacity="0.55" />
          <stop offset="1" stop-color="#0891b2" stop-opacity="0.05" />
        </radialGradient>
      </defs>
      <circle cx="32" cy="32" r="30" stroke="url(#bm-g)" stroke-width="1" opacity="0.35" stroke-dasharray="3 5" />
      <g stroke="url(#bm-g)" stroke-width="2.8" stroke-linecap="round">
        <circle cx="32" cy="32" r="17.5" />
        <line v-for="(t, i) in teeth" :key="i" :x1="t.x1" :y1="t.y1" :x2="t.x2" :y2="t.y2" />
      </g>
      <circle cx="32" cy="32" r="11" fill="url(#bm-core)" />
      <path
        d="M26.2 37.2 L32 23.5 L37.8 37.2 M28.4 32.2 H35.6"
        stroke="#ecfeff"
        stroke-width="2.6"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <circle cx="32" cy="23.5" r="2.2" fill="#67e8f9" />
      <circle cx="26.2" cy="37.2" r="2" fill="#2dd4bf" />
      <circle cx="37.8" cy="37.2" r="2" fill="#38bdf8" />
    </svg>
    <span v-if="fullName" class="font-display text-[15px] leading-snug font-bold tracking-wide text-white sm:text-base">
      AI原生智能工厂创新应用大赛
    </span>
    <span v-else-if="!compact" class="flex flex-col leading-none">
      <span class="font-display text-[13px] font-black tracking-[0.08em] text-[#3aa4ff]">AI原生智能工厂</span>
      <span
        class="mt-1 inline-block origin-left -skew-x-[12deg] bg-linear-to-r from-[#2ea8ff] via-[#7c5cff] to-[#e879f9] bg-clip-text text-[11px] font-black tracking-[0.22em] text-transparent"
      >
        创新应用大赛
      </span>
    </span>
  </RouterLink>
</template>
