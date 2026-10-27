<script setup lang="ts">
const auth = useAuthStore();

const username = ref("johndoe");
const password = ref("");

async function onSubmit(): Promise<void> {
  if (await auth.login(username.value, password.value)) {
    await navigateTo("/");
  }
}
</script>

<template>
  <div
    class="flex min-h-dvh flex-col items-center justify-center bg-paper px-4"
  >
    <div class="w-full max-w-sm">
      <div class="mb-8 text-center">
        <div
          class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-ink text-white"
        >
          <span class="font-display text-2xl font-bold">SA</span>
        </div>
        <h1 class="font-display text-2xl font-bold tracking-tight text-ink">
          Susi Air Pilot
        </h1>
        <p class="mt-1 text-sm text-ink-soft">
          Sign in to view your schedule and flight hours
        </p>
      </div>

      <form class="panel space-y-4" @submit.prevent="onSubmit">
        <label class="block">
          <span class="mb-1 block text-sm font-medium text-ink">Username</span>
          <input
            v-model="username"
            type="text"
            name="username"
            autocomplete="username"
            required
            class="w-full rounded-xl border border-paper-line bg-white px-3 py-2.5 text-ink outline-none focus:border-chart"
          />
        </label>
        <label class="block">
          <span class="mb-1 block text-sm font-medium text-ink">Password</span>
          <input
            v-model="password"
            type="password"
            name="password"
            autocomplete="current-password"
            required
            class="w-full rounded-xl border border-paper-line bg-white px-3 py-2.5 text-ink outline-none focus:border-chart"
          />
        </label>

        <p
          v-if="auth.loginError"
          role="alert"
          class="rounded-xl bg-danger/10 px-3 py-2 text-sm text-brand"
        >
          {{ auth.loginError }}
        </p>

        <button
          type="submit"
          :disabled="auth.loggingIn"
          class="w-full rounded-full bg-ink px-4 py-3 font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
        >
          {{ auth.loggingIn ? "Signing in…" : "Sign in" }}
        </button>
      </form>
    </div>
  </div>
</template>
