<script setup lang="ts">
import SectionTitle from "./SectionTitle.vue";
import TracksCarousel from "./TracksCarousel.vue";
</script>

<template>
  <section id="tracks" class="home-section relative scroll-mt-20 overflow-hidden pt-8 pb-20 sm:pt-10 sm:pb-24">
    <div class="absolute inset-x-0 top-0 -z-10 h-px bg-linear-to-r from-transparent via-cyan-400/40 to-transparent" />
    <div class="mx-auto max-w-7xl px-4 sm:px-6">
      <SectionTitle title="赛事方向" />
      <div class="mt-12">
        <TracksCarousel />
      </div>
    </div>
  </section>
</template>
