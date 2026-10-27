<script setup lang="ts">
const store = useSchedulesStore();

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

const weeks = computed(() =>
  store.currentMonth ? buildMonthGrid(store.currentMonth) : [],
);
const monthLabel = computed(() =>
  store.currentMonth ? formatMonth(store.currentMonth) : "",
);
const legendByCode = computed(
  () => new Map(store.legend.map((item) => [item.code, item.label])),
);
const showSkeleton = computed(() => store.loading && !store.isCurrent);
const isEmptyMonth = computed(
  () => store.isCurrent && Object.keys(store.byDate).length === 0,
);

/* Roving tabindex: one tab stop for the whole grid, arrow keys move between days. */
const activeDate = ref<string | null>(null);
watch(
  () => [store.currentMonth, store.today] as const,
  ([month, today]) => {
    if (!month) return;
    activeDate.value = today && today.startsWith(month) ? today : `${month}-01`;
  },
  { immediate: true },
);

const grid = ref<HTMLElement | null>(null);
const KEY_STEPS: Record<string, number> = {
  ArrowLeft: -1,
  ArrowRight: 1,
  ArrowUp: -7,
  ArrowDown: 7,
};

function onKeydown(event: KeyboardEvent): void {
  const step = KEY_STEPS[event.key];
  const current = (event.target as HTMLElement | null)?.dataset.date;
  if (step === undefined || !current || !store.currentMonth) return;

  const next = shiftDate(current, step);
  if (!next.startsWith(store.currentMonth)) return;
  event.preventDefault();
  activeDate.value = next;
  grid.value?.querySelector<HTMLElement>(`[data-date="${next}"]`)?.focus();
}

function onFocusin(event: FocusEvent): void {
  const date = (event.target as HTMLElement | null)?.dataset.date;
  if (date) activeDate.value = date;
}
</script>

<template>
  <section
    class="panel"
    aria-labelledby="schedule-title"
    :aria-busy="store.loading"
  >
    <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
      <h2 id="schedule-title" class="panel-title">
        Duty schedule <span class="muted font-normal">{{ monthLabel }}</span>
      </h2>

      <div
        class="flex items-center gap-2"
        role="group"
        aria-label="Change month"
      >
        <button
          type="button"
          class="btn"
          aria-label="Previous month"
          :disabled="!store.currentMonth"
          @click="store.goToPrevMonth()"
        >
          <svg
            class="h-4 w-4"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fill-rule="evenodd"
              d="M12.7 5.3a1 1 0 010 1.4L9.4 10l3.3 3.3a1 1 0 11-1.4 1.4l-4-4a1 1 0 010-1.4l4-4a1 1 0 011.4 0z"
              clip-rule="evenodd"
            />
          </svg>
        </button>
        <button
          type="button"
          class="btn"
          :disabled="!store.today"
          @click="store.goToToday()"
        >
          Today
        </button>
        <button
          type="button"
          class="btn"
          aria-label="Next month"
          :disabled="!store.currentMonth"
          @click="store.goToNextMonth()"
        >
          <svg
            class="h-4 w-4"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fill-rule="evenodd"
              d="M7.3 14.7a1 1 0 010-1.4l3.3-3.3-3.3-3.3a1 1 0 011.4-1.4l4 4a1 1 0 010 1.4l-4 4a1 1 0 01-1.4 0z"
              clip-rule="evenodd"
            />
          </svg>
        </button>
      </div>
    </div>

    <ErrorState
      v-if="store.error"
      :message="store.error"
      @retry="store.retry()"
    />

    <div
      v-else-if="showSkeleton || !store.data"
      class="grid grid-cols-7 gap-1 sm:gap-1.5"
      role="status"
      aria-label="Loading schedule"
    >
      <SkeletonBlock
        v-for="n in 35"
        :key="n"
        class="h-[3.75rem] sm:h-[5.25rem]"
      />
    </div>

    <template v-else>
      <div
        ref="grid"
        role="grid"
        :aria-label="`Duty schedule for ${monthLabel}`"
        @keydown="onKeydown"
        @focusin="onFocusin"
      >
        <div role="row" class="mb-1 grid grid-cols-7 gap-1 sm:gap-1.5">
          <div
            v-for="day in WEEKDAYS"
            :key="day"
            role="columnheader"
            class="muted py-1 text-center text-xs font-semibold sm:text-sm"
          >
            {{ day }}
          </div>
        </div>
        <div
          v-for="(week, w) in weeks"
          :key="w"
          role="row"
          class="mb-1 grid grid-cols-7 gap-1 sm:mb-1.5 sm:gap-1.5"
        >
          <template v-for="(date, d) in week" :key="date ?? `pad-${w}-${d}`">
            <CalendarDayCell
              v-if="date"
              :date="date"
              :schedule="store.byDate[date]"
              :duty-label="
                store.byDate[date]
                  ? legendByCode.get(store.byDate[date].dutyType)
                  : undefined
              "
              :is-today="date === store.today"
              :tabbable="date === activeDate"
            />
            <div v-else role="gridcell" aria-hidden="true" />
          </template>
        </div>
      </div>

      <p
        v-if="isEmptyMonth"
        class="muted mt-2 rounded-md border border-dashed border-paper-line p-3 text-center text-sm"
      >
        No duty is scheduled in {{ monthLabel }}.
      </p>

      <ScheduleLegend :legend="store.legend" />
      <p class="muted mt-3 text-sm">
        Top-right: number of planned flights, or a tick when every flight is
        logged. Ring: today.
      </p>
    </template>
  </section>
</template>
