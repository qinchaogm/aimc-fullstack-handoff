<script setup lang="ts">
import ParticleField from "@/components/ParticleField.vue";

withDefaults(
  defineProps<{
    /** Dense overlays for a short banner; the home page uses the full-page scene instead. */
    compact?: boolean;
  }>(),
  { compact: false },
);
</script>

<template>
  <div class="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
    <ParticleField />
    <div class="home-starfield home-star-drift absolute inset-0 opacity-50" />
    <div class="nebula-drift absolute top-[-40%] left-[-12%] size-[36rem] bg-[radial-gradient(closest-side,rgba(8,145,178,.38),transparent_72%)]" />
    <div class="nebula-drift-alt absolute top-[-20%] right-[-16%] size-[40rem] bg-[radial-gradient(closest-side,rgba(34,211,238,.22),transparent_72%)]" />
    <div
      class="nebula-drift absolute bottom-[-50%] left-[20%] size-[32rem] bg-[radial-gradient(closest-side,rgba(59,130,246,.18),transparent_72%)] [animation-delay:-8s]"
    />
    <span class="page-bokeh absolute top-[18%] left-[16%] size-20" />
    <span class="page-bokeh page-bokeh-violet absolute top-[28%] right-[14%] size-14 [animation-delay:-4s]" />
    <span class="page-bokeh page-bokeh-pink absolute bottom-[22%] left-[38%] size-10 [animation-delay:-2s]" />
    <span class="hero-bokeh hero-bokeh-a" />
    <span class="hero-bokeh hero-bokeh-b" />
    <span class="hero-bokeh hero-bokeh-c" />
    <span class="hero-bokeh hero-bokeh-d" />
    <span class="hero-bokeh hero-bokeh-e" />
    <div
      class="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(34,211,238,.16),transparent_58%),radial-gradient(ellipse_at_82%_40%,rgba(139,92,246,.12),transparent_50%)]"
    />
    <div class="tech-grid absolute inset-0 opacity-30" />
    <div v-if="compact" class="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-cyan-300/45 to-transparent" />
    <div v-if="compact" class="absolute inset-y-[18%] left-[8%] hidden w-px bg-linear-to-b from-transparent via-cyan-300/30 to-transparent lg:block" />
    <div v-if="compact" class="absolute inset-y-[22%] right-[8%] hidden w-px bg-linear-to-b from-transparent via-violet-300/25 to-transparent lg:block" />
  </div>
</template>
