import {
  AlignmentType,
  BorderStyle,
  Document,
  HeightRule,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableLayoutType,
  TableRow,
  TextRun,
  VerticalAlign,
  WidthType,
} from "docx";
import type { Registration, TeamMember } from "@/lib/types";
import { APPLY_OPTIONS, CONTEST } from "@/lib/contest";
import { formatRegDate } from "@/lib/journey";

export type FormLike = Omit<Registration, "id" | "userId" | "createdAt" | "status">;

/** Official paper title — spacing matches the printed form. */
export const REGISTRATION_FORM_TITLE = `${CONTEST.year} 年上海电气 AI 原生智能工厂创新应用大赛`;

const CONTENT_HINT = "请概述项目的意义及目标、主要内容、预期成果（可量化）、推广价值等可附页";

const SONG = { ascii: "Times New Roman", hAnsi: "Times New Roman", eastAsia: "宋体" } as const;
const HEI = { ascii: "SimHei", hAnsi: "SimHei", eastAsia: "黑体" } as const;

const BORDER = { style: BorderStyle.SINGLE, size: 8, color: "000000" };
const BORDERS = { top: BORDER, bottom: BORDER, left: BORDER, right: BORDER };
const NO_BORDER = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const NO_BORDERS = { top: NO_BORDER, bottom: NO_BORDER, left: NO_BORDER, right: NO_BORDER };

const TABLE_W = 10206;
const LABEL_W = 1900;
const COL_W = 1661;
const COLS = [LABEL_W, COL_W, COL_W, COL_W, COL_W, COL_W];

function memberRows(members: TeamMember[], min = 5) {
  const rows = [...members];
  while (rows.length < min) rows.push({ name: "", age: "", gender: "", phone: "", email: "" });
  return rows;
}

function esc(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/\n/g, "<br/>");
}

function mark(on: boolean) {
  return on ? "☑" : "□";
}

function directionLines(selected: string) {
  const dirs = APPLY_OPTIONS.directions;
  const join = (list: string[]) => list.map((d) => `${d}${mark(selected === d)}`).join("&nbsp;&nbsp;&nbsp;");
  return { top: join(dirs.slice(0, 3)), bot: join(dirs.slice(3)) };
}

function paperInner(data: FormLike) {
  const { top, bot } = directionLines(data.direction);
  const content = data.projectContent.trim() || CONTENT_HINT;
  const rows = memberRows(data.members)
    .map(
      (m) =>
        `<tr>
          <td>${esc(m.name)}</td>
          <td>${esc(m.age)}</td>
          <td>${esc(m.gender)}</td>
          <td>${esc(m.phone)}</td>
          <td>${esc(m.email)}</td>
        </tr>`,
    )
    .join("");
  const date = data.registrationDate ? formatRegDate(data.registrationDate) : "";
  return `
    <h1>${REGISTRATION_FORM_TITLE}</h1>
    <h2>报名表</h2>
    <div class="meta">
      <span>申报单位盖章</span>
      <span>报名日期：${esc(date)}</span>
      <span></span>
    </div>
    <table>
      <colgroup>
        <col style="width:18.6%" />
        <col style="width:16.28%" />
        <col style="width:16.28%" />
        <col style="width:16.28%" />
        <col style="width:16.28%" />
        <col style="width:16.28%" />
      </colgroup>
      <tr><td class="lab">项目名称</td><td colspan="5">${esc(data.projectName)}</td></tr>
      <tr><td class="lab">单位全称</td><td colspan="5">${esc(data.organizationName)}</td></tr>
      <tr><td class="lab">单位全称</td><td colspan="5">${esc(data.organizationName)}</td></tr>
      <tr>
        <td class="lab">项目负责人</td>
        <td colspan="2">${esc(data.leaderName)}</td>
        <td class="lab">负责人职务</td>
        <td colspan="2">${esc(data.leaderTitle)}</td>
      </tr>
      <tr><td class="lab">单位地址</td><td colspan="5">${esc(data.organizationAddress)}</td></tr>
      <tr>
        <td class="lab">参赛方向</td>
        <td class="dirs" colspan="5">${top}<br/>${bot}</td>
      </tr>
      <tr>
        <td class="lab">项目内容</td>
        <td class="content" colspan="5">${esc(content)}</td>
      </tr>
      <tr><td class="note" colspan="6">（证书排名以报名表为依据，第一作者为项目组负责人，请填写下栏信息）</td></tr>
      <tr>
        <td class="lab" rowspan="6">参赛小组<br/>成员简况</td>
        <td class="subh">姓名</td>
        <td class="subh">年龄</td>
        <td class="subh">性别</td>
        <td class="subh">手机号码</td>
        <td class="subh">邮箱</td>
      </tr>
      ${rows}
      <tr>
        <td class="lab">单位联系人</td>
        <td colspan="2">${esc(data.contactName)}</td>
        <td class="lab">联系人电话</td>
        <td colspan="2">${esc(data.contactPhone)}</td>
      </tr>
    </table>
  `;
}

