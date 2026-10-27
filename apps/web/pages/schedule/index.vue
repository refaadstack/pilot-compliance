<script setup lang="ts">
const store = useSchedulesStore();

onMounted(() => {
  void store.fetchSchedules();
});
</script>

<template>
  <div class="mx-auto max-w-md px-3 pb-24 pt-4 sm:px-6">
    <h1 class="font-display text-2xl font-bold tracking-tight text-ink">
      Schedule
    </h1>
    <p class="muted mt-1 text-sm">
      Duty calendar with flight logging progress.
    </p>

    <div class="mt-4">
      <ScheduleCalendar />
    </div>
  </div>
</template>
