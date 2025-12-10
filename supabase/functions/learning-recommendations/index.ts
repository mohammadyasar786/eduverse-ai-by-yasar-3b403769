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
    const { progress, recentTopics } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Generating learning recommendations for progress:", progress);

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
            content: `You are LearnFlow AI, an adaptive learning path generator for EduVerse.

Based on the student's progress data, generate personalized learning recommendations.

Return a JSON object with this structure:
{
  "recommendations": [
    {
      "type": "review" | "practice" | "advance",
      "title": "Short title",
      "reason": "Why this is recommended",
      "priority": "high" | "medium" | "low"
    }
  ],
  "nextTopic": "Suggested next topic to learn",
  "encouragement": "A motivational message for the student"
}

Keep recommendations practical and actionable. Maximum 3 recommendations.`
          },
          {
            role: "user",
            content: `Student progress: ${JSON.stringify(progress || {})}
Recent topics: ${JSON.stringify(recentTopics || [])}`
          }
        ],
      }),
    });

    if (!response.ok) {
      console.error("AI gateway error:", response.status);
      return new Response(JSON.stringify({ 
        recommendations: [
          { type: "practice", title: "Continue Learning", reason: "Keep up your momentum!", priority: "medium" }
        ],
        nextTopic: "Continue with your current module",
        encouragement: "Great progress! Keep going!"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    let result = data.choices?.[0]?.message?.content;
    
    // Parse JSON from response
    try {
      // Clean up markdown if present
      if (result.includes("```json")) {
        result = result.replace(/```json\n?/g, "").replace(/```\n?/g, "");
      }
      result = JSON.parse(result);
    } catch {
      result = {
        recommendations: [
          { type: "practice", title: "Continue Learning", reason: "Keep up your momentum!", priority: "medium" }
        ],
        nextTopic: "Continue with your current module",
        encouragement: "Great progress! Keep going!"
      };
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Recommendations error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error",
      recommendations: [],
      nextTopic: "",
      encouragement: "Keep learning!"
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
