import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { RepairScene, Tool, Material } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

export function formatDate(dateStr?: string): string {
  const d = dateStr ? new Date(dateStr) : new Date();
  return d.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' });
}

export function formatDateTime(dateStr?: string): string {
  const d = dateStr ? new Date(dateStr) : new Date();
  return d.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatMinutes(min: number): string {
  if (min < 60) return `${min}分钟`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m > 0 ? `${h}小时${m}分` : `${h}小时`;
}

export function formatMoney(n: number): string {
  return `¥${n.toFixed(0)}`;
}

export function matchScenesByKeyword(scenes: RepairScene[], keyword: string): RepairScene[] {
  const kw = keyword.trim().toLowerCase();
  if (!kw) return [];
  return scenes.filter((s) => {
    if (s.name.toLowerCase().includes(kw)) return true;
    if (s.description.toLowerCase().includes(kw)) return true;
    return s.keywords.some((k) => k.toLowerCase().includes(kw));
  });
}

export function hasTool(tools: Tool[], name: string): boolean {
  const n = name.toLowerCase();
  return tools.some(
    (t) =>
      t.name.toLowerCase() === n ||
      t.name.toLowerCase().includes(n) ||
      n.includes(t.name.toLowerCase())
  );
}

export function hasMaterial(materials: Material[], name: string, amount: number): { enough: boolean; current: number } {
  const n = name.toLowerCase();
  const found = materials.find(
    (m) => m.name.toLowerCase() === n || m.name.toLowerCase().includes(n) || n.includes(m.name.toLowerCase())
  );
  if (!found) return { enough: false, current: 0 };
  return { enough: found.quantity >= amount, current: found.quantity };
}

export function firstDayOfMonth(d = new Date()): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export function lastDayOfMonth(d = new Date()): Date {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}

export function isSameMonth(a: string | Date, b: string | Date): boolean {
  const da = typeof a === 'string' ? new Date(a) : a;
  const db = typeof b === 'string' ? new Date(b) : b;
  return da.getFullYear() === db.getFullYear() && da.getMonth() === db.getMonth();
}

export function monthLabel(d = new Date()): string {
  return `${d.getFullYear()}年${d.getMonth() + 1}月`;
}
