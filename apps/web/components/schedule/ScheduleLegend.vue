<script setup lang="ts">
import type { LegendItem } from "~/types";

defineProps<{ legend: LegendItem[] }>();
</script>

<template>
  <ul class="mt-4 flex flex-wrap gap-x-4 gap-y-2" aria-label="Duty type legend">
    <li
      v-for="item in legend"
      :key="item.code"
      class="flex items-center gap-1.5 text-sm"
    >
      <span
        class="h-4 w-4 shrink-0 rounded border border-black/20"
        :style="{ backgroundColor: item.color }"
        aria-hidden="true"
      />
      <span class="font-semibold">{{ item.code }}</span>
      <span class="muted">{{ item.label }}</span>
    </li>
  </ul>
</template>
