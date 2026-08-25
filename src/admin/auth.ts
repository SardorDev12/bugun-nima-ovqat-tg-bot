/**
 * HTTP Basic Auth gate for /admin*. Username is ignored — only the
 * password (checked against the ADMIN_PASSWORD secret) matters.
 */
export function isAuthorized(request: Request, adminPassword: string): boolean {
  const header = request.headers.get("Authorization");
  if (!header?.startsWith("Basic ")) return false;

  let decoded: string;
  try {
    decoded = atob(header.slice("Basic ".length));
  } catch {
    return false;
  }

  const separatorIndex = decoded.indexOf(":");
  if (separatorIndex === -1) return false;
  const password = decoded.slice(separatorIndex + 1);

  return password === adminPassword;
}

export function unauthorizedResponse(): Response {
  return new Response("Authentication required", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Nima ovqat? admin"' },
  });
}
