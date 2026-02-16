/**
 * [INPUT]: 依赖 useThemeStore 管理主题状态
 * [OUTPUT]: 对外提供 ThemeToggle 组件，用于切换明亮/暗黑模式
 * [POS]: components/ThemeToggle，通常被 MainLayout 头部引用
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { Moon, Sun } from 'lucide-react';
import { useThemeStore } from '../store/themeStore';

export default function ThemeToggle() {
  const { isDarkMode, toggleTheme } = useThemeStore();

  return (
    <button
      onClick={toggleTheme}
      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-fill-quaternary transition-colors text-text-secondary"
      title={isDarkMode ? "切换到亮色模式" : "切换到暗色模式"}
    >
      {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
