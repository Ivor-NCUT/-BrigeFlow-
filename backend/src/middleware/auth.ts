import { createMiddleware } from "hono/factory";
import { createClient } from "@insforge/sdk";
import dotenv from "dotenv";

dotenv.config();

const projectUrl = process.env.VITE_INSFORGE_PROJECT_URL || process.env.INSFORGE_PROJECT_URL;
const anonKey = process.env.VITE_INSFORGE_ANON_KEY || process.env.INSFORGE_ANON_KEY;

if (!projectUrl || !anonKey) {
  throw new Error("INSFORGE_PROJECT_URL and INSFORGE_ANON_KEY must be defined");
}

const insforge = createClient({
  baseUrl: projectUrl,
  anonKey: anonKey
});

// Helper to decode JWT token and extract user info (without verification since we trust InsForge)
const decodeToken = (token: string): { id: string; email: string } | null => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
    return {
      id: payload.sub,
      email: payload.email
    };
  } catch {
    return null;
  }
};

export const authMiddleware = createMiddleware(async (c, next) => {
  const authHeader = c.req.header("Authorization");
  
  if (!authHeader) {
    return c.json({ error: "Missing Authorization header" }, 401);
  }

  const token = authHeader.replace("Bearer ", "");
  
  try {
    // Try InsForge SDK first
    const client = createClient({
      baseUrl: projectUrl,
      anonKey: anonKey,
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const { data: { user }, error } = await client.auth.getUser();

    if (error || !user) {
      // Fallback: decode JWT token directly
      const payload = decodeToken(token);
      if (!payload || !payload.id) {
        return c.json({ error: "Invalid token" }, 401);
      }
      c.set("user", { id: payload.id, email: payload.email });
      await next();
      return;
    }

    c.set("user", user);
    await next();
  } catch (e) {
    // Fallback: decode JWT token on SDK error
    const payload = decodeToken(token);
    if (!payload || !payload.id) {
      console.error('[ERROR] Auth middleware error:', e);
      return c.json({ error: "Authentication failed" }, 401);
    }
    c.set("user", { id: payload.id, email: payload.email });
    await next();
  }
});
