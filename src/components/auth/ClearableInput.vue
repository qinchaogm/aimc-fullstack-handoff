<script setup lang="ts">
import { XCircle } from "lucide-vue-next";
import { cn } from "@/utils/cn";

const props = withDefaults(
  defineProps<{
    modelValue: string;
    placeholder?: string;
    maxlength?: number;
    type?: string;
    autocomplete?: string;
    inputmode?: string;
    class?: string;
    invalid?: boolean;
  }>(),
  { type: "text" },
);

const emit = defineEmits<{ "update:modelValue": [string] }>();
</script>

<template>
  <div class="relative">
    <input
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :maxlength="maxlength"
      :autocomplete="autocomplete"
      :inputmode="(inputmode as any)"
      :aria-invalid="invalid || undefined"
      :class="cn('aimc-input pr-9', props.class)"
      @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
    <button
      v-if="modelValue"
      type="button"
      class="absolute top-1/2 right-2.5 -translate-y-1/2 text-slate-500 hover:text-slate-300"
      aria-label="清空"
      tabindex="-1"
      @click="emit('update:modelValue', '')"
    >
      <XCircle class="size-4" />
    </button>
  </div>
</template>
