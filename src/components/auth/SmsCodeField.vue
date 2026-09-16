<script setup lang="ts">
import { onUnmounted, ref } from "vue";
import { ElMessage } from "element-plus";
import { MOCK_SMS_CODE, PHONE_RE } from "@/stores/app";
import ClearableInput from "./ClearableInput.vue";

const props = defineProps<{
  phone: string;
  modelValue: string;
}>();

const emit = defineEmits<{ "update:modelValue": [string] }>();
const countdown = ref(0);
let timer: number | undefined;

function tick() {
  if (countdown.value <= 0) return;
  timer = window.setTimeout(() => {
    countdown.value -= 1;
    tick();
  }, 1000);
}

function send() {
  if (!PHONE_RE.test(props.phone)) {
    ElMessage.error("请先输入正确的手机号");
    return;
  }
  countdown.value = 60;
  tick();
  ElMessage({
    type: "success",
    duration: 6000,
    message: `验证码已发送至 ${props.phone}（演示码 ${MOCK_SMS_CODE}）`,
  });
}

onUnmounted(() => {
  if (timer) window.clearTimeout(timer);
});
</script>

<template>
  <div>
    <label class="apply-field-label mb-1.5">验证码</label>
    <div class="flex gap-2">
      <div class="flex-1">
        <ClearableInput
          :model-value="modelValue"
          inputmode="numeric"
          :maxlength="6"
          placeholder="请输入验证码"
          autocomplete="one-time-code"
          @update:model-value="emit('update:modelValue', $event.replace(/\D/g, ''))"
        />
      </div>
      <button
        type="button"
        class="h-10 w-28 shrink-0 rounded-lg bg-tech-blue text-sm text-white hover:bg-tech-blue/90 disabled:bg-tech-blue/40 disabled:text-white/70"
        :disabled="countdown > 0"
        @click="send"
      >
        {{ countdown > 0 ? `已发送 (${countdown}s)` : "获取验证码" }}
      </button>
    </div>
  </div>
</template>
