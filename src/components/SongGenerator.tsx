import { useState, useEffect } from "react";
import { Loader2, Sparkles, Music4, AlertTriangle } from "lucide-react";
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

const formatLabel = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

export function SongGenerator() {
  const [prompt, setPrompt] = useState("");
  const [genre, setGenre] = useState("");
  const [mood, setMood] = useState("");
  const [lyrics, setLyrics] = useState("");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const { toast } = useToast();

  const generateMutation = useGenerateSong();
  const { data: jobData } = useJobStatus(jobId, jobId !== null);

  const isGeneratingLyrics =
    jobId !== null && (!jobData || (jobData.status === "processing" && !jobData.lyrics));
  const isGeneratingMusic =
    jobId !== null && (!jobData || (jobData.status === "processing" && !jobData.audioUrl));
  const isGenerating = generateMutation.isPending || isGeneratingLyrics || isGeneratingMusic;

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

  const handleGenerate = async () => {
    if (!prompt.trim() || !genre || !mood) return;

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
        description:
          error instanceof Error ? error.message : "Failed to generate song. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleReset = () => {
    setPrompt("");
    setGenre("");
    setMood("");
    setLyrics("");
    setAudioUrl(null);
    setJobId(null);
    generateMutation.reset();
  };

  const statusLabel = jobData?.status === "failed"
    ? "Generation failed"
    : isGenerating
    ? "Generating your song"
    : lyrics || audioUrl
    ? "Your song is ready"
    : "Ready to create";

  const statusDetail = jobData?.status === "failed"
    ? "Adjust your prompt or filters and try again."
    : isGenerating
    ? "Lyrics and audio will appear as soon as they are ready."
    : lyrics || audioUrl
    ? "Review the lyrics and press play when you're ready."
    : "Describe your story, choose a genre and mood, then generate.";

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-10">
      <div className="max-w-6xl mx-auto space-y-10">
        <div className="text-center max-w-3xl mx-auto">
          <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">
            Lyra Studio
          </p>
          <h1 className="text-display-sm sm:text-display font-semibold text-foreground mt-3">
            Turn a memory into music.
          </h1>
          <p className="text-body-lg text-muted-foreground mt-4">
            One page for filters, generation, lyrics, and playback. Describe the moment, choose the
            vibe, and we will do the rest.
          </p>
        </div>

        <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-8 items-start">
          <div className="bg-card/80 backdrop-blur rounded-3xl border border-border shadow-medium p-6 sm:p-8 space-y-8">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
                  Your story
                </span>
                <span className="text-xs text-muted-foreground">
                  {prompt.trim().length}/500
                </span>
              </div>
              <Textarea
                placeholder="Example: A quiet morning walk in the garden with my grandchildren, watching the butterflies drift between the flowers."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[180px] text-base sm:text-lg resize-none rounded-2xl border border-border bg-background/80 focus-visible:ring-1 focus-visible:ring-primary"
                maxLength={500}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Music4 className="w-4 h-4 text-primary" />
                Choose a genre
              </div>
              <GenreSelector selected={genre} onSelect={setGenre} />
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Sparkles className="w-4 h-4 text-accent" />
                Set the mood
              </div>
              <MoodSelector selected={mood} onSelect={setMood} />
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="hero"
                  size="lg"
                  onClick={handleGenerate}
                  disabled={!prompt.trim() || !genre || !mood || isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Generate song
                    </>
                  )}
                </Button>
                <Button variant="outline" size="lg" onClick={handleReset} disabled={isGenerating}>
                  Clear
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Generation usually takes under a minute.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-border bg-card/80 shadow-soft p-6">
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center",
                    jobData?.status === "failed"
                      ? "bg-destructive/10 text-destructive"
                      : isGenerating
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-foreground"
                  )}
                >
                  {jobData?.status === "failed" ? (
                    <AlertTriangle className="w-5 h-5" />
                  ) : isGenerating ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Sparkles className="w-5 h-5" />
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Status</p>
                  <p className="text-lg font-semibold text-foreground">{statusLabel}</p>
                  <p className="text-sm text-muted-foreground">{statusDetail}</p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span className="px-3 py-1 rounded-full border border-border bg-muted/70">
                  {genre ? formatLabel(genre) : "Choose a genre"}
                </span>
                <span className="px-3 py-1 rounded-full border border-border bg-muted/70">
                  {mood ? formatLabel(mood) : "Choose a mood"}
                </span>
              </div>
            </div>

            <LyricsDisplay lyrics={lyrics} isGenerating={isGeneratingLyrics} />
            <AudioPlayer audioUrl={audioUrl} isGenerating={isGeneratingMusic} />
          </div>
        </div>
      </div>
    </section>
  );
}
