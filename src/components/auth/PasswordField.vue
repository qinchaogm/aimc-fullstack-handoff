<script setup lang="ts">
import { computed, ref } from "vue";
import { Check, Eye, EyeOff, X } from "lucide-vue-next";
import { PASSWORD_RULES } from "@/stores/app";
import { cn } from "@/utils/cn";

const props = withDefaults(
  defineProps<{
    modelValue: string;
    label?: string;
    showRules?: boolean;
    placeholder?: string;
    autocomplete?: string;
  }>(),
  { label: "密码", placeholder: "请输入密码" },
);

const emit = defineEmits<{ "update:modelValue": [string] }>();
const visible = ref(false);

const rules = computed(() => [
  {
    ok: PASSWORD_RULES.composition(props.modelValue),
    text: "必须包含大写、小写字母和数字，支持常见特殊字符（空格除外）",
  },
  { ok: PASSWORD_RULES.length(props.modelValue), text: "密码长度为 8-20 位字符" },
]);
</script>

<template>
  <div>
    <label class="apply-field-label mb-1.5">{{ label }}</label>
    <div class="relative">
      <input
        :type="visible ? 'text' : 'password'"
        :value="modelValue"
        :placeholder="placeholder"
        :maxlength="20"
        :autocomplete="autocomplete"
        class="aimc-input pr-10"
        @input="emit('update:modelValue', ($event.target as HTMLInputElement).value.replace(/\s/g, ''))"
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
    <ul v-if="showRules" class="mt-2 space-y-1">
      <li
        v-for="r in rules"
        :key="r.text"
        :class="
          cn(
            'flex items-start gap-1.5 text-xs transition-colors',
            modelValue.length === 0 ? 'text-slate-500' : r.ok ? 'text-emerald-400' : 'text-rose-400',
          )
        "
      >
        <X v-if="modelValue.length > 0 && !r.ok" class="mt-0.5 size-3.5 shrink-0" />
        <Check v-else class="mt-0.5 size-3.5 shrink-0" />
        {{ r.text }}
      </li>
    </ul>
  </div>
</template>
