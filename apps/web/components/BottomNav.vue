<script setup lang="ts">
const auth = useAuthStore();
</script>

<template>
  <nav
    class="fixed inset-x-0 bottom-0 z-40 border-t border-paper-line bg-white/95 backdrop-blur"
  >
    <div class="mx-auto grid max-w-md grid-cols-4">
      <NuxtLink
        v-for="item in [
          {
            to: '/',
            label: 'Home',
            icon: 'M3 10.5 10 4l7 6.5V17a1 1 0 01-1 1h-4v-5H8v5H4a1 1 0 01-1-1z',
          },
          {
            to: '/schedule',
            label: 'Schedule',
            icon: 'M5 4h10a1 1 0 011 1v12a1 1 0 01-1 1H5a1 1 0 01-1-1V5a1 1 0 011-1zm2 2v2h6V6H7zM4 10h12',
          },
          {
            to: '/logbook',
            label: 'Logbook',
            icon: 'M6 3h9l3 3v11a1 1 0 01-1 1H6a1 1 0 01-1-1V4a1 1 0 011-1zm2 6h8M8 12h8M8 15h5',
          },
          {
            to: '/more',
            label: 'More',
            icon: 'M5 10h.01M10 10h.01M15 10h.01M19 10c0 3.866-4.032 7-9 7-1.06 0-2.073-.15-3-.42L4 18l1.03-2.9C3.73 13.9 3 12.02 3 10c0-3.866 4.032-7 9-7s7 3.134 7 7z',
          },
        ] as const"
        :key="item.to"
        :to="item.to"
        class="flex flex-col items-center gap-0.5 py-2 text-[0.65rem] font-medium text-ink-soft transition-colors"
        exact-active-class="!text-chart"
        active-class="!text-ink"
      >
        <svg
          class="h-5 w-5"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          stroke-width="1.6"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path :d="item.icon" />
        </svg>
        {{ item.label }}
      </NuxtLink>
    </div>
    <!-- hidden sign-out affordance until a proper More page exists -->
    <button type="button" class="sr-only" @click="auth.logout()">
      Sign out
    </button>
  </nav>
</template>
