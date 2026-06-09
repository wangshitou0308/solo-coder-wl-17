import { useState, useMemo } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Package,
  AlertTriangle,
  CheckCircle2,
  MinusCircle,
  Scale,
  Ruler,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { Modal, ModalAction } from '@/components/common/Modal';
import { EmptyState } from '@/components/common/EmptyState';
import type { Material } from '@/types';
import { cn } from '@/lib/utils';

interface MaterialFormData {
  name: string;
  spec: string;
  quantity: number;
  unit: string;
  threshold: number;
  note: string;
}

const defaultFormData: MaterialFormData = {
  name: '',
  spec: '',
  quantity: 0,
  unit: '个',
  threshold: 5,
  note: '',
};

const COMMON_UNITS = ['个', '米', '升', '千克', '克', '卷', '盒', '包', '瓶', '套'];

type StockStatus = 'sufficient' | 'warning' | 'critical' | 'empty';

const STATUS_CONFIG: Record<
  StockStatus,
  { label: string; className: string; icon: typeof CheckCircle2 }
> = {
  sufficient: {
    label: '充足',
    className: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    icon: CheckCircle2,
  },
  warning: {
    label: '偏低',
    className: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    icon: MinusCircle,
  },
  critical: {
    label: '紧急',
    className: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
    icon: AlertTriangle,
  },
  empty: {
    label: '缺货',
    className: 'bg-slate-700/50 text-slate-400 border-slate-600/60',
    icon: AlertTriangle,
  },
};

function getStockStatus(quantity: number, threshold: number): StockStatus {
  if (quantity <= 0) return 'empty';
  if (quantity < threshold * 0.5) return 'critical';
  if (quantity <= threshold) return 'warning';
  return 'sufficient';
}

