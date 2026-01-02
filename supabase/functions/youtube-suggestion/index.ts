import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { conceptId, conceptTitle } = await req.json();
    
    console.log(`Fetching YouTube suggestion for: ${conceptTitle} (${conceptId})`);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are a helpful educational assistant that suggests YouTube videos for learning programming concepts.

Your task is to suggest ONE high-quality YouTube video that explains the given concept well.

Requirements for video selection:
- Short and focused (5-15 minutes preferred)
- Clear conceptual explanations suitable for beginners to intermediate learners
- From reputable educational channels
- Avoid long university lectures or clickbait content

Respond with a JSON object in this exact format:
{
  "title": "Video title",
  "videoId": "YouTube video ID (the part after v= in the URL)",
  "duration": "estimated duration like '8 min'"
}

Only respond with the JSON object, no other text.`
          },
          {
            role: "user",
            content: `Suggest a YouTube video for learning about: ${conceptTitle}

This is for a computer science/programming student learning data structures and algorithms.`
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("Failed to get video suggestion from AI");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    
    console.log("AI response:", content);

    // Parse the JSON response
    let video;
    try {
      // Clean up the response in case it has markdown code blocks
      const cleanedContent = content.replace(/```json\n?|\n?```/g, "").trim();
      video = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      // Return a fallback based on concept
      video = getFallbackVideo(conceptId, conceptTitle);
    }

    return new Response(
      JSON.stringify({ video }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in youtube-suggestion function:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error",
        video: null 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

function getFallbackVideo(conceptId: string, conceptTitle: string) {
  const fallbacks: Record<string, { title: string; videoId: string; duration: string }> = {
    arrays: {
      title: "Arrays in Programming - Complete Tutorial",
      videoId: "QJNwK2uJyGs",
      duration: "8 min"
    },
    "stacks-queues": {
      title: "Data Structures: Stacks and Queues",
      videoId: "wjI1WNcIntg",
      duration: "10 min"
    },
    "linked-lists": {
      title: "Introduction to Linked Lists",
      videoId: "R9PTBwOzceo",
      duration: "12 min"
    },
    trees: {
      title: "Binary Trees - Data Structures",
      videoId: "fAAZixBzIAI",
      duration: "11 min"
    },
    sorting: {
      title: "Sorting Algorithms Explained Visually",
      videoId: "kPRA0W1kECg",
      duration: "9 min"
    },
    searching: {
      title: "Binary Search Algorithm",
      videoId: "P3YID7liBug",
      duration: "7 min"
    },
    "hash-tables": {
      title: "Hash Tables and Hash Functions",
      videoId: "KyUTuwz_b7Q",
      duration: "10 min"
    },
    graphs: {
      title: "Graph Data Structure Introduction",
      videoId: "tWVWeAqZ0WU",
      duration: "15 min"
    },
  };

  return fallbacks[conceptId] || {
    title: `${conceptTitle} - Explained`,
    videoId: "8hly31xKli0",
    duration: "10 min"
  };
}
