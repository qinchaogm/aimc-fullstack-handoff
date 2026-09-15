<script setup lang="ts">
import { cn } from "@/utils/cn";

defineProps<{ class?: string }>();
</script>

<template>
  <div
    :class="
      cn(
        'relative aspect-square w-full max-w-[440px] select-none sm:max-w-[500px] lg:max-w-[540px]',
        $props.class,
      )
    "
  >
    <div
      class="absolute inset-[18%] rounded-full bg-[radial-gradient(closest-side,rgba(34,211,238,.22),rgba(139,92,246,.08)_50%,transparent_74%)]"
    />

    <div class="pointer-events-none absolute inset-[-6%] [perspective:920px]" aria-hidden>
      <div class="absolute inset-0 animate-spin-slow [animation-duration:26s] [transform-style:preserve-3d]">
        <div
          class="absolute top-1/2 left-1/2 h-[42%] w-[126%] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border-[9px] border-cyan-300/40 shadow-[0_0_36px_rgba(34,211,238,.32)]"
          style="transform: rotateX(74deg)"
        />
      </div>
      <div class="absolute inset-0 animate-spin-reverse [animation-duration:18s] [transform-style:preserve-3d]">
        <div
          class="absolute top-1/2 left-1/2 h-[36%] w-[110%] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border-[3px] border-dashed border-violet-300/35"
          style="transform: rotateX(74deg)"
        />
      </div>
    </div>

    <div class="absolute top-[8%] right-[0%] z-10 animate-float" style="width: 72px; height: 72px">
      <div class="animate-spin-slow h-full w-full" style="animation-duration: 13s">
        <img
          src="/crystal-gear-mini.png"
          alt=""
          class="h-full w-full object-contain drop-shadow-[0_0_16px_rgba(34,211,238,.4)]"
        />
      </div>
    </div>
    <div class="absolute bottom-[8%] left-[-2%] z-10 animate-float" style="width: 58px; height: 58px">
      <div class="animate-spin-reverse h-full w-full" style="animation-duration: 10s">
        <img
          src="/crystal-gear-mini.png"
          alt=""
          class="h-full w-full object-contain drop-shadow-[0_0_16px_rgba(34,211,238,.4)]"
        />
      </div>
    </div>
    <div class="absolute top-[50%] left-[-6%] z-10 animate-float opacity-80" style="width: 44px; height: 44px">
      <div class="animate-spin-slow h-full w-full" style="animation-duration: 16s">
        <img
          src="/crystal-gear-mini.png"
          alt=""
          class="h-full w-full object-contain drop-shadow-[0_0_16px_rgba(34,211,238,.4)]"
        />
      </div>
    </div>
    <div class="absolute right-[-3%] bottom-[24%] z-10 animate-float opacity-75" style="width: 48px; height: 48px">
      <div class="animate-spin-reverse h-full w-full" style="animation-duration: 9s">
        <img
          src="/crystal-gear-mini.png"
          alt=""
          class="h-full w-full object-contain drop-shadow-[0_0_16px_rgba(34,211,238,.4)]"
        />
      </div>
    </div>

    <div class="absolute inset-[2%] animate-float">
      <div class="hero-gear-cutout absolute inset-0">
        <img
          src="/ai-gear-crystal.png"
          alt="AI 原生智能工厂"
          class="h-full w-full object-contain drop-shadow-[0_0_42px_rgba(34,211,238,.38)]"
        />
      </div>
    </div>
  </div>
</template>