export default function Materials() {
  const { materials, addMaterial, updateMaterial, removeMaterial } = useAppStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [formData, setFormData] = useState<MaterialFormData>(defaultFormData);

  const sortedMaterials = useMemo(
    () =>
      [...materials].sort((a, b) => {
        const aStatus = getStockStatus(a.quantity, a.threshold);
        const bStatus = getStockStatus(b.quantity, b.threshold);
        const priority: Record<StockStatus, number> = {
          empty: 0,
          critical: 1,
          warning: 2,
          sufficient: 3,
        };
        if (priority[aStatus] !== priority[bStatus]) {
          return priority[aStatus] - priority[bStatus];
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }),
    [materials]
  );

  const stats = useMemo(() => {
    let criticalCount = 0;
    let warningCount = 0;
    for (const m of materials) {
      const status = getStockStatus(m.quantity, m.threshold);
      if (status === 'critical' || status === 'empty') criticalCount++;
      else if (status === 'warning') warningCount++;
    }
    return { criticalCount, warningCount, total: materials.length };
  }, [materials]);

  const handleOpenAdd = () => {
    setEditingMaterial(null);
    setFormData(defaultFormData);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (material: Material) => {
    setEditingMaterial(material);
    setFormData({
      name: material.name,
      spec: material.spec,
      quantity: material.quantity,
      unit: material.unit,
      threshold: material.threshold,
      note: material.note ?? '',
    });
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setEditingMaterial(null);
    setFormData(defaultFormData);
  };

  const handleSubmit = () => {
    if (!formData.name.trim() || !formData.spec.trim()) return;
    if (formData.quantity < 0 || formData.threshold < 0) return;

    const payload = {
      name: formData.name.trim(),
      spec: formData.spec.trim(),
      quantity: formData.quantity,
      unit: formData.unit.trim() || '个',
      threshold: formData.threshold,
      note: formData.note.trim() || undefined,
    };

    if (editingMaterial) {
      updateMaterial(editingMaterial.id, payload);
    } else {
      addMaterial(payload);
    }

    handleClose();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('确定要删除这个耗材吗？')) {
      removeMaterial(id);
    }
  };

  const isFormValid =
    formData.name.trim() &&
    formData.spec.trim() &&
    formData.quantity >= 0 &&
    formData.threshold >= 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">耗材库存</h1>
          <p className="mt-1 text-sm text-slate-400">管理耗材存量，低于阈值自动预警</p>
        </div>
        <div className="flex items-center gap-3">
          {(stats.criticalCount > 0 || stats.warningCount > 0) && (
            <div className="hidden sm:flex items-center gap-2 text-xs">
              {stats.criticalCount > 0 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-rose-500/15 text-rose-300 border border-rose-500/30 font-medium">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {stats.criticalCount} 项需补购
                </span>
              )}
              {stats.warningCount > 0 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/30 font-medium">
                  <MinusCircle className="w-3.5 h-3.5" />
                  {stats.warningCount} 项偏低
                </span>
              )}
            </div>
          )}
          <button
            onClick={handleOpenAdd}
            className="group inline-flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 bg-primary-600 hover:bg-primary-500 text-white shadow-glow-sm hover:shadow-glow border border-primary-500/30"
          >
            <Plus className="w-4 h-4 transition-transform duration-200 group-hover:rotate-90" />
            新增耗材
          </button>
        </div>
      </div>

      {sortedMaterials.length === 0 ? (
        <div className="bg-slate-900/50 border border-slate-700/60 rounded-xl">
          <EmptyState
            title="暂无耗材记录"
            description="添加常用耗材并设置预警阈值"
            icon={Package}
            actionLabel="新增耗材"
            onAction={handleOpenAdd}
            size="lg"
          />
        </div>
      ) : (
        <div className="bg-slate-900/50 border border-slate-700/60 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700/60 bg-slate-900/80">
                  <th className="text-left text-xs font-semibold text-slate-300 px-5 py-3 uppercase tracking-wider">
                    名称 / 规格
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-300 px-5 py-3 uppercase tracking-wider w-72">
                    剩余数量
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-300 px-5 py-3 uppercase tracking-wider w-28">
                    状态
                  </th>
                  <th className="text-right text-xs font-semibold text-slate-300 px-5 py-3 uppercase tracking-wider w-32">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {sortedMaterials.map((material) => {
                  const status = getStockStatus(material.quantity, material.threshold);
                  const statusConfig = STATUS_CONFIG[status];
                  const StatusIcon = statusConfig.icon;
                  const isLowStock = status === 'critical' || status === 'empty';
                  const progressPercent = Math.min(
                    100,
                    material.threshold > 0
                      ? (material.quantity / Math.max(material.threshold * 2, 1)) * 100
                      : 0
                  );

                  return (
                    <tr
                      key={material.id}
                      className={cn(
                        'transition-colors duration-200',
                        isLowStock
                          ? 'bg-rose-950/20 hover:bg-rose-950/30'
                          : 'hover:bg-slate-800/40'
                      )}
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-start gap-3">
                          <div
                            className={cn(
                              'shrink-0 w-9 h-9 rounded-lg flex items-center justify-center',
                              isLowStock
                                ? 'bg-rose-500/15 border border-rose-500/30'
                                : 'bg-primary-500/15 border border-primary-500/30'
                            )}
                          >
                            <Package
                              className={cn(
                                'w-4.5 h-4.5',
                                isLowStock ? 'text-rose-400' : 'text-primary-400'
                              )}
                            />
                          </div>
                          <div className="min-w-0">
                            <p
                              className={cn(
                                'font-medium truncate',
                                isLowStock ? 'text-rose-200' : 'text-white'
                              )}
                            >
                              {material.name}
                            </p>
                            <p className="mt-0.5 text-xs text-slate-400 truncate">
                              {material.spec}
                              {material.note && (
                                <span className="text-slate-500"> · {material.note}</span>
                              )}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="space-y-2">
                          <div className="flex items-baseline justify-between gap-2">
                            <div className="flex items-baseline gap-1">
                              <span
                                className={cn(
                                  'text-lg font-bold tabular-nums',
                                  isLowStock
                                    ? 'text-rose-300'
                                    : status === 'warning'
                                    ? 'text-amber-300'
                                    : 'text-white'
                                )}
                              >
                                {material.quantity}
                              </span>
                              <span className="text-xs text-slate-400">{material.unit}</span>
                            </div>
                            <div className="flex items-center gap-1 text-[11px] text-slate-500">
                              <Scale className="w-3 h-3" />
                              阈值 {material.threshold}
                            </div>
                          </div>

                          <div className="relative h-2 rounded-full bg-slate-800 overflow-hidden">
                            <div
                              className={cn(
                                'absolute inset-y-0 left-0 rounded-full transition-all duration-500',
                                isLowStock
                                  ? 'bg-gradient-to-r from-rose-600 to-rose-500'
                                  : status === 'warning'
                                  ? 'bg-gradient-to-r from-amber-600 to-amber-500'
                                  : 'bg-gradient-to-r from-primary-600 to-primary-400'
                              )}
                              style={{ width: `${progressPercent}%` }}
                            />
                            <div
                              className="absolute top-0 bottom-0 w-px bg-slate-600/60"
                              style={{
                                left: `${material.threshold > 0 ? Math.min(50, (material.threshold / Math.max(material.threshold * 2, 1)) * 100) : 0}%`,
                              }}
                            />
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={cn(
                            'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border',
                            statusConfig.className
                          )}
                        >
                          <StatusIcon className="w-3.5 h-3.5" />
                          {statusConfig.label}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEdit(material)}
                            className="inline-flex items-center justify-center w-8 h-8 rounded-md transition-colors bg-slate-800/60 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700/60"
                            title="编辑"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(material.id)}
                            className="inline-flex items-center justify-center w-8 h-8 rounded-md transition-colors bg-rose-900/20 hover:bg-rose-900/40 text-rose-400 hover:text-rose-300 border border-rose-800/40"
                            title="删除"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={handleClose}
        icon={Package}
        title={editingMaterial ? '编辑耗材' : '新增耗材'}
        description={editingMaterial ? '修改耗材库存信息' : '添加新耗材到库存清单'}
        size="lg"
        footer={
          <>
            <ModalAction label="取消" variant="ghost" onClick={handleClose} />
            <ModalAction
              label={editingMaterial ? '保存修改' : '添加耗材'}
              variant="primary"
              onClick={handleSubmit}
              disabled={!isFormValid}
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
                耗材名称 <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="例如：自攻螺丝"
                className="w-full px-3.5 py-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-primary-500/60 focus:ring-2 focus:ring-primary-500/20 transition-all"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                规格 <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <Ruler className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={formData.spec}
                  onChange={(e) => setFormData({ ...formData, spec: e.target.value })}
                  placeholder="例如：M4×20mm 不锈钢"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-primary-500/60 focus:ring-2 focus:ring-primary-500/20 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                当前数量
              </label>
              <input
                type="number"
                min={0}
                value={formData.quantity}
                onChange={(e) =>
                  setFormData({ ...formData, quantity: Math.max(0, Number(e.target.value) || 0) })
                }
                className={cn(
                  'w-full px-3.5 py-2.5 rounded-lg border text-white text-sm',
                  'focus:outline-none focus:ring-2 transition-all',
                  formData.quantity <= formData.threshold && formData.quantity > 0
                    ? 'bg-amber-950/30 border-amber-700/50 focus:border-amber-500/60 focus:ring-amber-500/20'
                    : formData.quantity === 0
                    ? 'bg-rose-950/30 border-rose-700/50 focus:border-rose-500/60 focus:ring-rose-500/20'
                    : 'bg-slate-800/60 border-slate-700/60 focus:border-primary-500/60 focus:ring-primary-500/20'
                )}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                单位
              </label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60 text-white text-sm focus:outline-none focus:border-primary-500/60 focus:ring-2 focus:ring-primary-500/20 transition-all"
              >
                {COMMON_UNITS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-slate-300">
                  预警阈值
                </label>
                <span className="text-[11px] text-slate-500">
                  数量低于此值将标红提醒
                </span>
              </div>
              <input
                type="number"
                min={0}
                value={formData.threshold}
                onChange={(e) =>
                  setFormData({ ...formData, threshold: Math.max(0, Number(e.target.value) || 0) })
                }
                className="w-full px-3.5 py-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60 text-white text-sm focus:outline-none focus:border-primary-500/60 focus:ring-2 focus:ring-primary-500/20 transition-all"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                备注
              </label>
              <textarea
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                placeholder="采购来源、保质期、使用注意等..."
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
