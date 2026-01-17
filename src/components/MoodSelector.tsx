import { cn } from "@/lib/utils";
import { Smile, Feather, CloudMoon, Sunrise, Heart, Sparkles } from "lucide-react";

const moods = [
  { id: "joyful", name: "Joyful", icon: Smile, description: "Bright and light" },
  { id: "peaceful", name: "Peaceful", icon: Feather, description: "Soft and calm" },
  { id: "nostalgic", name: "Nostalgic", icon: CloudMoon, description: "Warm memories" },
  { id: "hopeful", name: "Hopeful", icon: Sunrise, description: "Open and lifted" },
  { id: "grateful", name: "Grateful", icon: Heart, description: "Grounded warmth" },
  { id: "loving", name: "Loving", icon: Sparkles, description: "Gentle glow" },
];

interface MoodSelectorProps {
  selected: string;
  onSelect: (mood: string) => void;
}

export function MoodSelector({ selected, onSelect }: MoodSelectorProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {moods.map((mood) => {
        const Icon = mood.icon;
        const isSelected = selected === mood.id;

        return (
          <button
            key={mood.id}
            onClick={() => onSelect(mood.id)}
            className={cn(
              "flex items-center gap-3 p-4 rounded-2xl border transition-all duration-300 text-left",
              "hover:-translate-y-0.5 hover:shadow-soft active:translate-y-0",
              isSelected
                ? "border-primary bg-primary/10 shadow-glow"
                : "border-border bg-card/70 hover:border-primary/40"
            )}
          >
            <div
              className={cn(
                "p-2 rounded-xl transition-colors duration-300",
                isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              )}
            >
              <Icon className="w-4 h-4" />
            </div>
            <div className="text-left">
              <p className={cn("text-sm font-semibold", isSelected ? "text-primary" : "text-foreground")}>
                {mood.name}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{mood.description}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
