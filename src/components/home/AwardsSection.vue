<script setup lang="ts">
import { AWARDS } from "@/lib/contest";
import { cn } from "@/utils/cn";
import SectionTitle from "./SectionTitle.vue";

const AWARD_TONES = [
  { main: "#ffd866", light: "#fff4b8", deep: "#9a5d00", glow: "rgba(255,190,67,.55)", border: "border-amber-300/35" },
  { main: "#c4b5fd", light: "#ede9fe", deep: "#5b21b6", glow: "rgba(167,139,250,.55)", border: "border-violet-300/40" },
  { main: "#67e8f9", light: "#cffafe", deep: "#0e7490", glow: "rgba(34,211,238,.48)", border: "border-cyan-300/35" },
];
</script>

<template>
  <section id="awards" class="home-section relative scroll-mt-20 py-24">
    <div class="absolute inset-x-0 top-0 -z-10 h-px bg-linear-to-r from-transparent via-violet-400/40 to-transparent" />
    <div class="absolute top-16 left-1/2 -z-10 h-96 w-[900px] -translate-x-1/2 bg-[radial-gradient(closest-side,rgba(139,92,246,.16),transparent_74%)]" />
    <div class="mx-auto max-w-7xl px-4 sm:px-6">
      <SectionTitle
        title="奖项设置"
        desc="奖项名额按参赛规模与质量确定；优秀作品有机会与企业签订框架协议，共同落地。"
      />

      <div class="mt-16 grid gap-5 md:grid-cols-3">
        <div
          v-for="(a, i) in AWARDS"
          :key="a.level"
          :class="
            cn(
              'group relative flex min-h-[370px] flex-col overflow-hidden rounded-3xl border px-6 pt-5 pb-7 text-center backdrop-blur-xl transition-all duration-500 hover:-translate-y-3',
              AWARD_TONES[i].border,
              i === 0
                ? 'bg-[linear-gradient(180deg,rgba(90,60,10,.35),rgba(8,16,28,.9))] shadow-[0_0_50px_-10px_rgba(255,186,63,.55)]'
                : i === 1
                  ? 'bg-[linear-gradient(180deg,rgba(70,40,130,.4),rgba(8,14,30,.92))] shadow-[0_0_40px_-12px_rgba(167,139,250,.5)]'
                  : 'bg-[linear-gradient(180deg,rgba(10,70,90,.38),rgba(6,20,32,.92))] shadow-[0_0_40px_-12px_rgba(34,211,238,.4)]',
            )
          "
        >
          <div
            class="relative mx-auto h-40 w-40 transition-transform duration-700 [transform-style:preserve-3d] group-hover:[transform:rotateY(-8deg)_rotateX(5deg)_scale(1.08)]"
            :style="{ filter: `drop-shadow(0 18px 24px ${AWARD_TONES[i].glow})` }"
          >
            <div
              class="absolute inset-[16%] opacity-70 transition-opacity duration-700 group-hover:opacity-100"
              :style="{ background: `radial-gradient(closest-side, ${AWARD_TONES[i].glow}, transparent 72%)` }"
            />
            <svg viewBox="0 0 220 220" class="relative h-full w-full overflow-visible" aria-hidden>
              <defs>
                <linearGradient :id="`award-${i + 1}-metal`" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" :stop-color="AWARD_TONES[i].deep" />
                  <stop offset=".2" :stop-color="AWARD_TONES[i].main" />
                  <stop offset=".44" :stop-color="AWARD_TONES[i].light" />
                  <stop offset=".63" :stop-color="AWARD_TONES[i].main" />
                  <stop offset="1" :stop-color="AWARD_TONES[i].deep" />
                </linearGradient>
                <linearGradient :id="`award-${i + 1}-dark`" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" :stop-color="AWARD_TONES[i].main" />
                  <stop offset="1" :stop-color="AWARD_TONES[i].deep" />
                </linearGradient>
                <radialGradient :id="`award-${i + 1}-core`">
                  <stop offset="0" stop-color="#f5f3ff" stop-opacity=".95" />
                  <stop offset=".3" stop-color="#a78bfa" stop-opacity=".72" />
                  <stop offset="1" stop-color="#22d3ee" stop-opacity=".08" />
                </radialGradient>
              </defs>
              <ellipse cx="110" cy="188" rx="78" ry="17" fill="none" stroke="#22d3ee" stroke-opacity=".35" stroke-dasharray="4 9" />
              <path d="M63 57H38c-2 37 13 58 43 62" fill="none" :stroke="`url(#award-${i + 1}-metal)`" stroke-width="12" stroke-linecap="round" />
              <path d="M157 57h25c2 37-13 58-43 62" fill="none" :stroke="`url(#award-${i + 1}-metal)`" stroke-width="12" stroke-linecap="round" />
              <path
                d="M58 39h104l-8 57c-4 30-20 48-44 48S70 126 66 96L58 39Z"
                :fill="`url(#award-${i + 1}-metal)`"
                :stroke="AWARD_TONES[i].light"
                stroke-opacity=".75"
                stroke-width="2"
              />
              <circle cx="110" cy="83" r="31" :fill="`url(#award-${i + 1}-core)`" />
              <circle cx="110" cy="83" r="22" fill="#070714" fill-opacity=".8" :stroke="AWARD_TONES[i].light" stroke-opacity=".75" />
              <text x="110" y="94" text-anchor="middle" font-size="34" font-weight="800" :fill="`url(#award-${i + 1}-metal)`">
                {{ i + 1 }}
              </text>
              <path d="M101 137h18v29h-18z" :fill="`url(#award-${i + 1}-dark)`" />
              <path
                d="M79 162h62l12 21H67l12-21Z"
                :fill="`url(#award-${i + 1}-metal)`"
                :stroke="AWARD_TONES[i].light"
                stroke-opacity=".55"
              />
              <path
                d="M61 182h98l8 17H53l8-17Z"
                :fill="`url(#award-${i + 1}-dark)`"
                :stroke="AWARD_TONES[i].main"
                stroke-width="1.5"
              />
            </svg>
          </div>
          <p class="mt-1 text-sm font-semibold tracking-[0.25em]" :style="{ color: AWARD_TONES[i].light }">{{ a.level }}</p>
          <p class="mt-3 text-4xl font-bold tracking-tight text-white">
            {{ a.amount.replace("¥", "") }}
            <span class="ml-1 text-sm font-medium text-slate-400">元</span>
          </p>
          <p class="mt-2 text-xs text-slate-400">共 {{ a.count }} 组</p>
          <p class="mt-auto border-t border-white/10 pt-4 text-xs leading-6 text-slate-400">{{ a.perks }}</p>
        </div>
      </div>
    </div>
  </section>
</template>
