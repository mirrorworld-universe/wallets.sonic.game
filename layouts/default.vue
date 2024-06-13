<template>
  <ScrollArea class="h-screen relative w-screen">
    <MoleculeTopNavigation />
    <slot />
  </ScrollArea>
  <Toaster rich-colors position="bottom-right" />
</template>

<script setup lang="ts">
import { Toaster } from "@/components/ui/sonner";
</script>
