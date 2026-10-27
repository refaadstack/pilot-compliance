export default defineNuxtRouteMiddleware((to) => {
  const auth = useAuthStore();
  if (to.path === '/signin') {
    // Already signed in: skip the form.
    if (auth.isAuthenticated) return navigateTo('/');
    return;
  }
  if (!auth.isAuthenticated) return navigateTo('/signin');
});
