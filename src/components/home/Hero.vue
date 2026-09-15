<script setup lang="ts">
import { CalendarClock, Trophy, Users, ArrowRight } from "lucide-vue-next";
import HeroArtwork from "@/components/HeroArtwork.vue";
import SparkleCluster from "@/components/SparkleCluster.vue";
import { CONTEST } from "@/lib/contest";

const STATS = [
  { icon: Trophy, label: "奖金池", value: "¥530,000" },
  { icon: Users, label: "参赛方向", value: "5 大方向" },
  { icon: CalendarClock, label: "报名截止", value: CONTEST.registrationDeadline },
];
</script>

<template>
  <section data-hero class="relative overflow-hidden border-b border-cyan-400/10">
    <div class="pointer-events-none absolute inset-0" aria-hidden>
      <div
        class="absolute inset-0 bg-[radial-gradient(ellipse_at_78%_42%,rgba(34,211,238,.16),transparent_52%),radial-gradient(ellipse_at_18%_20%,rgba(139,92,246,.12),transparent_48%),radial-gradient(ellipse_at_50%_100%,rgba(45,212,191,.1),transparent_55%)]"
      />
      <div
        class="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,12,20,.5)_0%,rgba(2,12,20,.28)_40%,rgba(2,12,20,.06)_70%,rgba(2,12,20,.18)_100%)]"
      />
      <div
        class="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,12,20,.1)_0%,transparent_32%,rgba(2,12,20,.22)_82%,rgba(2,12,20,.62)_100%)]"
      />
      <div class="tech-grid absolute inset-0 opacity-35" />
      <div class="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-cyan-300/45 to-transparent" />
      <div class="absolute inset-y-[16%] left-[5%] hidden w-px bg-linear-to-b from-transparent via-cyan-300/30 to-transparent lg:block" />
      <div class="absolute inset-y-[20%] right-[6%] hidden w-px bg-linear-to-b from-transparent via-violet-300/25 to-transparent lg:block" />
      <span class="hero-bokeh hero-bokeh-a" />
      <span class="hero-bokeh hero-bokeh-b" />
      <span class="hero-bokeh hero-bokeh-c" />
      <span class="hero-bokeh hero-bokeh-d" />
      <span class="hero-bokeh hero-bokeh-e" />
    </div>

    <div class="relative mx-auto flex min-h-[calc(100vh-64px)] max-w-7xl items-center px-4 py-6 sm:px-6 lg:py-8">
      <div class="grid w-full items-center gap-10 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] lg:gap-6">
        <div class="relative z-20 order-2 lg:order-1">
          <div
            class="animate-fade-up inline-flex items-center gap-2 rounded-full border border-cyan-300/30 bg-cyan-400/10 px-3 py-1 text-[12px] tracking-[0.18em] text-cyan-100 backdrop-blur-md"
          >
            <span class="size-1.5 animate-pulse rounded-full bg-cyan-300 shadow-[0_0_10px_rgba(34,211,238,.9)]" />
            {{ CONTEST.year }} 大赛
          </div>

          <h1 class="hero-lockup animate-fade-up mt-6 text-white [animation-delay:80ms]">
            <span class="hero-lockup-l1">
              <SparkleCluster />
              <span class="inline-flex items-baseline">
                <span class="hero-lockup-ai">AI原生智能工厂</span>
              </span>
            </span>
            <span class="hero-lockup-l2-wrap animate-fade-up [animation-delay:180ms]">
              <span class="hero-lockup-l2">创新应用大赛</span>
            </span>
          </h1>

          <p
            class="animate-fade-up mt-6 max-w-xl text-sm leading-7 text-slate-300 drop-shadow-[0_2px_12px_rgba(2,12,20,.85)] sm:text-[15px] [animation-delay:400ms]"
          >
            {{ CONTEST.subSlogan }}
          </p>

          <div class="animate-fade-up mt-6 flex flex-col gap-3 sm:flex-row sm:items-center [animation-delay:480ms]">
            <RouterLink
              to="/apply"
              class="btn-nova group/cta inline-flex h-13 items-center justify-center gap-2 rounded-xl px-9 text-base font-semibold"
            >
              我要报名
              <ArrowRight class="size-5 transition-transform group-hover/cta:translate-x-1" />
            </RouterLink>
            <RouterLink
              to="/contest"
              class="btn-nova-ghost inline-flex h-13 items-center justify-center rounded-xl px-8 text-base"
            >
              了解大赛详情
            </RouterLink>
          </div>

          <dl class="mt-8 grid max-w-xl grid-cols-3 gap-3">
            <div
              v-for="(s, i) in STATS"
              :key="s.label"
              class="nova-card animate-fade-up rounded-2xl px-3 py-3 text-center sm:px-4"
              :style="{ animationDelay: `${560 + i * 90}ms` }"
            >
              <dt class="flex items-center justify-center gap-1 text-[10px] tracking-wider text-slate-400">
                <component :is="s.icon" class="size-3 text-cyan-300" />
                {{ s.label }}
              </dt>
              <dd class="mt-1.5 text-sm font-semibold text-white sm:text-base">{{ s.value }}</dd>
            </div>
          </dl>
        </div>

        <div class="relative order-1 flex justify-center lg:order-2 lg:justify-end">
          <HeroArtwork class="relative z-10 w-[min(100%,440px)] sm:w-[min(100%,500px)] lg:w-[min(100%,540px)]" />
        </div>
      </div>
    </div>
  </section>
</template>
