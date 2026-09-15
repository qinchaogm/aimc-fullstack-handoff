<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import ParticleField from "./ParticleField.vue";
import HomeAtmosphere from "./HomeAtmosphere.vue";

const HEADER = 72;
const layer = ref<HTMLElement | null>(null);

function heroVisibleRatio() {
  const hero = document.querySelector("[data-hero]");
  if (!hero) return 1;
  const rect = hero.getBoundingClientRect();
  const visible = Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, HEADER);
  return Math.max(0, visible) / Math.max(window.innerHeight - HEADER, 1);
}

function update() {
  if (!layer.value) return;
  layer.value.dataset.motion = heroVisibleRatio() > 0.14 ? "on" : "off";
}

onMounted(() => {
  update();
  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
});
onUnmounted(() => {
  window.removeEventListener("scroll", update);
  window.removeEventListener("resize", update);
});
</script>

<template>
  <div
    ref="layer"
    aria-hidden
    data-motion="on"
    class="home-scene pointer-events-none fixed inset-0 z-0 overflow-hidden"
  >
    <ParticleField />
    <HomeAtmosphere />
  </div>
</template>
