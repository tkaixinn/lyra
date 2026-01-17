import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { usePianoTilesChart } from "@/hooks/useSongGeneration";
import type { PianoTileNote } from "@/lib/api/types";
import { cn } from "@/lib/utils";
import { ArrowLeft, ChevronLeft, ChevronRight, Pause, Play, RotateCcw, Trophy } from "lucide-react";

type GamePhase = "ready" | "playing" | "ended";

type ActiveNote = PianoTileNote & { id: string };

const SPAWN_LEAD_MS = 2400;
const HIT_WINDOW_MS = 160;

const formatDuration = (durationMs: number) => {
  const totalSeconds = Math.round(durationMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

const formatElapsed = (elapsedMs: number) => {
  const totalSeconds = Math.floor(elapsedMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

const PianoTiles = () => {
  const { songId } = useParams<{ songId: string }>();
  const navigate = useNavigate();
  const { data: chart, isLoading, isError } = usePianoTilesChart(songId ?? null, !!songId);

  const [phase, setPhase] = useState<GamePhase>("ready");
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [currentTimeMs, setCurrentTimeMs] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [activeLane, setActiveLane] = useState<number | null>(null);
  const laneTimeoutRef = useRef<number | null>(null);
  const boardRef = useRef<HTMLDivElement | null>(null);
  const [laneHeight, setLaneHeight] = useState(0);
  const [notes, setNotes] = useState<ActiveNote[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentTimeRef = useRef(0);

  const hitLineOffset = 52;
  const hitLineY = Math.max(0, laneHeight - hitLineOffset);
  const baseTileHeight = useMemo(() => {
    if (!laneHeight) return 56;
    return Math.max(56, Math.round(laneHeight * 0.16));
  }, [laneHeight]);

  const buildActiveNotes = (noteList: PianoTileNote[]) =>
    noteList.map((note, index) => ({
      ...note,
      id: `${note.tMs}-${note.lane}-${index}`,
    }));

  useEffect(() => {
    if (!boardRef.current) return;
    const element = boardRef.current;
    const updateSize = () => setLaneHeight(element.clientHeight);
    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!chart) return;

    // Validate chart has valid data
    if (!chart.durationMs || chart.durationMs <= 0) {
      console.error('Invalid chart: durationMs must be positive', chart);
      return;
    }

    if (!Array.isArray(chart.notes)) {
      console.error('Invalid chart: notes must be an array', chart);
      return;
    }

    setNotes(buildActiveNotes(chart.notes));
    setCurrentTimeMs(0);
    currentTimeRef.current = 0;
    setHits(0);
    setMisses(0);
    setPhase("ready");
  }, [chart]);

  useEffect(() => {
    if (!chart?.audioUrl) return;
    const audio = new Audio(chart.audioUrl);
    audio.preload = "auto";
    audioRef.current = audio;

    const handleEnded = () => setPhase("ended");
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.pause();
      audio.removeEventListener("ended", handleEnded);
      if (audioRef.current === audio) {
        audioRef.current = null;
      }
    };
  }, [chart?.audioUrl]);

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.playbackRate = playbackSpeed;
  }, [playbackSpeed]);

  useEffect(() => {
    if (phase !== "playing") return;
    const handleKeyDown = (event: KeyboardEvent) => {
      const laneIndex = ["1", "2", "3", "4"].indexOf(event.key);
      if (laneIndex === -1) return;
      const timeMs = currentTimeRef.current;
      setNotes((prev) => {
        let bestIndex = -1;
        let bestDistance = Number.POSITIVE_INFINITY;
        prev.forEach((note, index) => {
          if (note.lane !== laneIndex) return;
          const distance = Math.abs(note.tMs - timeMs);
          if (distance <= HIT_WINDOW_MS && distance < bestDistance) {
            bestDistance = distance;
            bestIndex = index;
          }
        });

        if (bestIndex === -1) {
          setMisses((current) => current + 1);
          return prev;
        }

        setHits((current) => current + 1);
        return prev.filter((_, index) => index !== bestIndex);
      });
      setActiveLane(laneIndex);
      if (laneTimeoutRef.current) {
        window.clearTimeout(laneTimeoutRef.current);
      }
      laneTimeoutRef.current = window.setTimeout(() => {
        setActiveLane(null);
      }, 150);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (laneTimeoutRef.current) {
        window.clearTimeout(laneTimeoutRef.current);
      }
    };
  }, [phase]);

  useEffect(() => {
    if (phase !== "playing" || !chart) return;
    const audio = audioRef.current;
    if (!audio) return;

    let isActive = true;
    const updateFromAudio = () => {
      if (!isActive) return;
      const timeMs = audio.currentTime * 1000;
      currentTimeRef.current = timeMs;
      setCurrentTimeMs(timeMs);
      setNotes((prev) => {
        let missesToAdd = 0;
        const next = prev.filter((note) => {
          if (timeMs > note.tMs + HIT_WINDOW_MS) {
            missesToAdd += 1;
            return false;
          }
          return true;
        });
        if (missesToAdd > 0) {
          setMisses((current) => current + missesToAdd);
        }
        return next;
      });

      if (audio.ended || timeMs >= chart.durationMs) {
        setPhase("ended");
        audio.pause();
        return;
      }

      animationFrameRef.current = window.requestAnimationFrame(updateFromAudio);
    };

    animationFrameRef.current = window.requestAnimationFrame(updateFromAudio);
    return () => {
      isActive = false;
      if (animationFrameRef.current) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }
      animationFrameRef.current = null;
    };
  }, [phase, chart]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
          <h2 className="text-2xl font-semibold">Loading chart...</h2>
          <p className="text-muted-foreground">Preparing your piano tiles run.</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!chart || isError) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
          <h2 className="text-2xl font-semibold">Song not found</h2>
          <p className="text-muted-foreground">
            Pick a track from the Play list to launch the piano tiles demo.
          </p>
          <Button variant="outline" onClick={() => navigate("/play")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Play
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const progress = chart.durationMs > 0
    ? Math.min(currentTimeMs / chart.durationMs, 1)
    : 0;
  const accuracy = hits + misses > 0 ? Math.round((hits / (hits + misses)) * 100) : 0;

  const handleStart = () => {
    if (!chart) return;
    const audio = audioRef.current;
    if (!audio) return;

    // Helper to start the game
    const startGameNow = () => {
      setHits(0);
      setMisses(0);
      setNotes(buildActiveNotes(chart.notes));

      audio.currentTime = 0;
      audio.playbackRate = playbackSpeed;
      audio.play().catch(() => {});

      // Use requestAnimationFrame to ensure timing sync happens
      // on the same frame as the first "playing" render
      requestAnimationFrame(() => {
        const initialTimeMs = audio.currentTime * 1000;
        currentTimeRef.current = initialTimeMs;
        setCurrentTimeMs(initialTimeMs);
        setPhase("playing");
      });
    };

    // Check if audio is ready (HTMLMediaElement.HAVE_CURRENT_DATA = 2)
    if (audio.readyState < 2) {
      const handleCanPlay = () => {
        audio.removeEventListener('canplay', handleCanPlay);
        startGameNow();
      };
      audio.addEventListener('canplay', handleCanPlay);
      return;
    }

    startGameNow();
  };

  const handlePause = () => {
    setPhase("ended");
    audioRef.current?.pause();
  };

  const decreasePlaybackSpeed = () => {
    setPlaybackSpeed((prev) => Math.max(0.25, Number((prev - 0.25).toFixed(2))));
  };

  const increasePlaybackSpeed = () => {
    setPlaybackSpeed((prev) => Math.min(2.0, Number((prev + 0.25).toFixed(2))));
  };

  return (
    <DashboardLayout>
      <div className="relative h-full overflow-hidden">
        <div className="absolute inset-0 soft-gradient" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.5),_transparent_55%)]" />

        <div className="relative h-full px-6 py-6 pb-28">
          <div className="relative h-full">
            <div ref={boardRef} className="relative h-full max-w-5xl mx-auto">
              <div
                className={cn(
                  "grid grid-cols-4 gap-3 h-full rounded-[28px] border border-border/60 bg-card/60 p-4 shadow-soft transition-all duration-300",
                  phase !== "playing" && "blur-sm"
                )}
              >
                {Array.from({ length: 4 }).map((_, laneIndex) => (
                  <div
                    key={`lane-${laneIndex}`}
                    className={cn(
                      "relative rounded-2xl border border-border/70 bg-background/40 overflow-hidden",
                      activeLane === laneIndex && "ring-2 ring-primary/60 shadow-glow"
                    )}
                  >
                    <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-primary/15 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-primary/20 to-transparent" />

                  {notes
                      .filter((note) => note.lane === laneIndex)
                      .map((note) => {
                        const spawnTimeMs = note.tMs - SPAWN_LEAD_MS;
                        const progressRatio =
                          (currentTimeMs - spawnTimeMs) / SPAWN_LEAD_MS;
                        if (progressRatio < 0 || progressRatio > 1.2) return null;
                        const longNoteHeight = note.durationMs
                          ? Math.min(
                              Math.max(
                                (note.durationMs / SPAWN_LEAD_MS) * laneHeight,
                                baseTileHeight
                              ),
                              laneHeight * 0.5
                            )
                          : baseTileHeight;
                        // Tiles start at top and move down to hit line
                        // When progressRatio = 0: y = -height (just entering from top)
                        // When progressRatio = 1: y = hitLineY - height (tile bottom at hit line)
                        const travelDistance = hitLineY + longNoteHeight;
                        const y = progressRatio * travelDistance - longNoteHeight;
                        return (
                        <div
                          key={note.id}
                          className="absolute left-1/2 -translate-x-1/2 w-[70%] rounded-2xl border border-primary/40 bg-primary/30 shadow-soft"
                          style={{ top: y, height: longNoteHeight }}
                        />
                        );
                      })}

                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[80%] h-1.5 rounded-full bg-primary/40" />
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-10 h-10 rounded-xl border border-border bg-background/70 flex items-center justify-center text-sm font-semibold text-muted-foreground">
                      {laneIndex + 1}
                    </div>
                  </div>
                ))}
              </div>

              <div className="absolute top-4 right-4 flex items-center gap-3 rounded-2xl border border-border/60 bg-background/80 px-3 py-2 text-xs text-muted-foreground shadow-soft backdrop-blur-sm">
                <span>Hits: <span className="text-foreground font-semibold">{hits}</span></span>
                <span>Misses: <span className="text-foreground font-semibold">{misses}</span></span>
                <span className="font-mono text-foreground">
                  {formatElapsed(currentTimeMs)} / {formatDuration(chart.durationMs)}
                </span>
              </div>

              <div className="absolute left-6 right-6 top-2 h-1 rounded-full bg-muted/60 overflow-hidden">
                <div
                  className="h-full hero-gradient transition-all duration-200"
                  style={{ width: `${progress * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {phase !== "playing" && (
          <div className="absolute inset-0 flex items-center justify-center px-6">
            <div className="w-full max-w-md rounded-3xl border border-border bg-background/85 p-8 shadow-medium backdrop-blur-sm">
              {phase === "ready" ? (
                <div className="space-y-5 text-center">
                  <div className="mx-auto w-14 h-14 rounded-2xl hero-gradient flex items-center justify-center shadow-glow">
                    <Play className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-2xl font-semibold">Ready to play?</h2>
                    <p className="text-muted-foreground">
                      Tiles are beat-matched for this track. Misses won&apos;t stop the run.
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button variant="hero" onClick={handleStart}>
                      Start Game
                    </Button>
                    <Button variant="outline" onClick={() => navigate("/play")}>
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-5 text-center">
                  <div className="mx-auto w-14 h-14 rounded-2xl warm-gradient flex items-center justify-center shadow-glow">
                    <Trophy className="w-6 h-6 text-accent-foreground" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-2xl font-semibold">Run complete</h2>
                    <p className="text-muted-foreground">
                      {formatElapsed(currentTimeMs)} played • {accuracy}% accuracy
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-2xl border border-border bg-secondary/40 p-4">
                      <p className="text-muted-foreground">Hits</p>
                      <p className="text-xl font-semibold text-foreground">{hits}</p>
                    </div>
                    <div className="rounded-2xl border border-border bg-secondary/40 p-4">
                      <p className="text-muted-foreground">Misses</p>
                      <p className="text-xl font-semibold text-foreground">{misses}</p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button variant="hero" onClick={handleStart}>
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Play Again
                    </Button>
                    <Button variant="outline" onClick={() => navigate("/play")}>
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to Play
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="fixed bottom-0 left-0 right-0 z-10 border-t border-border bg-background/80 backdrop-blur-lg">
          <div className="max-w-4xl mx-auto flex items-center justify-center px-4 py-3 md:px-6 md:py-4">
            <div className="flex items-center gap-4">
              <Button
                size="icon"
                variant="ghost"
                className="h-10 w-10"
                onClick={decreasePlaybackSpeed}
                aria-label="Decrease playback speed"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button
                size="icon"
                className="h-12 w-12 rounded-full shadow-lg"
                onClick={phase === "playing" ? handlePause : handleStart}
                aria-label={phase === "playing" ? "Pause game" : "Start game"}
              >
                {phase === "playing" ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-1" />}
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-10 w-10"
                onClick={increasePlaybackSpeed}
                aria-label="Increase playback speed"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PianoTiles;
