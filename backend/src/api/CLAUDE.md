# api/ - 业务接口实现
> L2 | 父级: ../CLAUDE.md

<files>
import.ts: CSV 批量导入处理，解析 CSV → DB预检 → 创建/更新联系人 + 标签关联，全部失败返回500
template.ts: 导入模板下载，生成带 BOM 的 CSV 模板文件
export.ts: 多 Sheet Excel 导出，聚合资产/沟通/关系/分享页面全量数据
</files>

[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
