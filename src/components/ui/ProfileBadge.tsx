import Link from "next/link";
import { useActiveProfile } from "@/hooks/useActiveProfile";

export function ProfileBadge() {
  const profile = useActiveProfile();
  return (
    <Link
      href="/profiles"
      className="flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm font-bold shadow-sm"
    >
      <span className="text-xl">{profile.avatar}</span>
      <span>
        {profile.name} · Lớp {profile.grade}
      </span>
    </Link>
  );
}
