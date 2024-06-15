import { program } from "~/lib/program/core";
import { useWalletsStore } from "~/stores/wallets";

type BlockEventCallback = (event: MessageEvent<any>) => void;

const eventsListeners = new Map<number, BlockEventCallback>();

let listenerId = 0;

export function useProgramEvents() {
  const { connection } = useConnection();
  const { wallet, connected } = useWalletsStore();

  function onBlockEvent(event: any) {
    const id = ++listenerId;
    eventsListeners.set(id, event);
  }

  function invokeAllBlockListeners(_event: MessageEvent<any>) {
    for (const [id, event] of eventsListeners) {
      event?.(_event);
    }
  }

  function monitorProgramEvents() {
    const ws = new WebSocket("wss://devnet.sonic.game");

    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          jsonrpc: "2.0",
          id: "1",
          method: "blockSubscribe",
          params: [
            {
              mentionsAccountOrProgram: program.programId.toBase58(),
            },
            {
              commitment: "confirmed",
              encoding: "base64",
              showRewards: true,
              transactionDetails: "full",
            },
          ],
        })
      );
    };

    ws.onmessage = (event: MessageEvent<any>) => {
      const data = JSON.parse(event.data);
      console.log(data);
      invokeAllBlockListeners(data);
    };

    return ws;
  }

  const ws = ref<WebSocket>();
  onMounted(() => {
    ws.value = monitorProgramEvents();
  });

  onBeforeUnmount(() => {
    if (ws.value) {
      ws.value.close();
    }
  });

  return {
    onBlockEvent,
  };
}
