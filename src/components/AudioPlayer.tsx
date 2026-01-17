import { useState, useRef, useEffect } from "react";
import { Play, Pause, RotateCcw, Download, Volume2 } from "lucide-react";
import { Button } from "./ui/button";
import { MusicWave } from "./MusicWave";
import { cn } from "@/lib/utils";

interface AudioPlayerProps {
  audioUrl: string | null;
  isGenerating?: boolean;
}

export function AudioPlayer({ audioUrl, isGenerating }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current) {
      const audio = audioRef.current;
      
      const handleTimeUpdate = () => {
        setProgress((audio.currentTime / audio.duration) * 100);
      };
      
      const handleLoadedMetadata = () => {
        setDuration(audio.duration);
      };
      
      const handleEnded = () => {
        setIsPlaying(false);
        setProgress(0);
      };

      audio.addEventListener("timeupdate", handleTimeUpdate);
      audio.addEventListener("loadedmetadata", handleLoadedMetadata);
      audio.addEventListener("ended", handleEnded);

      return () => {
        audio.removeEventListener("timeupdate", handleTimeUpdate);
        audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
        audio.removeEventListener("ended", handleEnded);
      };
    }
  }, [audioUrl]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleRestart = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      setProgress(0);
      if (!isPlaying) {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const handleDownload = () => {
    if (audioUrl) {
      const a = document.createElement("a");
      a.href = audioUrl;
      a.download = "my-song.mp3";
      a.click();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (isGenerating) {
    return (
      <div className="bg-card rounded-2xl p-8 shadow-soft border border-border">
        <div className="flex flex-col items-center justify-center py-8 gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full hero-gradient animate-pulse-soft" />
            <Volume2 className="w-8 h-8 text-primary-foreground absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-muted-foreground text-lg">Creating your melody...</p>
        </div>
      </div>
    );
  }

  if (!audioUrl) return null;

  return (
    <div className="bg-card rounded-2xl shadow-soft border border-border overflow-hidden animate-fade-in">
      <div className="px-6 py-4 border-b border-border bg-muted/50">
        <h3 className="font-serif text-xl font-semibold text-foreground">Your Song</h3>
      </div>
      
      <div className="p-8">
        <audio ref={audioRef} src={audioUrl} preload="metadata" />
        
        {/* Waveform visualization */}
        <div className="flex items-center justify-center mb-8">
          <MusicWave isPlaying={isPlaying} className="h-16" />
        </div>
        
        {/* Progress bar */}
        <div className="mb-6">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full hero-gradient transition-all duration-150"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-sm text-muted-foreground">
            <span>{formatTime((progress / 100) * duration)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
        
        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          <Button variant="outline" size="icon" onClick={handleRestart}>
            <RotateCcw className="w-5 h-5" />
          </Button>
          
          <Button
            variant="hero"
            size="xl"
            onClick={togglePlay}
            className="rounded-full w-16 h-16"
          >
            {isPlaying ? (
              <Pause className="w-7 h-7" />
            ) : (
              <Play className="w-7 h-7 ml-1" />
            )}
          </Button>
          
          <Button variant="outline" size="icon" onClick={handleDownload}>
            <Download className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
