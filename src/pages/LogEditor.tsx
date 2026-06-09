import { useState, useRef, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Calendar,
  Clock,
  Wrench,
  Package,
  AlertCircle,
  Lightbulb,
  Upload,
  X,
  Plus,
  ChevronDown,
  Check,
  Image as ImageIcon,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { SCENES } from '@/data/scenes';
import { cn } from '@/lib/utils';
import type { MaterialUsage } from '@/types';

const ALL_TOOLS = Array.from(
  new Set(SCENES.flatMap((s) => s.tools.map((t) => t.name + (t.spec ? ` (${t.spec})` : ''))))
).sort();

export default function LogEditor() {
  const navigate = useNavigate();
  const addLog = useAppStore((s) => s.addLog);

  const [sceneName, setSceneName] = useState('');
  const [sceneDropdownOpen, setSceneDropdownOpen] = useState(false);
  const [customScene, setCustomScene] = useState('');
  const [useCustomScene, setUseCustomScene] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [duration, setDuration] = useState<number>(30);
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [customTool, setCustomTool] = useState('');
  const [toolDropdownOpen, setToolDropdownOpen] = useState(false);
  const [materials, setMaterials] = useState<MaterialUsage[]>([]);
  const [problems, setProblems] = useState('');
  const [tips, setTips] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [costSave, setCostSave] = useState<number | ''>('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const sceneOptions = SCENES.map((s) => ({ name: s.name, icon: s.icon, costSave: s.costSave }));

  const filteredSceneOptions = sceneOptions.filter((s) =>
    s.name.toLowerCase().includes(sceneName.toLowerCase())
  );

  const handleSceneSelect = (name: string, cs: number) => {
    setSceneName(name);
    setUseCustomScene(false);
    setSceneDropdownOpen(false);
    if (costSave === '' || costSave === 0) setCostSave(cs);
  };

  const toggleTool = (tool: string) => {
    setSelectedTools((prev) =>
      prev.includes(tool) ? prev.filter((t) => t !== tool) : [...prev, tool]
    );
  };

  const addCustomTool = () => {
    const t = customTool.trim();
    if (t && !selectedTools.includes(t)) {
      setSelectedTools((prev) => [...prev, t]);
    }
    setCustomTool('');
    setToolDropdownOpen(false);
  };

  const addMaterialRow = () => {
    setMaterials((prev) => [...prev, { name: '', amount: 1 }]);
  };

  const updateMaterial = (idx: number, field: 'name' | 'amount', value: string | number) => {
    setMaterials((prev) =>
      prev.map((m, i) => (i === idx ? { ...m, [field]: value } : m))
    );
  };

  const removeMaterial = (idx: number) => {
    setMaterials((prev) => prev.filter((_, i) => i !== idx));
  };

  const handlePhotoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const result = ev.target?.result as string;
        setPhotos((prev) => [...prev, result]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const removePhoto = (idx: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = () => {
    const finalSceneName = useCustomScene ? customScene.trim() : sceneName.trim();
    if (!finalSceneName) {
      alert('请选择或输入维修场景');
      return;
    }
    if (!date) {
      alert('请选择日期');
      return;
    }
    if (!duration || duration <= 0) {
      alert('请输入有效的耗时');
      return;
    }

    const matchedScene = SCENES.find((s) => s.name === finalSceneName);

    addLog({
      sceneId: matchedScene?.id,
      sceneName: finalSceneName,
      date,
      duration: Number(duration),
      toolsUsed: selectedTools,
      materialsUsed: materials.filter((m) => m.name.trim() && m.amount > 0),
      problems: problems.trim() || undefined,
      tips: tips.trim() || undefined,
      photos,
      costSave: costSave !== '' ? Number(costSave) : matchedScene?.costSave,
    });

    navigate('/logs');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/logs')}
            className="p-2 rounded-xl hover:bg-white hover:shadow-md transition-all"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">新增维修日志</h1>
            <p className="text-slate-500 mt-1">记录你的维修过程与心得</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-800 mb-5 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                <Wrench className="w-4 h-4 text-indigo-600" />
              </div>
              基本信息
            </h2>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  维修场景 <span className="text-rose-500">*</span>
                </label>
                <div className="space-y-2">
                  <div className="flex gap-3 mb-3">
                    <button
                      onClick={() => setUseCustomScene(false)}
                      className={cn(
                        'px-4 py-2 rounded-lg text-sm font-medium transition-all border',
                        !useCustomScene
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
                      )}
                    >
                      从列表选择
                    </button>
                    <button
                      onClick={() => setUseCustomScene(true)}
                      className={cn(
                        'px-4 py-2 rounded-lg text-sm font-medium transition-all border',
                        useCustomScene
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
                      )}
                    >
                      自定义输入
                    </button>
                  </div>

                  {!useCustomScene ? (
                    <div className="relative">
                      <div
                        className="flex items-center justify-between w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-slate-50 cursor-pointer hover:border-indigo-400 transition-colors"
                        onClick={() => setSceneDropdownOpen(!sceneDropdownOpen)}
                      >
                        <span className={cn('text-sm', sceneName ? 'text-slate-800 font-medium' : 'text-slate-400')}>
                          {sceneName || '选择维修场景...'}
                        </span>
                        <ChevronDown
                          className={cn(
                            'w-4 h-4 text-slate-400 transition-transform',
                            sceneDropdownOpen && 'rotate-180'
                          )}
                        />
                      </div>
                      {sceneDropdownOpen && (
                        <div className="absolute z-10 mt-2 w-full max-h-64 overflow-y-auto bg-white rounded-xl border border-slate-200 shadow-xl">
                          <div className="p-2">
                            <input
                              type="text"
                              value={sceneName}
                              onChange={(e) => setSceneName(e.target.value)}
                              placeholder="搜索场景..."
                              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-2"
                            />
                          </div>
                          {filteredSceneOptions.length > 0 ? (
                            filteredSceneOptions.map((s) => (
                              <button
                                key={s.name}
                                onClick={() => handleSceneSelect(s.name, s.costSave)}
                                className={cn(
                                  'w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-indigo-50 transition-colors text-left',
                                  sceneName === s.name && 'bg-indigo-50 text-indigo-700'
                                )}
                              >
                                <span className="text-xl">{s.icon}</span>
                                <span className="flex-1 font-medium text-slate-700">{s.name}</span>
                                {sceneName === s.name && <Check className="w-4 h-4 text-indigo-600" />}
                              </button>
                            ))
                          ) : (
                            <div className="px-4 py-3 text-sm text-slate-400 text-center">无匹配场景</div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={customScene}
                      onChange={(e) => setCustomScene(e.target.value)}
                      placeholder="例如：自制简易晾衣架..."
                      className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    维修日期 <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-slate-400" />
                    耗时（分钟） <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  预计节省金额（元）
                </label>
                <input
                  type="number"
                  min="0"
                  value={costSave}
                  onChange={(e) => setCostSave(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="可选，自动从场景获取"
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-800 mb-5 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                <Wrench className="w-4 h-4 text-amber-600" />
              </div>
              使用工具
            </h2>

            <div className="relative mb-4">
              <div
                className="flex items-center justify-between w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-slate-50 cursor-pointer hover:border-amber-400 transition-colors"
                onClick={() => setToolDropdownOpen(!toolDropdownOpen)}
              >
                <span className="text-sm text-slate-500">
                  {selectedTools.length > 0 ? `已选择 ${selectedTools.length} 项工具` : '点击选择常用工具...'}
                </span>
                <ChevronDown
                  className={cn(
                    'w-4 h-4 text-slate-400 transition-transform',
                    toolDropdownOpen && 'rotate-180'
                  )}
                />
              </div>
              {toolDropdownOpen && (
                <div className="absolute z-10 mt-2 w-full max-h-72 overflow-y-auto bg-white rounded-xl border border-slate-200 shadow-xl">
                  <div className="p-2 border-b border-slate-100">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={customTool}
                        onChange={(e) => setCustomTool(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomTool())}
                        placeholder="输入自定义工具名称..."
                        className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                      <button
                        onClick={addCustomTool}
                        className="px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 transition-colors whitespace-nowrap"
                      >
                        添加
                      </button>
                    </div>
                  </div>
                  <div className="p-2 space-y-0.5">
                    {ALL_TOOLS.map((tool) => (
                      <button
                        key={tool}
                        onClick={() => toggleTool(tool)}
                        className={cn(
                          'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors text-left',
                          selectedTools.includes(tool)
                            ? 'bg-amber-50 text-amber-700 font-medium'
                            : 'hover:bg-slate-50 text-slate-600'
                        )}
                      >
                        <div
                          className={cn(
                            'w-4 h-4 rounded border-2 flex items-center justify-center transition-colors',
                            selectedTools.includes(tool)
                              ? 'bg-amber-500 border-amber-500'
                              : 'border-slate-300'
                          )}
                        >
                          {selectedTools.includes(tool) && <Check className="w-3 h-3 text-white" />}
                        </div>
                        {tool}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {selectedTools.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedTools.map((tool) => (
                  <span
                    key={tool}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 text-sm border border-amber-200"
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    {tool}
                    <button
                      onClick={() => toggleTool(tool)}
                      className="ml-1 hover:text-amber-900 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <Package className="w-4 h-4 text-emerald-600" />
                </div>
                耗材用量
              </h2>
              <button
                onClick={addMaterialRow}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-50 text-emerald-700 text-sm font-medium hover:bg-emerald-100 transition-colors border border-emerald-200"
              >
                <Plus className="w-4 h-4" />
                添加耗材
              </button>
            </div>

            {materials.length === 0 ? (
              <div className="text-center py-8 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                <Package className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-400">暂无耗材记录，点击上方按钮添加</p>
              </div>
            ) : (
              <div className="space-y-3">
                {materials.map((mat, idx) => (
                  <div key={idx} className="flex gap-3 items-start">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={mat.name}
                        onChange={(e) => updateMaterial(idx, 'name', e.target.value)}
                        placeholder="耗材名称（如：生料带）"
                        className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    </div>
                    <div className="w-28">
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={mat.amount}
                        onChange={(e) => updateMaterial(idx, 'amount', Number(e.target.value))}
                        placeholder="数量"
                        className="w-full px-3 py-2.5 rounded-xl border-2 border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    </div>
                    <button
                      onClick={() => removeMaterial(idx)}
                      className="p-2.5 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-800 mb-5 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center">
                <AlertCircle className="w-4 h-4 text-rose-600" />
              </div>
              问题与心得
            </h2>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-rose-400" />
                  遇到的问题
                </label>
                <textarea
                  value={problems}
                  onChange={(e) => setProblems(e.target.value)}
                  rows={3}
                  placeholder="维修过程中遇到了哪些困难？怎么解决的？..."
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-1.5">
                  <Lightbulb className="w-4 h-4 text-amber-400" />
                  心得体会
                </label>
                <textarea
                  value={tips}
                  onChange={(e) => setTips(e.target.value)}
                  rows={3}
                  placeholder="有什么经验总结？下次可以改进的地方？..."
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 resize-none"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-800 mb-5 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-sky-100 flex items-center justify-center">
                <ImageIcon className="w-4 h-4 text-sky-600" />
              </div>
              现场照片
            </h2>

            <div className="grid grid-cols-4 gap-3">
              {photos.map((photo, idx) => (
                <div key={idx} className="relative group aspect-square">
                  <img
                    src={photo}
                    alt={`照片 ${idx + 1}`}
                    className="w-full h-full rounded-xl object-cover border-2 border-slate-200"
                  />
                  <button
                    onClick={() => removePhoto(idx)}
                    className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {photos.length < 9 && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center gap-2 text-slate-400 hover:border-sky-400 hover:text-sky-500 hover:bg-sky-50/50 transition-all"
                >
                  <Upload className="w-7 h-7" />
                  <span className="text-xs font-medium">上传照片</span>
                </button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoUpload}
              className="hidden"
            />
            <p className="mt-3 text-xs text-slate-400">支持 JPG/PNG 格式，最多 9 张，已自动转为 Base64 存储</p>
          </div>

          <div className="flex gap-4 pt-2 pb-8">
            <button
              onClick={() => navigate('/logs')}
              className="flex-1 px-6 py-3.5 rounded-xl border-2 border-slate-200 text-slate-700 font-semibold hover:bg-white hover:border-slate-300 transition-all"
            >
              取消
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold hover:from-indigo-700 hover:to-violet-700 transition-all shadow-lg shadow-indigo-600/25"
            >
              <Save className="w-5 h-5" />
              保存日志
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
