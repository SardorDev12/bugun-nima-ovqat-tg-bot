export interface TelegramWebAppUser {
  id: number;
  username?: string;
  first_name?: string;
}

async function hmacSha256(key: ArrayBuffer | Uint8Array, message: string): Promise<ArrayBuffer> {
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    key,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return crypto.subtle.sign("HMAC", cryptoKey, new TextEncoder().encode(message));
}

function toHex(buffer: ArrayBuffer): string {
  return [...new Uint8Array(buffer)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

const MAX_INIT_DATA_AGE_SECONDS = 24 * 60 * 60;

/**
 * Validates Telegram Mini App initData per Telegram's documented algorithm
 * (https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app).
 * The client can put anything in initData's fields, so the HMAC signature —
 * keyed off BOT_TOKEN, which only this server knows — is what actually
 * proves the request came from Telegram for this bot.
 */
export async function validateInitData(
  initData: string,
  botToken: string,
): Promise<TelegramWebAppUser | null> {
  const params = new URLSearchParams(initData);
  const hash = params.get("hash");
  if (!hash) return null;
  params.delete("hash");

  const dataCheckString = [...params.entries()]
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");

  const secretKey = await hmacSha256(new TextEncoder().encode("WebAppData"), botToken);
  const computedHash = toHex(await hmacSha256(secretKey, dataCheckString));
  if (computedHash !== hash) return null;

  const authDate = Number(params.get("auth_date"));
  if (!authDate || Date.now() / 1000 - authDate > MAX_INIT_DATA_AGE_SECONDS) return null;

  const userJson = params.get("user");
  if (!userJson) return null;

  try {
    return JSON.parse(userJson) as TelegramWebAppUser;
  } catch {
    return null;
  }
}
