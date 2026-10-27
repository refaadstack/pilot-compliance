import { defineStore } from 'pinia';
import type { LoginResponse } from '~/types';

const TOKEN_KEY = 'pilot-token';

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(null);
  const loggingIn = ref(false);
  const loginError = ref<string | null>(null);

  // Client-only SPA: localStorage is safe here (guarded for SSR/prerender anyway).
  if (import.meta.client) {
    token.value = window.localStorage.getItem(TOKEN_KEY);
  }

  function setToken(next: string | null): void {
    token.value = next;
    if (import.meta.client) {
      if (next) window.localStorage.setItem(TOKEN_KEY, next);
      else window.localStorage.removeItem(TOKEN_KEY);
    }
  }

  async function login(username: string, password: string): Promise<boolean> {
    loggingIn.value = true;
    loginError.value = null;
    try {
      const api = useApi();
      const response = await api.post<LoginResponse>('/auth/login', { username, password });
      setToken(response.token);
      return true;
    } catch (e) {
      loginError.value = e instanceof Error ? e.message : 'Sign in failed';
      return false;
    } finally {
      loggingIn.value = false;
    }
  }

  function logout(): void {
    setToken(null);
  }

  const isAuthenticated = computed(() => token.value !== null);

  return { token, loggingIn, loginError, isAuthenticated, login, logout, setToken };
});
