<script setup lang="ts">
import { AWARDS } from "@/lib/contest";
import { cn } from "@/utils/cn";
import SectionTitle from "./SectionTitle.vue";

type AwardTone = {
  main: string;
  light: string;
  deep: string;
  glow: string;
  border: string;
  wash: string;
};

type AwardItem = {
  key: string;
  award: (typeof AWARDS)[number];
  mark: string;
  crown: boolean;
  tone: AwardTone;
};

const TONES: AwardTone[] = [
  {
    main: "#fbbf24",
    light: "#fff7ed",
    deep: "#9f1239",
    glow: "rgba(251,191,36,.65)",
    border: "border-amber-200/40",
    wash: "linear-gradient(180deg, rgba(120,70,16,.42) 0%, rgba(70,22,42,.38) 42%, rgba(8,14,28,.96) 100%)",
  },
  {
    main: "#ffd866",
    light: "#fff4b8",
    deep: "#9a5d00",
    glow: "rgba(255,190,67,.55)",
    border: "border-amber-300/35",
    wash: "linear-gradient(180deg, rgba(90,60,10,.35), rgba(8,16,28,.9))",
  },
  {
    main: "#c4b5fd",
    light: "#ede9fe",
    deep: "#5b21b6",
    glow: "rgba(167,139,250,.55)",
    border: "border-violet-300/40",
    wash: "linear-gradient(180deg, rgba(70,40,130,.4), rgba(8,14,30,.92))",
  },
  {
    main: "#67e8f9",
    light: "#cffafe",
    deep: "#0e7490",
    glow: "rgba(34,211,238,.48)",
    border: "border-cyan-300/35",
    wash: "linear-gradient(180deg, rgba(10,70,90,.38), rgba(6,20,32,.92))",
  },
];

const byLevel = (level: string) => AWARDS.find((a) => a.level === level)!;

