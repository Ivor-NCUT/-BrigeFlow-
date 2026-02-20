/**
 * [INPUT]: 依赖 Hono 框架，依赖 db/schema 定义，依赖各个 API 模块
 * [OUTPUT]: 对外提供 createApp 函数，初始化并配置 HTTP 服务器
 * [POS]: backend/src/index.ts，应用入口，路由注册中心
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { Hono } from "hono";
import { cors } from "hono/cors";
import * as tables from "./db/schema";
import { db as postgresDb } from "./db/index";
import { eq, inArray, and, sql } from "drizzle-orm";
import { serveStatic } from '@hono/node-server/serve-static';
import { readFile } from 'fs/promises';
import { join } from 'path';

export async function createApp(authMiddleware?: any, dbOverride?: any): Promise<Hono> {
  const app = new Hono();
  const db = dbOverride || postgresDb;

  // ── Global Error Handler ──────────────────────────────────
  // Catch ALL unhandled exceptions, return structured error
  app.onError((err, c) => {
    console.error(`[ERROR] ${c.req.method} ${c.req.path}:`, err);
    return c.json({
      error: err.message || 'Internal Server Error',
      path: c.req.path,
      ts: Date.now(),
    }, 500);
  });

  app.use('/api/*', cors({
    origin: (origin) => origin,
    credentials: true,
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'x-es-sticky-session-db-bookmark'],
  }));

  if (authMiddleware) {
    app.use('/api/*', async (c, next) => {
      // Exclude public routes, health check, and template download
      if (
        c.req.path.startsWith('/api/shared-pages/public/') ||
        c.req.path === '/api/health' ||
        c.req.path === '/api/contacts/template'
      ) {
        return next();
      }
      return authMiddleware(c, next);
    });
  }

  // Helper to get user ID
  const getUserId = (c: any) => {
    const user = c.get('user');
    if (!user) throw new Error("User not authenticated");
    return user.id;
  };

  // ── Health Check (with DB connectivity test) ──────────────
  app.get('/api/health', async (c) => {
    try {
      await db.execute(sql`SELECT 1`);
      return c.json({ status: 'ok', db: 'connected', ts: Date.now() });
    } catch (e: any) {
      console.error('[HEALTH] DB connection failed:', e);
      return c.json({ status: 'degraded', db: 'disconnected', error: e.message, ts: Date.now() }, 503);
    }
  });

  // GET /api/contacts
  app.get('/api/contacts', async (c) => {
    const userId = getUserId(c);
    console.log('[GET /api/contacts] userId:', userId);

    const contacts = await db.select().from(tables.contacts).where(eq(tables.contacts.userId, userId));
    const tags = await db.select().from(tables.tags).where(eq(tables.tags.userId, userId));

    const contactsWithDetails = await Promise.all(contacts.map(async (contact) => {
      const contactTagsList = await db
        .select()
        .from(tables.contactTags)
        .where(eq(tables.contactTags.contactId, contact.id));

      const tagIds = contactTagsList.map(ct => ct.tagId);
      const myTags = tags.filter(t => tagIds.includes(t.id));

      const records = await db
        .select()
        .from(tables.communicationRecords)
        .where(eq(tables.communicationRecords.contactId, contact.id));

      return {
        ...contact,
        tags: myTags,
        communicationRecords: records,
        connections: [],
        connectionType: {},
      };
    }));

    return c.json(contactsWithDetails);
  });

  // POST /api/contacts
  app.post('/api/contacts', async (c) => {
    const userId = getUserId(c);
    const body = await c.req.json();
    const { tags, ...contactData } = body;
    
    const [newContact] = await db.insert(tables.contacts).values({
      ...contactData,
      id: contactData.id || crypto.randomUUID(),
      userId: userId,
    }).returning();
    
    if (tags && tags.length > 0) {
      for (const tag of tags) {
        const existingTag = await db.select().from(tables.tags)
          .where(and(eq(tables.tags.id, tag.id), eq(tables.tags.userId, userId)))
          .limit(1);
        
        let tagId = tag.id;
        if (existingTag.length === 0) {
          const [newTag] = await db.insert(tables.tags).values({
            id: tag.id,
            userId: userId,
            label: tag.label,
            category: tag.category,
            color: tag.color,
          }).returning();
          tagId = newTag.id;
        }
        
        await db.insert(tables.contactTags).values({
          contactId: newContact.id,
          tagId: tagId,
        }).onConflictDoNothing();
      }
    }
    
    return c.json(newContact);
  });

  // GET /api/relationships
  app.get('/api/relationships', async (c) => {
    const userId = getUserId(c);
    const relationships = await db.select().from(tables.relationships).where(eq(tables.relationships.userId, userId));
    return c.json(relationships);
  });

  // POST /api/relationships
  app.post('/api/relationships', async (c) => {
    const userId = getUserId(c);
    const body = await c.req.json();
    
    const [newRelationship] = await db.insert(tables.relationships).values({
      ...body,
      id: body.id || crypto.randomUUID(),
      userId: userId,
    }).returning();
    
    return c.json(newRelationship);
  });

  // PUT /api/relationships/:id
  app.put('/api/relationships/:id', async (c) => {
    const userId = getUserId(c);
    const id = c.req.param('id');
    const body = await c.req.json();
    
    const [updated] = await db.update(tables.relationships)
      .set(body)
      .where(and(eq(tables.relationships.id, id), eq(tables.relationships.userId, userId)))
      .returning();
      
    if (!updated) {
      return c.json({ error: "Relationship not found or unauthorized" }, 404);
    }
    
    return c.json(updated);
  });

  // DELETE /api/relationships/:id
  app.delete('/api/relationships/:id', async (c) => {
    const userId = getUserId(c);
    const id = c.req.param('id');
    
    await db.delete(tables.relationships).where(and(eq(tables.relationships.id, id), eq(tables.relationships.userId, userId)));
    
    return c.json({ success: true });
  });

  // PUT /api/contacts/:id
  app.put('/api/contacts/:id', async (c) => {
    const userId = getUserId(c);
    const id = c.req.param('id');
    const body = await c.req.json();
    const { tags, ...updates } = body;
    
    const [updated] = await db.update(tables.contacts)
      .set(updates)
      .where(and(eq(tables.contacts.id, id), eq(tables.contacts.userId, userId)))
      .returning();

    if (!updated) {
      return c.json({ error: "Contact not found or unauthorized" }, 404);
    }
      
    if (tags && tags.length > 0) {
      await db.delete(tables.contactTags).where(eq(tables.contactTags.contactId, id));
      
      for (const tag of tags) {
        const existingTag = await db.select().from(tables.tags)
          .where(and(eq(tables.tags.id, tag.id), eq(tables.tags.userId, userId)))
          .limit(1);
        
        let tagId = tag.id;
        if (existingTag.length === 0) {
          const [newTag] = await db.insert(tables.tags).values({
            id: tag.id,
            userId: userId,
            label: tag.label,
            category: tag.category,
            color: tag.color,
          }).returning();
          tagId = newTag.id;
        }
        
        await db.insert(tables.contactTags).values({
          contactId: id,
          tagId: tagId,
        }).onConflictDoNothing();
      }
    }
    
    return c.json(updated);
  });

  // DELETE /api/contacts
  app.delete('/api/contacts', async (c) => {
    const userId = getUserId(c);
    const { ids } = await c.req.json();
    
    // Verify these contacts belong to user
    const userContacts = await db.select({ id: tables.contacts.id }).from(tables.contacts)
        .where(and(inArray(tables.contacts.id, ids), eq(tables.contacts.userId, userId)));
    
    const validIds = userContacts.map(c => c.id);

    if (validIds.length > 0) {
        await db.delete(tables.contacts).where(inArray(tables.contacts.id, validIds));
        await db.delete(tables.contactTags).where(inArray(tables.contactTags.contactId, validIds));
        await db.delete(tables.communicationRecords).where(inArray(tables.communicationRecords.contactId, validIds));
    }
    
    return c.json({ success: true, deletedCount: validIds.length });
  });

  // GET /api/tags
  app.get('/api/tags', async (c) => {
    const userId = getUserId(c);
    const tags = await db.select().from(tables.tags).where(eq(tables.tags.userId, userId));
    return c.json(tags);
  });

  // POST /api/tags
  app.post('/api/tags', async (c) => {
    const userId = getUserId(c);
    const body = await c.req.json();
    const [newTag] = await db.insert(tables.tags).values({
      ...body,
      id: body.id || crypto.randomUUID(),
      userId: userId
    }).returning();
    return c.json(newTag);
  });

  // POST /api/communication_records
  app.post('/api/communication_records', async (c) => {
    const userId = getUserId(c);
    const body = await c.req.json();
    
    // Verify contact belongs to user
    const contact = await db.select().from(tables.contacts).where(and(eq(tables.contacts.id, body.contactId), eq(tables.contacts.userId, userId))).limit(1);
    
    if (contact.length === 0) {
        return c.json({ error: "Contact not found or unauthorized" }, 403);
    }

    const [record] = await db.insert(tables.communicationRecords).values({
      ...body,
      id: crypto.randomUUID()
    }).returning();
    return c.json(record);
  });

  // POST /api/contacts/import
  try {
    const { createImportHandler } = await import('./api/import');
    app.post('/api/contacts/import', createImportHandler(db));
  } catch (e) {
    console.error('[WARN] Import handler failed to load:', e);
  }

  // GET /api/contacts/template
  try {
    const { downloadTemplateHandler } = await import('./api/template');
    app.get('/api/contacts/template', downloadTemplateHandler);
  } catch (e) {
    console.error('[WARN] Template handler failed to load:', e);
  }

  // GET /api/contacts/export
  try {
    const { createExportHandler } = await import('./api/export');
    app.get('/api/contacts/export', createExportHandler(db));
  } catch (e) {
    console.error('[WARN] Export handler failed to load (xlsx missing?):', e);
  }

  // --- Shared Pages API ---

  // GET /api/shared-pages
  app.get('/api/shared-pages', async (c) => {
    const userId = getUserId(c);
    const pages = await db.select().from(tables.sharedPages).where(eq(tables.sharedPages.userId, userId));
    return c.json(pages);
  });

  // POST /api/shared-pages
  app.post('/api/shared-pages', async (c) => {
    const userId = getUserId(c);
    const body = await c.req.json();
    
    // Check if slug exists
    const existing = await db.select().from(tables.sharedPages).where(eq(tables.sharedPages.slug, body.slug));
    if (existing.length > 0) {
      return c.json({ error: "Slug already exists" }, 409);
    }

    const [newPage] = await db.insert(tables.sharedPages).values({
      ...body,
      id: body.id || crypto.randomUUID(),
      userId: userId,
      config: JSON.stringify(body.config) // Ensure config is stored as string
    }).returning();
    
    return c.json(newPage);
  });

  // GET /api/shared-pages/:slug (Public)
  app.get('/api/shared-pages/public/:slug', async (c) => {
    const slug = c.req.param('slug');
    const pages = await db.select().from(tables.sharedPages).where(eq(tables.sharedPages.slug, slug));
    
    if (pages.length === 0) {
      return c.json({ error: "Page not found" }, 404);
    }
    
    // Parse config back to object
    const page = pages[0];
    let config: any = {};
    try {
        // @ts-ignore
        config = typeof page.config === 'string' ? JSON.parse(page.config) : page.config;
    } catch (e) {
        console.error("Failed to parse config", e);
    }
    
    const contactIds = config.selectedContacts || [];
    
    // Fetch contacts if any
    let contactsList: any[] = [];
    if (contactIds.length > 0) {
        // Use inArray to fetch contacts
        const contacts = await db.select().from(tables.contacts).where(inArray(tables.contacts.id, contactIds));
        
        // Fetch tags for these contacts
        const allTags = await db.select().from(tables.tags).where(eq(tables.tags.userId, page.userId)); // Assuming tags are user-scoped
        
        // Join tags
        contactsList = await Promise.all(contacts.map(async (contact) => {
             const contactTagsList = await db
                .select()
                .from(tables.contactTags)
                .where(eq(tables.contactTags.contactId, contact.id));
                
             const tagIds = contactTagsList.map(ct => ct.tagId);
             const myTags = allTags.filter(t => tagIds.includes(t.id));
             
             // Filter sensitive fields for public view
             const { sensitiveNotes, notes, ...publicContact } = contact;
             
             return {
                 ...publicContact,
                 notes: config.showNotes ? notes : undefined, // Respect showNotes setting
                 tags: myTags,
                 connections: [], // TODO: relationships if showConnections is true
             };
        }));
    }

    return c.json({ 
        ...page, 
        config,
        contacts: contactsList 
    });
  });

  // DELETE /api/shared-pages/:id
  app.delete('/api/shared-pages/:id', async (c) => {
    const userId = getUserId(c);
    const id = c.req.param('id');
    
    await db.delete(tables.sharedPages).where(and(eq(tables.sharedPages.id, id), eq(tables.sharedPages.userId, userId)));
    
    return c.json({ success: true });
  });

  // ── Static Files & SPA Fallback (MUST be after all API routes) ──
  app.use('/*', serveStatic({
    root: './dist',
    rewriteRequestPath: (path) => path === '/' ? '/index.html' : path
  }));

  app.get('*', async (c) => {
    if (c.req.path.startsWith('/api')) {
      return c.notFound();
    }
    try {
      const indexHtml = await readFile(join(process.cwd(), 'dist', 'index.html'), 'utf-8');
      return c.html(indexHtml);
    } catch (e) {
      return c.text('Frontend not found. Did you run `npm run build`?', 404);
    }
  });

  return app;
}
