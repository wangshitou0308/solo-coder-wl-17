import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Tool,
  Material,
  SkillRecord,
  RepairLog,
  ShoppingItem,
} from '../types';

interface MonthlyLogStats {
  totalCount: number;
  totalDuration: number;
  totalCostSave: number;
  categoryCount: Record<string, number>;
}

interface InventoryCheckResult {
  toolMissing: { name: string; spec?: string }[];
  materialShortage: {
    name: string;
    spec?: string;
    needed: number;
    available: number;
    unit: string;
  }[];
  materialMissing: { name: string; spec?: string; needed: number; unit: string }[];
  hasIssues: boolean;
}

interface AppState {
  tools: Tool[];
  materials: Material[];
  skills: SkillRecord[];
  logs: RepairLog[];
  shoppingList: ShoppingItem[];

  addTool: (tool: Omit<Tool, 'id' | 'createdAt'>) => void;
  updateTool: (id: string, updates: Partial<Omit<Tool, 'id' | 'createdAt'>>) => void;
  removeTool: (id: string) => void;

  addMaterial: (material: Omit<Material, 'id' | 'createdAt'>) => void;
  updateMaterial: (
    id: string,
    updates: Partial<Omit<Material, 'id' | 'createdAt'>>
  ) => void;
  removeMaterial: (id: string) => void;
  consumeMaterials: (
    usages: { name: string; amount: number }[]
  ) => { success: boolean; shortages: { name: string; needed: number; available: number }[] };

  addSkill: (skill: Omit<SkillRecord, 'learnedAt'>) => void;
  updateSkill: (sceneId: string, updates: Partial<Omit<SkillRecord, 'sceneId' | 'learnedAt'>>) => void;
  removeSkill: (sceneId: string) => void;

  addLog: (log: Omit<RepairLog, 'id' | 'createdAt'>) => void;
  updateLog: (id: string, updates: Partial<Omit<RepairLog, 'id' | 'createdAt'>>) => void;
  removeLog: (id: string) => void;

  addShoppingItem: (item: Omit<ShoppingItem, 'id' | 'addedAt' | 'purchased'>) => boolean;
  updateShoppingItem: (
    id: string,
    updates: Partial<Omit<ShoppingItem, 'id' | 'addedAt'>>
  ) => void;
  removeShoppingItem: (id: string) => void;
  toggleShoppingItemPurchased: (id: string) => void;
  isShoppingItemDuplicate: (name: string, type: 'tool' | 'material', spec?: string) => boolean;

  getCurrentMonthLogStats: () => MonthlyLogStats;
  checkInventory: (
    requiredTools: { name: string; spec?: string }[],
    requiredMaterials: { name: string; spec?: string; amount: number; unit: string }[]
  ) => InventoryCheckResult;
}

