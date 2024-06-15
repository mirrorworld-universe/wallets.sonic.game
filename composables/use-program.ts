import {
  PublicKey,
  SendTransactionError,
  SystemProgram,
} from "@solana/web3.js";
import { toast } from "vue-sonner";
import Success from "~/components/molecule/toast/success.vue";
import { GREETER_PROGRAM_ID } from "~/lib/program/core";
import { program } from "~/lib/program/core";
import {
  confirmTransaction,
  sendLegacyTransaction,
  wait,
} from "~/lib/transaction";
import { useWalletsStore, type WalletAdapter } from "~/stores/wallets";
import { useProgramEvents } from "./use-program-events";

export type GreetingAccountType = {
  counter: number;
  authority: PublicKey;
};

export function useProgram() {
  useProgramEvents();
  const { connection } = useConnection();
  const { wallet, connected } = useWalletsStore();

  const greeterAccountPDA = computed(() =>
    !connected
      ? undefined
      : PublicKey.findProgramAddressSync(
          [wallet?.publicKey?.toBuffer()!],
          GREETER_PROGRAM_ID
        )
  );
  const greeterAccountAddress = computed(() => greeterAccountPDA.value?.[0]);

  const greeterAccountBump = computed(() => greeterAccountPDA.value?.[1]);
  const isGreeterAccountInitialized = computed(() => !!greeterAccountPDA.value);

  const _isInitialized = ref(false);
  const isInitialized = computed({
    get() {
      return _isInitialized.value;
    },
    set(value: boolean) {
      _isInitialized.value = value;
    },
  });

  watch(
    greeterAccountAddress,
    async () => {
      const isInitialized = await isGreetingAccountInitialized(
        greeterAccountAddress.value!
      );
      if (isInitialized) {
        _isInitialized.value = true;
      } else {
        _isInitialized.value = false;
      }
    },
    {
      immediate: true,
    }
  );

  async function isGreetingAccountInitialized(
    greeterAccountAddress: PublicKey
  ) {
    try {
      if (!greeterAccountAddress) {
        return toast.info("Connect your Backpack wallet to get started! 🎒");
      }
      const accountInfo = await connection.value.getAccountInfo(
        greeterAccountAddress
      );
      return accountInfo !== null;
    } catch (error) {
      const message = new Error(error as string).message;
      if (JSON.stringify(message).includes("no data")) {
        toast.info("Initialize your greeting account to get started! 👍🏽");
      } else toast.error(message);
    }
  }

  function createInitializeGreeterAccountTransaction(authority: PublicKey) {
    console.log("greeterAccountPDA.value", greeterAccountPDA.value);

    return program.methods
      .initialize(authority)
      .accounts({
        greetingAccount: greeterAccountAddress.value!,
        user: wallet!.publicKey!,
        systemProgram: SystemProgram.programId,
      })
      .transaction();
  }

  function toExplorerUrl(txid: string) {
    return `https://explorer.sonic.game/tx/${txid}?cluster=devnet`;
  }

  async function initializeGreeterAccount(authority: PublicKey) {
    try {
      const tx = await createInitializeGreeterAccountTransaction(authority);

      const { blockhash } = await connection.value.getLatestBlockhash();
      tx.recentBlockhash = blockhash;
      tx.feePayer = wallet!.publicKey!;

      const { txid, slot } = await sendLegacyTransaction(
        connection.value,
        wallet! as WalletAdapter,
        tx
      );
      const result = await confirmTransaction(
        connection.value,
        txid!,
        "confirmed"
      );
      toast.custom(Success, {
        componentProps: {
          title: "Greeting Account initialized",
          description: `<a href="${toExplorerUrl(
            txid!
          )}" target="_blank">View in explorer</a>`,
        },
      });
    } catch (error) {
      console.error(error);
      if (error instanceof SendTransactionError) {
        const message = await error.getLogs(connection.value);
        toast.error(message);
      } else {
        toast.error((error as Error)?.message);
      }
    }
  }

  const _greetingAccount = ref<GreetingAccountType>();
  const greetingAccount = computed(() => _greetingAccount.value);

  async function fetchCounterIncrementValue(notify?: boolean) {
    if (!wallet?.publicKey || !greeterAccountAddress.value) {
      toast.info("Connect your Backpack wallet to get started! 🎒");
      return;
    }
    const initialized = await isGreetingAccountInitialized(
      greeterAccountAddress.value
    );
    if (!initialized) {
      toast.info("Initialize your greeting account to get started! 👍🏽");
      return;
    }

    try {
      const result = await program.account.greetingAccount?.fetch?.(
        greeterAccountAddress.value?.toBase58?.()
      );

      _greetingAccount.value = result;
      if (notify) {
        toast.success(
          `🎉 You have greeted ${greetingAccount.value?.counter} times!`
        );
      }
    } catch (error) {
      console.error(error);
      if (error instanceof SendTransactionError) {
        const message = await error.getLogs(connection.value);
        toast.error(message);
      } else {
        toast.error((error as Error)?.message);
      }
    }
  }

  watch(
    () => program?.account,
    (newVal) => {
      if (newVal) {
        fetchCounterIncrementValue();
      }
    },
    { immediate: true }
  );

  async function incrementGreeter() {
    try {
      const tx = await program.methods
        .incrementGreeting(greeterAccountBump.value!)
        .accounts({
          greetingAccount: greeterAccountAddress.value!,
          user: wallet!.publicKey!,
        })
        .transaction();
      const { blockhash } = await connection.value.getLatestBlockhash();
      tx.recentBlockhash = blockhash;
      tx.feePayer = wallet!.publicKey!;

      const toastId = toast.loading("Waiting for signature approval ...", {
        dismissible: false,
      });

      const { txid, latency } = await sendLegacyTransaction(
        connection.value,
        wallet! as WalletAdapter,
        tx,
        undefined,
        () => {
          toast.loading(`Sending transaction ...`, {
            dismissible: false,
            id: toastId,
          });
        }
      );

      toast.success(
        `Transaction sent in ${parseFloat(`${latency}`).toFixed(3)}s`,
        { id: toastId }
      );

      confirmTransaction(connection.value, txid!, "finalized").then(
        async (result) => {
          toast.success("Transaction finalized!", {
            dismissible: false,
            duration: 60000,
            id: toastId,
          });
          await wait(500);
          toast.info("Reading latest greeting status ✨", {
            id: toastId,
            duration: 60000,
            dismissible: false,
          });

          await fetchCounterIncrementValue();

          toast.success(
            `🎉 You have greeted ${greetingAccount.value?.counter} times!`,
            {
              id: toastId,
            }
          );
        }
      );

      await wait(2000);
      toast.loading("Finalizing ...", {
        dismissible: false,
        duration: 60000,
        id: toastId,
      });
    } catch (error) {
      console.error(error);
      if (error instanceof SendTransactionError) {
        const message = await error.getLogs(connection.value);
        toast.error(message);
      } else {
        toast.error((error as Error)?.message);
      }
    }
  }

  return {
    program,
    isInitialized,
    initializeGreeterAccount,
    isGreeterAccountInitialized,
    greeterAccountAddress,
    greetingAccount,
    incrementGreeter,
  };
}
