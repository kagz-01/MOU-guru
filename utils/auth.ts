// utils/auth.ts
import { create, verify } from "https://deno.land/x/djwt@v2.8/mod.ts";
import { getUserByEmail, User } from "../db/models/user.ts";
import { compare, hash } from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";

// This should be set as an environment variable in production
const JWT_SECRET = Deno.env.get("JWT_SECRET") || "your-secret-key";

export async function hashPassword(password: string): Promise<string> {
  return await hash(password);
}

export async function comparePassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return await compare(password, hash);
}

export async function createJWT(user: User): Promise<string> {
  const payload = {
    iss: "mou-app",
    sub: user.user_id.toString(),
    name: user.full_name,
    email: user.email,
    role: user.role,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // 24 hours
  };
  const key = await getSigningKey();
  return await create({ alg: "HS512", typ: "JWT" }, payload, key);
}

async function getSigningKey(): Promise<CryptoKey> {
  const enc = new TextEncoder().encode(JWT_SECRET);
  return await crypto.subtle.importKey(
    "raw",
    enc,
    { name: "HMAC", hash: "SHA-512" },
    false,
    ["sign", "verify"],
  );
}

export interface JWTPayload {
  iss?: string;
  sub: string;
  name?: string;
  email?: string;
  role?: string;
  exp?: number;
  [key: string]: unknown;
}

export async function verifyJWT(token: string): Promise<JWTPayload | null> {
  try {
    const key = await getSigningKey();
    const payload = (await verify(token, key as CryptoKey)) as Record<
      string,
      unknown
    >;
    // Map to JWTPayload; callers still need to check for presence of required fields
    return payload as JWTPayload;
  } catch (err) {
    console.error("JWT verification failed:", err);
    return null;
  }
}

export async function authenticateUser(
  email: string,
  password: string,
): Promise<User | null> {
  const user = await getUserByEmail(email);
  if (!user || !user.password_hash) return null;

  const valid = await comparePassword(password, user.password_hash);
  if (!valid) return null;

  return user;
}
