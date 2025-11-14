import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import Navigation from "@/components/Navigation";
import { Code, Mic, Play, Copy, Check } from "lucide-react";
import { toast } from "sonner";

const Talk2Code = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [instruction, setInstruction] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [copied, setCopied] = useState(false);

  const exampleInstructions = [
    "Create a function that sorts a list of numbers",
    "Write a loop to print numbers 1 to 10",
    "Make a function to calculate factorial",
    "Create a class for a student with name and grades"
  ];

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    toast.success("Code copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGenerate = () => {
    // Placeholder - will be implemented with AI
    const placeholder = `# Generated Python code based on: "${instruction}"

def example_function():
    """
    This is a placeholder function.
    Real code generation will be implemented with AI integration.
    """
    print("Hello from Talk2Code!")
    return True

# Call the function
result = example_function()
print(f"Function returned: {result}")`;
    
    setGeneratedCode(placeholder);
    toast.success("Code generated! (Demo mode)");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="pt-20 pb-8 px-4 container mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-12 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-accent">
            <Code className="h-4 w-4" />
            <span className="text-sm font-medium">Talk2Code Assistant</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold">
            Speak Your Code into{" "}
            <span className="bg-clip-text text-transparent gradient-accent">
              Existence
            </span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Describe what you want to build in plain English, and watch as AI transforms your words into working, commented code.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            <Card className="p-6 border-2">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Mic className="h-5 w-5 text-accent" />
                Your Instructions
              </h2>
              
              <div className="space-y-4">
                <div className="relative">
                  <Textarea
                    value={instruction}
                    onChange={(e) => setInstruction(e.target.value)}
                    placeholder="Describe what you want to code... (e.g., 'Create a function that reverses a string')"
                    className="min-h-[150px] resize-none"
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    className={`absolute bottom-2 right-2 ${isRecording ? "gradient-accent text-accent-foreground animate-pulse" : ""}`}
                    onClick={() => {
                      setIsRecording(!isRecording);
                      toast.info(isRecording ? "Recording stopped" : "Recording started (demo)");
                    }}
                  >
                    <Mic className="h-4 w-4" />
                  </Button>
                </div>

                <Button
                  className="w-full gradient-accent text-accent-foreground shadow-accent"
                  onClick={handleGenerate}
                  disabled={!instruction.trim()}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Generate Code
                </Button>
              </div>
            </Card>

            {/* Example Instructions */}
            <Card className="p-6 border-2">
              <h3 className="font-semibold mb-3 text-sm text-muted-foreground">Try these examples:</h3>
              <div className="space-y-2">
                {exampleInstructions.map((example, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="w-full justify-start text-left h-auto py-3 px-4 hover:border-accent/50 hover:bg-accent/5"
                    onClick={() => setInstruction(example)}
                  >
                    <span className="text-sm">{example}</span>
                  </Button>
                ))}
              </div>
            </Card>
          </div>

          {/* Output Section */}
          <div className="space-y-6">
            <Card className="p-6 border-2">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Code className="h-5 w-5 text-primary" />
                  Generated Code
                </h2>
                {generatedCode && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleCopy}
                    className="hover:bg-primary/5"
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 mr-2 text-success" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </>
                    )}
                  </Button>
                )}
              </div>

              {generatedCode ? (
                <div className="rounded-lg bg-muted p-4 font-mono text-sm overflow-x-auto">
                  <pre className="whitespace-pre-wrap">{generatedCode}</pre>
                </div>
              ) : (
                <div className="text-center py-16 text-muted-foreground">
                  <Code className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p className="text-sm">
                    Your generated code will appear here
                  </p>
                </div>
              )}
            </Card>

            {/* How It Works */}
            <Card className="p-6 bg-gradient-to-br from-accent/5 to-primary/5 border-2">
              <h3 className="font-bold mb-4">How Talk2Code Works</h3>
              <div className="space-y-3 text-sm">
                <div className="flex gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full gradient-accent text-accent-foreground text-xs font-bold">
                    1
                  </div>
                  <p className="text-muted-foreground">
                    <strong className="text-foreground">Speak or Type:</strong> Describe your coding task in natural language
                  </p>
                </div>
                <div className="flex gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full gradient-primary text-primary-foreground text-xs font-bold">
                    2
                  </div>
                  <p className="text-muted-foreground">
                    <strong className="text-foreground">AI Translation:</strong> Advanced AI converts your instructions to code
                  </p>
                </div>
                <div className="flex gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full gradient-success text-success-foreground text-xs font-bold">
                    3
                  </div>
                  <p className="text-muted-foreground">
                    <strong className="text-foreground">Learn & Use:</strong> Get commented, explained code ready to run
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Talk2Code;
