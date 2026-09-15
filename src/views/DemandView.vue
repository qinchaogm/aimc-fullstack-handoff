<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import { ElMessage } from "element-plus";
import { useRoute } from "vue-router";
import { Check, ChevronLeft, ChevronRight, Download } from "lucide-vue-next";
import SiteHeader from "@/components/SiteHeader.vue";
import SiteFooter from "@/components/SiteFooter.vue";
import Field from "@/components/apply/Field.vue";
import TextField from "@/components/apply/TextField.vue";
import TextAreaField from "@/components/apply/TextAreaField.vue";
import SelectField from "@/components/apply/SelectField.vue";
import ChoiceGroup from "@/components/apply/ChoiceGroup.vue";
import ApplyGuide from "@/components/apply/ApplyGuide.vue";
import type { GuideStatus } from "@/components/apply/ApplyGuide.vue";
import { APPLY_OPTIONS, CONTEST, DEMAND_DIRECTIONS, composeOrganizationAddress, districtsOf } from "@/lib/contest";
import { downloadDemandForm } from "@/lib/demand-form";
import { PHONE_RE, useAppStore } from "@/stores/app";
import type { DemandSubmission } from "@/lib/types";
import { cn } from "@/utils/cn";

const STEPS = [
  {
    key: "org",
    title: "单位与联系人",
    caption: "便于组委会回访",
    fields: [
      { id: "organizationName", label: "单位全称" },
      { id: "organizationAddress", label: "单位地址（市、区、详细地址）" },
      { id: "contactName", label: "姓名" },
      { id: "contactTitle", label: "职务" },
      { id: "contactPhone", label: "手机" },
      { id: "contactEmail", label: "邮箱" },
    ],
  },
  {
    key: "scene",
    title: "需求内容",
    caption: "描述高价值场景",
    fields: [
      { id: "title", label: "需求标题" },
      { id: "direction", label: "需求方向" },
      { id: "content", label: "具体需求内容" },
      { id: "expected", label: "预期指标、效果" },
    ],
  },
  {
    key: "confirm",
    title: "确认并提交",
    caption: "生成需求征集表",
    fields: [
      { id: "review", label: "请审核表单内容" },
      { id: "submit", label: "提交后下载征集表" },
    ],
  },
] as const;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const store = useAppStore();
const route = useRoute();
const step = ref(0);
const done = ref<DemandSubmission | null>(null);
const errors = reactive<Record<string, string | undefined>>({});

const data = reactive({
  organizationName: store.currentUser?.organization ?? "",
  organizationCity: "",
  organizationDistrict: "",
  organizationDetail: "",
  contactName: store.currentUser?.username ?? "",
  contactTitle: store.currentUser?.title ?? "",
  contactPhone: store.currentUser?.phone ?? "",
  contactEmail: store.currentUser?.email ?? "",
  title: "",
  direction: "",
  otherDirection: "",
  content: "",
  expected: "",
});

const requestedDirection = String(route.query.direction ?? "");
if (DEMAND_DIRECTIONS.includes(requestedDirection)) {
  data.direction = requestedDirection;
}

const districts = computed(() => districtsOf(data.organizationCity));
const current = computed(() => STEPS[step.value]);

function clearError(key: string) {
  errors[key] = undefined;
}

function isFilled(value: string) {
  return value.trim().length > 0;
}

function collectErrors(keys: string[]) {
  const next: Record<string, string> = {};
  for (const key of keys) {
    const value = (data as Record<string, unknown>)[key];
    if (typeof value === "string" && !value.trim() && key !== "otherDirection") next[key] = "此项为必填项";
  }
  if (keys.includes("contactPhone") && data.contactPhone && !PHONE_RE.test(data.contactPhone)) {
    next.contactPhone = "请输入正确的 11 位手机号";
  }
  if (keys.includes("contactEmail") && data.contactEmail && !EMAIL_RE.test(data.contactEmail.trim())) {
    next.contactEmail = "请填写有效邮箱";
  }
  if (keys.includes("direction") && data.direction === "其他" && !data.otherDirection.trim()) {
    next.otherDirection = "请填写其他方向";
  }
  if (keys.includes("content") && data.content.trim().length > 500) {
    next.content = "建议不超过 500 字";
  }
  if (keys.includes("organizationCity") && next.organizationCity) next.organizationCity = "请选择市";
  if (keys.includes("organizationDistrict") && next.organizationDistrict) next.organizationDistrict = "请选择区";
  if (keys.includes("organizationDetail") && next.organizationDetail) next.organizationDetail = "请填写详细地址";
  return next;
}

