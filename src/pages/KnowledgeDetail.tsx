import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Clock,
  Wrench,
  Package,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Lightbulb,
  ListChecks,
  Box,
} from 'lucide-react';
import { SCENES } from '@/data/scenes';
import { CATEGORY_COLORS, CATEGORY_LABELS } from '@/types';
import type { Difficulty, SceneCategory } from '@/types';
import { StarRating } from '@/components/common/StarRating';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';

export default function KnowledgeDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const checkInventory = useAppStore((s) => s.checkInventory);

  const scene = useMemo(() => SCENES.find((s) => s.id === id), [id]);

  const inventoryCheck = useMemo(() => {
    if (!scene) return null;
    return checkInventory(
      scene.tools.map((t) => ({ name: t.name, spec: t.spec })),
      scene.materials.map((m) => ({
        name: m.name,
        spec: m.spec,
        amount: m.amount,
        unit: m.unit,
      }))
    );
  }, [scene, checkInventory]);

  if (!scene) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📖</div>
          <h2 className="text-2xl font-bold text-slate-300 mb-2">场景不存在</h2>
          <p className="text-slate-500 mb-6">未找到 ID 为 {id} 的维修场景</p>
          <button
            type="button"
            onClick={() => navigate('/knowledge')}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-sky-500 hover:bg-sky-400 text-white rounded-xl font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            返回知识库
          </button>
        </div>
      </div>
    );
  }

  const categoryGradient = CATEGORY_COLORS[scene.category as SceneCategory];
  const missingToolNames = new Set(
    inventoryCheck?.toolMissing.map((t) => t.name) ?? []
  );
  const shortageMatMap = new Map(
    (inventoryCheck?.materialShortage ?? []).map((m) => [m.name, m])
  );
  const missingMatSet = new Set(
    (inventoryCheck?.materialMissing ?? []).map((m) => m.name)
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div
        className={cn(
          'relative overflow-hidden bg-gradient-to-br',
          categoryGradient
        )}
      >
        <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px]" />
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-black/20 blur-3xl" />

        <div className="relative max-w-5xl mx-auto px-6 py-8">
          <button
            type="button"
            onClick={() => navigate('/knowledge')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur border border-white/20 rounded-xl text-white text-sm font-medium transition-all mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            返回知识库
          </button>

          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl bg-white/15 backdrop-blur border border-white/30 flex items-center justify-center text-5xl md:text-6xl shadow-2xl shrink-0">
              {scene.icon}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white/20 backdrop-blur border border-white/30 text-white">
                  {CATEGORY_LABELS[scene.category as SceneCategory]}
                </span>
                <span className="text-xs font-medium px-3 py-1 rounded-full bg-white/10 backdrop-blur border border-white/20 text-white/90">
                  {scene.keywords.slice(0, 3).join(' · ')}
                </span>
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 drop-shadow-sm">
                {scene.name}
              </h1>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-white/70 text-sm">难度</span>
                  <div className="flex items-center gap-2">
                    <StarRating
                      value={scene.difficulty as Difficulty}
                      max={4}
                      size="md"
                      readOnly
                    />
                    <span className="text-white font-semibold text-sm">
                      {scene.difficulty}/4
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-white">
                  <Clock className="w-5 h-5 text-white/80" />
                  <span className="text-sm text-white/70">预计耗时</span>
                  <span className="font-semibold text-lg">
                    {scene.estimatedTime} 分钟
                  </span>
                </div>

                <div className="flex items-center gap-2 text-white">
                  <ListChecks className="w-5 h-5 text-white/80" />
                  <span className="text-sm text-white/70">步骤</span>
                  <span className="font-semibold text-lg">
                    {scene.steps.length} 步
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10 space-y-10">
        <section>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center">
                <Wrench className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-100">工具清单</h2>
                <p className="text-sm text-slate-500">
                  共 {scene.tools.length} 件 ·{' '}
                  {inventoryCheck?.toolMissing.length === 0 ? (
                    <span className="text-emerald-400">库存齐全</span>
                  ) : (
                    <span className="text-rose-400">
                      缺 {inventoryCheck?.toolMissing.length} 件
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/60 backdrop-blur border border-slate-800 rounded-2xl overflow-hidden">
            <ul className="divide-y divide-slate-800">
              {scene.tools.map((tool, idx) => {
                const isMissing = missingToolNames.has(tool.name);
                return (
                  <li
                    key={`${tool.name}-${idx}`}
                    className="flex items-center justify-between px-5 py-4 hover:bg-slate-800/40 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={cn(
                          'w-9 h-9 rounded-lg flex items-center justify-center',
                          isMissing
                            ? 'bg-rose-500/10 border border-rose-500/30'
                            : 'bg-emerald-500/10 border border-emerald-500/30'
                        )}
                      >
                        {isMissing ? (
                          <XCircle className="w-4.5 h-4.5 text-rose-400" />
                        ) : (
                          <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-slate-200">
                          {tool.name}
                        </div>
                        {tool.spec && (
                          <div className="text-sm text-slate-500 mt-0.5">
                            规格：{tool.spec}
                          </div>
                        )}
                      </div>
                    </div>
                    <span
                      className={cn(
                        'text-xs font-semibold px-3 py-1.5 rounded-lg border',
                        isMissing
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                          : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      )}
                    >
                      {isMissing ? '库存缺失' : '已在库存'}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
                <Package className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-100">耗材清单</h2>
                <p className="text-sm text-slate-500">
                  共 {scene.materials.length} 项 ·{' '}
                  {inventoryCheck &&
                  inventoryCheck.materialMissing.length === 0 &&
                  inventoryCheck.materialShortage.length === 0 ? (
                    <span className="text-emerald-400">库存充足</span>
                  ) : (
                    <span className="text-amber-400">
                      缺 {inventoryCheck?.materialMissing.length} / 不足{' '}
                      {inventoryCheck?.materialShortage.length}
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/60 backdrop-blur border border-slate-800 rounded-2xl overflow-hidden">
            <ul className="divide-y divide-slate-800">
              {scene.materials.map((mat, idx) => {
                const shortage = shortageMatMap.get(mat.name);
                const isMissing = missingMatSet.has(mat.name);
                const hasIssue = shortage || isMissing;

                let statusBadge: { text: string; className: string; icon: JSX.Element };
                if (isMissing) {
                  statusBadge = {
                    text: '库存缺失',
                    className:
                      'bg-rose-500/10 text-rose-400 border-rose-500/30',
                    icon: <XCircle className="w-4.5 h-4.5 text-rose-400" />,
                  };
                } else if (shortage) {
                  statusBadge = {
                    text: `库存不足 (${shortage.available}/${shortage.needed})`,
                    className:
                      'bg-amber-500/10 text-amber-400 border-amber-500/30',
                    icon: (
                      <AlertTriangle className="w-4.5 h-4.5 text-amber-400" />
                    ),
                  };
                } else {
                  statusBadge = {
                    text: '库存充足',
                    className:
                      'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
                    icon: (
                      <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400" />
                    ),
                  };
                }

                return (
                  <li
                    key={`${mat.name}-${idx}`}
                    className="flex items-center justify-between px-5 py-4 hover:bg-slate-800/40 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={cn(
                          'w-9 h-9 rounded-lg flex items-center justify-center border',
                          hasIssue
                            ? isMissing
                              ? 'bg-rose-500/10 border-rose-500/30'
                              : 'bg-amber-500/10 border-amber-500/30'
                            : 'bg-emerald-500/10 border-emerald-500/30'
                        )}
                      >
                        {statusBadge.icon}
                      </div>
                      <div>
                        <div className="font-medium text-slate-200">
                          {mat.name}
                        </div>
                        <div className="text-sm text-slate-500 mt-0.5 flex items-center gap-2">
                          <Box className="w-3.5 h-3.5" />
                          <span>
                            需要 {mat.amount} {mat.unit}
                            {mat.spec && ` · ${mat.spec}`}
                          </span>
                        </div>
                      </div>
                    </div>
                    <span
                      className={cn(
                        'text-xs font-semibold px-3 py-1.5 rounded-lg border',
                        statusBadge.className
                      )}
                    >
                      {statusBadge.text}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center">
                <ListChecks className="w-5 h-5 text-sky-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-100">操作步骤</h2>
                <p className="text-sm text-slate-500">
                  按顺序完成以下 {scene.steps.length} 个步骤
                </p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute left-[27px] top-10 bottom-4 w-0.5 bg-gradient-to-b from-sky-500/50 via-slate-700/50 to-transparent" />

            <div className="space-y-5">
              {scene.steps.map((step, idx) => (
                <div key={idx} className="relative pl-20">
                  <div className="absolute left-0 top-0 w-[54px] h-[54px] rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 flex items-center justify-center shadow-lg">
                    <span
                      className={cn(
                        'w-9 h-9 rounded-xl flex items-center justify-center text-base font-bold bg-gradient-to-br',
                        categoryGradient,
                        'text-white shadow-lg'
                      )}
                    >
                      {idx + 1}
                    </span>
                  </div>

                  <div className="bg-slate-900/60 backdrop-blur border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-colors">
                    <h3 className="text-lg font-bold text-slate-100 mb-3">
                      {step.title}
                    </h3>
                    <p className="text-slate-300 leading-relaxed">
                      {step.detail}
                    </p>
                    {step.tip && (
                      <div className="mt-4 flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                        <Lightbulb className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <div className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1">
                            小贴士
                          </div>
                          <p className="text-amber-100/80 text-sm leading-relaxed">
                            {step.tip}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
