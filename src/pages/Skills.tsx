import { useState, useMemo } from 'react';
import { GraduationCap, Filter, Calendar, Edit3, X } from 'lucide-react';
import { SCENES } from '@/data/scenes';
import { useAppStore } from '@/store/useAppStore';
import { StarRating } from '@/components/common/StarRating';
import { DifficultyBadge } from '@/components/common/DifficultyBadge';
import { EmptyState } from '@/components/common/EmptyState';
import { Modal } from '@/components/common/Modal';
import { cn } from '@/lib/utils';
import type { Difficulty, Proficiency, SkillRecord } from '@/types';
import { DIFFICULTY_LABELS } from '@/types';

interface RingProgressProps {
  value: number;
  max: number;
  size?: number;
  strokeWidth?: number;
  color: string;
  label: string;
  sublabel: string;
}

function RingProgress({ value, max, size = 140, strokeWidth = 10, color, label, sublabel }: RingProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const percentage = max > 0 ? (value / max) * 100 : 0;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(100, 116, 139, 0.2)"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-700 ease-out"
            style={{ filter: `drop-shadow(0 0 8px ${color}40)` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-white">{value}</span>
          <span className="text-xs text-slate-400">/ {max}</span>
        </div>
      </div>
      <div className="text-center">
        <div className="text-sm font-semibold text-white">{label}</div>
        <div className="text-xs text-slate-400">{sublabel}</div>
      </div>
    </div>
  );
}

interface SkillEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  skill: (SkillRecord & { sceneName: string; sceneIcon: string }) | null;
  onSave: (sceneId: string, proficiency: Proficiency) => void;
}

