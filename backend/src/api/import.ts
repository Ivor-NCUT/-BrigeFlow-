/**
 * [INPUT]: 依赖 csv-parse 解析 CSV，依赖 db 进行数据持久化
 * [OUTPUT]: 对外提供 createImportHandler 工厂函数，生成 Hono 路由处理函数
 * [POS]: backend/src/api/import.ts，处理人脉数据批量导入的核心业务逻辑
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { Context } from "hono";
import { parse } from "csv-parse/sync";
import { eq, and } from "drizzle-orm";
import * as tables from "../db/schema";

// Helper to get user ID
const getUserId = (c: Context) => {
  const user = c.get('user');
  if (!user) throw new Error("User not authenticated");
  return user.id;
};

// Helper to generate a random color
const getRandomColor = () => {
  const colors = [
    "#EF4444", "#F97316", "#F59E0B", "#84CC16", "#10B981",
    "#06B6D4", "#3B82F6", "#6366F1", "#8B5CF6", "#EC4899",
    "#F43F5E", "#D946EF", "#A855F7", "#64748B", "#78716C"
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

export const createImportHandler = (db: any) => async (c: Context) => {
  const userId = getUserId(c);
  console.log('[IMPORT] Starting import for userId:', userId);

  // ── Parse body ────────────────────────────────────────────
  let csvContent = "";
  const contentType = c.req.header("Content-Type") || "";

  if (contentType.includes("multipart/form-data")) {
    const body = await c.req.parseBody();
    const file = body['file'];
    if (file instanceof File) {
      csvContent = await file.text();
    } else if (typeof file === 'string') {
        csvContent = file;
    } else {
       return c.json({ error: "No file uploaded" }, 400);
    }
  } else {
    csvContent = await c.req.text();
  }

  if (!csvContent) {
    return c.json({ error: "Empty content" }, 400);
  }

  // ── Parse CSV ─────────────────────────────────────────────
  let records: any[] = [];
  try {
    records = parse(csvContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        bom: true
    });
  } catch (e) {
      return c.json({ error: "Invalid CSV format", details: String(e) }, 400);
  }

  console.log('[IMPORT] Parsed', records.length, 'rows. Columns:', records[0] ? Object.keys(records[0]) : 'none');

  // ── DB connectivity pre-check ─────────────────────────────
  try {
    await db.select().from(tables.contacts).limit(1);
  } catch (e: any) {
    console.error('[IMPORT] DB connectivity check failed:', e);
    return c.json({ error: "Database connection failed", details: e.message }, 500);
  }

  const results = {
    total: records.length,
    created: 0,
    updated: 0,
    errors: 0,
    firstError: "",
  };

  // Process each record
  for (const row of records) {
    try {
      // Map fields from template
      const name = row['姓名'] || row['姓名 & 昵称']; // Support old and new template
      if (!name) continue;

      const title = row['职位'] || "";
      const company = row['公司'] || "";
      const industry = row['行业'] || "";
      const roleTags = row['职位标签'] ? row['职位标签'].split(/[,，]/).map((t: string) => t.trim()).filter(Boolean) : [];
      const skillTags = row['专业技能'] ? row['专业技能'].split(/[,，]/).map((t: string) => t.trim()).filter(Boolean) : [];
      const channel = row['第一次认识渠道'];
      const location = row['所在城市'] || row['现在 Base 地'];
      const bonjourLink = row['Bonjour名片链接'] || "";
      const notes = row['备注'] || "";
      const lastContactedAtRaw = row['最近联系时间'];
      const interactionCount = parseInt(row['互动次数'] || "0", 10);
      const createdAtRaw = row['创建时间']; // Keep support for old format if needed

      // Date parsing
      const parseDate = (dateStr: string) => {
          if (!dateStr) return new Date().toISOString();
          const date = new Date(dateStr);
          return isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
      };

      const lastContactedAt = parseDate(lastContactedAtRaw);
      // If createdAt is provided in CSV, use it, otherwise default to now for new contacts
      // For existing contacts, we usually keep original createdAt unless explicitly updated?
      // Let's assume we don't update createdAt for existing contacts.

      // 1. Find or Create Contact
      let contactId = "";
      const existingContact = await db.select().from(tables.contacts)
        .where(and(eq(tables.contacts.name, name), eq(tables.contacts.userId, userId)))
        .limit(1);

      const contactData = {
        company,
        bonjourLink,
        notes,
        lastContactedAt,
        interactionCount: isNaN(interactionCount) ? 0 : interactionCount,
      };

      if (existingContact.length > 0) {
        // Update
        contactId = existingContact[0].id;
        await db.update(tables.contacts)
          .set(contactData)
          .where(eq(tables.contacts.id, contactId));
        results.updated++;
      } else {
        // Create
        const [newContact] = await db.insert(tables.contacts).values({
          id: crypto.randomUUID(),
          userId: userId,
          name: name,
          createdAt: parseDate(createdAtRaw), // Use parsed date or now
          avatar: "",
          // shareVisible: false, // Omitted to avoid SQLite/PG boolean type mismatch in dev
          sensitiveNotes: "",
          ...contactData
        }).returning();
        contactId = newContact.id;
        results.created++;
      }

      // 2. Handle Tags
      const tagsToLink: { label: string, category: string }[] = [];

      if (industry) tagsToLink.push({ label: industry, category: 'industry' });
      if (location) tagsToLink.push({ label: location, category: 'location' });
      if (channel) tagsToLink.push({ label: channel, category: 'relationship' });
      
      roleTags.forEach((t: string) => tagsToLink.push({ label: t, category: 'role' }));
      skillTags.forEach((t: string) => tagsToLink.push({ label: t, category: 'skill' }));

      for (const tagInfo of tagsToLink) {
        // Find or Create Tag
        let tagId = "";
        const existingTag = await db.select().from(tables.tags)
          .where(and(
            eq(tables.tags.label, tagInfo.label),
            eq(tables.tags.category, tagInfo.category),
            eq(tables.tags.userId, userId)
          ))
          .limit(1);

        if (existingTag.length > 0) {
          tagId = existingTag[0].id;
        } else {
          const [newTag] = await db.insert(tables.tags).values({
            id: crypto.randomUUID(),
            userId: userId,
            label: tagInfo.label,
            category: tagInfo.category,
            color: getRandomColor()
          }).returning();
          tagId = newTag.id;
        }

        // Link Tag to Contact (if not exists)
        const existingLink = await db.select().from(tables.contactTags)
          .where(and(eq(tables.contactTags.contactId, contactId), eq(tables.contactTags.tagId, tagId)))
          .limit(1);
        
        if (existingLink.length === 0) {
          await db.insert(tables.contactTags).values({
            contactId: contactId,
            tagId: tagId
          });
        }
      }

    } catch (e: any) {
      console.error("[IMPORT] Error processing row:", row['姓名'] || 'unknown', e.message);
      results.errors++;
      if (!results.firstError) results.firstError = e.message;
    }
  }

  console.log('[IMPORT] Results:', results);

  // If ALL rows failed, return 500 — something is fundamentally wrong
  if (results.errors === results.total && results.total > 0) {
    return c.json({
      error: "All rows failed to import",
      details: results.firstError,
      ...results,
    }, 500);
  }

  return c.json(results);
};
