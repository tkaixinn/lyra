import { useState, useEffect } from "react";
import { Loader2, Sparkles, Music4, Play, Pause, RefreshCw, ChevronLeft } from "lucide-react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { GenreSelector } from "./GenreSelector";
import { MoodSelector } from "./MoodSelector";
import { useToast } from "@/hooks/use-toast";
import { useGenerateSong, useJobStatus } from "@/hooks/useSongGeneration";
import { getAudioUrl } from "@/lib/api/client";
import { cn } from "@/lib/utils";
import { Slider } from "./ui/slider";

export function CreateSongFlow() {
  const [step, setStep] = useState<"input" | "generating" | "result">("input");
  
  // Input State
  const [prompt, setPrompt] = useState("");
  const [genre, setGenre] = useState("");
  const [mood, setMood] = useState("");
  
  // Result State
  const [lyrics, setLyrics] = useState("");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  
  // Audio Player State
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  const { toast } = useToast();
  const generateMutation = useGenerateSong();
  const { data: jobData } = useJobStatus(jobId, jobId !== null);

  // Status Check & Transition Logic
  useEffect(() => {
    if (jobData) {
      if (jobData.lyrics) setLyrics(jobData.lyrics);
      if (jobData.audioUrl) setAudioUrl(getAudioUrl(jobData.audioUrl));

      if (jobData.status === "completed" && jobId && step === "generating") {
        setStep("result");
        toast({
          title: "Song Created!",
          description: "Your song is ready.",
        });
      }

      if (jobData.status === "failed") {
        setStep("input");
        setJobId(null);
        toast({
          title: "Error",
          description: jobData.error || "Failed to generate song.",
          variant: "destructive",
        });
      }
    }
  }, [jobData, jobId, step, toast]);

  const handleGenerate = async () => {
    if (!prompt.trim() || !genre || !mood) return;

    setStep("generating");
    setLyrics("");
    setAudioUrl(null);
    setJobId(null);

    try {
      const result = await generateMutation.mutateAsync({ prompt, genre, mood });
      setJobId(result.jobId);
    } catch (error) {
      console.error("Error generating song:", error);
      setStep("input");
      toast({
        title: "Error",
        description: "Failed to start generation.",
        variant: "destructive",
      });
    }
  };

  const handleRestart = () => {
    if (audioElement) {
      audioElement.pause();
      setAudioElement(null);
    }
    setStep("input");
    setPrompt("");
    setGenre("");
    setMood("");
    setLyrics("");
    setAudioUrl(null);
    setJobId(null);
    setIsPlaying(false);
  };

  // Audio Logic
  useEffect(() => {
    if (audioUrl && step === "result") {
      const audio = new Audio(audioUrl);
      setAudioElement(audio);

      audio.addEventListener('loadedmetadata', () => setDuration(audio.duration));
      audio.addEventListener('timeupdate', () => setProgress(audio.currentTime));
      audio.addEventListener('ended', () => setIsPlaying(false));

      return () => {
        audio.pause();
        audio.remove();
      };
    }
  }, [audioUrl, step]);

  const togglePlay = () => {
    if (!audioElement) return;
    if (isPlaying) {
      audioElement.pause();
    } else {
      audioElement.play();
    }
    setIsPlaying(!isPlaying);
  };

  const seek = (value: number[]) => {
    if (audioElement) {
      audioElement.currentTime = value[0];
      setProgress(value[0]);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // --- VIEWS ---

  if (step === "input") {
    return (
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
              disabled={!prompt.trim() || !genre || !mood}
            >
              <Sparkles className="mr-2 h-5 w-5" /> Generate
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (step === "generating") {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-6 animate-in fade-in duration-500">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
          <Loader2 className="h-16 w-16 animate-spin text-primary relative z-10" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-medium">Creating your masterpiece...</h2>
          <p className="text-muted-foreground animate-pulse">
            {jobData?.lyrics && !jobData?.audioUrl ? "Composing melody..." : "Writing lyrics..."}
          </p>
        </div>
      </div>
    );
  }

  // Result View
  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Scrollable Lyrics Area */}
      <div className="flex-1 overflow-y-auto p-6 md:p-12 text-center">
         <div className="max-w-2xl mx-auto space-y-8 pb-24">
            <div className="space-y-2">
               <h2 className="text-xl font-medium text-muted-foreground uppercase tracking-widest">{genre} • {mood}</h2>
               <div className="h-1 w-20 bg-primary/30 mx-auto rounded-full" />
            </div>
            
            <div className="whitespace-pre-wrap text-2xl md:text-3xl font-medium leading-relaxed text-foreground/90 font-serif">
              {lyrics ? lyrics : "Lyrics not available."}
            </div>
         </div>
      </div>

      {/* Sticky Bottom Player */}
      <div className="shrink-0 bg-background/80 backdrop-blur-lg border-t p-4 md:p-6 pb-8">
        <div className="max-w-3xl mx-auto flex flex-col gap-4">
           {/* Progress Bar */}
           <div className="flex items-center gap-3 text-xs font-mono text-muted-foreground">
             <span>{formatTime(progress)}</span>
             <Slider 
               value={[progress]} 
               max={duration || 100} 
               step={0.1} 
               onValueChange={seek}
               className="flex-1 cursor-pointer"
             />
             <span>{formatTime(duration)}</span>
           </div>

           {/* Controls */}
           <div className="flex items-center justify-between">
              <Button variant="ghost" size="sm" onClick={handleRestart} className="text-muted-foreground hover:text-foreground">
                <ChevronLeft className="mr-2 h-4 w-4" /> New Song
              </Button>
              
              <div className="flex items-center gap-4">
                 <Button size="icon" className="h-12 w-12 rounded-full shadow-lg" onClick={togglePlay}>
                    {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-1" />}
                 </Button>
              </div>

              <div className="w-[100px]" /> {/* Spacer for centering */}
           </div>
        </div>
      </div>
    </div>
  );
}
