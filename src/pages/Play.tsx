import DashboardLayout from "@/components/DashboardLayout";
import { PlaySongCard, type PlaySongListItem } from "@/components/PlaySongCard";
import { useHistory } from "@/hooks/useSongGeneration";
import { Gamepad2 } from "lucide-react";

const TEMPO_TO_BPM: Record<string, number> = {
  slow: 80,
  moderate: 110,
  upbeat: 140,
};

const getEstimatedDurationMs = (wordTimings?: { end: number }[]) => {
  const last = wordTimings?.[wordTimings.length - 1];
  return last ? Math.ceil(last.end * 1000) : 120000;
};

const Play = () => {
  const { data: history = [], isLoading, isError } = useHistory();
  const playableSongs: PlaySongListItem[] = history
    .filter((song) => song.status === "completed")
    .map((song) => ({
      jobId: song.job_id,
      title: song.prompt || "Untitled track",
      genre: song.genre || "unknown",
      mood: song.mood || "unknown",
      durationMs: getEstimatedDurationMs(song.wordTimings),
      bpm: TEMPO_TO_BPM[song.tempo || "moderate"] ?? TEMPO_TO_BPM.moderate,
      createdAt: song.created_at,
    }));

  return (
    <DashboardLayout>
      <div className="container max-w-6xl mx-auto py-8 px-4 h-full overflow-y-auto animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="p-1.5 rounded-lg hero-gradient shadow-soft">
                <Gamepad2 className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="text-sm uppercase tracking-[0.2em]">Playground</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight mt-2">Play Your Songs</h1>
            <p className="text-muted-foreground mt-1">
              Jump into a quick piano tiles session for any generated track.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          {isLoading && (
            <p className="text-sm text-muted-foreground">Loading your songs...</p>
          )}
          {isError && (
            <p className="text-sm text-destructive">Failed to load songs.</p>
          )}
          {!isLoading && !isError && playableSongs.length === 0 && (
            <p className="text-sm text-muted-foreground">No completed songs yet.</p>
          )}
          {playableSongs.map((song) => (
            <PlaySongCard key={song.jobId} song={song} />
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Play;
