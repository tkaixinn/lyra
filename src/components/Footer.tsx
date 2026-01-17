import { Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="py-8 px-4 border-t border-border">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-muted-foreground text-sm">
        <p className="flex items-center gap-1">
          Crafted with <Heart className="w-4 h-4 text-accent fill-accent" /> for Parkinson's patients
        </p>
        <p>
          © {new Date().getFullYear()} MelodyMind. Music heals.
        </p>
      </div>
    </footer>
  );
}
