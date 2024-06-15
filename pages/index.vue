<template>
  <div class="flex flex-col items-center justify-center h-full py-24 gap-8">
    <div class="text-center">
      <h1 class="text-4xl font-bold">
        Sign Transaction Demo | Greeting Program
      </h1>
    </div>
    <template v-if="greetingAccount">
      You have greeted {{ greetingAccount.counter }} times. Greet again to
      increment! 😀
    </template>
    <template v-else>
      <div>Connect your wallet to sign a transaction.</div>
    </template>
    <template v-if="connected">
      <template v-if="isInitialized">
        <Button size="lg" class="rounded-full" @click="incrementGreeter">
          Increment Greet Counter
        </Button>
      </template>
      <template v-else>
        <Button size="lg" class="rounded-full" @click="createGreeterAccount">
          Initialize Greeter
        </Button>
      </template>
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
const { wallet, isConnecting, connected } = _useWalletsStore(pinia);

function openConnectDialog() {
  mitt.emit("connect-wallet:open");
}

const {
  isInitialized,
  initializeGreeterAccount,
  greetingAccount,
  incrementGreeter,
} = useProgram();

function createGreeterAccount() {
  initializeGreeterAccount(wallet!.publicKey!);
}
</script>
