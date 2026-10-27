import { defineStore } from 'pinia';
import type { SchedulesResponse, ScheduleItem } from '~/types';

export const useSchedulesStore = defineStore('schedules', () => {
  const api = useApi();

  const data = ref<SchedulesResponse | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  /** YYYY-MM. Updated immediately on navigation, `data` follows when the response arrives. */
  const currentMonth = ref<string | null>(null);

  let latestRequest = 0;

  const today = computed(() => data.value?.today ?? null);
  const legend = computed(() => data.value?.legend ?? []);
  const byDate = computed<Record<string, ScheduleItem>>(() => {
    const map: Record<string, ScheduleItem> = {};
    for (const item of data.value?.schedules ?? []) {
      // Should the source ever hold two rows for one day, the first (lowest id) wins.
      map[item.dutyDate] ??= item;
    }
    return map;
  });
  /** True once `data` actually belongs to `currentMonth` (false while a month switch is loading). */
  const isCurrent = computed(() => data.value !== null && data.value.month === currentMonth.value);

  async function fetchSchedules(month?: string): Promise<void> {
    const requestId = ++latestRequest;
    if (month) currentMonth.value = month;
    loading.value = true;
    error.value = null;
    try {
      const response = await api.get<SchedulesResponse>('/schedules', { month });
      if (requestId !== latestRequest) return; // a newer navigation superseded this response
      data.value = response;
      currentMonth.value = response.month;
    } catch (e) {
      if (requestId !== latestRequest) return;
      error.value = e instanceof Error ? e.message : 'Failed to load schedule';
    } finally {
      if (requestId === latestRequest) loading.value = false;
    }
  }

  const retry = (): Promise<void> => fetchSchedules(currentMonth.value ?? undefined);
  const goToPrevMonth = (): Promise<void> | undefined =>
    currentMonth.value ? fetchSchedules(shiftMonth(currentMonth.value, -1)) : undefined;
  const goToNextMonth = (): Promise<void> | undefined =>
    currentMonth.value ? fetchSchedules(shiftMonth(currentMonth.value, 1)) : undefined;
  const goToToday = (): Promise<void> =>
    // Without a month the API answers with the month of its own "today".
    fetchSchedules(today.value ? today.value.slice(0, 7) : undefined);

  return {
    data, loading, error, currentMonth, today, legend, byDate, isCurrent,
    fetchSchedules, retry, goToPrevMonth, goToNextMonth, goToToday,
  };
});
