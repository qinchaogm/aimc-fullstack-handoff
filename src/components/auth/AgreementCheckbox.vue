<script setup lang="ts">
import { cn } from "@/utils/cn";

defineProps<{
  modelValue: boolean;
  shake?: boolean;
}>();

const emit = defineEmits<{ "update:modelValue": [boolean] }>();

const AGREEMENTS = ["《用户协议》", "《隐私保护协议》", "《第三方清单》", "《儿童隐私保护指引》"];
</script>

<template>
  <label
    :class="
      cn(
        'flex cursor-pointer items-start gap-2.5 text-xs leading-5 text-slate-400',
        shake && 'animate-field-shake text-rose-400',
      )
    "
  >
    <input
      type="checkbox"
      class="mt-0.5 size-4 rounded border-white/25 accent-tech-cyan"
      :checked="modelValue"
      @change="emit('update:modelValue', ($event.target as HTMLInputElement).checked)"
    />
    <span>
      我已阅读并同意
      <a v-for="t in AGREEMENTS" :key="t" href="#" class="text-tech-cyan hover:underline" @click.prevent>{{ t }}</a>
    </span>
  </label>
</template>
