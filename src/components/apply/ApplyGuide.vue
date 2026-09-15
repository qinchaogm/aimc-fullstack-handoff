<script setup lang="ts">
import { Check, AlertCircle } from "lucide-vue-next";
import { cn } from "@/utils/cn";

export type GuideStatus = "empty" | "done" | "error";

defineProps<{
  doneCount: number;
  totalCount: number;
  items: { id: string; label: string; status: GuideStatus; optional?: boolean }[];
}>();

const emit = defineEmits<{ select: [id: string] }>();
</script>

<template>
  <div class="apply-guide">
    <p class="text-[15px] font-semibold leading-7 text-blue-50">信息填写指引</p>
    <p class="mt-1 text-[15px] leading-6 text-slate-400">填写完成后会出现绿色对勾，可点击条目跳转到对应栏目。</p>
    <div class="mt-3 flex items-center justify-between gap-3 text-[15px] text-slate-400">
      <span>已完成 {{ doneCount }}/{{ totalCount }}</span>
      <span v-if="doneCount === totalCount && totalCount > 0" class="font-medium text-emerald-400">本步已齐</span>
    </div>
    <div class="apply-guide-bar mt-2">
      <span :style="{ width: totalCount ? `${Math.round((doneCount / totalCount) * 100)}%` : '0%' }" />
    </div>
    <ul class="mt-3 space-y-0.5">
      <li v-for="item in items" :key="item.id">
        <button
          type="button"
          :class="cn('apply-guide-item', item.status === 'done' && 'is-done', item.status === 'error' && 'is-error')"
          @click="emit('select', item.id)"
        >
          <span class="apply-guide-mark" aria-hidden="true">
            <Check v-if="item.status === 'done'" class="size-3 stroke-[3]" />
            <AlertCircle v-else-if="item.status === 'error'" class="size-3" />
          </span>
          <span class="min-w-0 flex-1">
            {{ item.label }}
            <span v-if="item.optional" class="ml-1 text-[11px] text-slate-400">选填</span>
          </span>
        </button>
      </li>
    </ul>
  </div>
</template>
