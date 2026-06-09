import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Grade, MathModule } from "@/types/curriculum";
import { DAILY_QUESTION_COUNT, getModulesForGrade } from "@/types/curriculum";
import { ALL_GRADE1_TOPIC_IDS, type Grade1TopicId } from "@/types/grade1Curriculum";
import { ALL_GRADE5_TOPIC_IDS, type Grade5TopicId } from "@/types/grade5Curriculum";
import type { Difficulty } from "@/types/question";
import { buildDailyExam, type PathStep } from "@/services/learningPath";
import { initialDifficultyForGrade, nextDifficulty } from "@/utils/adaptiveDifficulty";

export interface MathEvent {
  timestamp: string;
  sessionId: string;
  studentId: string;
  module: MathModule | Grade5TopicId | string;
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
  dailyProgress: Record<string, number>;
  dailyComplete: boolean;
  dailyCompleteCount: number;
  todayExamPath: PathStep[] | null;
  selectedGrade1Topics: Grade1TopicId[] | null;
  selectedGrade5Topics: Grade5TopicId[] | null;
  events: MathEvent[];
  moduleDifficulty: Partial<Record<string, Difficulty>>;
}

function levelFromXp(xp: number) {
  return Math.floor(xp / 100) + 1;
}

function emptyDailyProgress(grade: Grade): Record<string, number> {
  const progress: Record<string, number> = {};
  for (const m of getModulesForGrade(grade)) {
    progress[m.id] = 0;
  }
  return progress;
}

