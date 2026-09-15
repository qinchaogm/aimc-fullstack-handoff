<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import FeedbackWidget from "@/components/FeedbackWidget.vue";

const route = useRoute();
const showFeedback = computed(
  () => route.path !== "/login" && route.path !== "/register",
);
</script>

<template>
  <div class="flex min-h-full flex-col">
    <router-view />
    <FeedbackWidget v-if="showFeedback" />
  </div>
</template>
