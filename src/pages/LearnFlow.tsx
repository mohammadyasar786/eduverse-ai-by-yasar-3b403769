import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import Navigation from "@/components/Navigation";
import { TrendingUp, Target, BookOpen, Award, ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface LearningPath {
  status: "completed" | "current" | "next" | "locked";
  title: string;
  progress: number;
  topics: string[];
  icon: typeof CheckCircle2;
}

interface Recommendation {
  type: string;
  title: string;
  reason: string;
  priority?: string;
}

const LearnFlow = () => {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  const [encouragement, setEncouragement] = useState("");
  
  const [learningPath, setLearningPath] = useState<LearningPath[]>([
    {
      status: "completed",
      title: "Introduction to Python",
      progress: 100,
      topics: ["Variables", "Data Types", "Operators"],
      icon: CheckCircle2
    },
    {
      status: "current",
      title: "Control Flow",
      progress: 60,
      topics: ["If Statements", "Loops", "Functions"],
      icon: Target
    },
    {
      status: "next",
      title: "Data Structures",
      progress: 0,
      topics: ["Lists", "Dictionaries", "Sets"],
      icon: BookOpen
    },
    {
      status: "locked",
      title: "Object-Oriented Programming",
      progress: 0,
      topics: ["Classes", "Inheritance", "Polymorphism"],
      icon: Award
    }
  ]);

  const [recommendations, setRecommendations] = useState<Recommendation[]>([
    {
      type: "review",
      title: "Review: Python Functions",
      reason: "Strengthen your understanding",
    },
    {
      type: "practice",
      title: "Practice: Loop Exercises",
      reason: "Build coding muscle memory",
    },
    {
      type: "advance",
      title: "Ready: Data Structures",
      reason: "You've mastered the prerequisites",
    }
  ]);

  useEffect(() => {
    if (!authLoading && !user) {
      toast.error("Please sign in to use LearnFlow");
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  const fetchRecommendations = async () => {
    setIsLoadingRecommendations(true);
    
    try {
      const { data, error } = await supabase.functions.invoke("learning-recommendations", {
        body: { 
          progress: { 
            completed: 1, 
            inProgress: 1, 
            overall: 40 
          },
          recentTopics: ["Variables", "Data Types", "Operators", "If Statements"]
        }
      });

      if (error) throw error;

      if (data.recommendations && data.recommendations.length > 0) {
        setRecommendations(data.recommendations);
      }
      if (data.encouragement) {
        setEncouragement(data.encouragement);
        toast.success(data.encouragement);
      }
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      toast.error("Couldn't fetch personalized recommendations");
    } finally {
      setIsLoadingRecommendations(false);
    }
  };

  const handleContinueLearning = (topic: string) => {
    toast.info(`Opening: ${topic}`);
    // In a full implementation, this would navigate to the specific lesson
  };

  const overallProgress = Math.round(
    (learningPath.filter(p => p.status === "completed").length / learningPath.length) * 100 +
    (learningPath.find(p => p.status === "current")?.progress || 0) / learningPath.length
  );

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="pt-20 pb-8 px-4 container mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-12 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary">
            <TrendingUp className="h-4 w-4" />
            <span className="text-sm font-medium">LearnFlow Path</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold">
            Your Personalized{" "}
            <span className="bg-clip-text text-transparent gradient-primary">
              Learning Journey
            </span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            AI-powered adaptive learning that evolves with your progress. Every step optimized for your success.
          </p>
        </div>

        {/* Overall Progress */}
        <Card className="mb-8 p-8 border-2 bg-gradient-to-br from-primary/5 to-accent/5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Overall Progress</h2>
            <span className="text-3xl font-bold text-primary">{overallProgress}%</span>
          </div>
          <Progress value={overallProgress} className="h-3 mb-4" />
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-success">
                {learningPath.filter(p => p.status === "completed").length}
              </div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {learningPath.filter(p => p.status === "current").length}
              </div>
              <div className="text-sm text-muted-foreground">In Progress</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-muted-foreground">
                {learningPath.filter(p => p.status === "next" || p.status === "locked").length}
              </div>
              <div className="text-sm text-muted-foreground">Upcoming</div>
            </div>
          </div>
        </Card>

        {/* Learning Path */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6">Your Learning Path</h2>
          <div className="space-y-4">
            {learningPath.map((item, index) => (
              <Card
                key={index}
                className={`p-6 border-2 transition-all duration-300 ${
                  item.status === "current"
                    ? "border-primary shadow-primary scale-[1.02]"
                    : item.status === "completed"
                    ? "border-success/30"
                    : item.status === "locked"
                    ? "opacity-60"
                    : "hover:border-primary/20"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                      item.status === "completed"
                        ? "gradient-success shadow-primary"
                        : item.status === "current"
                        ? "gradient-primary shadow-primary"
                        : item.status === "locked"
                        ? "bg-muted"
                        : "gradient-info"
                    }`}
                  >
                    <item.icon
                      className={`h-6 w-6 ${
                        item.status === "locked" ? "text-muted-foreground" : "text-white"
                      }`}
                    />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-bold">{item.title}</h3>
                      {item.status !== "locked" && (
                        <span className="text-sm font-medium text-muted-foreground">
                          {item.progress}%
                        </span>
                      )}
                    </div>

                    {item.status !== "locked" && (
                      <Progress value={item.progress} className="h-2 mb-3" />
                    )}

                    <div className="flex flex-wrap gap-2 mb-3">
                      {item.topics.map((topic, topicIndex) => (
                        <span
                          key={topicIndex}
                          className="px-3 py-1 rounded-full text-xs font-medium bg-muted"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>

                    {item.status === "current" && (
                      <Button 
                        size="sm" 
                        className="gradient-primary text-primary-foreground"
                        onClick={() => handleContinueLearning(item.title)}
                      >
                        Continue Learning
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* AI Recommendations */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">AI Recommendations</h2>
            <Button 
              variant="outline" 
              size="sm"
              onClick={fetchRecommendations}
              disabled={isLoadingRecommendations}
            >
              {isLoadingRecommendations ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                "Get Fresh Recommendations"
              )}
            </Button>
          </div>
          
          {encouragement && (
            <Card className="mb-6 p-4 border-2 border-success/30 bg-success/5">
              <p className="text-sm text-center font-medium">{encouragement}</p>
            </Card>
          )}

          <div className="grid md:grid-cols-3 gap-6">
            {recommendations.map((rec, index) => (
              <Card 
                key={index} 
                className="p-6 border-2 hover:border-primary/20 transition-all hover:-translate-y-1 cursor-pointer"
                onClick={() => handleContinueLearning(rec.title)}
              >
                <div className={`inline-flex p-3 rounded-xl mb-4 ${
                  rec.type === "review" ? "bg-accent/10" :
                  rec.type === "practice" ? "bg-info/10" : "bg-success/10"
                }`}>
                  <TrendingUp className={`h-6 w-6 ${
                    rec.type === "review" ? "text-accent" :
                    rec.type === "practice" ? "text-info" : "text-success"
                  }`} />
                </div>
                <div className="uppercase text-xs font-bold text-muted-foreground mb-2">
                  {rec.type}
                </div>
                <h3 className="text-lg font-bold mb-2">{rec.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{rec.reason}</p>
                <Button variant="outline" size="sm" className="w-full">
                  Start Now
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearnFlow;
