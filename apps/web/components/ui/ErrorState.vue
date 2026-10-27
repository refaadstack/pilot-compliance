<script setup lang="ts">
defineProps<{ message: string; title?: string }>();
defineEmits<{ retry: [] }>();
</script>

<template>
  <div
    role="alert"
    class="flex flex-col items-start gap-3 rounded-md border border-red-300 bg-red-50 p-4 text-red-950"
  >
    <div>
      <p class="font-semibold">{{ title ?? "Could not load this section" }}</p>
      <p class="mt-0.5 text-sm">{{ message }}</p>
    </div>
    <button type="button" class="btn" @click="$emit('retry')">Try again</button>
  </div>
</template>
