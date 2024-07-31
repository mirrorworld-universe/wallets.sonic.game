import * as anchor from "@coral-xyz/anchor";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import type { SonicGreeter } from "./idl";
import { IDL } from "./idl";

const { AnchorProvider, BN, Program, Wallet } = anchor;

const wallet = Keypair.generate() as unknown as anchor.Wallet;
export const connection = new Connection("https://api.devnet-1.sonic.game/", {
  wsEndpoint: "wss://api.devnet-1.sonic.game/",
});

// export const connection = new Connection("https://api.testnet.sonic.game", {
//   wsEndpoint: "wss://api.testnet.sonic.game",
// });

const provider = new AnchorProvider(
  connection,
  wallet,
  AnchorProvider.defaultOptions()
);
export const GREETER_PROGRAM_ID = new PublicKey(
  "9z3jFa5NEyK6atxNUvNTT3U1dNhXXcWGzxabmd2ExQWd"
  // "Ahjbw6bRZbLNuafKrDBmMoLHvgvM1TUHHLCcPcMoZaGi"
);
export const program: anchor.Program<SonicGreeter> = new anchor.Program(
  IDL,
  GREETER_PROGRAM_ID,
  provider
);

// connection.
