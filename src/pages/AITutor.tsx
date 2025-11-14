import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import Navigation from "@/components/Navigation";
import { Brain, Send, Sparkles, BookOpen } from "lucide-react";
import { toast } from "sonner";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const AITutor = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I'm your AI tutor. I'm here to help you learn anything you'd like. What would you like to study today?"
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      // TODO: Implement AI chat with Lovable AI
      // For now, showing placeholder response
      setTimeout(() => {
        setMessages(prev => [...prev, {
          role: "assistant",
          content: "I understand you're asking about that topic! Let me help you break it down step by step. (AI integration will be added in the next step)"
        }]);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to get response. Please try again.");
      setIsLoading(false);
    }
  };

  const quickTopics = [
    { icon: "🔬", label: "Science", topic: "Explain photosynthesis" },
    { icon: "📐", label: "Math", topic: "Help with algebra" },
    { icon: "🌍", label: "History", topic: "Tell me about ancient civilizations" },
    { icon: "💻", label: "Coding", topic: "Teach me Python basics" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="pt-20 pb-8 px-4 container mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary">
            <Brain className="h-4 w-4" />
            <span className="text-sm font-medium">AI Tutor Chat</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold">
            Your Personal{" "}
            <span className="bg-clip-text text-transparent gradient-primary">
              AI Learning Assistant
            </span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Ask me anything! I can help explain concepts, solve problems, and guide your learning journey.
          </p>
        </div>

        {/* Quick Topics */}
        {messages.length === 1 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium mb-3 text-muted-foreground">Quick start topics:</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {quickTopics.map((topic, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="h-auto py-4 flex-col gap-2 hover:border-primary/50 hover:bg-primary/5"
                  onClick={() => {
                    setInput(topic.topic);
                  }}
                >
                  <span className="text-2xl">{topic.icon}</span>
                  <span className="text-sm">{topic.label}</span>
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Chat Interface */}
        <Card className="shadow-elevation border-2">
          <ScrollArea className="h-[500px] p-6">
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {message.role === "assistant" && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg gradient-primary">
                      <Sparkles className="h-4 w-4 text-primary-foreground" />
                    </div>
                  )}
                  <div
                    className={`rounded-2xl px-4 py-3 max-w-[80%] ${
                      message.role === "user"
                        ? "gradient-primary text-primary-foreground shadow-primary"
                        : "bg-muted"
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {message.content}
                    </p>
                  </div>
                  {message.role === "user" && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg gradient-primary">
                    <Sparkles className="h-4 w-4 text-primary-foreground animate-pulse" />
                  </div>
                  <div className="rounded-2xl px-4 py-3 bg-muted">
                    <div className="flex gap-1">
                      <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" />
                      <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:0.2s]" />
                      <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="border-t p-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex gap-2"
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything..."
                className="flex-1"
                disabled={isLoading}
              />
              <Button
                type="submit"
                size="icon"
                className="gradient-primary text-primary-foreground shadow-primary"
                disabled={!input.trim() || isLoading}
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AITutor;
