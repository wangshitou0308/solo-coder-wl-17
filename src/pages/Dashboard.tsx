import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Wrench,
  Package,
  BookOpen,
  BarChart3,
  Hammer,
  GraduationCap,
  FileText,
  Calendar,
  Clock,
  ChevronRight,
  AlertTriangle,
  TrendingUp,
  Award,
  Sparkles,
  X,
  ShoppingCart,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { SCENES } from '@/data/scenes';
import { matchScenesByKeyword, formatDate, formatMinutes, formatMoney, cn } from '@/lib/utils';
import { StatCard } from '@/components/common/StatCard';
import type { RepairScene } from '@/types';

interface QuickEntry {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: 'indigo' | 'emerald' | 'amber' | 'rose' | 'cyan' | 'violet' | 'sky';
  desc: string;
}

const quickEntries: QuickEntry[] = [
  { to: '/knowledge', label: '维修知识库', icon: Hammer, accent: 'indigo', desc: '场景教程与步骤' },
  { to: '/skills', label: '我的技能', icon: GraduationCap, accent: 'emerald', desc: '掌握度与熟练度' },
  { to: '/tools', label: '工具库存', icon: Wrench, accent: 'amber', desc: '工具管理与清单' },
  { to: '/materials', label: '耗材库存', icon: Package, accent: 'rose', desc: '耗材与预警' },
  { to: '/shopping', label: '采购清单', icon: ShoppingCart, accent: 'cyan', desc: '待购物品管理' },
  { to: '/logs', label: '维修日志', icon: FileText, accent: 'violet', desc: '维修记录时间线' },
  { to: '/stats', label: '月度统计', icon: BarChart3, accent: 'sky', desc: '数据与趋势分析' },
];

