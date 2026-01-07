"use client";
import Loading from "@/components/loading";

export const AiLoading = ({
  text = "AI Assistant is thinking...",
  showCircle = true,
  className,
}: {
  text?: string;
  showCircle?: boolean;
  className?: string;
}) => {
  return (
    <div className={`flex items-center justify-start gap-2 ${className}`}>
      {showCircle && <Loading overlay={false} className="size-4! opacity-50" />}
      <p className="text-muted-foreground text-sm">
        <span className="inline-flex">
          {text.split("").map((char, index) => (
            <span
              key={index}
              className="bg-linear-to-r from-muted-foreground to-primary bg-clip-text text-transparent animate-pulse"
              style={{
                animationDelay: `${index * 0.1}s`,
                animationDuration: "1.3s",
                animationIterationCount: "infinite",
              }}
            >
              {char === " " ? "\u00A0" : char}
            </span>
          ))}
        </span>
      </p>
    </div>
  );
};
