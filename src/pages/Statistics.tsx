import { useState, useMemo } from 'react';
import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  Wrench,
  Package,
  PieChart as PieChartIcon,
  Calendar,
  DollarSign,
  Clock,
  ListTodo,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { SCENES } from '@/data/scenes';
import { EmptyState } from '@/components/common/EmptyState';
import { cn } from '@/lib/utils';
import type { RepairLog, SceneCategory } from '@/types';
import { CATEGORY_LABELS } from '@/types';

function getMonthRange(year: number, month: number) {
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0);
  return { start, end };
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

interface BarChartProps {
  data: { day: number; count: number }[];
  maxCount: number;
}

function BarChart({ data, maxCount }: BarChartProps) {
  const displayMax = Math.max(maxCount, 1);

  return (
    <div className="w-full h-56">
      <div className="relative h-48 flex items-end gap-1 border-b border-l border-slate-700/60 pl-8 pb-0">
        <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-[10px] text-slate-500 -translate-x-1">
          {[displayMax, Math.round(displayMax * 0.75), Math.round(displayMax * 0.5), Math.round(displayMax * 0.25), 0].map((v, i) => (
            <span key={i}>{v}</span>
          ))}
        </div>
        {data.map(({ day, count }) => {
          const height = displayMax > 0 ? (count / displayMax) * 100 : 0;
          const showLabel = day % 5 === 0 || day === data.length;
          return (
            <div key={day} className="flex-1 flex flex-col items-center justify-end h-full group relative">
              <div
                className={cn(
                  'w-full max-w-[14px] rounded-t-sm transition-all duration-300 relative',
                  count > 0
                    ? 'bg-gradient-to-t from-indigo-600 to-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.3)]'
                    : 'bg-slate-800/50'
                )}
                style={{ height: `${Math.max(height, count > 0 ? 4 : 2)}%` }}
              >
                {count > 0 && (
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 border border-slate-700 rounded px-1.5 py-0.5 text-[10px] text-white whitespace-nowrap z-10">
                    {count} 次
                  </div>
                )}
              </div>
              <div className="absolute -bottom-5 text-[9px] text-slate-500">
                {showLabel ? day : ''}
              </div>
            </div>
          );
        })}
      </div>
      <div className="text-center text-xs text-slate-500 mt-7">日期（日）</div>
    </div>
  );
}

interface LineChartProps {
  data: { day: number; value: number }[];
  maxValue: number;
}

function LineChart({ data, maxValue }: LineChartProps) {
  const displayMax = Math.max(maxValue, 1);
  const width = 100;
  const height = 100;
  const padding = { top: 10, right: 10, bottom: 10, left: 10 };

  const points = data.map((d, i) => {
    const x = padding.left + (i / Math.max(data.length - 1, 1)) * (width - padding.left - padding.right);
    const y = height - padding.bottom - (d.value / displayMax) * (height - padding.top - padding.bottom);
    return { x, y, ...d };
  });

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaD = `${pathD} L ${points[points.length - 1]?.x ?? 0} ${height - padding.bottom} L ${points[0]?.x ?? 0} ${height - padding.bottom} Z`;

  return (
    <div className="w-full h-56">
      <div className="relative h-48 border-b border-l border-slate-700/60 pl-8">
        <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-[10px] text-slate-500 -translate-x-1">
          {[displayMax, Math.round(displayMax * 0.75), Math.round(displayMax * 0.5), Math.round(displayMax * 0.25), 0].map((v, i) => (
            <span key={i}>¥{v}</span>
          ))}
        </div>
        <div className="absolute inset-0 ml-8">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full" preserveAspectRatio="none">
            <defs>
              <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
              </linearGradient>
            </defs>
            {[0.25, 0.5, 0.75].map((ratio, i) => (
              <line
                key={i}
                x1={padding.left}
                y1={height * ratio}
                x2={width - padding.right}
                y2={height * ratio}
                stroke="rgba(100,116,139,0.2)"
                strokeDasharray="2 2"
              />
            ))}
            <path d={areaD} fill="url(#lineGradient)" />
            <path
              d={pathD}
              fill="none"
              stroke="#10b981"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ filter: 'drop-shadow(0 0 6px rgba(16,185,129,0.5))' }}
            />
            {points.filter(p => p.value > 0).map((p, i) => (
              <circle
                key={i}
                cx={p.x}
                cy={p.y}
                r="1.5"
                fill="#10b981"
                stroke="#052e16"
                strokeWidth="0.5"
              />
            ))}
          </svg>
        </div>
      </div>
      <div className="text-center text-xs text-slate-500 mt-1">日期（日）</div>
    </div>
  );
}

