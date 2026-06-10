import { useState, useMemo } from 'react';
import {
  ShoppingCart,
  Check,
  Trash2,
  Filter,
  Package,
  Wrench,
  Circle,
  CheckCircle2,
  X,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { EmptyState } from '@/components/common/EmptyState';
import { cn, formatDate } from '@/lib/utils';

type FilterType = 'all' | 'tool' | 'material';
type FilterStatus = 'all' | 'unpurchased' | 'purchased';

export default function ShoppingList() {
  const {
    shoppingList,
    toggleShoppingItemPurchased,
    removeShoppingItem,
  } = useAppStore();

  const [typeFilter, setTypeFilter] = useState<FilterType>('all');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');

  const filteredItems = useMemo(() => {
    return shoppingList.filter((item) => {
      const matchType = typeFilter === 'all' || item.type === typeFilter;
      const matchStatus =
        statusFilter === 'all' ||
        (statusFilter === 'purchased' && item.purchased) ||
        (statusFilter === 'unpurchased' && !item.purchased);
      return matchType && matchStatus;
    });
  }, [shoppingList, typeFilter, statusFilter]);

  const unpurchasedCount = shoppingList.filter((i) => !i.purchased).length;
  const purchasedCount = shoppingList.filter((i) => i.purchased).length;

  const typeOptions: { value: FilterType; label: string; icon: typeof Package }[] = [
    { value: 'all', label: '全部', icon: ShoppingCart },
    { value: 'tool', label: '工具', icon: Wrench },
    { value: 'material', label: '耗材', icon: Package },
  ];

  const statusOptions: { value: FilterStatus; label: string }[] = [
    { value: 'all', label: '全部' },
    { value: 'unpurchased', label: `未购 (${unpurchasedCount})` },
    { value: 'purchased', label: `已购 (${purchasedCount})` },
  ];

  const sortedItems = useMemo(() => {
    return [...filteredItems].sort((a, b) => {
      if (a.purchased !== b.purchased) return a.purchased ? 1 : -1;
      return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();
    });
  }, [filteredItems]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-rose-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">采购清单</h1>
              <p className="text-slate-500 mt-1">
                共 {shoppingList.length} 项，待购 {unpurchasedCount} 项
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-6 shadow-sm">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 text-slate-500 text-sm">
              <Filter className="w-4 h-4" />
              <span>类型筛选:</span>
            </div>
            <div className="flex gap-2">
              {typeOptions.map((opt) => {
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setTypeFilter(opt.value)}
                    className={cn(
                      'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all border',
                      typeFilter === opt.value
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600'
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {opt.label}
                  </button>
                );
              })}
            </div>

            <div className="h-6 w-px bg-slate-200 mx-2" />

            <div className="flex gap-2">
              {statusOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setStatusFilter(opt.value)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-sm font-medium transition-all border',
                    statusFilter === opt.value
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-300 hover:text-emerald-600'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {sortedItems.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
            <EmptyState
              title="暂无采购项"
              description={
                statusFilter === 'purchased'
                  ? '还没有已购买的物品'
                  : statusFilter === 'unpurchased'
                    ? '所有物品都已购买'
                    : '从知识详情页可以将缺少的工具或耗材加入采购清单'
              }
              icon={ShoppingCart}
              size="lg"
            />
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <ul className="divide-y divide-slate-100">
              {sortedItems.map((item) => (
                <li
                  key={item.id}
                  className={cn(
                    'px-5 py-4 hover:bg-slate-50 transition-colors group',
                    item.purchased && 'bg-slate-50/50'
                  )}
                >
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => toggleShoppingItemPurchased(item.id)}
                      className={cn(
                        'shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all',
                        item.purchased
                          ? 'bg-emerald-500 border-emerald-500 text-white'
                          : 'border-slate-300 hover:border-emerald-400 text-transparent hover:text-emerald-400'
                      )}
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>

                    <div
                      className={cn(
                        'w-10 h-10 rounded-lg flex items-center justify-center shrink-0',
                        item.type === 'tool'
                          ? 'bg-amber-50 text-amber-600'
                          : 'bg-emerald-50 text-emerald-600'
                      )}
                    >
                      {item.type === 'tool' ? (
                        <Wrench className="w-5 h-5" />
                      ) : (
                        <Package className="w-5 h-5" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3
                          className={cn(
                            'font-medium',
                            item.purchased
                              ? 'text-slate-400 line-through'
                              : 'text-slate-800'
                          )}
                        >
                          {item.name}
                        </h3>
                        <span
                          className={cn(
                            'text-xs px-2 py-0.5 rounded-full',
                            item.type === 'tool'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-emerald-100 text-emerald-700'
                          )}
                        >
                          {item.type === 'tool' ? '工具' : '耗材'}
                        </span>
                      </div>
                      {item.spec && (
                        <p
                          className={cn(
                            'text-sm mt-0.5',
                            item.purchased ? 'text-slate-300' : 'text-slate-500'
                          )}
                        >
                          规格：{item.spec}
                        </p>
                      )}
                      {item.reason && (
                        <p
                          className={cn(
                            'text-sm mt-1',
                            item.purchased ? 'text-slate-300' : 'text-slate-400'
                          )}
                        >
                          原因：{item.reason}
                        </p>
                      )}
                      <p className="text-xs text-slate-400 mt-1">
                        加入于 {formatDate(item.addedAt)}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        if (confirm('确定要删除这条采购记录吗？')) {
                          removeShoppingItem(item.id);
                        }
                      }}
                      className="shrink-0 p-2 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all opacity-0 group-hover:opacity-100"
                      title="删除"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
