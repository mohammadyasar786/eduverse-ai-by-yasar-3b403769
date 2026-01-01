import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Upload, Save, BookOpen, BarChart3, AlertTriangle, Users, Target, CheckCircle, TrendingUp, Activity, Lightbulb, Brain } from "lucide-react";
import { toast } from "sonner";
import type { ConceptProgress } from "@/pages/AdaptiveLearning";
import ConceptPulse from "./ConceptPulse";

interface FacultyDashboardProps {
  conceptProgress: ConceptProgress[];
}
interface ChapterContent {
  title: string;
  content: string;
  objectives: string[];
  misconceptions: string[];
}

// Simulated AI-detected misconceptions based on performance patterns
const detectedMisconceptions = [
  { concept: "Arrays", misconception: "Confusing 0-based vs 1-based indexing", frequency: 42, resolved: 15 },
  { concept: "Stacks", misconception: "Mixing up push/pop with enqueue/dequeue", frequency: 38, resolved: 22 },
  { concept: "Linked Lists", misconception: "Losing reference when inserting nodes", frequency: 31, resolved: 18 },
  { concept: "Trees", misconception: "Confusing depth vs height", frequency: 27, resolved: 12 },
  { concept: "Sorting", misconception: "Assuming all sorts are O(n log n)", frequency: 35, resolved: 20 },
];

// Simulated explanation style effectiveness data
const explanationEffectiveness = [
  { style: "Step-by-step", successRate: 78, usage: 45 },
  { style: "Visual/Analogy", successRate: 82, usage: 30 },
  { style: "Formula-first", successRate: 65, usage: 15 },
  { style: "Hands-on Examples", successRate: 85, usage: 10 },
];

