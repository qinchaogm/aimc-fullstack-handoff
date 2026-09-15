<script setup lang="ts">
import { cn } from "@/utils/cn";

withDefaults(
  defineProps<{
    modelValue: string;
    options: string[];
    columns?: 2 | 3 | 4;
    layout?: "grid" | "stack";
  }>(),
  { columns: 2, layout: "grid" },
);

const emit = defineEmits<{ "update:modelValue": [string] }>();
</script>

<template>
  <div
    role="radiogroup"
    :class="
      cn(
        layout === 'stack' && 'flex flex-col gap-3',
        layout === 'grid' && 'grid gap-3',
        layout === 'grid' && columns === 2 && 'sm:grid-cols-2',
        layout === 'grid' && columns === 3 && 'sm:grid-cols-3',
        layout === 'grid' && columns === 4 && 'sm:grid-cols-2 lg:grid-cols-4',
      )
    "
  >
    <button
      v-for="o in options"
      :key="o"
      type="button"
      role="radio"
      :aria-checked="modelValue === o"
      :class="
        cn(
          'flex items-center gap-3 rounded-lg border px-4 text-left transition-all',
          layout === 'stack' ? 'py-3 text-[15px] leading-6' : 'py-2.5 text-[15px] leading-6',
          modelValue === o
            ? 'border-blue-400 bg-blue-500/20 text-blue-50 shadow-[0_0_0_1px_#3b82f6]'
            : 'border-white/10 bg-[#071018] text-slate-200 hover:border-blue-400/45 hover:bg-blue-500/10',
        )
      "
      @click="emit('update:modelValue', o)"
    >
      <span
        :class="
          cn(
            'flex size-4 shrink-0 items-center justify-center rounded-full border',
            modelValue === o ? 'border-blue-400 bg-blue-500' : 'border-slate-500 bg-transparent',
          )
        "
      >
        <span v-if="modelValue === o" class="size-2 rounded-full bg-white" />
      </span>
      {{ o }}
    </button>
  </div>
</template>
