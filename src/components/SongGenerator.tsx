import { useState, useEffect } from "react";
import { Wand2, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { GenreSelector } from "./GenreSelector";
import { MoodSelector } from "./MoodSelector";
import { LyricsDisplay } from "./LyricsDisplay";
import { AudioPlayer } from "./AudioPlayer";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useGenerateSong, useJobStatus } from "@/hooks/useSongGeneration";
import { getAudioUrl } from "@/lib/api/client";

type Step = "prompt" | "genre" | "mood" | "result";

export function SongGenerator() {
  const [step, setStep] = useState<Step>("prompt");
  const [prompt, setPrompt] = useState("");
  const [genre, setGenre] = useState("");
  const [mood, setMood] = useState("");
  const [lyrics, setLyrics] = useState("");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const { toast } = useToast();

  const generateMutation = useGenerateSong();
  const { data: jobData } = useJobStatus(jobId, step === "result");

  const isGeneratingLyrics = jobId !== null && (!jobData || (jobData.status === "processing" && !jobData.lyrics));
  const isGeneratingMusic = jobId !== null && (!jobData || (jobData.status === "processing" && !jobData.audioUrl));

  useEffect(() => {
    if (jobData) {
      if (jobData.lyrics) {
        setLyrics(jobData.lyrics);
      }
      
      if (jobData.audioUrl) {
        setAudioUrl(getAudioUrl(jobData.audioUrl));
      }

      if (jobData.status === "completed" && jobId) {
        toast({
          title: "Song Created!",
          description: "Your personalized song is ready to play.",
        });
        // Clear jobId from local state once complete to stop polling if necessary, 
        // but hook handles it too.
      }

      if (jobData.status === "failed") {
        toast({
          title: "Error",
          description: jobData.error || "Failed to generate song. Please try again.",
          variant: "destructive",
        });
      }
    }
  }, [jobData, jobId, toast]);

  const steps = [
    { id: "prompt", label: "Your Story", number: 1 },
    { id: "genre", label: "Genre", number: 2 },
    { id: "mood", label: "Mood", number: 3 },
    { id: "result", label: "Your Song", number: 4 },
  ];

  const currentStepIndex = steps.findIndex((s) => s.id === step);

  const handleNext = () => {
    if (step === "prompt" && prompt.trim()) {
      setStep("genre");
    } else if (step === "genre" && genre) {
      setStep("mood");
    } else if (step === "mood" && mood) {
      handleGenerate();
    }
  };

  const handleGenerate = async () => {
    setStep("result");
    setLyrics("");
    setAudioUrl(null);
    setJobId(null);

    try {
      const result = await generateMutation.mutateAsync({
        prompt,
        genre,
        mood,
      });
      setJobId(result.jobId);
    } catch (error) {
      console.error("Error generating song:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate song. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleStartOver = () => {
    setStep("prompt");
    setPrompt("");
    setGenre("");
    setMood("");
    setLyrics("");
    setAudioUrl(null);
    setJobId(null);
  };

  return (
    <section className="py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-12">
          {steps.map((s, index) => (
            <div key={s.id} className="flex items-center">
              <div
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300",
                  index <= currentStepIndex
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                <span className="w-6 h-6 rounded-full bg-primary-foreground/20 flex items-center justify-center text-sm font-medium">
                  {s.number}
                </span>
                <span className="hidden sm:inline font-medium">{s.label}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="bg-card rounded-3xl shadow-medium border border-border p-8 sm:p-12">
          {step === "prompt" && (
            <div className="animate-fade-in">
              <h2 className="font-serif text-3xl font-semibold text-foreground mb-4 text-center">
                Tell Us Your Story
              </h2>
              <p className="text-muted-foreground text-center mb-8 max-w-lg mx-auto">
                Describe a memory, feeling, or moment you'd like to turn into a song. 
                The more details you share, the more personal your song will be.
              </p>
              <Textarea
                placeholder="Example: I want a song about my morning walks in the garden with my grandchildren, watching the butterflies dance around the flowers..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[160px] text-lg resize-none mb-8 rounded-xl border-2 border-border focus:border-primary bg-background"
              />
              <div className="flex justify-center">
                <Button
                  variant="hero"
                  size="lg"
                  onClick={handleNext}
                  disabled={!prompt.trim()}
                  className="gap-2"
                >
                  Continue
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>
            </div>
          )}

          {step === "genre" && (
            <div className="animate-fade-in">
              <h2 className="font-serif text-3xl font-semibold text-foreground mb-4 text-center">
                Choose Your Genre
              </h2>
              <p className="text-muted-foreground text-center mb-8">
                Select the musical style that speaks to you.
              </p>
              <GenreSelector selected={genre} onSelect={setGenre} />
              <div className="flex justify-center gap-4 mt-10">
                <Button variant="outline" onClick={() => setStep("prompt")}>
                  Back
                </Button>
                <Button
                  variant="hero"
                  size="lg"
                  onClick={handleNext}
                  disabled={!genre}
                  className="gap-2"
                >
                  Continue
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>
            </div>
          )}

          {step === "mood" && (
            <div className="animate-fade-in">
              <h2 className="font-serif text-3xl font-semibold text-foreground mb-4 text-center">
                Set the Mood
              </h2>
              <p className="text-muted-foreground text-center mb-8">
                How do you want your song to feel?
              </p>
              <MoodSelector selected={mood} onSelect={setMood} />
              <div className="flex justify-center gap-4 mt-10">
                <Button variant="outline" onClick={() => setStep("genre")}>
                  Back
                </Button>
                <Button
                  variant="hero"
                  size="lg"
                  onClick={handleNext}
                  disabled={!mood}
                  className="gap-2"
                >
                  <Wand2 className="w-5 h-5" />
                  Create My Song
                </Button>
              </div>
            </div>
          )}

          {step === "result" && (
            <div className="animate-fade-in space-y-8">
              <div className="text-center mb-8">
                <h2 className="font-serif text-3xl font-semibold text-foreground mb-2">
                  Your Personalized Song
                </h2>
                <p className="text-muted-foreground">
                  {genre.charAt(0).toUpperCase() + genre.slice(1)} • {mood.charAt(0).toUpperCase() + mood.slice(1)}
                </p>
              </div>
              
              <LyricsDisplay lyrics={lyrics} isGenerating={isGeneratingLyrics} />
              <AudioPlayer audioUrl={audioUrl} isGenerating={isGeneratingMusic} />
              
              {!isGeneratingLyrics && !isGeneratingMusic && (
                <div className="flex justify-center pt-4">
                  <Button variant="outline" size="lg" onClick={handleStartOver}>
                    Create Another Song
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
