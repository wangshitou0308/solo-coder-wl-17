import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Wrench,
  Home,
  Package,
  BookOpen,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Hammer,
  GraduationCap,
  FileText,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { to: '/', label: '首页看板', icon: Home },
  { to: '/knowledge', label: '维修知识库', icon: Hammer },
  { to: '/skills', label: '我的技能', icon: GraduationCap },
  { to: '/tools', label: '工具库存', icon: Wrench },
  { to: '/materials', label: '耗材库存', icon: Package },
  { to: '/logs', label: '维修日志', icon: FileText },
  { to: '/stats', label: '月度统计', icon: BarChart3 },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <aside
      className={cn(
        'relative flex flex-col h-screen bg-slate-900 border-r border-slate-700/60 transition-all duration-300 ease-in-out shrink-0',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      <div className="flex items-center h-16 px-4 border-b border-slate-700/60 shrink-0">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-[#1e3a5f] flex items-center justify-center shrink-0 shadow-glow-sm">
            <Wrench className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <div className="whitespace-nowrap">
              <h1 className="text-sm font-bold text-white tracking-wide">家庭维修助手</h1>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest">Home Repair</p>
            </div>
          )}
        </div>
      </div>

      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1 px-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.to === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(item.to);
            return (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={cn(
                    'group relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-glow-sm'
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200 border border-transparent'
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r bg-indigo-400" />
                  )}
                  <Icon
                    className={cn(
                      'w-5 h-5 shrink-0',
                      isActive ? 'text-indigo-300' : 'group-hover:text-indigo-400'
                    )}
                  />
                  {!collapsed && <span className="whitespace-nowrap">{item.label}</span>}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-3 border-t border-slate-700/60">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-slate-400 hover:bg-slate-800/60 hover:text-slate-200 text-sm transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span>收起菜单</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