const generateId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      tools: [],
      materials: [],
      skills: [],
      logs: [],
      shoppingList: [],

      addTool: (tool) =>
        set((state) => ({
          tools: [
            ...state.tools,
            { ...tool, id: generateId(), createdAt: new Date().toISOString() },
          ],
        })),
      updateTool: (id, updates) =>
        set((state) => ({
          tools: state.tools.map((t) => (t.id === id ? { ...t, ...updates } : t)),
        })),
      removeTool: (id) =>
        set((state) => ({
          tools: state.tools.filter((t) => t.id !== id),
        })),

      addMaterial: (material) =>
        set((state) => ({
          materials: [
            ...state.materials,
            { ...material, id: generateId(), createdAt: new Date().toISOString() },
          ],
        })),
      updateMaterial: (id, updates) =>
        set((state) => ({
          materials: state.materials.map((m) =>
            m.id === id ? { ...m, ...updates } : m
          ),
        })),
      removeMaterial: (id) =>
        set((state) => ({
          materials: state.materials.filter((m) => m.id !== id),
        })),

      consumeMaterials: (usages) => {
        const { materials } = get();
        const shortages: { name: string; needed: number; available: number }[] = [];
        const normalized = (s: string) => s.trim().toLowerCase();
        const fuzzyMatch = (a: string, b: string) => {
          const na = normalized(a);
          const nb = normalized(b);
          return na === nb || na.includes(nb) || nb.includes(na);
        };

        for (const usage of usages) {
          const matched = materials.find((m) => fuzzyMatch(m.name, usage.name));
          if (!matched) {
            shortages.push({ name: usage.name, needed: usage.amount, available: 0 });
          } else if (matched.quantity < usage.amount) {
            shortages.push({
              name: usage.name,
              needed: usage.amount,
              available: matched.quantity,
            });
          }
        }

        if (shortages.length > 0) {
          return { success: false, shortages };
        }

        set((state) => ({
          materials: state.materials.map((m) => {
            const usage = usages.find((u) => fuzzyMatch(u.name, m.name));
            if (usage) {
              return { ...m, quantity: Math.max(0, m.quantity - usage.amount) };
            }
            return m;
          }),
        }));

        return { success: true, shortages: [] };
      },

      addSkill: (skill) =>
        set((state) => {
          const existing = state.skills.find((s) => s.sceneId === skill.sceneId);
          if (existing) {
            return {
              skills: state.skills.map((s) =>
                s.sceneId === skill.sceneId
                  ? { ...s, ...skill, learnedAt: new Date().toISOString() }
                  : s
              ),
            };
          }
          return {
            skills: [
              ...state.skills,
              { ...skill, learnedAt: new Date().toISOString() },
            ],
          };
        }),
      updateSkill: (sceneId, updates) =>
        set((state) => ({
          skills: state.skills.map((s) =>
            s.sceneId === sceneId ? { ...s, ...updates } : s
          ),
        })),
      removeSkill: (sceneId) =>
        set((state) => ({
          skills: state.skills.filter((s) => s.sceneId !== sceneId),
        })),

      addLog: (log) =>
        set((state) => ({
          logs: [
            { ...log, id: generateId(), createdAt: new Date().toISOString() },
            ...state.logs,
          ],
        })),
      updateLog: (id, updates) =>
        set((state) => ({
          logs: state.logs.map((l) => (l.id === id ? { ...l, ...updates } : l)),
        })),
      removeLog: (id) =>
        set((state) => ({
          logs: state.logs.filter((l) => l.id !== id),
        })),

      isShoppingItemDuplicate: (name, type, spec) => {
        const { shoppingList } = get();
        const normalized = (s?: string) => (s ?? '').trim().toLowerCase();
        return shoppingList.some(
          (i) =>
            i.type === type &&
            normalized(i.name) === normalized(name) &&
            normalized(i.spec) === normalized(spec)
        );
      },

      addShoppingItem: (item) => {
        const { isShoppingItemDuplicate } = get();
        if (isShoppingItemDuplicate(item.name, item.type, item.spec)) {
          return false;
        }
        set((state) => ({
          shoppingList: [
            ...state.shoppingList,
            {
              ...item,
              id: generateId(),
              addedAt: new Date().toISOString(),
              purchased: false,
            },
          ],
        }));
        return true;
      },
      updateShoppingItem: (id, updates) =>
        set((state) => ({
          shoppingList: state.shoppingList.map((item) =>
            item.id === id ? { ...item, ...updates } : item
          ),
        })),
      removeShoppingItem: (id) =>
        set((state) => ({
          shoppingList: state.shoppingList.filter((item) => item.id !== id),
        })),
      toggleShoppingItemPurchased: (id) =>
        set((state) => ({
          shoppingList: state.shoppingList.map((item) =>
            item.id === id ? { ...item, purchased: !item.purchased } : item
          ),
        })),

      getCurrentMonthLogStats: () => {
        const { logs } = get();
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();

        const monthLogs = logs.filter((log) => {
          const logDate = new Date(log.date);
          return (
            logDate.getFullYear() === currentYear &&
            logDate.getMonth() === currentMonth
          );
        });

        const totalCount = monthLogs.length;
        const totalDuration = monthLogs.reduce((sum, log) => sum + log.duration, 0);
        const totalCostSave = monthLogs.reduce(
          (sum, log) => sum + (log.costSave ?? 0),
          0
        );

        const categoryCount: Record<string, number> = {};
        for (const log of monthLogs) {
          const key = log.sceneName;
          categoryCount[key] = (categoryCount[key] ?? 0) + 1;
        }

        return { totalCount, totalDuration, totalCostSave, categoryCount };
      },

      checkInventory: (requiredTools, requiredMaterials) => {
        const { tools, materials } = get();
        const normalized = (s?: string) =>
          (s ?? '').trim().toLowerCase();
        const fuzzyMatch = (a: string, b: string) => {
          const na = normalized(a);
          const nb = normalized(b);
          return na === nb || na.includes(nb) || nb.includes(na);
        };

        const toolMissing: { name: string; spec?: string }[] = [];
        for (const reqTool of requiredTools) {
          const found = tools.some((t) => fuzzyMatch(t.name, reqTool.name));
          if (!found) {
            toolMissing.push({ name: reqTool.name, spec: reqTool.spec });
          }
        }

        const materialShortage: {
          name: string;
          spec?: string;
          needed: number;
          available: number;
          unit: string;
        }[] = [];
        const materialMissing: {
          name: string;
          spec?: string;
          needed: number;
          unit: string;
        }[] = [];

        for (const reqMat of requiredMaterials) {
          const matched = materials.find((m) =>
            fuzzyMatch(m.name, reqMat.name)
          );

          if (!matched) {
            materialMissing.push({
              name: reqMat.name,
              spec: reqMat.spec,
              needed: reqMat.amount,
              unit: reqMat.unit,
            });
          } else if (matched.quantity < reqMat.amount) {
            materialShortage.push({
              name: reqMat.name,
              spec: reqMat.spec,
              needed: reqMat.amount,
              available: matched.quantity,
              unit: reqMat.unit,
            });
          }
        }

        const hasIssues =
          toolMissing.length > 0 ||
          materialShortage.length > 0 ||
          materialMissing.length > 0;

        return { toolMissing, materialShortage, materialMissing, hasIssues };
      },
    }),
    {
      name: 'home-repair-app-storage',
      partialize: (state) => ({
        tools: state.tools,
        materials: state.materials,
        skills: state.skills,
        logs: state.logs,
        shoppingList: state.shoppingList,
      }),
    }
  )
);
