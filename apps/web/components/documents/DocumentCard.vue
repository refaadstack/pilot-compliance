<script setup lang="ts">
import type { DocumentItem } from "~/types";

const props = defineProps<{ document: DocumentItem }>();

const accent: Record<DocumentItem["status"], string> = {
  expired: "border-l-danger",
  soon: "border-l-warning",
  safe: "border-l-success",
};
const emphasis: Record<DocumentItem["status"], string> = {
  expired: "text-danger",
  soon: "text-amber-700",
  safe: "text-emerald-700",
};

const expiry = computed(() => describeExpiry(props.document.daysRemaining));
</script>

<template>
  <article
    class="flex items-start justify-between gap-3 rounded-md border border-l-4 border-paper-line bg-white p-3.5"
    :class="accent[document.status]"
  >
    <div class="min-w-0 flex-1">
      <h3 class="font-medium leading-snug">{{ document.label }}</h3>
      <p class="muted mt-0.5 text-sm">
        Expires {{ formatDate(document.expiryDate) }}
      </p>
    </div>
    <div class="flex shrink-0 flex-col items-end gap-1.5 text-right">
      <StatusBadge
        :tone="documentTone[document.status]"
        :label="documentLabel[document.status]"
      />
      <p
        class="font-display text-lg font-semibold leading-none"
        :class="emphasis[document.status]"
      >
        {{ expiry }}
      </p>
    </div>
  </article>
</template>
