<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { ElMessage } from "element-plus";
import { Check, ClipboardList, Download, FileArchive, Mail, Trophy, X } from "lucide-vue-next";
import RegistrationTable from "@/components/RegistrationTable.vue";
import { CONTEST } from "@/lib/contest";
import {
  AWARD_LEVELS,
  JOURNEY_NODES,
  NODE_STATE_LABEL,
  currentJourneyIndex,
  formatRegDate,
  journeyNodeState,
  suggestedWorkFileName,
  type JourneyNodeState,
} from "@/lib/journey";
import { downloadRegistrationForm } from "@/lib/registration-form";
import { useAppStore } from "@/stores/app";
import { cn } from "@/utils/cn";
import type { Registration } from "@/lib/types";

const store = useAppStore();
const me = computed(() => store.currentUser);
const project = computed(() => {
  if (!me.value) return null;
  return (
    store.registrations
      .filter((r) => r.userId === me.value!.id)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0] ?? null
  );
});
const closed = computed(() => store.contestStage !== "registration");
const currentIdx = computed(() =>
  project.value ? currentJourneyIndex(project.value, store.contestStage) : 0,
);
const openIdx = ref(currentIdx.value);
const showTable = ref(false);
const suggested = computed(() => (project.value ? suggestedWorkFileName(project.value) : ""));

watch(currentIdx, (v) => {
  openIdx.value = v;
});

function nodeState(i: number): JourneyNodeState {
  if (!project.value) return "pending";
  return journeyNodeState(project.value, store.contestStage, i);
}

function onStamp(file: File) {
  if (!project.value) return;
  const res = store.uploadStampedForm(project.value.id, file.name);
  if (!res.ok) ElMessage.error(res.error);
  else ElMessage.success("盖章报名表已上传");
}

function onWork(file: File) {
  if (!project.value) return;
  const stem = file.name.replace(/\.(zip|rar|7z)$/i, "");
  const expected = suggested.value.replace(/\.(zip|rar|7z)$/i, "");
  if (stem !== expected) ElMessage.info(`建议文件名为 ${suggested.value}，当前为 ${file.name}`);
  const res = store.submitWorkPackage(project.value.id, file.name);
  if (!res.ok) ElMessage.error(res.error);
  else ElMessage.success(`已提交 ${file.name}`);
}

function pickFile(cb: (file: File) => void, event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (file) cb(file);
}

const lineHeight = computed(() => {
  const max = Math.max(JOURNEY_NODES.length - 1, 1);
  return `calc(${(currentIdx.value / max) * 100}% - 8px)`;
});

function awardText(reg: Registration) {
  return reg.awardLevel && (AWARD_LEVELS as readonly string[]).includes(reg.awardLevel)
    ? reg.awardLevel
    : "";
}
</script>