const HOME_AWARDS: AwardItem[] = [
  { key: "special", award: byLevel("特等奖"), mark: "特", crown: true, tone: TONES[0] },
  { key: "first", award: byLevel("一等奖"), mark: "1", crown: false, tone: TONES[1] },
  { key: "second", award: byLevel("二等奖"), mark: "2", crown: false, tone: TONES[2] },
  { key: "third", award: byLevel("三等奖"), mark: "3", crown: false, tone: TONES[3] },
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

      <div class="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <article
          v-for="item in HOME_AWARDS"
          :key="item.key"
          class="group relative flex min-h-[360px] flex-col overflow-hidden rounded-3xl border px-5 pt-5 pb-6 text-center backdrop-blur-xl transition-all duration-500 hover:-translate-y-3"
          :class="item.tone.border"
          :style="{
            background: item.tone.wash,
            boxShadow: item.crown
              ? `0 0 56px -10px ${item.tone.glow}, 0 0 32px -12px rgba(244,114,182,.4), inset 0 1px 0 rgba(255,237,180,.35)`
              : `0 0 40px -12px ${item.tone.glow}, inset 0 1px 0 rgba(255,255,255,.1)`,
          }"
        >
          <div class="pointer-events-none absolute inset-x-10 top-0 h-px bg-linear-to-r from-transparent via-white/70 to-transparent" />

          <div
            class="relative mx-auto h-36 w-36 transition-transform duration-700 [transform-style:preserve-3d] group-hover:[transform:rotateY(-8deg)_rotateX(5deg)_scale(1.08)]"
            :style="{ filter: `drop-shadow(0 18px 24px ${item.tone.glow})` }"
          >
            <div
              class="absolute inset-[16%] opacity-70 transition-opacity duration-700 group-hover:opacity-100"
              :style="{ background: `radial-gradient(closest-side, ${item.tone.glow}, transparent 72%)` }"
            />
            <svg viewBox="0 0 220 240" class="relative h-full w-full overflow-visible" aria-hidden>
              <defs>
                <linearGradient :id="`award-${item.key}-metal`" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" :stop-color="item.tone.deep" />
                  <stop offset=".2" :stop-color="item.tone.main" />
                  <stop offset=".44" :stop-color="item.tone.light" />
                  <stop offset=".63" :stop-color="item.tone.main" />
                  <stop offset="1" :stop-color="item.tone.deep" />
                </linearGradient>
                <linearGradient :id="`award-${item.key}-dark`" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" :stop-color="item.tone.main" />
                  <stop offset="1" :stop-color="item.tone.deep" />
                </linearGradient>
                <radialGradient :id="`award-${item.key}-core`">
                  <stop offset="0" stop-color="#fffbeb" stop-opacity="1" />
                  <stop offset=".3" :stop-color="item.tone.main" stop-opacity=".75" />
                  <stop offset="1" :stop-color="item.tone.deep" stop-opacity=".12" />
                </radialGradient>
              </defs>
              <path
                v-if="item.crown"
                d="M80 18 L110 4 L140 18 L128 28 H92 Z"
                :fill="`url(#award-${item.key}-metal)`"
                opacity=".95"
              />
              <path v-if="item.crown" d="M96 28h28v8H96z" :fill="item.tone.main" />
              <ellipse
                cx="110"
                :cy="item.crown ? 208 : 198"
                rx="78"
                ry="16"
                fill="none"
                stroke="#22d3ee"
                stroke-opacity=".35"
                stroke-dasharray="4 9"
              />
              <path
                :d="item.crown ? 'M63 77H38c-2 37 13 58 43 62' : 'M63 67H38c-2 37 13 58 43 62'"
                fill="none"
                :stroke="`url(#award-${item.key}-metal)`"
                stroke-width="12"
                stroke-linecap="round"
              />
              <path
                :d="item.crown ? 'M157 77h25c2 37-13 58-43 62' : 'M157 67h25c2 37-13 58-43 62'"
                fill="none"
                :stroke="`url(#award-${item.key}-metal)`"
                stroke-width="12"
                stroke-linecap="round"
              />
              <path
                :d="
                  item.crown
                    ? 'M58 59h104l-8 57c-4 30-20 48-44 48S70 146 66 116L58 59Z'
                    : 'M58 49h104l-8 57c-4 30-20 48-44 48S70 136 66 106L58 49Z'
                "
                :fill="`url(#award-${item.key}-metal)`"
                :stroke="item.tone.light"
                stroke-opacity=".75"
                stroke-width="2"
              />
              <circle cx="110" :cy="item.crown ? 103 : 93" r="31" :fill="`url(#award-${item.key}-core)`" />
              <circle
                cx="110"
                :cy="item.crown ? 103 : 93"
                r="22"
                fill="#070714"
                fill-opacity=".8"
                :stroke="item.tone.light"
                stroke-opacity=".75"
              />
              <text
                x="110"
                :y="item.crown ? 112 : 104"
                text-anchor="middle"
                :font-size="item.crown ? 22 : 34"
                font-weight="800"
                :fill="`url(#award-${item.key}-metal)`"
              >
                {{ item.mark }}
              </text>
              <path
                :d="item.crown ? 'M101 157h18v29h-18z' : 'M101 147h18v29h-18z'"
                :fill="`url(#award-${item.key}-dark)`"
              />
              <path
                :d="item.crown ? 'M79 182h62l12 21H67l12-21Z' : 'M79 172h62l12 21H67l12-21Z'"
                :fill="`url(#award-${item.key}-metal)`"
                :stroke="item.tone.light"
                stroke-opacity=".55"
              />
              <path
                :d="item.crown ? 'M61 202h98l8 17H53l8-17Z' : 'M61 192h98l8 17H53l8-17Z'"
                :fill="`url(#award-${item.key}-dark)`"
                :stroke="item.tone.main"
                stroke-width="1.5"
              />
            </svg>
          </div>

          <p class="mt-1 text-sm font-semibold tracking-[0.25em]" :style="{ color: item.tone.light }">
            {{ item.award.level }}
          </p>
          <p class="mt-3">
            <span
              :class="
                cn(
                  'text-4xl font-bold tracking-tight',
                  item.crown
                    ? 'bg-linear-to-r from-amber-200 via-white to-rose-200 bg-clip-text text-transparent'
                    : 'text-white',
                )
              "
            >
              {{ item.award.amount.replace("¥", "") }}
            </span>
            <span class="ml-1 text-sm font-medium text-slate-400">元</span>
          </p>
          <p class="mt-2 text-xs text-slate-400">共 {{ item.award.count }} 组</p>
          <p class="mt-auto border-t border-white/10 pt-4 text-xs leading-6 text-slate-400">{{ item.award.perks }}</p>
        </article>
      </div>
    </div>
  </section>
</template>
