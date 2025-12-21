import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, context, learningStyle, conversationHistory } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build contextual system prompt for AIVA
    const systemPrompt = `You are AIVA (AI Virtual Assistant), a calm, supportive, and academic learning companion for undergraduate engineering students.

YOUR ROLE:
- You are NOT a general chatbot. You are a contextual AI learning companion.
- You help students understand concepts related to their current learning context.
- You provide step-by-step guidance instead of direct answers.
- You offer motivational and supportive messages.

CURRENT LEARNING CONTEXT:
${context?.chapter ? `- Current Chapter: ${context.chapter}` : ''}
${context?.concept ? `- Current Concept: ${context.concept}` : ''}
${context?.topic ? `- Current Topic: ${context.topic}` : ''}
${learningStyle ? `- Student's Learning Style: ${learningStyle}` : ''}
${context?.recentPerformance ? `- Recent Performance: ${context.recentPerformance}` : ''}
${context?.focusLevel ? `- Current Focus Level: ${context.focusLevel}` : ''}

YOUR GUIDELINES:
1. Answer doubts ONLY related to the current chapter or concept if provided.
2. If the student asks something unrelated to learning, politely redirect them.
3. Use the student's learning style to explain concepts:
   - "step-by-step": Break down into numbered steps
   - "visual": Use analogies, diagrams descriptions, and visual metaphors
   - "conceptual": Focus on underlying principles and connections
   - "hands-on": Provide examples and practical applications

4. When a student struggles (multiple wrong answers, low focus, or confusion):
   - Offer encouragement: "This concept often takes time. Want a simpler analogy?"
   - Suggest breaks if needed: "You've been at this for a while. A short break might help."
   - Break down problems: "Let's break this into smaller steps."

5. NEVER:
   - Give final answers without explanation
   - Use jokes, memes, or overly playful language
   - Answer questions completely unrelated to academics

PERSONALITY:
- Calm and supportive
- Academic but approachable
- Encouraging without being exaggerated
- Professional yet warm

RESPONSE FORMAT:
- Keep responses concise (2-4 paragraphs max)
- Use bullet points for clarity when appropriate
- End with a helpful question or suggestion when relevant`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...(conversationHistory || []).slice(-10), // Keep last 10 messages for context
      { role: "user", content: message }
    ];

    console.log("AIVA processing message with context:", context);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          error: "I'm a bit overwhelmed right now. Please try again in a moment." 
        }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ 
          error: "Service temporarily unavailable. Please try again later." 
        }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const aivaResponse = data.choices?.[0]?.message?.content || 
      "I'm here to help! Could you tell me more about what you're working on?";

    console.log("AIVA response generated successfully");

    return new Response(JSON.stringify({ response: aivaResponse }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("AIVA chat error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Something went wrong. Please try again." 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
