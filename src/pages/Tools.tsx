import { useState, useMemo } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Wrench,
  Zap,
  Hammer,
  Home,
  Bike,
  Droplets,
  Box,
  MapPin,
  Calendar,
  Tag,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { Modal, ModalAction } from '@/components/common/Modal';
import { EmptyState } from '@/components/common/EmptyState';
import type { Tool } from '@/types';
import { cn } from '@/lib/utils';

const TOOL_CATEGORY_ICONS: Record<string, typeof Wrench> = {
  plumbing: Droplets,
  electrical: Zap,
  carpentry: Hammer,
  hardware: Wrench,
  appliance: Home,
  daily: Box,
  textile: Tag,
  bike: Bike,
  default: Wrench,
};

const TOOL_CATEGORY_OPTIONS = [
  { value: 'plumbing', label: '💧 水管' },
  { value: 'electrical', label: '⚡ 电气' },
  { value: 'carpentry', label: '🪵 木工' },
  { value: 'hardware', label: '🔩 五金' },
  { value: 'appliance', label: '📺 家电' },
  { value: 'daily', label: '🏠 日常' },
  { value: 'textile', label: '🧵 纺织' },
  { value: 'bike', label: '🚲 自行车' },
];

interface ToolFormData {
  name: string;
  category: string;
  brand: string;
  model: string;
  purchaseDate: string;
  location: string;
  note: string;
}

const defaultFormData: ToolFormData = {
  name: '',
  category: 'hardware',
  brand: '',
  model: '',
  purchaseDate: '',
  location: '',
  note: '',
};

