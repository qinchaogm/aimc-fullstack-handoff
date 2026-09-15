<script setup lang="ts">
import { cn } from "@/utils/cn";

defineProps<{ class?: string }>();
</script>

<template>
  <svg viewBox="0 0 32 32" :class="cn('overflow-visible', $props.class)" aria-hidden fill="currentColor">
    <path d="M16 0C17.35 9.1 22.9 14.65 32 16 22.9 17.35 17.35 22.9 16 32 14.65 22.9 9.1 17.35 0 16 9.1 14.65 14.65 9.1 16 0Z" />
  </svg>
</template>
