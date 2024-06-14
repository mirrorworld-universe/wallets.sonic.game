<template>
  <nav
    class="flex justify-between items-center px-4 py-3 sticky top-0 left-0 right-0 shadow"
  >
    <MoleculeLogo class="h-12" />

    <ClientOnly>
      <DropdownMenu v-if="connected">
        <DropdownMenuTrigger as-child>
          <Button class="rounded-full gap-1" variant="outline">
            <img
              v-if="wallet"
              :src="wallet.icon"
              class="h-4 w-4"
              :alt="wallet.name"
            />
            <span>{{ shortAddress }}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="bottom" align="end">
          <DropdownMenuItem
            class="flex items-center justify-start gap-1 px-3 py-2"
            @click="disconnect"
          >
            <span>Disconnect</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Button
        v-else
        variant="outline"
        class="rounded-full"
        @click="openConnectDialog"
        >Connect Wallet</Button
      >
    </ClientOnly>
  </nav>
  <LazyMoleculeConnectWalletDialog />
</template>

<script setup lang="ts">
import { mitt } from "~/lib/events";
import { _useWalletsStore, pinia } from "~/stores/wallets";
const { shortAddress, wallet, connected, disconnect } = _useWalletsStore(pinia);

function openConnectDialog() {
  mitt.emit("connect-wallet:open");
}
</script>
