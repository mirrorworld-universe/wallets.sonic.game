import type { WalletName } from "@solana/wallet-adapter-base";
import {
  BaseMessageSignerWalletAdapter,
  scopePollingDetectionStrategy,
  WalletAccountError,
  WalletConnectionError,
  WalletDisconnectedError,
  WalletNotConnectedError,
  WalletNotReadyError,
  WalletPublicKeyError,
  WalletSignMessageError,
  WalletReadyState,
  WalletSignTransactionError,
} from "@solana/wallet-adapter-base";
import type {
  Transaction,
  TransactionVersion,
  VersionedTransaction,
} from "@solana/web3.js";
import { PublicKey } from "@solana/web3.js";

interface SolanaOKXWallet {
  publicKey: PublicKey;
  connect(): Promise<PublicKey>;
  disconnect(): Promise<void>;
  signTransaction<T extends Transaction | VersionedTransaction>(
    transaction: T
  ): Promise<T>;
  signAllTransactions<T extends Transaction | VersionedTransaction>(
    transactions: T[]
  ): Promise<T[]>;
  signMessage(message: Uint8Array): Promise<{ signature: Uint8Array }>;
  coonnected: boolean;
}

interface OKXWalletWindow extends Window {
  okxwallet?: {
    solana: SolanaOKXWallet;
  };
}

export const OKXWalletName = "OKX Wallet" as WalletName<"OKX Wallet">;

declare const window: OKXWalletWindow;

