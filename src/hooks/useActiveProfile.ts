import { useShallow } from "zustand/react/shallow";
import { useAppStore, type StudentProfile } from "@/store/appStore";

/** Profile đang active — tham chiếu ổn định từ store, tránh re-render vô hạn */
export function useActiveProfile(): StudentProfile {
  return useAppStore(
    useShallow((s) => {
      const profile =
        s.profiles.find((p) => p.id === s.activeProfileId) ?? s.profiles[0];
      return profile;
    })
  );
}
