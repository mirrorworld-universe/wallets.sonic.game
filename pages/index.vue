<template>
  <div class="flex flex-col items-center justify-center h-full py-24 gap-8">
    <div class="text-center">
      <h1 class="text-4xl font-bold">
        Sign Transaction Demo | Greeting Program
      </h1>
    </div>
    <div>Connect your wallet to sign a transaction.</div>
    <template v-if="connected">
      <Button size="lg" class="rounded-full"> Sign Transaction </Button>
    </template>
    <template v-else>
      <Button size="lg" class="rounded-full gap-1" @click="openConnectDialog">
        <template v-if="isConnecting">
          <IconsSpinner class="h-4 w-4" />
          <span>Connecting ...</span>
        </template>
        <span v-else>Connect Wallet</span>
      </Button>
    </template>
  </div>
</template>

<script setup lang="ts">
import { mitt } from "~/lib/events";

import { _useWalletsStore, pinia } from "~/stores/wallets";
const { shortAddress, wallet, isConnecting, connected, disconnect } =
  _useWalletsStore(pinia);

function openConnectDialog() {
  mitt.emit("connect-wallet:open");
}
</script>
