import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Clock, ChevronDown, CheckCircle2, GraduationCap } from 'lucide-react';
import { SCENES } from '@/data/scenes';
import {
  CATEGORY_LABELS,
  DIFFICULTY_LABELS,
  type SceneCategory,
  type Difficulty,
} from '@/types';
import { DifficultyBadge } from '@/components/common/DifficultyBadge';
import { StarRating } from '@/components/common/StarRating';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';

const ALL_CATEGORIES = 'all' as const;
const ALL_DIFFICULTIES = 'all' as const;

type CategoryFilter = SceneCategory | typeof ALL_CATEGORIES;
type DifficultyFilter = Difficulty | typeof ALL_DIFFICULTIES;

const categoryOptions: { value: CategoryFilter; label: string }[] = [
  { value: ALL_CATEGORIES, label: '全部分类' },
  ...Object.entries(CATEGORY_LABELS).map(([value, label]) => ({
    value: value as SceneCategory,
    label,
  })),
];

const difficultyOptions: { value: DifficultyFilter; label: string }[] = [
  { value: ALL_DIFFICULTIES, label: '全部难度' },
  ...Object.entries(DIFFICULTY_LABELS).map(([value, label]) => ({
    value: Number(value) as Difficulty,
    label,
  })),
];

export default function Knowledge() {
  const navigate = useNavigate();
  const skills = useAppStore((s) => s.skills);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] =
    useState<CategoryFilter>(ALL_CATEGORIES);
  const [selectedDifficulty, setSelectedDifficulty] =
    useState<DifficultyFilter>(ALL_DIFFICULTIES);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [difficultyDropdownOpen, setDifficultyDropdownOpen] = useState(false);

  const skillMap = useMemo(() => {
    const map = new Map<string, typeof skills[0]>();
    skills.forEach((s) => map.set(s.sceneId, s));
    return map;
  }, [skills]);

  const filteredScenes = useMemo(() => {
    return SCENES.filter((scene) => {
      const matchCategory =
        selectedCategory === ALL_CATEGORIES ||
        scene.category === selectedCategory;
      const matchDifficulty =
        selectedDifficulty === ALL_DIFFICULTIES ||
        scene.difficulty === selectedDifficulty;
      const query = searchQuery.trim().toLowerCase();
      const matchSearch =
        !query ||
        scene.name.toLowerCase().includes(query) ||
        scene.keywords.some((k) => k.toLowerCase().includes(query)) ||
        scene.description.toLowerCase().includes(query);
      return matchCategory && matchDifficulty && matchSearch;
    });
  }, [searchQuery, selectedCategory, selectedDifficulty]);

  const activeCategoryLabel =
    categoryOptions.find((o) => o.value === selectedCategory)?.label ??
    '全部分类';
  const activeDifficultyLabel =
    difficultyOptions.find((o) => o.value === selectedDifficulty)?.label ??
    '全部难度';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent">
            维修知识库
          </h1>
          <p className="text-slate-400 mt-2">
            汇集 {SCENES.length} 种家庭维修场景，从入门到精通
          </p>
        </header>

        <div className="bg-slate-900/60 backdrop-blur border border-slate-800 rounded-2xl p-5 mb-8">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[260px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="text"
                placeholder="搜索名称、关键词、描述..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-800/80 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500/50 transition-all"
              />
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setCategoryDropdownOpen((v) => !v);
                  setDifficultyDropdownOpen(false);
                }}
                className="flex items-center gap-2 px-5 py-3 bg-slate-800/80 border border-slate-700 rounded-xl hover:bg-slate-800 hover:border-slate-600 transition-all min-w-[140px] justify-between"
              >
                <span className="text-sm font-medium truncate">
                  {activeCategoryLabel}
                </span>
                <ChevronDown
                  className={cn(
                    'w-4 h-4 text-slate-400 transition-transform shrink-0',
                    categoryDropdownOpen && 'rotate-180'
                  )}
                />
              </button>
              {categoryDropdownOpen && (
                <div className="absolute z-20 mt-2 w-full min-w-[200px] bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-1 max-h-[320px] overflow-y-auto">
                  {categoryOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        setSelectedCategory(option.value);
                        setCategoryDropdownOpen(false);
                      }}
                      className={cn(
                        'w-full text-left px-4 py-2.5 text-sm transition-colors',
                        selectedCategory === option.value
                          ? 'bg-sky-500/15 text-sky-400'
                          : 'text-slate-300 hover:bg-slate-800'
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setDifficultyDropdownOpen((v) => !v);
                  setCategoryDropdownOpen(false);
                }}
                className="flex items-center gap-2 px-5 py-3 bg-slate-800/80 border border-slate-700 rounded-xl hover:bg-slate-800 hover:border-slate-600 transition-all min-w-[140px] justify-between"
              >
                <span className="text-sm font-medium truncate">
                  {activeDifficultyLabel}
                </span>
                <ChevronDown
                  className={cn(
                    'w-4 h-4 text-slate-400 transition-transform shrink-0',
                    difficultyDropdownOpen && 'rotate-180'
                  )}
                />
              </button>
              {difficultyDropdownOpen && (
                <div className="absolute z-20 mt-2 w-full min-w-[160px] bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-1">
                  {difficultyOptions.map((option) => (
                    <button
                      key={String(option.value)}
                      type="button"
                      onClick={() => {
                        setSelectedDifficulty(option.value);
                        setDifficultyDropdownOpen(false);
                      }}
                      className={cn(
                        'w-full text-left px-4 py-2.5 text-sm transition-colors',
                        selectedDifficulty === option.value
                          ? 'bg-sky-500/15 text-sky-400'
                          : 'text-slate-300 hover:bg-slate-800'
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between text-sm text-slate-400">
            <span>
              共找到{' '}
              <span className="text-sky-400 font-semibold">
                {filteredScenes.length}
              </span>{' '}
              个场景
            </span>
            {(selectedCategory !== ALL_CATEGORIES ||
              selectedDifficulty !== ALL_DIFFICULTIES ||
              searchQuery) && (
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory(ALL_CATEGORIES);
                  setSelectedDifficulty(ALL_DIFFICULTIES);
                  setSearchQuery('');
                }}
                className="text-sky-400 hover:text-sky-300 transition-colors"
              >
                重置筛选
              </button>
            )}
          </div>
        </div>

        {filteredScenes.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-slate-300 mb-2">
              未找到匹配的场景
            </h3>
            <p className="text-slate-500">试试调整筛选条件或搜索关键词</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredScenes.map((scene) => {
              const skill = skillMap.get(scene.id);
              const isLearned = !!skill;
              return (
                <button
                  key={scene.id}
                  type="button"
                  onClick={() => navigate(`/knowledge/${scene.id}`)}
                  className={cn(
                    'group relative text-left bg-slate-900/60 backdrop-blur border rounded-2xl p-5 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300',
                    isLearned
                      ? 'border-emerald-500/30 hover:border-emerald-500/50 hover:shadow-emerald-500/5'
                      : 'border-slate-800 hover:border-slate-700 hover:shadow-sky-500/5'
                  )}
                >
                  {isLearned && (
                    <div className="absolute top-3 right-3">
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span className="text-[10px] font-medium text-emerald-400">已掌握</span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={cn(
                        'w-14 h-14 rounded-xl bg-gradient-to-br flex items-center justify-center text-3xl border group-hover:scale-105 transition-transform',
                        isLearned
                          ? 'from-emerald-900/50 to-slate-900 border-emerald-700/50'
                          : 'from-slate-800 to-slate-900 border-slate-700'
                      )}
                    >
                      {scene.icon}
                    </div>
                    <DifficultyBadge
                      difficulty={scene.difficulty}
                      size="sm"
                      showDots={false}
                    />
                  </div>

                  <h3
                    className={cn(
                      'text-lg font-semibold mb-2 transition-colors line-clamp-1',
                      isLearned
                        ? 'text-emerald-300 group-hover:text-emerald-400'
                        : 'text-slate-100 group-hover:text-sky-400'
                    )}
                  >
                    {scene.name}
                  </h3>

                  <div className="flex items-center gap-1.5 text-sm text-slate-400 mb-3">
                    <Clock className="w-4 h-4" />
                    <span>约 {scene.estimatedTime} 分钟</span>
                  </div>

                  <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed mb-3">
                    {scene.description}
                  </p>

                  {isLearned && skill && (
                    <div className="flex items-center gap-2 mb-3">
                      <GraduationCap className="w-3.5 h-3.5 text-emerald-500" />
                      <StarRating
                        value={skill.proficiency}
                        max={5}
                        size="sm"
                        readOnly
                      />
                    </div>
                  )}

                  <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-xs text-slate-500">
                      {scene.tools.length} 工具 · {scene.materials.length} 耗材 ·{' '}
                      {scene.steps.length} 步骤
                    </span>
                    <span
                      className={cn(
                        'text-xs font-medium group-hover:translate-x-0.5 transition-transform',
                        isLearned ? 'text-emerald-400' : 'text-sky-400'
                      )}
                    >
                      查看详情 →
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
