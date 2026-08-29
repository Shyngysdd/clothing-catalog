import { SignJWT, jwtVerify } from "jose";

export const ADMIN_SESSION_COOKIE = "admin_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7;

function getSessionSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) throw new Error("ADMIN_SESSION_SECRET is not configured");
  return new TextEncoder().encode(secret);
}

export async function createAdminSessionToken() {
  return new SignJWT({ scope: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(getSessionSecret());
}

export async function isValidAdminSession(token: string | undefined) {
  if (!token) return false;
  try {
    return (await jwtVerify(token, getSessionSecret())).payload.scope === "admin";
  } catch {
    return false;
  }
}

export const adminSessionMaxAge = SESSION_DURATION_SECONDS;
