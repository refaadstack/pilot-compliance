import { defineStore } from 'pinia';
import type { DocumentsResponse } from '~/types';

export const useDocumentsStore = defineStore('documents', () => {
  const api = useApi();

  const data = ref<DocumentsResponse | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Counts and ordering are computed by the API; the store only exposes them.
  const expiredCount = computed(() => data.value?.summary.expired ?? 0);
  const soonCount = computed(() => data.value?.summary.soon ?? 0);
  const safeCount = computed(() => data.value?.summary.safe ?? 0);
  const sortedDocuments = computed(() => data.value?.documents ?? []);

  async function fetchDocuments(): Promise<void> {
    loading.value = true;
    error.value = null;
    try {
      data.value = await api.get<DocumentsResponse>('/documents');
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load documents';
    } finally {
      loading.value = false;
    }
  }

  return { data, loading, error, expiredCount, soonCount, safeCount, sortedDocuments, fetchDocuments };
});
