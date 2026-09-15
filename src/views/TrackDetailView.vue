<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import { ArrowLeft, ArrowRight, Lightbulb } from "lucide-vue-next";
import SiteHeader from "@/components/SiteHeader.vue";
import SiteFooter from "@/components/SiteFooter.vue";
import AmbientBackdrop from "@/components/AmbientBackdrop.vue";
import { TRACKS, trackByKey } from "@/lib/contest";

const route = useRoute();
const track = computed(() => trackByKey(String(route.params.key ?? "")));
const others = computed(() => TRACKS.filter((t) => t.key !== track.value?.key));
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <SiteHeader />
    <main class="relative flex-1">
      <section class="relative overflow-hidden border-b border-cyan-400/10 px-4 pt-12 pb-10 sm:px-6">
        <AmbientBackdrop compact />
        <div class="relative mx-auto max-w-4xl">
          <RouterLink to="/#tracks" class="inline-flex items-center gap-1.5 text-sm text-cyan-200/80 hover:text-cyan-100">
            <ArrowLeft class="size-4" />
            返回赛事方向
          </RouterLink>
          <template v-if="track">
            <p class="mt-5 text-xs tracking-[0.22em] text-cyan-300/85">参赛方向说明</p>
            <h1 class="mt-3 text-2xl font-bold text-white sm:text-4xl">{{ track.title }}</h1>
            <p class="mt-4 max-w-3xl text-[15px] leading-8 text-slate-300">{{ track.overview }}</p>
            <div class="mt-5 flex flex-wrap gap-2">
              <span
                v-for="tag in track.tags"
                :key="tag"
                class="rounded-full border border-cyan-300/25 bg-cyan-400/10 px-3 py-1 text-xs text-cyan-100"
              >
                {{ tag }}
              </span>
            </div>
            <div class="mt-8 flex flex-wrap gap-3">
              <RouterLink :to="{ path: '/apply', query: { direction: track.title } }" class="btn-nova inline-flex h-11 items-center gap-2 rounded-xl px-6">
                按此方向报名
                <ArrowRight class="size-4" />
              </RouterLink>
              <RouterLink :to="{ path: '/demand', query: { direction: track.title } }" class="btn-nova-ghost inline-flex h-11 items-center rounded-xl px-6">提交相关场景需求</RouterLink>
            </div>
          </template>
          <template v-else>
            <h1 class="mt-6 text-2xl font-bold text-white">未找到该赛事方向</h1>
            <p class="mt-3 text-sm text-slate-400">请从首页赛事方向重新进入。</p>
          </template>
        </div>
      </section>

      <div v-if="track" class="mx-auto max-w-4xl space-y-6 px-4 py-12 sm:px-6 sm:py-16">
        <section>
          <h2 class="flex items-center gap-2 text-xl font-bold text-white">
            <Lightbulb class="size-5 text-cyan-300" />
            示例赛题
          </h2>
          <p class="mt-2 text-sm leading-7 text-slate-400">
            下列题目为虚拟示例，便于理解本方向的命题方式。正式揭榜题目将由组委会评估发布；也可自选真实场景报名。
          </p>
          <ol class="mt-6 space-y-4">
            <li
              v-for="(ex, i) in track.examples"
              :key="ex.title"
              class="rounded-2xl border border-white/10 bg-white/[0.035] px-5 py-5 sm:px-7"
            >
              <p class="font-mono text-xs tracking-wider text-cyan-300/80">示例 {{ String(i + 1).padStart(2, "0") }}</p>
              <h3 class="mt-2 text-lg font-semibold text-white">{{ ex.title }}</h3>
              <p class="mt-3 text-sm leading-7 text-slate-300">
                <span class="font-medium text-slate-200">场景：</span>{{ ex.scene }}
              </p>
              <p class="mt-2 text-sm leading-7 text-slate-300">
                <span class="font-medium text-slate-200">目标：</span>{{ ex.goal }}
              </p>
            </li>
          </ol>
        </section>

        <section class="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-5">
          <h2 class="text-sm font-semibold text-white">其他参赛方向</h2>
          <div class="mt-3 flex flex-wrap gap-2">
            <RouterLink
              v-for="item in others"
              :key="item.key"
              :to="`/tracks/${item.key}`"
              class="rounded-full border border-white/12 bg-white/5 px-3.5 py-1.5 text-sm text-slate-300 hover:border-cyan-300/40 hover:text-white"
            >
              {{ item.title }}
            </RouterLink>
          </div>
        </section>
      </div>
    </main>
    <SiteFooter show-organizers />
  </div>
</template>
