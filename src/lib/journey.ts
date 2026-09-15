import type { ContestStage, Registration, RegistrationStatus } from "./types";
import { CONTEST } from "./contest";

export const CONTEST_STAGE_META: {
  key: ContestStage;
  label: string;
  hint: string;
}[] = [
  { key: "registration", label: "报名阶段", hint: "填写报名信息并下载报名表。盖章件在提交作品阶段上传。" },
  { key: "work", label: "提交作品", hint: "先上传盖章报名表，再提交 PPT、文档、视频、代码等压缩包。" },
  { key: "materials_review", label: "参赛资料审核", hint: "组委会核验材料完整性，个人中心同步审核状态。" },
  { key: "online_review", label: "线上函评", hint: "专家打分，公布是否进入决赛及函评分数。" },
  { key: "finals", label: "路演答辩", hint: "终赛为线下举行，请按通知到场路演答辩。" },
  { key: "awarded", label: "颁奖结果", hint: "公布获奖等级，组委会将邮件联系获奖团队。" },
];

export const REG_STATUS_LABEL: Record<RegistrationStatus, string> = {
  registered: "报名成功",
  work_submitted: "作品已提交",
  materials_review: "资料审核中",
  need_revision: "信息提交需修改",
  online_review: "线上函评",
  finals: "路演答辩",
  awarded: "已颁奖",
  rejected: "未通过",
};

export const USER_PIPELINE: RegistrationStatus[] = [
  "registered",
  "work_submitted",
  "materials_review",
  "online_review",
  "finals",
  "awarded",
];

/** One contest process node — shown as a recruitment-style timeline. */
export const JOURNEY_NODES: {
  status: Exclude<RegistrationStatus, "rejected" | "need_revision">;
  stage: ContestStage;
  title: string;
  time: string;
  desc: string;
}[] = [
  {
    status: "registered",
    stage: "registration",
    title: "报名成功",
    time: "10.12 10:00 — 10.16 18:00",
    desc: "完成线上报名，下载官方报名表并交单位盖章。",
  },
  {
    status: "work_submitted",
    stage: "work",
    title: "提交作品",
    time: "10.30 18:00 前",
    desc: "上传盖章报名表，以及 PPT、文档、视频、代码等压缩包。",
  },
  {
    status: "materials_review",
    stage: "materials_review",
    title: "资料审核",
    time: "10.31 — 11.03",
    desc: "组委会核验材料完整性，个人中心同步审核状态。",
  },
  {
    status: "online_review",
    stage: "online_review",
    title: "线上函评",
    time: "11.09 — 11.13",
    desc: "专家打分，公布函评分数与是否进入决赛。",
  },
  {
    status: "finals",
    stage: "finals",
    title: "路演答辩",
    time: "11 月中下旬",
    desc: "终赛为线下路演，请按通知携带材料到场。",
  },
  {
    status: "awarded",
    stage: "awarded",
    title: "颁奖结果",
    time: "11 月末",
    desc: "公布获奖等级，组委会将邮件联系获奖团队。",
  },
];

export type JourneyNodeState = "done" | "current" | "pending" | "skipped" | "failed";

export const NODE_STATE_LABEL: Record<JourneyNodeState, string> = {
  done: "已完成",
  current: "进行中",
  pending: "未开始",
  skipped: "未进入",
  failed: "需修改",
};

export function currentJourneyIndex(reg: Registration, contestStage: ContestStage): number {
  if (reg.status === "rejected") return 2;
  if (reg.status === "need_revision") {
    return reg.registrationAudit === "need_revision" ? 0 : 1;
  }
  const resultOut =
    reg.enteredFinals === false &&
    (contestStage === "finals" ||
      contestStage === "awarded" ||
      (contestStage === "online_review" && reg.reviewScore != null));
  if (resultOut) return 3;
  const userIdx = USER_PIPELINE.indexOf(reg.status);
  const stageIdx = JOURNEY_NODES.findIndex((n) => n.stage === contestStage);
  if (userIdx < 0 || stageIdx < 0) return 0;
  if (userIdx < stageIdx) return Math.min(userIdx + 1, stageIdx);
  return stageIdx;
}

export function journeyNodeState(
  reg: Registration,
  contestStage: ContestStage,
  nodeIndex: number,
): JourneyNodeState {
  if (reg.status === "rejected") {
    if (nodeIndex < 2) return "done";
    if (nodeIndex === 2) return "failed";
    return "skipped";
  }
  if (reg.status === "need_revision") {
    const atReg = reg.registrationAudit === "need_revision";
    if (atReg) {
      if (nodeIndex === 0) return "failed";
      return "pending";
    }
    if (nodeIndex === 0) return "done";
    if (nodeIndex === 1) return "failed";
    return "pending";
  }
  const resultOut =
    reg.enteredFinals === false &&
    (contestStage === "finals" ||
      contestStage === "awarded" ||
      (contestStage === "online_review" && reg.reviewScore != null));
  if (resultOut && nodeIndex >= 4) return "skipped";
  const cur = currentJourneyIndex(reg, contestStage);
  if (nodeIndex < cur) return "done";
  if (nodeIndex === cur) return "current";
  return "pending";
}

export const AWARD_LEVELS = ["一等奖", "二等奖", "三等奖", "优秀奖"] as const;

/** 赛道方向+参赛项目名称+负责人，如 AI研发设计_基于CAD的3D设计工具_张子怡 */
export function suggestedWorkBaseName(reg: Pick<Registration, "direction" | "projectName" | "leaderName">) {
  const track = reg.direction.replace(/\+/g, "").replace(/\s+/g, "");
  const raw = `${track}_${reg.projectName}_${reg.leaderName}`;
  return raw.replace(/[\\/:*?"<>|]/g, "").replace(/\s+/g, "");
}

export function suggestedWorkFileName(reg: Pick<Registration, "direction" | "projectName" | "leaderName">) {
  return `${suggestedWorkBaseName(reg)}.zip`;
}

export function formatRegDate(iso: string) {
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${y} 年 ${Number(m)} 月 ${Number(d)} 日`;
}

export function contestStageLabel(stage: ContestStage) {
  return CONTEST_STAGE_META.find((s) => s.key === stage)?.label ?? stage;
}

/** When the organizer advances the global contest stage, bump each project that is ready. */
export function registrationsForContestStage(regs: Registration[], stage: ContestStage): Registration[] {
  return regs.map((r) => {
    if (r.status === "rejected" || r.status === "need_revision") return r;
    switch (stage) {
      case "registration":
        return { ...r, status: "registered" };
      case "work":
        return { ...r, status: r.workPackageName ? "work_submitted" : "registered" };
      case "materials_review":
        return { ...r, status: r.workPackageName ? "materials_review" : "registered" };
      case "online_review":
        return { ...r, status: r.workPackageName ? "online_review" : "registered" };
      case "finals":
        if (r.enteredFinals) return { ...r, status: "finals" };
        if (r.workPackageName) return { ...r, status: "online_review" };
        return { ...r, status: "registered" };
      case "awarded":
        if (r.enteredFinals || r.awardLevel) return { ...r, status: "awarded" };
        if (r.workPackageName) return { ...r, status: "online_review" };
        return { ...r, status: "registered" };
      default:
        return r;
    }
  });
}

export function contestContactLine() {
  return CONTEST.supportEmail;
}
