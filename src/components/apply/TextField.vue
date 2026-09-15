<script setup lang="ts">
import { cn } from "@/utils/cn";

const props = defineProps<{
  modelValue: string;
  maxLength?: number;
  placeholder?: string;
  class?: string;
}>();

const emit = defineEmits<{ "update:modelValue": [string] }>();
</script>

<template>
  <div class="relative">
    <input
      :value="modelValue"
      :maxlength="maxLength"
      :placeholder="placeholder"
      :class="cn('aimc-input aimc-input-lg', maxLength ? 'pr-14' : undefined, props.class)"
      @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
    <span v-if="maxLength" class="absolute top-1/2 right-3 -translate-y-1/2 font-mono text-[11px] text-slate-500">
      {{ modelValue.length }}/{{ maxLength }}
    </span>
  </div>
</template>
