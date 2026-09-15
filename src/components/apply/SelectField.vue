<script setup lang="ts">
import { cn } from "@/utils/cn";

const props = withDefaults(
  defineProps<{
    modelValue: string;
    options: string[];
    placeholder?: string;
    disabled?: boolean;
    class?: string;
  }>(),
  { placeholder: "请选择" },
);

const emit = defineEmits<{ "update:modelValue": [string] }>();
</script>

<template>
  <select
    :value="modelValue"
    :disabled="disabled"
    :class="cn('aimc-input aimc-input-lg aimc-select w-full', props.class)"
    @change="emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
  >
    <option value="" disabled>{{ placeholder }}</option>
    <option v-for="o in options" :key="o" :value="o" class="bg-[#071018] text-slate-100">{{ o }}</option>
  </select>
</template>
