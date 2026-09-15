<script setup lang="ts">
import ClearableInput from "./ClearableInput.vue";

defineProps<{
  modelValue: string;
  invalid?: boolean;
}>();

const emit = defineEmits<{ "update:modelValue": [string] }>();
</script>

<template>
  <div>
    <label class="apply-field-label mb-1.5">手机号</label>
    <div class="flex gap-2">
      <div class="flex h-10 w-20 shrink-0 items-center justify-between rounded-lg border border-white/12 bg-white/[0.04] px-3 text-sm text-slate-200">
        +86
        <span class="text-slate-500">▾</span>
      </div>
      <div class="flex-1">
        <ClearableInput
          :model-value="modelValue"
          inputmode="numeric"
          :maxlength="11"
          placeholder="请输入手机号"
          autocomplete="tel"
          :invalid="invalid"
          @update:model-value="emit('update:modelValue', $event.replace(/\D/g, ''))"
        />
      </div>
    </div>
  </div>
</template>
