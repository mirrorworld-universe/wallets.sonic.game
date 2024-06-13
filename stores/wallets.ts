import * as walletAdapters from "@solana/wallet-adapter-wallets";
import {
  PhantomWalletAdapter,
  NightlyWalletAdapter,
  // @ts-ignore
  // BackpackWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { useStorage } from "@vueuse/core";
import { truncateMiddle } from "~/lib/string";
import { createPinia, defineStore } from "pinia";
import { wait } from "~/lib/timers";
import { toast } from "vue-sonner";

export const pinia = createPinia();

export type WalletAdapter = PhantomWalletAdapter | NightlyWalletAdapter;

export interface WalletState {
  wallet: WalletAdapter | null;
  wallets: WalletAdapter[];
  lastConnectedWalletName?: WalletAdapter["name"];
  identityToken?: string;
}

export const walletStorage = useStorage<Omit<WalletState, "wallets">>(
  "wallet",
  {
    wallet: null,
  }
);

export const _useWalletsStore = defineStore("wallet-store", () => {
  const { $wallets } = useNuxtApp();

  const _wallet = ref<WalletAdapter | null>(null);
  const _wallets = ref<WalletAdapter[]>([]);
  const lastConnectedWalletName = ref<WalletAdapter["name"] | undefined>(
    undefined
  );

  const isConnecting = ref(false);
  const isDisconnecting = ref(false);

  watch(
    () => $wallets,
    (value) => {
      console.debug("wallets changed ----", value);
      _wallets.value = value;
    },
    {
      immediate: true,
    }
  );

  const wallets = computed(() => _wallets.value);
  const wallet = computed(() => _wallet.value);
  const publicKey = computed(() => wallet.value?.publicKey);

  const shortAddress = computed(() => {
    return (
      !!wallet.value &&
      !!wallet.value.publicKey &&
      truncateMiddle(wallet.value.publicKey.toBase58(), 8)
    );
  });
  const isWalletConnected = computed(() => !!wallet.value);

  const connected = computed(() => {
    return !!isWalletConnected.value;
  });

  const auth_token = computed(() => {
    return walletStorage.value.identityToken;
  });

  const setWallet = (value: WalletAdapter | null) => {
    _wallet.value = value;
    console.info("setting wallet", _wallet.value);
  };

  const setWallets = (value: WalletAdapter[]) => {
    _wallets.value = value;
    console.info("setting wallets", _wallets.value);
  };

  async function connectWallet(wallet: WalletAdapter) {
    isConnecting.value = true;
    await wallet.connect();
    await wait(300);
    setWallet(wallet);
    _wallet.value = wallet;
    walletStorage.value.lastConnectedWalletName = wallet.name;
    isConnecting.value = false;
  }

  const authenticateWallet = async (wallet: WalletAdapter) => {
    try {
      await connectWallet(wallet);
      await wait(100);
      toast.success(`Wallet connected! ${shortAddress.value}`);
      location.reload();
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  // toast.error('Event has not been created')

  const disconnect = async () => {
    try {
      isDisconnecting.value = true;
      if (!_wallet.value) return;
      await _wallet.value.disconnect();

      walletStorage.value.identityToken = undefined;

      setWallet(null);
      walletStorage.value.lastConnectedWalletName = undefined;

      location.reload();
      isDisconnecting.value = false;
      toast.success(`Wallet disconnected!`);
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  return {
    _wallet,
    wallet,
    wallets,
    isWalletConnected,
    lastConnectedWalletName,
    setWallet,
    setWallets,
    connectWallet,
    authenticateWallet,
    disconnect,
    shortAddress,
    connected,
    publicKey,
    auth_token,
    isConnecting,
    isDisconnecting,
  };
});

export function useWalletsStore() {
  return _useWalletsStore(pinia);
}
