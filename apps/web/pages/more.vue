<script setup lang="ts">
const auth = useAuthStore();
</script>

<template>
  <div class="mx-auto max-w-md px-3 pb-24 pt-4">
    <h1 class="font-display text-2xl font-bold tracking-tight text-ink">
      More
    </h1>
    <p class="muted mt-1 text-sm">Settings and account</p>
    <button
      type="button"
      class="mt-6 w-full rounded-full bg-danger px-4 py-3 font-semibold text-white hover:opacity-90"
      @click="
        auth.logout();
        navigateTo('/signin');
      "
    >
      Sign out
    </button>
  </div>
</template>
