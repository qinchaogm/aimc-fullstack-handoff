<script setup lang="ts">
import Sparkle from "@/components/Sparkle.vue";
import { cn } from "@/utils/cn";

defineProps<{ class?: string }>();
</script>

<template>
  <span :class="cn('hero-sparkle-cluster', $props.class)" aria-hidden>
    <Sparkle class="hero-sparkle hero-sparkle-lg absolute" />
    <Sparkle class="hero-sparkle hero-sparkle-sm absolute" />
  </span>
</template>