export class OKXWalletAdapter extends BaseMessageSignerWalletAdapter {
  name = OKXWalletName;
  url = "https://www.okx.com/web3";
  icon =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHgAAAB4CAYAAAA5ZDbSAAAABHNCSVQICAgIfAhkiAAAC6pJREFUeJzt3V1MVGcaB/D/+845M8wwzldpqaxAQYwiaUcYkSWGpjEap25TY7JKt9mL3RC1SZONSbXBK73YbI1pTW/azdq4aa9sNA3bJq7V0MQr2EZkZEt3aiggUAUVZ+YMMF9nOM9eFBpUkA/PAef0/SXnBs485yX/OR8z5+E9DDp59dVXn9U0bUMikfBzzss1TfMwxnwAVhORj4gkxhgBcAPw6bXdHBMBoBARY4wliWiYMaYCiAIYlmX5v5lM5qeNGzd+f/r06WE9NsiW+DorEVmbmpp29fT07FVV9RVJkgpmrqBpGlRVRTabhaqqICJkMhlomgYi0mHouYcxBkmSIEkSAMBiscBms0GWZXDOH1g3m82OyrJ8Zd26defPnDlzgTGWAjC56G0ucn0bEZXu2rXrQDQafYdzDiKCoiiIxWKIxWJIJBKLHYMwhTEGl8uF/Px8eDweuN1uMMagaZpSWlp67PPPP7/AGBsAoC645kJXJKLCN99888+Dg4NHNU1zRaNRDA8PQ1GUJf0xwsLY7XasX78edrsdnPOfKisrT37yySfnGWMjem1Dbm1tbQgGgxfr6urI7/eTw+EgAGJZxsXn85Hf76e6ujoKBoMXWlpa6gFY5wtvvj3YdeTIkd93dHQcHR8frxgZGcHQ0NB8NQUDFRcXo7CwEE6ns3vLli0fnjx58jyA+FzrWx5Ty9XU1PRWV1fXcUVR1vT39+POnTv6j1hYlHg8jkQiAbvd/tzdu3e37tixIx0Khb4DkJ5t/bkCdjU1Nb3V09NzOB6PF/T394tz7VMklUohmUzCbrc7JiYmNm3fvj0zV8izBWx99913/9DV1XU8Ho8X3Lx5E/H4nEcAYYWk02mkUinY7fb88fHxmsbGxlttbW3dALSZ6/GHX9jS0hK4evXqofHx8Wdu3rwp9tynmKIo6O/vx9jY2DMdHR1HW1tbf/vYFxDR88Fg8MLmzZvJ4/Gs+JWjWBa2eL1eqq2tpWAweJGICmdmOvMQLd+6detPAwMDfxkZGcHdu3ch5IZUKgWLxQJZliu++eabSHd391VMfev1yyGaiErD4fCRVColPgrloKGhIUxld5SISqZ/Ph2wpbGx8TVN09aIcHNXT08PNE1bFQwGD2LqSxAOAERkGxwcPJ5MJhGJRFZ0kMLSJRIJxGIxKIryDhFZgalz8NDQ0J779+//sbu7G9lsdmVHKTwRVVVRWFiItra2rlAo9D0HgHA4vJ+IkEwmV3p8whNSFAVEhBs3buwFpg7Rmqb5xZcZ5qEoCiYnJ18BAH7o0KHVsiw/K8695hGNRiFJUsHevXuf5R0dHVUAxI16ExkbGwMARCKRDdxqta4BIL5vNpHpnTWVSvn55OTkSwB+tX1SZqRpP99vkCSpXNI0bfX0DwTz0DQNjDEPB+BV1QX3cAk5QlVVMMZ8EhHJ6fSszQC6qK+vx+HDh7F27dpHWkOfRDabxblz53DixAndas7mxIkT2LlzJyyWxzW/LA7nHLdv38axY8fQ3t6uW92Zpr6wWo2Ghob/VVVVGXYr6/Lly5ROp8kIfX19VFlZaeituIGBAUPGnk6n6YsvvjBs3C+++CI1NDT0cCKyP9FbZR5FRUWwWudt/luSgoICeDweQ2oDQCAQgNfrNaS21WrF2rVrDakN/HzRTEQSZ4zR5OSiG+YXzMgLOCIytL4kSYZ+utDzlPWwdDoNxhhxAG5xkWU+U298NwfgM/JdKqyMqUx9xh0jhKeCCNjkRMAmJwI2ORGwyYmATU4EbHIiYJMTAZucCNjkRMAmJwI2ORGwyYmATU4EbHIi4MdgbKlTeT49DA/YyHYgIsK3335rWH0ju00BLMu/6kpGb+DSpUvw+Xzwer269zf19fUBAKqrqyHLsq61s9ksOjs70dvbi/Lycl33ZsYYRkdHce7cOd1qzsXwgJubm9Hc3IxAIPDLNLpPijGGdDqNUCiEt99+G6+//rputadls1l89dVXqKmpgSRJCAQCutXmnCMWiyEcDutWcy6GBzzt2rVrutesqanB7t27sWPHDt1rT2tra0MoFDL0VGCknL7IkmVZ9z13JkmSdD/0L7ecDniquXulh/FUy+mAhfmJgE1OBGxyImCTEwGbnAjY5ETAJicCNjkRsMmJgE1OBGxyImCTEwGbnAjY5ETAJicCNjkRsMnldMCMMVP0LhsppwPOZDKG9hZns9mcf8zQsnRVVlZWwuPx6Dqv5LVr1xAKhfDll1+CiAxrm+3s7ER1dTVsNptu/V/ZbNaQLtPZLEtf9IEDB1BQUKBrgxwRoa+vDzU1NWhvb9c9YFVVEQqF0NnZqfussIwxRKNRnD17Fs3NzbrWfkRDQwOVl5cbNm9xZ2enIfMtExEpikLV1dWGjV2SJIrFYoaNPxQKGTb28vJyamhoIMPPwUb2LQOAzWYzrHYgEDD0Ik7PWeTnktMXWQBEX/Q8cj5g4fFEwCYnAjY5EbDJiYBNTgRsciJgkxMBm5wI2OREwCYnAjY5EbDJiYBNTgRsciJgk+MAIqIz0XymMo1wAIqRDyoWVsbUDH0KJyJm1CPYAWOfAM4YM7StlXNuaMuOkTvW1NPLGQeQNfKP6O3tRSaTMaR2NBo1tP00FothdHTUkNqZTAa3b982pPY0xlhSIqKIkXvwqVOnsGrVKhQVFem6N09OTuLSpUu61ZtNOBzG6dOnsW/fPl2bBzVNQ29vL06dOqVbzYdZLBYQ0TB7+eWX/5VMJndfvXrVsI0Jy6+2thY2m+0yJ6Jork+ZKzxKlmVwziMS5zwqWk/Nh3MOIhrmmqb1rfRgBH1NXzRbrdYu7nA4ugDAbrev6KAE/bhcLgBAOp2+xV0u1w8A4Ha7V3RQgn6mA964ceP3AIC6urp7VVVVhv0jlFiWd6mqqqL6+vp7wNTNBovFcmU6dSH3uVwucM6vAFMBb9iw4TxjTBymTcBut4MxhvXr158HAAYAROSsr68fUxRlWR7WJBhn06ZNyMvLU9rb23/DGJvgAMAYy7jd7g88Hg8cDsdKj1FYIp/PB7vdjtLS0mOMsdQDvySidVu3bo37/f4Vv0gQy9IWv99PW7duHSKiiulcf7lfxRgbLC4ufi8vLw/FxcUQcktJSQny8vJQWVl5kjE2MOtKRFQYDAYv1tbWktfrXfF3pFgWtng8Htq8eTMFg8ELRPT8zEwfuOPMGLtz+PDhvzmdzh9LS0shPjo9/dxuN8rKyrBq1arugwcP/pUxNjLz94+0FGzfvv0/gUDghNPpvF9WViY+Oj3F3G43XnjhBeTn59+vra39cM+ePY90P8w2zYvW1tbWu23btkwikfDb7fb8VCpl+NOwhcVxuVwoKyuDy+W6V1FR8f5HH330GYDEw+vNNY9P+vr1699t27ZNnZiYqHY6nY5UKoVUKjXH6sJy8nq904fl+xUVFe9/+umnfwcQn23dx03UlL5+/fp3b7zxxu1IJFLudDqfkyQJiqIYM2phQUpKSlBSUgK32/3jli1bjn/88cefYY5wF8ra0tJSHwwGL9TV1ZHf7yefz7fiV46/tsXhcJDf76e6ujrauXPnxdbW1gYA87biLLidkoie379//75wOHxE07Q1yWQSN27cQDKZXGgJYQncbjeKiorg8XjAOR8rLi5+7+zZs/9kjN1ZyOsX2y8rE1FpY2Pja4ODg8c5524iQjweRzQaxcTEBOLxuJh9bokYY8jPz4fL5YLX64XL5QJjDJqmwe12f/D111//gzE2CGDBV7xLbYi2EFFeU1PT73p6evZmMplXZFkumLmCpmlQVRWZTAaTk5MAfp5GV1XVX+0bgDEGzjlsNhsYY5AkCZIkTTfIPbCuqqqjVqv1yrp1686fOXPm34yxDIBFN5jr1vF+6NCh1R0dHVVWq3WNqqovAVgNwEtEMmNsNRHZGWMEwA3Ap9d2c0wEgEJEDECWiCIWi2WYiCKc85imaX0Oh6OLc/7DxYsX7+mxwf8DWkzRZ/gcDpMAAAAASUVORK5CYII=";

