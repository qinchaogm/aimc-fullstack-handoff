export type Role = "user" | "judge" | "admin";

export type UserStatus = "active" | "disabled";

export interface User {
  id: string;
  phone: string;
  username: string;
  /** Prototype only: stored in plain text in localStorage. */
  password: string;
  role: Role;
  status: UserStatus;
  email?: string;
  organization?: string;
  title?: string;
  createdAt: string;
  permissions: {
    canApply: boolean;
    canSubmitWork: boolean;
    canReview: boolean;
  };
}

export type ContestStage =
  | "registration"
  | "work"
  | "materials_review"
  | "online_review"
  | "finals"
  | "awarded";

export type RegistrationStatus =
  | "registered"
  | "work_submitted"
  | "materials_review"
  | "need_revision"
  | "online_review"
  | "finals"
  | "awarded"
  | "rejected";

/** 管理端对报名 / 参赛材料的审核结论。 */
export type AuditResult = "pending" | "passed" | "need_revision";

export type FeedbackStatus = "processing" | "ignored" | "processed";

export type NoticeTarget = "all" | "user" | "judge";

/** Optional teammate row on the registration form (0–10 allowed). */
export interface TeamMember {
  name: string;
  age: string;
  gender: string;
  phone: string;
  email: string;
}

/**
 * Registration payload mirrors the official paper form:
 * project / organization / direction / content / optional members / contacts.
 */
export interface Registration {
  id: string;
  userId: string;
  createdAt: string;
  status: RegistrationStatus;
  /** 报名日期 */
  registrationDate: string;
  /** 项目名称 */
  projectName: string;
  /** 单位全称 */
  organizationName: string;
  /** 项目负责人 */
  leaderName: string;
  /** 负责人职务 */
  leaderTitle: string;
  /** 单位所在市 */
  organizationCity: string;
  /** 单位所在区 */
  organizationDistrict: string;
  /** 街道门牌等详细地址 */
  organizationDetail: string;
  /** 单位地址（市+区+详细地址，用于报名表） */
  organizationAddress: string;
  /** 参赛方向（单选） */
  direction: string;
  /** 项目内容：意义目标、主要内容、预期成果、推广价值 */
  projectContent: string;
  /** 参赛小组成员，非必填，0–10 人 */
  members: TeamMember[];
  /** 单位联系人 */
  contactName: string;
  /** 联系人电话 */
  contactPhone: string;
  /** 提交作品阶段上传的盖章报名表文件名 */
  stampedFormName?: string;
  /** 提交作品压缩包文件名 */
  workPackageName?: string;
  /** 阶段 1：报名信息审核 */
  registrationAudit?: AuditResult;
  registrationAuditNote?: string;
  /** 阶段 2：参赛材料审核 */
  materialsAudit?: AuditResult;
  materialsAuditNote?: string;
  /** 线上函评总分 */
  reviewScore?: number;
  /** 是否进入线下决赛 */
  enteredFinals?: boolean;
  /** 终赛获奖等级 */
  awardLevel?: string;
}

export interface Submission {
  id: string;
  registrationId: string;
  title: string;
  team: string;
  track: string;
  summary: string;
  fileName: string;
  fileUrl: string;
  fileSize: string;
  submittedAt: string;
  assignedJudgeIds: string[];
}

export interface ScoreDimension {
  key: string;
  label: string;
  weight: number;
  description: string;
  /** 点击维度旁说明圆点后展示的打分规则 */
  rules: string;
}

export type ReviewStatus = "draft" | "submitted";

export interface Review {
  id: string;
  submissionId: string;
  judgeId: string;
  scores: Record<string, number>;
  total: number;
  comment: string;
  status: ReviewStatus;
  submittedAt: string;
  updatedAt?: string;
}

export interface Notification {
  id: string;
  userId: string | "all";
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  type: "system" | "contest" | "review";
  noticeId?: string;
}

export interface SiteAttachment {
  name: string;
  url: string;
}

/** Visitor / contestant note left from the site-wide 留言 dock. */
export interface SiteMessage {
  id: string;
  content: string;
  contact: string;
  attachmentName: string;
  attachmentUrl?: string;
  attachments?: SiteAttachment[];
  userId: string | null;
  username: string;
  account: string;
  status: FeedbackStatus;
  createdAt: string;
}

/** 管理端编辑并发布的站内信。 */
export interface SiteNotice {
  id: string;
  title: string;
  body: string;
  target: NoticeTarget;
  publishedAt: string;
  updatedAt: string;
  authorId: string;
}

export type DemandStatus = "pending" | "accepted" | "need_revision";

/** 附件 3：高价值场景需求征集表。 */
export interface DemandSubmission {
  id: string;
  userId: string;
  createdAt: string;
  organizationName: string;
  organizationCity: string;
  organizationDistrict: string;
  organizationDetail: string;
  organizationAddress: string;
  contactName: string;
  contactTitle: string;
  contactPhone: string;
  contactEmail: string;
  title: string;
  direction: string;
  otherDirection: string;
  content: string;
  expected: string;
  status: DemandStatus;
  auditNote?: string;
}

/** 原型环境模拟发出的短信记录，会同步到用户站内信。 */
export interface SmsLog {
  id: string;
  userId: string;
  phone: string;
  title: string;
  body: string;
  createdAt: string;
}
