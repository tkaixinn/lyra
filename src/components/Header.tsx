import { Music2, Heart } from "lucide-react";

export function Header() {
  return (
    <header className="w-full py-6 px-4 sm:px-8">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl hero-gradient shadow-soft">
            <Music2 className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="font-serif text-2xl font-semibold text-foreground">
            Lyra
          </span>
        </div>
        
        <div className="flex items-center gap-2 text-muted-foreground">
          <span className="text-sm hidden sm:inline">Made with</span>
          <Heart className="w-4 h-4 text-accent fill-accent" />
          <span className="text-sm hidden sm:inline">for wellness</span>
        </div>
      </div>
    </header>
  );
}
