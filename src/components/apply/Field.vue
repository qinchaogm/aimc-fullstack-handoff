<script setup lang="ts">
withDefaults(
  defineProps<{
    id: string;
    label: string;
    hint?: string;
    required?: boolean;
    error?: string;
  }>(),
  { required: false },
);
</script>

<template>
  <div :id="id" class="scroll-mt-28">
    <label class="apply-field-label">
      <span v-if="required" class="mr-0.5 text-rose-300">*</span>
      {{ label }}
    </label>
    <p v-if="hint" class="apply-field-hint">{{ hint }}</p>
    <div class="mt-3">
      <slot />
    </div>
    <p v-if="error" class="mt-2 text-sm leading-6 text-rose-400">{{ error }}</p>
  </div>
</template>
