<script setup lang="ts">
const route = useRoute();
const date = computed(() => String(route.params.date ?? ""));
</script>

<template>
  <div
    class="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center px-4 text-center"
  >
    <div class="panel w-full">
      <h1 class="font-display text-xl font-bold tracking-tight text-ink">
        Detail page coming soon
      </h1>
      <p class="muted mt-2 text-sm">
        Day details <span v-if="date"> for {{ formatDate(date) }}</span> are not
        part of this test's scope yet.
      </p>
      <NuxtLink
        to="/schedule"
        class="mt-4 inline-block rounded-full bg-ink px-5 py-2 text-sm font-semibold text-white hover:opacity-90"
      >
        Back to schedule
      </NuxtLink>
    </div>
  </div>
</template>