const conceptData = [{
  id: "arrays",
  title: "Arrays and Lists"
}, {
  id: "stacks-queues",
  title: "Stacks and Queues"
}, {
  id: "linked-lists",
  title: "Linked Lists"
}, {
  id: "trees",
  title: "Trees and Binary Trees"
}, {
  id: "sorting",
  title: "Sorting Algorithms"
}, {
  id: "searching",
  title: "Searching Algorithms"
}, {
  id: "hash-tables",
  title: "Hash Tables"
}, {
  id: "graphs",
  title: "Graphs and Graph Algorithms"
}];
const FacultyDashboard = ({
  conceptProgress
}: FacultyDashboardProps) => {
  const [chapterContent, setChapterContent] = useState<ChapterContent>({
    title: "Data Structures and Algorithms",
    content: "",
    objectives: ["Understand fundamental data structures", "Analyze algorithm complexity", "Apply appropriate structures to problems"],
    misconceptions: ["Confusing time vs space complexity", "Mixing up LIFO and FIFO", "Assuming all searches are O(n)"]
  });
  const [newObjective, setNewObjective] = useState("");
  const [newMisconception, setNewMisconception] = useState("");
  const handleSaveContent = () => {
    localStorage.setItem("facultyChapterContent", JSON.stringify(chapterContent));
    toast.success("Chapter content saved successfully");
  };
  const addObjective = () => {
    if (!newObjective.trim()) return;
    setChapterContent(prev => ({
      ...prev,
      objectives: [...prev.objectives, newObjective.trim()]
    }));
    setNewObjective("");
  };
  const addMisconception = () => {
    if (!newMisconception.trim()) return;
    setChapterContent(prev => ({
      ...prev,
      misconceptions: [...prev.misconceptions, newMisconception.trim()]
    }));
    setNewMisconception("");
  };

  // Calculate analytics
  const getConceptAnalytics = (conceptId: string) => {
    const progress = conceptProgress.find(p => p.conceptId === conceptId);
    return {
      status: progress?.status || "not-started",
      avgScore: progress?.quizScore || 0,
      attempts: progress?.attempts || 0,
      timeSpent: progress?.timeSpent || 0
    };
  };

  // Calculate pulse distribution (aggregated, no individual data)
  const getPulseDistribution = () => {
    let green = 0, yellow = 0, red = 0, neutral = 0;
    conceptProgress.forEach(p => {
      const score = p.quizScore || 0;
      const attempts = p.attempts || 0;
      if (attempts === 0 && score === 0) {
        neutral++;
      } else if (score >= 70) {
        green++;
      } else if (score >= 40) {
        yellow++;
      } else {
        red++;
      }
    });
    return { green, yellow, red, neutral, total: conceptProgress.length || 1 };
  };

  const pulseDistribution = getPulseDistribution();

  const overallStats = {
    totalStudents: 1,
    // In demo, just current user
    masteredConcepts: conceptProgress.filter(p => p.status === "mastered").length,
    avgScore: conceptProgress.length > 0 ? conceptProgress.reduce((acc, p) => acc + (p.quizScore || 0), 0) / conceptProgress.length : 0,
    totalTimeSpent: conceptProgress.reduce((acc, p) => acc + (p.timeSpent || 0), 0)
  };
  return <Tabs defaultValue="setup" className="w-full">
      <TabsList className="mb-6">
        <TabsTrigger value="setup" className="gap-2">
          <Upload className="h-4 w-4" />
          Chapter Setup
        </TabsTrigger>
        <TabsTrigger value="insights" className="gap-2">
          <BarChart3 className="h-4 w-4" />
          Learning Insights
        </TabsTrigger>
      </TabsList>

      <TabsContent value="setup" className="space-y-6">
        {/* Chapter Content */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm rounded-3xl">
          <CardHeader className="rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Chapter Content</CardTitle>
                <CardDescription>Upload or paste chapter content for AI processing</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 rounded-2xl">
            <div className="space-y-2">
              <Label htmlFor="title">Chapter Title</Label>
              <Input id="title" value={chapterContent.title} onChange={e => setChapterContent(prev => ({
              ...prev,
              title: e.target.value
            }))} placeholder="Enter chapter title" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Chapter Content</Label>
              <Textarea id="content" value={chapterContent.content} onChange={e => setChapterContent(prev => ({
              ...prev,
              content: e.target.value
            }))} placeholder="Paste or type the chapter content here. The AI will use this to generate personalized explanations..." className="min-h-[200px]" />
            </div>
          </CardContent>
        </Card>

        {/* Learning Objectives */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm rounded-3xl">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                <Target className="h-5 w-5 text-success" />
              </div>
              <div>
                <CardTitle>Learning Objectives</CardTitle>
                <CardDescription>Define what students should learn from this chapter</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {chapterContent.objectives.map((obj, idx) => <Badge key={idx} variant="secondary" className="px-3 py-1">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  {obj}
                </Badge>)}
            </div>
            <div className="flex gap-2">
              <Input value={newObjective} onChange={e => setNewObjective(e.target.value)} placeholder="Add a learning objective" onKeyPress={e => e.key === "Enter" && addObjective()} />
              <Button onClick={addObjective} variant="outline" className="rounded-3xl">Add</Button>
            </div>
          </CardContent>
        </Card>

        {/* Common Misconceptions */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm rounded-3xl">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <CardTitle>Common Misconceptions</CardTitle>
                <CardDescription>List typical student misunderstandings for targeted feedback</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {chapterContent.misconceptions.map((misc, idx) => <Badge key={idx} variant="outline" className="px-3 py-1 border-amber-500/30 text-amber-600 dark:text-amber-400">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  {misc}
                </Badge>)}
            </div>
            <div className="flex gap-2">
              <Input value={newMisconception} onChange={e => setNewMisconception(e.target.value)} placeholder="Add a common misconception" onKeyPress={e => e.key === "Enter" && addMisconception()} />
              <Button onClick={addMisconception} variant="outline" className="rounded-3xl">Add</Button>
            </div>
          </CardContent>
        </Card>

        <Button onClick={handleSaveContent} size="lg" className="w-full rounded-2xl">
          <Save className="h-4 w-4 mr-2" />
          Save Chapter Configuration
        </Button>
      </TabsContent>

      <TabsContent value="insights" className="space-y-6">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-border/50 bg-card/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{overallStats.totalStudents}</p>
                  <p className="text-xs text-muted-foreground">Active Students</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50 bg-card/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{overallStats.masteredConcepts}</p>
                  <p className="text-xs text-muted-foreground">Concepts Mastered</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50 bg-card/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-info" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{overallStats.avgScore.toFixed(0)}%</p>
                  <p className="text-xs text-muted-foreground">Avg Quiz Score</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50 bg-card/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-accent-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{Math.round(overallStats.totalTimeSpent / 60)}m</p>
                  <p className="text-xs text-muted-foreground">Total Time Spent</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Concept-wise Performance */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Concept-wise Performance</CardTitle>
            <CardDescription>Average scores and engagement per concept</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {conceptData.map(concept => {
              const analytics = getConceptAnalytics(concept.id);
              return <div key={concept.id} className="flex items-center gap-4">
                    <div className="w-40 shrink-0">
                      <p className="font-medium text-sm text-foreground truncate">{concept.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {analytics.attempts} attempt{analytics.attempts !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <div className="flex-1">
                      <Progress value={analytics.avgScore} className="h-2" />
                    </div>
                    <div className="w-16 text-right">
                      <span className="text-sm font-medium text-foreground">{analytics.avgScore}%</span>
                    </div>
                    <Badge variant={analytics.status === "mastered" ? "default" : analytics.status === "in-progress" ? "secondary" : "outline"} className={analytics.status === "mastered" ? "bg-success/10 text-success" : analytics.status === "in-progress" ? "bg-info/10 text-info" : ""}>
                      {analytics.status.replace("-", " ")}
                    </Badge>
                  </div>;
            })}
            </div>
          </CardContent>
        </Card>

        {/* Common Struggles */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <CardTitle>Frequently Detected Misconceptions</CardTitle>
                <CardDescription>Common areas where students struggle</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {chapterContent.misconceptions.map((misc, idx) => <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <span className="text-sm text-foreground">{misc}</span>
                  <Badge variant="outline" className="text-muted-foreground">
                    Detected in concepts
                  </Badge>
                </div>)}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>;
};
export default FacultyDashboard;