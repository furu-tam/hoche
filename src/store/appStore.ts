import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Grade, MathModule } from "@/types/curriculum";
import { DAILY_QUESTION_COUNT, getModulesForGrade } from "@/types/curriculum";
import type { Difficulty } from "@/types/question";
import { buildDailyExam, type PathStep } from "@/services/learningPath";
import { initialDifficultyForGrade, nextDifficulty } from "@/utils/adaptiveDifficulty";

export interface MathEvent {
  timestamp: string;
  sessionId: string;
  studentId: string;
  module: MathModule;
  difficulty: Difficulty;
  correct: boolean;
  responseTime: number;
}

export interface StudentProfile {
  id: string;
  name: string;
  grade: Grade;
  avatar: string;
  xp: number;
  coins: number;
  streak: number;
  level: number;
  dailyProgress: Record<MathModule, number>;
  dailyComplete: boolean;
  dailyCompleteCount: number;
  todayExamPath: PathStep[] | null;
  events: MathEvent[];
  moduleDifficulty: Partial<Record<MathModule, Difficulty>>;
}

function levelFromXp(xp: number) {
  return Math.floor(xp / 100) + 1;
}

function emptyDailyProgress(grade: Grade): Record<MathModule, number> {
  const progress = {} as Record<MathModule, number>;
  for (const m of getModulesForGrade(grade)) {
    progress[m.id] = 0;
  }
  return progress;
}

function createDefaultProfile(name = "Học sinh An", grade: Grade = 3): StudentProfile {
  const diff = initialDifficultyForGrade(grade);
  const modules = getModulesForGrade(grade);
  const moduleDifficulty: Partial<Record<MathModule, Difficulty>> = {};
  for (const m of modules) moduleDifficulty[m.id] = diff;

  return {
    id: crypto.randomUUID(),
    name,
    grade,
    avatar: "🎒",
    xp: 0,
    coins: 0,
    streak: 0,
    level: 1,
    dailyProgress: emptyDailyProgress(grade),
    dailyComplete: false,
    dailyCompleteCount: 0,
    todayExamPath: null,
    events: [],
    moduleDifficulty,
  };
}

export function normalizeProfile(profile: StudentProfile): StudentProfile {
  const grade = profile.grade ?? 3;
  const modules = getModulesForGrade(grade);
  const diff = initialDifficultyForGrade(grade);
  const moduleDifficulty = { ...profile.moduleDifficulty };
  for (const m of modules) {
    if (!moduleDifficulty[m.id]) moduleDifficulty[m.id] = diff;
  }

  const dailyProgress = { ...emptyDailyProgress(grade), ...profile.dailyProgress };

  return {
    ...profile,
    grade,
    dailyProgress,
    dailyComplete: profile.dailyComplete ?? false,
    dailyCompleteCount: profile.dailyCompleteCount ?? 0,
    todayExamPath: profile.todayExamPath ?? null,
    events: profile.events ?? [],
    moduleDifficulty,
  };
}

interface AppState {
  profiles: StudentProfile[];
  activeProfileId: string;
  parentPin: string;
  sessionId: string;
  lastSessionBonus: { xp: number; coins: number } | null;

  getActiveProfile: () => StudentProfile;
  setActiveProfile: (id: string) => void;
  setStudentGrade: (id: string, grade: Grade) => void;
  addProfile: (name: string, grade: Grade, avatar: string) => void;
  removeProfile: (id: string) => void;
  startSession: () => void;
  ensureTodayExam: () => void;
  getDifficultyForModule: (module: MathModule) => Difficulty;
  recordAnswer: (
    module: MathModule,
    correct: boolean,
    responseTime: number,
    difficulty: Difficulty
  ) => void;
  completeDaily: () => void;
  resetDailyIfNewDay: () => void;
  verifyParentPin: (pin: string) => boolean;
  setParentPin: (pin: string) => void;
}

function updateProfileList(
  profiles: StudentProfile[],
  id: string,
  updater: (p: StudentProfile) => StudentProfile
): StudentProfile[] {
  return profiles.map((p) => (p.id === id ? updater(normalizeProfile(p)) : normalizeProfile(p)));
}

