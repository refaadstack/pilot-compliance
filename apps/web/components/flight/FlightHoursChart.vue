<script setup lang="ts">
import {
  Chart as ChartJS,
  CategoryScale,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  type ChartData,
  type ChartOptions,
} from "chart.js";
import { Line } from "vue-chartjs";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
);

const store = useFlightHoursStore();

const chart = computed(() => store.chartData);
const series = computed(() => chart.value?.series ?? []);

// Light theme only — colours come straight from the brand tokens.
const palette = {
  line: "#22C5E8",
  fill: "rgba(34, 197, 232, 0.14)",
  limit: "#E63757",
  grid: "rgba(14, 33, 56, 0.1)",
  text: "#6B7280",
  surface: "#FFFFFF",
} as const;

const chartData = computed<ChartData<"line">>(() => {
  const c = chart.value;
  if (!c) return { labels: [], datasets: [] };
  return {
    labels: c.series.map((p) => formatShortDate(p.date)),
    datasets: [
      {
        label: `Flight hours, rolling ${c.windowDays} days`,
        data: c.series.map((p) => p.hours),
        borderColor: palette.line,
        backgroundColor: palette.fill,
        fill: true,
        tension: 0.25,
        borderWidth: 2.5,
        pointRadius: 4,
        pointHoverRadius: 6,
        // Hollow marker = window reaches before the first record (understated total)
        pointBackgroundColor: c.series.map((p) =>
          p.partial ? palette.surface : palette.line,
        ),
        pointBorderColor: palette.line,
        pointBorderWidth: 2,
      },
      {
        label: `Limit ${c.limit} h`,
        data: c.series.map(() => c.limit),
        borderColor: palette.limit,
        borderDash: [8, 5],
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 0,
        fill: false,
      },
    ],
  };
});

const options = computed<ChartOptions<"line">>(() => ({
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: "index", intersect: false },
  scales: {
    y: {
      min: 0,
      max: chart.value?.max ?? undefined,
      grid: { color: palette.grid },
      ticks: { color: palette.text },
      title: { display: true, text: "Hours", color: palette.text },
    },
    x: {
      grid: { display: false },
      ticks: {
        color: palette.text,
        maxRotation: 0,
        autoSkip: true,
        maxTicksLimit: 8,
      },
    },
  },
  plugins: {
    legend: {
      position: "bottom",
      labels: { color: palette.text, usePointStyle: true, boxWidth: 10 },
    },
    tooltip: {
      filter: (item) => item.datasetIndex === 0, // the limit line is explained by the legend
      callbacks: {
        title: (items) => {
          const point = series.value[items[0]?.dataIndex ?? -1];
          return point ? formatDate(point.date) : "";
        },
        label: (item) => formatHours(item.parsed.y ?? 0),
        afterLabel: (item) =>
          series.value[item.dataIndex]?.partial
            ? "Incomplete data: window starts before the first record"
            : "",
      },
    },
  },
}));

const rangeModel = computed({
  get: () => store.range,
  set: (value) => void store.setRange(value),
});
</script>

<template>
  <section aria-labelledby="chart-title" :aria-busy="store.chartLoading">
    <div class="mb-3 flex flex-wrap items-center justify-between gap-3">
      <h3 id="chart-title" class="panel-title">Flight hours vs. limit</h3>
      <RangeTabs v-model="rangeModel" />
    </div>

    <ErrorState
      v-if="store.chartError"
      :message="store.chartError"
      @retry="store.fetchChart()"
    />

    <SkeletonBlock
      v-else-if="!chart"
      class="h-72"
      role="status"
      aria-label="Loading chart"
    />

    <p
      v-else-if="series.length === 0"
      class="muted rounded-md border border-dashed border-paper-line p-8 text-center text-sm"
    >
      No flight hours recorded for this period.
    </p>

    <template v-else>
      <div
        class="relative h-72 transition-opacity"
        :class="{ 'opacity-50': store.chartLoading }"
      >
        <Line
          :data="chartData"
          :options="options"
          aria-label="Rolling flight hours against the limit"
          role="img"
        />
      </div>
      <p v-if="store.hasPartialPoints" class="muted mt-2 text-sm">
        Hollow points: the rolling window starts before the first flight record,
        so those totals are understated.
      </p>

      <!-- Text alternative for screen readers -->
      <table class="sr-only">
        <caption>
          Rolling
          {{
            chart.windowDays
          }}-day flight hours, limit
          {{
            chart.limit
          }}
          hours
        </caption>
        <thead>
          <tr>
            <th scope="col">Date</th>
            <th scope="col">Hours</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in series" :key="p.date">
            <td>{{ formatDate(p.date) }}</td>
            <td>{{ formatHours(p.hours) }}</td>
          </tr>
        </tbody>
      </table>
    </template>
  </section>
</template>
