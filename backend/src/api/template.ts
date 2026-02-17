import { Context } from "hono";

// Helper to escape CSV fields
const escapeCSV = (field: string | null | undefined): string => {
  if (field === null || field === undefined) return "";
  const stringField = String(field);
  // If field contains comma, quote, or newline, wrap in quotes and escape internal quotes
  if (/[",\n]/.test(stringField)) {
    return `"${stringField.replace(/"/g, '""')}"`;
  }
  return stringField;
};

export const downloadTemplateHandler = async (c: Context) => {
  try {
    const headers = [
      "姓名",
      "职位",
      "公司",
      "行业",
      "职位标签",
      "专业技能",
      "第一次认识渠道",
      "所在城市",
      "Bonjour名片链接",
      "备注",
      "最近联系时间",
      "互动次数"
    ];

    const exampleRow = [
      "张三",
      "产品经理",
      "字节跳动",
      "互联网",
      "产品, 增长",
      "Figma, SQL",
      "校友会",
      "北京",
      "https://bonjour.example/zhangsan",
      "这是一个示例联系人",
      "2023-10-01",
      "5"
    ];

    const headerLine = headers.map(escapeCSV).join(",");
    const exampleLine = exampleRow.map(escapeCSV).join(",");

    const bom = "\uFEFF";
    const csvContent = bom + [headerLine, exampleLine].join("\n");

    return c.text(csvContent, 200, {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": "attachment; filename=contacts_template.csv",
    });
  } catch (e) {
    console.error('[ERROR] Template handler error:', e);
    return c.text(`Internal Server Error: ${e}`, 500);
  }
};