const defaultProfile = createDefaultProfile();

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      profiles: [defaultProfile],
      activeProfileId: defaultProfile.id,
      parentPin: "1234",
      sessionId: crypto.randomUUID(),
      lastSessionBonus: null,

      getActiveProfile: () => {
        const { profiles, activeProfileId } = get();
        return profiles.find((x) => x.id === activeProfileId) ?? profiles[0];
      },

      setActiveProfile: (id) => set({ activeProfileId: id }),

      setStudentGrade: (id, grade) => {
        set((s) => ({
          profiles: s.profiles.map((p) =>
            p.id === id
              ? normalizeProfile({
                  ...p,
                  grade,
                  dailyProgress: emptyDailyProgress(grade),
                  todayExamPath: null,
                  dailyComplete: false,
                  moduleDifficulty: Object.fromEntries(
                    getModulesForGrade(grade).map((m) => [
                      m.id,
                      p.moduleDifficulty[m.id] ?? initialDifficultyForGrade(grade),
                    ])
                  ) as StudentProfile["moduleDifficulty"],
                })
              : normalizeProfile(p)
          ),
        }));
      },

      addProfile: (name, grade, avatar) => {
        const p = createDefaultProfile(name, grade);
        p.avatar = avatar;
        set((s) => ({
          profiles: [...s.profiles.map(normalizeProfile), p],
          activeProfileId: p.id,
        }));
      },

      removeProfile: (id) => {
        const { profiles, activeProfileId } = get();
        if (profiles.length <= 1) return;
        const next = profiles.filter((p) => p.id !== id);
        set({
          profiles: next,
          activeProfileId: activeProfileId === id ? next[0].id : activeProfileId,
        });
      },

      startSession: () => set({ sessionId: crypto.randomUUID() }),

      ensureTodayExam: () => {
        const { activeProfileId } = get();
        set((s) => ({
          profiles: updateProfileList(s.profiles, activeProfileId, (p) => {
            if (p.todayExamPath && p.todayExamPath.length > 0) return p;
            return { ...p, todayExamPath: buildDailyExam(p) };
          }),
        }));
      },

      getDifficultyForModule: (module) => {
        const { profiles, activeProfileId } = get();
        const p = profiles.find((x) => x.id === activeProfileId) ?? profiles[0];
        return p.moduleDifficulty[module] ?? initialDifficultyForGrade(p.grade);
      },

      recordAnswer: (module, correct, responseTime, difficulty) => {
        const { activeProfileId, sessionId } = get();
        set((s) => ({
          profiles: updateProfileList(s.profiles, activeProfileId, (p) => {
            const event: MathEvent = {
              timestamp: new Date().toISOString(),
              sessionId,
              studentId: p.id,
              module,
              difficulty,
              correct,
              responseTime,
            };
            const events = [...p.events, event];
            const newDiff = nextDifficulty(
              p.moduleDifficulty[module] ?? initialDifficultyForGrade(p.grade),
              events,
              module
            );
            const dailyProgress = { ...p.dailyProgress };
            const moduleCap =
              getModulesForGrade(p.grade).find((m) => m.id === module)?.dailyCount ?? 999;
            dailyProgress[module] = Math.min((dailyProgress[module] ?? 0) + 1, moduleCap);
            const xpGain = correct ? 10 : 2;
            const newXp = p.xp + xpGain;
            const doneToday = dailyTotalProgress(dailyProgress);
            const justFinished = !p.dailyComplete && doneToday >= DAILY_QUESTION_COUNT;

            return {
              ...p,
              events,
              dailyProgress,
              moduleDifficulty: { ...p.moduleDifficulty, [module]: newDiff },
              xp: newXp,
              level: levelFromXp(newXp),
              dailyComplete: p.dailyComplete || doneToday >= DAILY_QUESTION_COUNT,
              streak: justFinished ? p.streak + 1 : p.streak,
              dailyCompleteCount: justFinished ? p.dailyCompleteCount + 1 : p.dailyCompleteCount,
            };
          }),
        }));
      },

      completeDaily: () => {
        const { activeProfileId } = get();
        set((s) => ({
          lastSessionBonus: { xp: 50, coins: 20 },
          profiles: updateProfileList(s.profiles, activeProfileId, (p) => {
            if (p.dailyComplete) {
              return { ...p, coins: p.coins + 20, xp: p.xp + 50, level: levelFromXp(p.xp + 50) };
            }
            return {
              ...p,
              dailyComplete: true,
              dailyCompleteCount: p.dailyCompleteCount + 1,
              streak: p.streak + 1,
              xp: p.xp + 50,
              coins: p.coins + 20,
              level: levelFromXp(p.xp + 50),
            };
          }),
        }));
      },

      resetDailyIfNewDay: () => {
        const today = new Date().toDateString();
        const last = localStorage.getItem("hoche_last_day");
        if (last === today) return;
        localStorage.setItem("hoche_last_day", today);

        set((s) => ({
          profiles: s.profiles.map((p) => {
            const np = normalizeProfile(p);
            return {
              ...np,
              dailyProgress: emptyDailyProgress(np.grade),
              dailyComplete: false,
              todayExamPath: null,
            };
          }),
        }));
      },

      verifyParentPin: (pin) => get().parentPin === pin,
      setParentPin: (pin) => set({ parentPin: pin }),
    }),
    {
      name: "hoche-v1",
      version: 2,
      migrate: (persisted, version) => {
        const state = persisted as AppState;
        if (version < 2) {
          return {
            ...state,
            profiles: state.profiles.map((p) => ({
              ...p,
              todayExamPath: (p as StudentProfile).todayExamPath ?? null,
            })),
          };
        }
        return state;
      },
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.profiles = state.profiles.map(normalizeProfile);
        }
      },
    }
  )
);

export function dailyTotalProgress(progress: Record<MathModule, number>): number {
  return Object.values(progress).reduce((s, n) => s + (n ?? 0), 0);
}
