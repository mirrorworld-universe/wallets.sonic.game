import {
  PhantomWalletAdapter,
  NightlyWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { BackpackWalletAdapter } from "~/lib/backpack";
import { _useWalletsStore, walletStorage } from "~/stores/wallets";
import { pinia } from "~/stores/wallets";

export default defineNuxtPlugin({
  name: "wallets-plugin",
  enforce: "post",
  async setup({ vueApp }) {
    vueApp.use(pinia);

    const { $subscribe, connectWallet, connected, setWallet, setWallets } =
      _useWalletsStore(pinia);
    const wallets = [new BackpackWalletAdapter()];

    setWallets(wallets);

    $subscribe((_, state) => {
      walletStorage.value.lastConnectedWalletName = state?._wallet?.name;
    });

    const lastConnectedWalletName = walletStorage.value.lastConnectedWalletName;

    if (lastConnectedWalletName && !connected) {
      const wallet = wallets.find(
        (wallet) => wallet.name === lastConnectedWalletName
      );
      if (wallet) {
        console.debug("Auto connecting previously connected wallet", wallet);
        await connectWallet(wallet);
        setWallet(wallet);
      }
    }

    return {
      provide: {
        wallets,
      },
    };
  },
});
