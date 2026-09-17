import { defineStore } from "pinia";
import { computed, ref } from "vue";
import type {
  AuditResult,
  ContestStage,
  DemandStatus,
  DemandSubmission,
  FeedbackStatus,
  NoticeTarget,
  Notification,
  Registration,
  Review,
  Role,
  SiteMessage,
  SiteNotice,
  SmsLog,
  Submission,
  User,
} from "@/lib/types";
import {
  SEED_DEMANDS,
  SEED_MESSAGES,
  SEED_NOTICES,
  SEED_NOTIFICATIONS,
  SEED_REGISTRATIONS,
  SEED_REVIEWS,
  SEED_SMS,
  SEED_SUBMISSIONS,
  SEED_USERS,
} from "@/lib/seed";
import { CONTEST_STAGE_META, registrationsForContestStage } from "@/lib/journey";

const STORAGE_KEY = "aimc.prototype.v9";
export const MOCK_SMS_CODE = "123456";
export const PHONE_RE = /^1[3-9]\d{9}$/;

function stripHtml(html: string) {
  return html
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();
}
export const ROLE_LABEL: Record<Role, string> = {
  user: "参赛用户",
  judge: "评审专家",
  admin: "管理员",
};
export const FEEDBACK_STATUS_LABEL: Record<FeedbackStatus, string> = {
  processing: "处理中",
  ignored: "忽视",
  processed: "已处理",
};
export const AUDIT_LABEL: Record<AuditResult, string> = {
  pending: "待审核",
  passed: "审核通过",
  need_revision: "审核不通过，需修改",
};
export const DEMAND_STATUS_LABEL: Record<DemandStatus, string> = {
  pending: "待评估",
  accepted: "已纳入",
  need_revision: "需补充",
};
export const NOTICE_TARGET_LABEL: Record<NoticeTarget, string> = {
  all: "全部账号",
  user: "参赛用户",
  judge: "评审专家",
};

export type Result<T = void> = { ok: true; data: T } | { ok: false; error: string };

const KEYBOARD_ROWS = ["1234567890", "qwertyuiop", "asdfghjkl", "zxcvbnm"];
const SHIFTED_NUMBER_KEYS: Record<string, string> = {
  "!": "1",
  "@": "2",
  "#": "3",
  $: "4",
  "%": "5",
  "^": "6",
  "&": "7",
  "*": "8",
  "(": "9",
  ")": "0",
};

function containsKeyboardSequence(pwd: string) {
  const normalized = [...pwd.toLowerCase()].map((char) => SHIFTED_NUMBER_KEYS[char] ?? char).join("");
  return KEYBOARD_ROWS.some((row) => {
    const reversedRow = [...row].reverse().join("");
    for (let index = 0; index <= normalized.length - 3; index += 1) {
      const sequence = normalized.slice(index, index + 3);
      if (row.includes(sequence) || reversedRow.includes(sequence)) return true;
    }
    return false;
  });
}

export const PASSWORD_RULES = {
  length: (pwd: string) => pwd.length >= 8 && pwd.length <= 20,
  uppercase: (pwd: string) => /[A-Z]/.test(pwd),
  noRepeatedCharacters: (pwd: string) => !/([\s\S])\1\1/u.test(pwd),
  noKeyboardSequence: (pwd: string) => !containsKeyboardSequence(pwd),
  valid: (pwd: string) =>
    PASSWORD_RULES.length(pwd) &&
    PASSWORD_RULES.uppercase(pwd) &&
    PASSWORD_RULES.noRepeatedCharacters(pwd) &&
    PASSWORD_RULES.noKeyboardSequence(pwd),
};

interface PersistedState {
  users: User[];
  registrations: Registration[];
  submissions: Submission[];
  reviews: Review[];
  notifications: Notification[];
  messages: SiteMessage[];
  notices: SiteNotice[];
  smsLogs: SmsLog[];
  demands: DemandSubmission[];
  currentUserId: string | null;
  contestStage: ContestStage;
}

