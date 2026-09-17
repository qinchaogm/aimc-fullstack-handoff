<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { useRoute } from "vue-router";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Download,
  Plus,
  Rocket,
  Trash2,
} from "lucide-vue-next";
import SiteHeader from "@/components/SiteHeader.vue";
import SiteFooter from "@/components/SiteFooter.vue";
import Field from "@/components/apply/Field.vue";
import TextField from "@/components/apply/TextField.vue";
import TextAreaField from "@/components/apply/TextAreaField.vue";
import SelectField from "@/components/apply/SelectField.vue";
import ChoiceGroup from "@/components/apply/ChoiceGroup.vue";
import ApplyGuide from "@/components/apply/ApplyGuide.vue";
import type { GuideStatus } from "@/components/apply/ApplyGuide.vue";
import {
  APPLY_OPTIONS,
  citiesOfProvince,
  CONTEST,
  composeOrganizationAddress,
  districtsOf,
} from "@/lib/contest";
import { contestStageLabel } from "@/lib/journey";
import { downloadRegistrationForm } from "@/lib/registration-form";
import { PHONE_RE, useAppStore } from "@/stores/app";
import type { Registration, TeamMember } from "@/lib/types";
import { cn } from "@/utils/cn";

const STEPS = [
  {
    key: "basic",
    title: "项目基本信息",
    caption: "进入项目库",
    fields: [
      { id: "direction", label: "参赛方向" },
      { id: "projectName", label: "项目名称" },
      { id: "projectContent", label: "项目内容" },
      { id: "organizationName", label: "单位全称" },
      { id: "isDian", label: "是否是上海电气内部企业" },
      { id: "organizationAddress", label: "单位地址（省、市、区、详细地址）" },
    ],
  },
  {
    key: "team",
    title: "团队与联系人",
    caption: "完善申报信息",
    fields: [
      { id: "leaderName", label: "项目负责人" },
      { id: "leaderTitle", label: "负责人职务" },
      { id: "contactName", label: "单位联系人" },
      { id: "contactPhone", label: "联系人电话" },
      { id: "members", label: "参赛小组成员" },
    ],
  },
  {
    key: "confirm",
    title: "确认并提交",
    caption: "生成官方报名表",
    fields: [
      { id: "review", label: "请审核表单内容" },
      { id: "submit", label: "提交后下载报名表" },
    ],
  },
] as const;

const store = useAppStore();
const route = useRoute();
const step = ref(0);
const done = ref<Registration | null>(null);
const didUpdate = ref(false);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const errors = reactive<Record<string, string | undefined>>({});

function createLeaderMember(
  name = store.currentUser?.username ?? "",
  phone = store.currentUser?.phone ?? "",
): TeamMember {
  return { name, age: "", gender: "", phone, email: "" };
}

const data = reactive({
  registrationDate: new Date().toISOString().slice(0, 10),
  projectName: "",
  organizationName: store.currentUser?.organization ?? "",
  isDian: "否",
  leaderName: store.currentUser?.username ?? "",
  leaderTitle: store.currentUser?.title ?? "",
  organizationProvince: "",
  organizationCity: "",
  organizationDistrict: "",
  organizationDetail: "",
  organizationAddress: "",
  direction: "",
  projectContent: "",
  members: [createLeaderMember()] as TeamMember[],
  contactName: store.currentUser?.username ?? "",
  contactPhone: store.currentUser?.phone ?? "",
});

const requestedDirection = String(route.query.direction ?? "");
const existing = computed(
  () =>
    store.registrations.find((r) => r.userId === store.currentUser?.id) ?? null,
);

function fillFrom(reg: Registration) {
  data.registrationDate = reg.registrationDate;
  data.projectName = reg.projectName;
  data.organizationName = reg.organizationName;
  data.isDian = reg.isDian ?? "否";
  data.leaderName = reg.leaderName;
  data.leaderTitle = reg.leaderTitle;
  data.organizationProvince = reg.organizationProvince ?? "";
  data.organizationCity = data.organizationProvince ? reg.organizationCity : "";
  data.organizationDistrict = data.organizationProvince ? reg.organizationDistrict : "";
  data.organizationDetail = reg.organizationDetail;
  data.organizationAddress = reg.organizationAddress;
  data.direction = reg.direction;
  data.projectContent = reg.projectContent;
  data.contactName = reg.contactName;
  data.contactPhone = reg.contactPhone;
  data.members = reg.members.map((m) => ({ ...m }));
  if (!data.members.length) data.members = [createLeaderMember(reg.leaderName, reg.contactPhone)];
  data.members[0].name = reg.leaderName;
  data.members[0].phone = reg.contactPhone;
}

