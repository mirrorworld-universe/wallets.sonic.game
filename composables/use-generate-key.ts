import { Keypair, PublicKey } from "@solana/web3.js";

export function useGenerateKey() {
  const keypair = ref<Keypair | null>();
  const publicKey = computed(() => keypair.value?.publicKey);
  const secretKey = computed(() => keypair?.value?.secretKey);

  function generateKey() {
    keypair.value = Keypair.generate();
  }

  return {
    keypair,
    publicKey,
    secretKey,
    generateKey,
  };
}
