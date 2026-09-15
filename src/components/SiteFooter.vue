<script setup lang="ts">
import { CONTEST, ORGANIZER_GROUPS } from "@/lib/contest";

defineProps<{ showOrganizers?: boolean }>();

const chipsA = ORGANIZER_GROUPS.filter((g) => g.role === "指导单位" || g.role === "主办单位").flatMap((g) =>
  g.names.map((name) => ({ role: g.role, name })),
);
const chipsB = ORGANIZER_GROUPS.filter((g) => g.role === "承办单位" || g.role === "协办单位").flatMap((g) =>
  g.names.map((name) => ({ role: g.role, name })),
);

function loop<T>(items: T[]) {
  const base = items.length ? items : chipsA;
  let row = [...base];
  while (row.length < 8) row = [...row, ...base];
  return [...row, ...row];
}
</script>

<template>
  <footer class="relative mt-16 border-t border-white/8 bg-[#09090b]">
    <div class="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-violet-400/40 to-transparent" />
    <p :class="showOrganizers ? 'px-4 pt-8 pb-1 text-center text-[13px] text-zinc-400 sm:pt-10' : 'px-4 py-6 text-center text-[13px] text-zinc-400'">
      联系邮箱：
      <a
        :href="`mailto:${CONTEST.contactEmail}`"
        class="text-zinc-100 underline-offset-4 transition-colors hover:text-cyan-300 hover:underline"
      >
        {{ CONTEST.contactEmail }}
      </a>
    </p>
    <div v-if="showOrganizers" class="relative overflow-hidden bg-[#09090b] pt-4 pb-8 sm:pb-10">
      <div class="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-linear-to-r from-[#09090b] to-transparent sm:w-24" />
      <div class="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-linear-to-l from-[#09090b] to-transparent sm:w-24" />
      <div class="flex flex-col gap-3">
        <div class="overflow-hidden">
          <div class="flex w-max gap-3 pr-3 animate-marquee hover:[animation-play-state:paused]">
            <span
              v-for="(item, i) in loop(chipsA)"
              :key="'a' + i"
              class="inline-flex shrink-0 items-center gap-2 rounded-xl border border-white/8 bg-[#1c1c20] px-4 py-2.5"
            >
              <span class="text-[11px] tracking-[0.14em] text-zinc-500">{{ item.role }}</span>
              <span class="text-[13px] text-zinc-100">{{ item.name }}</span>
            </span>
          </div>
        </div>
        <div class="overflow-hidden">
          <div class="flex w-max gap-3 pr-3 animate-marquee-reverse hover:[animation-play-state:paused]">
            <span
              v-for="(item, i) in loop(chipsB)"
              :key="'b' + i"
              class="inline-flex shrink-0 items-center gap-2 rounded-xl border border-white/8 bg-[#1c1c20] px-4 py-2.5"
            >
              <span class="text-[11px] tracking-[0.14em] text-zinc-500">{{ item.role }}</span>
              <span class="text-[13px] text-zinc-100">{{ item.name }}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>
