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
    const { type, ...params } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let systemPrompt = "";
    let userPrompt = "";

    switch (type) {
      case "explanation":
        systemPrompt = `You are an expert educational AI tutor. Generate a concept explanation adapted to the student's learning style and current level.

Learning Style Guidelines:
- visual: Use diagrams descriptions, flowcharts, and visual metaphors
- analogy: Use real-world analogies and relatable comparisons
- step-by-step: Break down into numbered sequential steps
- formula-first: Start with formal definitions and mathematical notation

Adapt complexity based on:
- Diagnostic score: ${params.diagnosticScore}% (lower = simpler explanations)
- Quiz score: ${params.quizScore}% (lower = more foundational)
- Time spent: ${params.timeSpent}s (higher = they may be struggling)

Keep explanations clear, encouraging, and at an undergraduate academic level.`;

        userPrompt = `Generate an explanation for "${params.conceptTitle}" using the ${params.learningStyle} learning style.

Base content: ${params.conceptContent}

Provide a comprehensive yet accessible explanation with:
1. Main concept explanation (adapted to learning style)
2. Key points to remember
3. A practical example or application`;
        break;

      case "practice":
        systemPrompt = `You are an expert educational AI creating adaptive practice questions.
        
Generate ${params.numQuestions} multiple-choice questions for the concept "${params.conceptTitle}" at ${params.difficulty} difficulty level.

Difficulty guidelines:
- easy: Basic recall and understanding questions
- medium: Application and analysis questions
- hard: Synthesis and evaluation questions

Return a JSON array with this exact structure:
{
  "questions": [
    {
      "question": "Question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0,
      "difficulty": "easy|medium|hard",
      "explanation": "Brief explanation of the correct answer"
    }
  ]
}`;

        userPrompt = `Generate ${params.numQuestions} ${params.difficulty} difficulty questions about ${params.conceptTitle}.
Return ONLY valid JSON matching the specified structure.`;
        break;

      case "why-stuck":
        systemPrompt = `You are a supportive educational AI helping students understand their mistakes.

Analyze the student's incorrect answer and:
1. Identify the likely misconception
2. Explain why the correct answer is right
3. Suggest a targeted micro-explanation

Be supportive and use academic language. Never make the student feel bad about their mistake.`;

        userPrompt = `Question: ${params.question}
Student's answer: ${params.selectedAnswer}
Correct answer: ${params.correctAnswer}
Topic: ${params.conceptTitle}

Return a JSON object with:
{
  "misconception": "Brief description of the likely misconception",
  "explanation": "Clear explanation of why the correct answer is right",
  "suggestion": "A targeted tip to help the student understand better"
}`;
        break;

      default:
        throw new Error(`Unknown request type: ${type}`);
    }

    console.log(`Processing ${type} request for concept: ${params.conceptTitle || params.conceptId}`);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "API credits exhausted. Please add credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content received from AI");
    }

    console.log(`Successfully generated ${type} response`);

    // Parse response based on type
    let result;
    if (type === "explanation") {
      result = { explanation: content };
    } else {
      // Parse JSON responses
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          result = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error("No JSON found in response");
        }
      } catch (parseError) {
        console.error("JSON parse error:", parseError);
        // Return fallback based on type
        if (type === "practice") {
          result = {
            questions: [
              {
                question: `What is a key concept of ${params.conceptTitle}?`,
                options: ["Option A", "Option B", "Option C", "Option D"],
                correctIndex: 1,
                difficulty: params.difficulty,
                explanation: "This is the fundamental concept."
              }
            ]
          };
        } else {
          result = {
            misconception: "Common confusion between concepts",
            explanation: "Review the core definition and properties.",
            suggestion: "Try re-reading the concept explanation."
          };
        }
      }
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Error in adaptive-learning function:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
