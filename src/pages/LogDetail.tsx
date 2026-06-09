import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { SCENES } from '@/data/scenes';
import { ArrowLeft, Calendar, Clock, Wrench, Package, AlertCircle, Lightbulb, Trash2, Edit2 } from 'lucide-react';
import { formatDate, formatMoney, cn } from '@/lib/utils';

export default function LogDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const logs = useAppStore((s) => s.logs);
  const removeLog = useAppStore((s) => s.removeLog);

  const log = logs.find((l) => l.id === id);

  if (!log) {
    return (
      <div className="p-10 text-center">
        <p className="text-slate-500 text-lg mb-4">日志不存在</p>
        <button
          onClick={() => navigate('/logs')}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg"
        >
          返回日志列表
        </button>
      </div>
    );
  }

  const scene = SCENES.find((s) => s.id === log.sceneId);

  const handleDelete = () => {
    if (confirm('确定删除这条维修日志吗？')) {
      removeLog(log.id);
      navigate('/logs');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-5xl mx-auto p-6 md:p-10">
        <button
          onClick={() => navigate('/logs')}
          className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>返回日志列表</span>
        </button>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-[#1e3a5f] p-6 md:p-8 text-white">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center text-4xl">
                  {scene?.icon || '🔧'}
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold">{log.sceneName}</h1>
                  <div className="flex items-center gap-4 mt-2 text-indigo-100 text-sm">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatDate(log.date)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      耗时 {log.duration} 分钟
                    </span>
                    {log.costSave != null && log.costSave > 0 && (
                      <span className="px-3 py-1 rounded-full bg-emerald-400/20 text-emerald-50 font-medium">
                        节省 {formatMoney(log.costSave)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => navigate(`/logs/new`)}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                  title="编辑"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
                <button
                  onClick={handleDelete}
                  className="p-2 rounded-lg bg-rose-500/20 hover:bg-rose-500/40 transition-colors"
                  title="删除"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          <div className="p-6 md:p-8 space-y-8">
            {log.photos.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <span className="w-1 h-6 bg-indigo-500 rounded" />
                  现场照片
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {log.photos.map((photo, i) => (
                    <div
                      key={i}
                      className="aspect-square rounded-lg overflow-hidden bg-slate-100 border border-slate-200"
                    >
                      <img
                        src={photo}
                        alt={`照片 ${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              {log.toolsUsed.length > 0 && (
                <section className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                  <h2 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-indigo-600" />
                    使用的工具
                  </h2>
                  <ul className="flex flex-wrap gap-2">
                    {log.toolsUsed.map((t, i) => (
                      <li
                        key={i}
                        className="px-3 py-1.5 bg-white rounded-lg text-sm text-slate-700 border border-slate-200 shadow-sm"
                      >
                        {t}
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {log.materialsUsed.length > 0 && (
                <section className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                  <h2 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                    <Package className="w-4 h-4 text-emerald-600" />
                    消耗的耗材
                  </h2>
                  <ul className="space-y-2">
                    {log.materialsUsed.map((m, i) => (
                      <li
                        key={i}
                        className="flex justify-between items-center px-3 py-2 bg-white rounded-lg text-sm border border-slate-200"
                      >
                        <span className="text-slate-700">{m.name}</span>
                        <span className="font-medium text-slate-600">{m.amount}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>

            {log.problems && (
              <section className="bg-rose-50 rounded-xl p-5 border border-rose-100">
                <h2 className="text-sm font-semibold text-rose-800 mb-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-500" />
                  遇到的问题
                </h2>
                <p className="text-rose-900/80 text-sm leading-relaxed whitespace-pre-wrap">
                  {log.problems}
                </p>
              </section>
            )}

            {log.tips && (
              <section className="bg-amber-50 rounded-xl p-5 border border-amber-100">
                <h2 className="text-sm font-semibold text-amber-800 mb-2 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  心得与技巧
                </h2>
                <p className="text-amber-900/80 text-sm leading-relaxed whitespace-pre-wrap">
                  {log.tips}
                </p>
              </section>
            )}

            {scene && (
              <section className="border-t border-slate-200 pt-6">
                <Link
                  to={`/knowledge/${scene.id}`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-sm font-medium transition-colors"
                >
                  查看「{scene.name}」的详细操作指南
                  <ArrowLeft className="w-4 h-4 rotate-180" />
                </Link>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
