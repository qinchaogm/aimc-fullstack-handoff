<template>
  <div class="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
    <div class="home-starfield home-star-drift absolute inset-0 opacity-60" />
    <div class="nebula-drift absolute top-[4%] -left-[18rem] size-[54rem] bg-[radial-gradient(closest-side,rgba(8,145,178,.34),transparent_72%)]" />
    <div class="nebula-drift-alt absolute top-[20%] -right-[22rem] size-[62rem] bg-[radial-gradient(closest-side,rgba(34,211,238,.2),transparent_72%)]" />
    <div
      class="nebula-drift absolute top-[48%] left-[12%] size-[48rem] bg-[radial-gradient(closest-side,rgba(59,130,246,.2),transparent_72%)] [animation-delay:-8s]"
    />
    <div
      class="nebula-drift-alt absolute top-[72%] -right-[12rem] size-[44rem] bg-[radial-gradient(closest-side,rgba(167,139,250,.22),transparent_72%)] [animation-delay:-12s]"
    />

    <span class="page-bokeh absolute top-[12%] left-[18%] size-24" />
    <span class="page-bokeh page-bokeh-violet absolute top-[38%] right-[12%] size-16 [animation-delay:-4s]" />
    <span class="page-bokeh absolute top-[64%] left-[8%] size-10 [animation-delay:-7s]" />
    <span class="page-bokeh page-bokeh-pink absolute top-[22%] right-[28%] size-12 [animation-delay:-2s]" />

    <svg viewBox="0 0 1440 2600" preserveAspectRatio="none" class="absolute inset-x-0 top-0 h-full w-full opacity-45">
      <defs>
        <linearGradient id="flow" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stop-color="#22d3ee" stop-opacity="0" />
          <stop offset=".4" stop-color="#0891b2" stop-opacity=".7" />
          <stop offset=".7" stop-color="#22d3ee" stop-opacity=".8" />
          <stop offset="1" stop-color="#22d3ee" stop-opacity="0" />
        </linearGradient>
        <radialGradient id="node">
          <stop offset="0" stop-color="#f5f3ff" />
          <stop offset=".35" stop-color="#22d3ee" />
          <stop offset="1" stop-color="#22d3ee" stop-opacity="0" />
        </radialGradient>
      </defs>
      <path
        class="flow-dash"
        fill="none"
        stroke="url(#flow)"
        stroke-width="1"
        stroke-dasharray="8 18"
        d="M-80 350 C280 180 430 460 760 260 S1180 50 1510 210"
      />
      <path
        class="flow-dash"
        fill="none"
        stroke="url(#flow)"
        stroke-width="1.3"
        stroke-dasharray="8 18"
        style="animation-delay: -1.8s"
        d="M-140 920 C260 680 560 1020 850 780 S1260 600 1510 730"
      />
      <path
        class="flow-dash"
        fill="none"
        stroke="url(#flow)"
        stroke-width="1"
        stroke-dasharray="8 18"
        style="animation-delay: -3.6s"
        d="M-100 1530 C240 1360 510 1620 820 1420 S1200 1260 1510 1430"
      />
      <path
        class="flow-dash"
        fill="none"
        stroke="url(#flow)"
        stroke-width="1.3"
        stroke-dasharray="8 18"
        style="animation-delay: -5.4s"
        d="M-80 2240 C300 1990 550 2320 920 2080 S1260 1960 1520 2050"
      />
      <circle cx="260" cy="312" r="8" fill="url(#node)" opacity=".8" />
      <circle cx="705" cy="286" r="8" fill="url(#node)" opacity=".8" />
      <circle cx="1100" cy="152" r="8" fill="url(#node)" opacity=".8" />
      <circle cx="380" cy="855" r="8" fill="url(#node)" opacity=".8" />
      <circle cx="910" cy="746" r="8" fill="url(#node)" opacity=".8" />
      <circle cx="180" cy="1470" r="8" fill="url(#node)" opacity=".8" />
      <circle cx="790" cy="1440" r="8" fill="url(#node)" opacity=".8" />
      <circle cx="360" cy="2140" r="8" fill="url(#node)" opacity=".8" />
    </svg>

    <div class="absolute top-[31%] left-1/2 h-px w-[84%] -translate-x-1/2 bg-linear-to-r from-transparent via-cyan-400/25 to-transparent" />
    <div class="absolute top-[61%] left-1/2 h-px w-[84%] -translate-x-1/2 bg-linear-to-r from-transparent via-cyan-300/20 to-transparent" />
  </div>
</template>
