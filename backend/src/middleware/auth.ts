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

export const authMiddleware = createMiddleware(async (c, next) => {
  const authHeader = c.req.header("Authorization");
  
  if (!authHeader) {
    return c.json({ error: "Missing Authorization header" }, 401);
  }

  const token = authHeader.replace("Bearer ", "");
  
  // Use getUser() to verify the token. 
  // We need to pass the token to the client.
  // Note: Insforge SDK's createClient doesn't accept a token per request in a stateless way easily
  // without creating a new client or using global headers.
  // A common pattern is to create a new client for the request.
  
  const client = createClient({
    baseUrl: projectUrl,
    anonKey: anonKey,
    headers: {
        Authorization: `Bearer ${token}`
    }
  });

  const { data: { user }, error } = await client.auth.getUser();

  if (error || !user) {
    return c.json({ error: "Invalid token" }, 401);
  }

  c.set("user", user);
  await next();
});
