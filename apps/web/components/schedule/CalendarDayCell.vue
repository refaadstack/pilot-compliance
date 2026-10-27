<script setup lang="ts">
import type { ScheduleItem } from "~/types";

const props = defineProps<{
  date: string;
  schedule?: ScheduleItem;
  isToday: boolean;
  tabbable: boolean;
  dutyLabel?: string;
}>();

const dayNumber = computed(() => Number(props.date.slice(8)));

const description = computed(() => {
  const parts = [formatLongDate(props.date)];
  if (props.isToday) parts.push("today");
  const s = props.schedule;
  if (!s) {
    parts.push("no duty scheduled");
  } else {
    parts.push(
      `${props.dutyLabel ?? s.dutyType} (${s.dutyType}) at ${s.baseName}`,
    );
    parts.push(
      s.isComplete
        ? `all ${s.countSchedules} logged`
        : `${s.countLogbooks} of ${s.countSchedules} logged`,
    );
    if (s.colorMismatch) parts.push("colour corrected from source data");
  }
  return parts.join(",");
});

const styleVars = computed(() =>
  props.schedule
    ? {
        backgroundColor: props.schedule.color,
        color: readableTextColor(props.schedule.color),
      }
    : undefined,
);
</script>

<template>
  <div
    role="gridcell"
    :data-date="date"
    :tabindex="tabbable ? 0 : -1"
    :aria-label="description"
    :title="description"
    class="relative flex min-h-[3.75rem] cursor-pointer flex-col justify-between rounded-md border p-1 text-left transition-transform active:scale-[0.98] sm:min-h-[5.25rem] sm:p-1.5"
    :class="[
      schedule ? 'border-black/10' : 'border-paper-line bg-paper',
      isToday ? 'ring-2 ring-ink ring-offset-2 ring-offset-paper-raised' : '',
    ]"
    :style="styleVars"
    @click="navigateTo(`/schedule/${date}`)"
    @keydown.enter.prevent="navigateTo(`/schedule/${date}`)"
  >
    <div class="flex items-start justify-between gap-1">
      <span
        class="font-display text-base font-semibold leading-none sm:text-lg"
        :class="{ muted: !schedule }"
        >{{ dayNumber }}</span
      >

      <template v-if="schedule">
        <span
          v-if="schedule.isComplete"
          class="flex h-4 w-4 items-center justify-center rounded-full bg-white text-emerald-800 sm:h-5 sm:w-5"
          aria-hidden="true"
        >
          <svg class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
            <path
              fill-rule="evenodd"
              d="M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0L3.3 9.7a1 1 0 011.4-1.4l3.8 3.8 6.8-6.8a1 1 0 011.4 0z"
              clip-rule="evenodd"
            />
          </svg>
        </span>
        <span
          v-else
          class="min-w-[1rem] rounded-full bg-white px-0.5 text-center text-[0.65rem] font-semibold leading-4 text-ink sm:min-w-[1.25rem] sm:px-1 sm:text-xs sm:leading-5"
          aria-hidden="true"
          >{{ schedule.countSchedules }}</span
        >
      </template>
    </div>

    <div v-if="schedule" class="flex flex-col leading-tight" aria-hidden="true">
      <span class="text-xs font-semibold sm:text-sm">{{
        schedule.baseName
      }}</span>
      <!-- duty code as text, so duty types are distinguishable without colour -->
      <span class="hidden text-[0.7rem] font-medium opacity-90 sm:block">{{
        schedule.dutyType
      }}</span>
    </div>
  </div>
</template>
