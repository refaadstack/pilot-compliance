<script setup lang="ts">
const store = useFlightHoursStore();
</script>

<template>
  <div :aria-busy="store.loading">
    <ErrorState
      v-if="store.error"
      :message="store.error"
      @retry="store.fetchSummary()"
    />

    <div
      v-else-if="!store.data"
      class="grid gap-3 sm:grid-cols-2"
      role="status"
      aria-label="Loading limits"
    >
      <SkeletonBlock v-for="n in 4" :key="n" class="h-[116px]" />
    </div>

    <div v-else class="grid gap-3 sm:grid-cols-2">
      <LimitGauge
        label="Daily"
        caption="Today"
        :usage="store.data.usage.today"
      />
      <LimitGauge
        label="Weekly"
        caption="Last 7 days"
        :usage="store.data.usage.last7Days"
      />
      <LimitGauge
        label="Monthly"
        caption="Last 30 days"
        :usage="store.data.usage.last30Days"
      />
      <LimitGauge
        label="Annual"
        caption="Last 365 days"
        :usage="store.data.usage.last365Days"
      />
    </div>
  </div>
</template>
