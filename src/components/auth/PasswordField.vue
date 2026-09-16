<script setup lang="ts">
import { computed, ref } from "vue";
import { Check, Eye, EyeOff, X } from "lucide-vue-next";
import { PASSWORD_RULES } from "@/stores/app";

const props = withDefaults(
  defineProps<{
    modelValue: string;
    label?: string;
    showRules?: boolean;
    showForgot?: boolean;
    placeholder?: string;
    autocomplete?: string;
  }>(),
  { label: "密码", placeholder: "请输入密码" },
);

const emit = defineEmits<{
  "update:modelValue": [string];
  forgot: [];
}>();
const visible = ref(false);

const passwordValid = computed(() => PASSWORD_RULES.valid(props.modelValue));
</script>

<template>
  <div>
    <div class="mb-1.5 flex items-center justify-between gap-3">
      <label class="apply-field-label">{{ label }}</label>
      <button
        v-if="showForgot"
        type="button"
        class="text-right text-[13px] text-cyan-300 transition-colors hover:text-white"
        @click="emit('forgot')"
      >
        忘记密码
      </button>
    </div>
    <div class="relative">
      <input
        :type="visible ? 'text' : 'password'"
        :value="modelValue"
        :placeholder="placeholder"
        :maxlength="20"
        :autocomplete="autocomplete"
        class="aimc-input pr-10"
        @input="
          emit(
            'update:modelValue',
            ($event.target as HTMLInputElement).value.replace(/\s/g, ''),
          )
        "
      />
      <button
        type="button"
        class="absolute top-1/2 right-2.5 -translate-y-1/2 text-slate-500 hover:text-slate-300"
        :aria-label="visible ? '隐藏密码' : '显示密码'"
        tabindex="-1"
        @click="visible = !visible"
      >
        <EyeOff v-if="visible" class="size-4" />
        <Eye v-else class="size-4" />
      </button>
    </div>
    <p
      v-if="showRules"
      class="mt-2 flex items-start gap-1.5 text-xs transition-colors"
      :class="
        modelValue.length === 0
          ? 'text-slate-500'
          : passwordValid
            ? 'text-emerald-400'
            : 'text-rose-400'
      "
    >
      <X
        v-if="modelValue.length > 0 && !passwordValid"
        class="mt-0.5 size-3.5 shrink-0"
      />
      <Check v-else class="mt-0.5 size-3.5 shrink-0" />
      <span
        >密码须为8–20位，至少包含1个大写字母，且不得出现连续三个相同字符或键盘连续三键（如
        aaa、123）。</span
      >
    </p>
  </div>
</template>
