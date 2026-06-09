import { useState } from 'react';
import {
  Search,
  Bell,
  Moon,
  Sun,
  User,
  Droplets,
  Zap,
  Menu,
  X,
} from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';

interface HeaderProps {
  title?: string;
  onMobileMenuToggle?: () => void;
}

export function Header({ title = '工作台', onMobileMenuToggle }: HeaderProps) {
  const [isDark, setIsDark] = useState(true);
  const [searchFocused, setSearchFocused] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
    onMobileMenuToggle?.();
  };

  return (
    <header className="relative h-16 bg-slate-900/80 backdrop-blur-md border-b border-slate-700/60 flex items-center px-4 md:px-6 shrink-0 z-20">
      <button
        onClick={handleMobileMenu}
        className="md:hidden lg:hidden p-2 -ml-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors mr-2"
      >
        {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      <div className="flex flex-col justify-center min-w-0">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-white truncate">{title}</h2>
          <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-primary-500/20 text-primary-300 border border-primary-500/30">
            <Zap className="w-3 h-3" />
            LIVE
          </span>
        </div>
        <p className="text-xs text-slate-500 hidden sm:block">
          {formatDate()} · 今日维修任务待办
        </p>
      </div>

      <div className="flex-1 flex justify-center px-4 lg:px-12 max-w-2xl mx-auto">
        <div
          className={cn(
            'relative w-full transition-all duration-200',
            searchFocused ? 'max-w-xl' : 'max-w-lg'
          )}
        >
          <Search
            className={cn(
              'absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors',
              searchFocused ? 'text-primary-400' : 'text-slate-500'
            )}
          />
          <input
            type="text"
            placeholder="搜索维修场景、工具、材料..."
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className={cn(
              'w-full h-9 pl-10 pr-4 rounded-lg text-sm text-slate-200 bg-slate-800/60 border transition-all duration-200 placeholder:text-slate-500 focus:outline-none',
              searchFocused
                ? 'border-primary-500/60 bg-slate-800 shadow-glow-sm ring-2 ring-primary-500/20'
                : 'border-slate-700/60 hover:border-slate-600'
            )}
          />
        </div>
      </div>

      <div className="flex items-center gap-1 md:gap-2 shrink-0">
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/40 border border-slate-700/60">
          <Droplets className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-[11px] text-slate-400 font-medium">湿度 58%</span>
        </div>

        <button
          onClick={() => setIsDark(!isDark)}
          className="p-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          title={isDark ? '切换至亮色模式' : '切换至暗色模式'}
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        <button className="relative p-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-slate-900" />
        </button>

        <div className="hidden sm:block w-px h-6 bg-slate-700/60 mx-1" />

        <button className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-lg hover:bg-slate-800 transition-colors group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-glow-sm">
            <User className="w-4 h-4 text-white" />
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-medium text-white leading-tight">维修工程师</p>
            <p className="text-[10px] text-slate-500 leading-tight">管理员</p>
          </div>
        </button>
      </div>
    </header>
  );
}
