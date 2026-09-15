<script setup lang="ts">
withDefaults(
  defineProps<{
    modelValue: string;
    maxLength?: number;
    placeholder?: string;
    rows?: number;
  }>(),
  { rows: 4 },
);

const emit = defineEmits<{ "update:modelValue": [string] }>();
</script>

<template>
  <div class="relative">
    <textarea
      :value="modelValue"
      :maxlength="maxLength"
      :placeholder="placeholder"
      :rows="rows"
      class="aimc-textarea"
      @input="emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
    />
    <span v-if="maxLength" class="absolute right-3 bottom-2 font-mono text-[11px] text-slate-500">
      {{ modelValue.length }}/{{ maxLength }}
    </span>
  </div>
</template>