function applyErrors(next: Record<string, string>) {
  for (const k of Object.keys(errors)) errors[k] = undefined;
  Object.assign(errors, next);
}

const STEP0_KEYS = [
  "organizationName",
  "organizationCity",
  "organizationDistrict",
  "organizationDetail",
  "contactName",
  "contactTitle",
  "contactPhone",
  "contactEmail",
];
const STEP1_KEYS = ["title", "direction", "otherDirection", "content", "expected"];

function goNext() {
  const keys = step.value === 0 ? STEP0_KEYS : STEP1_KEYS;
  const next = collectErrors(keys);
  applyErrors(next);
  if (Object.keys(next).length) {
    ElMessage.error("请完善本步必填信息后再继续");
    const firstKey = Object.keys(next)[0];
    const addressKeys = ["organizationCity", "organizationDistrict", "organizationDetail"];
    const anchor = addressKeys.includes(firstKey) ? "organizationAddress" : firstKey;
    document.getElementById(anchor)?.scrollIntoView({ behavior: "smooth", block: "center" });
    return;
  }
  step.value = Math.min(step.value + 1, STEPS.length - 1);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function submit() {
  const next = collectErrors([...STEP0_KEYS, ...STEP1_KEYS]);
  applyErrors(next);
  if (Object.keys(next).length) {
    ElMessage.error("请先完善全部必填信息");
    return;
  }
  const organizationAddress = composeOrganizationAddress(
    data.organizationCity,
    data.organizationDistrict,
    data.organizationDetail,
  );
  const res = store.submitDemand({ ...data, organizationAddress });
  if (!res.ok) return ElMessage.error(res.error);
  done.value = res.data;
  ElMessage.success("需求已提交，可下载征集表");
}

function startAnother() {
  done.value = null;
  step.value = 0;
  data.title = "";
  data.direction = "";
  data.otherDirection = "";
  data.content = "";
  data.expected = "";
  applyErrors({});
}

function scrollToField(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "center" });
}

function fieldStatus(id: string): GuideStatus {
  switch (id) {
    case "organizationName":
      if (errors.organizationName) return "error";
      return isFilled(data.organizationName) ? "done" : "empty";
    case "organizationAddress":
      if (errors.organizationCity || errors.organizationDistrict || errors.organizationDetail) return "error";
      return data.organizationCity && data.organizationDistrict && isFilled(data.organizationDetail) ? "done" : "empty";
    case "contactName":
      if (errors.contactName) return "error";
      return isFilled(data.contactName) ? "done" : "empty";
    case "contactTitle":
      if (errors.contactTitle) return "error";
      return isFilled(data.contactTitle) ? "done" : "empty";
    case "contactPhone":
      if (errors.contactPhone) return "error";
      return PHONE_RE.test(data.contactPhone) ? "done" : "empty";
    case "contactEmail":
      if (errors.contactEmail) return "error";
      return EMAIL_RE.test(data.contactEmail.trim()) ? "done" : "empty";
    case "title":
      if (errors.title) return "error";
      return isFilled(data.title) ? "done" : "empty";
    case "direction":
      if (errors.direction || errors.otherDirection) return "error";
      if (!data.direction) return "empty";
      if (data.direction === "其他") return isFilled(data.otherDirection) ? "done" : "empty";
      return "done";
    case "content":
      if (errors.content) return "error";
      return isFilled(data.content) ? "done" : "empty";
    case "expected":
      if (errors.expected) return "error";
      return isFilled(data.expected) ? "done" : "empty";
    case "review":
      return step.value >= 2 ? "done" : "empty";
    case "submit":
      return done.value ? "done" : "empty";
    default:
      return "empty";
  }
}

const guideItems = computed(() =>
  current.value.fields.map((field) => ({
    id: field.id,
    label: field.label,
    status: fieldStatus(field.id),
  })),
);

