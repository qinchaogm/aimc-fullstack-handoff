<script setup lang="ts">
import SectionTitle from "./SectionTitle.vue";
import ScheduleTimeline from "./ScheduleTimeline.vue";
</script>

<template>
  <section id="schedule" class="home-section relative scroll-mt-20 overflow-hidden py-24">
    <div class="pointer-events-none absolute inset-0 -z-10">
      <div
        class="absolute top-1/2 left-1/2 h-[420px] w-[920px] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(closest-side,rgba(34,211,238,.12),transparent_72%)]"
      />
    </div>
    <div class="mx-auto max-w-7xl px-4 sm:px-6">
      <SectionTitle title="赛事安排" />
      <div class="mt-16">
        <ScheduleTimeline />
      </div>
    </div>
  </section>
</template>
