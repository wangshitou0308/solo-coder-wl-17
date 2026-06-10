import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Calendar, Clock, ImageIcon } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { formatDate, formatMinutes } from '@/lib/utils';
import { SCENES } from '@/data/scenes';

export default function Logs() {
  const logs = useAppStore((s) => s.logs);
  const navigate = useNavigate();

  const groupedLogs = useMemo(() => {
    const groups: Record<string, typeof logs> = {};
    for (const log of logs) {
      const key = log.date;
      if (!groups[key]) groups[key] = [];
      groups[key].push(log);
    }
    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
  }, [logs]);

  const getSceneIcon = (sceneName: string) => {
    const scene = SCENES.find((s) => s.name === sceneName);
    return scene?.icon ?? '🔧';
  };

  if (logs.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">维修日志</h1>
              <p className="text-slate-500 mt-1">记录每一次动手维修的经历</p>
            </div>
            <Link
              to="/logs/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/20"
            >
              <Plus className="w-4.5 h-4.5" />
              新增日志
            </Link>
          </div>
          <div className="text-center py-24 bg-white rounded-2xl border border-slate-200">
            <div className="w-20 h-20 mx-auto rounded-full bg-slate-100 flex items-center justify-center mb-4">
              <Calendar className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-700 mb-2">暂无维修日志</h3>
            <p className="text-slate-500 mb-6">记录你的第一次维修经历吧</p>
            <Link
              to="/logs/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              开始记录
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">维修日志</h1>
            <p className="text-slate-500 mt-1">共 {logs.length} 条记录，记录每一次动手维修的经历</p>
          </div>
          <Link
            to="/logs/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/20"
          >
            <Plus className="w-4.5 h-4.5" />
            新增日志
          </Link>
        </div>

        <div className="relative">
          {groupedLogs.map(([date, dayLogs], index) => (
            <div key={date} className="relative mb-10 last:mb-0">
              <div className="flex gap-6">
                <div className="flex flex-col items-center shrink-0 w-28 pt-2">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 mb-2">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-slate-700">
                      {new Date(date).getMonth() + 1}月{new Date(date).getDate()}日
                    </p>
                    <p className="text-xs text-slate-400">
                      {formatDate(date).split('/')[0]}年
                    </p>
                  </div>
                  {index !== groupedLogs.length - 1 && (
                    <div className="flex-1 w-0.5 bg-gradient-to-b from-indigo-200 to-transparent mt-4 min-h-[60px]" />
                  )}
                </div>

                <div className="flex-1 space-y-4">
                  {dayLogs.map((log) => (
                    <Link
                      key={log.id}
                      to={`/logs/${log.id}`}
                      className="group bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-xl hover:shadow-slate-200/60 hover:border-indigo-200 transition-all duration-300 block"
                    >
                      <div className="flex gap-5">
                        <div className="shrink-0">
                          {log.photos.length > 0 ? (
                            <img
                              src={log.photos[0]}
                              alt={log.sceneName}
                              className="w-24 h-24 rounded-xl object-cover border border-slate-200"
                            />
                          ) : (
                            <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center border border-slate-200">
                              <span className="text-4xl">{getSceneIcon(log.sceneName)}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{getSceneIcon(log.sceneName)}</span>
                              <h3 className="text-lg font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                                {log.sceneName}
                              </h3>
                            </div>
                            {log.costSave && log.costSave > 0 && (
                              <span className="shrink-0 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-sm font-semibold border border-emerald-200">
                                节省 ¥{log.costSave}
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-4 mb-3 text-sm text-slate-500">
                            <span className="inline-flex items-center gap-1.5">
                              <Calendar className="w-4 h-4 text-slate-400" />
                              {formatDate(log.date)}
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                              <Clock className="w-4 h-4 text-slate-400" />
                              耗时 {formatMinutes(log.duration)}
                            </span>
                            {log.photos.length > 0 && (
                              <span className="inline-flex items-center gap-1.5">
                                <ImageIcon className="w-4 h-4 text-slate-400" />
                                {log.photos.length} 张照片
                              </span>
                            )}
                          </div>

                          {(log.problems || log.tips) && (
                            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                              {log.problems && (
                                <p className="text-sm text-slate-600 leading-relaxed">
                                  <span className="font-medium text-slate-700">问题：</span>
                                  {log.problems}
                                </p>
                              )}
                              {log.tips && log.problems && (
                                <div className="my-2 border-t border-slate-200" />
                              )}
                              {log.tips && (
                                <p className="text-sm text-slate-600 leading-relaxed">
                                  <span className="font-medium text-slate-700">心得：</span>
                                  {log.tips}
                                </p>
                              )}
                            </div>
                          )}

                          {!log.problems && !log.tips && (
                            <p className="text-sm text-slate-400 italic">暂无问题或心得记录</p>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
