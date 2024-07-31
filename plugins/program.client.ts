import { Connection, PublicKey } from "@solana/web3.js";
import { program } from "~/lib/program/core";

const connection = new Connection("https://api.devnet-1.sonic.game/", {
  wsEndpoint: "wss://api.devnet-1.sonic.game/",
});

export default defineNuxtPlugin({
  name: "program-plugin",
  enforce: "post",
  setup({ app }) {
    connection.onLogs("all", (logs, context) => {
      console.log(logs, context);
    });

    return {
      provide: {
        program,
        connection,
      },
    };
  },
});
