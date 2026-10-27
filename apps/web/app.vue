<script setup lang="ts">
const auth = useAuthStore();
</script>

<template>
  <div>
    <NuxtPage />
    <BottomNav v-if="auth.isAuthenticated" />
  </div>
</template>