function SkillEditModal({ isOpen, onClose, skill, onSave }: SkillEditModalProps) {
  const [localProficiency, setLocalProficiency] = useState<Proficiency>(3);

  const handleOpenChange = (open: boolean) => {
    if (open && skill) {
      setLocalProficiency(skill.proficiency);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="修改熟练度"
      description={skill ? `${skill.sceneIcon} ${skill.sceneName}` : ''}
      icon={Edit3}
      size="sm"
    >
      {isOpen && skill && (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">
              熟练程度
            </label>
            <div className="flex justify-center py-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
              <StarRating
                value={localProficiency}
                onChange={setLocalProficiency}
                readOnly={false}
                size="lg"
                showValue
              />
            </div>
          </div>
          <div className="grid grid-cols-5 gap-2 text-center text-xs">
            {[1, 2, 3, 4, 5].map((level) => (
              <div
                key={level}
                className={cn(
                  'py-1.5 rounded-md transition-all',
                  localProficiency === level
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'text-slate-500'
                )}
              >
                {level === 1 && '初学'}
                {level === 2 && '入门'}
                {level === 3 && '熟练'}
                {level === 4 && '精通'}
                {level === 5 && '专家'}
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
            >
              取消
            </button>
            <button
              onClick={() => {
                onSave(skill.sceneId, localProficiency);
                onClose();
              }}
              className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 shadow-glow-sm transition-colors"
            >
              保存修改
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}

type FilterDifficulty = Difficulty | 'all';

const difficultyColors: Record<Difficulty, string> = {
  1: '#10b981',
  2: '#0ea5e9',
  3: '#f59e0b',
  4: '#f43f5e',
};

export default function Skills() {
  const { skills, updateSkill } = useAppStore();
  const [filter, setFilter] = useState<FilterDifficulty>('all');
  const [editingSkill, setEditingSkill] = useState<(SkillRecord & { sceneName: string; sceneIcon: string }) | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const enrichedSkills = useMemo(() => {
    return skills
      .map((skill) => {
        const scene = SCENES.find((s) => s.id === skill.sceneId);
        if (!scene) return null;
        return {
          ...skill,
          sceneName: scene.name,
          sceneIcon: scene.icon,
          category: scene.category,
          difficulty: scene.difficulty,
        };
      })
      .filter(Boolean) as (SkillRecord & {
      sceneName: string;
      sceneIcon: string;
      category: string;
      difficulty: Difficulty;
    })[];
  }, [skills]);

  const totalByDifficulty = useMemo(() => {
    const total: Record<Difficulty, number> = { 1: 0, 2: 0, 3: 0, 4: 0 };
    const learned: Record<Difficulty, number> = { 1: 0, 2: 0, 3: 0, 4: 0 };
    SCENES.forEach((scene) => {
      total[scene.difficulty]++;
    });
    enrichedSkills.forEach((skill) => {
      learned[skill.difficulty]++;
    });
    return { total, learned };
  }, [enrichedSkills]);

  const filteredSkills = useMemo(() => {
    if (filter === 'all') return enrichedSkills;
    return enrichedSkills.filter((skill) => skill.difficulty === filter);
  }, [enrichedSkills, filter]);

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const handleEditClick = (skill: typeof enrichedSkills[0]) => {
    setEditingSkill(skill);
    setIsEditModalOpen(true);
  };

  const handleSaveProficiency = (sceneId: string, proficiency: Proficiency) => {
    updateSkill(sceneId, { proficiency });
  };

  const filterOptions: { value: FilterDifficulty; label: string }[] = [
    { value: 'all', label: '全部' },
    { value: 1, label: '简单' },
    { value: 2, label: '中等' },
    { value: 3, label: '困难' },
    { value: 4, label: '专家' },
  ];

  const totalScenes = SCENES.length;
  const learnedScenes = enrichedSkills.length;

  return (
    <div className="min-h-screen bg-slate-950 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shadow-glow-sm">
            <GraduationCap className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">我的技能</h1>
            <p className="text-sm text-slate-400">
              已掌握 {learnedScenes} / {totalScenes} 项技能
            </p>
          </div>
        </div>
      </div>

      <div className="relative bg-slate-900/60 border border-slate-700/60 rounded-2xl p-8 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 bg-indigo-500/10 blur-3xl rounded-full pointer-events-none" />
        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8">
          {([1, 2, 3, 4] as Difficulty[]).map((diff) => (
            <RingProgress
              key={diff}
              value={totalByDifficulty.learned[diff]}
              max={totalByDifficulty.total[diff]}
              color={difficultyColors[diff]}
              label={DIFFICULTY_LABELS[diff]}
              sublabel={`掌握 ${totalByDifficulty.learned[diff]}/${totalByDifficulty.total[diff]}`}
            />
          )).slice(0, 3)}
        </div>
        {totalByDifficulty.learned[4] > 0 || totalByDifficulty.total[4] > 0 ? (
          <div className="relative mt-6 flex justify-center">
            <RingProgress
              value={totalByDifficulty.learned[4]}
              max={totalByDifficulty.total[4]}
              color={difficultyColors[4]}
              label={DIFFICULTY_LABELS[4]}
              sublabel={`掌握 ${totalByDifficulty.learned[4]}/${totalByDifficulty.total[4]}`}
            />
          </div>
        ) : null}
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-2 text-slate-400 text-sm mr-2">
          <Filter className="w-4 h-4" />
          <span>难度筛选:</span>
        </div>
        {filterOptions.map((opt) => (
          <button
            key={String(opt.value)}
            onClick={() => setFilter(opt.value)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 border',
              filter === opt.value
                ? 'bg-indigo-600 text-white border-indigo-500/50 shadow-glow-sm'
                : 'bg-slate-800/60 text-slate-300 border-slate-700/60 hover:bg-slate-700/60 hover:text-white'
            )}
          >
            {opt.label}
            <span className="ml-1.5 text-xs opacity-70">
              ({opt.value === 'all' ? enrichedSkills.length : enrichedSkills.filter(s => s.difficulty === opt.value).length})
            </span>
          </button>
        ))}
      </div>

      {filteredSkills.length === 0 ? (
        <EmptyState
          title="暂无技能记录"
          description="开始学习维修技能并记录吧！"
          icon={GraduationCap}
          size="lg"
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredSkills.map((skill) => (
            <div
              key={skill.sceneId}
              onClick={() => handleEditClick(skill)}
              className="group relative bg-slate-900/60 border border-slate-700/60 rounded-xl p-5 cursor-pointer hover:border-indigo-500/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/10 overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-500/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity" />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditClick(skill);
                }}
                className="absolute top-3 right-3 p-1.5 rounded-lg text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all opacity-0 group-hover:opacity-100"
                title="修改熟练度"
              >
                <Edit3 className="w-4 h-4" />
              </button>

              <div className="flex items-start gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-2xl border border-slate-700/60 shrink-0">
                  {skill.sceneIcon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white truncate group-hover:text-indigo-300 transition-colors">
                    {skill.sceneName}
                  </h3>
                  <div className="mt-1">
                    <DifficultyBadge difficulty={skill.difficulty} size="sm" />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">熟练度</span>
                  <StarRating value={skill.proficiency} size="sm" />
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 pt-2 border-t border-slate-700/50">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>学习于 {formatDate(skill.learnedAt)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <SkillEditModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingSkill(null);
        }}
        skill={editingSkill}
        onSave={handleSaveProficiency}
      />
    </div>
  );
}