const guideProgress = computed(() => ({
  done: guideItems.value.filter((item) => item.status === "done").length,
  total: guideItems.value.length,
}));
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <SiteHeader />
    <main class="relative flex-1">
      <div class="tech-grid absolute inset-x-0 top-0 -z-10 h-[520px]" />

      <div
        v-if="done"
        class="mx-auto flex max-w-2xl flex-col items-center px-4 py-24 text-center sm:px-6"
      >
        <div class="flex size-16 items-center justify-center rounded-full bg-tech-cyan/15 text-tech-cyan ring-1 ring-tech-cyan/40">
          <Check class="size-8" />
        </div>
        <h1 class="mt-6 text-3xl font-bold text-white">需求征集已提交</h1>
        <p class="mt-3 text-sm leading-7 text-slate-400">
          编号 <span class="font-mono text-tech-cyan">{{ done.id }}</span>
        </p>
        <p class="mt-3 max-w-lg text-sm leading-7 text-slate-300">
          系统已根据您填写的信息生成《高价值场景需求征集表》。组委会评估通过后，将纳入中试基地攻关或作为下届赛题发布。
        </p>
        <div class="mt-8 flex flex-wrap justify-center gap-3">
          <button class="btn-nova inline-flex h-11 items-center gap-2 rounded-xl px-6" @click="downloadDemandForm(done)">
            <Download class="size-4" />
            下载需求征集表
          </button>
        </div>
        <div class="mt-8 flex flex-wrap justify-center gap-3">
          <button class="btn-nova-ghost inline-flex h-10 items-center rounded-xl px-5" @click="startAnother">再提交一条</button>
          <RouterLink to="/" class="inline-flex h-10 items-center rounded-xl border border-white/15 bg-white/5 px-5 text-sm text-slate-200">
            返回首页
          </RouterLink>
        </div>
      </div>

      <div v-else class="mx-auto w-full max-w-[1400px] px-4 py-10 sm:px-6 lg:px-8 sm:py-14">
        <div class="text-center">
          <h1 class="text-2xl font-bold tracking-tight text-white sm:text-3xl">{{ CONTEST.name }}</h1>
          <p class="mt-2 text-lg font-semibold text-cyan-100">高价值场景需求征集</p>
          <p class="mt-3 text-sm leading-7 text-slate-300">
            在线填写附件 3 所列信息。标有 <span class="text-rose-300">*</span> 的为必填。提交后可下载需求征集表。
          </p>
        </div>

        <ol class="mx-auto mt-10 flex max-w-3xl items-start justify-between gap-2">
          <li v-for="(s, i) in STEPS" :key="s.key" class="relative flex flex-1 flex-col items-center text-center">
            <span
              v-if="i < STEPS.length - 1"
              :class="cn('absolute top-5 left-[calc(50%+22px)] right-[calc(-50%+22px)] h-px', i < step ? 'bg-tech-cyan/70' : 'bg-white/15')"
            />
            <span
              :class="
                cn(
                  'relative z-10 flex size-10 items-center justify-center rounded-full text-sm font-semibold',
                  i === step && 'bg-[#2563eb] text-white',
                  i < step && 'bg-tech-cyan text-[#042028]',
                  i !== step && i >= step && 'border border-white/25 bg-transparent text-slate-400',
                )
              "
            >
              <Check v-if="i < step" class="size-5" />
              <template v-else>{{ i + 1 }}</template>
            </span>
            <p
              :class="
                cn(
                  'mt-3 text-[15px] leading-6 font-medium',
                  i === step ? 'text-[#60a5fa]' : i < step ? 'text-tech-cyan' : 'text-slate-400',
                )
              "
            >
              第{{ ["一", "二", "三"][i] }}步：{{ s.title }}
            </p>
            <p class="mt-1 text-xs leading-5 text-slate-500">{{ s.caption }}</p>
          </li>
        </ol>

        <div class="apply-workspace mt-12">
          <div class="apply-workspace-form">
            <div class="apply-sheet p-6 sm:p-10">
              <div v-show="step === 0" class="space-y-9">
                <Field id="organizationName" label="单位全称" required :error="errors.organizationName">
                  <TextField
                    :model-value="data.organizationName"
                    :max-length="60"
                    placeholder="请输入单位全称"
                    @update:model-value="
                      data.organizationName = $event;
                      clearError('organizationName');
                    "
                  />
                </Field>
                <Field
                  id="organizationAddress"
                  label="单位地址"
                  required
                  hint="先选择市、区，再填写街道门牌等详细地址。"
                  :error="errors.organizationCity || errors.organizationDistrict || errors.organizationDetail"
                >
                  <div class="grid gap-3 sm:grid-cols-2">
                    <SelectField
                      :model-value="data.organizationCity"
                      :options="APPLY_OPTIONS.cities.map((c) => c.value)"
                      placeholder="请选择市"
                      @update:model-value="
                        data.organizationCity = $event;
                        data.organizationDistrict = '';
                        clearError('organizationCity');
                        clearError('organizationDistrict');
                      "
                    />
                    <SelectField
                      :model-value="data.organizationDistrict"
                      :options="districts"
                      :placeholder="data.organizationCity ? '请选择区' : '请先选择市'"
                      :disabled="!data.organizationCity"
                      @update:model-value="
                        data.organizationDistrict = $event;
                        clearError('organizationDistrict');
                      "
                    />
                  </div>
                  <div class="mt-3">
                    <TextField
                      :model-value="data.organizationDetail"
                      :max-length="60"
                      placeholder="请输入街道、门牌等详细地址"
                      @update:model-value="
                        data.organizationDetail = $event;
                        clearError('organizationDetail');
                      "
                    />
                  </div>
                </Field>
                <div class="grid gap-9 sm:grid-cols-2">
                  <Field id="contactName" label="姓名" required :error="errors.contactName">
                    <TextField
                      :model-value="data.contactName"
                      :max-length="20"
                      placeholder="请输入姓名"
                      @update:model-value="
                        data.contactName = $event;
                        clearError('contactName');
                      "
                    />
                  </Field>
                  <Field id="contactTitle" label="职务" required :error="errors.contactTitle">
                    <TextField
                      :model-value="data.contactTitle"
                      :max-length="30"
                      placeholder="请输入职务"
                      @update:model-value="
                        data.contactTitle = $event;
                        clearError('contactTitle');
                      "
                    />
                  </Field>
                  <Field id="contactPhone" label="手机" required :error="errors.contactPhone">
                    <TextField
                      :model-value="data.contactPhone"
                      placeholder="请输入 11 位手机号"
                      @update:model-value="
                        data.contactPhone = $event;
                        clearError('contactPhone');
                      "
                    />
                  </Field>
                  <Field id="contactEmail" label="邮箱" required :error="errors.contactEmail">
                    <TextField
                      :model-value="data.contactEmail"
                      placeholder="请输入邮箱"
                      @update:model-value="
                        data.contactEmail = $event;
                        clearError('contactEmail');
                      "
                    />
                  </Field>
                </div>
                <p class="apply-field-hint text-center">请正确填写有效联系地址及电话，若有更改请及时通知。</p>
              </div>

              <div v-show="step === 1" class="space-y-9">
                <Field id="title" label="需求标题" required hint="用一句话概括场景名称。" :error="errors.title">
                  <TextField
                    :model-value="data.title"
                    :max-length="40"
                    placeholder="请输入需求标题"
                    @update:model-value="
                      data.title = $event;
                      clearError('title');
                    "
                  />
                </Field>
                <Field id="direction" label="需求方向" required hint="与参赛方向对应，单选。" :error="errors.direction || errors.otherDirection">
                  <ChoiceGroup
                    layout="stack"
                    :model-value="data.direction"
                    :options="DEMAND_DIRECTIONS"
                    @update:model-value="
                      data.direction = $event;
                      if ($event !== '其他') data.otherDirection = '';
                      clearError('direction');
                      clearError('otherDirection');
                    "
                  />
                  <div v-if="data.direction === '其他'" class="mt-3">
                    <TextField
                      :model-value="data.otherDirection"
                      :max-length="30"
                      placeholder="请填写其他方向"
                      @update:model-value="
                        data.otherDirection = $event;
                        clearError('otherDirection');
                      "
                    />
                  </div>
                </Field>
                <Field
                  id="content"
                  label="具体需求内容"
                  required
                  hint="建议不超过 500 字。请写明场景痛点、现有做法与希望解决的问题。"
                  :error="errors.content"
                >
                  <TextAreaField
                    :model-value="data.content"
                    :max-length="500"
                    :rows="8"
                    placeholder="请描述具体需求内容"
                    @update:model-value="
                      data.content = $event;
                      clearError('content');
                    "
                  />
                </Field>
                <Field
                  id="expected"
                  label="预期指标、效果"
                  required
                  hint="建议设置可量化指标，例如时延、漏检率、节省工时等。"
                  :error="errors.expected"
                >
                  <TextAreaField
                    :model-value="data.expected"
                    :max-length="400"
                    :rows="5"
                    placeholder="请填写预期指标、效果"
                    @update:model-value="
                      data.expected = $event;
                      clearError('expected');
                    "
                  />
                </Field>
              </div>

              <div v-show="step === 2" id="review" class="space-y-4 scroll-mt-28 leading-7 text-slate-200">
                <div>
                  <p class="apply-field-label">请审核表单内容</p>
                  <p class="apply-field-hint">请核对以下信息，提交后生成需求征集表。</p>
                </div>
                <dl class="divide-y divide-white/8 rounded-xl border border-blue-400/20 bg-[#071018]">
                  <div class="grid grid-cols-[7.5rem_1fr] gap-3 px-4 py-3">
                    <dt class="text-slate-400">单位全称</dt>
                    <dd>{{ data.organizationName }}</dd>
                  </div>
                  <div class="grid grid-cols-[7.5rem_1fr] gap-3 px-4 py-3">
                    <dt class="text-slate-400">单位地址</dt>
                    <dd>{{ composeOrganizationAddress(data.organizationCity, data.organizationDistrict, data.organizationDetail) }}</dd>
                  </div>
                  <div class="grid grid-cols-[7.5rem_1fr] gap-3 px-4 py-3">
                    <dt class="text-slate-400">联系人</dt>
                    <dd>{{ data.contactName }} · {{ data.contactTitle }} · {{ data.contactPhone }} · {{ data.contactEmail }}</dd>
                  </div>
                  <div class="grid grid-cols-[7.5rem_1fr] gap-3 px-4 py-3">
                    <dt class="text-slate-400">需求标题</dt>
                    <dd>{{ data.title }}</dd>
                  </div>
                  <div class="grid grid-cols-[7.5rem_1fr] gap-3 px-4 py-3">
                    <dt class="text-slate-400">需求方向</dt>
                    <dd>{{ data.direction === "其他" ? `其他：${data.otherDirection}` : data.direction }}</dd>
                  </div>
                  <div class="grid grid-cols-[7.5rem_1fr] gap-3 px-4 py-3">
                    <dt class="text-slate-400">具体需求</dt>
                    <dd class="whitespace-pre-wrap">{{ data.content }}</dd>
                  </div>
                  <div class="grid grid-cols-[7.5rem_1fr] gap-3 px-4 py-3">
                    <dt class="text-slate-400">预期指标</dt>
                    <dd class="whitespace-pre-wrap">{{ data.expected }}</dd>
                  </div>
                </dl>
              </div>

              <div class="mt-10 flex items-center justify-between gap-3">
                <button
                  v-if="step > 0"
                  type="button"
                  class="inline-flex h-11 items-center gap-1 rounded-xl border border-white/15 bg-white/5 px-4 text-[15px] text-slate-200 hover:bg-white/10"
                  @click="step -= 1"
                >
                  <ChevronLeft class="size-4" />
                  上一步
                </button>
                <span v-else />
                <button
                  v-if="step < 2"
                  type="button"
                  class="inline-flex h-11 items-center gap-1 rounded-xl bg-[#2563eb] px-5 text-[15px] font-medium text-white hover:bg-[#1d4ed8]"
                  @click="goNext"
                >
                  下一步
                  <ChevronRight class="size-4" />
                </button>
                <button
                  v-else
                  type="button"
                  class="inline-flex h-11 items-center rounded-xl bg-[#2563eb] px-6 text-[15px] font-medium text-white hover:bg-[#1d4ed8]"
                  @click="submit"
                >
                  提交需求
                </button>
              </div>
            </div>
          </div>
          <aside class="apply-workspace-guide">
            <ApplyGuide
              :done-count="guideProgress.done"
              :total-count="guideProgress.total"
              :items="guideItems"
              @select="scrollToField"
            />
          </aside>
        </div>
      </div>
    </main>
    <SiteFooter />
  </div>
</template>
