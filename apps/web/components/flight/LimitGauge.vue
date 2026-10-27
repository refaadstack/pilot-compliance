<script setup lang="ts">
import type { UsageItem } from "~/types";

const props = defineProps<{
  label: string;
  caption: string;
  usage: UsageItem;
}>();

const fill: Record<UsageItem["status"], string> = {
  normal: "bg-success",
  warning: "bg-warning",
  exceeded: "bg-danger",
};
const width = computed(() => `${Math.min(props.usage.percentage, 100)}%`);
</script>

<template>
  <div class="rounded-md border border-paper-line bg-white p-3">
    <div class="flex items-start justify-between gap-2">
      <div>
        <h3 class="font-medium leading-tight">{{ label }}</h3>
        <p class="muted text-xs">{{ caption }}</p>
      </div>
      <StatusBadge
        :tone="usageTone[usage.status]"
        :label="usageLabel[usage.status]"
      />
    </div>

    <p class="mt-2 flex items-baseline gap-1.5">
      <span class="font-display text-2xl font-semibold leading-none">{{
        formatHours(usage.hours)
      }}</span>
      <span class="muted text-sm"
        >of {{ formatHours(usage.limit) }} ·
        {{ usage.percentage.toFixed(1) }}%</span
      >
    </p>

    <div
      class="relative mt-2 h-2.5 overflow-hidden rounded-full bg-paper-line/70"
      role="progressbar"
      :aria-label="`${label} flight time`"
      :aria-valuenow="usage.hours"
      aria-valuemin="0"
      :aria-valuemax="usage.limit"
      :aria-valuetext="`${formatHours(usage.hours)} of ${formatHours(usage.limit)}, ${usage.percentage.toFixed(1)} percent, ${usageLabel[usage.status]}`"
    >
      <div
        class="h-full rounded-full transition-[width] duration-500"
        :class="fill[usage.status]"
        :style="{ width }"
      />
      <!-- tick at 80%: where"warning" begins -->
      <span
        class="absolute inset-y-0 left-[80%] w-px bg-ink/60"
        aria-hidden="true"
      />
    </div>
  </div>
</template>
