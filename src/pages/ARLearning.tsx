import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import { BookOpen, Box, Play, Atom, Dna, Globe } from "lucide-react";

const ARLearning = () => {
  const arModules = [
    {
      icon: Atom,
      title: "Physics Lab",
      description: "Explore quantum mechanics and particle physics in immersive 3D",
      color: "info"
    },
    {
      icon: Dna,
      title: "Biology 3D",
      description: "Dive into cellular structures and biological systems",
      color: "success"
    },
    {
      icon: Globe,
      title: "Geography Explorer",
      description: "Travel through continents and geological formations",
      color: "accent"
    },
    {
      icon: Box,
      title: "Math Visualizer",
      description: "See mathematical concepts come alive in 3D space",
      color: "primary"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="pt-20 pb-8 px-4 container mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-12 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-info/10 border border-info/20 text-info">
            <BookOpen className="h-4 w-4" />
            <span className="text-sm font-medium">AR-Teach 360</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold">
            Visualize Complex Concepts in{" "}
            <span className="bg-clip-text text-transparent gradient-primary">
              Augmented Reality
            </span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Transform abstract ideas into interactive 3D experiences. See, touch, and manipulate concepts in ways textbooks never could.
          </p>
        </div>

        {/* Featured AR Experience */}
        <Card className="mb-12 overflow-hidden border-2">
          <div className="relative aspect-video bg-gradient-to-br from-info/20 via-primary/20 to-accent/20 flex items-center justify-center group cursor-pointer">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,hsl(var(--background))_100%)]" />
            <div className="relative z-10 text-center space-y-4">
              <div className="inline-flex p-6 rounded-2xl gradient-primary shadow-primary animate-float">
                <Box className="h-16 w-16 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2">DNA Structure Explorer</h3>
                <p className="text-muted-foreground mb-4">
                  Experience the double helix in stunning 3D detail
                </p>
                <Button size="lg" className="gradient-primary text-primary-foreground shadow-primary">
                  <Play className="h-4 w-4 mr-2" />
                  Launch AR Experience
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* AR Modules Grid */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Available AR Learning Modules</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {arModules.map((module, index) => (
              <Card key={index} className="p-6 hover:shadow-elevation transition-all duration-300 hover:-translate-y-1 cursor-pointer border-2 hover:border-primary/20 group">
                <div className={`inline-flex p-3 rounded-xl bg-${module.color}/10 mb-4 group-hover:scale-110 transition-transform`}>
                  <module.icon className={`h-6 w-6 text-${module.color}`} />
                </div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                  {module.title}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {module.description}
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  <Play className="h-4 w-4 mr-2" />
                  Start Learning
                </Button>
              </Card>
            ))}
          </div>
        </div>

        {/* How It Works */}
        <Card className="p-8 bg-gradient-to-br from-primary/5 to-info/5 border-2">
          <h2 className="text-2xl font-bold mb-6 text-center">How AR-Teach 360 Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center space-y-3">
              <div className="inline-flex p-4 rounded-xl gradient-primary shadow-primary">
                <span className="text-2xl text-primary-foreground font-bold">1</span>
              </div>
              <h3 className="font-semibold">Choose Your Topic</h3>
              <p className="text-sm text-muted-foreground">
                Select from our library of AR-enhanced learning modules
              </p>
            </div>
            <div className="text-center space-y-3">
              <div className="inline-flex p-4 rounded-xl gradient-info shadow-primary">
                <span className="text-2xl text-info-foreground font-bold">2</span>
              </div>
              <h3 className="font-semibold">Interact in 3D</h3>
              <p className="text-sm text-muted-foreground">
                Manipulate, rotate, and explore concepts in stunning detail
              </p>
            </div>
            <div className="text-center space-y-3">
              <div className="inline-flex p-4 rounded-xl gradient-accent shadow-accent">
                <span className="text-2xl text-accent-foreground font-bold">3</span>
              </div>
              <h3 className="font-semibold">Learn Deeply</h3>
              <p className="text-sm text-muted-foreground">
                AI tutor provides real-time explanations as you explore
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ARLearning;