const accentStyles: Record<QuickEntry['accent'], { bg: string; icon: string; hover: string }> = {
  indigo: { bg: 'bg-indigo-50', icon: 'text-indigo-600', hover: 'hover:bg-indigo-100 hover:border-indigo-300' },
  emerald: { bg: 'bg-emerald-50', icon: 'text-emerald-600', hover: 'hover:bg-emerald-100 hover:border-emerald-300' },
  amber: { bg: 'bg-amber-50', icon: 'text-amber-600', hover: 'hover:bg-amber-100 hover:border-amber-300' },
  rose: { bg: 'bg-rose-50', icon: 'text-rose-600', hover: 'hover:bg-rose-100 hover:border-rose-300' },
  cyan: { bg: 'bg-cyan-50', icon: 'text-cyan-600', hover: 'hover:bg-cyan-100 hover:border-cyan-300' },
  violet: { bg: 'bg-violet-50', icon: 'text-violet-600', hover: 'hover:bg-violet-100 hover:border-violet-300' },
  sky: { bg: 'bg-sky-50', icon: 'text-sky-600', hover: 'hover:bg-sky-100 hover:border-sky-300' },
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const [showResults, setShowResults] = useState(false);

  const logs = useAppStore((s) => s.logs);
  const skills = useAppStore((s) => s.skills);
  const materials = useAppStore((s) => s.materials);
  const tools = useAppStore((s) => s.tools);
  const getCurrentMonthLogStats = useAppStore((s) => s.getCurrentMonthLogStats);

  const searchResults = useMemo<RepairScene[]>(() => {
    return matchScenesByKeyword(SCENES, keyword);
  }, [keyword]);

  const monthStats = useMemo(() => getCurrentMonthLogStats(), [getCurrentMonthLogStats]);

  const totalCostSave = useMemo(() => {
    return logs.reduce((sum, log) => sum + (log.costSave ?? 0), 0);
  }, [logs]);

  const inventoryWarning = useMemo(() => {
    const shortageMaterials = materials.filter((m) => m.quantity <= m.threshold).length;
    const noTools = tools.length === 0 ? 1 : 0;
    return shortageMaterials + noTools;
  }, [materials, tools]);

  const recentLogs = useMemo(() => logs.slice(0, 5), [logs]);

  const handleSceneClick = (sceneId: string) => {
    setShowResults(false);
    navigate(`/knowledge/${sceneId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-slate-900">首页看板</h1>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 text-white text-xs font-semibold shadow-md shadow-indigo-500/20">
                <Sparkles className="w-3 h-3" />
                今日可用
              </span>
            </div>
            <p className="text-slate-500">维修好帮手 · 让每一次动手都胸有成竹</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-500">{formatDate()}</p>
            <p className="text-2xl font-bold text-slate-800">欢迎回来 👋</p>
          </div>
        </div>

        <div className="relative">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-6 pointer-events-none">
              <Search className="w-6 h-6 text-slate-400" />
            </div>
            <input
              type="text"
              value={keyword}
              onChange={(e) => {
                setKeyword(e.target.value);
                setShowResults(true);
              }}
              onFocus={() => setShowResults(true)}
              placeholder="搜索故障关键词，如：漏水、跳闸、堵塞、异响..."
              className="w-full pl-16 pr-16 py-5 text-lg rounded-2xl border-2 border-slate-200 bg-white shadow-xl shadow-slate-200/50 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
            />
            {keyword && (
              <button
                onClick={() => {
                  setKeyword('');
                  setShowResults(false);
                }}
                className="absolute inset-y-0 right-0 flex items-center pr-6 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {showResults && keyword && (
            <div className="absolute z-20 mt-3 w-full bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden">
              <div className="px-5 py-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                <span className="text-sm font-medium text-slate-600">
                  找到 <span className="text-indigo-600 font-bold">{searchResults.length}</span> 个匹配场景
                </span>
              </div>
              {searchResults.length > 0 ? (
                <div className="max-h-96 overflow-y-auto">
                  {searchResults.map((scene) => (
                    <button
                      key={scene.id}
                      onClick={() => handleSceneClick(scene.id)}
                      className="w-full flex items-center gap-4 px-5 py-4 hover:bg-indigo-50 transition-colors text-left border-b border-slate-50 last:border-b-0"
                    >
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center text-2xl shrink-0 border border-slate-200">
                        {scene.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-slate-800">{scene.name}</h4>
                          <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-xs font-medium border border-amber-200">
                            {scene.difficulty <= 2 ? '简单' : scene.difficulty === 3 ? '中等' : '困难'}
                          </span>
                        </div>
                        <p className="text-sm text-slate-500 truncate">{scene.description}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs text-slate-400">预计耗时</p>
                        <p className="font-semibold text-slate-700">{scene.estimatedTime}分钟</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-300" />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="px-5 py-12 text-center">
                  <div className="w-16 h-16 mx-auto rounded-full bg-slate-100 flex items-center justify-center mb-3">
                    <Search className="w-8 h-8 text-slate-300" />
                  </div>
                  <p className="text-slate-500 font-medium">未找到匹配的维修场景</p>
                  <p className="text-sm text-slate-400 mt-1">试试其他关键词，如"水龙头"、"插座"、"马桶"</p>
                </div>
              )}
            </div>
          )}
        </div>

        {showResults && keyword && (
          <div
            className="fixed inset-0 z-10 bg-black/20 backdrop-blur-sm"
            onClick={() => setShowResults(false)}
          />
        )}

        <div className="grid grid-cols-4 gap-5">
          <StatCard
            title="当月维修"
            value={monthStats.totalCount}
            icon={Calendar}
            description="本月完成的维修任务"
            trend={monthStats.totalCount > 0 ? 'up' : 'neutral'}
            trendValue={monthStats.totalCount > 0 ? '进行中' : '暂无记录'}
            accent="primary"
          />
          <StatCard
            title="累计节省"
            value={formatMoney(totalCostSave)}
            icon={TrendingUp}
            description="相比请师傅省下的费用"
            trend="up"
            trendValue="持续积累"
            accent="emerald"
          />
          <StatCard
            title="已掌握"
            value={`${skills.length}/${SCENES.length}`}
            icon={Award}
            description="已学习的维修技能数"
            trend="neutral"
            trendValue={`掌握度 ${Math.round((skills.length / SCENES.length) * 100)}%`}
            accent="cyan"
          />
          <StatCard
            title="库存预警"
            value={inventoryWarning}
            icon={AlertTriangle}
            description="需要补充的耗材或工具"
            trend={inventoryWarning > 0 ? 'down' : 'neutral'}
            trendValue={inventoryWarning > 0 ? '待处理' : '状态良好'}
            accent="rose"
          />
        </div>

        <div className="grid grid-cols-3 gap-5">
          {quickEntries.map((entry) => {
            const Icon = entry.icon;
            const styles = accentStyles[entry.accent];
            return (
              <Link
                key={entry.to}
                to={entry.to}
                className={cn(
                  'group relative overflow-hidden rounded-2xl bg-white border-2 border-slate-200 p-5 transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/60',
                  styles.hover
                )}
              >
                <div
                  className={cn(
                    'absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-40 transition-transform duration-500 group-hover:scale-150',
                    styles.bg
                  )}
                />
                <div className="relative">
                  <div
                    className={cn(
                      'w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3',
                      styles.bg
                    )}
                  >
                    <Icon className={cn('w-7 h-7', styles.icon)} />
                  </div>
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-lg font-bold text-slate-800">{entry.label}</h3>
                    <ChevronRight className="w-5 h-5 text-slate-300 transition-transform group-hover:translate-x-1" />
                  </div>
                  <p className="text-sm text-slate-500">{entry.desc}</p>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-sky-600 flex items-center justify-center shadow-md shadow-cyan-500/20">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800">最近维修日志</h2>
                <p className="text-xs text-slate-500">你的最新维修记录</p>
              </div>
            </div>
            <Link
              to="/logs"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              查看全部
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {recentLogs.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="w-20 h-20 mx-auto rounded-full bg-slate-50 flex items-center justify-center mb-4">
                <BookOpen className="w-10 h-10 text-slate-300" />
              </div>
              <h3 className="text-lg font-semibold text-slate-700 mb-2">还没有维修记录</h3>
              <p className="text-slate-500 mb-5">完成第一次维修后，记录下你的经验吧</p>
              <Link
                to="/logs/new"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
              >
                <FileText className="w-4 h-4" />
                记录第一次
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentLogs.map((log) => {
                const scene = SCENES.find((s) => s.name === log.sceneName);
                return (
                  <Link
                    key={log.id}
                    to={`/logs/${log.id}`}
                    className="group flex items-center gap-5 px-6 py-4 hover:bg-slate-50 transition-colors"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center text-2xl shrink-0 border border-slate-200 group-hover:border-indigo-200 transition-colors">
                      {scene?.icon ?? '🔧'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">
                          {log.sceneName}
                        </h4>
                        {log.costSave && log.costSave > 0 && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
                            省 ¥{log.costSave}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-500">
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatDate(log.date)}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {formatMinutes(log.duration)}
                        </span>
                        {log.problems && (
                          <span className="truncate text-slate-400 max-w-md">
                            {log.problems}
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