const uid = (prefix: string) =>
  `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

function permsFor(role: Role): User["permissions"] {
  return {
    canApply: role === "user",
    canSubmitWork: role === "user",
    canReview: role === "judge",
  };
}

function initialState(): PersistedState {
  return {
    users: SEED_USERS,
    registrations: SEED_REGISTRATIONS,
    submissions: SEED_SUBMISSIONS,
    reviews: SEED_REVIEWS,
    notifications: SEED_NOTIFICATIONS,
    messages: SEED_MESSAGES,
    notices: SEED_NOTICES,
    smsLogs: SEED_SMS,
    demands: SEED_DEMANDS,
    currentUserId: null,
    contestStage: "registration",
  };
}

function loadState(): PersistedState {
  const base = initialState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return base;
    const parsed = JSON.parse(raw) as Partial<PersistedState>;
    return {
      ...base,
      ...parsed,
      reviews: (parsed.reviews ?? base.reviews).map((r) => ({
        ...r,
        status: r.status ?? "submitted",
      })),
      messages: (parsed.messages ?? base.messages).map((m) => {
        const attachments =
          m.attachments?.filter((a) => a?.url) ??
          (m.attachmentUrl ? [{ name: m.attachmentName || "截图", url: m.attachmentUrl }] : []);
        return {
          ...m,
          attachmentName: m.attachmentName ?? attachments[0]?.name ?? "",
          attachmentUrl: m.attachmentUrl ?? attachments[0]?.url,
          attachments,
          username: m.username ?? "未登录访客",
          account: m.account ?? "",
          status: m.status ?? "processing",
        };
      }),
      notices: parsed.notices ?? base.notices,
      smsLogs: parsed.smsLogs ?? base.smsLogs,
      demands: parsed.demands ?? base.demands,
    };
  } catch {
    return base;
  }
}

export const useAppStore = defineStore("app", () => {
  const hydrated = ref(false);
  const users = ref<User[]>([]);
  const registrations = ref<Registration[]>([]);
  const submissions = ref<Submission[]>([]);
  const reviews = ref<Review[]>([]);
  const notifications = ref<Notification[]>([]);
  const messages = ref<SiteMessage[]>([]);
  const notices = ref<SiteNotice[]>([]);
  const smsLogs = ref<SmsLog[]>([]);
  const demands = ref<DemandSubmission[]>([]);
  const currentUserId = ref<string | null>(null);
  const contestStage = ref<ContestStage>("registration");

  const currentUser = computed(() => users.value.find((u) => u.id === currentUserId.value) ?? null);

  function persist() {
    const next: PersistedState = {
      users: users.value,
      registrations: registrations.value,
      submissions: submissions.value,
      reviews: reviews.value,
      notifications: notifications.value,
      messages: messages.value,
      notices: notices.value,
      smsLogs: smsLogs.value,
      demands: demands.value,
      currentUserId: currentUserId.value,
      contestStage: contestStage.value,
    };
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* ignore quota */
    }
  }

  function applyState(s: PersistedState) {
    users.value = s.users;
    registrations.value = s.registrations;
    submissions.value = s.submissions;
    reviews.value = s.reviews;
    notifications.value = s.notifications;
    messages.value = s.messages;
    notices.value = s.notices ?? [];
    smsLogs.value = s.smsLogs ?? [];
    demands.value = s.demands ?? [];
    currentUserId.value = s.currentUserId;
    contestStage.value = s.contestStage;
  }

  function hydrate() {
    applyState(loadState());
    hydrated.value = true;
  }

  function pushNotification(n: Omit<Notification, "id" | "createdAt" | "read">) {
    notifications.value = [
      { ...n, id: uid("n"), createdAt: new Date().toISOString(), read: false, noticeId: n.noticeId },
      ...notifications.value,
    ];
    persist();
  }

  function pushSms(userId: string, title: string, body: string) {
    const user = users.value.find((u) => u.id === userId);
    if (!user) return;
    smsLogs.value = [
      {
        id: uid("sms"),
        userId,
        phone: user.phone,
        title,
        body: `【AI原生工厂大赛】${body}`,
        createdAt: new Date().toISOString(),
      },
      ...smsLogs.value,
    ];
  }

  function notifyUser(userId: string, title: string, body: string, type: Notification["type"] = "review") {
    pushNotification({ userId, title, body, type });
    pushSms(userId, title, body);
  }

  function loginWithSms(phone: string, code: string): Result<User> {
    if (!PHONE_RE.test(phone)) return { ok: false, error: "请输入正确的手机号" };
    if (code !== MOCK_SMS_CODE) return { ok: false, error: "验证码错误，请重新输入" };
    let user = users.value.find((u) => u.phone === phone);
    if (user && user.status === "disabled") return { ok: false, error: "该账号已被禁用，请联系组委会" };
    if (!user) {
      user = {
        id: uid("u"),
        phone,
        username: `参赛者${phone.slice(-4)}`,
        password: "",
        role: "user",
        status: "active",
        createdAt: new Date().toISOString(),
        permissions: { canApply: true, canSubmitWork: true, canReview: false },
      };
      users.value = [user, ...users.value];
      currentUserId.value = user.id;
      persist();
      pushNotification({
        userId: user.id,
        title: "欢迎加入 AI原生智能工厂创新应用大赛",
        body: "您已通过手机号快捷登录并完成注册，请前往个人中心完善资料。",
        type: "system",
      });
      return { ok: true, data: user };
    }
    currentUserId.value = user.id;
    persist();
    return { ok: true, data: user };
  }

  function loginWithPassword(account: string, password: string): Result<User> {
    const user = users.value.find((u) => u.phone === account.trim() || u.username === account.trim());
    if (!user || user.password !== password) return { ok: false, error: "账号或密码错误" };
    if (user.status === "disabled") return { ok: false, error: "该账号已被禁用，请联系组委会" };
    currentUserId.value = user.id;
    persist();
    return { ok: true, data: user };
  }

  function register(input: {
    phone: string;
    code: string;
    username: string;
    password: string;
  }): Result<User> {
    if (!PHONE_RE.test(input.phone)) return { ok: false, error: "请输入正确的手机号" };
    if (input.code !== MOCK_SMS_CODE) return { ok: false, error: "验证码错误，请重新输入" };
    if (!input.username.trim()) return { ok: false, error: "请输入用户名" };
    if (users.value.some((u) => u.phone === input.phone)) return { ok: false, error: "该手机号已注册，请直接登录" };
    if (users.value.some((u) => u.username === input.username.trim())) return { ok: false, error: "用户名已被占用" };
    if (!PASSWORD_RULES.valid(input.password)) {
      return { ok: false, error: "密码不符合安全要求" };
    }
    const user: User = {
      id: uid("u"),
      phone: input.phone,
      username: input.username.trim(),
      password: input.password,
      role: "user",
      status: "active",
      createdAt: new Date().toISOString(),
      permissions: { canApply: true, canSubmitWork: true, canReview: false },
    };
    users.value = [user, ...users.value];
    currentUserId.value = user.id;
    persist();
    pushNotification({
      userId: user.id,
      title: "注册成功",
      body: "欢迎加入 AI原生智能工厂创新应用大赛，点击「我要报名」开始提交您的项目。",
      type: "system",
    });
    return { ok: true, data: user };
  }

  function verifyResetIdentity(phone: string, code: string): Result<{ phone: string }> {
    if (!PHONE_RE.test(phone)) return { ok: false, error: "请输入正确的手机号" };
    if (code !== MOCK_SMS_CODE) return { ok: false, error: "验证码错误，请重新输入" };
    const user = users.value.find((u) => u.phone === phone);
    if (!user) return { ok: false, error: "该手机号尚未注册" };
    if (user.status === "disabled") return { ok: false, error: "该账号已被禁用，请联系组委会" };
    return { ok: true, data: { phone } };
  }

  function resetPassword(input: { phone: string; code: string; password: string }): Result<User> {
    const verified = verifyResetIdentity(input.phone, input.code);
    if (!verified.ok) return verified;
    if (!PASSWORD_RULES.valid(input.password)) return { ok: false, error: "密码不符合安全要求" };
    const user = users.value.find((u) => u.phone === input.phone);
    if (!user) return { ok: false, error: "该手机号尚未注册" };
    user.password = input.password;
    persist();
    pushNotification({
      userId: user.id,
      title: "密码已重置",
      body: "您的账号密码已完成重置，如非本人操作请及时联系组委会。",
      type: "system",
    });
    return { ok: true, data: user };
  }

  function logout() {
    currentUserId.value = null;
    persist();
  }

  function updateProfile(patch: Partial<Pick<User, "username" | "email" | "organization" | "title">>) {
    users.value = users.value.map((u) => (u.id === currentUserId.value ? { ...u, ...patch } : u));
    persist();
  }

  function submitRegistration(
    input: Omit<Registration, "id" | "userId" | "createdAt" | "status">,
  ): Result<Registration> {
    const me = currentUser.value;
    if (!me) return { ok: false, error: "请先登录" };
    if (!me.permissions.canApply) return { ok: false, error: "当前账号没有报名权限" };
    const now = new Date().toISOString();
    const prev = registrations.value.find((r) => r.userId === me.id);
    if (prev) {
      const next: Registration = {
        ...prev,
        projectName: input.projectName,
        organizationName: input.organizationName,
        isDian: input.isDian ?? "否",
        leaderName: input.leaderName,
        leaderTitle: input.leaderTitle,
        organizationCity: input.organizationCity,
        organizationDistrict: input.organizationDistrict,
        organizationDetail: input.organizationDetail,
        organizationAddress: input.organizationAddress,
        direction: input.direction,
        projectContent: input.projectContent,
        members: input.members,
        contactName: input.contactName,
        contactPhone: input.contactPhone,
        registrationDate: now.slice(0, 10),
        registrationAudit: "pending",
        registrationAuditNote: undefined,
        status: prev.workPackageName ? prev.status : "registered",
      };
      registrations.value = registrations.value.map((r) => (r.id === prev.id ? next : r));
      persist();
      pushNotification({
        userId: me.id,
        title: "报名信息已更新",
        body: `项目「${next.projectName}」的报名信息已覆盖为最新内容。请重新下载报名表。`,
        type: "contest",
      });
      return { ok: true, data: next };
    }
    const reg: Registration = {
      ...input,
      id: `r_${1000 + registrations.value.length + 1}`,
      userId: me.id,
      createdAt: now,
      registrationDate: now.slice(0, 10),
      status: "registered",
      registrationAudit: "pending",
      materialsAudit: "pending",
    };
    registrations.value = [reg, ...registrations.value];
    persist();
    pushNotification({
      userId: me.id,
      title: "您已经报名成功",
      body: `项目「${reg.projectName}」已完成线上报名。请下载报名表。加盖企业公章后的报名表，请在提交作品阶段上传，并同时提交 PPT、文档、视频、代码等压缩包。`,
      type: "contest",
    });
    return { ok: true, data: reg };
  }

  function uploadStampedForm(registrationId: string, fileName: string): Result<Registration> {
    const me = currentUser.value;
    if (!me) return { ok: false, error: "请先登录" };
    const reg = registrations.value.find((r) => r.id === registrationId && r.userId === me.id);
    if (!reg) return { ok: false, error: "未找到报名记录" };
    const next = {
      ...reg,
      stampedFormName: fileName,
      status: (reg.materialsAudit === "need_revision" ? "need_revision" : "registered") as Registration["status"],
    };
    registrations.value = registrations.value.map((r) => (r.id === registrationId ? next : r));
    persist();
    pushNotification({
      userId: me.id,
      title: "盖章报名表已上传",
      body: `已收到「${fileName}」。请继续上传参赛材料压缩包（PPT、文档、视频、代码等）。`,
      type: "contest",
    });
    return { ok: true, data: next };
  }

  function submitWorkPackage(registrationId: string, fileName: string): Result<Submission> {
    const me = currentUser.value;
    if (!me) return { ok: false, error: "请先登录" };
    if (!me.permissions.canSubmitWork) return { ok: false, error: "当前账号没有提交作品权限" };
    const reg = registrations.value.find((r) => r.id === registrationId && r.userId === me.id);
    if (!reg) return { ok: false, error: "未找到报名记录" };
    if (!reg.stampedFormName) {
      return { ok: false, error: "请先上传带企业公章的报名表，再提交参赛材料压缩包。" };
    }
    const existing = submissions.value.find((s) => s.registrationId === registrationId);
    const sub: Submission = existing
      ? { ...existing, fileName, submittedAt: new Date().toISOString(), title: reg.projectName }
      : {
          id: uid("s"),
          registrationId,
          title: reg.projectName,
          team: reg.organizationName,
          track: reg.direction,
          summary: reg.projectContent.slice(0, 120),
          fileName,
          fileUrl: "",
          fileSize: "本地选择",
          submittedAt: new Date().toISOString(),
          assignedJudgeIds: [],
        };
    registrations.value = registrations.value.map((r) =>
      r.id === registrationId
        ? {
            ...r,
            workPackageName: fileName,
            status: "work_submitted",
            materialsAudit: "pending",
            materialsAuditNote: "",
          }
        : r,
    );
    submissions.value = existing
      ? submissions.value.map((x) => (x.id === existing.id ? sub : x))
      : [sub, ...submissions.value];
    persist();
    pushNotification({
      userId: me.id,
      title: "参赛材料已提交",
      body: `压缩包「${fileName}」已提交，进入参赛资料审核后可在个人中心查看进度。`,
      type: "contest",
    });
    return { ok: true, data: sub };
  }

  function setContestStage(stage: ContestStage) {
    const meta = CONTEST_STAGE_META.find((s) => s.key === stage);
    contestStage.value = stage;
    registrations.value = registrationsForContestStage(registrations.value, stage);
    persist();
    pushNotification({
      userId: "all",
      title: `赛事已进入「${meta?.label ?? stage}」`,
      body: meta?.hint ?? "请到个人中心查看最新安排。",
      type: "contest",
    });
  }

  function updateRegistration(id: string, patch: Partial<Registration>) {
    registrations.value = registrations.value.map((r) => (r.id === id ? { ...r, ...patch } : r));
    persist();
  }

  function setUserRole(userId: string, role: Role) {
    users.value = users.value.map((u) =>
      u.id === userId
        ? {
            ...u,
            role,
            permissions: permsFor(role),
          }
        : u,
    );
    persist();
  }

  function setUserStatus(userId: string, status: User["status"]) {
    users.value = users.value.map((u) => (u.id === userId ? { ...u, status } : u));
    persist();
  }

  function setUserPermission(userId: string, key: keyof User["permissions"], value: boolean) {
    users.value = users.value.map((u) =>
      u.id === userId ? { ...u, permissions: { ...u.permissions, [key]: value } } : u,
    );
    persist();
  }

  function setRegistrationStatus(id: string, status: Registration["status"]) {
    registrations.value = registrations.value.map((r) => (r.id === id ? { ...r, status } : r));
    persist();
  }

  function assignJudges(registrationId: string, judgeIds: string[]): Result<true> {
    const reg = registrations.value.find((r) => r.id === registrationId);
    if (!reg) return { ok: false, error: "项目不存在" };
    if ((reg.materialsAudit ?? "pending") !== "passed") {
      return { ok: false, error: "仅审核通过的项目可分配评委" };
    }
    const uniqueIds = [...new Set(judgeIds.filter((id) => users.value.some((u) => u.id === id && u.role === "judge")))];
    const prev = submissions.value.find((s) => s.registrationId === registrationId)?.assignedJudgeIds ?? [];
    const exists = submissions.value.some((s) => s.registrationId === registrationId);
    if (exists) {
      submissions.value = submissions.value.map((s) =>
        s.registrationId === registrationId ? { ...s, assignedJudgeIds: uniqueIds } : s,
      );
    } else {
      submissions.value = [
        {
          id: uid("s"),
          registrationId,
          title: reg.projectName,
          team: reg.organizationName,
          track: reg.direction,
          summary: reg.projectContent.slice(0, 120),
          fileName: reg.workPackageName || "未提交",
          fileUrl: "",
          fileSize: "",
          submittedAt: new Date().toISOString(),
          assignedJudgeIds: uniqueIds,
        },
        ...submissions.value,
      ];
    }
    const added = uniqueIds.filter((id) => !prev.includes(id));
    added.forEach((jid) => {
      pushNotification({
        userId: jid,
        title: "新的评审任务",
        body: `组委会已向您分配作品「${reg.projectName}」，请在评审工作台完成评分。`,
        type: "review",
      });
    });
    persist();
    return { ok: true, data: true };
  }

  /** 按评委设置其负责的项目列表；与按项目分配共用 assignedJudgeIds，双向同步 */
  function setProjectsForJudge(judgeId: string, registrationIds: string[]): Result<true> {
    const judge = users.value.find((u) => u.id === judgeId && u.role === "judge");
    if (!judge) return { ok: false, error: "评委不存在" };
    const want = [...new Set(registrationIds)];
    for (const rid of want) {
      const reg = registrations.value.find((r) => r.id === rid);
      if (!reg) return { ok: false, error: "项目不存在" };
      if ((reg.materialsAudit ?? "pending") !== "passed") {
        return { ok: false, error: `「${reg.projectName}」未审核通过，不能分配` };
      }
    }
    const wantSet = new Set(want);
    const prevAssigned = new Set(
      submissions.value.filter((s) => s.assignedJudgeIds.includes(judgeId)).map((s) => s.registrationId),
    );

    // 更新已有 submission：加入或移出该评委
    submissions.value = submissions.value.map((s) => {
      const has = s.assignedJudgeIds.includes(judgeId);
      const should = wantSet.has(s.registrationId);
      if (has === should) return s;
      const assignedJudgeIds = should
        ? [...s.assignedJudgeIds, judgeId]
        : s.assignedJudgeIds.filter((id) => id !== judgeId);
      return { ...s, assignedJudgeIds };
    });

    // 目标项目尚无 submission 时创建
    for (const rid of want) {
      if (submissions.value.some((s) => s.registrationId === rid)) continue;
      const reg = registrations.value.find((r) => r.id === rid)!;
      submissions.value = [
        {
          id: uid("s"),
          registrationId: rid,
          title: reg.projectName,
          team: reg.organizationName,
          track: reg.direction,
          summary: reg.projectContent.slice(0, 120),
          fileName: reg.workPackageName || "未提交",
          fileUrl: "",
          fileSize: "",
          submittedAt: new Date().toISOString(),
          assignedJudgeIds: [judgeId],
        },
        ...submissions.value,
      ];
    }

    const newly = want.filter((rid) => !prevAssigned.has(rid));
    if (newly.length) {
      pushNotification({
        userId: judgeId,
        title: "新的评审任务",
        body: `组委会已向您分配 ${newly.length} 件作品，请在评审工作台完成评分。`,
        type: "review",
      });
    }
    persist();
    return { ok: true, data: true };
  }

  function upsertReview(
    input: Omit<Review, "id" | "submittedAt" | "updatedAt" | "status"> & { status: Review["status"] },
  ): Result<Review> {
    const me = currentUser.value;
    if (!me || me.role !== "judge") return { ok: false, error: "仅评审可以评分" };
    const now = new Date().toISOString();
    const prev = reviews.value.find((r) => r.submissionId === input.submissionId && r.judgeId === input.judgeId);
    const review: Review = {
      ...input,
      id: prev?.id ?? uid("rv"),
      submittedAt: input.status === "submitted" ? now : (prev?.submittedAt ?? now),
      updatedAt: now,
    };
    reviews.value = [
      ...reviews.value.filter((r) => !(r.submissionId === input.submissionId && r.judgeId === input.judgeId)),
      review,
    ];
    const sub = submissions.value.find((s) => s.id === input.submissionId);
    if (sub) {
      const list = reviews.value.filter((r) => r.submissionId === input.submissionId && r.status === "submitted");
      const avg = list.length ? Math.round(list.reduce((acc, r) => acc + r.total, 0) / list.length) : undefined;
      registrations.value = registrations.value.map((r) =>
        r.id === sub.registrationId ? { ...r, reviewScore: avg } : r,
      );
    }
    persist();
    return { ok: true, data: review };
  }

  function saveReviewDraft(input: Omit<Review, "id" | "submittedAt" | "updatedAt" | "status">): Result<Review> {
    return upsertReview({ ...input, status: "draft" });
  }

  function submitReview(input: Omit<Review, "id" | "submittedAt" | "updatedAt" | "status">): Result<Review> {
    return upsertReview({ ...input, status: "submitted" });
  }

  function markNotificationRead(id: string) {
    notifications.value = notifications.value.map((n) => (n.id === id ? { ...n, read: true } : n));
    persist();
  }

  function markAllNotificationsRead() {
    notifications.value = notifications.value.map((n) =>
      n.userId === "all" || n.userId === currentUserId.value ? { ...n, read: true } : n,
    );
    persist();
  }

  function submitMessage(input: {
    content: string;
    contact: string;
    attachmentName?: string;
    attachmentUrl?: string;
    attachments?: { name: string; url: string }[];
  }): Result<SiteMessage> {
    const text = input.content.trim();
    if (text.length < 8) return { ok: false, error: "请至少用 8 个字说明遇到的问题" };
    const attachments = (input.attachments ?? []).filter((a) => a.url).slice(0, 4);
    if (!attachments.length && input.attachmentUrl) {
      attachments.push({
        name: (input.attachmentName ?? "").trim() || "截图",
        url: input.attachmentUrl,
      });
    }
    const first = attachments[0];
    const me = currentUser.value;
    const message: SiteMessage = {
      id: uid("m"),
      content: text,
      contact: input.contact.trim(),
      attachmentName: first?.name ?? (input.attachmentName ?? "").trim(),
      attachmentUrl: first?.url ?? input.attachmentUrl,
      attachments,
      userId: me?.id ?? null,
      username: me?.username ?? "未登录访客",
      account: me?.phone ?? input.contact.trim(),
      status: "processing",
      createdAt: new Date().toISOString(),
    };
    messages.value = [message, ...messages.value];
    persist();
    return { ok: true, data: message };
  }

  function setFeedbackStatus(id: string, status: FeedbackStatus) {
    messages.value = messages.value.map((m) => (m.id === id ? { ...m, status } : m));
    persist();
  }

  function auditRegistration(id: string, result: Exclude<AuditResult, "pending">, note: string) {
    const reg = registrations.value.find((r) => r.id === id);
    if (!reg) return;
    const registrationAuditNote = result === "need_revision" ? note.trim() : "";
    const status: Registration["status"] =
      result === "need_revision" ? "need_revision" : reg.workPackageName ? (reg.status === "need_revision" ? "work_submitted" : reg.status) : "registered";
    registrations.value = registrations.value.map((r) =>
      r.id === id ? { ...r, registrationAudit: result, registrationAuditNote, status } : r,
    );
    if (result === "need_revision") {
      notifyUser(
        reg.userId,
        "报名信息需修改",
        `您的项目「${reg.projectName}」报名信息审核未通过。${registrationAuditNote || "请登录个人中心查看修改意见。"}`,
      );
    } else {
      notifyUser(reg.userId, "报名信息已通过审核", `您的项目「${reg.projectName}」报名信息符合要求。`);
    }
    persist();
  }

  function auditMaterials(id: string, result: Exclude<AuditResult, "pending">, note: string) {
    const reg = registrations.value.find((r) => r.id === id);
    if (!reg) return;
    const materialsAuditNote = result === "need_revision" ? note.trim() : "";
    const status: Registration["status"] = result === "need_revision" ? "need_revision" : "materials_review";
    registrations.value = registrations.value.map((r) =>
      r.id === id ? { ...r, materialsAudit: result, materialsAuditNote, status } : r,
    );
    if (result === "need_revision") {
      submissions.value = submissions.value.map((s) =>
        s.registrationId === id ? { ...s, assignedJudgeIds: [] } : s,
      );
      notifyUser(
        reg.userId,
        "参赛材料需修改",
        `您的项目「${reg.projectName}」参赛材料审核未通过。${materialsAuditNote || "请登录个人中心查看修改意见并重新上传。"}`,
      );
    } else {
      notifyUser(reg.userId, "参赛材料已通过审核", `您的项目「${reg.projectName}」参赛材料符合要求，将进入评分分配。`);
    }
    persist();
  }

  function batchAssignJudges(submissionIds: string[], judgeIds: string[]) {
    const allowed = new Set(
      submissions.value
        .filter((s) => {
          if (!submissionIds.includes(s.id)) return false;
          const reg = registrations.value.find((r) => r.id === s.registrationId);
          return (reg?.materialsAudit ?? "pending") === "passed";
        })
        .map((s) => s.id),
    );
    submissions.value = submissions.value.map((s) =>
      allowed.has(s.id) ? { ...s, assignedJudgeIds: judgeIds } : s,
    );
    persist();
    if (judgeIds.length && allowed.size) {
      judgeIds.forEach((jid) => {
        pushNotification({
          userId: jid,
          title: "新的评审任务",
          body: `组委会已向您分配 ${allowed.size} 件作品，请在评审工作台完成评分。`,
          type: "review",
        });
      });
    }
  }

  function upsertAccount(input: {
    id?: string;
    username: string;
    phone: string;
    password: string;
    role: Role;
    email?: string;
    organization?: string;
    title?: string;
    status?: User["status"];
  }): Result<User> {
    const username = input.username.trim();
    const phone = input.phone.trim();
    if (!username) return { ok: false, error: "请填写用户名" };
    if (!PHONE_RE.test(phone)) return { ok: false, error: "请输入正确的手机号" };
    if (users.value.some((u) => u.phone === phone && u.id !== input.id)) {
      return { ok: false, error: "该手机号已被占用" };
    }
    if (users.value.some((u) => u.username === username && u.id !== input.id)) {
      return { ok: false, error: "用户名已被占用" };
    }
    if ((!input.id || input.password) && !PASSWORD_RULES.valid(input.password)) {
      return { ok: false, error: "密码需 8–20 位、至少含 1 个大写字母，且不能有三连重复字符或键盘连续三键" };
    }
    if (input.id) {
      const prev = users.value.find((u) => u.id === input.id);
      if (!prev) return { ok: false, error: "账号不存在" };
      const next: User = {
        ...prev,
        username,
        phone,
        password: input.password ? input.password : prev.password,
        role: input.role,
        email: input.email,
        organization: input.organization,
        title: input.title,
        status: input.status ?? prev.status,
        permissions: permsFor(input.role),
      };
      users.value = users.value.map((u) => (u.id === input.id ? next : u));
      persist();
      return { ok: true, data: next };
    }
    const user: User = {
      id: uid("u"),
      username,
      phone,
      password: input.password,
      role: input.role,
      status: input.status ?? "active",
      email: input.email,
      organization: input.organization,
      title: input.title,
      createdAt: new Date().toISOString(),
      permissions: permsFor(input.role),
    };
    users.value = [user, ...users.value];
    persist();
    return { ok: true, data: user };
  }

  function publishNotice(input: { id?: string; title: string; body: string; target: NoticeTarget }): Result<SiteNotice> {
    const title = input.title.trim();
    const body = input.body.trim();
    const titleText = stripHtml(title);
    const bodyText = stripHtml(body);
    if (!titleText) return { ok: false, error: "请填写站内信标题" };
    if (bodyText.length < 8) return { ok: false, error: "正文至少 8 个字" };
    const now = new Date().toISOString();
    let notice: SiteNotice;
    if (input.id) {
      const prev = notices.value.find((n) => n.id === input.id);
      if (!prev) return { ok: false, error: "站内信不存在" };
      notice = { ...prev, title, body, target: input.target, updatedAt: now };
      notices.value = notices.value.map((n) => (n.id === input.id ? notice : n));
      notifications.value = notifications.value.filter((n) => n.noticeId !== notice.id);
    } else {
      notice = {
        id: uid("nt"),
        title,
        body,
        target: input.target,
        publishedAt: now,
        updatedAt: now,
        authorId: currentUser.value?.id ?? "u_admin",
      };
      notices.value = [notice, ...notices.value];
    }
    const targets = users.value.filter((u) => {
      if (input.target === "all") return true;
      return u.role === input.target;
    });
    const stamp = now;
    notifications.value = [
      ...targets.map((u) => ({
        id: uid("n"),
        userId: u.id,
        title,
        body,
        createdAt: stamp,
        read: false,
        type: "system" as const,
        noticeId: notice.id,
      })),
      ...notifications.value,
    ];
    persist();
    return { ok: true, data: notice };
  }

  function deleteNotice(id: string) {
    notices.value = notices.value.filter((n) => n.id !== id);
    persist();
  }

  function submitDemand(input: Omit<DemandSubmission, "id" | "createdAt" | "status" | "userId" | "auditNote">): Result<DemandSubmission> {
    const me = currentUser.value;
    if (!me) return { ok: false, error: "请先登录后再提交需求" };
    const title = input.title.trim();
    const content = input.content.trim();
    const expected = input.expected.trim();
    if (!input.organizationName.trim()) return { ok: false, error: "请填写单位全称" };
    if (!input.organizationAddress.trim()) return { ok: false, error: "请填写单位地址" };
    if (!input.contactName.trim()) return { ok: false, error: "请填写姓名" };
    if (!input.contactTitle.trim()) return { ok: false, error: "请填写职务" };
    if (!PHONE_RE.test(input.contactPhone)) return { ok: false, error: "请输入正确的 11 位手机号" };
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.contactEmail.trim())) return { ok: false, error: "请填写有效邮箱" };
    if (!title) return { ok: false, error: "请填写需求标题" };
    if (!input.direction) return { ok: false, error: "请选择需求方向" };
    if (input.direction === "其他" && !input.otherDirection.trim()) return { ok: false, error: "请填写其他方向说明" };
    if (content.length < 12) return { ok: false, error: "请至少用 12 个字描述具体需求" };
    if (content.length > 500) return { ok: false, error: "具体需求内容建议不超过 500 字" };
    if (expected.length < 8) return { ok: false, error: "请填写预期指标、效果" };
    const demand: DemandSubmission = {
      ...input,
      organizationName: input.organizationName.trim(),
      organizationDetail: input.organizationDetail.trim(),
      organizationAddress: input.organizationAddress.trim(),
      contactName: input.contactName.trim(),
      contactTitle: input.contactTitle.trim(),
      contactPhone: input.contactPhone.trim(),
      contactEmail: input.contactEmail.trim(),
      title,
      otherDirection: input.direction === "其他" ? input.otherDirection.trim() : "",
      content,
      expected,
      id: uid("d"),
      userId: me.id,
      createdAt: new Date().toISOString(),
      status: "pending",
    };
    demands.value = [demand, ...demands.value];
    persist();
    notifyUser(
      me.id,
      "需求征集已提交",
      `您提交的场景「${title}」已进入组委会评估。评估通过后，可能纳入中试基地攻关或作为下届赛题发布。`,
      "contest",
    );
    return { ok: true, data: demand };
  }

  function auditDemand(id: string, status: DemandStatus, note = "") {
    const prev = demands.value.find((d) => d.id === id);
    if (!prev) return;
    demands.value = demands.value.map((d) => (d.id === id ? { ...d, status, auditNote: note.trim() } : d));
    persist();
    const label = DEMAND_STATUS_LABEL[status];
    notifyUser(
      prev.userId,
      `需求征集${label}`,
      status === "need_revision"
        ? `您提交的场景「${prev.title}」需要补充：${note.trim() || "请完善场景描述后重新沟通组委会。"}`
        : status === "accepted"
          ? `您提交的场景「${prev.title}」已纳入评估结果，组委会将视情况作为攻关课题或下届赛题。`
          : `您提交的场景「${prev.title}」状态已更新为「${label}」。`,
      "contest",
    );
  }

  function resetDemoData() {
    applyState(initialState());
    persist();
  }

  return {
    hydrated,
    users,
    registrations,
    submissions,
    reviews,
    notifications,
    messages,
    notices,
    smsLogs,
    demands,
    currentUserId,
    contestStage,
    currentUser,
    hydrate,
    loginWithSms,
    loginWithPassword,
    register,
    verifyResetIdentity,
    resetPassword,
    logout,
    updateProfile,
    submitRegistration,
    uploadStampedForm,
    submitWorkPackage,
    setContestStage,
    updateRegistration,
    setUserRole,
    setUserStatus,
    setUserPermission,
    setRegistrationStatus,
    assignJudges,
    setProjectsForJudge,
    batchAssignJudges,
    saveReviewDraft,
    submitReview,
    markNotificationRead,
    markAllNotificationsRead,
    submitMessage,
    setFeedbackStatus,
    auditRegistration,
    auditMaterials,
    upsertAccount,
    publishNotice,
    deleteNotice,
    submitDemand,
    auditDemand,
    resetDemoData,
  };
});