<template>
  <div v-if="!project" class="flex min-h-[360px] flex-col items-center justify-center text-center">
    <div class="flex size-16 items-center justify-center rounded-2xl bg-tech-blue/15 text-tech-cyan">
      <Trophy class="size-8" />
    </div>
    <h3 class="mt-5 text-lg font-semibold text-white">{{ closed ? "报名通道已关闭" : "还没有参赛记录" }}</h3>
    <p class="mt-2 max-w-sm text-sm text-slate-400">
      <template v-if="closed">当前赛事已过报名阶段，未报名账号无法补报。</template>
      <template v-else-if="me?.role === 'user'">每位参赛者仅可申报一个项目。报名后可返回修改，后台只保留最新一次提交。</template>
      <template v-else>当前账号身份不参与报名。</template>
    </p>
    <RouterLink
      v-if="me?.role === 'user' && !closed"
      to="/apply"
      class="btn-nova mt-6 inline-flex h-11 items-center gap-2 rounded-xl px-6"
    >
      <ClipboardList class="size-4" /> 我要报名
    </RouterLink>
  </div>

  <div v-else class="space-y-8">
    <div>
      <p class="text-xs tracking-[0.18em] text-cyan-300/80">我的比赛</p>
      <div class="mt-2 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 class="text-xl font-semibold text-white sm:text-2xl">{{ project.projectName }}</h2>
          <p class="mt-1.5 text-sm leading-6 text-slate-400">
            {{ project.direction }} · {{ project.organizationName }} · 负责人 {{ project.leaderName }}
          </p>
        </div>
        <p class="font-mono text-xs text-slate-500">
          报名编号 <span class="text-slate-300">{{ project.id.toUpperCase() }}</span>
        </p>
      </div>
    </div>

    <ol class="relative ml-1">
      <span class="absolute top-3 bottom-3 left-[15px] w-px bg-white/10" />
      <span
        class="absolute left-[15px] w-px bg-linear-to-b from-tech-cyan via-tech-blue to-transparent"
        :style="{ top: '12px', height: lineHeight }"
      />
      <li v-for="(node, i) in JOURNEY_NODES" :key="node.status" class="relative pb-8 last:pb-0">
        <button type="button" class="flex w-full items-start gap-4 text-left" @click="openIdx = i">
          <span
            :class="
              cn(
                'relative z-10 mt-1 flex size-8 shrink-0 items-center justify-center rounded-full border-2',
                nodeState(i) === 'done' && 'border-tech-cyan bg-tech-cyan text-[#042028]',
                nodeState(i) === 'current' &&
                  'border-cyan-100 bg-cyan-300 text-[#042028] shadow-[0_0_18px_rgba(34,211,238,.95)]',
                nodeState(i) === 'failed' && 'border-rose-300 bg-rose-400 text-white',
                nodeState(i) === 'pending' && 'border-white/25 bg-[#071018] text-transparent',
                nodeState(i) === 'skipped' && 'border-white/15 bg-[#071018] text-slate-500',
              )
            "
          >
            <Check v-if="nodeState(i) === 'done'" class="size-3.5" />
            <span
              v-else-if="nodeState(i) === 'current'"
              class="size-2.5 rounded-full bg-[#042028] shadow-[0_0_8px_rgba(4,32,40,.4)]"
            />
            <X v-else-if="nodeState(i) === 'failed' || nodeState(i) === 'skipped'" class="size-3.5" />
            <span v-else class="size-2 rounded-full bg-white/20" />
          </span>
          <div class="min-w-0 flex-1 pt-0.5">
            <div class="flex flex-wrap items-center justify-between gap-2">
              <p
                :class="
                  cn(
                    'text-[15px] font-semibold leading-6',
                    nodeState(i) === 'current' && 'text-white',
                    nodeState(i) === 'done' && 'text-slate-100',
                    nodeState(i) === 'failed' && 'text-rose-200',
                    (nodeState(i) === 'pending' || nodeState(i) === 'skipped') && 'text-slate-400',
                  )
                "
              >
                {{ node.title }}
              </p>
              <span
                :class="
                  cn(
                    'rounded-full px-2 py-0.5 text-[11px] tracking-wide',
                    nodeState(i) === 'current' && 'bg-cyan-400/15 text-cyan-200',
                    nodeState(i) === 'done' && 'bg-emerald-400/12 text-emerald-300',
                    nodeState(i) === 'failed' && 'bg-rose-400/15 text-rose-300',
                    (nodeState(i) === 'skipped' || nodeState(i) === 'pending') && 'bg-white/5 text-slate-500',
                  )
                "
              >
                {{ NODE_STATE_LABEL[nodeState(i)] }}
              </span>
            </div>
            <p class="mt-0.5 text-xs leading-5 text-slate-500">{{ node.time }}</p>
          </div>
        </button>

        <div
          v-if="openIdx === i"
          :class="
            cn(
              'mt-3 ml-10 rounded-2xl border px-4 py-4 sm:px-5',
              nodeState(i) === 'current' &&
                'border-cyan-300/40 bg-[linear-gradient(165deg,rgba(8,90,130,.42),rgba(8,24,40,.88))] shadow-[0_0_36px_-12px_rgba(34,211,238,.5)]',
              nodeState(i) === 'done' && 'border-white/10 bg-white/[0.04]',
              nodeState(i) === 'failed' && 'border-rose-400/30 bg-rose-500/10',
              (nodeState(i) === 'pending' || nodeState(i) === 'skipped') && 'border-white/8 bg-white/[0.03]',
            )
          "
        >
          <p v-if="nodeState(i) === 'pending'" class="text-sm leading-7 text-slate-400">
            该环节尚未开始。{{ node.desc }}
          </p>
          <p v-else-if="nodeState(i) === 'skipped'" class="text-sm leading-7 text-slate-400">
            {{ project.enteredFinals === false ? "本次未进入该环节。" : "未进入该环节。" }}
          </p>
          <div v-else-if="nodeState(i) === 'failed'" class="space-y-3 text-sm leading-7 text-rose-100">
            <p class="font-medium text-rose-200">信息提交需修改</p>
            <p v-if="i === 0">{{ project.registrationAuditNote || "报名信息不符合要求，请按组委会意见补充后等待复审。" }}</p>
            <template v-else-if="i === 1">
              <p>{{ project.materialsAuditNote || "参赛材料不符合要求，请修改后重新上传压缩包。" }}</p>
              <p class="font-mono text-xs text-cyan-200">命名方式：赛道方向+项目名称+负责人，如 {{ suggested }}</p>
              <label class="inline-flex cursor-pointer items-center rounded-lg border border-white/15 px-3 py-2 text-xs text-slate-200 hover:bg-white/5">
                重新上传盖章报名表
                <input class="hidden" type="file" accept="application/pdf,image/*" @change="pickFile(onStamp, $event)" />
              </label>
              <label class="inline-flex cursor-pointer items-center rounded-lg border border-white/15 px-3 py-2 text-xs text-slate-200 hover:bg-white/5">
                重新上传压缩包（.zip / .rar / .7z）
                <input class="hidden" type="file" accept=".zip,.rar,.7z" @change="pickFile(onWork, $event)" />
              </label>
            </template>
            <p v-else>本项目未通过审核。如有疑问请通过右下角留言联系组委会。</p>
            <p class="text-xs text-slate-400">站内信与短信已同步发送，请注意查收。</p>
          </div>

          <div v-else-if="i === 0" class="space-y-3 text-sm leading-7 text-slate-300">
            <p>
              已于 {{ formatRegDate(project.registrationDate) }} 完成线上报名。请下载报名表交单位盖章；盖章件在「提交作品」环节上传。
            </p>
            <div class="flex flex-wrap gap-2">
              <button class="btn-nova inline-flex h-9 items-center gap-1 rounded-lg px-3 text-sm" @click="downloadRegistrationForm(project)">
                <Download class="size-3.5" /> 下载报名表
              </button>
              <!-- <RouterLink
                v-if="!closed"
                to="/apply"
                class="inline-flex h-9 items-center rounded-lg border border-white/15 px-3 text-sm text-slate-200 hover:bg-white/5"
              >
                修改报名信息
              </RouterLink> -->
              <button class="rounded-lg px-3 py-1.5 text-sm text-slate-300 hover:bg-white/5" @click="showTable = !showTable">
                {{ showTable ? "收起表格" : "预览表格" }}
              </button>
            </div>
            <div v-if="showTable" class="overflow-auto rounded-lg border border-white/10 bg-white p-3">
              <RegistrationTable :data="project" />
            </div>
          </div>

          <div v-else-if="i === 1" class="space-y-3 text-sm leading-7 text-slate-300">
            <template v-if="nodeState(i) === 'done'">
              <p>
                作品材料已提交{{ project.workPackageName ? `：${project.workPackageName}` : "。" }}
                {{ project.stampedFormName ? ` 盖章报名表：${project.stampedFormName}` : "" }}
              </p>
            </template>
            <template v-else>
              <p>请先上传带企业公章的报名表，再将 PPT、文档、视频、代码等打成压缩包上传。未上传盖章件无法提交作品。</p>
              <p class="font-mono text-xs text-cyan-200">命名方式：赛道方向+项目名称+负责人，如 {{ suggested }}</p>
              <template v-if="nodeState(i) === 'current' && !project.stampedFormName">
                <p class="text-amber-200">请先上传盖章报名表，再提交压缩包。</p>
                <label class="inline-flex cursor-pointer items-center rounded-lg border border-white/15 px-3 py-2 text-xs text-slate-200 hover:bg-white/5">
                  上传盖章报名表（PDF / 图片）
                  <input class="hidden" type="file" accept="application/pdf,image/*" @change="pickFile(onStamp, $event)" />
                </label>
              </template>
              <template v-else-if="nodeState(i) === 'current'">
                <p class="text-xs text-cyan-200">盖章报名表：{{ project.stampedFormName }}</p>
                <p v-if="project.workPackageName" class="flex items-center gap-2 text-xs text-emerald-300">
                  <FileArchive class="size-3.5" /> 已提交 {{ project.workPackageName }}
                </p>
                <label class="inline-flex cursor-pointer items-center rounded-lg border border-white/15 px-3 py-2 text-xs text-slate-200 hover:bg-white/5">
                  {{ project.workPackageName ? "更新压缩包（.zip / .rar / .7z）" : "上传压缩包（.zip / .rar / .7z）" }}
                  <input class="hidden" type="file" accept=".zip,.rar,.7z" @change="pickFile(onWork, $event)" />
                </label>
              </template>
              <p v-else class="text-slate-400">提交通道将在赛事进入「提交作品」后开放。</p>
            </template>
          </div>

          <p v-else-if="i === 2" class="text-sm leading-7 text-slate-300">
            {{ nodeState(i) === "done" ? "材料完整性核验已完成，已进入后续评审。" : "参赛资料审核进行中，组委会正在核验材料完整性。" }}
          </p>

          <div v-else-if="i === 3" class="text-sm leading-7 text-slate-300">
            <template v-if="project.reviewScore != null">
              <p class="text-2xl font-bold text-white">{{ project.reviewScore }} 分</p>
              <p class="mt-1">{{ project.enteredFinals ? "已进入决赛，请关注路演答辩通知。" : "本次未进入决赛。感谢参与。" }}</p>
            </template>
            <p v-else-if="nodeState(i) === 'current'">专家函评进行中，分数与是否进入决赛将同步到本节点。</p>
            <p v-else>函评结束后将在此公布分数。</p>
          </div>

          <div v-else-if="i === 4" class="text-sm leading-7 text-slate-300">
            <p v-if="project.enteredFinals === false">本项目未入围线下终赛。</p>
            <template v-else>
              <p class="font-medium text-white">终赛为线下路演答辩</p>
              <p class="mt-1">请按组委会通知携带材料到场路演。请保持手机与邮箱畅通。</p>
            </template>
          </div>

          <div v-else class="text-sm leading-7 text-slate-300">
            <p v-if="awardText(project)" class="text-2xl font-bold text-white">{{ awardText(project) }}</p>
            <p v-else>感谢参赛。本次未进入获奖名单。</p>
            <p class="mt-3 flex items-center gap-2">
              <Mail class="size-4 text-cyan-300" />
              联系邮箱
              <a class="text-cyan-200 underline" :href="`mailto:${CONTEST.supportEmail}`">{{ CONTEST.supportEmail }}</a>
            </p>
          </div>
        </div>
      </li>
    </ol>
  </div>
</template>