export default function Tools() {
  const { tools, addTool, updateTool, removeTool } = useAppStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTool, setEditingTool] = useState<Tool | null>(null);
  const [formData, setFormData] = useState<ToolFormData>(defaultFormData);

  const sortedTools = useMemo(
    () => [...tools].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [tools]
  );

  const handleOpenAdd = () => {
    setEditingTool(null);
    setFormData(defaultFormData);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (tool: Tool) => {
    setEditingTool(tool);
    setFormData({
      name: tool.name,
      category: tool.category,
      brand: tool.brand ?? '',
      model: tool.model ?? '',
      purchaseDate: tool.purchaseDate ?? '',
      location: tool.location,
      note: tool.note ?? '',
    });
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setEditingTool(null);
    setFormData(defaultFormData);
  };

  const handleSubmit = () => {
    if (!formData.name.trim() || !formData.location.trim()) return;

    const payload = {
      name: formData.name.trim(),
      category: formData.category,
      brand: formData.brand.trim() || undefined,
      model: formData.model.trim() || undefined,
      purchaseDate: formData.purchaseDate || undefined,
      location: formData.location.trim(),
      note: formData.note.trim() || undefined,
    };

    if (editingTool) {
      updateTool(editingTool.id, payload);
    } else {
      addTool(payload);
    }

    handleClose();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('确定要删除这个工具吗？')) {
      removeTool(id);
    }
  };

  const getCategoryIcon = (category: string) =>
    TOOL_CATEGORY_ICONS[category] ?? TOOL_CATEGORY_ICONS.default;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">工具库存</h1>
          <p className="mt-1 text-sm text-slate-400">管理您的工具箱，追踪存放位置</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="group inline-flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 bg-primary-600 hover:bg-primary-500 text-white shadow-glow-sm hover:shadow-glow border border-primary-500/30"
        >
          <Plus className="w-4 h-4 transition-transform duration-200 group-hover:rotate-90" />
          新增工具
        </button>
      </div>

      {sortedTools.length === 0 ? (
        <div className="bg-slate-900/50 border border-slate-700/60 rounded-xl">
          <EmptyState
            title="暂无工具记录"
            description="点击右上角按钮添加您的第一个工具"
            icon={Wrench}
            actionLabel="新增工具"
            onAction={handleOpenAdd}
            size="lg"
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedTools.map((tool) => {
            const IconComponent = getCategoryIcon(tool.category);
            const categoryInfo = TOOL_CATEGORY_OPTIONS.find((c) => c.value === tool.category);

            return (
              <div
                key={tool.id}
                className="group relative bg-slate-900/50 border border-slate-700/60 rounded-xl overflow-hidden transition-all duration-200 hover:border-primary-500/40 hover:shadow-glow-sm"
              >
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-600 via-primary-500 to-primary-400 opacity-60" />

                <div className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="relative shrink-0 w-12 h-12 rounded-xl bg-primary-500/15 border border-primary-500/30 flex items-center justify-center">
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary-500/20 to-transparent" />
                      <IconComponent className="relative z-10 w-6 h-6 text-primary-400" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-base font-semibold text-white truncate">
                          {tool.name}
                        </h3>
                        {categoryInfo && (
                          <span className="shrink-0 px-2 py-0.5 rounded-md text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700/60">
                            {categoryInfo.label.split(' ')[0]}
                          </span>
                        )}
                      </div>

                      {(tool.brand || tool.model) && (
                        <p className="mt-1 text-xs text-slate-400 truncate">
                          {[tool.brand, tool.model].filter(Boolean).join(' · ')}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 space-y-2.5">
                    <div className="flex items-center gap-2 text-xs">
                      <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="px-2 py-1 rounded-md bg-primary-500/10 text-primary-300 border border-primary-500/20 font-medium">
                        {tool.location}
                      </span>
                    </div>

                    {tool.purchaseDate && (
                      <div className="flex items-center gap-2 text-xs">
                        <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span className="text-slate-400">{tool.purchaseDate}</span>
                      </div>
                    )}

                    {tool.note && (
                      <div className="flex items-start gap-2 text-xs pt-1">
                        <Tag className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                        <span className="text-slate-400 line-clamp-2">{tool.note}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-700/60 flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleOpenEdit(tool)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      编辑
                    </button>
                    <button
                      onClick={() => handleDelete(tool.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors bg-rose-900/30 hover:bg-rose-900/50 text-rose-300 hover:text-rose-200 border border-rose-700/40"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      删除
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={handleClose}
        icon={Wrench}
        title={editingTool ? '编辑工具' : '新增工具'}
        description={editingTool ? '修改工具信息' : '添加新工具到库存'}
        size="lg"
        footer={
          <>
            <ModalAction label="取消" variant="ghost" onClick={handleClose} />
            <ModalAction
              label={editingTool ? '保存修改' : '添加工具'}
              variant="primary"
              onClick={handleSubmit}
              disabled={!formData.name.trim() || !formData.location.trim()}
            />
          </>
        }
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                工具名称 <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="例如：十字螺丝刀"
                className="w-full px-3.5 py-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-primary-500/60 focus:ring-2 focus:ring-primary-500/20 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                分类
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60 text-white text-sm focus:outline-none focus:border-primary-500/60 focus:ring-2 focus:ring-primary-500/20 transition-all"
              >
                {TOOL_CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                存放位置 <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="例如：工具柜A-3层"
                className="w-full px-3.5 py-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-primary-500/60 focus:ring-2 focus:ring-primary-500/20 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                品牌
              </label>
              <input
                type="text"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                placeholder="例如：博世"
                className="w-full px-3.5 py-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-primary-500/60 focus:ring-2 focus:ring-primary-500/20 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                型号
              </label>
              <input
                type="text"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                placeholder="例如：PH-200"
                className="w-full px-3.5 py-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-primary-500/60 focus:ring-2 focus:ring-primary-500/20 transition-all"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                购买日期
              </label>
              <input
                type="date"
                value={formData.purchaseDate}
                onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                className={cn(
                  'w-full px-3.5 py-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60 text-white text-sm',
                  'focus:outline-none focus:border-primary-500/60 focus:ring-2 focus:ring-primary-500/20 transition-all',
                  '[color-scheme:dark]'
                )}
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                备注
              </label>
              <textarea
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                placeholder="使用注意事项、校准记录等..."
                rows={3}
                className="w-full px-3.5 py-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-primary-500/60 focus:ring-2 focus:ring-primary-500/20 transition-all resize-none"
              />
            </div>
          </div>

          <div className="hidden">
            <button type="submit">提交</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
