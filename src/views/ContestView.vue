<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import { ArrowRight, Mail, Phone } from "lucide-vue-next";
import SiteHeader from "@/components/SiteHeader.vue";
import SiteFooter from "@/components/SiteFooter.vue";
import AmbientBackdrop from "@/components/AmbientBackdrop.vue";
import {
  AWARDS,
  CONTEST,
  CONTEST_NAV,
  DEMAND,
  NOTICE,
  ORGANIZER_GROUPS,
  OTHER_ITEMS,
  SCHEDULE,
  SCORE_DIMENSIONS,
  TRACKS,
} from "@/lib/contest";
import { cn } from "@/utils/cn";

const active = ref<(typeof CONTEST_NAV)[number]["id"]>("intro");
let io: IntersectionObserver | undefined;
let hashTimer: number | undefined;

function scrollToHash() {
  const id = window.location.hash.replace("#", "");
  if (id) document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

onMounted(() => {
  hashTimer = window.setTimeout(scrollToHash, 80);
  window.addEventListener("hashchange", scrollToHash);
  const nodes = CONTEST_NAV.map((s) => document.getElementById(s.id)).filter(Boolean) as HTMLElement[];
  io = new IntersectionObserver(
    (entries) => {
      const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      const id = visible?.target.id as typeof active.value;
      if (id) active.value = id;
    },
    { rootMargin: "-20% 0px -60% 0px", threshold: [0.15, 0.35, 0.6] },
  );
  nodes.forEach((n) => io?.observe(n));
});

onUnmounted(() => {
  if (hashTimer) window.clearTimeout(hashTimer);
  window.removeEventListener("hashchange", scrollToHash);
  io?.disconnect();
});
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <SiteHeader />
    <main class="relative flex-1">
      <div class="relative">
        <section data-hero class="relative overflow-hidden border-b border-cyan-400/10 px-4 pt-14 pb-12 sm:px-6 sm:pt-16 sm:pb-14">
          <AmbientBackdrop compact />
          <div class="relative mx-auto max-w-5xl text-center">
            <p class="text-xs tracking-[0.22em] text-cyan-300/85">{{ CONTEST.year }} · 赛事通知</p>
            <h1 class="mt-4 text-2xl font-bold leading-snug text-white sm:text-4xl">{{ CONTEST.name }}</h1>
            <p class="mx-auto mt-4 max-w-3xl text-sm leading-7 text-slate-300 sm:text-[15px]">{{ NOTICE.title }}</p>
            <div class="mt-8 flex flex-wrap justify-center gap-3">
              <RouterLink to="/apply" class="btn-nova inline-flex h-12 items-center gap-2 rounded-xl px-8">
                我要报名
                <ArrowRight class="size-4" />
              </RouterLink>
              <RouterLink to="/" class="btn-nova-ghost inline-flex h-12 items-center rounded-xl px-8">返回首页</RouterLink>
            </div>
          </div>
        </section>

        <div class="sticky top-16 z-30 border-b border-white/8 bg-[#021018]/88 backdrop-blur-xl">
          <nav class="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-3 py-2 sm:justify-center sm:px-6">
            <a
              v-for="item in CONTEST_NAV"
              :key="item.id"
              :href="`#${item.id}`"
              :class="
                cn(
                  'shrink-0 rounded-full px-3.5 py-2 text-sm whitespace-nowrap transition-colors',
                  active === item.id ? 'bg-cyan-400/15 text-cyan-100' : 'text-slate-400 hover:bg-white/5 hover:text-white',
                )
              "
            >
              {{ item.label }}
            </a>
          </nav>
        </div>

        <div class="mx-auto max-w-5xl space-y-6 px-4 py-12 sm:px-6 sm:py-16">
          <section id="intro" class="scroll-mt-36 rounded-3xl border border-white/10 bg-white/[0.035] px-5 py-8 sm:px-10 sm:py-10">
            <h2 class="flex items-center gap-3 text-xl font-bold text-white sm:text-2xl">
              <span class="tracking-wider text-cyan-300">一</span>
              <span class="h-[0.9em] w-px bg-cyan-300/50" />
              赛事介绍
            </h2>
            <div class="mt-6 text-[15px] leading-8 text-slate-300">
              <p>{{ NOTICE.lead }}</p>
              <p class="mt-4">{{ NOTICE.purpose }}</p>
              <p class="mt-4 text-white">{{ NOTICE.sloganNote }}</p>
              <div class="mt-8 grid gap-4 md:grid-cols-3">
                <article v-for="(m, i) in NOTICE.mechanisms" :key="m.title" class="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                  <p class="font-mono text-xs tracking-wider text-cyan-300/80">0{{ i + 1 }}</p>
                  <h3 class="mt-2 text-base font-semibold text-white">{{ m.title }}</h3>
                  <p class="mt-2 text-sm leading-7 text-slate-400">{{ m.body }}</p>
                </article>
              </div>
              <h3 class="mt-10 text-base font-semibold text-white">赛事机构</h3>
              <dl class="mt-4 grid gap-3 sm:grid-cols-2">
                <div v-for="g in ORGANIZER_GROUPS" :key="g.role" class="rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3">
                  <dt class="text-xs tracking-wider text-cyan-300/80">{{ g.role }}</dt>
                  <dd class="mt-1.5 text-sm leading-7 text-slate-200">{{ g.names.join("、") }}</dd>
                </div>
              </dl>
              <h3 class="mt-10 text-base font-semibold text-white">选题模式</h3>
              <p class="mt-2 text-sm leading-7 text-slate-400">
                每个作品可任选 1 种模式报名。采用揭榜题目的作品相较自选题目会有一定附加分数。
              </p>
              <div class="mt-4 grid gap-4 md:grid-cols-2">
                <article v-for="m in NOTICE.topicModes" :key="m.title" class="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                  <h4 class="font-semibold text-white">{{ m.title }}</h4>
                  <p class="mt-2 text-sm leading-7 text-slate-400">{{ m.body }}</p>
                </article>
              </div>
            </div>
          </section>

          <section id="tracks" class="scroll-mt-36 rounded-3xl border border-white/10 bg-white/[0.035] px-5 py-8 sm:px-10 sm:py-10">
            <h2 class="flex items-center gap-3 text-xl font-bold text-white sm:text-2xl">
              <span class="tracking-wider text-cyan-300">二</span>
              <span class="h-[0.9em] w-px bg-cyan-300/50" />
              参赛方向
            </h2>
            <div class="mt-6 text-[15px] leading-8 text-slate-300">
              <p>本次大赛围绕「AI 原生智能工厂」建设，设立 5 个参赛方向。每个作品可任选 1 个方向报名，可提交软 / 硬件作品。</p>
              <ol class="mt-6 space-y-4">
                <li v-for="(t, i) in TRACKS" :key="t.key" class="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4">
                  <div class="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p class="text-sm font-semibold text-white">{{ i + 1 }}）{{ t.title }}</p>
                      <p class="mt-2 text-sm leading-7 text-slate-400">{{ t.desc }}</p>
                    </div>
                    <RouterLink
                      :to="`/tracks/${t.key}`"
                      class="shrink-0 text-sm text-cyan-200 underline-offset-4 hover:underline"
                    >
                      了解赛事方向
                    </RouterLink>
                  </div>
                </li>
              </ol>
            </div>
          </section>

          <section id="eligibility" class="scroll-mt-36 rounded-3xl border border-white/10 bg-white/[0.035] px-5 py-8 sm:px-10 sm:py-10">
            <h2 class="flex items-center gap-3 text-xl font-bold text-white sm:text-2xl">
              <span class="tracking-wider text-cyan-300">三</span>
              <span class="h-[0.9em] w-px bg-cyan-300/50" />
              参赛对象
            </h2>
            <div class="mt-6 text-[15px] leading-8 text-slate-300">
              <p>{{ NOTICE.eligibility.lead }}</p>
              <ul class="mt-5 space-y-3">
                <li v-for="rule in NOTICE.eligibility.rules" :key="rule" class="flex gap-3 text-sm leading-7 text-slate-300">
                  <span class="mt-2.5 size-1.5 shrink-0 rounded-full bg-cyan-300" />
                  {{ rule }}
                </li>
              </ul>
            </div>
          </section>

          <section id="schedule" class="scroll-mt-36 rounded-3xl border border-white/10 bg-white/[0.035] px-5 py-8 sm:px-10 sm:py-10">
            <h2 class="flex items-center gap-3 text-xl font-bold text-white sm:text-2xl">
              <span class="tracking-wider text-cyan-300">四</span>
              <span class="h-[0.9em] w-px bg-cyan-300/50" />
              赛程安排
            </h2>
            <div class="mt-6 text-[15px] leading-8 text-slate-300">
              <p>赛事通知发布即赛事启动。请按下列节点完成报名、提交与答辩。</p>
              <ol class="mt-6 space-y-4">
                <li v-for="(s, i) in SCHEDULE" :key="s.phase" class="relative rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4">
                  <div class="flex flex-wrap items-baseline justify-between gap-2">
                    <p class="text-sm font-semibold text-white">{{ i + 1 }}、{{ s.phase }}</p>
                    <p class="font-mono text-xs text-cyan-200/85">{{ s.time }}</p>
                  </div>
                  <p class="mt-2 text-sm leading-7 text-slate-400">{{ s.detail ?? s.desc }}</p>
                </li>
              </ol>
            </div>
          </section>

          <section id="awards" class="scroll-mt-36 rounded-3xl border border-white/10 bg-white/[0.035] px-5 py-8 sm:px-10 sm:py-10">
            <h2 class="flex items-center gap-3 text-xl font-bold text-white sm:text-2xl">
              <span class="tracking-wider text-cyan-300">五</span>
              <span class="h-[0.9em] w-px bg-cyan-300/50" />
              奖项设置
            </h2>
            <div class="mt-6 text-[15px] leading-8 text-slate-300">
              <p>将根据参赛作品的数量规模和质量水平确定奖项名额。优秀作品有机会与企业签订框架协议，进一步优化产品并共同落地。</p>
              <div class="mt-6 grid gap-4 sm:grid-cols-3">
                <article v-for="a in AWARDS" :key="a.level" class="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-5 text-center">
                  <p class="text-sm tracking-[0.2em] text-cyan-200">{{ a.level }}</p>
                  <p class="mt-3 text-3xl font-bold text-white">{{ a.amount }}</p>
                  <p class="mt-1 text-xs text-slate-500">共 {{ a.count }} 组</p>
                  <p class="mt-3 text-xs leading-6 text-slate-400">{{ a.perks }}</p>
                </article>
              </div>
              <p class="mt-5 text-sm leading-7 text-slate-400">
                大赛另设优秀组织单位奖，由组委会根据各企业实际参赛作品数及获奖成绩综合评定。
              </p>
            </div>
          </section>

          <section id="others" class="scroll-mt-36 rounded-3xl border border-white/10 bg-white/[0.035] px-5 py-8 sm:px-10 sm:py-10">
            <h2 class="flex items-center gap-3 text-xl font-bold text-white sm:text-2xl">
              <span class="tracking-wider text-cyan-300">六</span>
              <span class="h-[0.9em] w-px bg-cyan-300/50" />
              其他事项
            </h2>
            <div class="mt-6 text-[15px] leading-8 text-slate-300">
              <ol class="space-y-5">
                <li v-for="(item, i) in OTHER_ITEMS" :key="item.title">
                  <h3 class="text-sm font-semibold text-white">{{ i + 1 }}、{{ item.title }}</h3>
                  <p class="mt-2 text-sm leading-7 text-slate-400">{{ item.body }}</p>
                </li>
              </ol>
              <div class="mt-8 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-5">
                <h3 class="text-sm font-semibold text-white">评审维度</h3>
                <ul class="mt-4 grid gap-3 sm:grid-cols-2">
                  <li v-for="d in SCORE_DIMENSIONS" :key="d.key" class="text-sm leading-7 text-slate-400">
                    <span class="font-medium text-slate-200">{{ d.label }} {{ d.weight }}%</span>
                    <span class="mt-0.5 block">{{ d.description }}</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          <section id="demand" class="scroll-mt-36 rounded-3xl border border-white/10 bg-white/[0.035] px-5 py-8 sm:px-10 sm:py-10">
            <h2 class="flex items-center gap-3 text-xl font-bold text-white sm:text-2xl">
              <span class="tracking-wider text-cyan-300">七</span>
              <span class="h-[0.9em] w-px bg-cyan-300/50" />
              需求征集
            </h2>
            <div class="mt-6 text-[15px] leading-8 text-slate-300">
              <p>{{ DEMAND.body }}</p>
              <p class="mt-4 text-sm leading-7 text-slate-400">
                请在本网站在线填写《高价值场景需求征集表》。评估通过后，将纳入中试基地攻关或作为下届赛题发布。
              </p>
              <div class="mt-6 flex flex-wrap items-center gap-3">
                <RouterLink to="/demand" class="btn-nova inline-flex h-11 items-center rounded-xl px-5 text-sm">
                  在线填写需求征集表
                </RouterLink>
              </div>
            </div>
          </section>

          <section id="contact" class="scroll-mt-36 rounded-3xl border border-white/10 bg-white/[0.035] px-5 py-8 sm:px-10 sm:py-10">
            <h2 class="flex items-center gap-3 text-xl font-bold text-white sm:text-2xl">
              <span class="tracking-wider text-cyan-300">八</span>
              <span class="h-[0.9em] w-px bg-cyan-300/50" />
              联系我们
            </h2>
            <div class="mt-6 text-[15px] leading-8 text-slate-300">
              <p>如有疑问，请通过下列方式联系组委会。</p>
              <div class="mt-5 grid gap-3 sm:grid-cols-2">
                <div class="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
                  <Phone class="size-4 text-cyan-300" />
                  <div>
                    <p class="text-sm font-medium text-white">{{ CONTEST.contactName }}</p>
                    <p class="font-mono text-sm text-slate-400">{{ CONTEST.contactPhone }}</p>
                  </div>
                </div>
                <div class="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
                  <Phone class="size-4 text-cyan-300" />
                  <div>
                    <p class="text-sm font-medium text-white">{{ CONTEST.contactNameAlt }}</p>
                    <p class="font-mono text-sm text-slate-400">{{ CONTEST.contactPhoneAlt }}</p>
                  </div>
                </div>
              </div>
              <p class="mt-5 flex flex-wrap items-center gap-2 text-sm text-slate-300">
                <Mail class="size-4 text-cyan-300" />
                邮箱
                <a class="text-cyan-200 underline underline-offset-4" :href="`mailto:${CONTEST.contactEmail}`">{{ CONTEST.contactEmail }}</a>
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
    <SiteFooter show-organizers />
  </div>
</template>