if (existing.value) {
  fillFrom(existing.value);
} else if (APPLY_OPTIONS.directions.includes(requestedDirection)) {
  data.direction = requestedDirection;
}
const districts = computed(() =>
  data.organizationProvince && data.organizationCity
    ? districtsOf(data.organizationCity)
    : [],
);
const cities = computed(() => citiesOfProvince(data.organizationProvince));
const current = computed(() => STEPS[step.value]);

function clearError(key: string) {
  errors[key] = undefined;
}

function updateLeaderName(value: string) {
  data.leaderName = value;
  if (!data.members.length) data.members = [createLeaderMember(value)];
  data.members[0].name = value;
  clearError("leaderName");
  clearError("members.0.name");
}

function updateMemberName(index: number, value: string) {
  if (index === 0) {
    updateLeaderName(value);
    return;
  }
  data.members[index].name = value;
}

function updateContactPhone(value: string) {
  const phone = value.replace(/\D/g, "").slice(0, 11);
  data.contactPhone = phone;
  if (!data.members.length) data.members = [createLeaderMember(data.leaderName, phone)];
  data.members[0].phone = phone;
  clearError("contactPhone");
  clearError("members.0.phone");
}

function updateMemberPhone(index: number, value: string) {
  const phone = value.replace(/\D/g, "").slice(0, 11);
  if (index === 0) {
    updateContactPhone(phone);
    return;
  }
  data.members[index].phone = phone;
}

function addMember() {
  if (data.members.length >= APPLY_OPTIONS.maxMembers) {
    ElMessage.error(`最多添加 ${APPLY_OPTIONS.maxMembers} 名成员`);
    return;
  }
  data.members.push({ name: "", age: "", gender: "", phone: "", email: "" });
}

function removeMember(index: number) {
  if (index === 0) {
    ElMessage.warning("成员 1 为项目负责人，不能移除");
    return;
  }
  data.members.splice(index, 1);
}

function collectErrors(keys: string[]) {
  const next: Record<string, string> = {};
  for (const key of keys) {
    const value = (data as Record<string, unknown>)[key];
    if (typeof value === "string" && !value.trim()) next[key] = "此项为必填项";
  }
  if (
    keys.includes("contactPhone") &&
    data.contactPhone &&
    !PHONE_RE.test(data.contactPhone)
  ) {
    next.contactPhone = "请输入正确的 11 位手机号";
  }
  if (keys.includes("members")) {
    data.members.forEach((m, i) => {
      const touched =
        i === 0 ||
        [m.name, m.age, m.gender, m.phone, m.email].some((x) => x.trim());
      if (!touched) return;
      if (!m.name.trim()) next[`members.${i}.name`] = "请填写姓名";
      if (!m.age.trim() || Number.isNaN(Number(m.age)))
        next[`members.${i}.age`] = "请填写年龄";
      if (!m.gender) next[`members.${i}.gender`] = "请选择性别";
      if (!m.phone.trim() || !PHONE_RE.test(m.phone))
        next[`members.${i}.phone`] = "手机号不正确";
      if (!m.email.trim() || !EMAIL_RE.test(m.email))
        next[`members.${i}.email`] = "邮箱不正确";
    });
  }
  if (keys.includes("organizationProvince") && next.organizationProvince)
    next.organizationProvince = "请选择省份";
  if (keys.includes("organizationCity") && next.organizationCity)
    next.organizationCity = "请选择市";
  if (keys.includes("organizationDistrict") && next.organizationDistrict)
    next.organizationDistrict = "请选择区";
  if (keys.includes("organizationDetail") && next.organizationDetail)
    next.organizationDetail = "请填写详细地址";
  return next;
}

function applyErrors(next: Record<string, string>) {
  for (const k of Object.keys(errors)) errors[k] = undefined;
  Object.assign(errors, next);
}

