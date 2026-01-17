import { cn } from "@/lib/utils";

const moods = [
  { id: "joyful", name: "Joyful", emoji: "😊", color: "bg-yellow-100 border-yellow-300" },
  { id: "peaceful", name: "Peaceful", emoji: "🕊️", color: "bg-blue-100 border-blue-300" },
  { id: "nostalgic", name: "Nostalgic", emoji: "💭", color: "bg-purple-100 border-purple-300" },
  { id: "hopeful", name: "Hopeful", emoji: "🌅", color: "bg-orange-100 border-orange-300" },
  { id: "grateful", name: "Grateful", emoji: "🙏", color: "bg-green-100 border-green-300" },
  { id: "loving", name: "Loving", emoji: "💕", color: "bg-pink-100 border-pink-300" },
];

interface MoodSelectorProps {
  selected: string;
  onSelect: (mood: string) => void;
}

export function MoodSelector({ selected, onSelect }: MoodSelectorProps) {
  return (
    <div className="flex flex-wrap gap-3 justify-center">
      {moods.map((mood) => {
        const isSelected = selected === mood.id;
        
        return (
          <button
            key={mood.id}
            onClick={() => onSelect(mood.id)}
            className={cn(
              "flex items-center gap-2 px-5 py-3 rounded-full border-2 transition-all duration-300",
              "hover:scale-105 active:scale-95",
              isSelected
                ? "border-primary bg-primary text-primary-foreground shadow-medium"
                : "border-border bg-card hover:border-primary/50"
            )}
          >
            <span className="text-xl">{mood.emoji}</span>
            <span className="font-medium">{mood.name}</span>
          </button>
        );
      })}
    </div>
  );
}
