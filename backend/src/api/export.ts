/**
 * [INPUT]: 依赖 xlsx 生成 Excel，依赖 db 查询全量用户数据
 * [OUTPUT]: 对外提供 createExportHandler 工厂函数，生成多 Sheet Excel 下载
 * [POS]: backend/src/api/export.ts，关系资产数据批量导出的核心业务逻辑
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { Context } from "hono";
import * as XLSX from "xlsx";
import { eq, and } from "drizzle-orm";
import * as tables from "../db/schema";

/* ── helpers ── */

const getUserId = (c: Context) => {
  const user = c.get("user");
  if (!user) throw new Error("User not authenticated");
  return user.id;
};

const fmtDate = (v: any) => (v ? String(v).slice(0, 10) : "");

/* ── category label map ── */

const CATEGORY_ZH: Record<string, string> = {
  industry: "行业",
  role: "职位",
  skill: "技能",
  relationship: "渠道",
  location: "城市",
  custom: "自定义",
};

/* ── export handler ── */

export const createExportHandler = (db: any) => async (c: Context) => {
  const userId = getUserId(c);

  // ── 1. query all user data in parallel ──
  const [contacts, tags, contactTagRows, records, relationships, sharedPages] =
    await Promise.all([
      db.select().from(tables.contacts).where(eq(tables.contacts.userId, userId)),
      db.select().from(tables.tags).where(eq(tables.tags.userId, userId)),
      db.select().from(tables.contactTags),
      db.select().from(tables.communicationRecords),
      db.select().from(tables.relationships).where(eq(tables.relationships.userId, userId)),
      db.select().from(tables.sharedPages).where(eq(tables.sharedPages.userId, userId)),
    ]);

  // ── build lookup maps ──
  const tagMap = new Map<string, any>(tags.map((t: any) => [t.id, t]));
  const contactMap = new Map<string, any>(contacts.map((c: any) => [c.id, c]));

  // ── group tags by contact ──
  const contactTagsMap = new Map<string, any[]>();
  for (const ct of contactTagRows) {
    const tag = tagMap.get(ct.tagId);
    if (!tag) continue;
    const arr = contactTagsMap.get(ct.contactId) || [];
    arr.push(tag);
    contactTagsMap.set(ct.contactId, arr);
  }

  // ── filter comm records to user's contacts only ──
  const userRecords = records.filter((r: any) => contactMap.has(r.contactId));

  // ── 2. build sheets ──
  const wb = XLSX.utils.book_new();

  // Sheet 1: 资产信息
  const contactRows = contacts.map((c: any) => {
    const myTags = contactTagsMap.get(c.id) || [];
    const byCategory = (cat: string) =>
      myTags.filter((t: any) => t.category === cat).map((t: any) => t.label).join("、");

    return {
      姓名: c.name,
      公司: c.company || "",
      行业: byCategory("industry"),
      职位标签: byCategory("role"),
      专业技能: byCategory("skill"),
      认识渠道: byCategory("relationship"),
      所在城市: byCategory("location"),
      "Bonjour链接": c.bonjourLink || "",
      备注: c.notes || "",
      创建时间: fmtDate(c.createdAt),
      最近联系时间: fmtDate(c.lastContactedAt),
      互动次数: c.interactionCount ?? 0,
    };
  });
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(contactRows), "资产信息");

  // Sheet 2: 沟通记录
  const commRows = userRecords.map((r: any) => ({
    联系人: contactMap.get(r.contactId)?.name || r.contactId,
    日期: fmtDate(r.date),
    类型: r.type,
    摘要: r.summary,
    详情: r.details || "",
    跟进日期: fmtDate(r.followUpDate),
    跟进备注: r.followUpNote || "",
    跟进完成: r.followUpDone ? "是" : "否",
  }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(commRows), "沟通记录");

  // Sheet 3: 关系网络
  const relRows = relationships.map((r: any) => ({
    源联系人: contactMap.get(r.sourceContactId)?.name || r.sourceContactId,
    目标联系人: contactMap.get(r.targetContactId)?.name || r.targetContactId,
    关系类型: r.type || "",
    关系强度: r.strength ?? 1,
    创建时间: fmtDate(r.createdAt),
  }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(relRows), "关系网络");

  // Sheet 4: 分享页面
  const shareRows = sharedPages.map((p: any) => {
    let cfg: any = {};
    try { cfg = typeof p.config === "string" ? JSON.parse(p.config) : p.config; } catch {}
    return {
      标题: p.title,
      链接标识: p.slug,
      选中联系人数: (cfg.selectedContacts || []).length,
      显示备注: cfg.showNotes ? "是" : "否",
      显示关系: cfg.showConnections ? "是" : "否",
      创建时间: fmtDate(p.createdAt),
    };
  });
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(shareRows), "分享页面");

  // ── 3. write buffer & respond ──
  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

  return new Response(buf, {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename=bridgeflow_export_${new Date().toISOString().slice(0, 10)}.xlsx`,
    },
  });
};