export function registrationPaperHtml(data: FormLike) {
  return paperInner(data);
}

function run(text: string, opts: { bold?: boolean; size?: number; font?: typeof SONG | typeof HEI } = {}) {
  return new TextRun({
    text,
    bold: opts.bold,
    size: opts.size ?? 24,
    font: opts.font ?? SONG,
  });
}

function para(
  text: string,
  opts: {
    align?: (typeof AlignmentType)[keyof typeof AlignmentType];
    bold?: boolean;
    size?: number;
    font?: typeof SONG | typeof HEI;
    before?: number;
    after?: number;
  } = {},
) {
  return new Paragraph({
    alignment: opts.align ?? AlignmentType.CENTER,
    spacing: { before: opts.before ?? 0, after: opts.after ?? 0, line: 360 },
    children: [run(text, { bold: opts.bold, size: opts.size, font: opts.font })],
  });
}

function cell(
  children: Paragraph[],
  opts: {
    span?: number;
    rowSpan?: number;
    width?: number;
    align?: (typeof VerticalAlign)[keyof typeof VerticalAlign];
  } = {},
) {
  return new TableCell({
    children,
    columnSpan: opts.span,
    rowSpan: opts.rowSpan,
    width: { size: opts.width ?? COL_W, type: WidthType.DXA },
    verticalAlign: (opts.align ?? VerticalAlign.CENTER) as
      | typeof VerticalAlign.TOP
      | typeof VerticalAlign.CENTER
      | typeof VerticalAlign.BOTTOM,
    borders: BORDERS,
    margins: { top: 60, bottom: 60, left: 80, right: 80 },
  });
}

function labelCell(text: string, opts: { rowSpan?: number; width?: number } = {}) {
  return cell(
    text.split("\n").map((line) => para(line, { size: 24 })),
    {
      rowSpan: opts.rowSpan,
      width: opts.width ?? LABEL_W,
    },
  );
}

function valueCell(text: string, span = 1, align: (typeof AlignmentType)[keyof typeof AlignmentType] = AlignmentType.LEFT) {
  return cell(
    [
      new Paragraph({
        alignment: align,
        spacing: { before: 0, after: 0, line: 360 },
        children: [run(text, { size: 24 })],
      }),
    ],
    { span, width: COL_W * span },
  );
}

