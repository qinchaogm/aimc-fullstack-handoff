<script setup lang="ts">
import { computed } from "vue";
import { registrationPaperHtml, type FormLike } from "@/lib/registration-form";

const props = defineProps<{ data: FormLike }>();
const html = computed(() => registrationPaperHtml(props.data));
</script>

<template>
  <div class="reg-preview" v-html="html" />
</template>

<style scoped>
.reg-preview {
  background: #fff;
  color: #111;
  padding: 16px 18px 20px;
  font-family: "Songti SC", "SimSun", "Noto Serif SC", serif;
  font-size: 13px;
}

.reg-preview :deep(h1),
.reg-preview :deep(h2) {
  margin: 0;
  text-align: center;
  font-family: "SimHei", "Heiti SC", "PingFang SC", sans-serif;
  font-size: 18px;
  font-weight: 700;
  color: #111;
  letter-spacing: 0.02em;
}

.reg-preview :deep(h1) {
  margin-bottom: 6px;
}

.reg-preview :deep(h2) {
  margin-bottom: 14px;
}

.reg-preview :deep(.meta) {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  margin-bottom: 8px;
  font-size: 13px;
}

.reg-preview :deep(.meta span:nth-child(1)) {
  text-align: left;
}

.reg-preview :deep(.meta span:nth-child(2)) {
  text-align: center;
}

.reg-preview :deep(table) {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

.reg-preview :deep(th),
.reg-preview :deep(td) {
  border: 1px solid #111;
  padding: 7px 8px;
  vertical-align: middle;
  color: #111;
  background: #fff;
}

.reg-preview :deep(.lab) {
  width: 18.6%;
  text-align: center;
  font-weight: 400;
}

.reg-preview :deep(.note) {
  text-align: center;
  font-size: 12.5px;
}

.reg-preview :deep(.dirs) {
  text-align: center;
  line-height: 2.1;
  height: 72px;
}

.reg-preview :deep(.content) {
  height: auto;
  min-height: 118px;
  line-height: 1.7;
  text-align: left;
  vertical-align: top;
  white-space: pre-wrap;
}

.reg-preview :deep(.subh) {
  text-align: center;
  height: 32px;
}
</style>
