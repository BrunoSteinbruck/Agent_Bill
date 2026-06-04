/**
 * Crossmint — non-custodial wallet infrastructure.
 *
 * The user owns their wallet. Bill reads the wallet (address, balance) to give
 * funding context but never moves funds. Free tier: 1,000 monthly active
 * wallets.
 *
 * Implemented over the REST API with fetch to keep the dependency surface small.
 * Docs: https://docs.crossmint.com/wallets
 *
 * NOTE: Crossmint versions its API by date in the path. Bump `API_VERSION` here
 * if you migrate to a newer revision — it's the only place that needs to change.
 */

import { serverEnv } from "../env";

const API_VERSION = "2025-06-09";

function baseUrl(): string {
  return serverEnv.crossmintEnvironment === "production"
    ? "https://www.crossmint.com"
    : "https://staging.crossmint.com";
}

async function crossmintFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(`${baseUrl()}${path}`, {
    // Financial data must always be fresh — never serve a cached balance.
    cache: "no-store",
    ...init,
    headers: {
      "X-API-KEY": serverEnv.crossmintApiKey,
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(
      `Crossmint ${init?.method ?? "GET"} ${path} failed: ${res.status} ${body}`,
    );
  }

  return res.json() as Promise<T>;
}

export interface CrossmintWallet {
  /** Stable locator used for subsequent calls (often the address or a handle). */
  id: string;
  address: string;
  chain: string;
}

/**
 * Create a wallet for a user. `linkedUser` ties the wallet to your user so it
 * survives across sessions, e.g. `email:user@example.com` or `userId:<uuid>`.
 */
export async function createWallet(params: {
  linkedUser: string;
  chain?: string;
}): Promise<CrossmintWallet> {
  const chain = params.chain ?? "polygon";
  const data = await crossmintFetch<{
    address: string;
    chainType?: string;
  }>(`/api/${API_VERSION}/wallets`, {
    method: "POST",
    body: JSON.stringify({
      type: "smart",
      chainType: "evm",
      linkedUser: params.linkedUser,
    }),
  });

  return { id: data.address, address: data.address, chain };
}

export interface WalletBalance {
  token: string;
  amount: string; // decimal string, e.g. "125.40"
  chain: string;
}

/** Read token balances for a wallet. Defaults to USDC. */
export async function getWalletBalances(
  walletLocator: string,
  tokens: string[] = ["usdc"],
): Promise<WalletBalance[]> {
  const query = new URLSearchParams({ tokens: tokens.join(",") });
  const data = await crossmintFetch<
    Array<{ token: string; amount: string; chain: string }>
  >(`/api/${API_VERSION}/wallets/${encodeURIComponent(walletLocator)}/balances?${query}`);

  return data.map((b) => ({ token: b.token, amount: b.amount, chain: b.chain }));
}
