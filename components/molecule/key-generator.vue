<template>
  <div class="flex justify-center items-center gap-2">
    <div
      class="font-mono bg-slate-100 border-slate-300 rounded-sm text-sm px-2 py-1 text-zinc-700 h-full"
    >
      {{ truncatedPublicKey }}
    </div>
    <Button @click="generateKey"> Generate Key </Button>
  </div>
</template>

<script setup lang="ts">
import { Button } from "../ui/button";

const { publicKey, generateKey } = useGenerateKey();

const truncatedPublicKey = computed(() => {
  if (!publicKey.value) return "null";

  return (
    publicKey.value.toBase58().slice(0, 5) +
    "..." +
    publicKey.value.toBase58().slice(-5)
  );
});

onMounted(generateKey);
</script>
