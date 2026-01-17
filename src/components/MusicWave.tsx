import { cn } from "@/lib/utils";

interface MusicWaveProps {
  isPlaying?: boolean;
  className?: string;
}

export function MusicWave({ isPlaying = false, className }: MusicWaveProps) {
  return (
    <div className={cn("flex items-end gap-1 h-8", className)}>
      {[1, 2, 3, 4, 5].map((bar) => (
        <div
          key={bar}
          className={cn(
            "w-1.5 rounded-full bg-primary transition-all duration-300",
            isPlaying ? "animate-wave" : "h-2"
          )}
          style={{
            height: isPlaying ? `${20 + Math.random() * 60}%` : "8px",
            animationDelay: `${bar * 0.1}s`,
          }}
        />
      ))}
    </div>
  );
}
