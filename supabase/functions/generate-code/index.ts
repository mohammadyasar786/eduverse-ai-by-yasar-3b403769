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
    const { instruction, language = "python" } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Generating code for instruction:", instruction);

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
            content: `You are Talk2Code, an AI coding assistant that converts natural language instructions into working code.

Your job is to:
1. Understand the user's coding request in plain English
2. Generate clean, well-structured ${language} code
3. Add helpful comments explaining each part of the code
4. Follow best practices and coding conventions
5. Make the code beginner-friendly and educational

IMPORTANT: Return ONLY the code with comments. Do not include any explanations outside the code block.
Format your response as a complete, runnable ${language} program with:
- A header comment explaining what the code does
- Inline comments explaining key parts
- Example usage at the bottom if applicable`
          },
          {
            role: "user",
            content: instruction
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      return new Response(JSON.stringify({ error: "AI service temporarily unavailable" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const generatedCode = data.choices?.[0]?.message?.content || "// Error generating code";

    // Clean up the code - remove markdown code blocks if present
    let cleanCode = generatedCode;
    if (cleanCode.startsWith("```")) {
      cleanCode = cleanCode.replace(/^```[\w]*\n?/, "").replace(/\n?```$/, "");
    }

    console.log("Code generated successfully");
    
    return new Response(JSON.stringify({ generatedCode: cleanCode }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Code generation error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
