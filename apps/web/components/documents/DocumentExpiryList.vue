<script setup lang="ts">
const store = useDocumentsStore();
</script>

<template>
  <section
    class="panel"
    aria-labelledby="documents-title"
    :aria-busy="store.loading"
  >
    <div class="mb-3 flex items-baseline justify-between gap-3">
      <h2 id="documents-title" class="panel-title">Document validity</h2>
      <p v-if="store.data" class="muted text-sm">
        Warning at {{ store.data.thresholds.warningDays }} days
      </p>
    </div>

    <ErrorState
      v-if="store.error"
      :message="store.error"
      @retry="store.fetchDocuments()"
    />

    <div
      v-else-if="store.loading && !store.data"
      class="space-y-2.5"
      role="status"
      aria-label="Loading documents"
    >
      <SkeletonBlock v-for="n in 5" :key="n" class="h-[74px]" />
    </div>

    <p
      v-else-if="store.sortedDocuments.length === 0"
      class="muted rounded-md border border-dashed border-paper-line p-6 text-center text-sm"
    >
      No documents are being tracked yet.
    </p>

    <ul v-else class="space-y-2.5">
      <li v-for="doc in store.sortedDocuments" :key="doc.id">
        <DocumentCard :document="doc" />
      </li>
    </ul>
  </section>
</template>