function goNext() {
  const keys =
    step.value === 0
      ? [
          "direction",
          "projectName",
          "projectContent",
          "organizationName",
          "isDian",
          "organizationProvince",
          "organizationCity",
          "organizationDistrict",
          "organizationDetail",
        ]
      : ["leaderName", "leaderTitle", "contactName", "contactPhone", "members"];
  const next = collectErrors(keys);
  applyErrors(next);
  if (Object.keys(next).length) {
    ElMessage.error("请完善本步必填信息后再继续");
    const firstKey = Object.keys(next)[0];
    const addressKeys = [
      "organizationProvince",
      "organizationCity",
      "organizationDistrict",
      "organizationDetail",
    ];
    const anchor = firstKey.startsWith("members.")
      ? firstKey.split(".").slice(0, 2).join(".")
      : addressKeys.includes(firstKey)
        ? "organizationAddress"
        : firstKey;
    document
      .getElementById(anchor)
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
    return;
  }
  step.value = Math.min(step.value + 1, STEPS.length - 1);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function collectSubmitPayload() {
  const next = collectErrors([
    "direction",
    "projectName",
    "projectContent",
    "isDian",
    "organizationName",
    "organizationProvince",
    "organizationCity",
    "organizationDistrict",
    "organizationDetail",
    "leaderName",
    "leaderTitle",
    "contactName",
    "contactPhone",
    "members",
  ]);
  applyErrors(next);
  if (Object.keys(next).length) {
    ElMessage.error("请先完善全部必填信息");
    return null;
  }
  const members = data.members.filter((m) =>
    [m.name, m.age, m.gender, m.phone, m.email].some((x) => x.trim()),
  );
  const organizationAddress = composeOrganizationAddress(
    data.organizationProvince,
    data.organizationCity,
    data.organizationDistrict,
    data.organizationDetail,
  );
  return {
    ...data,
    members,
    organizationAddress,
  };
}

function saveRegistration() {
  const payload = collectSubmitPayload();
  if (!payload) return;
  const res = store.submitRegistration(payload, { notify: false });
  if (!res.ok) return ElMessage.error(res.error);
  fillFrom(res.data);
  ElMessage.success("保存成功");
}

async function confirmSubmit() {
  try {
    await ElMessageBox.confirm(
      "每位参赛者仅可提交一次报名，提交后不可自行修改。请仔细核对全部信息，确认无误后再提交。",
      "确认提交报名？",
      {
        confirmButtonText: "确认提交",
        cancelButtonText: "再检查一下",
        distinguishCancelAndClose: true,
        closeOnClickModal: false,
        customClass: "apply-submit-confirm",
        type: "warning",
      },
    );
  } catch {
    return;
  }
  submit();
}

function submit() {
  const payload = collectSubmitPayload();
  if (!payload) return;
  const updating = !!existing.value;
  const res = store.submitRegistration(payload);
  if (!res.ok) return ElMessage.error(res.error);
  didUpdate.value = updating;
  done.value = res.data;
  ElMessage.success(
    updating
      ? "报名信息已更新，已覆盖为最新内容"
      : "您已经报名成功，可下载报名表",
  );
}

function namedMembers() {
  return data.members.filter((m) => m.name.trim());
}

function scrollToField(id: string) {
  document
    .getElementById(id)
    ?.scrollIntoView({ behavior: "smooth", block: "center" });
}

function isFilled(value: string) {
  return value.trim().length > 0;
}

function fieldStatus(id: string): GuideStatus {
  const memberError = Object.keys(errors).some(
    (key) => key.startsWith("members.") && errors[key],
  );
  switch (id) {
    case "direction":
      if (errors.direction) return "error";
      return data.direction ? "done" : "empty";
    case "projectName":
      if (errors.projectName) return "error";
      return isFilled(data.projectName) ? "done" : "empty";
    case "projectContent":
      if (errors.projectContent) return "error";
      return isFilled(data.projectContent) ? "done" : "empty";
    case "organizationName":
      if (errors.organizationName) return "error";
      return isFilled(data.organizationName) ? "done" : "empty";
    case "isDian":
      if (errors.isDian) return "error";
      return data.isDian ? "done" : "empty";
    case "organizationAddress":
      if (
        errors.organizationProvince ||
        errors.organizationCity ||
        errors.organizationDistrict ||
        errors.organizationDetail
      )
        return "error";
      return data.organizationProvince &&
        data.organizationCity &&
        data.organizationDistrict &&
        isFilled(data.organizationDetail)
        ? "done"
        : "empty";
    case "leaderName":
      if (errors.leaderName) return "error";
      return isFilled(data.leaderName) ? "done" : "empty";
    case "leaderTitle":
      if (errors.leaderTitle) return "error";
      return isFilled(data.leaderTitle) ? "done" : "empty";
    case "contactName":
      if (errors.contactName) return "error";
      return isFilled(data.contactName) ? "done" : "empty";
    case "contactPhone":
      if (errors.contactPhone) return "error";
      return PHONE_RE.test(data.contactPhone) ? "done" : "empty";
    case "members":
      if (memberError) return "error";
      if (data.members.length === 0) return "empty";
      return data.members.every(
        (m) =>
          isFilled(m.name) &&
          isFilled(m.age) &&
          !Number.isNaN(Number(m.age)) &&
          Boolean(m.gender) &&
          PHONE_RE.test(m.phone) &&
          EMAIL_RE.test(m.email),
      )
        ? "done"
        : "empty";
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
    optional: false,
  })),
);

