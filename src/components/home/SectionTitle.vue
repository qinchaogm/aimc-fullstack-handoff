<script setup lang="ts">
import { cn } from "@/utils/cn";

defineProps<{
  title: string;
  desc?: string;
}>();
</script>

<template>
  <div class="mx-auto max-w-3xl text-center">
    <div class="flex items-center justify-center gap-4">
      <span class="inline-grid grid-cols-2 gap-[3px]" aria-hidden>
        <span class="size-[7px] bg-cyan-300 shadow-[0_0_8px_rgba(34,211,238,.8)]" />
        <span class="size-[7px] bg-violet-400/90" />
        <span class="size-[7px] bg-teal-300/80" />
        <span class="size-[7px] bg-transparent" />
      </span>
      <h2 class="font-display text-glow text-3xl font-black tracking-[0.14em] text-white sm:text-[2.5rem]">
        {{ title }}
      </h2>
      <span :class="cn('inline-grid rotate-180 grid-cols-2 gap-[3px]')" aria-hidden>
        <span class="size-[7px] bg-cyan-300 shadow-[0_0_8px_rgba(34,211,238,.8)]" />
        <span class="size-[7px] bg-violet-400/90" />
        <span class="size-[7px] bg-teal-300/80" />
        <span class="size-[7px] bg-transparent" />
      </span>
    </div>
    <p v-if="desc" class="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-slate-400 sm:text-base">
      {{ desc }}
    </p>
  </div>
</template>
