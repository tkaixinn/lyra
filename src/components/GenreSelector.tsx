import { cn } from "@/lib/utils";
import { Music, Waves, Heart, Sun, Moon, Sparkles } from "lucide-react";

const genres = [
  { id: "jazz", name: "Jazz", icon: Music, description: "Smooth & soulful" },
  { id: "classical", name: "Classical", icon: Waves, description: "Elegant & timeless" },
  { id: "folk", name: "Folk", icon: Heart, description: "Warm & storytelling" },
  { id: "pop", name: "Pop", icon: Sun, description: "Upbeat & catchy" },
  { id: "ballad", name: "Ballad", icon: Moon, description: "Emotional & slow" },
  { id: "inspirational", name: "Inspirational", icon: Sparkles, description: "Uplifting & hopeful" },
];

interface GenreSelectorProps {
  selected: string;
  onSelect: (genre: string) => void;
}

export function GenreSelector({ selected, onSelect }: GenreSelectorProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      {genres.map((genre) => {
        const Icon = genre.icon;
        const isSelected = selected === genre.id;
        
        return (
          <button
            key={genre.id}
            onClick={() => onSelect(genre.id)}
            className={cn(
              "flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all duration-300",
              "hover:scale-[1.02] active:scale-[0.98]",
              isSelected
                ? "border-primary bg-primary/10 shadow-glow"
                : "border-border bg-card hover:border-primary/50 hover:bg-primary/5"
            )}
          >
            <div
              className={cn(
                "p-3 rounded-xl transition-colors duration-300",
                isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              )}
            >
              <Icon className="w-6 h-6" />
            </div>
            <div className="text-center">
              <p className={cn(
                "font-medium text-lg",
                isSelected ? "text-primary" : "text-foreground"
              )}>
                {genre.name}
              </p>
              <p className="text-sm text-muted-foreground">{genre.description}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