const guideProgress = computed(() => {
  const required = guideItems.value.filter((item) => !item.optional);
  return {
    done: required.filter((item) => item.status === "done").length,
    total: required.length,
  };
});

const showSuccess = computed(() => !!done.value);

function resumeEdit() {
  if (done.value) fillFrom(done.value);
  done.value = null;
  didUpdate.value = false;
  step.value = 0;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

async function clearForm() {
  try {
    await ElMessageBox.confirm(
      "将清空本页已填写的全部内容，是否继续？",
      "清空表单",
      {
        confirmButtonText: "确认清空",
        cancelButtonText: "取消",
        type: "warning",
      },
    );
  } catch {
    return;
  }
  data.registrationDate = new Date().toISOString().slice(0, 10);
  data.projectName = "";
  data.organizationName = "";
  data.isDian = "否";
  data.leaderName = "";
  data.leaderTitle = "";
  data.organizationProvince = "";
  data.organizationCity = "";
  data.organizationDistrict = "";
  data.organizationDetail = "";
  data.organizationAddress = "";
  data.direction = "";
  data.projectContent = "";
  data.contactName = "";
  data.contactPhone = "";
  data.members = [createLeaderMember(data.leaderName, data.contactPhone)];
  for (const k of Object.keys(errors)) errors[k] = undefined;
  step.value = 0;
  ElMessage.success("已清空表单");
  window.scrollTo({ top: 0, behavior: "smooth" });
}
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <SiteHeader />
    <main class="relative flex-1">
      <div class="tech-grid absolute inset-x-0 top-0 -z-10 h-[520px]" />

      <div
        v-if="store.contestStage !== 'registration' && !showSuccess"
        class="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center sm:px-6"
      >
        <span
          class="rounded-full border border-amber-300/30 bg-amber-400/10 px-3 py-1 text-xs text-amber-100"
          >报名通道已关闭</span
        >
        <h1 class="mt-6 text-3xl font-bold text-white">
          当前为「{{ contestStageLabel(store.contestStage) }}」
        </h1>
        <p class="mt-3 max-w-md text-sm leading-7 text-slate-300">
          新项目报名已截止。已报名团队请到个人中心下载报名表；提交作品阶段再上传盖章件与压缩包。
        </p>
        <RouterLink
          to="/dashboard?tab=contest"
          class="btn-nova mt-8 inline-flex h-11 items-center rounded-xl px-6"
        >
          前往个人中心
        </RouterLink>
      </div>

      <div
        v-else-if="showSuccess"
        class="mx-auto flex max-w-2xl flex-col items-center px-4 py-24 text-center sm:px-6"
      >
        <div
          class="flex size-16 items-center justify-center rounded-full bg-tech-cyan/15 text-tech-cyan ring-1 ring-tech-cyan/40"
        >
          <Check class="size-8" />
        </div>
        <h1 class="mt-6 text-3xl font-bold text-white">
          {{ didUpdate ? "报名信息已更新" : "您已经报名成功" }}
        </h1>
        <p class="mt-3 text-sm leading-7 text-slate-400">
          报名编号 <span class="font-mono text-tech-cyan">{{ done!.id }}</span>
        </p>
        <p class="mt-3 max-w-lg text-sm leading-7 text-slate-300">
          {{
            didUpdate
              ? "系统已用本次填写内容覆盖原先的报名信息。请重新下载报名表交单位盖章。盖章件请在提交作品阶段上传。"
              : "系统已根据您填写的全部信息生成官方报名表，请下载后交单位盖章。盖章件不在本页上传，请到提交作品阶段再上传盖章报名表与作品压缩包。每位参赛者仅可申报一个项目，如需改内容请直接修改本表后重新提交。"
          }}
        </p>
        <div class="mt-8 flex flex-wrap justify-center gap-3">
          <button
            class="btn-nova inline-flex h-11 items-center gap-2 rounded-xl px-6"
            @click="downloadRegistrationForm(done!)"
          >
            <Download class="size-4" />
            下载报名表
          </button>
          <!-- <button
            v-if="store.contestStage === 'registration'"
            class="btn-nova-ghost inline-flex h-11 items-center rounded-xl px-6"
            @click="resumeEdit"
          >
            修改报名信息
          </button> -->
        </div>
        <div class="mt-8 flex flex-wrap justify-center gap-3">
          <RouterLink
            to="/dashboard?tab=contest"
            class="btn-nova-ghost inline-flex h-10 items-center rounded-xl px-5"
            >查看我的比赛</RouterLink
          >
          <RouterLink
            to="/"
            class="inline-flex h-10 items-center rounded-xl border border-white/15 bg-white/5 px-5 text-sm text-slate-200"
          >
            返回首页
          </RouterLink>
        </div>
      </div>

      <div
        v-else
        class="mx-auto w-full max-w-[1400px] px-4 py-10 sm:px-6 lg:px-8 sm:py-14"
      >
        <div class="text-center">
          <h1 class="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            {{ CONTEST.name }} 项目报名
          </h1>
          <p class="mt-3 text-sm leading-7 text-slate-300">
            标有
            <span class="text-rose-300">*</span>
            的为必填。全部步骤提交后，再生成并下载官方报名表。
            <template v-if="existing"
              >每位参赛者仅可申报一个项目，再次提交将覆盖为最新报名信息。</template
            >
          </p>
        </div>

        <ol
          class="mx-auto mt-10 flex max-w-3xl items-start justify-between gap-2"
        >
          <li
            v-for="(s, i) in STEPS"
            :key="s.key"
            class="relative flex flex-1 flex-col items-center text-center"
          >
            <span
              v-if="i < STEPS.length - 1"
              :class="
                cn(
                  'absolute top-5 left-[calc(50%+22px)] right-[calc(-50%+22px)] h-px',
                  i < step ? 'bg-tech-cyan/70' : 'bg-white/15',
                )
              "
            />
            <span
              :class="
                cn(
                  'relative z-10 flex size-10 items-center justify-center rounded-full text-sm font-semibold',
                  i === step && 'bg-[#2563eb] text-white',
                  i < step && 'bg-tech-cyan text-[#042028]',
                  i !== step &&
                    i >= step &&
                    'border border-white/25 bg-transparent text-slate-400',
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
                  i === step
                    ? 'text-[#60a5fa]'
                    : i < step
                      ? 'text-tech-cyan'
                      : 'text-slate-400',
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
                <Field
                  id="direction"
                  label="参赛方向"
                  required
                  hint="请选择最匹配的一项。"
                  :error="errors.direction"
                >
                  <ChoiceGroup
                    layout="stack"
                    :model-value="data.direction"
                    :options="APPLY_OPTIONS.directions"
                    @update:model-value="
                      data.direction = $event;
                      clearError('direction');
                    "
                  />
                </Field>
                <Field
                  id="projectName"
                  label="项目名称"
                  required
                  hint="40 字以内，建议用直观、简洁的项目名称，例如：视界·少样本缺陷检测平台。"
                  :error="errors.projectName"
                >
                  <TextField
                    :model-value="data.projectName"
                    :max-length="40"
                    placeholder="请输入项目名称"
                    @update:model-value="
                      data.projectName = $event;
                      clearError('projectName');
                    "
                  />
                </Field>
                <Field
                  id="projectContent"
                  label="项目内容"
                  required
                  hint="请写明意义与目标、主要内容、预期成果（可量化）、推广价值。"
                  :error="errors.projectContent"
                >
                  <TextAreaField
                    :model-value="data.projectContent"
                    :max-length="2000"
                    :rows="7"
                    placeholder="1. 意义与目标：……&#10;2. 主要内容：……&#10;3. 预期成果：……&#10;4. 推广价值：……"
                    @update:model-value="
                      data.projectContent = $event;
                      clearError('projectContent');
                    "
                  />
                </Field>
                <Field
                  id="organizationName"
                  label="单位全称"
                  required
                  :error="errors.organizationName"
                >
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
                  id="isDian"
                  label="是否上海电气内部企业"
                  required
                  :error="errors.isDian"
                >
                  <ChoiceGroup
                    :model-value="data.isDian"
                    :options="['是', '否']"
                    :columns="2"
                    @update:model-value="
                      data.isDian = $event;
                      clearError('isDian');
                    "
                  />
                </Field>
                <Field
                  id="organizationAddress"
                  label="单位地址"
                  required
                  hint="先选择省、市、区，再填写街道门牌等详细地址。"
                  :error="
                    errors.organizationProvince ||
                    errors.organizationCity ||
                    errors.organizationDistrict ||
                    errors.organizationDetail
                  "
                >
                  <div class="grid gap-3 sm:grid-cols-3">
                    <SelectField
                      :model-value="data.organizationProvince"
                      :options="APPLY_OPTIONS.provinces"
                      placeholder="请选择省份"
                      @update:model-value="
                        data.organizationProvince = $event;
                        data.organizationCity = '';
                        data.organizationDistrict = '';
                        clearError('organizationProvince');
                        clearError('organizationCity');
                        clearError('organizationDistrict');
                      "
                    />
                    <SelectField
                      :model-value="data.organizationCity"
                      :options="cities"
                      :placeholder="
                        data.organizationProvince ? '请选择市' : '请先选择省份'
                      "
                      :disabled="!data.organizationProvince"
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
                      :placeholder="
                        data.organizationProvince
                          ? data.organizationCity
                            ? '请选择区'
                            : '请先选择市'
                          : '请先选择省份'
                      "
                      :disabled="!data.organizationProvince || !data.organizationCity"
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
              </div>

              <div v-show="step === 1" class="space-y-9">
                <Field
                  id="leaderName"
                  label="项目负责人"
                  required
                  :error="errors.leaderName"
                >
                  <TextField
                    :model-value="data.leaderName"
                    :max-length="20"
                    placeholder="请输入项目负责人姓名"
                    @update:model-value="
                      updateLeaderName($event);
                    "
                  />
                </Field>
                <Field
                  id="leaderTitle"
                  label="负责人职务"
                  required
                  hint="例如：CTO / 项目负责人 / 教授。"
                  :error="errors.leaderTitle"
                >
                  <TextField
                    :model-value="data.leaderTitle"
                    :max-length="30"
                    placeholder="请输入负责人职务"
                    @update:model-value="
                      data.leaderTitle = $event;
                      clearError('leaderTitle');
                    "
                  />
                </Field>
                <Field
                  id="contactName"
                  label="单位联系人"
                  required
                  :error="errors.contactName"
                >
                  <TextField
                    :model-value="data.contactName"
                    :max-length="20"
                    placeholder="请输入单位联系人"
                    @update:model-value="
                      data.contactName = $event;
                      clearError('contactName');
                    "
                  />
                </Field>
                <Field
                  id="contactPhone"
                  label="联系人电话"
                  required
                  :error="errors.contactPhone"
                >
                  <TextField
                    :model-value="data.contactPhone"
                    placeholder="请输入 11 位手机号"
                    @update:model-value="
                      updateContactPhone($event);
                    "
                  />
                </Field>

                <div id="members" class="scroll-mt-28">
                  <div
                    class="flex flex-wrap items-center justify-between gap-3"
                  >
                    <div>
                      <p class="apply-field-label mb-0">参赛小组成员</p>
                      <p class="apply-field-hint">
                        成员 1 为项目负责人，姓名与上方项目负责人自动同步；可继续添加其他成员。
                      </p>
                    </div>
                    <button
                      type="button"
                      class="inline-flex h-10 items-center gap-1.5 rounded-lg border border-blue-400/30 bg-blue-500/10 px-3 text-[15px] text-blue-200 hover:bg-blue-500/20 disabled:opacity-50"
                      :disabled="
                        data.members.length >= APPLY_OPTIONS.maxMembers
                      "
                      @click="addMember"
                    >
                      <Plus class="size-4" />
                      添加其他成员
                    </button>
                  </div>
                  <ul class="mt-5 space-y-5">
                    <li
                      v-for="(m, i) in data.members"
                      :key="i"
                      class="rounded-xl border border-blue-400/20 bg-[#071018] p-5"
                    >
                      <div class="mb-4 flex items-center justify-between">
                        <p class="text-sm font-medium text-blue-50">
                          成员 {{ i + 1 }}{{ i === 0 ? "（项目负责人）" : "" }}
                        </p>
                        <button
                          v-if="i > 0"
                          type="button"
                          class="inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm text-rose-300 hover:bg-rose-500/10 hover:text-rose-200"
                          @click="removeMember(i)"
                        >
                          <Trash2 class="size-3.5" />
                          移除
                        </button>
                      </div>
                      <div class="grid gap-6 sm:grid-cols-2">
                        <Field
                          :id="`members.${i}`"
                          label="姓名"
                          :error="errors[`members.${i}.name`]"
                        >
                          <TextField
                            :model-value="m.name"
                            :max-length="20"
                            placeholder="请输入姓名"
                            @update:model-value="updateMemberName(i, $event)"
                          />
                        </Field>
                        <Field
                          :id="`members.${i}.age`"
                          label="年龄"
                          :error="errors[`members.${i}.age`]"
                        >
                          <TextField
                            :model-value="m.age"
                            placeholder="请输入年龄"
                            @update:model-value="
                              m.age = $event.replace(/\D/g, '').slice(0, 3)
                            "
                          />
                        </Field>
                        <Field
                          :id="`members.${i}.gender`"
                          label="性别"
                          :error="errors[`members.${i}.gender`]"
                        >
                          <ChoiceGroup
                            :model-value="m.gender"
                            :options="APPLY_OPTIONS.genders"
                            :columns="2"
                            @update:model-value="m.gender = $event"
                          />
                        </Field>
                        <Field
                          :id="`members.${i}.phone`"
                          label="手机号码"
                          :error="errors[`members.${i}.phone`]"
                        >
                          <TextField
                            :model-value="m.phone"
                            placeholder="请输入 11 位手机号"
                            @update:model-value="
                              updateMemberPhone(i, $event)
                            "
                          />
                        </Field>
                        <div class="sm:col-span-2">
                          <Field
                            :id="`members.${i}.email`"
                            label="邮箱"
                            :error="errors[`members.${i}.email`]"
                          >
                            <TextField
                              :model-value="m.email"
                              placeholder="请输入邮箱"
                              @update:model-value="m.email = $event"
                            />
                          </Field>
                        </div>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>

              <div
                v-show="step === 2"
                id="review"
                class="space-y-8 scroll-mt-28"
              >
                <div>
                  <p class="apply-field-label">请审核表单内容</p>
                  <p class="apply-field-hint">
                    请核对以下信息。确认提交后，系统会根据全部填写内容生成官方报名表，请自行下载。盖章件请在提交作品阶段上传。
                  </p>
                </div>
                <dl
                  class="space-y-4 rounded-xl border border-blue-400/20 bg-[#071018] px-5 py-6 leading-7"
                >
                  <p class="apply-field-label !text-[#cffafe]">
                    一、项目基本信息
                  </p>
                  <div class="flex gap-4">
                    <dt class="text-slate-400">参赛方向:</dt>
                    <dd class="text-blue-50">
                      {{ data.direction }}
                    </dd>
                  </div>
                  <div class="flex gap-4">
                    <dt class="text-slate-400">项目名称:</dt>
                    <dd class="text-blue-50">
                      {{ data.projectName }}
                    </dd>
                  </div>
                  <div class="flex gap-4">
                    <dt class="text-slate-400">单位全称:</dt>
                    <dd class="text-blue-50">
                      {{ data.organizationName }}
                    </dd>
                  </div>
                  <div class="flex gap-4">
                    <dt class="text-slate-400">单位地址:</dt>
                    <dd class="text-blue-50">
                      {{
                        composeOrganizationAddress(
                          data.organizationProvince,
                          data.organizationCity,
                          data.organizationDistrict,
                          data.organizationDetail,
                        )
                      }}
                    </dd>
                  </div>
                  <div>
                    <dt class="text-slate-400">项目内容:</dt>
                    <dd class="text-blue-50">
                      {{ data.projectContent }}
                    </dd>
                  </div>
                  <p class="h-[1px] bg-blue-400/20"></p>
                  <p class="apply-field-label !text-[#cffafe]">
                    二、团队与联系人
                  </p>
                  <div class="flex gap-4">
                    <dt class="text-slate-400">项目负责人:</dt>
                    <dd class="text-blue-50">
                      {{ data.leaderName }}
                    </dd>
                  </div>
                  <div class="flex gap-4">
                    <dt class="text-slate-400">负责人邮箱:</dt>
                    <dd class="text-blue-50">
                      {{ data.members[0]?.email || "未填写" }}
                    </dd>
                  </div>
                  <div class="flex gap-4">
                    <dt class="text-slate-400">负责人职务:</dt>
                    <dd class="text-blue-50">
                      {{ data.leaderTitle }}
                    </dd>
                  </div>
                  <div class="flex gap-4">
                    <dt class="text-slate-400">单位联系人:</dt>
                    <dd class="text-blue-50">
                      {{ data.contactName }}
                    </dd>
                  </div>
                  <div class="flex gap-4">
                    <dt class="text-slate-400">联系人电话:</dt>
                    <dd class="text-blue-50">
                      {{ data.contactPhone }}
                    </dd>
                  </div>

                  <div>
                    <dt class="text-slate-400">
                      小组成员{{ `（${namedMembers().length}人）` }}
                    </dt>
                    <dd class="text-blue-50">
                      <div
                        class="mt-4 border-l-2 border-l-blue-500 pl-3"
                        v-for="(item, index) in data.members"
                        :key="index"
                      >
                        <p class="!text-[#cffafe]">
                          {{ item.name }}{{ `${index == 0 ? "(负责人)" : ""}` }}
                        </p>
                        <div class="flex gap-4">
                          <dt class="text-slate-400">性别:</dt>
                          <dd class="text-blue-50">
                            {{ item.gender }}
                          </dd>
                          <dt class="text-slate-400">年龄:</dt>
                          <dd class="text-blue-50">
                            {{ item.age }}
                          </dd>
                          <dt class="text-slate-400">手机号:</dt>
                          <dd class="text-blue-50">
                            {{ item.phone }}
                          </dd>
                          <dt class="text-slate-400">邮箱:</dt>
                          <dd class="text-blue-50">
                            {{ item.email }}
                          </dd>
                        </div>
                      </div>
                    </dd>
                  </div>
                </dl>
              </div>

              <div
                id="submit"
                class="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-blue-400/20 pt-8 scroll-mt-28"
              >
                <div class="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    class="inline-flex h-10 items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-4 text-[15px] text-slate-200 hover:bg-white/10"
                    @click="clearForm"
                  >
                    <Trash2 class="size-4" />
                    清空
                  </button>
                  <button
                    type="button"
                    class="inline-flex h-10 items-center gap-1 rounded-lg border border-white/15 bg-white/5 px-4 text-[15px] text-slate-200 hover:bg-white/10 disabled:opacity-40"
                    :disabled="step === 0"
                    @click="step = Math.max(0, step - 1)"
                  >
                    <ChevronLeft class="size-4" />
                    上一步
                  </button>
                </div>
                <button
                  v-if="step < STEPS.length - 1"
                  type="button"
                  class="btn-nova inline-flex h-10 items-center gap-1 rounded-xl px-5"
                  @click="goNext"
                >
                  下一步
                  <ChevronRight class="size-4" />
                </button>
                <div v-else class="flex flex-wrap items-center justify-end gap-3">
                  <button
                    type="button"
                    class="inline-flex h-10 items-center gap-1.5 rounded-lg border border-blue-400/30 bg-blue-500/10 px-5 text-[15px] font-semibold text-blue-100 hover:bg-blue-500/20"
                    @click="saveRegistration"
                  >
                    保存
                  </button>
                  <button
                    type="button"
                    class="btn-nova inline-flex h-10 items-center gap-1 rounded-xl px-5"
                    @click="confirmSubmit"
                  >
                    <Rocket class="size-4" />
                    提交
                  </button>
                </div>
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
