export type SceneCategory =
  | 'plumbing'
  | 'electrical'
  | 'carpentry'
  | 'hardware'
  | 'appliance'
  | 'daily'
  | 'textile'
  | 'bike';

export type Difficulty = 1 | 2 | 3 | 4;

export interface SceneTool {
  name: string;
  spec?: string;
}

export interface SceneMaterial {
  name: string;
  spec?: string;
  amount: number;
  unit: string;
}

export interface SceneStep {
  title: string;
  detail: string;
  tip?: string;
}

export interface RepairScene {
  id: string;
  name: string;
  category: SceneCategory;
  difficulty: Difficulty;
  estimatedTime: number;
  costSave: number;
  icon: string;
  keywords: string[];
  description: string;
  tools: SceneTool[];
  materials: SceneMaterial[];
  steps: SceneStep[];
}

export interface Tool {
  id: string;
  name: string;
  category: string;
  brand?: string;
  model?: string;
  purchaseDate?: string;
  location: string;
  note?: string;
  createdAt: string;
}

export interface Material {
  id: string;
  name: string;
  spec: string;
  quantity: number;
  unit: string;
  threshold: number;
  note?: string;
  createdAt: string;
}

export type Proficiency = 1 | 2 | 3 | 4 | 5;

export interface SkillRecord {
  sceneId: string;
  proficiency: Proficiency;
  learnedAt: string;
  note?: string;
}

export interface MaterialUsage {
  name: string;
  amount: number;
}

export interface RepairLog {
  id: string;
  sceneId?: string;
  sceneName: string;
  date: string;
  duration: number;
  toolsUsed: string[];
  materialsUsed: MaterialUsage[];
  problems?: string;
  tips?: string;
  photos: string[];
  costSave?: number;
  createdAt: string;
}

export interface ShoppingItem {
  id: string;
  name: string;
  type: 'tool' | 'material';
  spec?: string;
  reason: string;
  addedAt: string;
  purchased: boolean;
}

export const CATEGORY_LABELS: Record<SceneCategory, string> = {
  plumbing: '💧 水管',
  electrical: '⚡ 电气',
  carpentry: '🪵 木工',
  hardware: '🔩 五金',
  appliance: '📺 家电',
  daily: '🏠 日常',
  textile: '🧵 纺织',
  bike: '🚲 自行',
};

export const CATEGORY_COLORS: Record<SceneCategory, string> = {
  plumbing: 'from-sky-500 to-blue-600',
  electrical: 'from-amber-400 to-orange-500',
  carpentry: 'from-amber-700 to-yellow-800',
  hardware: 'from-slate-500 to-zinc-700',
  appliance: 'from-indigo-500 to-violet-600',
  daily: 'from-emerald-500 to-teal-600',
  textile: 'from-pink-400 to-rose-500',
  bike: 'from-red-500 to-rose-600',
};

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  1: '简单',
  2: '中等',
  3: '困难',
  4: '专家',
};

export const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  1: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  2: 'bg-sky-100 text-sky-700 border-sky-200',
  3: 'bg-amber-100 text-amber-700 border-amber-200',
  4: 'bg-rose-100 text-rose-700 border-rose-200',
};
