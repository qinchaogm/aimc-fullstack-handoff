<script setup lang="ts">
import { SCHEDULE } from "@/lib/contest";
import { cn } from "@/utils/cn";
</script>

<template>
  <div class="relative">
    <div class="relative hidden lg:block">
      <div class="relative mx-4 h-10">
        <div class="absolute top-1/2 right-0 left-0 h-px -translate-y-1/2 bg-linear-to-r from-cyan-400/10 via-cyan-300/80 to-violet-400/30" />
        <div class="absolute top-1/2 right-0 left-0 h-[3px] -translate-y-1/2 bg-linear-to-r from-transparent via-cyan-300/40 to-transparent blur-[2px]" />
        <ol class="absolute inset-0 grid grid-cols-7">
          <li v-for="s in SCHEDULE" :key="s.phase" class="relative flex items-center justify-center">
            <span
              :class="
                cn(
                  'size-3.5 rounded-full border-2',
                  s.status === 'current'
                    ? 'border-cyan-100 bg-cyan-300 shadow-[0_0_18px_rgba(34,211,238,.95)]'
                    : 'border-cyan-300/70 bg-[#041018]',
                )
              "
            />
          </li>
        </ol>
      </div>

      <ol class="mt-3 grid grid-cols-7 items-stretch gap-2">
        <li v-for="(s, i) in SCHEDULE" :key="s.phase" class="flex flex-col items-center">
          <span class="mb-3 h-6 w-px shrink-0 bg-linear-to-b from-cyan-300/70 to-transparent" />
          <article
            :class="
              cn(
                'flex h-full w-full flex-col rounded-xl border p-3.5 backdrop-blur-xl transition-transform duration-500 hover:-translate-y-1',
                s.status === 'current'
                  ? 'border-cyan-300/50 bg-[linear-gradient(165deg,rgba(8,90,130,.5),rgba(8,24,40,.88))] shadow-[0_0_36px_-10px_rgba(34,211,238,.55)]'
                  : 'border-white/10 bg-white/[0.05]',
              )
            "
          >
            <p class="font-mono text-[11px] tracking-wider text-cyan-300/80">0{{ i + 1 }}</p>
            <h3 class="mt-1 min-h-6 text-[15px] leading-6 font-semibold text-white">{{ s.phase }}</h3>
            <p class="mt-1 min-h-10 text-[11px] leading-5 text-violet-200/85">{{ s.time }}</p>
            <p class="mt-2 min-h-[3.75rem] flex-1 text-xs leading-5 text-slate-400">{{ s.desc }}</p>
            <p
              :class="cn('mt-3 text-[10px] tracking-[0.16em]', s.status === 'current' ? 'text-cyan-200' : 'text-slate-500')"
            >
              {{ s.status === "current" ? "进行中" : "未开始" }}
            </p>
          </article>
        </li>
      </ol>
    </div>

    <ol class="relative space-y-4 pl-2 lg:hidden">
      <div class="absolute top-3 bottom-3 left-[19px] w-px bg-linear-to-b from-cyan-400/10 via-cyan-300/70 to-violet-400/20" />
      <li v-for="(s, i) in SCHEDULE" :key="s.phase" class="relative flex gap-4">
        <span
          :class="
            cn(
              'relative z-10 mt-5 size-3.5 shrink-0 rounded-full border-2',
              s.status === 'current'
                ? 'border-cyan-100 bg-cyan-300 shadow-[0_0_16px_rgba(34,211,238,.9)]'
                : 'border-cyan-300/70 bg-[#041018]',
            )
          "
        />
        <article
          :class="
            cn(
              'flex-1 rounded-xl border p-4 backdrop-blur-xl',
              s.status === 'current'
                ? 'border-cyan-300/45 bg-[linear-gradient(165deg,rgba(8,90,130,.48),rgba(8,24,40,.88))]'
                : 'border-white/10 bg-white/[0.05]',
            )
          "
        >
          <div class="flex items-center justify-between gap-2">
            <p class="font-mono text-[11px] text-cyan-300/80">0{{ i + 1 }}</p>
            <p class="text-[10px] tracking-[0.14em] text-slate-400">
              {{ s.status === "current" ? "进行中" : "未开始" }}
            </p>
          </div>
          <h3 class="mt-1 text-base font-semibold text-white">{{ s.phase }}</h3>
          <p class="mt-1 text-[11px] text-violet-200/85">{{ s.time }}</p>
          <p class="mt-2 text-sm leading-6 text-slate-400">{{ s.desc }}</p>
        </article>
      </li>
    </ol>
  </div>
</template>
