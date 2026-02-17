/**
 * [INPUT]: 依赖 @insforge/sdk
 * [OUTPUT]: 对外提供 insforge client 实例
 * [POS]: src/lib/insforge.ts
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { createClient } from '@insforge/sdk';

const projectUrl = import.meta.env.VITE_INSFORGE_PROJECT_URL;
const anonKey = import.meta.env.VITE_INSFORGE_ANON_KEY;

if (!projectUrl || !anonKey) {
  throw new Error('Missing Insforge environment variables');
}

export const insforge = createClient({
  baseUrl: projectUrl,
  anonKey: anonKey
});
