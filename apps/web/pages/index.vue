<script setup lang="ts">
const documents = useDocumentsStore();
const schedules = useSchedulesStore();
const flight = useFlightHoursStore();

onMounted(() => {
  void Promise.all([
    documents.fetchDocuments(),
    schedules.fetchSchedules(),
    flight.fetchSummary(),
    flight.fetchChart(),
  ]);
});

const asOf = computed(
  () => flight.data?.today ?? documents.data?.today ?? null,
);
const totalHours = computed(() =>
  flight.data
    ? flight.data.pilot.totalFlightHours.toLocaleString("en-US", {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      })
    : null,
);
const auth = useAuthStore();
const router = useRouter();
</script>

<template>
  <div class="mx-auto max-w-7xl px-3 pb-24 pt-4 sm:px-6 sm:pt-6">
    <header class="rounded-lg bg-ink p-5 text-white sm:p-7">
      <div class="flex flex-wrap items-end justify-between gap-x-10 gap-y-5">
        <div class="min-w-0">
          <p class="text-sm text-white/75">
            Pilot compliance
            <span v-if="asOf"> as of {{ formatDate(asOf) }}</span>
          </p>
          <h1
            class="mt-1 font-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl"
          >
            <template v-if="flight.data">{{ flight.data.pilot.name }}</template>
            <span v-else-if="flight.error" class="text-white/70"
              >Pilot unavailable</span
            >
            <SkeletonBlock v-else class="h-10 w-56 !bg-white/20" />
          </h1>
        </div>

        <div class="flex items-center gap-4 text-left sm:text-right">
          <div>
            <p class="text-sm text-white/75">Total flight hours</p>
            <p
              class="font-display text-5xl font-bold leading-none tracking-tight sm:text-6xl"
              :aria-busy="!totalHours"
            >
              <template v-if="totalHours">{{ totalHours }}</template>
              <span
                v-else-if="flight.error"
                class="text-white/70"
                aria-label="Unavailable"
                >&ndash;</span
              >
              <SkeletonBlock
                v-else
                class="mt-1 inline-block h-12 w-40 !bg-white/20"
              />
            </p>
          </div>
          <img
            v-if="flight.data"
            :src="`https://i.pravatar.cc/80?u=${encodeURIComponent(flight.data.pilot.name)}`"
            :alt="`${flight.data.pilot.name} avatar`"
            class="h-12 w-12 rounded-full ring-2 ring-white/40 sm:h-14 sm:w-14"
          />
          <button
            type="button"
            class="rounded-full border border-white/30 px-3 py-1 text-xs font-semibold text-white/90 hover:bg-white/10"
            @click="
              auth.logout();
              router.push('/signin');
            "
          >
            Sign out
          </button>
        </div>
      </div>

      <div
        class="mt-5 flex flex-wrap gap-2 border-t border-white/20 pt-4"
        role="status"
        aria-label="Document summary"
      >
        <template v-if="documents.data">
          <StatusBadge
            tone="danger"
            :label="`${documents.expiredCount} expired`"
          />
          <StatusBadge
            tone="warning"
            :label="`${documents.soonCount} expiring soon`"
          />
          <StatusBadge tone="success" :label="`${documents.safeCount} valid`" />
        </template>
        <template v-else-if="documents.error">
          <span class="text-sm text-white/80"
            >Document summary unavailable</span
          >
        </template>
        <template v-else>
          <SkeletonBlock
            v-for="n in 3"
            :key="n"
            class="h-7 w-28 !rounded-full !bg-white/20"
          />
        </template>
      </div>
    </header>

    <main class="mt-4 grid gap-4 sm:mt-6 sm:gap-6 lg:grid-cols-5">
      <div class="lg:col-span-2">
        <DocumentExpiryList />
      </div>

      <section class="panel lg:col-span-3" aria-labelledby="limits-title">
        <h2 id="limits-title" class="panel-title mb-3">
          Flight time limitations
        </h2>
        <LimitGaugeGrid />
        <div class="mt-5">
          <FlightHoursChart />
        </div>
      </section>

      <div class="lg:col-span-5">
        <ScheduleCalendar />
      </div>
    </main>
  </div>
</template>
