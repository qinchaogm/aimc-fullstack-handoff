<script setup lang="ts">
import SiteHeader from "@/components/SiteHeader.vue";
</script>

<template>
  <div class="min-h-screen bg-[#020b12] text-white">
    <SiteHeader />
    <main class="mx-auto flex min-h-[calc(100vh-4rem)] max-w-xl flex-col items-center justify-center px-4 text-center">
      <p class="text-6xl font-black text-cyan-300">404</p>
      <h1 class="mt-5 text-2xl font-semibold">页面不存在</h1>
      <p class="mt-3 text-sm text-slate-400">请检查访问地址，或返回大赛首页。</p>
      <RouterLink to="/" class="btn-nova mt-7 rounded-xl px-6 py-3 text-sm font-medium">返回首页</RouterLink>
    </main>
  </div>
</template>
