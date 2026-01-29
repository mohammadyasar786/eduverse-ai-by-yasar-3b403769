import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Input validation schema
const quizRequestSchema = z.object({
  concept: z.string().min(1).max(200),
  moduleName: z.string().min(1).max(200),
  numQuestions: z.number().int().min(1).max(10).default(5),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]).default("intermediate"),
  attemptNumber: z.number().int().min(1).default(1),
  previousQuestions: z.array(z.string()).default([]),
});

async function authenticateRequest(req: Request) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return { user: null, error: "Missing or invalid authorization header" };
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } }
  );

  const token = authHeader.replace("Bearer ", "");
  const { data, error } = await supabase.auth.getClaims(token);
  
  if (error || !data?.claims) {
    return { user: null, error: "Invalid or expired token" };
  }

  return { user: { id: data.claims.sub }, error: null };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate the request
    const { user, error: authError } = await authenticateRequest(req);
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: authError || "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate input
    const body = await req.json();
    const validationResult = quizRequestSchema.safeParse(body);
    
    if (!validationResult.success) {
      return new Response(
        JSON.stringify({ error: "Invalid input", details: validationResult.error.message }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { concept, moduleName, numQuestions, difficulty, attemptNumber, previousQuestions } = validationResult.data;
    
    // Generate unique seed for this request
    const timestamp = new Date().toISOString();
    const uniqueSeed = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
    
    console.log(`Generating quiz for user ${user.id}: ${concept}, module: ${moduleName}, difficulty: ${difficulty}, attempt: ${attemptNumber}, seed: ${uniqueSeed}`);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build previous questions context to avoid repetition
    const previousQuestionsContext = previousQuestions.length > 0 
      ? `\n\nIMPORTANT - DO NOT REPEAT THESE QUESTIONS:\n${previousQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}\n\nCreate completely NEW and DIFFERENT questions that test the same concepts from different angles.`
      : '';

    // Difficulty-specific instructions
    const difficultyGuide = {
      beginner: "Focus on basic definitions, simple syntax, and fundamental concepts. Use straightforward examples.",
      intermediate: "Include application-level questions, common use cases, and require understanding of how concepts work together.",
      advanced: "Challenge with edge cases, optimization scenarios, complex problem-solving, and deep understanding of underlying mechanisms."
    };

    // Question style distribution
    const questionStyles = `
Generate a MIX of these question types (distribute across all ${numQuestions} questions):
1. CONCEPTUAL MCQs (${Math.ceil(numQuestions * 0.4)} questions): Test understanding of definitions, properties, and characteristics
2. SCENARIO-BASED (${Math.ceil(numQuestions * 0.3)} questions): Present real-world situations requiring application of knowledge
3. CODE OUTPUT (${Math.floor(numQuestions * 0.3)} questions): Show code snippets and ask what the output or result would be`;

    const systemPrompt = `You are an expert programming instructor creating UNIQUE quiz questions. 

GENERATION CONTEXT (use this to ensure uniqueness):
- Timestamp: ${timestamp}
- Unique Seed: ${uniqueSeed}
- Attempt Number: ${attemptNumber}
- Difficulty Level: ${difficulty}

Generate exactly ${numQuestions} FRESH multiple-choice questions about "${concept}" in the context of "${moduleName}".

DIFFICULTY LEVEL (${difficulty.toUpperCase()}):
${difficultyGuide[difficulty]}

${questionStyles}

CRITICAL RULES:
1. Each question MUST be UNIQUE and DIFFERENT from any previous attempts
2. Each question MUST have exactly ONE correct answer
3. The correctIndex MUST be the 0-based index of the correct answer in the options array (0, 1, 2, or 3)
4. DOUBLE CHECK that correctIndex matches the actual correct answer's position
5. The explanation MUST explain why the answer at correctIndex is correct
6. Make wrong options plausible but clearly incorrect to experts
7. VARY the position of correct answers (don't always put correct answer in same position)
8. Include the question type in a "type" field: "conceptual", "scenario", or "code"
${previousQuestionsContext}

IMPORTANT FOR UNIQUENESS:
- Use different angles to test the same concept
- Vary question phrasing and structure
- Use different examples and scenarios
- For code questions, use different variable names and values each time
- Reference the unique seed ${uniqueSeed} to inspire variation

Return ONLY valid JSON in this exact format:
{
  "questions": [
    {
      "question": "What is the time complexity of accessing an element by index in an array?",
      "options": ["O(1)", "O(n)", "O(log n)", "O(n²)"],
      "correctIndex": 0,
      "explanation": "Array index access is O(1) because elements are stored in contiguous memory, allowing direct address calculation.",
      "type": "conceptual"
    },
    {
      "question": "A web application needs to manage a list of recently viewed items where users can add new items and remove the oldest one when the limit is reached. Which data structure is most appropriate?",
      "options": ["Stack", "Queue", "Binary Tree", "Hash Map"],
      "correctIndex": 1,
      "explanation": "A Queue (FIFO - First In, First Out) is ideal for this scenario because it allows adding new items at the end and removing the oldest items from the front.",
      "type": "scenario"
    },
    {
      "question": "What will be the output of the following code?\\narr = [10, 20, 30, 40]\\nprint(arr[2])",
      "options": ["10", "20", "30", "40"],
      "correctIndex": 2,
      "explanation": "Array indexing starts at 0, so arr[2] accesses the third element, which is 30.",
      "type": "code"
    }
  ]
}

VERIFICATION: Before returning, verify:
1. Each correctIndex is valid (0-3) and matches the correct answer
2. All questions are NEW and not repeated
3. Question types are mixed as specified
4. Difficulty matches ${difficulty} level`;

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
          { role: "user", content: `Create ${numQuestions} BRAND NEW ${difficulty}-level quiz questions about "${concept}" for someone learning ${moduleName}. This is attempt #${attemptNumber}, so generate completely fresh questions. Use seed ${uniqueSeed} to ensure uniqueness. Remember: correctIndex must be 0-based (0=first option, 1=second, 2=third, 3=fourth). Mix question types: conceptual, scenario-based, and code output. Verify each answer is correct before returning.` }
        ],
        temperature: 0.9, // Higher temperature for more variety
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in AI response");
    }

    // Parse the JSON from the response
    let questions;
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        questions = parsed.questions;
        
        // Validate and fix correctIndex values
        questions = questions.map((q: any, idx: number) => {
          // Ensure correctIndex is a valid number between 0-3
          let correctIndex = typeof q.correctIndex === 'number' ? q.correctIndex : parseInt(q.correctIndex, 10);
          if (isNaN(correctIndex) || correctIndex < 0 || correctIndex > 3) {
            console.warn(`Question ${idx + 1} has invalid correctIndex: ${q.correctIndex}, defaulting to 0`);
            correctIndex = 0;
          }
          // Ensure options array has exactly 4 items
          const options = Array.isArray(q.options) && q.options.length === 4 
            ? q.options 
            : ["Option A", "Option B", "Option C", "Option D"];
          
          return {
            question: q.question || "Question not available",
            options,
            correctIndex,
            explanation: q.explanation || "No explanation available",
            type: q.type || "conceptual"
          };
        });
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse quiz response:", parseError);
      throw new Error("Failed to parse quiz questions");
    }

    console.log(`Successfully generated ${questions.length} unique questions for attempt ${attemptNumber}`);

    return new Response(JSON.stringify({ 
      questions,
      metadata: {
        attempt: attemptNumber,
        difficulty,
        timestamp,
        uniqueSeed
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error generating quiz:", error);
    return new Response(
      JSON.stringify({ 
        error: "An error occurred generating the quiz",
        questions: null 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
