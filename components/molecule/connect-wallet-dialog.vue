<script setup lang="ts">
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToggle } from "@vueuse/core";

import { mitt } from "~/lib/events";
import { useWalletsStore, type WalletAdapter } from "~/stores/wallets";

const { authenticateWallet, wallets } = useWalletsStore();

const [open, toggle] = useToggle(false);

function openDialog() {
  if (open.value) return;
  toggle();
}

function closeDialog() {
  if (!open.value) return;
  toggle();
}

function handleOpenChange(value: boolean) {
  if (value) openDialog();
  else closeDialog();
}

mitt.on("connect-wallet:open", openDialog);
mitt.on("connect-wallet:close", closeDialog);

const { $wallets } = useNuxtApp();

watchEffect(() => {
  // console.log($wallets);
  console.log(
    "Wallets:",
    wallets.map((wallet) => wallet.name)
  );
});

const connectingWallet = ref<WalletAdapter>();

async function handleSelectWallet(wallet: WalletAdapter) {
  connectingWallet.value = wallet;
  await authenticateWallet(wallet);
  // setWallet(wallet);
  console.log("Selected wallet", wallet);
  if (wallet.publicKey) {
    console.log("User connected", wallet?.publicKey?.toBase58?.());
    toggle();
  }
  connectingWallet.value = undefined;
}
</script>

<template>
  <Dialog :open="open" @update:open="toggle">
    <DialogContent class="sm:max-w-md border-accent-foreground/40">
      <DialogHeader>
        <DialogTitle>Connect Wallet</DialogTitle>
        <DialogDescription>
          Select your wallet to get started
        </DialogDescription>
      </DialogHeader>

      <div class="mt-4 grid gap-4 sm:grid-cols-2">
        <Button
          v-for="wallet in wallets"
          :key="wallet.name"
          class="flex items-center justify-start gap-3"
          variant="outline"
          @click="handleSelectWallet(wallet)"
        >
          <img :src="wallet.icon" class="h-4 w-4" />
          <span class="text-sm font-semibold flex items-center gap-1">
            <IconsSpinner
              v-if="connectingWallet?.name === wallet.name"
              class="h-4 w-4 animate-spin text-slate-950"
            />
            {{ wallet.name }}
          </span>
        </Button>
      </div>

      <DialogFooter class="sm:justify-start">
        <DialogClose as-child>
          <Button type="button" variant="link" class="w-full"> Close </Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
