import { pgTable, text, integer, boolean, timestamp, primaryKey, index } from "drizzle-orm/pg-core";

export const contacts = pgTable("contacts", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  avatar: text("avatar"),
  company: text("company"),
  bonjourLink: text("bonjour_link"),
  notes: text("notes"),
  createdAt: text("created_at").notNull(),
  lastContactedAt: text("last_contacted_at").notNull(),
  interactionCount: integer("interaction_count").default(0),
  shareVisible: boolean("share_visible"),
  sensitiveNotes: text("sensitive_notes"),
}, (table) => ({
  userIdIdx: index("contacts_user_id_idx").on(table.userId),
}));

export const tags = pgTable("tags", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  label: text("label").notNull(),
  category: text("category").notNull(),
  color: text("color").notNull(),
}, (table) => ({
  userIdIdx: index("tags_user_id_idx").on(table.userId),
}));

export const contactTags = pgTable("contact_tags", {
  contactId: text("contact_id").notNull().references(() => contacts.id, { onDelete: "cascade" }),
  tagId: text("tag_id").notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.contactId, table.tagId] }),
}));

export const communicationRecords = pgTable("communication_records", {
  id: text("id").primaryKey(),
  contactId: text("contact_id").notNull().references(() => contacts.id, { onDelete: "cascade" }),
  date: text("date").notNull(),
  type: text("type").notNull(),
  summary: text("summary").notNull(),
  details: text("details"),
  followUpDate: text("follow_up_date"),
  followUpNote: text("follow_up_note"),
  followUpDone: boolean("follow_up_done"),
}, (table) => ({
  contactIdIdx: index("comm_records_contact_id_idx").on(table.contactId),
}));

export const relationships = pgTable("relationships", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  sourceContactId: text("source_contact_id").notNull(),
  targetContactId: text("target_contact_id").notNull(),
  type: text("type"),
  strength: integer("strength").default(1),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  targetIdx: index("idx_relationships_target").on(table.targetContactId),
  sourceIdx: index("idx_relationships_source").on(table.sourceContactId),
  userIdIdx: index("idx_relationships_user_id").on(table.userId),
}));

// Keeping connections table as it was in SQLite schema, though it looks redundant with relationships?
// SQLite schema had 'connections' table.
export const connections = pgTable("connections", {
  id: text("id").primaryKey(),
  sourceContactId: text("source_contact_id").notNull().references(() => contacts.id, { onDelete: "cascade" }),
  targetContactId: text("target_contact_id").notNull().references(() => contacts.id, { onDelete: "cascade" }),
  type: text("type"),
}, (table) => ({
  sourceIdx: index("connections_source_idx").on(table.sourceContactId),
}));
