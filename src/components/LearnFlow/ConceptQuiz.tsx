import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, CheckCircle2, XCircle, Loader2, Brain, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";

interface Question {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  type?: "conceptual" | "scenario" | "code";
}

interface ConceptQuizProps {
  concept: string;
  moduleName: string;
  onComplete: (passed: boolean) => void;
  onBack: () => void;
}

const ConceptQuiz = ({ concept, moduleName, onComplete, onBack }: ConceptQuizProps) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnswered, setIsAnswered] = useState(false);
  const [attemptNumber, setAttemptNumber] = useState(1);
  const [difficulty, setDifficulty] = useState<"beginner" | "intermediate" | "advanced">("intermediate");
  
  // Store previous questions to prevent repetition
  const previousQuestionsRef = useRef<string[]>([]);

  useEffect(() => {
    generateQuiz();
  }, [concept]);

  const generateQuiz = async (isRetry = false) => {
    setIsLoading(true);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setIsAnswered(false);
    
    if (isRetry) {
      setAttemptNumber(prev => prev + 1);
    }
    
    try {
      const { data, error } = await supabase.functions.invoke("generate-quiz", {
        body: {
          concept,
          moduleName,
          numQuestions: 5,
          difficulty,
          attemptNumber: isRetry ? attemptNumber + 1 : attemptNumber,
          previousQuestions: previousQuestionsRef.current
        }
      });

      if (error) throw error;

      if (data?.questions && data.questions.length > 0) {
        setQuestions(data.questions);
        // Store current questions to prevent repetition in next attempt
        const newQuestions = data.questions.map((q: Question) => q.question);
        previousQuestionsRef.current = [...previousQuestionsRef.current.slice(-10), ...newQuestions];
        
        if (data.metadata) {
          console.log(`Quiz generated: Attempt ${data.metadata.attempt}, Difficulty: ${data.metadata.difficulty}`);
        }
      } else {
        // Fallback questions if API fails
        setQuestions(getFallbackQuestions(concept));
      }
    } catch (error) {
      console.error("Error generating quiz:", error);
      toast.error("Failed to generate quiz, using fallback questions");
      setQuestions(getFallbackQuestions(concept));
    } finally {
      setIsLoading(false);
    }
  };

  const getFallbackQuestions = (concept: string): Question[] => {
    const fallbackQuestionSets: Record<string, Question[]> = {
      "Variables": [
        {
          question: "What is a variable in Python?",
          options: ["A fixed value", "A container for storing data", "A type of loop", "A function"],
          correctIndex: 1,
          explanation: "Variables are containers that store data values in memory.",
          type: "conceptual"
        },
        {
          question: "Which is the correct way to create a variable?",
          options: ["var name = 'Alice'", "name = 'Alice'", "let name = 'Alice'", "const name = 'Alice'"],
          correctIndex: 1,
          explanation: "In Python, you simply assign a value using the = operator.",
          type: "conceptual"
        },
        {
          question: "Can a variable's value be changed after creation?",
          options: ["No, never", "Yes, always", "Only if it's a string", "Only in functions"],
          correctIndex: 1,
          explanation: "Variables are mutable by default in Python.",
          type: "conceptual"
        },
        {
          question: "What will print(x) output if x = 10?",
          options: ["x", "'10'", "10", "Error"],
          correctIndex: 2,
          explanation: "print() outputs the value stored in the variable.",
          type: "code"
        },
        {
          question: "Which variable name is valid in Python?",
          options: ["2name", "my-name", "my_name", "my name"],
          correctIndex: 2,
          explanation: "Variable names can contain letters, numbers, and underscores, but cannot start with a number.",
          type: "conceptual"
        }
      ],
      "Data Types": [
        {
          question: "What data type is 'Hello World'?",
          options: ["Integer", "Float", "String", "Boolean"],
          correctIndex: 2,
          explanation: "Text enclosed in quotes is a string data type.",
          type: "conceptual"
        },
        {
          question: "What is the data type of True?",
          options: ["String", "Integer", "Boolean", "Float"],
          correctIndex: 2,
          explanation: "True and False are boolean values in Python.",
          type: "conceptual"
        },
        {
          question: "What type is 3.14?",
          options: ["Integer", "Float", "String", "Boolean"],
          correctIndex: 1,
          explanation: "Numbers with decimal points are floats.",
          type: "conceptual"
        },
        {
          question: "How do you check the type of a variable?",
          options: ["typeof(x)", "type(x)", "x.type()", "getType(x)"],
          correctIndex: 1,
          explanation: "The type() function returns the data type of a variable.",
          type: "code"
        },
        {
          question: "What is the result of type(42)?",
          options: ["<class 'float'>", "<class 'str'>", "<class 'int'>", "<class 'num'>"],
          correctIndex: 2,
          explanation: "42 is a whole number, which is an integer (int) in Python.",
          type: "code"
        }
      ]
    };

    return fallbackQuestionSets[concept] || [
      {
        question: `What is the main purpose of ${concept} in Python?`,
        options: ["To store data", "To process logic", "To define structure", "All of the above"],
        correctIndex: 3,
        explanation: `${concept} serves multiple purposes in Python programming.`,
        type: "conceptual"
      },
      {
        question: `Which is a key feature of ${concept}?`,
        options: ["Readability", "Performance", "Flexibility", "All of the above"],
        correctIndex: 3,
        explanation: `${concept} in Python is designed with multiple benefits in mind.`,
        type: "conceptual"
      },
      {
        question: `How do you typically use ${concept}?`,
        options: ["With special syntax", "As a function", "As a method", "Depends on context"],
        correctIndex: 3,
        explanation: `The usage of ${concept} varies based on the specific context.`,
        type: "scenario"
      },
      {
        question: `What is important to remember about ${concept}?`,
        options: ["Syntax matters", "Indentation is key", "Practice is essential", "All of the above"],
        correctIndex: 3,
        explanation: "All these aspects are important when working with Python.",
        type: "conceptual"
      },
      {
        question: `Why is ${concept} useful?`,
        options: ["Simplifies code", "Improves efficiency", "Enables reusability", "All of the above"],
        correctIndex: 3,
        explanation: `${concept} provides multiple benefits for Python programmers.`,
        type: "conceptual"
      }
    ];
  };

  const handleAnswerSelect = (index: number) => {
    if (isAnswered) return;
    
    setSelectedAnswer(index);
    setIsAnswered(true);
    
    if (index === questions[currentQuestion].correctIndex) {
      setScore(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      setShowResult(true);
    }
  };

  const handleRetryWithNewQuestions = () => {
    generateQuiz(true);
  };

  const getQuestionTypeBadge = (type?: string) => {
    switch (type) {
      case "conceptual":
        return <Badge variant="secondary" className="text-xs">Conceptual</Badge>;
      case "scenario":
        return <Badge variant="outline" className="text-xs bg-blue-500/10 text-blue-600 border-blue-200">Scenario</Badge>;
      case "code":
        return <Badge variant="outline" className="text-xs bg-green-500/10 text-green-600 border-green-200">Code</Badge>;
      default:
        return null;
    }
  };

  const passed = score >= Math.ceil(questions.length * 0.6);

  if (isLoading) {
    return (
      <Card className="p-8 border-2 rounded-3xl">
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <div className="relative">
            <Brain className="h-16 w-16 text-primary animate-pulse" />
            <Loader2 className="h-8 w-8 text-primary animate-spin absolute -bottom-2 -right-2" />
          </div>
          <h3 className="text-xl font-bold">Generating Fresh AI Quiz...</h3>
          <p className="text-muted-foreground text-center">
            Creating unique {difficulty} questions for {concept}
            {attemptNumber > 1 && <span className="block text-sm mt-1">Attempt #{attemptNumber}</span>}
          </p>
        </div>
      </Card>
    );
  }

  if (showResult) {
    return (
      <Card className="p-8 border-2 rounded-3xl">
        <div className="text-center space-y-6">
          <div className={`inline-flex p-6 rounded-full ${passed ? 'bg-success/10' : 'bg-destructive/10'}`}>
            {passed ? (
              <CheckCircle2 className="h-16 w-16 text-success" />
            ) : (
              <XCircle className="h-16 w-16 text-destructive" />
            )}
          </div>
          
          <div>
            <h2 className="text-3xl font-bold mb-2">
              {passed ? 'Congratulations!' : 'Keep Practicing!'}
            </h2>
            <p className="text-muted-foreground text-lg">
              You scored {score} out of {questions.length}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Attempt #{attemptNumber} • {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} level
            </p>
          </div>

          <Progress value={(score / questions.length) * 100} className="h-3" />

          <p className="text-muted-foreground">
            {passed 
              ? `Great job! You've mastered ${concept}!` 
              : `You need 60% to pass. Review the lesson and try again.`
            }
          </p>

          <div className="flex gap-4 justify-center flex-wrap">
            <Button variant="outline" onClick={onBack}>
              Back to Lesson
            </Button>
            <Button 
              variant="outline"
              onClick={handleRetryWithNewQuestions}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Try New Questions
            </Button>
            <Button 
              className={passed ? "gradient-success" : "gradient-primary"}
              onClick={() => onComplete(passed)}
            >
              {passed ? 'Complete & Continue' : 'Try Again Later'}
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  const currentQ = questions[currentQuestion];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Lesson
        </Button>
        <div className="flex items-center gap-2">
          <Badge variant="outline">Attempt #{attemptNumber}</Badge>
          <Badge variant="secondary" className="capitalize">{difficulty}</Badge>
        </div>
      </div>

      <Card className="p-8 border-2 rounded-3xl">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Question {currentQuestion + 1} of {questions.length}
              </span>
              {getQuestionTypeBadge(currentQ.type)}
            </div>
            <span className="text-sm font-medium text-primary">
              Score: {score}/{currentQuestion + (isAnswered ? 1 : 0)}
            </span>
          </div>
          <Progress value={((currentQuestion + 1) / questions.length) * 100} className="h-2" />
        </div>

        <h3 className="text-xl font-bold mb-6 whitespace-pre-wrap">{currentQ.question}</h3>

        <div className="space-y-3 mb-6">
          {currentQ.options.map((option, index) => {
            let buttonClass = "w-full p-4 text-left border-2 rounded-xl transition-all ";
            
            if (isAnswered) {
              if (index === currentQ.correctIndex) {
                buttonClass += "border-success bg-success/10 text-success";
              } else if (index === selectedAnswer && index !== currentQ.correctIndex) {
                buttonClass += "border-destructive bg-destructive/10 text-destructive";
              } else {
                buttonClass += "border-muted opacity-50";
              }
            } else {
              buttonClass += selectedAnswer === index 
                ? "border-primary bg-primary/10" 
                : "border-muted hover:border-primary/50";
            }

            return (
              <button
                key={index}
                className={buttonClass}
                onClick={() => handleAnswerSelect(index)}
                disabled={isAnswered}
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-medium">
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span className="whitespace-pre-wrap">{option}</span>
                </div>
              </button>
            );
          })}
        </div>

        {isAnswered && (
          <div className={`p-4 rounded-xl mb-6 ${
            selectedAnswer === currentQ.correctIndex 
              ? 'bg-success/10 border border-success/20' 
              : 'bg-destructive/10 border border-destructive/20'
          }`}>
            <p className="text-sm">
              <strong>Explanation:</strong> {currentQ.explanation}
            </p>
          </div>
        )}

        <Button 
          className="w-full gradient-primary text-primary-foreground"
          onClick={handleNext}
          disabled={!isAnswered}
        >
          {currentQuestion < questions.length - 1 ? 'Next Question' : 'See Results'}
        </Button>
      </Card>
    </div>
  );
};

export default ConceptQuiz;
