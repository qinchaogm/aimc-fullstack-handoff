<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import { mountParticleScene } from "@/lib/particle-scene";

const canvas = ref<HTMLCanvasElement | null>(null);
let stop: (() => void) | undefined;

onMounted(() => {
  if (canvas.value) stop = mountParticleScene(canvas.value);
});
onUnmounted(() => stop?.());
</script>

<template>
  <div aria-hidden class="pointer-events-none absolute inset-0 overflow-hidden">
    <div class="home-aurora absolute inset-[-20%] opacity-50" />
    <div
      class="absolute top-[52%] left-1/2 h-[120vh] w-[120vw] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(closest-side,rgba(124,92,255,.22),rgba(34,211,238,.08)_42%,transparent_70%)]"
    />
    <div class="home-scan-beam absolute inset-y-0 w-[22%]" />
    <canvas ref="canvas" class="absolute inset-0 h-full w-full" />
  </div>
</template>
