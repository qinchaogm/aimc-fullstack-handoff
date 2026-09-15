import { CONTEST, DEMAND_DIRECTIONS } from "@/lib/contest";
import type { DemandSubmission } from "@/lib/types";

const PAPER_CSS = `
  :root { color-scheme: light; }
  * { box-sizing: border-box; }
  body { margin: 0; background: #fff; color: #111; font-family: "Songti SC", "SimSun", "Noto Serif SC", serif; }
  .paper { width: 210mm; max-width: 100%; margin: 0 auto; padding: 14mm 12mm; }
  .kicker { font-size: 13px; margin-bottom: 8px; }
  h1 { text-align: center; font-size: 18px; margin: 0 0 4px; letter-spacing: 0.04em; }
  h2 { text-align: center; font-size: 18px; margin: 0 0 16px; }
  table { width: 100%; border-collapse: collapse; table-layout: fixed; font-size: 13px; }
  th, td { border: 1px solid #111; padding: 8px 10px; vertical-align: middle; }
  .lab { width: 22%; text-align: center; font-weight: 600; background: #fafafa; }
  .note { text-align: center; font-size: 12px; }
  .dirs { text-align: center; line-height: 2.1; }
  .mark { font-family: "PingFang SC", "Microsoft YaHei", sans-serif; }
  .content { min-height: 140px; line-height: 1.7; white-space: pre-wrap; }
  .tall { min-height: 88px; }
`;

function checked(on: boolean) {
  return on ? "☑" : "☐";
}

function esc(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/\n/g, "<br/>");
}

function directionLabel(data: Pick<DemandSubmission, "direction" | "otherDirection">) {
  if (data.direction === "其他") return data.otherDirection ? `其他：${data.otherDirection}` : "其他";
  return data.direction;
}

function paperInner(data: DemandSubmission) {
  const dirs = DEMAND_DIRECTIONS.filter((d) => d !== "其他");
  const top = dirs
    .slice(0, 4)
    .map((d) => `${d}<span class="mark">${checked(data.direction === d)}</span>`)
    .join("&nbsp;&nbsp;");
  const factory = dirs[4] ?? "AI 原生智能工厂建设方案";
  const otherText = data.direction === "其他" && data.otherDirection ? esc(data.otherDirection) : "______";
  const bot = `${factory}<span class="mark">${checked(data.direction === factory)}</span>&nbsp;&nbsp;其他：${otherText}<span class="mark">${checked(data.direction === "其他")}</span>`;
  return `
    <p class="kicker">附件 3</p>
    <h1>${CONTEST.name}</h1>
    <h2>高价值场景需求征集表</h2>
    <table>
      <tr><th class="lab">单位全称</th><td>${esc(data.organizationName)}</td></tr>
      <tr><th class="lab">单位地址</th><td>${esc(data.organizationAddress)}</td></tr>
      <tr><th class="lab">姓名</th><td style="padding:0">
        <table style="border-collapse:collapse;width:100%"><tr>
          <td style="width:34%">${esc(data.contactName)}</td>
          <th class="lab" style="width:24%">职务</th>
          <td>${esc(data.contactTitle)}</td>
        </tr></table>
      </td></tr>
      <tr><th class="lab">手机</th><td style="padding:0">
        <table style="border-collapse:collapse;width:100%"><tr>
          <td style="width:34%">${esc(data.contactPhone)}</td>
          <th class="lab" style="width:24%">邮箱</th>
          <td>${esc(data.contactEmail)}</td>
        </tr></table>
      </td></tr>
      <tr><td colspan="2" class="note">（请正确填写有效联系地址及电话，若有更改请及时通知）</td></tr>
      <tr><th class="lab">需求标题</th><td>${esc(data.title)}</td></tr>
      <tr><th class="lab">需求方向</th><td class="dirs">${top}<br/>${bot}</td></tr>
      <tr><th class="lab">具体需求内容<br/>（建议不超过 500 字）</th><td class="content">${esc(data.content)}</td></tr>
      <tr><th class="lab">预期指标、效果<br/>（建议设置可量化指标）</th><td class="content tall">${esc(data.expected)}</td></tr>
    </table>
  `;
}

export function demandDirectionLabel(data: Pick<DemandSubmission, "direction" | "otherDirection">) {
  return directionLabel(data);
}

export function downloadDemandForm(data: DemandSubmission) {
  const html = `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"/><title>${CONTEST.name}需求征集表</title><style>${PAPER_CSS}</style></head><body><div class="paper">${paperInner(data)}</div></body></html>`;
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${CONTEST.name}高价值场景需求征集表_${data.title || "未命名"}.html`;
  a.click();
  URL.revokeObjectURL(a.href);
}
