import { cn } from "@/lib/utils";
import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";

interface LyricsDisplayProps {
  lyrics: string;
  isGenerating?: boolean;
}

export function LyricsDisplay({ lyrics, isGenerating }: LyricsDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(lyrics);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isGenerating) {
    return (
      <div className="bg-card rounded-2xl p-8 shadow-soft border border-border">
        <div className="flex flex-col items-center justify-center py-12 gap-4">
          <div className="flex gap-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-3 h-3 rounded-full bg-primary animate-pulse-soft"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
          <p className="text-muted-foreground text-lg">Composing your lyrics...</p>
        </div>
      </div>
    );
  }

  if (!lyrics) return null;

  return (
    <div className="bg-card rounded-2xl shadow-soft border border-border overflow-hidden animate-fade-in">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/50">
        <h3 className="font-serif text-xl font-semibold text-foreground">Your Song Lyrics</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="gap-2"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              Copy
            </>
          )}
        </Button>
      </div>
      <div className="p-8">
        <pre className="whitespace-pre-wrap font-serif text-lg leading-relaxed text-foreground/90">
          {lyrics}
        </pre>
      </div>
    </div>
  );
}
