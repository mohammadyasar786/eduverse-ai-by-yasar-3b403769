import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { useAuth } from "@/hooks/useAuth";
import DiagnosticOnboarding from "@/components/AdaptiveLearning/DiagnosticOnboarding";
import ChapterView from "@/components/AdaptiveLearning/ChapterView";
import ConceptLearning from "@/components/AdaptiveLearning/ConceptLearning";
import FacultyDashboard from "@/components/AdaptiveLearning/FacultyDashboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GraduationCap, Users } from "lucide-react";

export interface LearningProfile {
  diagnosticScore: number;
  learningStyle: "visual" | "analogy" | "step-by-step" | "formula-first";
  answeredQuestions: { questionId: number; correct: boolean }[];
}

export interface ConceptProgress {
  conceptId: string;
  status: "not-started" | "in-progress" | "mastered";
  timeSpent: number;
  quizScore: number;
  attempts: number;
}

const AdaptiveLearning = () => {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [learningProfile, setLearningProfile] = useState<LearningProfile | null>(null);
  const [conceptProgress, setConceptProgress] = useState<ConceptProgress[]>([]);
  const [selectedConcept, setSelectedConcept] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("student");

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    // Load saved profile from localStorage
    const savedProfile = localStorage.getItem("learningProfile");
    const savedProgress = localStorage.getItem("conceptProgress");
    if (savedProfile) {
      setLearningProfile(JSON.parse(savedProfile));
    }
    if (savedProgress) {
      setConceptProgress(JSON.parse(savedProgress));
    }
  }, []);

  const handleProfileComplete = (profile: LearningProfile) => {
    setLearningProfile(profile);
    localStorage.setItem("learningProfile", JSON.stringify(profile));
  };

  const handleConceptSelect = (conceptId: string) => {
    setSelectedConcept(conceptId);
  };

  const handleConceptBack = () => {
    setSelectedConcept(null);
  };

  const handleProgressUpdate = (conceptId: string, progress: Partial<ConceptProgress>) => {
    setConceptProgress((prev) => {
      const existing = prev.find((p) => p.conceptId === conceptId);
      const updated: ConceptProgress[] = existing
        ? prev.map((p) => (p.conceptId === conceptId ? { ...p, ...progress } : p))
        : [...prev, { conceptId, status: "in-progress" as const, timeSpent: 0, quizScore: 0, attempts: 0, ...progress }];
      localStorage.setItem("conceptProgress", JSON.stringify(updated));
      return updated;
    });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Adaptive Chapter Learning</h1>
            <p className="text-muted-foreground">
              Personalized learning experience powered by AI
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="student" className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                Student View
              </TabsTrigger>
              <TabsTrigger value="faculty" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Faculty View
              </TabsTrigger>
            </TabsList>

            <TabsContent value="student">
              {!learningProfile ? (
                <DiagnosticOnboarding onComplete={handleProfileComplete} />
              ) : selectedConcept ? (
                <ConceptLearning
                  conceptId={selectedConcept}
                  learningProfile={learningProfile}
                  progress={conceptProgress.find((p) => p.conceptId === selectedConcept)}
                  onBack={handleConceptBack}
                  onProgressUpdate={(progress) => handleProgressUpdate(selectedConcept, progress)}
                />
              ) : (
                <ChapterView
                  learningProfile={learningProfile}
                  conceptProgress={conceptProgress}
                  onConceptSelect={handleConceptSelect}
                  onResetProfile={() => {
                    setLearningProfile(null);
                    localStorage.removeItem("learningProfile");
                  }}
                />
              )}
            </TabsContent>

            <TabsContent value="faculty">
              <FacultyDashboard conceptProgress={conceptProgress} />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default AdaptiveLearning;
