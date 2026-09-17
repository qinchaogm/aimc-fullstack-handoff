import type { ScoreDimension } from "./types";
import { CITY_DISTRICT_OPTIONS, PROVINCE_CITY_OPTIONS } from "./region-data";

export function uniqueOrganizations(names: Array<string | undefined | null>) {
  return [...new Set(names.map((n) => (n ?? "").trim()).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b, "zh-CN"),
  );
}

/** 评分结果等场景：单位只区分上海电气集团 / 非上海电气集团 */
export const ORG_GROUP = {
  electric: "上海电气集团",
  external: "非上海电气集团",
} as const;

export type OrgGroup = (typeof ORG_GROUP)[keyof typeof ORG_GROUP];

export function isShanghaiElectricOrg(name: string | undefined | null) {
  return (name ?? "").includes("上海电气");
}

export function orgGroupOf(name: string | undefined | null): OrgGroup {
  return isShanghaiElectricOrg(name) ? ORG_GROUP.electric : ORG_GROUP.external;
}

export const CONTEST = {
  name: "AI原生智能工厂创新应用大赛",
  shortName: "AI原生工厂",
  year: "2026",
  slogan: "真场景、真命题、真应用",
  subSlogan:
    "面向全国征集可落地的工业 AI 方案，突出真场景、真命题、真应用。链主引领、专家与工匠联合评审，优秀作品有机会走进产线验证并签订合作协议。",
  contactEmail: "zhangqzh2@shanghai-electric.com",
  supportEmail: "zhangqzh2@shanghai-electric.com",
  registrationDeadline: "2026-10-16",
  workDeadline: "2026-10-30",
  contactName: "张绮洲",
  contactPhone: "63893956",
  contactNameAlt: "王士玲",
  contactPhoneAlt: "63893925",
  organizers: {
    guide: ["上海市经济与信息化委员会"],
    hosts: [
      "上海电气集团股份有限公司",
      "国家人工智能应用中试基地 制造领域",
      "上海市机电工会",
    ],
    organizers: [
      "上海电气自动化集团有限公司",
      "上海电气李斌技师学院",
      "上海智能制造工匠学院",
    ],
    coOrganizers: ["中试基地合作企业"],
  },
};

/** Footer marquee groups: one role, one or more names — never combined. */
export const ORGANIZER_GROUPS = [
  { role: "指导单位", names: CONTEST.organizers.guide },
  { role: "主办单位", names: CONTEST.organizers.hosts },
  { role: "承办单位", names: CONTEST.organizers.organizers },
  { role: "协办单位", names: CONTEST.organizers.coOrganizers },
] as const;

export const INTRO = {
  lead: "欢迎参加上海电气 AI 原生智能工厂创新应用大赛。大赛突出「真场景、真命题、真应用」，面向全国制造业企业、人工智能企业、研发机构、高校及科研院所开放申报。",
  body: "发挥工赋链主引领，鼓励「场景方 + 服务商」共建参赛；线下评审由行业专家与一线工匠联合把关；依托国家人工智能应用中试基地，对优质项目开展战略合作对接。",
  close: "这是一场以用为导向的实践邀请，期待你来一起创造。",
};

