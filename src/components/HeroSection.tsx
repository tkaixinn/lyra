import { Sparkles, Music, Heart } from "lucide-react";

export function HeroSection() {
  return (
    <section className="text-center py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Floating decorative elements */}
        <div className="relative mb-8">
          <div className="absolute -top-4 left-1/4 animate-float">
            <Music className="w-8 h-8 text-primary/40" />
          </div>
          <div className="absolute -top-2 right-1/4 animate-float" style={{ animationDelay: "1s" }}>
            <Sparkles className="w-6 h-6 text-accent/60" />
          </div>
          <div className="absolute top-8 right-1/3 animate-float" style={{ animationDelay: "2s" }}>
            <Heart className="w-5 h-5 text-accent/40" />
          </div>
        </div>
        
        <h1 className="font-serif text-display-sm sm:text-display text-foreground mb-6 text-balance">
          Create Your Own{" "}
          <span className="text-primary">Healing</span>{" "}
          Music
        </h1>
        
        <p className="text-body-lg text-muted-foreground max-w-2xl mx-auto mb-8 text-balance">
          How are you feeling today? 
        </p>
        
        <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2 bg-card px-4 py-2 rounded-full shadow-soft">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <span>AI-Powered Lyrics</span>
          </div>
          <div className="flex items-center gap-2 bg-card px-4 py-2 rounded-full shadow-soft">
            <div className="w-2 h-2 rounded-full bg-accent" />
            <span>Custom Melodies</span>
          </div>
        </div>
      </div>
    </section>
  );
}
