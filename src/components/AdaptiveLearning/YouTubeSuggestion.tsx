import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Youtube, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface YouTubeSuggestionProps {
  conceptId: string;
  conceptTitle: string;
}

interface VideoSuggestion {
  title: string;
  videoId: string;
  duration: string;
}

const YouTubeSuggestion = ({ conceptId, conceptTitle }: YouTubeSuggestionProps) => {
  const [video, setVideo] = useState<VideoSuggestion | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchVideoSuggestion();
  }, [conceptId]);

  const fetchVideoSuggestion = async () => {
    setIsLoading(true);
    setError(false);
    
    try {
      const { data, error: fnError } = await supabase.functions.invoke("youtube-suggestion", {
        body: { conceptId, conceptTitle },
      });

      if (fnError) throw fnError;
      
      if (data?.video) {
        setVideo(data.video);
      }
    } catch (err) {
      console.error("Error fetching YouTube suggestion:", err);
      setError(true);
      // Use fallback video based on concept
      setVideo(getFallbackVideo(conceptId, conceptTitle));
    } finally {
      setIsLoading(false);
    }
  };

  const getFallbackVideo = (id: string, title: string): VideoSuggestion => {
    // Curated fallback videos for common CS concepts
    const fallbacks: Record<string, VideoSuggestion> = {
      arrays: {
        title: "Arrays Explained Simply",
        videoId: "QJNwK2uJyGs",
        duration: "8 min"
      },
      "stacks-queues": {
        title: "Stacks and Queues Tutorial",
        videoId: "wjI1WNcIntg",
        duration: "10 min"
      },
      "linked-lists": {
        title: "Linked Lists for Beginners",
        videoId: "R9PTBwOzceo",
        duration: "12 min"
      },
      trees: {
        title: "Binary Trees Made Easy",
        videoId: "fAAZixBzIAI",
        duration: "11 min"
      },
      sorting: {
        title: "Sorting Algorithms Visualized",
        videoId: "kPRA0W1kECg",
        duration: "9 min"
      },
      searching: {
        title: "Binary Search Explained",
        videoId: "P3YID7liBug",
        duration: "7 min"
      },
      "hash-tables": {
        title: "Hash Tables Demystified",
        videoId: "KyUTuwz_b7Q",
        duration: "10 min"
      },
      graphs: {
        title: "Graph Algorithms for Beginners",
        videoId: "tWVWeAqZ0WU",
        duration: "15 min"
      },
    };

    return fallbacks[id] || {
      title: `${title} - Concept Explanation`,
      videoId: "8hly31xKli0", // CS50 intro as general fallback
      duration: "10 min"
    };
  };

  const handleWatchVideo = () => {
    if (video?.videoId) {
      window.open(`https://www.youtube.com/watch?v=${video.videoId}`, "_blank", "noopener,noreferrer");
    }
  };

  if (isLoading) {
    return (
      <Card className="border-border/30 bg-muted/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-3 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Finding a helpful video...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!video) return null;

  return (
    <Card className="border-border/30 bg-muted/20 hover:bg-muted/30 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center flex-shrink-0">
            <Youtube className="h-5 w-5 text-destructive" />
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground mb-1">
              Optional YouTube Explanation
            </p>
            <h4 className="font-medium text-sm text-foreground truncate">
              {video.title}
            </h4>
            <p className="text-xs text-muted-foreground mt-1">
              {video.duration} • External resource for additional clarity (optional)
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleWatchVideo}
            className="gap-2 flex-shrink-0"
          >
            <ExternalLink className="h-3 w-3" />
            Watch on YouTube
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default YouTubeSuggestion;
