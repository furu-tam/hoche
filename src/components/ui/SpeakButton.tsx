"use client";

interface SpeakButtonProps {
  onClick: () => void;
  label?: string;
  size?: "sm" | "lg";
  className?: string;
}

export function SpeakButton({
  onClick,
  label = "Nghe",
  size = "sm",
  className = "",
}: SpeakButtonProps) {
  const sizeClass =
    size === "lg"
      ? "min-h-[52px] w-full gap-2 px-5 text-base"
      : "h-9 w-9 shrink-0 p-0 text-lg";

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      aria-label={label}
      title={label}
      className={`inline-flex items-center justify-center rounded-full bg-sky-100 font-extrabold text-mq-primary shadow-sm transition active:scale-95 ${sizeClass} ${className}`}
    >
      {size === "lg" ? (
        <>
          <span className="text-xl">🔊</span>
          <span>{label}</span>
        </>
      ) : (
        "🔊"
      )}
    </button>
  );
}
