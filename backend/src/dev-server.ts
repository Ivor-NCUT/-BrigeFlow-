import { serve } from "@hono/node-server";
import { createApp } from "./index";
import { db } from "./db/index";
import type { Client, User } from "./__generated__/server-types";

// 3. Mock EdgeSpark Client
const MOCK_USER: User = {
  id: "2b482888-207d-4827-9758-a9ae2bc31e65", // Kobe's User ID
  email: "kobe179008@gmail.com",
  name: "Kobe",
  image: null,
  emailVerified: true,
  isAnonymous: false,
  createdAt: new Date(),
};

const mockEdgespark = {
  db: db,
  auth: {
    user: MOCK_USER,
    isAuthenticated: () => true,
  },
  storage: {
    toS3Uri: () => "",
    fromS3Uri: () => ({ bucket: { bucket_name: "", description: "" }, path: "" }),
    from: () => ({
      put: async () => ({ success: true }),
      get: async () => null,
      head: async () => null,
      list: async () => ({ objects: [], hasMore: false, delimitedPrefixes: [] }),
      delete: async () => ({ success: true }),
      createPresignedPutUrl: async () => ({ uploadUrl: "", path: "", expiresAt: new Date() }),
      createPresignedGetUrl: async () => ({ downloadUrl: "", path: "", expiresAt: new Date() }),
    }),
  },
  secret: {
    get: () => null,
  },
  getDeployEnv: () => "staging",
  ctx: {
    runInBackground: (p: Promise<unknown>) => { p.catch(console.error); },
  },
} as unknown as Client<any>;

// 4. Start Server
async function start() {
  console.log("Starting local backend server (connected to Supabase)...");
  const mockAuthMiddleware = async (c: any, next: any) => {
    c.set('user', MOCK_USER);
    await next();
  };
  // Pass db explicitly, though createApp defaults to it if undefined
  const app = await createApp(mockAuthMiddleware, db);
  
  // Mock EdgeSpark System Routes
  app.get('/api/_es/auth/config', (c) => {
    return c.json({
      methods: ['email'],
      is_enabled: true,
      anonymous_enabled: true
    });
  });

  app.get('/api/_es/auth/get-session', (c) => {
    return c.json({
      user: MOCK_USER,
      session: {
        id: "dev-session-id",
        expires_at: new Date(Date.now() + 86400000).toISOString()
      }
    });
  });

  app.post('/api/_es/auth/logout', (c) => {
    return c.json({ success: true });
  });

  const port = 3001;
  serve({
    fetch: app.fetch,
    port,
  }, (info) => {
    console.log(`Local backend running at http://localhost:${info.port}`);
  });
}

start();