interface PieSlice {
  label: string;
  value: number;
  color: string;
}

function PieChart({ data, className }: { data: PieSlice[]; className?: string }) {
  const total = data.reduce((sum, d) => sum + d.value, 0);

  if (total === 0) {
    return (
      <div className="h-56 flex items-center justify-center">
        <EmptyState title="暂无分类数据" size="sm" />
      </div>
    );
  }

  let currentAngle = 0;
  const slices = data.map((d) => {
    const angle = (d.value / total) * 360;
    const startAngle = currentAngle;
    currentAngle += angle;
    return { ...d, startAngle, angle };
  });

  const createArc = (startAngle: number, angle: number, radius: number, innerRadius: number) => {
    const startRad = ((startAngle - 90) * Math.PI) / 180;
    const endRad = ((startAngle + angle - 90) * Math.PI) / 180;
    const largeArc = angle > 180 ? 1 : 0;

    const x1 = 100 + radius * Math.cos(startRad);
    const y1 = 100 + radius * Math.sin(startRad);
    const x2 = 100 + radius * Math.cos(endRad);
    const y2 = 100 + radius * Math.sin(endRad);

    const x3 = 100 + innerRadius * Math.cos(endRad);
    const y3 = 100 + innerRadius * Math.sin(endRad);
    const x4 = 100 + innerRadius * Math.cos(startRad);
    const y4 = 100 + innerRadius * Math.sin(startRad);

    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4} Z`;
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative" style={{ width: 200, height: 200 }}>
        <svg viewBox="0 0 200 200" className="w-full h-full">
          {slices.map((s, i) => (
            <path
              key={i}
              d={createArc(s.startAngle, s.angle, 90, 55)}
              fill={s.color}
              stroke="#0f172a"
              strokeWidth="1"
              className="transition-all duration-300 hover:opacity-90"
              style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}
            />
          ))}
          <text x="100" y="95" textAnchor="middle" fill="white" fontSize="20" fontWeight="bold">
            {total}
          </text>
          <text x="100" y="115" textAnchor="middle" fill="#64748b" fontSize="10">
            总计
          </text>
        </svg>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 w-full">
        {slices.map((s, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <div
              className="w-3 h-3 rounded-sm shrink-0"
              style={{ backgroundColor: s.color }}
            />
            <span className="text-slate-300 truncate">{s.label}</span>
            <span className="text-slate-500 ml-auto">{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const categoryPieColors: Record<SceneCategory, string> = {
  plumbing: '#0ea5e9',
  electrical: '#f59e0b',
  carpentry: '#b45309',
  hardware: '#64748b',
  appliance: '#6366f1',
  daily: '#10b981',
  textile: '#ec4899',
  bike: '#ef4444',
};

export default function Statistics() {
  const { logs, tools, materials } = useAppStore();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());

  const monthLogs = useMemo(() => {
    return logs.filter((log) => {
      const logDate = new Date(log.date);
      return logDate.getFullYear() === year && logDate.getMonth() === month;
    });
  }, [logs, year, month]);

  const dailyStats = useMemo(() => {
    const daysInMonth = getDaysInMonth(year, month);
    const counts: Record<number, number> = {};
    const savings: Record<number, number> = {};

    for (let i = 1; i <= daysInMonth; i++) {
      counts[i] = 0;
      savings[i] = 0;
    }

    monthLogs.forEach((log) => {
      const day = new Date(log.date).getDate();
      counts[day] = (counts[day] ?? 0) + 1;
      savings[day] = (savings[day] ?? 0) + (log.costSave ?? 0);
    });

    return {
      barData: Object.entries(counts).map(([day, count]) => ({ day: Number(day), count })),
      lineData: Object.entries(savings).map(([day, value]) => ({ day: Number(day), value })),
      maxCount: Math.max(...Object.values(counts), 0),
      maxSaving: Math.max(...Object.values(savings), 0),
    };
  }, [monthLogs, year, month]);

  const categoryStats = useMemo(() => {
    const stats: Record<string, { name: string; count: number; color: string }> = {};

    monthLogs.forEach((log) => {
      const scene = SCENES.find((s) => s.id === log.sceneId);
      if (scene) {
        const key = scene.category;
        if (!stats[key]) {
          stats[key] = {
            name: CATEGORY_LABELS[key],
            count: 0,
            color: categoryPieColors[key],
          };
        }
        stats[key].count++;
      } else if (log.sceneName) {
        const key = 'other_' + log.sceneName;
        if (!stats[key]) {
          stats[key] = {
            name: log.sceneName,
            count: 0,
            color: '#a78bfa',
          };
        }
        stats[key].count++;
      }
    });

    return Object.values(stats)
      .sort((a, b) => b.count - a.count)
      .map((s) => ({ label: s.name, value: s.count, color: s.color }));
  }, [monthLogs]);

  const summaryStats = useMemo(() => {
    const totalCount = monthLogs.length;
    const totalSaving = monthLogs.reduce((sum, log) => sum + (log.costSave ?? 0), 0);
    const totalDuration = monthLogs.reduce((sum, log) => sum + log.duration, 0);
    const avgDuration = totalCount > 0 ? Math.round(totalDuration / totalCount) : 0;
    return { totalCount, totalSaving, totalDuration, avgDuration };
  }, [monthLogs]);

  const inventoryAlerts = useMemo(() => {
    const missingTools: { name: string; spec?: string }[] = [];

    const lowMaterials = materials
      .filter((m) => m.quantity <= m.threshold)
      .map((m) => ({
        name: m.name,
        spec: m.spec,
        available: m.quantity,
        threshold: m.threshold,
        unit: m.unit,
      }));

    return { missingTools, lowMaterials };
  }, [tools, materials]);

  const navigateMonth = (direction: number) => {
    let newMonth = month + direction;
    let newYear = year;
    if (newMonth < 0) {
      newMonth = 11;
      newYear--;
    } else if (newMonth > 11) {
      newMonth = 0;
      newYear++;
    }
    setMonth(newMonth);
    setYear(newYear);
  };

  const goToCurrentMonth = () => {
    setYear(now.getFullYear());
    setMonth(now.getMonth());
  };

  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth();
  const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

  return (
    <div className="min-h-screen bg-slate-950 p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shadow-glow-sm">
            <BarChart3 className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">月度统计</h1>
            <p className="text-sm text-slate-400">维修记录与费用节省分析</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateMonth(-1)}
            className="p-2 rounded-lg bg-slate-800/60 text-slate-300 hover:bg-slate-700/60 hover:text-white border border-slate-700/60 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 px-4 py-2 bg-slate-900/60 border border-slate-700/60 rounded-lg min-w-[180px] justify-center">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span className="font-semibold text-white">
              {year} 年 {monthNames[month]}
            </span>
            {!isCurrentMonth && (
              <button
                onClick={goToCurrentMonth}
                className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 transition-colors"
              >
                本月
              </button>
            )}
          </div>

          <button
            onClick={() => navigateMonth(1)}
            className="p-2 rounded-lg bg-slate-800/60 text-slate-300 hover:bg-slate-700/60 hover:text-white border border-slate-700/60 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            icon: ListTodo,
            label: '维修次数',
            value: summaryStats.totalCount,
            unit: '次',
            color: 'indigo',
          },
          {
            icon: DollarSign,
            label: '节省费用',
            value: summaryStats.totalSaving,
            unit: '元',
            prefix: '¥',
            color: 'emerald',
          },
          {
            icon: Clock,
            label: '总耗时',
            value: summaryStats.totalDuration,
            unit: '分钟',
            color: 'amber',
          },
          {
            icon: TrendingUp,
            label: '平均耗时',
            value: summaryStats.avgDuration,
            unit: '分钟/次',
            color: 'sky',
          },
        ].map((item, i) => {
          const colorClasses: Record<string, { bg: string; border: string; text: string; icon: string }> = {
            indigo: { bg: 'bg-indigo-500/10', border: 'border-indigo-500/30', text: 'text-indigo-300', icon: 'text-indigo-400' },
            emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-300', icon: 'text-emerald-400' },
            amber: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-300', icon: 'text-amber-400' },
            sky: { bg: 'bg-sky-500/10', border: 'border-sky-500/30', text: 'text-sky-300', icon: 'text-sky-400' },
          };
          const cls = colorClasses[item.color];
          const Icon = item.icon;
          return (
            <div
              key={i}
              className={cn(
                'relative bg-slate-900/60 border rounded-xl p-4 overflow-hidden transition-all hover:-translate-y-0.5',
                cls.border
              )}
            >
              <div className={cn('absolute -top-8 -right-8 w-24 h-24 rounded-full blur-2xl opacity-20', cls.bg)} />
              <div className="relative flex items-center gap-3 mb-2">
                <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', cls.bg, cls.border)}>
                  <Icon className={cn('w-4 h-4', cls.icon)} />
                </div>
                <span className="text-sm text-slate-400">{item.label}</span>
              </div>
              <div className="relative">
                <span className={cn('text-2xl font-bold', cls.text)}>
                  {item.prefix ?? ''}
                  {item.value.toLocaleString()}
                </span>
                <span className="text-xs text-slate-500 ml-1">{item.unit}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900/60 border border-slate-700/60 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-indigo-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">每日维修次数</h3>
                <p className="text-xs text-slate-500">按日期统计维修记录数量</p>
              </div>
            </div>
          </div>
          {summaryStats.totalCount === 0 ? (
            <div className="h-56 flex items-center justify-center">
              <EmptyState title="本月无维修记录" size="sm" />
            </div>
          ) : (
            <BarChart data={dailyStats.barData} maxCount={dailyStats.maxCount} />
          )}
        </div>

        <div className="bg-slate-900/60 border border-slate-700/60 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">节省费用趋势</h3>
                <p className="text-xs text-slate-500">每日累计节省金额（元）</p>
              </div>
            </div>
          </div>
          {summaryStats.totalSaving === 0 ? (
            <div className="h-56 flex items-center justify-center">
              <EmptyState title="本月暂无费用节省" description="完成维修后将自动统计节省费用" size="sm" />
            </div>
          ) : (
            <LineChart data={dailyStats.lineData} maxValue={dailyStats.maxSaving} />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900/60 border border-slate-700/60 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-violet-500/15 border border-violet-500/30 flex items-center justify-center">
                <PieChartIcon className="w-4 h-4 text-violet-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">维修分类占比</h3>
                <p className="text-xs text-slate-500">按维修场景分类统计</p>
              </div>
            </div>
          </div>
          <PieChart data={categoryStats} />
        </div>

        <div className="bg-slate-900/60 border border-slate-700/60 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-rose-500/15 border border-rose-500/30 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">库存预警</h3>
                <p className="text-xs text-slate-500">缺工具 & 低耗材提醒</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <span className="px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30">
                缺工具 {inventoryAlerts.missingTools.length}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
                低耗材 {inventoryAlerts.lowMaterials.length}
              </span>
            </div>
          </div>

          <div className="space-y-4 max-h-[320px] overflow-y-auto pr-1">
            {inventoryAlerts.missingTools.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 text-xs font-medium text-rose-400 mb-2">
                  <Wrench className="w-3.5 h-3.5" />
                  <span>缺少工具</span>
                </div>
                <div className="space-y-1.5">
                  {inventoryAlerts.missingTools.map((tool, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between px-3 py-2 rounded-lg bg-rose-500/5 border border-rose-500/20"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-6 h-6 rounded bg-rose-500/15 flex items-center justify-center shrink-0">
                          <Wrench className="w-3.5 h-3.5 text-rose-400" />
                        </div>
                        <span className="text-sm text-slate-200 truncate">{tool.name}</span>
                        {tool.spec && <span className="text-xs text-slate-500 shrink-0">{tool.spec}</span>}
                      </div>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 shrink-0 ml-2">
                        未拥有
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {inventoryAlerts.lowMaterials.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 text-xs font-medium text-amber-400 mb-2">
                  <Package className="w-3.5 h-3.5" />
                  <span>耗材不足</span>
                </div>
                <div className="space-y-1.5">
                  {inventoryAlerts.lowMaterials.map((mat, i) => {
                    const ratio = mat.threshold > 0 ? mat.available / mat.threshold : 0;
                    return (
                      <div
                        key={i}
                        className="px-3 py-2 rounded-lg bg-amber-500/5 border border-amber-500/20"
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-6 h-6 rounded bg-amber-500/15 flex items-center justify-center shrink-0">
                              <Package className="w-3.5 h-3.5 text-amber-400" />
                            </div>
                            <span className="text-sm text-slate-200 truncate">{mat.name}</span>
                            {mat.spec && <span className="text-xs text-slate-500 shrink-0">{mat.spec}</span>}
                          </div>
                          <span className="text-xs text-slate-400 shrink-0 ml-2">
                            <span className={cn(
                              'font-semibold',
                              mat.available === 0 ? 'text-rose-400' : 'text-amber-300'
                            )}>
                              {mat.available}
                            </span>
                            <span className="text-slate-600"> / {mat.threshold}</span>
                            <span className="text-slate-500 ml-0.5">{mat.unit}</span>
                          </span>
                        </div>
                        <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className={cn(
                              'h-full rounded-full transition-all',
                              ratio <= 0.3 ? 'bg-gradient-to-r from-rose-500 to-rose-400' : 'bg-gradient-to-r from-amber-500 to-amber-400'
                            )}
                            style={{ width: `${Math.min(ratio * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {inventoryAlerts.missingTools.length === 0 && inventoryAlerts.lowMaterials.length === 0 && (
              <div className="py-8">
                <EmptyState title="库存状态良好" description="工具齐全，耗材充足" size="sm" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
