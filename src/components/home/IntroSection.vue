<script setup lang="ts">
import { INTRO } from "@/lib/contest";
import SectionTitle from "./SectionTitle.vue";
</script>

<template>
  <section id="intro" class="relative scroll-mt-20 pt-16 pb-6 sm:pt-20 sm:pb-8">
    <div class="mx-auto max-w-4xl px-4 sm:px-6">
      <SectionTitle title="大赛简介" />
      <div class="mx-auto mt-10 max-w-3xl rounded-2xl border border-white/10 px-6 py-10 text-center sm:px-12">
        <p class="text-[15px] leading-8 text-slate-300">{{ INTRO.lead }}</p>
        <p class="mt-5 text-[15px] leading-8 text-slate-300">{{ INTRO.body }}</p>
        <p class="mt-6 text-[15px] font-medium leading-8 text-white">{{ INTRO.close }}</p>
      </div>
    </div>
  </section>
</template>
