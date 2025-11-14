import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import Navigation from "@/components/Navigation";
import { Heart, Brain, Smile, Activity, Coffee } from "lucide-react";

const MindPulse = () => {
  const [isMonitoring, setIsMonitoring] = useState(false);

  const stats = [
    { label: "Focus Level", value: 87, color: "primary", icon: Brain },
    { label: "Engagement", value: 92, color: "success", icon: Activity },
    { label: "Well-being", value: 78, color: "info", icon: Smile },
    { label: "Energy", value: 65, color: "accent", icon: Coffee }
  ];

  const insights = [
    {
      type: "success",
      time: "2 minutes ago",
      message: "Great focus! You've maintained high concentration for 25 minutes."
    },
    {
      type: "info",
      time: "15 minutes ago",
      message: "Consider taking a short break. You've been studying for 45 minutes."
    },
    {
      type: "warning",
      time: "30 minutes ago",
      message: "Your engagement is dropping. Try switching to a different topic or take a break."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="pt-20 pb-8 px-4 container mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-12 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 border border-success/20 text-success">
            <Heart className="h-4 w-4" />
            <span className="text-sm font-medium">MindPulse Monitor</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold">
            Stay Focused &{" "}
            <span className="bg-clip-text text-transparent gradient-primary">
              Emotionally Balanced
            </span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Real-time monitoring of your attention, engagement, and well-being. Learn better by understanding your mental state.
          </p>
        </div>

        {/* Monitoring Control */}
        <Card className="mb-8 p-8 text-center border-2">
          <div className="max-w-md mx-auto space-y-6">
            <div className="inline-flex p-6 rounded-2xl gradient-success shadow-primary animate-pulse-slow">
              <Heart className="h-12 w-12 text-success-foreground" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2">
                {isMonitoring ? "Monitoring Active" : "Start Monitoring"}
              </h2>
              <p className="text-muted-foreground mb-4">
                {isMonitoring 
                  ? "We're tracking your focus and well-being in real-time" 
                  : "Enable camera access to begin monitoring your study session"}
              </p>
            </div>
            <Button
              size="lg"
              onClick={() => setIsMonitoring(!isMonitoring)}
              className={isMonitoring ? "gradient-accent text-accent-foreground" : "gradient-primary text-primary-foreground shadow-primary"}
            >
              {isMonitoring ? "Stop Monitoring" : "Start Monitoring"}
            </Button>
          </div>
        </Card>

        {/* Stats Dashboard */}
        {isMonitoring && (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {stats.map((stat, index) => (
                <Card key={index} className="p-6 border-2 hover:border-primary/20 transition-colors">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`p-2 rounded-lg bg-${stat.color}/10`}>
                      <stat.icon className={`h-5 w-5 text-${stat.color}`} />
                    </div>
                    <span className="font-medium text-sm">{stat.label}</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-end gap-2">
                      <span className="text-3xl font-bold">{stat.value}</span>
                      <span className="text-muted-foreground text-sm mb-1">%</span>
                    </div>
                    <Progress value={stat.value} className="h-2" />
                  </div>
                </Card>
              ))}
            </div>

            {/* Insights */}
            <Card className="p-6 border-2">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Recent Insights
              </h3>
              <div className="space-y-4">
                {insights.map((insight, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border-l-4 ${
                      insight.type === "success"
                        ? "border-success bg-success/5"
                        : insight.type === "info"
                        ? "border-info bg-info/5"
                        : "border-accent bg-accent/5"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <span className="text-xs text-muted-foreground">{insight.time}</span>
                    </div>
                    <p className="text-sm">{insight.message}</p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Tips */}
            <Card className="mt-8 p-8 bg-gradient-to-br from-primary/5 to-success/5 border-2">
              <h3 className="text-xl font-bold mb-4 text-center">Study Tips for Better Focus</h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center space-y-2">
                  <div className="inline-flex p-3 rounded-xl gradient-primary">
                    <Brain className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <h4 className="font-semibold text-sm">25-Minute Sessions</h4>
                  <p className="text-xs text-muted-foreground">
                    Use the Pomodoro technique for optimal focus
                  </p>
                </div>
                <div className="text-center space-y-2">
                  <div className="inline-flex p-3 rounded-xl gradient-success">
                    <Coffee className="h-6 w-6 text-success-foreground" />
                  </div>
                  <h4 className="font-semibold text-sm">Regular Breaks</h4>
                  <p className="text-xs text-muted-foreground">
                    Take 5-minute breaks between sessions
                  </p>
                </div>
                <div className="text-center space-y-2">
                  <div className="inline-flex p-3 rounded-xl gradient-info">
                    <Smile className="h-6 w-6 text-info-foreground" />
                  </div>
                  <h4 className="font-semibold text-sm">Stay Positive</h4>
                  <p className="text-xs text-muted-foreground">
                    Maintain a positive mindset for better retention
                  </p>
                </div>
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default MindPulse;
