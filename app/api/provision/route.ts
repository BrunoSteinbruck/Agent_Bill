/**
 * POST /api/provision — ensure the signed-in user has a wallet + card.
 *
 * Idempotent: safe to call on every signup and again later as a backstop (in
 * case the signup-time provisioning was interrupted). The work
 * itself runs with the admin client, but we authenticate the *caller* first and
 * only ever provision their own user id — never a id taken from the request
 * body — so this endpoint can't be used to provision someone else.
 */

import { getAuthUser } from "../../../lib/supabase/auth";
import { json, serverError, unauthorized } from "../../../lib/api/http";
import { ensureUserProvisioned } from "../../../lib/provisioning/provision";

export const runtime = "nodejs";

export async function POST(): Promise<Response> {
  const { user } = await getAuthUser();
  if (!user) return unauthorized();

  try {
    const result = await ensureUserProvisioned(user.id, user.email ?? user.id);
    return json({
      provisioned: true,
      created: result.created,
      card: { last_four: result.card.last_four, status: result.card.status },
      wallet: { address: result.wallet.address, chain: result.wallet.chain },
    });
  } catch (err) {
    return serverError(
      err instanceof Error ? err.message : "Provisioning failed.",
    );
  }
}
