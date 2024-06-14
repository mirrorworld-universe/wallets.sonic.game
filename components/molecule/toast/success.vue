<script setup lang="ts">
import { CheckCircledIcon } from "@radix-icons/vue";

defineProps<{ title?: string; description?: string }>();
</script>

<template>
  <div
    class="pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5"
  >
    <div class="p-4">
      <div class="flex items-start">
        <div class="flex-shrink-0">
          <CheckCircledIcon class="h-6 w-6 text-green-400" aria-hidden="true" />
        </div>
        <div class="ml-3 w-0 flex-1 pt-0.5">
          <p v-if="title" class="text-sm font-medium text-gray-900">
            {{ title }}
          </p>
          <p
            v-if="description"
            class="mt-1 text-sm text-gray-500"
            v-html="description"
          ></p>
        </div>
      </div>
    </div>
  </div>
</template>