function buildRegistrationDoc(data: FormLike) {
  const dirs = APPLY_OPTIONS.directions;
  const members = memberRows(data.members);
  const content = data.projectContent.trim() || CONTENT_HINT;
  const date = data.registrationDate ? formatRegDate(data.registrationDate) : "";

  const dirChildren = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 80, after: 40, line: 400 },
      children: dirs.slice(0, 3).flatMap((d, i) => [
        ...(i > 0 ? [run("   ", { size: 21 })] : []),
        run(`${d}${mark(data.direction === d)}`, { size: 21 }),
      ]),
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 40, after: 80, line: 400 },
      children: dirs.slice(3).flatMap((d, i) => [
        ...(i > 0 ? [run("   ", { size: 21 })] : []),
        run(`${d}${mark(data.direction === d)}`, { size: 21 }),
      ]),
    }),
  ];

  const contentParas = content.split("\n").map(
    (line) =>
      new Paragraph({
        alignment: AlignmentType.LEFT,
        spacing: { before: 0, after: 0, line: 360 },
        children: [run(line, { size: 21 })],
      }),
  );

  const rows: TableRow[] = [
    new TableRow({
      height: { value: 500, rule: HeightRule.ATLEAST },
      children: [labelCell("项目名称"), valueCell(data.projectName, 5)],
    }),
    new TableRow({
      height: { value: 500, rule: HeightRule.ATLEAST },
      children: [labelCell("单位全称"), valueCell(data.organizationName, 5)],
    }),
    new TableRow({
      height: { value: 500, rule: HeightRule.ATLEAST },
      children: [
        labelCell("项目负责人"),
        valueCell(data.leaderName, 2),
        labelCell("负责人职务", { width: COL_W }),
        valueCell(data.leaderTitle, 2),
      ],
    }),
    new TableRow({
      height: { value: 500, rule: HeightRule.ATLEAST },
      children: [labelCell("单位地址"), valueCell(data.organizationAddress, 5)],
    }),
    new TableRow({
      height: { value: 1100, rule: HeightRule.ATLEAST },
      children: [labelCell("参赛方向"), cell(dirChildren, { span: 5, width: COL_W * 5 })],
    }),
    new TableRow({
      height: { value: 2000, rule: HeightRule.ATLEAST },
      children: [labelCell("项目内容"), cell(contentParas, { span: 5, width: COL_W * 5, align: VerticalAlign.TOP })],
    }),
    new TableRow({
      height: { value: 460, rule: HeightRule.ATLEAST },
      children: [
        cell([para("（证书排名以报名表为依据，第一作者为项目组负责人，请填写下栏信息）", { size: 21 })], {
          span: 6,
          width: TABLE_W,
        }),
      ],
    }),
    new TableRow({
      height: { value: 420, rule: HeightRule.ATLEAST },
      children: [
        labelCell("参赛小组\n成员简况", { rowSpan: 6 }),
        cell([para("姓名", { size: 21 })], { width: COL_W }),
        cell([para("年龄", { size: 21 })], { width: COL_W }),
        cell([para("性别", { size: 21 })], { width: COL_W }),
        cell([para("手机号码", { size: 21 })], { width: COL_W }),
        cell([para("邮箱", { size: 21 })], { width: COL_W }),
      ],
    }),
    ...members.map(
      (m) =>
        new TableRow({
          height: { value: 400, rule: HeightRule.ATLEAST },
          children: [
            cell([para(m.name, { size: 21 })], { width: COL_W }),
            cell([para(m.age, { size: 21 })], { width: COL_W }),
            cell([para(m.gender, { size: 21 })], { width: COL_W }),
            cell([para(m.phone, { size: 21 })], { width: COL_W }),
            cell([para(m.email, { size: 21 })], { width: COL_W }),
          ],
        }),
    ),
    new TableRow({
      height: { value: 500, rule: HeightRule.ATLEAST },
      children: [
        labelCell("单位联系人"),
        valueCell(data.contactName, 2),
        labelCell("联系人电话", { width: COL_W }),
        valueCell(data.contactPhone, 2),
      ],
    }),
  ];

  const meta = new Table({
    width: { size: TABLE_W, type: WidthType.DXA },
    layout: TableLayoutType.FIXED,
    columnWidths: [TABLE_W / 3, TABLE_W / 3, TABLE_W / 3],
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: TABLE_W / 3, type: WidthType.DXA },
            borders: NO_BORDERS,
            children: [para("申报单位盖章", { align: AlignmentType.LEFT, size: 21 })],
          }),
          new TableCell({
            width: { size: TABLE_W / 3, type: WidthType.DXA },
            borders: NO_BORDERS,
            children: [para(`报名日期：${date}`, { align: AlignmentType.CENTER, size: 21 })],
          }),
          new TableCell({
            width: { size: TABLE_W / 3, type: WidthType.DXA },
            borders: NO_BORDERS,
            children: [para("", { size: 21 })],
          }),
        ],
      }),
    ],
  });

  const form = new Table({
    width: { size: TABLE_W, type: WidthType.DXA },
    layout: TableLayoutType.FIXED,
    columnWidths: COLS,
    rows,
  });

  return new Document({
    styles: {
      default: {
        document: {
          run: { font: "宋体", size: 24 },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            size: { width: 11906, height: 16838 },
            margin: { top: 1134, right: 851, bottom: 1134, left: 851 },
          },
        },
        children: [
          para(REGISTRATION_FORM_TITLE, { bold: true, size: 36, font: HEI, after: 80 }),
          para("报名表", { bold: true, size: 36, font: HEI, after: 200 }),
          meta,
          new Paragraph({ spacing: { after: 80 }, children: [run("")] }),
          form,
        ],
      },
    ],
  });
}

export async function downloadRegistrationForm(data: FormLike) {
  const blob = await Packer.toBlob(buildRegistrationDoc(data));
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${CONTEST.year}年上海电气AI原生智能工厂创新应用大赛报名表_${data.projectName || "未命名"}.docx`;
  a.click();
  URL.revokeObjectURL(a.href);
}