function createDefaultProfile(name = "Học sinh An", grade: Grade = 3): StudentProfile {
  const diff = initialDifficultyForGrade(grade);
  const modules = getModulesForGrade(grade);
  const moduleDifficulty: Partial<Record<string, Difficulty>> = {};
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
    selectedGrade1Topics: null,
    selectedGrade5Topics: null,
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
    selectedGrade1Topics: profile.selectedGrade1Topics ?? null,
    selectedGrade5Topics: profile.selectedGrade5Topics ?? null,
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
  getDifficultyForTopic: (topicId: string) => Difficulty;
  setSelectedGrade1Topics: (topicIds: Grade1TopicId[] | null) => void;
  toggleGrade1Topic: (topicId: Grade1TopicId) => void;
  setSelectedGrade5Topics: (topicIds: Grade5TopicId[] | null) => void;
  toggleGrade5Topic: (topicId: Grade5TopicId) => void;
  resetTodayExam: () => void;
  recordAnswer: (
    topicId: string,
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
                  selectedGrade1Topics: grade === 1 ? p.selectedGrade1Topics : null,
                  selectedGrade5Topics: grade === 5 ? p.selectedGrade5Topics : null,
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

      getDifficultyForTopic: (topicId) => {
        const { profiles, activeProfileId } = get();
        const p = profiles.find((x) => x.id === activeProfileId) ?? profiles[0];
        return p.moduleDifficulty[topicId] ?? initialDifficultyForGrade(p.grade);
      },

      setSelectedGrade1Topics: (topicIds) => {
        const { activeProfileId } = get();
        set((s) => ({
          profiles: updateProfileList(s.profiles, activeProfileId, (p) => ({
            ...p,
            selectedGrade1Topics: topicIds,
            todayExamPath: null,
            dailyProgress: emptyDailyProgress(p.grade),
            dailyComplete: false,
          })),
        }));
      },

      toggleGrade1Topic: (topicId) => {
        const { activeProfileId } = get();
        set((s) => ({
          profiles: updateProfileList(s.profiles, activeProfileId, (p) => {
            const current = p.selectedGrade1Topics ?? [...ALL_GRADE1_TOPIC_IDS];
            const next = current.includes(topicId)
              ? current.filter((id) => id !== topicId)
              : [...current, topicId];
            return {
              ...p,
              selectedGrade1Topics:
                next.length === ALL_GRADE1_TOPIC_IDS.length ? null : next,
            };
          }),
        }));
      },

      setSelectedGrade5Topics: (topicIds) => {
        const { activeProfileId } = get();
        set((s) => ({
          profiles: updateProfileList(s.profiles, activeProfileId, (p) => ({
            ...p,
            selectedGrade5Topics: topicIds,
            todayExamPath: null,
            dailyProgress: emptyDailyProgress(p.grade),
            dailyComplete: false,
          })),
        }));
      },

      toggleGrade5Topic: (topicId) => {
        const { activeProfileId } = get();
        set((s) => ({
          profiles: updateProfileList(s.profiles, activeProfileId, (p) => {
            const current = p.selectedGrade5Topics ?? [...ALL_GRADE5_TOPIC_IDS];
            const next = current.includes(topicId)
              ? current.filter((id) => id !== topicId)
              : [...current, topicId];
            return {
              ...p,
              selectedGrade5Topics:
                next.length === ALL_GRADE5_TOPIC_IDS.length ? null : next,
            };
          }),
        }));
      },

      resetTodayExam: () => {
        const { activeProfileId } = get();
        set((s) => ({
          profiles: updateProfileList(s.profiles, activeProfileId, (p) => ({
            ...p,
            todayExamPath: null,
            dailyProgress: emptyDailyProgress(p.grade),
            dailyComplete: false,
          })),
        }));
      },

      recordAnswer: (topicId, correct, responseTime, difficulty) => {
        const { activeProfileId, sessionId } = get();
        set((s) => ({
          profiles: updateProfileList(s.profiles, activeProfileId, (p) => {
            const event: MathEvent = {
              timestamp: new Date().toISOString(),
              sessionId,
              studentId: p.id,
              module: topicId,
              difficulty,
              correct,
              responseTime,
            };
            const events = [...p.events, event];
            const newDiff = nextDifficulty(
              p.moduleDifficulty[topicId] ?? initialDifficultyForGrade(p.grade),
              events,
              topicId as MathModule
            );
            const dailyProgress = { ...p.dailyProgress };
            const pathCap =
              p.todayExamPath?.find((step) => step.topicId === topicId)?.totalInTopic ??
              getModulesForGrade(p.grade).find((m) => m.id === topicId)?.dailyCount ??
              999;
            dailyProgress[topicId] = Math.min((dailyProgress[topicId] ?? 0) + 1, pathCap);
            const xpGain = correct ? 10 : 2;
            const newXp = p.xp + xpGain;
            const doneToday = dailyTotalProgress(dailyProgress);
            const justFinished = !p.dailyComplete && doneToday >= DAILY_QUESTION_COUNT;

            return {
              ...p,
              events,
              dailyProgress,
              moduleDifficulty: { ...p.moduleDifficulty, [topicId]: newDiff },
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
      version: 4,
      migrate: (persisted, version) => {
        const state = persisted as AppState;
        let profiles = state.profiles.map((p) => normalizeProfile(p as StudentProfile));
        if (version < 2) {
          profiles = profiles.map((p) => ({
            ...p,
            todayExamPath: p.todayExamPath ?? null,
          }));
        }
        if (version < 3) {
          profiles = profiles.map((p) => ({
            ...p,
            selectedGrade5Topics: p.selectedGrade5Topics ?? null,
            dailyProgress: p.dailyProgress ?? emptyDailyProgress(p.grade),
          }));
        }
        if (version < 4) {
          profiles = profiles.map((p) => ({
            ...p,
            selectedGrade1Topics: p.selectedGrade1Topics ?? null,
          }));
        }
        return { ...state, profiles };
      },
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.profiles = state.profiles.map(normalizeProfile);
        }
      },
    }
  )
);

export function dailyTotalProgress(progress: Record<string, number>): number {
  return Object.values(progress).reduce((s, n) => s + (n ?? 0), 0);
}