  // @ts-ignore this is of no consequence at this time
  readonly supportedTransactionVersions: ReadonlySet<TransactionVersion> =
    new Set(["legacy", 0]);

  private _connected: boolean = false;
  private _connecting: boolean;
  private _publicKey: PublicKey | null;
  private _wallet: SolanaOKXWallet | null;
  private _readyState: WalletReadyState =
    typeof window === "undefined" || typeof document === "undefined"
      ? WalletReadyState.Unsupported
      : WalletReadyState.NotDetected;

  constructor() {
    super();
    this._connecting = false;
    this._publicKey = null;
    this._wallet = null;

    if (this._readyState !== WalletReadyState.Unsupported) {
      scopePollingDetectionStrategy(() => {
        if (window?.okxwallet?.solana) {
          this._readyState = WalletReadyState.Installed;
          this.emit("readyStateChange", this._readyState);
          return true;
        }
        return false;
      });
    }
  }

  get connecting() {
    return this._connecting;
  }

  override get connected() {
    return this._connected;
  }

  get readyState() {
    return this._readyState;
  }

  get publicKey() {
    return this._publicKey;
  }

  async connect(): Promise<void> {
    try {
      if (this.connected || this.connecting) return;
      if (this._readyState !== WalletReadyState.Installed)
        throw new WalletNotReadyError();

      this._connecting = true;

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const wallet = window.okxwallet!.solana;

      try {
        await wallet.connect();
      } catch (error: any) {
        throw new WalletConnectionError(error?.message, error);
      }

      if (wallet.publicKey.toString() === "11111111111111111111111111111111")
        throw new WalletAccountError();

      let publicKey: PublicKey;
      try {
        publicKey = new PublicKey(wallet.publicKey.toBytes());
      } catch (error: any) {
        throw new WalletPublicKeyError(error?.message, error);
      }

      this._wallet = wallet;
      this._publicKey = publicKey;

      this.emit("connect", publicKey);
    } catch (error: any) {
      this.emit("error", error);
      throw error;
    } finally {
      this._connecting = false;
    }
  }

  async disconnect(): Promise<void> {
    const wallet = this._wallet;
    if (wallet) {
      this._wallet = null;
      this._publicKey = null;

      try {
        await wallet.disconnect();
      } catch (error: any) {
        this.emit("error", new WalletDisconnectedError());
      }
    }

    this.emit("disconnect");
  }

  async signTransaction<T extends Transaction | VersionedTransaction>(
    transaction: T
  ): Promise<T> {
    try {
      const wallet = this._wallet;
      if (!wallet) throw new WalletNotConnectedError();

      try {
        return (await wallet.signTransaction(transaction)) as T;
      } catch (error: any) {
        throw new WalletSignTransactionError(error?.message, error);
      }
    } catch (error: any) {
      this.emit("error", error);
      throw error;
    }
  }

  override async signAllTransactions<
    T extends Transaction | VersionedTransaction
  >(transactions: T[]): Promise<T[]> {
    try {
      const wallet = this._wallet;
      if (!wallet) throw new WalletNotConnectedError();

      try {
        return (await wallet.signAllTransactions(transactions)) as T[];
      } catch (error: any) {
        throw new WalletSignTransactionError(error?.message, error);
      }
    } catch (error: any) {
      this.emit("error", error);
      throw error;
    }
  }

  async signMessage(message: Uint8Array): Promise<Uint8Array> {
    try {
      const wallet = this._wallet;
      if (!wallet) throw new WalletNotConnectedError();

      try {
        const { signature } = await wallet.signMessage(message);
        return signature;
      } catch (error: any) {
        throw new WalletSignMessageError(error?.message, error);
      }
    } catch (error: any) {
      this.emit("error", error);
      throw error;
    }
  }
}