/** Official notice copy for the contest-details page (赛事通知). */
export const NOTICE = {
  title: "关于开展 2026 年上海电气「AI 原生智能工厂创新应用大赛」的通知",
  lead:
    "人工智能正从数字世界走向物理世界。为深入贯彻关于人工智能发展的要求，落实上海市委「全力当好工业智能化转型的先行探路者、集成服务商」部署，在工信部「人工智能+制造」专项行动与上海市「AI+制造」实施方案指导下，依托国家人工智能应用中试基地（制造领域），以高端装备制造真实业务需求为牵引，以 AI 原生智能工厂为目标，举办本届大赛。",
  purpose:
    "搭建 AI 技术创新与行业场景应用的桥梁，开展关键技术攻关，孵化高潜力且可落地成果；同时发挥「李斌杯」职工技能大赛平台作用，挖掘优秀工业 AI 人才。",
  sloganNote: "本次大赛突出「真场景、真命题、真应用」，创新设置机制，打破传统赛事「重方案、轻落地」的局限。",
  mechanisms: [
    {
      title: "链主引领、场景共建",
      body: "发挥上海电气作为「工赋链主」企业的引领带动作用，建议采用「场景方 + 服务商」共建参赛模式，联合攻关、协同验证，解决工业场景的实际痛点。",
    },
    {
      title: "专家 + 工匠联合评审",
      body: "线下评审邀请行业专家与一线工匠技师共同组成评审团队，既评技术难度与创新性，也看真实使用反馈与落地成效，对作品进行以用为导向的评价。",
    },
    {
      title: "产融协同、以验促投",
      body: "依托国家人工智能应用中试基地和上海电气工业经验，遴选经过真实工业场景验证的技术产品，对优质项目开展战略合作对接，实现以赛代选、以验促投、以投促产。",
    },
  ],
  topicModes: [
    {
      title: "揭榜选题",
      body: "由制造业企业及科研机构提供待解决的场景作为赛题备选，组委会评估筛选后按赛事方向归类发布。选择揭榜题目的作品相较自选题目有一定附加分数。",
    },
    {
      title: "自选题目",
      body: "参赛团队根据实际工作场景自行选题，并确定参赛方向。每个作品可任选一种选题模式报名。",
    },
  ],
  eligibility: {
    lead: "大赛面向全国制造业企业、人工智能企业、研发机构、行业协会组织、行业咨询服务机构、高校及科研院所等各类主体开放申报，组建团队参赛。",
    rules: [
      "团队人数不超过 10 人，可跨公司组队。",
      "鼓励参赛团队与提供真实场景的单位联合申报。",
      "每个作品可任选 1 个参赛方向，可提交软 / 硬件作品。",
      "每个作品可任选揭榜选题或自选题目 1 种模式报名。",
    ],
  },
  others: [
    {
      title: "团队组建",
      body: "参赛团队需明确 1 名负责人，负责报名、材料提交、赛事沟通等相关事宜。证书排名以报名表为依据，第一作者为项目组负责人。",
    },
    {
      title: "作品要求",
      body: "参赛团队需拥有作品的完整知识产权，严禁抄袭、盗用他人作品或违规使用第三方技术，一经发现取消参赛资格，并追回已获奖励及荣誉。提交内容包括但不限于演示视频、作品介绍 PPT、技术文档、设计方案、可供验证的材料等。报名表需由所属企业认证盖章后，在提交作品阶段同步上传。",
    },
    {
      title: "评审标准",
      body: "评审专家组从实用性、创新性、技术性、作品完整性、风险程度等多个维度综合评审。完整性过低或高风险作品将失去评选资格。线下终评阶段可直接试用的作品将获得附加分数。必要时将调整部分参赛队伍所参加的方向。",
    },
    {
      title: "需求征集",
      body: "本次赛事长期开放高价值场景需求征集通道，向行业从业者征集 AI+制造方向的高价值场景。经评估后，将纳入国家人工智能应用中试基地应用场景攻关，或作为下一届赛事的赛题发布。",
    },
    {
      title: "奖项说明",
      body: "将根据参赛作品的数量规模和质量水平，按照科学合理的比例确定奖项名额。优秀作品有机会与企业签订框架协议，进一步优化产品、共同落地。大赛另设优秀组织单位奖，由组委会根据各企业实际参赛作品数及获奖成绩综合评定。",
    },
  ],
};

export const DEMAND = NOTICE.others.find((item) => item.title === "需求征集")!;

export const OTHER_ITEMS = NOTICE.others.filter((item) => item.title !== "需求征集");

export const CONTEST_NAV = [
  { id: "intro", label: "赛事介绍" },
  { id: "tracks", label: "参赛方向" },
  { id: "eligibility", label: "参赛对象" },
  { id: "schedule", label: "赛程安排" },
  { id: "awards", label: "奖项设置" },
  { id: "others", label: "其他事项" },
  { id: "demand", label: "需求征集" },
  { id: "contact", label: "联系我们" },
] as const;

export interface TrackExample {
  title: string;
  scene: string;
  goal: string;
}

