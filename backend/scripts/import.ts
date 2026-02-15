
import fs from 'fs';
import { parse } from 'csv-parse';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const CSV_PATH = "/Users/fanhan/Desktop/Code/缘脉BridgeFlow/泛函的人脉表格.csv";
const API_URL = "http://localhost:3001/api/contacts";

async function main() {
  console.log("Reading CSV...");
  const fileContent = fs.readFileSync(CSV_PATH, 'utf-8');
  
  const records: any[] = [];
  const parser = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    bom: true
  });

  parser.on('readable', function(){
    let record;
    while ((record = parser.read()) !== null) {
      records.push(record);
    }
  });

  parser.on('error', function(err){
    console.error(err.message);
  });

  await new Promise((resolve) => {
      parser.on('end', resolve);
      parser.write(fileContent);
      parser.end();
  });

  console.log(`Parsed ${records.length} records.`);

  // Process and Insert via API
  for (const record of records) {
    // CSV Headers: 姓名 & 昵称,公司,现在 Base 地,职业标签,第一次认识渠道,创建时间
    const name = record['姓名 & 昵称'];
    const company = record['公司'];
    const location = record['现在 Base 地'];
    const tagsStr = record['职业标签']; // "Tag1, Tag2"
    const channel = record['第一次认识渠道'];
    const createTimeRaw = record['创建时间'];

    // Format createTime to ISO string if possible, or use current time
    let createTime = new Date().toISOString();
    if (createTimeRaw) {
        // Try to parse "2024/09/30 17:19"
        const parsed = new Date(createTimeRaw);
        if (!isNaN(parsed.getTime())) {
            createTime = parsed.toISOString();
        }
    }

    let notes = "";
    if (location) notes += `Base: ${location}\n`;
    if (channel) notes += `Source: ${channel}\n`;

    const tags = [];
    if (tagsStr) {
        const tagLabels = tagsStr.split(/,|，/).map((s: string) => s.trim()).filter((s: string) => s);
        for (const label of tagLabels) {
            tags.push({ id: crypto.randomUUID(), label: label }); // API expects tag objects with ID? Or just ID?
            // Wait, backend logic:
            // if (tags && tags.length > 0) {
            //   await Promise.all(tags.map((tag: any) => 
            //     db.insert(tables.contactTags).values({ contactId: newContact.id, tagId: tag.id })
            //   ));
            // }
            // It expects `tag.id`. 
            // BUT, it assumes the tag ALREADY EXISTS in `tags` table?
            // No, the code says:
            // db.insert(tables.contactTags).values(...)
            // It uses `tag.id` directly.
            // If `tag.id` doesn't exist in `tags` table, foreign key constraint might fail if enforced?
            // Schema: `tagId: text("tag_id").notNull()` (No foreign key reference in `contactTags` definition in `schema.ts` I read earlier?)
            // Let me check schema again.
            // `export const contactTags = pgTable("contact_tags", { contactId: ..., tagId: text("tag_id").notNull() }, ...)`
            // It does NOT have `.references(() => tags.id)`.
            // So I can insert any tag ID!
            // However, the frontend usually expects tags to exist in `tags` table.
            // So I should create tags first.
            // The API `POST /api/contacts` does NOT create tags in `tags` table. It only links them.
            // So I need to create tags using `POST /api/tags` first?
            // Yes.
        }
    }

    // 1. Ensure Tags Exist
    const finalTags = [];
    for (const tag of tags) {
        // Check if tag exists (I can't check via API easily without fetching all)
        // I'll just try to create it. If it exists (by label?), API `POST /api/tags` creates a NEW tag every time!
        // `id: body.id || crypto.randomUUID()`
        // So if I create a tag "AI", I get a new ID.
        // This is fine for now, but might duplicate tags.
        // Better: Fetch all tags first, map by label.
        
        // Let's implement fetching tags first.
    }
  }
  
  // Revised Loop
  console.log("Fetching existing tags...");
  let existingTags: any[] = [];
  try {
      const res = await fetch("http://localhost:3001/api/tags");
      if (res.ok) existingTags = await res.json();
  } catch (e) {
      console.log("Could not fetch tags, assuming empty.");
  }

  const tagMap = new Map();
  existingTags.forEach(t => tagMap.set(t.label, t.id));

  for (const record of records) {
      const name = record['姓名 & 昵称'];
      const company = record['公司'];
      const location = record['现在 Base 地'];
      const tagsStr = record['职业标签'];
      const channel = record['第一次认识渠道'];
      const createTimeRaw = record['创建时间'];
      
      let createTime = new Date().toISOString();
      if (createTimeRaw) {
        const parsed = new Date(createTimeRaw);
        if (!isNaN(parsed.getTime())) createTime = parsed.toISOString();
      }

      let notes = "";
      if (location) notes += `Base: ${location}\n`;
      if (channel) notes += `Source: ${channel}\n`;

      const contactTags = [];
      if (tagsStr) {
          const tagLabels = tagsStr.split(/,|，/).map((s: string) => s.trim()).filter((s: string) => s);
          for (const label of tagLabels) {
              let tagId = tagMap.get(label);
              if (!tagId) {
                  // Create Tag
                  const newTagId = crypto.randomUUID();
                  const res = await fetch("http://localhost:3001/api/tags", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                          id: newTagId,
                          label: label,
                          category: "default",
                          color: "#blue"
                      })
                  });
                  if (res.ok) {
                      const createdTag = await res.json();
                      tagId = createdTag.id;
                      tagMap.set(label, tagId);
                      console.log(`Created tag: ${label}`);
                  } else {
                      console.error(`Failed to create tag ${label}`);
                  }
              }
              if (tagId) contactTags.push({ id: tagId });
          }
      }

      // Create Contact
      const res = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
              name: name || "Unknown",
              company: company || null,
              notes: notes.trim(),
              createdAt: createTime,
              lastContactedAt: new Date().toISOString(),
              tags: contactTags
          })
      });

      if (res.ok) {
          console.log(`Imported contact: ${name}`);
      } else {
          console.error(`Failed to import ${name}: ${res.status} ${await res.text()}`);
      }
  }

  console.log("Import completed.");
}

main().catch(console.error);
