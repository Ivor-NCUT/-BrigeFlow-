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
import { eq, inArray, and } from "drizzle-orm";

export async function createApp(authMiddleware?: any, dbOverride?: any): Promise<Hono> {
  const app = new Hono();
  const db = dbOverride || postgresDb;

  app.use('/api/*', cors({
    origin: (origin) => origin,
    credentials: true,
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'x-es-sticky-session-db-bookmark'],
  }));

  if (authMiddleware) {
    app.use('/api/*', authMiddleware);
  }

  // Helper to get user ID
  const getUserId = (c: any) => {
    const user = c.get('user');
    if (!user) throw new Error("User not authenticated");
    return user.id;
  };

  // GET /api/contacts
  app.get('/api/contacts', async (c) => {
    const userId = getUserId(c);
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
      await Promise.all(tags.map((tag: any) => 
        db.insert(tables.contactTags).values({
          contactId: newContact.id,
          tagId: tag.id
        })
      ));
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
      
    if (tags) {
      await db.delete(tables.contactTags).where(eq(tables.contactTags.contactId, id));
      if (tags.length > 0) {
        await Promise.all(tags.map((tag: any) => 
          db.insert(tables.contactTags).values({
            contactId: id,
            tagId: tag.id
          })
        ));
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
  const { createImportHandler } = await import('./api/import');
  app.post('/api/contacts/import', createImportHandler(db));

  // GET /api/contacts/template
  const { downloadTemplateHandler } = await import('./api/template');
  app.get('/api/contacts/template', downloadTemplateHandler);

  return app;
}
