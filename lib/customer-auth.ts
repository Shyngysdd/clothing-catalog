import { SignJWT, jwtVerify } from "jose";

export const CUSTOMER_SESSION_COOKIE = "customer_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7;

function getSessionSecret() {
  const secret = process.env.CUSTOMER_SESSION_SECRET ?? process.env.ADMIN_SESSION_SECRET;
  if (!secret) throw new Error("CUSTOMER_SESSION_SECRET is not configured");
  return new TextEncoder().encode(secret);
}

export async function createCustomerSessionToken(customerId: string) {
  return new SignJWT({ customerId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(getSessionSecret());
}

export async function getCustomerIdFromSession(token: string | undefined) {
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSessionSecret());
    return typeof payload.customerId === "string" ? payload.customerId : null;
  } catch {
    return null;
  }
}

export async function isValidCustomerSession(token: string | undefined) {
  return (await getCustomerIdFromSession(token)) !== null;
}

export const customerSessionMaxAge = SESSION_DURATION_SECONDS;
