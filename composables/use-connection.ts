export function useConnection() {
  const connection = computed(() => useNuxtApp().$connection);
  return {
    connection,
  };
}
