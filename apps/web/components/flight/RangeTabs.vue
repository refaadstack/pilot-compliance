<script setup lang="ts">
import type { ChartRange } from "~/types";

const props = defineProps<{ modelValue: ChartRange; disabled?: boolean }>();
const emit = defineEmits<{ "update:modelValue": [range: ChartRange] }>();

const RANGES: { value: ChartRange; label: string; hint: string }[] = [
  { value: "1w", label: "1w", hint: "Last week" },
  { value: "1m", label: "1m", hint: "Last month" },
  { value: "3m", label: "3m", hint: "Last 3 months" },
  { value: "6m", label: "6m", hint: "Last 6 months" },
  { value: "1y", label: "1y", hint: "Last year" },
];

const list = ref<HTMLElement | null>(null);

function onKeydown(event: KeyboardEvent): void {
  const delta =
    event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
  if (!delta) return;
  event.preventDefault();
  const current = RANGES.findIndex((r) => r.value === props.modelValue);
  const next = RANGES[(current + delta + RANGES.length) % RANGES.length];
  emit("update:modelValue", next.value);
  nextTick(() =>
    list.value
      ?.querySelector<HTMLElement>(`[data-range="${next.value}"]`)
      ?.focus(),
  );
}
</script>

<template>
  <div
    ref="list"
    role="tablist"
    aria-label="Chart range"
    class="inline-flex rounded-md border border-paper-line bg-paper p-0.5"
    @keydown="onKeydown"
  >
    <button
      v-for="range in RANGES"
      :key="range.value"
      type="button"
      role="tab"
      :data-range="range.value"
      :aria-selected="modelValue === range.value"
      :aria-label="range.hint"
      :tabindex="modelValue === range.value ? 0 : -1"
      :disabled="disabled"
      class="min-w-[2.75rem] rounded px-3 py-1 text-sm font-semibold transition-colors"
      :class="
        modelValue === range.value
          ? 'bg-ink text-white'
          : 'text-ink-soft hover:bg-paper-line/60'
      "
      @click="emit('update:modelValue', range.value)"
    >
      {{ range.label }}
    </button>
  </div>
</template>