/** Official entry directions from the registration form (参赛方向). */
export const TRACKS = [
  {
    key: "rd-design",
    title: "AI+研发设计",
    desc: "聚焦产品研发、工程设计、工艺设计，推动 AI 辅助方案设计、知识检索、设计优化与研发协同。",
    overview:
      "本方向面向产品研发、工程设计与工艺设计场景。鼓励用大模型、知识图谱、生成式设计与仿真优化，缩短方案迭代周期，把专家经验沉淀为可复用的设计能力。适合已有图纸、BOM、工艺文件或研发知识库，希望把「查资料、出方案、做校核」做成智能助手或闭环工具的团队。",
    tags: ["方案设计", "知识检索", "研发协同"],
    icon: "brain",
    examples: [
      {
        title: "汽轮机叶片多目标生成式设计助手",
        scene: "某能源装备企业叶片设计依赖资深工程师反复试算，改型周期长，且难以同时兼顾气动效率、强度与可加工性。",
        goal: "基于历史设计库与约束条件生成候选叶型，输出可量化的效率 / 应力对比，将单轮改型周期从数周压缩到数天。",
      },
      {
        title: "工艺知识库问答与图纸检索",
        scene: "工艺部门图纸、规程、故障案例分散在网盘与纸质档案，新人查询耗时长，同类问题重复发生。",
        goal: "建设可溯源的工艺问答与图纸检索系统，按零件号 / 工序召回规范与案例，回答需标注出处。",
      },
    ],
  },
  {
    key: "manufacturing",
    title: "AI+生产制造",
    desc: "聚焦生产计划、工艺执行、质量控制与现场调度，推动 AI 提升效率、质量与柔性。",
    overview:
      "本方向面向生产计划、工艺执行、质量检测与现场调度。鼓励把视觉检测、工艺参数寻优、混线排产、物料齐套等做成可上线的能力，强调真实产线数据、可试用原型和可量化的效率 / 质量指标。",
    tags: ["生产计划", "质量控制", "现场调度"],
    icon: "factory",
    examples: [
      {
        title: "焊接产线视觉检测与工艺闭环",
        scene: "压力容器环缝焊接依赖人工目检，漏检与过检并存，缺陷发现滞后导致返工成本高。",
        goal: "部署焊缝视觉检测，实时识别气孔、未熔合等缺陷，并把结果回写到工艺参数建议，漏检率与返工工时可量化下降。",
      },
      {
        title: "离散车间混线排产智能调度",
        scene: "多品种小批量订单插单频繁，计划员凭经验排程，设备等待与齐套延误突出。",
        goal: "根据订单、工艺路线与设备状态生成可执行排程，给出插单影响评估，提升准时交付率与设备利用率。",
      },
    ],
  },
  {
    key: "om",
    title: "AI+运行维护",
    desc: "聚焦设备运行、状态监测、故障诊断与预测性维护，推动运维由事后维修转向主动预测。",
    overview:
      "本方向面向设备运行、状态监测、故障诊断与预测性维护。鼓励融合振动、温度、电流与检修记录，把「事后抢修」转为「提前预警 + 知识辅助决策」，并能够在真实机组或产线上演示。",
    tags: ["状态监测", "故障诊断", "预测维护"],
    icon: "gauge",
    examples: [
      {
        title: "大型压缩机预测性维护",
        scene: "空压 / 工艺气压缩机突发停机影响整线，现有阈值报警误报多，检修窗口难安排。",
        goal: "基于多源时序给出剩余寿命或故障概率，提前 72 小时预警典型故障，误报可控并附维修建议。",
      },
      {
        title: "现场运维知识助手",
        scene: "一线运维人员流动性高，故障处理依赖老师傅口口相传，夜间值班难以及时定位原因。",
        goal: "结合设备手册、历史工单与传感器摘要，生成可执行的排查步骤，并记录处置结果用于持续学习。",
      },
    ],
  },
  {
    key: "management",
    title: "AI+经营管理",
    desc: "聚焦企业经营、供应链、项目管理、财务、人力与行政，推动 AI 融入经营管理。",
    overview:
      "本方向面向经营决策、供应链、项目管理、财务与人力等管理场景。鼓励用智能分析、风险预警和流程助手提升决策质量与协同效率，要求业务口径清晰、指标可核验，避免做成无法落地的「驾驶舱展示」。",
    tags: ["经营决策", "供应链", "项目管理"],
    icon: "network",
    examples: [
      {
        title: "关键物料交期与供应风险预警",
        scene: "核电 / 风电项目长周期物料齐套困难，供应商延误发现滞后，影响节点考核。",
        goal: "融合订单、库存与物流信息，提前识别高风险物料并给出替代或催交策略，降低因缺料导致的节点延误。",
      },
      {
        title: "项目成本智能核算助手",
        scene: "总包项目成本归集靠月末手工汇总，变更签证难以及时反映到边际贡献。",
        goal: "自动归集合同、变更与工时物料，按项目输出成本偏差与预警，支持周度经营例会决策。",
      },
    ],
  },
  {
    key: "native-factory",
    title: "AI 原生智能工厂建设方案",
    desc: "形成工厂总体建设方案，以人工智能为第一生产要素，推动数据、模型、智能体与具身机器人协同。",
    overview:
      "本方向要求形成工厂级总体方案：以人工智能为第一生产要素，打通数据、模型、智能体与具身执行，而不是单点工具堆砌。评审看总体架构、闭环路径、安全合规，以及是否具备在中试基地或真实车间验证的条件。",
    tags: ["总体方案", "智能体", "闭环执行"],
    icon: "bot",
    examples: [
      {
        title: "离散装配线多智能体协同方案",
        scene: "装配车间计划、物流、质检、设备分属不同系统，异常靠对讲机协调，难以形成闭环。",
        goal: "给出「感知—决策—执行」总体架构，让计划智能体、物流智能体与质检智能体协同，异常可在 15 分钟内闭环。",
      },
      {
        title: "具身机器人+产线闭环执行示范",
        scene: "柔性产线换型频繁，上下料与巡检仍以人工为主，夜班人力不足。",
        goal: "提出机器人、视觉与产线控制系统的集成方案，完成至少一类工序的自动执行，并给出安全与节拍指标。",
      },
    ],
  },
];

