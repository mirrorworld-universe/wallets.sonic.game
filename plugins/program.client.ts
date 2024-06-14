import { Connection, PublicKey } from "@solana/web3.js";
import { program } from "~/lib/program/core";

const connection = new Connection("https://devnet.sonic.game", {
  wsEndpoint: "wss://devnet.sonic.game",
});

export default defineNuxtPlugin({
  name: "program-plugin",
  enforce: "post",
  setup({ app }) {
    return {
      provide: {
        program,
        connection,
      },
    };
  },
});
