import { defineStore } from 'pinia';
import type { ChartRange, FlightHoursChartResponse, FlightHoursSummaryResponse } from '~/types';

export const useFlightHoursStore = defineStore('flightHours', () => {
  const api = useApi();

  // Summary (pilot, totals, gauges)
  const data = ref<FlightHoursSummaryResponse | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Chart series for the selected range
  const range = ref<ChartRange>('1w');
  const chartData = ref<FlightHoursChartResponse | null>(null);
  const chartLoading = ref(false);
  const chartError = ref<string | null>(null);

  let latestChartRequest = 0;

  const hasPartialPoints = computed(() => chartData.value?.series.some((p) => p.partial) ?? false);

  async function fetchSummary(): Promise<void> {
    loading.value = true;
    error.value = null;
    try {
      data.value = await api.get<FlightHoursSummaryResponse>('/flight-hours/summary');
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load flight hours';
    } finally {
      loading.value = false;
    }
  }

  async function fetchChart(): Promise<void> {
    const requestId = ++latestChartRequest;
    chartLoading.value = true;
    chartError.value = null;
    try {
      const response = await api.get<FlightHoursChartResponse>('/flight-hours/chart', { range: range.value });
      if (requestId !== latestChartRequest) return; // user already picked another range
      chartData.value = response;
    } catch (e) {
      if (requestId !== latestChartRequest) return;
      chartError.value = e instanceof Error ? e.message : 'Failed to load chart';
    } finally {
      if (requestId === latestChartRequest) chartLoading.value = false;
    }
  }

  /** Changes the range and refetches the series automatically. */
  async function setRange(next: ChartRange): Promise<void> {
    range.value = next;
    await fetchChart();
  }

  return {
    data, loading, error, range, chartData, chartLoading, chartError, hasPartialPoints,
    fetchSummary, fetchChart, setRange,
  };
});
