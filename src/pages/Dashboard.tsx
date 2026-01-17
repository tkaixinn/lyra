import { useState } from "react";
import { ArrowRight, Sparkles, ChevronDown, ChevronUp, Music2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useGenerateSong } from "@/hooks/useSongGeneration";
import { cn } from "@/lib/utils";

const GENRES = ["Lo-Fi", "Pop", "Jazz", "Rock", "Classical", "Ambient"];
const MOODS = ["Happy", "Melancholic", "Energetic", "Calm", "Dark", "Romantic"];

const SUGGESTIONS = [
  "A cyberpunk synthwave track",
  "A cozy acoustic guitar folk song",
  "Upbeat disco for a summer party",
];

const Dashboard = () => {
  const [prompt, setPrompt] = useState("");
  const [genre, setGenre] = useState("");
  const [mood, setMood] = useState("");
  const [isGenreOpen, setIsGenreOpen] = useState(false);
  const [isMoodOpen, setIsMoodOpen] = useState(false);

  const { toast } = useToast();
  const navigate = useNavigate();
  const generateMutation = useGenerateSong();

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    try {
      const result = await generateMutation.mutateAsync({ prompt, genre, mood });
      navigate(`/results/${result.jobId}`);
    } catch (error) {
      toast({ title: "Error", description: "Failed to start generation.", variant: "destructive" });
    }
  };

  const isReady = prompt.trim() && !generateMutation.isPending;

  return (
    <DashboardLayout>
      <div className="flex flex-col items-center justify-center h-full p-4 animate-in fade-in duration-700">
        <div className="max-w-3xl w-full space-y-5">
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg hero-gradient shadow-soft">
                <Music2 className="w-4 h-4 text-primary-foreground" />
              </div>
              <p className="text-xl text-muted-foreground">Lyra</p>
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-primary">What's on your mind?</h1>
          </div>
          
          <div className="space-y-6">
            <div className="relative group">
              <Textarea
                placeholder="Describe your song idea..."
                className="min-h-[220px] text-lg p-4 pb-16 resize-none bg-secondary/30 hover:bg-secondary/40 focus:bg-secondary/50 border-2 focus-visible:ring-0 focus-visible:border-primary/50 rounded-3xl transition-all"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                maxLength={500}
              />
              
              {/* Suggested Queries - Bottom Left */}
              <div className="absolute bottom-4 left-4 flex flex-wrap gap-2 max-w-[80%]">
                {SUGGESTIONS.map((suggestion, index) => (
                  <button
                    key={suggestion}
                    onClick={() => setPrompt(suggestion)}
                    className="px-3 py-1 text-xs font-medium rounded-full bg-background/50 hover:bg-background text-muted-foreground hover:text-foreground border border-transparent hover:border-border transition-all whitespace-nowrap animate-glow"
                    style={{ animationDelay: `${index * 0.2}s` }}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>

              {/* Submit Button - Bottom Right */}
              <Button 
                size="icon" 
                className={cn(
                  "absolute bottom-4 right-4 h-10 w-10 rounded-full transition-all duration-300 shadow-md",
                  isReady ? "opacity-100 scale-100" : "opacity-40 scale-90"
                )}
                onClick={handleGenerate}
                disabled={!isReady}
              >
                {generateMutation.isPending ? <Sparkles className="h-5 w-5 animate-spin" /> : <ArrowRight className="h-5 w-5" />}
              </Button>
            </div>

            {/* Selectors */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-2">
              <div className="space-y-3">
                <button
                  onClick={() => setIsGenreOpen(!isGenreOpen)}
                  className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-widest hover:text-foreground transition-colors"
                >
                  <span>Genre</span>
                  {isGenreOpen ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
                {isGenreOpen && (
                  <div className="flex flex-wrap gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
                    {GENRES.map((g) => (
                      <button
                        key={g}
                        onClick={() => setGenre(g)}
                        className={cn(
                          "px-4 py-2 rounded-full text-sm font-medium transition-all border",
                          genre === g ? "bg-primary text-primary-foreground border-primary" : "bg-secondary/20 border-transparent hover:bg-secondary/50"
                        )}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => setIsMoodOpen(!isMoodOpen)}
                  className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-widest hover:text-foreground transition-colors"
                >
                  <span>Mood</span>
                  {isMoodOpen ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
                {isMoodOpen && (
                  <div className="flex flex-wrap gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
                    {MOODS.map((m) => (
                      <button
                        key={m}
                        onClick={() => setMood(m)}
                        className={cn(
                          "px-4 py-2 rounded-full text-sm font-medium transition-all border",
                          mood === m ? "bg-primary text-primary-foreground border-primary" : "bg-secondary/20 border-transparent hover:bg-secondary/50"
                        )}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;