export const DEMAND_DIRECTIONS = [...TRACKS.map((t) => t.title), "其他"];

export function trackByKey(key: string) {
  return TRACKS.find((t) => t.key === key);
}

export const SCHEDULE = [
  {
    phase: "报名阶段",
    time: "10.12 10:00 — 10.16 18:00",
    desc: "开放报名通道，各队完成线上报名。",
    detail:
      "赛事通知发布即赛事启动。10 月 12 日 10:00 至 10 月 16 日 18:00 开放报名通道，请各参赛队伍通过本网站完成线上报名。每位参赛者仅可申报一个项目。",
    status: "current" as const,
  },
  {
    phase: "提交作品",
    time: "10.30 18:00 前",
    desc: "提交演示视频、PPT、技术文档等，报名表需单位盖章。",
    detail:
      "请于 10 月 30 日 18:00 前在本网站提交作品。压缩包命名方式为「赛道方向_项目名称_负责人」。提交内容包括但不限于演示视频、作品介绍 PPT、技术文档、设计方案、可供验证的材料等。报名表需由所属企业认证盖章后同步上传。",
    status: "upcoming" as const,
  },
  {
    phase: "作品初审",
    time: "10.31 — 11.03",
    desc: "第三方评估完整性与风险，公示通过名单。",
    detail:
      "将邀请第三方检测机构对作品的完整性和风险程度进行评估。完整性过低或高风险作品将失去评选资格。评估结果同时作为线上函评阶段的评审标准之一。初审结束后公示通过名单。",
    status: "upcoming" as const,
  },
  {
    phase: "电气内部评审",
    time: "11.04 — 11.06",
    desc: "李斌杯分赛场评审，优秀作品推荐入围全国函评。",
    detail:
      "上海电气内部专场作为第 23 届上海电气「李斌杯」职工技能大赛分赛场，对集团内部企业提交的作品进行评审并确定奖项，同时将优秀作品推荐入围面向全国的线上函评。",
    status: "upcoming" as const,
  },
  {
    phase: "线上函评",
    time: "11.09 — 11.13",
    desc: "专家线上打分并反馈，遴选进入终评的作品。",
    detail:
      "邀请专家对作品进行线上函评打分，并将评分和意见反馈给参赛队伍。根据函评分数遴选部分作品进入终评。进入终评的队伍可根据意见反馈优化作品后重新提交，但不可脱离已选定的项目场景和项目目标。",
    status: "upcoming" as const,
  },
  {
    phase: "线下终评",
    time: "11 月中下旬",
    desc: "路演答辩，专家组评选出获奖队伍。",
    detail:
      "邀请专家组建评审小组，开展线下终评。各参赛队伍进行路演和答辩，由专家组评选出获奖队伍。具体时间依照组委会通知。可直接试用的作品将获得附加分数。",
    status: "upcoming" as const,
  },
  {
    phase: "总结颁奖",
    time: "11 月末",
    desc: "公布获奖名单并举行颁奖仪式。",
    detail: "公布获奖名单并举行颁奖仪式，具体时间依照组委会通知。组委会将通过邮箱联系获奖团队。",
    status: "upcoming" as const,
  },
];

