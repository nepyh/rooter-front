import { create } from 'zustand';
import { CATEGORY_LABELS } from '@/constants/category';
import type { Category } from '@/constants/category';

// ================================
// Types
// ================================

export interface TodoItem {
  id: string;
  text: string;
  done: boolean;
}

export interface TodoGroup {
  id: string;
  title: string;
  category: Category;
  items: TodoItem[];
}

interface TodoState {
  groups: TodoGroup[];
  toggleItem: (groupId: string, itemId: string) => void;
  addItem: (category: Category, text: string) => void;
}

// ================================
// Constants
// ================================

const INITIAL_GROUPS: TodoGroup[] = [
  {
    id: "math",
    title: "수학",
    category: "math",
    items: [
      { id: "math-1", text: "교과서 풀기", done: false },
      { id: "math-2", text: "문제집 풀기", done: true },
    ],
  },
  {
    id: "english",
    title: "영어",
    category: "english",
    items: [
      { id: "english-1", text: "단어 외우기", done: false },
      { id: "english-2", text: "기출 풀기", done: false },
      { id: "english-3", text: "본문 외우기", done: false },
      { id: "english-4", text: "문제집 풀기", done: true },
      { id: "english-5", text: "교과서 풀기", done: true },
    ],
  },
  {
    id: "social",
    title: "사회",
    category: "social",
    items: [
      { id: "social-1", text: "교과서 풀기", done: false },
      { id: "social-2", text: "연표 정리하기", done: true },
    ],
  },
  {
    id: "science",
    title: "과학",
    category: "science",
    items: [
      { id: "science-1", text: "교과서 풀기", done: false },
      { id: "science-2", text: "실험 관찰 일지 정리", done: false },
      { id: "science-3", text: "문제집 풀기", done: true },
    ],
  },
];

// ================================
// Store
// ================================

export const useTodoStore = create<TodoState>((set) => ({
  groups: INITIAL_GROUPS,

  toggleItem: (groupId, itemId) => set((state) => ({
    groups: state.groups.map((group) => (
      group.id !== groupId ? group : {
        ...group,
        items: group.items.map((item) => item.id === itemId ? { ...item, done: !item.done } : item),
      }
    )),
  })),

  addItem: (category, text) => set((state) => {
    const newItem: TodoItem = { id: `${category}-${Date.now()}`, text, done: false };
    const existing = state.groups.find((group) => group.category === category);

    if (existing) {
      return {
        groups: state.groups.map((group) => (
          group.id === existing.id ? { ...group, items: [...group.items, newItem] } : group
        )),
      };
    }

    return {
      groups: [...state.groups, { id: category, title: CATEGORY_LABELS[category], category, items: [newItem] }],
    };
  }),
}));
