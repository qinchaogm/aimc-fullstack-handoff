<script setup lang="ts">
import SiteHeader from "@/components/SiteHeader.vue";
import SiteFooter from "@/components/SiteFooter.vue";
import HeroScene from "@/components/HeroScene.vue";
import Hero from "@/components/home/Hero.vue";
import IntroSection from "@/components/home/IntroSection.vue";
import TracksSection from "@/components/home/TracksSection.vue";
import ScheduleSection from "@/components/home/ScheduleSection.vue";
import AwardsSection from "@/components/home/AwardsSection.vue";
</script>

<template>
  <HeroScene />
  <SiteHeader />
  <main class="relative z-10 flex-1 overflow-hidden">
    <Hero />
    <IntroSection />
    <TracksSection />
    <ScheduleSection />
    <AwardsSection />
  </main>
  <SiteFooter show-organizers />
</template>