export const AWARDS = [
  { level: "特等奖", count: 1, amount: "¥100,000", perks: "顶尖方案优先产业对接，组委会重点孵化与落地支持" },
  { level: "一等奖", count: 5, amount: "¥50,000", perks: "优秀作品有机会与企业签订框架协议，共同落地" },
  { level: "二等奖", count: 8, amount: "¥20,000", perks: "入围产业对接，持续优化产品与场景验证" },
  { level: "三等奖", count: 12, amount: "¥10,000", perks: "大赛荣誉证书，纳入后续合作备选" },
];

export const SCORE_DIMENSIONS: ScoreDimension[] = [
  {
    key: "fit",
    label: "实用性",
    weight: 20,
    description: "解决真实工业痛点的程度、可试用与落地成效",
    rules:
      "18–20：痛点明确，已有可验证落地成效；14–17：场景真实、方案可试用；10–13：方向正确但验证不足；0–9：偏概念或与产线脱节。",
  },
  {
    key: "innovation",
    label: "创新性",
    weight: 20,
    description: "技术路线、模式或应用方式的原创程度与突破性",
    rules:
      "18–20：路线或模式有明显突破；14–17：有清晰创新点；10–13：改进型创新；0–9：同质化明显、缺少差异化。",
  },
  {
    key: "technology",
    label: "技术性",
    weight: 20,
    description: "算法与工程实现水平、稳定性与可扩展性",
    rules:
      "18–20：算法与工程扎实，稳定性、可扩展性充分；14–17：实现完整、指标可信；10–13：核心能力具备但工程化不足；0–9：关键能力或证据薄弱。",
  },
  {
    key: "completeness",
    label: "作品完整性",
    weight: 20,
    description: "材料完整性、演示效果与文档规范性",
    rules:
      "18–20：材料齐全、演示清晰、文档规范；14–17：主体完整、细节可补；10–13：缺关键材料或演示不充分；0–9：材料残缺，难以评审。",
  },
  {
    key: "business",
    label: "推广价值",
    weight: 20,
    description: "商业/产业推广潜力、可复制性与风险可控程度",
    rules:
      "18–20：可复制推广路径清晰，风险可控；14–17：有落地与推广潜力；10–13：价值可见但边界不清；0–9：推广困难或风险过高。高合规/知识产权风险应显著扣分。",
  },
];

export const APPLY_OPTIONS = {
  /** 参赛方向 — mirrors the paper form checkboxes (single-select in the web flow). */
  directions: TRACKS.map((t) => t.title),
  genders: ["男", "女"],
  /** Soft cap for optional teammate rows. */
  maxMembers: 10,
  provinces: Object.keys(PROVINCE_CITY_OPTIONS),
  cities: Object.entries(CITY_DISTRICT_OPTIONS).map(([value, districts]) => ({ value, districts })),
};

export function citiesOfProvince(province: string) {
  return PROVINCE_CITY_OPTIONS[province] ?? [];
}

export function composeOrganizationAddress(province: string, city: string, district: string, detail?: string) {
  if (detail === undefined) return `${province}${city}${district}`.replace(/\s+/g, " ").trim();
  return `${province}${city}${district}${detail}`.replace(/\s+/g, " ").trim();
}

export function districtsOf(city: string) {
  return CITY_DISTRICT_OPTIONS[city] ?? [];
}
