import { useState } from "react";
import { Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { GenreSelector } from "@/components/GenreSelector";
import { MoodSelector } from "@/components/MoodSelector";
import { useToast } from "@/hooks/use-toast";
import { useGenerateSong } from "@/hooks/useSongGeneration";

const Dashboard = () => {
  const [prompt, setPrompt] = useState("");
  const [genre, setGenre] = useState("");
  const [mood, setMood] = useState("");

  const { toast } = useToast();
  const navigate = useNavigate();
  const generateMutation = useGenerateSong();

  const handleGenerate = async () => {
    if (!prompt.trim() || !genre || !mood) return;

    try {
      const result = await generateMutation.mutateAsync({ prompt, genre, mood });
      navigate(`/results/${result.jobId}`);
    } catch (error) {
      console.error("Error generating song:", error);
      toast({
        title: "Error",
        description: "Failed to start generation.",
        variant: "destructive",
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col items-center justify-center h-full p-4 animate-in fade-in duration-500">
        <div className="max-w-2xl w-full space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight">What song do you want to generate?</h1>
            <p className="text-muted-foreground">Describe your idea, pick a style, and let AI compose it.</p>
          </div>
          
          <div className="space-y-6 bg-card/50 p-6 rounded-2xl border shadow-sm">
            <Textarea
              placeholder="A nostalgic song about walking through autumn leaves..."
              className="min-h-[120px] text-lg resize-none bg-background/50"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              maxLength={500}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="space-y-2">
                 <label className="text-sm font-medium">Genre</label>
                 <GenreSelector selected={genre} onSelect={setGenre} />
               </div>
               <div className="space-y-2">
                 <label className="text-sm font-medium">Mood</label>
                 <MoodSelector selected={mood} onSelect={setMood} />
               </div>
            </div>

            <Button 
              size="lg" 
              className="w-full text-lg h-12" 
              onClick={handleGenerate}
              disabled={!prompt.trim() || !genre || !mood || generateMutation.isPending}
            >
              <Sparkles className="mr-2 h-5 w-5" /> Generate
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
