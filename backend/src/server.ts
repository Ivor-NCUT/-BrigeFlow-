import { serve } from "@hono/node-server";
import { createApp } from "./index";
import { authMiddleware } from "./middleware/auth";
import { config } from "dotenv";
import { join } from "path";

// Load environment variables from .env file
// When running from root with `tsx backend/src/server.ts`, cwd is root.
config({ path: join(process.cwd(), '.env') });

async function start() {
  console.log("Starting backend server with Supabase...");
  
  const app = await createApp(authMiddleware);
  
  // Apply Auth Middleware to all /api routes
  // Note: If there are public routes, exclude them.
  // Currently all routes in index.ts seem to require user (getUserId calls c.get('user')).
  // app.use('/api/*', authMiddleware);
  
  const port = Number(process.env.PORT) || 3001;
  serve({
    fetch: app.fetch,
    port,
  }, (info) => {
    console.log(`Backend running at http://localhost:${info.port}`);
  });
}

start();
